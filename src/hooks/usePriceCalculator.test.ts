// ================================================================
// usePriceCalculator.test.ts - Property-Based Tests
// **Feature: smart-options-template-system, Property 4: Price Calculation Correctness**
// **Feature: smart-options-template-system, Property 5: Price Override Priority**
// **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5**
// ================================================================

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import {
  getEffectivePrice,
  calculateOptionsTotal,
  calculatePriceBreakdown,
  type SelectedOption,
} from './usePriceCalculator'

// ================================================================
// Arbitraries for generating test data
// ================================================================

// Valid price (non-negative number)
const priceArb = fc.float({ min: 0, max: 10000, noNaN: true })

// Valid quantity (positive integer)
const quantityArb = fc.integer({ min: 1, max: 100 })

// Valid option ID
const optionIdArb = fc.string({ minLength: 1, maxLength: 20 })
  .filter(s => s.trim().length > 0)

// Valid option name
const optionNameArb = fc.string({ minLength: 1, maxLength: 50 })

// Selected option without override
const selectedOptionWithoutOverrideArb: fc.Arbitrary<SelectedOption> = fc.record({
  id: optionIdArb,
  name: optionNameArb,
  basePrice: priceArb,
  priceOverride: fc.constant(null),
})

// Selected option with override
const selectedOptionWithOverrideArb: fc.Arbitrary<SelectedOption> = fc.record({
  id: optionIdArb,
  name: optionNameArb,
  basePrice: priceArb,
  priceOverride: priceArb,
})

// Selected option (may or may not have override)
const selectedOptionArb: fc.Arbitrary<SelectedOption> = fc.oneof(
  selectedOptionWithoutOverrideArb,
  selectedOptionWithOverrideArb,
  fc.record({
    id: optionIdArb,
    name: optionNameArb,
    basePrice: priceArb,
    priceOverride: fc.constant(undefined),
  })
)

// Array of selected options
const selectedOptionsArb = fc.array(selectedOptionArb, { maxLength: 10 })

// Size modifier (can be positive or negative)
const sizeModifierArb = fc.float({ min: -100, max: 500, noNaN: true })

// ================================================================
// Property 4: Price Calculation Correctness
// *For any* product configuration with selected size and options,
// the total price SHALL equal: basePrice + sizeModifier + Σ(selectedOptions.price) × quantity
// **Validates: Requirements 2.1, 2.2, 2.3, 2.4**
// ================================================================

describe('Property 4: Price Calculation Correctness', () => {
  it('calculatePriceBreakdown computes correct subtotal formula', () => {
    fc.assert(
      fc.property(
        priceArb,
        sizeModifierArb,
        selectedOptionsArb,
        (basePrice, sizeModifier, options) => {
          const result = calculatePriceBreakdown(basePrice, sizeModifier, options, 1)
          
          // Calculate expected options total manually
          const expectedOptionsTotal = options.reduce((sum, opt) => {
            const effectivePrice = getEffectivePrice(opt.basePrice, opt.priceOverride)
            return sum + effectivePrice
          }, 0)
          
          // Subtotal should equal basePrice + sizeModifier + optionsTotal
          const expectedSubtotal = basePrice + sizeModifier + expectedOptionsTotal
          
          // Use approximate equality for floating point
          expect(result.subtotal).toBeCloseTo(expectedSubtotal, 5)
          expect(result.optionsTotal).toBeCloseTo(expectedOptionsTotal, 5)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('calculatePriceBreakdown applies quantity multiplication correctly', () => {
    fc.assert(
      fc.property(
        priceArb,
        sizeModifierArb,
        selectedOptionsArb,
        quantityArb,
        (basePrice, sizeModifier, options, quantity) => {
          const result = calculatePriceBreakdown(basePrice, sizeModifier, options, quantity)
          
          // Total should equal subtotal × quantity
          const expectedTotal = result.subtotal * quantity
          
          expect(result.total).toBeCloseTo(expectedTotal, 5)
          expect(result.quantity).toBe(quantity)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('calculatePriceBreakdown returns correct breakdown components', () => {
    fc.assert(
      fc.property(
        priceArb,
        sizeModifierArb,
        selectedOptionsArb,
        quantityArb,
        (basePrice, sizeModifier, options, quantity) => {
          const result = calculatePriceBreakdown(basePrice, sizeModifier, options, quantity)
          
          // All components should be present
          expect(typeof result.basePrice).toBe('number')
          expect(typeof result.sizeModifier).toBe('number')
          expect(typeof result.optionsTotal).toBe('number')
          expect(typeof result.subtotal).toBe('number')
          expect(typeof result.quantity).toBe('number')
          expect(typeof result.total).toBe('number')
          
          // Base price and options total should be non-negative
          expect(result.basePrice).toBeGreaterThanOrEqual(0)
          expect(result.optionsTotal).toBeGreaterThanOrEqual(0)
          expect(result.quantity).toBeGreaterThanOrEqual(1)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('calculateOptionsTotal sums all option prices correctly', () => {
    fc.assert(
      fc.property(selectedOptionsArb, (options) => {
        const result = calculateOptionsTotal(options)
        
        // Calculate expected sum manually
        const expectedSum = options.reduce((sum, opt) => {
          const effectivePrice = getEffectivePrice(opt.basePrice, opt.priceOverride)
          return sum + effectivePrice
        }, 0)
        
        expect(result).toBeCloseTo(expectedSum, 5)
      }),
      { numRuns: 100 }
    )
  })

  it('calculateOptionsTotal returns 0 for empty options array', () => {
    const result = calculateOptionsTotal([])
    expect(result).toBe(0)
  })

  it('calculatePriceBreakdown handles zero base price', () => {
    fc.assert(
      fc.property(
        sizeModifierArb,
        selectedOptionsArb,
        quantityArb,
        (sizeModifier, options, quantity) => {
          const result = calculatePriceBreakdown(0, sizeModifier, options, quantity)
          
          expect(result.basePrice).toBe(0)
          // Subtotal should still be calculated correctly
          expect(result.subtotal).toBeCloseTo(sizeModifier + result.optionsTotal, 5)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('calculatePriceBreakdown handles zero size modifier', () => {
    fc.assert(
      fc.property(
        priceArb,
        selectedOptionsArb,
        quantityArb,
        (basePrice, options, quantity) => {
          const result = calculatePriceBreakdown(basePrice, 0, options, quantity)
          
          expect(result.sizeModifier).toBe(0)
          expect(result.subtotal).toBeCloseTo(basePrice + result.optionsTotal, 5)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('calculatePriceBreakdown handles no options', () => {
    fc.assert(
      fc.property(
        priceArb,
        sizeModifierArb,
        quantityArb,
        (basePrice, sizeModifier, quantity) => {
          const result = calculatePriceBreakdown(basePrice, sizeModifier, [], quantity)
          
          expect(result.optionsTotal).toBe(0)
          expect(result.subtotal).toBeCloseTo(basePrice + sizeModifier, 5)
        }
      ),
      { numRuns: 100 }
    )
  })
})

// ================================================================
// Property 5: Price Override Priority
// *For any* option with price_override in product_options,
// the effective price SHALL be the override value, not the base_price.
// **Validates: Requirements 2.5**
// ================================================================

describe('Property 5: Price Override Priority', () => {
  it('getEffectivePrice returns override when set', () => {
    fc.assert(
      fc.property(
        priceArb,
        priceArb,
        (basePrice, overridePrice) => {
          const result = getEffectivePrice(basePrice, overridePrice)
          
          // Should return override, not base price
          expect(result).toBeCloseTo(overridePrice, 5)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('getEffectivePrice returns base price when override is null', () => {
    fc.assert(
      fc.property(priceArb, (basePrice) => {
        const result = getEffectivePrice(basePrice, null)
        
        // Should return base price
        expect(result).toBeCloseTo(basePrice, 5)
      }),
      { numRuns: 100 }
    )
  })

  it('getEffectivePrice returns base price when override is undefined', () => {
    fc.assert(
      fc.property(priceArb, (basePrice) => {
        const result = getEffectivePrice(basePrice, undefined)
        
        // Should return base price
        expect(result).toBeCloseTo(basePrice, 5)
      }),
      { numRuns: 100 }
    )
  })

  it('calculateOptionsTotal uses override prices when available', () => {
    fc.assert(
      fc.property(
        fc.array(selectedOptionWithOverrideArb, { minLength: 1, maxLength: 5 }),
        (options) => {
          const result = calculateOptionsTotal(options)
          
          // Calculate expected sum using overrides
          const expectedSum = options.reduce((sum, opt) => {
            // Since all options have override, should use override
            return sum + (opt.priceOverride ?? opt.basePrice)
          }, 0)
          
          expect(result).toBeCloseTo(expectedSum, 5)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('calculateOptionsTotal uses base price when no override', () => {
    fc.assert(
      fc.property(
        fc.array(selectedOptionWithoutOverrideArb, { minLength: 1, maxLength: 5 }),
        (options) => {
          const result = calculateOptionsTotal(options)
          
          // Calculate expected sum using base prices
          const expectedSum = options.reduce((sum, opt) => sum + opt.basePrice, 0)
          
          expect(result).toBeCloseTo(expectedSum, 5)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('mixed options use correct prices (override when set, base otherwise)', () => {
    fc.assert(
      fc.property(
        selectedOptionWithOverrideArb,
        selectedOptionWithoutOverrideArb,
        (optWithOverride, optWithoutOverride) => {
          const options = [optWithOverride, optWithoutOverride]
          const result = calculateOptionsTotal(options)
          
          // First option should use override, second should use base
          const expectedSum = (optWithOverride.priceOverride ?? 0) + optWithoutOverride.basePrice
          
          expect(result).toBeCloseTo(expectedSum, 5)
        }
      ),
      { numRuns: 100 }
    )
  })
})

// ================================================================
// Edge Cases and Robustness
// ================================================================

describe('Price Calculator Robustness', () => {
  it('handles invalid base price gracefully', () => {
    const result1 = calculatePriceBreakdown(NaN, 0, [], 1)
    expect(result1.basePrice).toBe(0)
    
    const result2 = calculatePriceBreakdown(-10, 0, [], 1)
    expect(result2.basePrice).toBe(0)
    
    const result3 = calculatePriceBreakdown('invalid' as unknown as number, 0, [], 1)
    expect(result3.basePrice).toBe(0)
  })

  it('handles invalid quantity gracefully', () => {
    const result1 = calculatePriceBreakdown(100, 0, [], 0)
    expect(result1.quantity).toBe(1)
    
    const result2 = calculatePriceBreakdown(100, 0, [], -5)
    expect(result2.quantity).toBe(1)
    
    const result3 = calculatePriceBreakdown(100, 0, [], NaN)
    expect(result3.quantity).toBe(1)
  })

  it('handles invalid options array gracefully', () => {
    // @ts-expect-error - Testing null input
    const result1 = calculateOptionsTotal(null)
    expect(result1).toBe(0)
    
    // @ts-expect-error - Testing undefined input
    const result2 = calculateOptionsTotal(undefined)
    expect(result2).toBe(0)
    
    // @ts-expect-error - Testing string input
    const result3 = calculateOptionsTotal('not an array')
    expect(result3).toBe(0)
  })

  it('handles negative override price by using base price', () => {
    const result = getEffectivePrice(10, -5)
    // Negative override should be ignored, use base price
    expect(result).toBe(10)
  })

  it('floors quantity to integer', () => {
    const result = calculatePriceBreakdown(100, 0, [], 2.7)
    expect(result.quantity).toBe(2)
  })
})
