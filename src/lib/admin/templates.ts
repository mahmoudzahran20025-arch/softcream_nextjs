/**
 * Admin Product Templates Service
 * 
 * Provides template definitions and functions for pre-configuring
 * option group combinations based on product type.
 * 
 * @module admin/templates
 * Requirements: 5.1, 5.2, 5.3, 5.4
 */

import type { OptionGroupAssignment, OptionGroup } from './validation';

// ============================================================================
// Template Types
// ============================================================================

/**
 * Suggested option group configuration within a template
 */
export interface SuggestedGroup {
  /** Group identifier (e.g., 'flavors', 'toppings') */
  groupId: string;
  /** Default configuration for this group */
  defaultConfig: Partial<OptionGroupAssignment>;
}

/**
 * Product template definition
 */
export interface ProductTemplate {
  /** Product type this template applies to */
  productType: string;
  /** Suggested option groups with default configurations */
  suggestedGroups: SuggestedGroup[];
  /** Whether to suggest containers for this product type */
  suggestedContainers: boolean;
  /** Whether to suggest sizes for this product type */
  suggestedSizes: boolean;
}

// ============================================================================
// Template Definitions
// ============================================================================

/**
 * Product templates mapped by product type
 * 
 * Requirements:
 * - 5.1: byo_ice_cream suggests containers, sizes, flavors, toppings
 * - 5.2: milkshake suggests sizes and flavors
 * - 5.3: standard suggests no option groups by default
 */
export const PRODUCT_TEMPLATES: Record<string, ProductTemplate> = {
  /**
   * BYO Ice Cream Template
   * Requirement 5.1: WHEN admin selects "byo_ice_cream" product type
   * THEN suggest containers, sizes, flavors, and toppings option groups
   */
  byo_ice_cream: {
    productType: 'byo_ice_cream',
    suggestedGroups: [
      {
        groupId: 'flavors',
        defaultConfig: {
          isRequired: true,
          minSelections: 1,
          maxSelections: 3,
        },
      },
      {
        groupId: 'toppings',
        defaultConfig: {
          isRequired: false,
          minSelections: 0,
          maxSelections: 5,
        },
      },
      {
        groupId: 'sauces',
        defaultConfig: {
          isRequired: false,
          minSelections: 0,
          maxSelections: 2,
        },
      },
    ],
    suggestedContainers: true,
    suggestedSizes: true,
  },

  /**
   * Milkshake Template
   * Requirement 5.2: WHEN admin selects "milkshake" product type
   * THEN suggest sizes and flavors option groups
   */
  milkshake: {
    productType: 'milkshake',
    suggestedGroups: [
      {
        groupId: 'flavors',
        defaultConfig: {
          isRequired: true,
          minSelections: 1,
          maxSelections: 2,
        },
      },
    ],
    suggestedContainers: false,
    suggestedSizes: true,
  },

  /**
   * Standard Product Template
   * Requirement 5.3: WHEN admin selects "standard" product type
   * THEN do not suggest any option groups by default
   */
  standard: {
    productType: 'standard',
    suggestedGroups: [],
    suggestedContainers: false,
    suggestedSizes: false,
  },

  /**
   * Preset Ice Cream Template
   * Similar to standard but may have sizes
   */
  preset_ice_cream: {
    productType: 'preset_ice_cream',
    suggestedGroups: [],
    suggestedContainers: false,
    suggestedSizes: true,
  },

  /**
   * Dessert Template
   * Standard dessert with no customization
   */
  dessert: {
    productType: 'dessert',
    suggestedGroups: [],
    suggestedContainers: false,
    suggestedSizes: false,
  },
};

// ============================================================================
// Template Service Functions
// ============================================================================

/**
 * Gets the template for a given product type
 * 
 * @param productType - The product type to get template for
 * @returns ProductTemplate for the given type, or standard template if not found
 */
export function getTemplateForProductType(productType: string): ProductTemplate {
  return PRODUCT_TEMPLATES[productType] || PRODUCT_TEMPLATES.standard;
}

/**
 * Applies suggested groups from a template to create option group assignments
 * 
 * Requirement 5.4: WHEN admin applies a template THEN allow modification
 * of the suggested configuration before saving
 * 
 * This function matches suggested groups with available groups and creates
 * OptionGroupAssignment objects with default configurations.
 * 
 * @param template - The product template to apply
 * @param availableGroups - Available option groups in the system
 * @returns Array of OptionGroupAssignment with suggested configurations
 */
export function applySuggestedGroups(
  template: ProductTemplate,
  availableGroups: OptionGroup[]
): OptionGroupAssignment[] {
  const assignments: OptionGroupAssignment[] = [];
  
  // Create a map of available groups by ID for quick lookup
  const groupMap = new Map<string, OptionGroup>();
  for (const group of availableGroups) {
    groupMap.set(group.id, group);
  }

  // Process each suggested group in the template
  for (let i = 0; i < template.suggestedGroups.length; i++) {
    const suggested = template.suggestedGroups[i];
    
    // Check if the suggested group exists in available groups
    const matchedGroup = groupMap.get(suggested.groupId);
    
    if (matchedGroup) {
      // Create assignment with default config from template
      const assignment: OptionGroupAssignment = {
        groupId: suggested.groupId,
        isRequired: suggested.defaultConfig.isRequired ?? false,
        minSelections: suggested.defaultConfig.minSelections ?? 0,
        maxSelections: suggested.defaultConfig.maxSelections ?? 1,
        priceOverride: suggested.defaultConfig.priceOverride,
        displayOrder: suggested.defaultConfig.displayOrder ?? i + 1,
      };
      
      assignments.push(assignment);
    }
  }

  return assignments;
}

/**
 * Checks if a product type has a defined template
 * 
 * @param productType - The product type to check
 * @returns true if a template exists for this product type
 */
export function hasTemplateForProductType(productType: string): boolean {
  return productType in PRODUCT_TEMPLATES;
}

/**
 * Gets all available product types that have templates
 * 
 * @returns Array of product type strings
 */
export function getAvailableProductTypes(): string[] {
  return Object.keys(PRODUCT_TEMPLATES);
}

/**
 * Checks if a product type suggests containers
 * 
 * @param productType - The product type to check
 * @returns true if the template suggests containers
 */
export function suggestsContainers(productType: string): boolean {
  const template = getTemplateForProductType(productType);
  return template.suggestedContainers;
}

/**
 * Checks if a product type suggests sizes
 * 
 * @param productType - The product type to check
 * @returns true if the template suggests sizes
 */
export function suggestsSizes(productType: string): boolean {
  const template = getTemplateForProductType(productType);
  return template.suggestedSizes;
}
