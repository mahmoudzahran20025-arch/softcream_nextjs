// ================================================================
// dataValidator.ts - Data Validation Utility
// Validates API responses and returns safe defaults on failure
// Requirements: 11.1, 11.2, 11.3
// ================================================================

import type { ProductConfiguration, NutritionInfo } from '@/types/products'
import type { Product } from '@/lib/api'

// ================================================================
// Default Values
// ================================================================

const DEFAULT_NUTRITION: NutritionInfo = {
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
  sugar: 0,
  fiber: 0,
}

const DEFAULT_PRODUCT_CONFIG: ProductConfiguration = {
  product: {
    id: '',
    name: '',
    nameAr: '',
    nameEn: '',
    basePrice: 0,
    templateId: 'template_2', // Default to StandardCard
    isCustomizable: false,
    baseNutrition: DEFAULT_NUTRITION,
  },
  hasContainers: false,
  containers: [],
  hasSizes: false,
  sizes: [],
  hasCustomization: false,
  customizationRules: [],
}

// ================================================================
// Validation Result Types
// ================================================================

export interface ValidationResult<T> {
  valid: boolean
  data: T
  errors: string[]
}

// ================================================================
// Product Validation (Requirements 11.1)
// ================================================================

/**
 * Validates a product object has required fields
 * Returns safe defaults if validation fails
 */
export function validateProduct(product: unknown): ValidationResult<Product | null> {
  const errors: string[] = []

  if (!product || typeof product !== 'object') {
    errors.push('Product is null or not an object')
    console.warn('[DataValidator] Product validation failed:', errors)
    return { valid: false, data: null, errors }
  }

  const p = product as Record<string, unknown>

  // Required fields check
  if (!p.id || typeof p.id !== 'string') {
    errors.push('Missing or invalid product id')
  }
  if (!p.name || typeof p.name !== 'string') {
    errors.push('Missing or invalid product name')
  }
  if (typeof p.price !== 'number' || p.price < 0) {
    errors.push('Missing or invalid product price')
  }

  // template_id is optional but should be string if present
  if (p.template_id !== undefined && p.template_id !== null && typeof p.template_id !== 'string') {
    errors.push('Invalid template_id type')
  }

  if (errors.length > 0) {
    console.warn('[DataValidator] Product validation failed:', errors, product)
    return { valid: false, data: null, errors }
  }

  return { valid: true, data: product as Product, errors: [] }
}

/**
 * Validates an array of products
 * Filters out invalid products and returns only valid ones
 */
export function validateProducts(products: unknown): ValidationResult<Product[]> {
  const errors: string[] = []

  if (!Array.isArray(products)) {
    errors.push('Products is not an array')
    console.warn('[DataValidator] Products validation failed:', errors)
    return { valid: false, data: [], errors }
  }

  const validProducts: Product[] = []
  products.forEach((product, index) => {
    const result = validateProduct(product)
    if (result.valid && result.data) {
      validProducts.push(result.data)
    } else {
      errors.push(`Product at index ${index} is invalid: ${result.errors.join(', ')}`)
    }
  })

  const allValid = errors.length === 0
  if (!allValid) {
    console.warn('[DataValidator] Some products failed validation:', errors)
  }

  return { valid: allValid, data: validProducts, errors }
}

// ================================================================
// Product Configuration Validation (Requirements 11.2)
// ================================================================

/**
 * Validates a customization group structure
 */
function validateCustomizationGroup(group: unknown, index: number): string[] {
  const errors: string[] = []

  if (!group || typeof group !== 'object') {
    errors.push(`Customization group at index ${index} is not an object`)
    return errors
  }

  const g = group as Record<string, unknown>

  if (!g.groupId || typeof g.groupId !== 'string') {
    errors.push(`Customization group at index ${index} missing groupId`)
  }
  if (!g.groupName || typeof g.groupName !== 'string') {
    errors.push(`Customization group at index ${index} missing groupName`)
  }
  if (typeof g.isRequired !== 'boolean') {
    errors.push(`Customization group at index ${index} has invalid isRequired`)
  }
  if (typeof g.minSelections !== 'number') {
    errors.push(`Customization group at index ${index} has invalid minSelections`)
  }
  if (typeof g.maxSelections !== 'number') {
    errors.push(`Customization group at index ${index} has invalid maxSelections`)
  }
  if (!Array.isArray(g.options)) {
    errors.push(`Customization group at index ${index} has invalid options array`)
  }

  return errors
}

/**
 * Validates product configuration response structure
 * Returns safe defaults if validation fails
 */
export function validateProductConfiguration(config: unknown): ValidationResult<ProductConfiguration> {
  const errors: string[] = []

  if (!config || typeof config !== 'object') {
    errors.push('Configuration is null or not an object')
    console.warn('[DataValidator] Configuration validation failed:', errors)
    return { valid: false, data: DEFAULT_PRODUCT_CONFIG, errors }
  }

  const c = config as Record<string, unknown>

  // Validate product object
  if (!c.product || typeof c.product !== 'object') {
    errors.push('Missing or invalid product object in configuration')
  } else {
    const product = c.product as Record<string, unknown>
    if (!product.id || typeof product.id !== 'string') {
      errors.push('Missing or invalid product.id')
    }
    if (!product.name || typeof product.name !== 'string') {
      errors.push('Missing or invalid product.name')
    }
    if (typeof product.basePrice !== 'number') {
      errors.push('Missing or invalid product.basePrice')
    }
    if (!product.templateId || typeof product.templateId !== 'string') {
      errors.push('Missing or invalid product.templateId')
    }
    if (typeof product.isCustomizable !== 'boolean') {
      errors.push('Missing or invalid product.isCustomizable')
    }
  }

  // Validate boolean flags
  if (typeof c.hasContainers !== 'boolean') {
    errors.push('Missing or invalid hasContainers flag')
  }
  if (typeof c.hasSizes !== 'boolean') {
    errors.push('Missing or invalid hasSizes flag')
  }
  if (typeof c.hasCustomization !== 'boolean') {
    errors.push('Missing or invalid hasCustomization flag')
  }

  // Validate arrays
  if (!Array.isArray(c.containers)) {
    errors.push('Missing or invalid containers array')
  }
  if (!Array.isArray(c.sizes)) {
    errors.push('Missing or invalid sizes array')
  }
  if (!Array.isArray(c.customizationRules)) {
    errors.push('Missing or invalid customizationRules array')
  } else {
    // Validate each customization group
    (c.customizationRules as unknown[]).forEach((group, index) => {
      const groupErrors = validateCustomizationGroup(group, index)
      errors.push(...groupErrors)
    })
  }

  if (errors.length > 0) {
    console.warn('[DataValidator] Configuration validation failed:', errors, config)
    return { valid: false, data: DEFAULT_PRODUCT_CONFIG, errors }
  }

  return { valid: true, data: config as ProductConfiguration, errors: [] }
}

// ================================================================
// Safe Data Extraction Helpers
// ================================================================

/**
 * Safely extracts a number value with default fallback
 */
export function safeNumber(value: unknown, defaultValue: number = 0): number {
  if (typeof value === 'number' && !isNaN(value)) {
    return value
  }
  if (typeof value === 'string') {
    const parsed = parseFloat(value)
    if (!isNaN(parsed)) {
      return parsed
    }
  }
  return defaultValue
}

/**
 * Safely extracts a string value with default fallback
 */
export function safeString(value: unknown, defaultValue: string = ''): string {
  if (typeof value === 'string') {
    return value
  }
  if (value !== null && value !== undefined) {
    try {
      return String(value)
    } catch {
      // Handle objects with null prototype that can't be converted
      return defaultValue
    }
  }
  return defaultValue
}

/**
 * Safely extracts a boolean value with default fallback
 */
export function safeBoolean(value: unknown, defaultValue: boolean = false): boolean {
  if (typeof value === 'boolean') {
    return value
  }
  if (value === 1 || value === '1' || value === 'true') {
    return true
  }
  if (value === 0 || value === '0' || value === 'false') {
    return false
  }
  return defaultValue
}

/**
 * Safely extracts an array with default fallback
 */
export function safeArray<T>(value: unknown, defaultValue: T[] = []): T[] {
  if (Array.isArray(value)) {
    return value as T[]
  }
  return defaultValue
}

// ================================================================
// JSON Parsing Helpers
// ================================================================

/**
 * Safely parses JSON with default fallback
 */
export function safeJsonParse<T>(jsonString: unknown, defaultValue: T): T {
  if (typeof jsonString !== 'string') {
    return defaultValue
  }
  try {
    return JSON.parse(jsonString) as T
  } catch {
    console.warn('[DataValidator] Failed to parse JSON:', jsonString)
    return defaultValue
  }
}

// ================================================================
// Export Default Configuration
// ================================================================

export { DEFAULT_PRODUCT_CONFIG, DEFAULT_NUTRITION }
