// ================================================================
// dataValidator.test.ts - Property-Based Tests for Data Validation
// **Feature: smart-options-template-system, Property 9: Data Validation Robustness**
// **Validates: Requirements 11.1, 11.2, 11.3**
// ================================================================

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import {
  validateProduct,
  validateProducts,
  validateProductConfiguration,
  safeNumber,
  safeString,
  safeBoolean,
  safeArray,
  safeJsonParse,
  DEFAULT_PRODUCT_CONFIG,
} from './dataValidator'

// ================================================================
// Arbitraries for generating test data
// ================================================================

// Valid product arbitrary
const validProductArb = fc.record({
  id: fc.uuid(),
  name: fc.string({ minLength: 1 }),
  category: fc.string(),
  price: fc.nat({ max: 10000 }),
  available: fc.nat({ max: 100 }),
})

// Valid product configuration arbitrary
const validProductConfigArb = fc.record({
  product: fc.record({
    id: fc.uuid(),
    name: fc.string({ minLength: 1 }),
    nameAr: fc.string(),
    nameEn: fc.string(),
    basePrice: fc.nat({ max: 10000 }),
    templateId: fc.constantFrom('template_1', 'template_2', 'template_3'),
    isCustomizable: fc.boolean(),
    baseNutrition: fc.record({
      calories: fc.nat({ max: 1000 }),
      protein: fc.nat({ max: 100 }),
      carbs: fc.nat({ max: 100 }),
      fat: fc.nat({ max: 100 }),
      sugar: fc.nat({ max: 100 }),
      fiber: fc.nat({ max: 100 }),
    }),
  }),
  hasContainers: fc.boolean(),
  containers: fc.array(fc.record({
    id: fc.uuid(),
    name: fc.string(),
    nameAr: fc.string(),
    nameEn: fc.string(),
    priceModifier: fc.nat({ max: 100 }),
    nutrition: fc.record({
      calories: fc.nat({ max: 1000 }),
      protein: fc.nat({ max: 100 }),
      carbs: fc.nat({ max: 100 }),
      fat: fc.nat({ max: 100 }),
      sugar: fc.nat({ max: 100 }),
      fiber: fc.nat({ max: 100 }),
    }),
  }), { maxLength: 5 }),
  hasSizes: fc.boolean(),
  sizes: fc.array(fc.record({
    id: fc.uuid(),
    name: fc.string(),
    nameAr: fc.string(),
    nameEn: fc.string(),
    priceModifier: fc.nat({ max: 100 }),
    nutritionMultiplier: fc.double({ min: 0.5, max: 2.0 }),
  }), { maxLength: 5 }),
  hasCustomization: fc.boolean(),
  customizationRules: fc.array(fc.record({
    groupId: fc.uuid(),
    groupName: fc.string({ minLength: 1 }),
    isRequired: fc.boolean(),
    minSelections: fc.nat({ max: 5 }),
    maxSelections: fc.nat({ max: 10 }),
    displayOrder: fc.nat({ max: 100 }),
    options: fc.array(fc.record({
      id: fc.uuid(),
      name_ar: fc.string(),
      name_en: fc.string(),
      base_price: fc.nat({ max: 100 }),
      price: fc.nat({ max: 100 }),
      display_order: fc.nat({ max: 100 }),
      nutrition: fc.record({
        calories: fc.nat({ max: 1000 }),
        protein: fc.nat({ max: 100 }),
        carbs: fc.nat({ max: 100 }),
        fat: fc.nat({ max: 100 }),
        sugar: fc.nat({ max: 100 }),
        fiber: fc.nat({ max: 100 }),
      }),
    }), { maxLength: 10 }),
  }), { maxLength: 5 }),
})

// Arbitrary for any value (including invalid ones)
const anyValueArb = fc.oneof(
  fc.constant(null),
  fc.constant(undefined),
  fc.string(),
  fc.integer(),
  fc.double(),
  fc.boolean(),
  fc.array(fc.anything()),
  fc.dictionary(fc.string(), fc.anything()),
)

describe('Data Validator - Property Tests', () => {
  // ================================================================
  // Property 9: Data Validation Robustness
  // For any API response, the frontend SHALL validate required fields
  // and use safe defaults when validation fails, without crashing.
  // ================================================================

  describe('Property 9: Data Validation Robustness', () => {
    it('validateProduct never throws for any input', () => {
      fc.assert(
        fc.property(anyValueArb, (input) => {
          // Should never throw
          const result = validateProduct(input)
          expect(result).toBeDefined()
          expect(typeof result.valid).toBe('boolean')
          expect(Array.isArray(result.errors)).toBe(true)
        }),
        { numRuns: 100 }
      )
    })

    it('validateProduct returns valid=true for valid products', () => {
      fc.assert(
        fc.property(validProductArb, (product) => {
          const result = validateProduct(product)
          expect(result.valid).toBe(true)
          expect(result.data).not.toBeNull()
          expect(result.errors).toHaveLength(0)
        }),
        { numRuns: 100 }
      )
    })

    it('validateProducts never throws for any input', () => {
      fc.assert(
        fc.property(anyValueArb, (input) => {
          const result = validateProducts(input)
          expect(result).toBeDefined()
          expect(typeof result.valid).toBe('boolean')
          expect(Array.isArray(result.data)).toBe(true)
          expect(Array.isArray(result.errors)).toBe(true)
        }),
        { numRuns: 100 }
      )
    })

    it('validateProducts filters out invalid products from array', () => {
      fc.assert(
        fc.property(
          fc.array(fc.oneof(validProductArb, anyValueArb), { maxLength: 10 }),
          (products) => {
            const result = validateProducts(products)
            // All returned products should be valid
            result.data.forEach(product => {
              expect(product.id).toBeDefined()
              expect(product.name).toBeDefined()
              expect(typeof product.price).toBe('number')
            })
          }
        ),
        { numRuns: 100 }
      )
    })

    it('validateProductConfiguration never throws for any input', () => {
      fc.assert(
        fc.property(anyValueArb, (input) => {
          const result = validateProductConfiguration(input)
          expect(result).toBeDefined()
          expect(typeof result.valid).toBe('boolean')
          expect(result.data).toBeDefined()
          expect(Array.isArray(result.errors)).toBe(true)
        }),
        { numRuns: 100 }
      )
    })

    it('validateProductConfiguration returns valid=true for valid configs', () => {
      fc.assert(
        fc.property(validProductConfigArb, (config) => {
          const result = validateProductConfiguration(config)
          expect(result.valid).toBe(true)
          expect(result.errors).toHaveLength(0)
        }),
        { numRuns: 100 }
      )
    })

    it('validateProductConfiguration returns safe defaults for invalid input', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.constant(null),
            fc.constant(undefined),
            fc.string(),
            fc.integer(),
            fc.array(fc.anything())
          ),
          (input) => {
            const result = validateProductConfiguration(input)
            expect(result.valid).toBe(false)
            // Should return default config structure
            expect(result.data).toEqual(DEFAULT_PRODUCT_CONFIG)
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  // ================================================================
  // Safe Helper Functions Tests
  // ================================================================

  describe('Safe Helper Functions', () => {
    it('safeNumber returns number for any input without throwing', () => {
      fc.assert(
        fc.property(anyValueArb, fc.integer(), (input, defaultVal) => {
          const result = safeNumber(input, defaultVal)
          expect(typeof result).toBe('number')
          expect(isNaN(result)).toBe(false)
        }),
        { numRuns: 100 }
      )
    })

    it('safeNumber preserves valid numbers', () => {
      fc.assert(
        fc.property(fc.double({ noNaN: true }), (num) => {
          const result = safeNumber(num, 0)
          expect(result).toBe(num)
        }),
        { numRuns: 100 }
      )
    })

    it('safeString returns string for any input without throwing', () => {
      fc.assert(
        fc.property(anyValueArb, fc.string(), (input, defaultVal) => {
          const result = safeString(input, defaultVal)
          expect(typeof result).toBe('string')
        }),
        { numRuns: 100 }
      )
    })

    it('safeString preserves valid strings', () => {
      fc.assert(
        fc.property(fc.string(), (str) => {
          const result = safeString(str, 'default')
          expect(result).toBe(str)
        }),
        { numRuns: 100 }
      )
    })

    it('safeBoolean returns boolean for any input without throwing', () => {
      fc.assert(
        fc.property(anyValueArb, fc.boolean(), (input, defaultVal) => {
          const result = safeBoolean(input, defaultVal)
          expect(typeof result).toBe('boolean')
        }),
        { numRuns: 100 }
      )
    })

    it('safeBoolean preserves valid booleans', () => {
      fc.assert(
        fc.property(fc.boolean(), (bool) => {
          const result = safeBoolean(bool, !bool)
          expect(result).toBe(bool)
        }),
        { numRuns: 100 }
      )
    })

    it('safeArray returns array for any input without throwing', () => {
      fc.assert(
        fc.property(anyValueArb, (input) => {
          const result = safeArray(input, [])
          expect(Array.isArray(result)).toBe(true)
        }),
        { numRuns: 100 }
      )
    })

    it('safeArray preserves valid arrays', () => {
      fc.assert(
        fc.property(fc.array(fc.anything()), (arr) => {
          const result = safeArray(arr, [])
          expect(result).toBe(arr)
        }),
        { numRuns: 100 }
      )
    })

    it('safeJsonParse never throws for any input', () => {
      fc.assert(
        fc.property(anyValueArb, (input) => {
          const result = safeJsonParse(input, {})
          expect(result).toBeDefined()
        }),
        { numRuns: 100 }
      )
    })

    it('safeJsonParse correctly parses valid JSON strings', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.record({ key: fc.string() }),
            fc.array(fc.integer()),
            fc.string(),
            fc.integer(),
            fc.boolean()
          ),
          (obj) => {
            const jsonStr = JSON.stringify(obj)
            const result = safeJsonParse(jsonStr, null)
            expect(result).toEqual(obj)
          }
        ),
        { numRuns: 100 }
      )
    })
  })
})
