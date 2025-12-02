/**
 * Admin Product Validation Property Tests
 * 
 * Property-based tests for the admin product validation module.
 * Uses fast-check for property-based testing.
 * 
 * @module admin/validation/validation.test
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import {
  validateCustomizableProductHasGroups,
  validateContainerAssignments,
  validateSizeAssignments,
  type OptionGroupAssignment,
  type ContainerAssignment,
  type SizeAssignment,
} from './index';
import {
  calculateBadgeCount,
  type AssignedGroupInfo,
} from '@/components/admin/products/OptionGroupsBadge/utils';
import { getChanges } from '@/components/admin/products/UnifiedProductForm/changeTracking';
import { INITIAL_PRODUCT_FORM_DATA } from '@/components/admin/products/UnifiedProductForm/types';

// ============================================================================
// Arbitraries (Generators)
// ============================================================================

/**
 * Generator for customizable product types
 */
const customizableProductTypeArb = fc.constantFrom('byo_ice_cream', 'milkshake', 'preset_ice_cream');

/**
 * Generator for non-customizable product types
 */
const nonCustomizableProductTypeArb = fc.constantFrom('standard', 'dessert');

/**
 * Generator for option group assignments
 */
const optionGroupAssignmentArb: fc.Arbitrary<OptionGroupAssignment> = fc.record({
  groupId: fc.string({ minLength: 1, maxLength: 20 }),
  isRequired: fc.boolean(),
  minSelections: fc.integer({ min: 0, max: 10 }),
  maxSelections: fc.integer({ min: 1, max: 10 }),
  displayOrder: fc.integer({ min: 1, max: 100 }),
});

/**
 * Generator for container assignments
 */
const containerAssignmentArb: fc.Arbitrary<ContainerAssignment> = fc.record({
  containerId: fc.string({ minLength: 1, maxLength: 20 }),
  isDefault: fc.boolean(),
});

/**
 * Generator for size assignments
 */
const sizeAssignmentArb: fc.Arbitrary<SizeAssignment> = fc.record({
  sizeId: fc.string({ minLength: 1, maxLength: 20 }),
  isDefault: fc.boolean(),
});

/**
 * Generator for assigned group info (for badge tests)
 */
const assignedGroupInfoArb: fc.Arbitrary<AssignedGroupInfo> = fc.record({
  groupId: fc.string({ minLength: 1, maxLength: 20 }),
  groupName: fc.string({ minLength: 1, maxLength: 50 }),
  groupIcon: fc.option(fc.string({ minLength: 1, maxLength: 5 }), { nil: undefined }),
  isRequired: fc.boolean(),
  optionsCount: fc.integer({ min: 0, max: 100 }),
});

/**
 * Generator for arrays of assigned groups with unique IDs
 */
const uniqueAssignedGroupsArb = fc.array(assignedGroupInfoArb, { minLength: 0, maxLength: 20 })
  .map(groups => {
    const seen = new Set<string>();
    return groups.filter(g => {
      if (seen.has(g.groupId)) return false;
      seen.add(g.groupId);
      return true;
    });
  });

// ============================================================================
// Property 12: Customizable Product Warning
// ============================================================================

/**
 * **Feature: admin-product-options-ui, Property 12: Customizable Product Warning**
 * *For any* product with a customizable product_type (byo_ice_cream, milkshake)
 * but no assigned option groups, the system SHALL display a warning.
 * **Validates: Requirements 7.1**
 */
describe('Property 12: Customizable Product Warning', () => {
  it('warns when customizable product has no option groups', () => {
    fc.assert(
      fc.property(
        customizableProductTypeArb,
        (productType) => {
          // Empty option groups array
          const emptyAssignments: OptionGroupAssignment[] = [];
          
          const result = validateCustomizableProductHasGroups(productType, emptyAssignments);
          
          // Should have a warning about no option groups
          expect(result.warnings.length).toBeGreaterThan(0);
          expect(result.warnings.some(w => w.code === 'NO_OPTION_GROUPS')).toBe(true);
          // Should still be valid (warnings don't block)
          expect(result.isValid).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('does not warn when customizable product has option groups', () => {
    fc.assert(
      fc.property(
        customizableProductTypeArb,
        fc.array(optionGroupAssignmentArb, { minLength: 1, maxLength: 5 }),
        (productType, assignments) => {
          const result = validateCustomizableProductHasGroups(productType, assignments);
          
          // Should NOT have a warning about no option groups
          expect(result.warnings.some(w => w.code === 'NO_OPTION_GROUPS')).toBe(false);
          expect(result.isValid).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('does not warn for non-customizable products without option groups', () => {
    fc.assert(
      fc.property(
        nonCustomizableProductTypeArb,
        (productType) => {
          const emptyAssignments: OptionGroupAssignment[] = [];
          
          const result = validateCustomizableProductHasGroups(productType, emptyAssignments);
          
          // Should NOT have a warning for non-customizable products
          expect(result.warnings.some(w => w.code === 'NO_OPTION_GROUPS')).toBe(false);
          expect(result.isValid).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('handles undefined product type gracefully', () => {
    const result = validateCustomizableProductHasGroups(undefined, []);
    
    // Should not warn for undefined product type
    expect(result.warnings.some(w => w.code === 'NO_OPTION_GROUPS')).toBe(false);
    expect(result.isValid).toBe(true);
  });
});

// ============================================================================
// Property 13: Missing Defaults Warning
// ============================================================================

/**
 * **Feature: admin-product-options-ui, Property 13: Missing Defaults Warning**
 * *For any* product with assigned containers or sizes but no default selection,
 * the system SHALL display a warning.
 * **Validates: Requirements 7.2**
 */
describe('Property 13: Missing Defaults Warning', () => {
  describe('Container Defaults', () => {
    it('warns when containers assigned but none is default', () => {
      fc.assert(
        fc.property(
          fc.array(containerAssignmentArb, { minLength: 1, maxLength: 5 })
            .map(assignments => assignments.map(a => ({ ...a, isDefault: false }))),
          (assignments) => {
            const result = validateContainerAssignments(assignments);
            
            // Should have a warning about no default container
            expect(result.warnings.length).toBeGreaterThan(0);
            expect(result.warnings.some(w => w.code === 'NO_DEFAULT_CONTAINER')).toBe(true);
            // Should still be valid (warnings don't block)
            expect(result.isValid).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('does not warn when at least one container is default', () => {
      fc.assert(
        fc.property(
          fc.array(containerAssignmentArb, { minLength: 1, maxLength: 5 }),
          fc.integer({ min: 0, max: 4 }),
          (assignments, defaultIndex) => {
            // Ensure at least one is default
            const withDefault = assignments.map((a, i) => ({
              ...a,
              isDefault: i === (defaultIndex % assignments.length),
            }));
            
            const result = validateContainerAssignments(withDefault);
            
            // Should NOT have a warning about no default container
            expect(result.warnings.some(w => w.code === 'NO_DEFAULT_CONTAINER')).toBe(false);
            expect(result.isValid).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('does not warn when no containers are assigned', () => {
      const result = validateContainerAssignments([]);
      
      // Should NOT warn when there are no containers
      expect(result.warnings.some(w => w.code === 'NO_DEFAULT_CONTAINER')).toBe(false);
      expect(result.isValid).toBe(true);
    });
  });

  describe('Size Defaults', () => {
    it('warns when sizes assigned but none is default', () => {
      fc.assert(
        fc.property(
          fc.array(sizeAssignmentArb, { minLength: 1, maxLength: 5 })
            .map(assignments => assignments.map(a => ({ ...a, isDefault: false }))),
          (assignments) => {
            const result = validateSizeAssignments(assignments);
            
            // Should have a warning about no default size
            expect(result.warnings.length).toBeGreaterThan(0);
            expect(result.warnings.some(w => w.code === 'NO_DEFAULT_SIZE')).toBe(true);
            // Should still be valid (warnings don't block)
            expect(result.isValid).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('does not warn when at least one size is default', () => {
      fc.assert(
        fc.property(
          fc.array(sizeAssignmentArb, { minLength: 1, maxLength: 5 }),
          fc.integer({ min: 0, max: 4 }),
          (assignments, defaultIndex) => {
            // Ensure at least one is default
            const withDefault = assignments.map((a, i) => ({
              ...a,
              isDefault: i === (defaultIndex % assignments.length),
            }));
            
            const result = validateSizeAssignments(withDefault);
            
            // Should NOT have a warning about no default size
            expect(result.warnings.some(w => w.code === 'NO_DEFAULT_SIZE')).toBe(false);
            expect(result.isValid).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('does not warn when no sizes are assigned', () => {
      const result = validateSizeAssignments([]);
      
      // Should NOT warn when there are no sizes
      expect(result.warnings.some(w => w.code === 'NO_DEFAULT_SIZE')).toBe(false);
      expect(result.isValid).toBe(true);
    });
  });
});

// ============================================================================
// Property 5: Required Group Removal Warning
// ============================================================================

/**
 * **Feature: admin-product-options-ui, Property 5: Required Group Removal Warning**
 * *For any* attempt to remove an option group that is marked as required,
 * the system SHALL display a warning before allowing the removal.
 * **Validates: Requirements 2.3**
 */
describe('Property 5: Required Group Removal Warning', () => {
  /**
   * Generator for option group info (for name lookup)
   */
  const optionGroupInfoArb = fc.record({
    id: fc.string({ minLength: 1, maxLength: 20 }),
    name: fc.string({ minLength: 1, maxLength: 50 }),
    optionsCount: fc.integer({ min: 1, max: 20 }),
  });

  /**
   * Generator for required option group assignments
   */
  const requiredOptionGroupAssignmentArb: fc.Arbitrary<OptionGroupAssignment> = fc.record({
    groupId: fc.string({ minLength: 1, maxLength: 20 }),
    isRequired: fc.constant(true), // Always required
    minSelections: fc.integer({ min: 1, max: 5 }),
    maxSelections: fc.integer({ min: 1, max: 10 }),
    displayOrder: fc.integer({ min: 1, max: 100 }),
  });

  /**
   * Generator for non-required option group assignments
   */
  const nonRequiredOptionGroupAssignmentArb: fc.Arbitrary<OptionGroupAssignment> = fc.record({
    groupId: fc.string({ minLength: 1, maxLength: 20 }),
    isRequired: fc.constant(false), // Never required
    minSelections: fc.integer({ min: 0, max: 5 }),
    maxSelections: fc.integer({ min: 1, max: 10 }),
    displayOrder: fc.integer({ min: 1, max: 100 }),
  });

  it('detects removal of required option groups and sets hasRequiredGroupRemoval flag', () => {
    fc.assert(
      fc.property(
        fc.array(requiredOptionGroupAssignmentArb, { minLength: 1, maxLength: 5 }),
        fc.array(optionGroupInfoArb, { minLength: 1, maxLength: 5 }),
        (originalAssignments, groupInfos) => {
          // Ensure group IDs match between assignments and info
          const matchedAssignments = originalAssignments.map((a, i) => ({
            ...a,
            groupId: groupInfos[i % groupInfos.length].id,
          }));
          
          const matchedGroupInfos = matchedAssignments.map((a, i) => ({
            ...groupInfos[i % groupInfos.length],
            id: a.groupId,
          }));

          const originalData = {
            product: INITIAL_PRODUCT_FORM_DATA,
            optionGroupAssignments: matchedAssignments,
            containerAssignments: [],
            sizeAssignments: [],
          };

          // Remove all option groups (simulating removal)
          const currentData = {
            product: INITIAL_PRODUCT_FORM_DATA,
            optionGroupAssignments: [],
            containerAssignments: [],
            sizeAssignments: [],
          };

          const changes = getChanges(originalData, currentData, matchedGroupInfos, [], []);

          // Should detect that required groups were removed
          expect(changes.hasRequiredGroupRemoval).toBe(true);
          expect(changes.optionGroupChanges.length).toBeGreaterThan(0);
          expect(changes.optionGroupChanges.every((c: { type: string }) => c.type === 'removed')).toBe(true);
          expect(changes.optionGroupChanges.some((c: { wasRequired?: boolean }) => c.wasRequired === true)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('does not set hasRequiredGroupRemoval when removing non-required groups', () => {
    fc.assert(
      fc.property(
        fc.array(nonRequiredOptionGroupAssignmentArb, { minLength: 1, maxLength: 5 }),
        fc.array(optionGroupInfoArb, { minLength: 1, maxLength: 5 }),
        (originalAssignments, groupInfos) => {
          // Ensure group IDs match between assignments and info
          const matchedAssignments = originalAssignments.map((a, i) => ({
            ...a,
            groupId: groupInfos[i % groupInfos.length].id,
          }));
          
          const matchedGroupInfos = matchedAssignments.map((a, i) => ({
            ...groupInfos[i % groupInfos.length],
            id: a.groupId,
          }));

          const originalData = {
            product: INITIAL_PRODUCT_FORM_DATA,
            optionGroupAssignments: matchedAssignments,
            containerAssignments: [],
            sizeAssignments: [],
          };

          // Remove all option groups
          const currentData = {
            product: INITIAL_PRODUCT_FORM_DATA,
            optionGroupAssignments: [],
            containerAssignments: [],
            sizeAssignments: [],
          };

          const changes = getChanges(originalData, currentData, matchedGroupInfos, [], []);

          // Should NOT set hasRequiredGroupRemoval for non-required groups
          expect(changes.hasRequiredGroupRemoval).toBe(false);
          // But should still detect the removals
          expect(changes.optionGroupChanges.length).toBeGreaterThan(0);
          expect(changes.optionGroupChanges.every((c: { wasRequired?: boolean }) => c.wasRequired === false)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('correctly identifies partial removal of required groups', () => {
    fc.assert(
      fc.property(
        requiredOptionGroupAssignmentArb,
        nonRequiredOptionGroupAssignmentArb,
        optionGroupInfoArb,
        optionGroupInfoArb,
        (requiredAssignment, nonRequiredAssignment, groupInfo1, groupInfo2) => {
          // Create two distinct groups
          const requiredWithId = { ...requiredAssignment, groupId: 'required-group' };
          const nonRequiredWithId = { ...nonRequiredAssignment, groupId: 'non-required-group' };
          
          const groupInfos = [
            { ...groupInfo1, id: 'required-group' },
            { ...groupInfo2, id: 'non-required-group' },
          ];

          const originalData = {
            product: INITIAL_PRODUCT_FORM_DATA,
            optionGroupAssignments: [requiredWithId, nonRequiredWithId],
            containerAssignments: [],
            sizeAssignments: [],
          };

          // Remove only the required group, keep the non-required one
          const currentData = {
            product: INITIAL_PRODUCT_FORM_DATA,
            optionGroupAssignments: [nonRequiredWithId],
            containerAssignments: [],
            sizeAssignments: [],
          };

          const changes = getChanges(originalData, currentData, groupInfos, [], []);

          // Should detect required group removal
          expect(changes.hasRequiredGroupRemoval).toBe(true);
          expect(changes.optionGroupChanges.length).toBe(1);
          expect(changes.optionGroupChanges[0].type).toBe('removed');
          expect(changes.optionGroupChanges[0].wasRequired).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('does not flag hasRequiredGroupRemoval when no groups are removed', () => {
    fc.assert(
      fc.property(
        fc.array(requiredOptionGroupAssignmentArb, { minLength: 1, maxLength: 3 }),
        fc.array(optionGroupInfoArb, { minLength: 1, maxLength: 3 }),
        (assignments, groupInfos) => {
          // Ensure group IDs match
          const matchedAssignments = assignments.map((a, i) => ({
            ...a,
            groupId: groupInfos[i % groupInfos.length].id,
          }));
          
          const matchedGroupInfos = matchedAssignments.map((a, i) => ({
            ...groupInfos[i % groupInfos.length],
            id: a.groupId,
          }));

          const data = {
            product: INITIAL_PRODUCT_FORM_DATA,
            optionGroupAssignments: matchedAssignments,
            containerAssignments: [],
            sizeAssignments: [],
          };

          // Same data - no changes
          const changes = getChanges(data, data, matchedGroupInfos, [], []);

          // Should not flag any required group removal
          expect(changes.hasRequiredGroupRemoval).toBe(false);
          expect(changes.optionGroupChanges.length).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ============================================================================
// Property 10: Option Groups Badge Accuracy
// ============================================================================

/**
 * **Feature: admin-product-options-ui, Property 10: Option Groups Badge Accuracy**
 * *For any* product in the products list, the displayed badge count SHALL equal
 * the actual number of assigned option groups.
 * **Validates: Requirements 4.1**
 */
describe('Property 10: Option Groups Badge Accuracy', () => {
  it('badge count equals the actual number of assigned option groups', () => {
    fc.assert(
      fc.property(
        uniqueAssignedGroupsArb,
        (assignedGroups) => {
          const badgeCount = calculateBadgeCount(assignedGroups);
          const actualCount = assignedGroups.length;
          expect(badgeCount).toBe(actualCount);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('badge count is zero for empty groups array', () => {
    const badgeCount = calculateBadgeCount([]);
    expect(badgeCount).toBe(0);
  });

  it('badge count handles null/undefined gracefully', () => {
    // @ts-expect-error - Testing runtime behavior with invalid input
    expect(calculateBadgeCount(null)).toBe(0);
    // @ts-expect-error - Testing runtime behavior with invalid input
    expect(calculateBadgeCount(undefined)).toBe(0);
  });

  it('badge count is always non-negative', () => {
    fc.assert(
      fc.property(
        uniqueAssignedGroupsArb,
        (assignedGroups) => {
          const badgeCount = calculateBadgeCount(assignedGroups);
          expect(badgeCount).toBeGreaterThanOrEqual(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('badge count is consistent across multiple calls with same input', () => {
    fc.assert(
      fc.property(
        uniqueAssignedGroupsArb,
        (assignedGroups) => {
          const count1 = calculateBadgeCount(assignedGroups);
          const count2 = calculateBadgeCount(assignedGroups);
          const count3 = calculateBadgeCount(assignedGroups);
          expect(count1).toBe(count2);
          expect(count2).toBe(count3);
        }
      ),
      { numRuns: 100 }
    );
  });
});
