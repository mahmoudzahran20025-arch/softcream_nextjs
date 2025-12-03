/**
 * Admin Product Validation Module
 * 
 * Provides validation utilities for the unified product form.
 * 
 * @module admin/validation
 * Requirements: 1.4, 3.1, 3.2, 3.3, 3.4
 */

// Export all types and constants
export {
  // Error codes
  ERROR_CODES,
  type ErrorCode,
  
  // Warning codes
  WARNING_CODES,
  type WarningCode,
  
  // Validation result types
  type ValidationError,
  type ValidationWarning,
  type ValidationResult,
  
  // Message mappings
  ERROR_MESSAGES,
  WARNING_MESSAGES,
  
  // Helper functions
  createEmptyValidationResult,
  createValidationError,
  createValidationWarning,
  mergeValidationResults,
} from './types';

import {
  ERROR_CODES,
  WARNING_CODES,
  type ValidationResult,
  createEmptyValidationResult,
  createValidationError,
  createValidationWarning,
  mergeValidationResults,
} from './types';

// ============================================================================
// Data Types for Validation
// ============================================================================

/**
 * Product form data structure for validation
 * Requirements 2.4: Added template_id and card_style
 */
export interface ProductFormData {
  id: string;
  name: string;
  nameEn?: string;
  category: string;
  categoryEn?: string;
  price: string | number;
  description?: string;
  descriptionEn?: string;
  image?: string;
  badge?: string;
  available?: number;
  product_type?: string;
  // Template fields - Requirements 2.4
  template_id?: string;
  card_style?: string;
  // Discount fields
  old_price?: string | number;
  discount_percentage?: string | number;
  // Nutrition fields (optional)
  calories?: string;
  protein?: string;
  carbs?: string;
  fat?: string;
  sugar?: string;
  fiber?: string;
  energy_type?: string;
  energy_score?: string;
  tags?: string;
  ingredients?: string;
  nutrition_facts?: string;
  allergens?: string;
  health_keywords?: string[];
  health_benefit_ar?: string;
}

/**
 * Option group assignment configuration
 */
export interface OptionGroupAssignment {
  groupId: string;
  isRequired: boolean;
  minSelections: number;
  maxSelections: number;
  priceOverride?: number;
  displayOrder: number;
}

/**
 * Option group with options count for validation
 */
export interface OptionGroup {
  id: string;
  name: string;
  optionsCount?: number;
}

/**
 * Container assignment configuration
 */
export interface ContainerAssignment {
  containerId: string;
  isDefault: boolean;
}

/**
 * Size assignment configuration
 */
export interface SizeAssignment {
  sizeId: string;
  isDefault: boolean;
}

/**
 * Unified product data for complete validation
 */
export interface UnifiedProductData {
  product: ProductFormData;
  optionGroupAssignments: OptionGroupAssignment[];
  containerAssignments: ContainerAssignment[];
  sizeAssignments: SizeAssignment[];
}

// ============================================================================
// Product Types that are customizable
// ============================================================================

const CUSTOMIZABLE_PRODUCT_TYPES = ['byo_ice_cream', 'milkshake', 'preset_ice_cream'];

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Validates product form data for required fields
 * 
 * Requirement 1.4: WHEN an admin submits the form with missing required fields 
 * THEN the Admin Panel SHALL display clear validation errors and prevent submission
 * 
 * @param data - Product form data to validate
 * @returns ValidationResult with errors for missing required fields
 */
export function validateProductData(data: ProductFormData): ValidationResult {
  const result = createEmptyValidationResult();

  // Check required field: id
  if (!data.id || data.id.trim() === '') {
    result.errors.push(createValidationError('id', ERROR_CODES.MISSING_ID));
  }

  // Check required field: name
  if (!data.name || data.name.trim() === '') {
    result.errors.push(createValidationError('name', ERROR_CODES.MISSING_NAME));
  }

  // Check required field: category
  if (!data.category || data.category.trim() === '') {
    result.errors.push(createValidationError('category', ERROR_CODES.MISSING_CATEGORY));
  }

  // Check required field: price
  const price = typeof data.price === 'string' ? parseFloat(data.price) : data.price;
  if (data.price === '' || data.price === undefined || data.price === null) {
    result.errors.push(createValidationError('price', ERROR_CODES.MISSING_PRICE));
  } else if (isNaN(price) || price < 0) {
    result.errors.push(createValidationError('price', ERROR_CODES.INVALID_PRICE));
  }

  result.isValid = result.errors.length === 0;
  return result;
}

/**
 * Validates a single option group assignment
 * 
 * Requirements:
 * - 3.1: WHEN min_selections > max_selections THEN display error and prevent saving
 * - 3.2: WHEN is_required=true with min_selections=0 THEN auto-set min_selections to 1
 * - 3.4: WHEN max_selections > available options THEN display warning
 * 
 * @param assignment - Option group assignment to validate
 * @param group - Option group with options count for bounds checking
 * @returns ValidationResult with errors and warnings
 */
export function validateOptionGroupAssignment(
  assignment: OptionGroupAssignment,
  group?: OptionGroup
): ValidationResult {
  const result = createEmptyValidationResult();
  const fieldPrefix = `optionGroup_${assignment.groupId}`;

  // Requirement 3.1: min_selections cannot be greater than max_selections
  if (assignment.minSelections > assignment.maxSelections) {
    result.errors.push(
      createValidationError(`${fieldPrefix}.minSelections`, ERROR_CODES.INVALID_MIN_MAX)
    );
  }

  // Requirement 3.2: Required group with min_selections = 0 should warn
  // (auto-correction happens at save time, but we warn the user)
  if (assignment.isRequired && assignment.minSelections === 0) {
    result.warnings.push(
      createValidationWarning(`${fieldPrefix}.minSelections`, WARNING_CODES.REQUIRED_MIN_ZERO)
    );
  }

  // Requirement 3.4: max_selections > available options count
  if (group && group.optionsCount !== undefined && assignment.maxSelections > group.optionsCount) {
    result.warnings.push(
      createValidationWarning(`${fieldPrefix}.maxSelections`, WARNING_CODES.MAX_EXCEEDS_OPTIONS)
    );
  }

  result.isValid = result.errors.length === 0;
  return result;
}

/**
 * Validates all option group assignments for duplicates
 * 
 * Requirement 3.3: WHEN an admin assigns the same option group twice 
 * THEN prevent the duplicate and show an error
 * 
 * @param assignments - Array of option group assignments
 * @returns ValidationResult with duplicate errors
 */
export function validateNoDuplicateGroups(
  assignments: OptionGroupAssignment[]
): ValidationResult {
  const result = createEmptyValidationResult();
  const seenGroupIds = new Set<string>();

  for (const assignment of assignments) {
    if (seenGroupIds.has(assignment.groupId)) {
      result.errors.push(
        createValidationError(
          `optionGroup_${assignment.groupId}`,
          ERROR_CODES.DUPLICATE_GROUP
        )
      );
    }
    seenGroupIds.add(assignment.groupId);
  }

  result.isValid = result.errors.length === 0;
  return result;
}

/**
 * Validates container assignments for default selection
 * 
 * Requirement 7.2: WHEN containers assigned but no default 
 * THEN display warning about missing defaults
 * 
 * @param assignments - Array of container assignments
 * @returns ValidationResult with warnings
 */
export function validateContainerAssignments(
  assignments: ContainerAssignment[]
): ValidationResult {
  const result = createEmptyValidationResult();

  if (assignments.length > 0) {
    const hasDefault = assignments.some(a => a.isDefault);
    if (!hasDefault) {
      result.warnings.push(
        createValidationWarning('containers', WARNING_CODES.NO_DEFAULT_CONTAINER)
      );
    }
  }

  result.isValid = result.errors.length === 0;
  return result;
}

/**
 * Validates size assignments for default selection
 * 
 * Requirement 7.2: WHEN sizes assigned but no default 
 * THEN display warning about missing defaults
 * 
 * @param assignments - Array of size assignments
 * @returns ValidationResult with warnings
 */
export function validateSizeAssignments(
  assignments: SizeAssignment[]
): ValidationResult {
  const result = createEmptyValidationResult();

  if (assignments.length > 0) {
    const hasDefault = assignments.some(a => a.isDefault);
    if (!hasDefault) {
      result.warnings.push(
        createValidationWarning('sizes', WARNING_CODES.NO_DEFAULT_SIZE)
      );
    }
  }

  result.isValid = result.errors.length === 0;
  return result;
}

/**
 * Validates customizable product has option groups
 * 
 * Requirement 7.1: WHEN a customizable product has no option groups 
 * THEN display warning
 * 
 * @param productType - The product type
 * @param optionGroupAssignments - Array of option group assignments
 * @returns ValidationResult with warnings
 */
export function validateCustomizableProductHasGroups(
  productType: string | undefined,
  optionGroupAssignments: OptionGroupAssignment[]
): ValidationResult {
  const result = createEmptyValidationResult();

  if (productType && CUSTOMIZABLE_PRODUCT_TYPES.includes(productType)) {
    if (optionGroupAssignments.length === 0) {
      result.warnings.push(
        createValidationWarning('optionGroups', WARNING_CODES.NO_OPTION_GROUPS)
      );
    }
  }

  result.isValid = result.errors.length === 0;
  return result;
}

/**
 * Main validation entry point for unified product data
 * 
 * Validates all aspects of the unified product form:
 * - Product required fields (Requirement 1.4)
 * - Option group assignments (Requirements 3.1, 3.2, 3.3, 3.4)
 * - Container/size defaults (Requirement 7.2)
 * - Customizable product warnings (Requirement 7.1)
 * 
 * @param data - Complete unified product data
 * @param optionGroups - Available option groups for bounds checking
 * @returns ValidationResult with all errors and warnings
 */
export function validateUnifiedProductData(
  data: UnifiedProductData,
  optionGroups?: OptionGroup[]
): ValidationResult {
  // Create a map of option groups for quick lookup
  const groupMap = new Map<string, OptionGroup>();
  if (optionGroups) {
    for (const group of optionGroups) {
      groupMap.set(group.id, group);
    }
  }

  // Validate product data
  const productResult = validateProductData(data.product);

  // Validate no duplicate groups
  const duplicateResult = validateNoDuplicateGroups(data.optionGroupAssignments);

  // Validate each option group assignment
  const assignmentResults = data.optionGroupAssignments.map(assignment => {
    const group = groupMap.get(assignment.groupId);
    return validateOptionGroupAssignment(assignment, group);
  });

  // Validate container assignments
  const containerResult = validateContainerAssignments(data.containerAssignments);

  // Validate size assignments
  const sizeResult = validateSizeAssignments(data.sizeAssignments);

  // Validate customizable product has groups
  const customizableResult = validateCustomizableProductHasGroups(
    data.product.product_type,
    data.optionGroupAssignments
  );

  // Merge all results
  return mergeValidationResults(
    productResult,
    duplicateResult,
    ...assignmentResults,
    containerResult,
    sizeResult,
    customizableResult
  );
}

/**
 * Auto-corrects option group assignments based on validation rules
 * 
 * Requirement 3.2: WHEN is_required=true with min_selections=0 
 * THEN automatically set min_selections to 1
 * 
 * @param assignment - Option group assignment to correct
 * @returns Corrected assignment (new object, does not mutate input)
 */
export function autoCorrectOptionGroupAssignment(
  assignment: OptionGroupAssignment
): OptionGroupAssignment {
  const corrected = { ...assignment };

  // Requirement 3.2: Auto-correct min_selections for required groups
  if (corrected.isRequired && corrected.minSelections === 0) {
    corrected.minSelections = 1;
  }

  return corrected;
}

/**
 * Auto-corrects all option group assignments in unified data
 * 
 * @param data - Unified product data to correct
 * @returns Corrected data (new object, does not mutate input)
 */
export function autoCorrectUnifiedProductData(
  data: UnifiedProductData
): UnifiedProductData {
  return {
    ...data,
    optionGroupAssignments: data.optionGroupAssignments.map(autoCorrectOptionGroupAssignment),
  };
}
