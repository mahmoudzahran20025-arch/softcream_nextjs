// ================================================================
// useConditionalOptions.test.ts - Property-Based Tests
// **Feature: smart-options-template-system, Property 1: Conditional Rules Application**
// **Feature: smart-options-template-system, Property 2: Selection Limit Enforcement**
// **Validates: Requirements 1.1, 1.2, 1.3**
// ================================================================

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import {
  parseConditionalRules,
  getEffectiveMaxSelections,
  trimSelectionsToLimit,
  type ConditionalRule,
} from './useConditionalOptions'

// ================================================================
// Arbitraries for generating test data
// ================================================================

// Valid option ID (non-empty string)
const optionIdArb = fc.string({ minLength: 1, maxLength: 20 })
  .filter(s => s.trim().length > 0)

// Valid max selections value (non-negative integer)
const maxSelectionsArb = fc.nat({ max: 20 })

// Valid rules object (option ID -> max selections)
const rulesObjectArb = fc.dictionary(
  optionIdArb,
  maxSelectionsArb,
  { minKeys: 1, maxKeys: 5 }
)

// Valid conditional rule
const validConditionalRuleArb: fc.Arbitrary<ConditionalRule> = fc.record({
  triggerGroup: optionIdArb,
  rules: rulesObjectArb,
})

// Valid conditional rule JSON string (snake_case format from DB)
const validConditionalRuleJsonArb = fc.record({
  trigger_group: optionIdArb,
  rules: rulesObjectArb,
}).map(obj => JSON.stringify(obj))

// Invalid JSON strings
const invalidJsonArb = fc.oneof(
  fc.constant(null),
  fc.constant(undefined),
  fc.constant(''),
  fc.constant('not json'),
  fc.constant('{invalid}'),
  fc.constant('{"missing": "rules"}'),
  fc.constant('{"trigger_group": "sizes"}'), // missing rules
  fc.constant('{"rules": {"a": 1}}'), // missing trigger_group
  fc.constant('{"trigger_group": 123, "rules": {}}'), // invalid trigger_group type
  fc.constant('{"trigger_group": "sizes", "rules": "not object"}'), // invalid rules type
  fc.constant('{"trigger_group": "sizes", "rules": {"a": -1}}'), // negative value
  fc.constant('{"trigger_group": "sizes", "rules": {"a": 1.5}}'), // non-integer value
)

// Array of selection IDs
const selectionsArb = fc.array(optionIdArb, { maxLength: 15 })

// ================================================================
// Property 1: Conditional Rules Application
// *For any* size selection and conditional rule configuration,
// the maxSelections for the target option group SHALL equal
// the value specified in the rule for that size.
// **Validates: Requirements 1.1, 1.2**
// ================================================================

describe('Property 1: Conditional Rules Application', () => {
  it('getEffectiveMaxSelections returns rule value when option matches', () => {
    fc.assert(
      fc.property(
        validConditionalRuleArb,
        maxSelectionsArb,
        (rule, defaultMax) => {
          // Get a random option ID from the rules
          const optionIds = Object.keys(rule.rules)
          if (optionIds.length === 0) return true // Skip empty rules
          
          const selectedOptionId = optionIds[0]
          const expectedMax = rule.rules[selectedOptionId]
          
          const result = getEffectiveMaxSelections(rule, selectedOptionId, defaultMax)
          
          // The result should equal the rule value for this option
          expect(result).toBe(expectedMax)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('getEffectiveMaxSelections returns default when option not in rules', () => {
    fc.assert(
      fc.property(
        validConditionalRuleArb,
        maxSelectionsArb,
        optionIdArb,
        (rule, defaultMax, randomOptionId) => {
          // Ensure the random option is NOT in the rules
          if (rule.rules[randomOptionId] !== undefined) return true // Skip if collision
          
          const result = getEffectiveMaxSelections(rule, randomOptionId, defaultMax)
          
          // Should fall back to default
          expect(result).toBe(defaultMax)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('getEffectiveMaxSelections returns default when no selection made', () => {
    fc.assert(
      fc.property(
        validConditionalRuleArb,
        maxSelectionsArb,
        (rule, defaultMax) => {
          const result = getEffectiveMaxSelections(rule, null, defaultMax)
          
          // Should return default when no selection
          expect(result).toBe(defaultMax)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('getEffectiveMaxSelections returns default when rules are null', () => {
    fc.assert(
      fc.property(
        optionIdArb,
        maxSelectionsArb,
        (selectedOption, defaultMax) => {
          const result = getEffectiveMaxSelections(null, selectedOption, defaultMax)
          
          // Should return default when no rules
          expect(result).toBe(defaultMax)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('parseConditionalRules correctly parses valid JSON', () => {
    fc.assert(
      fc.property(validConditionalRuleJsonArb, (jsonString) => {
        const result = parseConditionalRules(jsonString)
        
        // Should successfully parse
        expect(result).not.toBeNull()
        expect(result!.triggerGroup).toBeDefined()
        expect(typeof result!.triggerGroup).toBe('string')
        expect(result!.rules).toBeDefined()
        expect(typeof result!.rules).toBe('object')
        
        // All rule values should be non-negative integers
        Object.values(result!.rules).forEach(value => {
          expect(typeof value).toBe('number')
          expect(value).toBeGreaterThanOrEqual(0)
          expect(Number.isInteger(value)).toBe(true)
        })
      }),
      { numRuns: 100 }
    )
  })

  it('parseConditionalRules returns null for invalid input', () => {
    fc.assert(
      fc.property(invalidJsonArb, (input) => {
        const result = parseConditionalRules(input as string)
        
        // Should return null for invalid input
        expect(result).toBeNull()
      }),
      { numRuns: 100 }
    )
  })
})

// ================================================================
// Property 2: Selection Limit Enforcement
// *For any* option group with maxSelections = N, the number of
// selected options SHALL never exceed N, and excess selections
// SHALL be removed when limits decrease.
// **Validates: Requirements 1.3**
// ================================================================

describe('Property 2: Selection Limit Enforcement', () => {
  it('trimSelectionsToLimit never returns more than maxSelections items', () => {
    fc.assert(
      fc.property(
        selectionsArb,
        maxSelectionsArb,
        (selections, maxSelections) => {
          const { trimmed } = trimSelectionsToLimit(selections, maxSelections)
          
          // Trimmed array should never exceed max
          expect(trimmed.length).toBeLessThanOrEqual(maxSelections)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('trimSelectionsToLimit preserves order of kept selections', () => {
    fc.assert(
      fc.property(
        selectionsArb,
        maxSelectionsArb,
        (selections, maxSelections) => {
          const { trimmed } = trimSelectionsToLimit(selections, maxSelections)
          
          // Trimmed items should be the first N items in original order
          trimmed.forEach((item, index) => {
            expect(item).toBe(selections[index])
          })
        }
      ),
      { numRuns: 100 }
    )
  })

  it('trimSelectionsToLimit returns removed items correctly', () => {
    fc.assert(
      fc.property(
        selectionsArb,
        maxSelectionsArb,
        (selections, maxSelections) => {
          const { trimmed, removed } = trimSelectionsToLimit(selections, maxSelections)
          
          // Total of trimmed + removed should equal original
          expect(trimmed.length + removed.length).toBe(selections.length)
          
          // Removed items should be the excess items
          if (selections.length > maxSelections) {
            expect(removed.length).toBe(selections.length - maxSelections)
            removed.forEach((item, index) => {
              expect(item).toBe(selections[maxSelections + index])
            })
          } else {
            expect(removed.length).toBe(0)
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  it('trimSelectionsToLimit returns unchanged array when within limits', () => {
    fc.assert(
      fc.property(
        selectionsArb,
        fc.nat({ max: 20 }),
        (selections, extraCapacity) => {
          // Ensure maxSelections is >= selections.length
          const maxSelections = selections.length + extraCapacity
          
          const { trimmed, removed } = trimSelectionsToLimit(selections, maxSelections)
          
          // Should return original array unchanged
          expect(trimmed).toEqual(selections)
          expect(removed).toEqual([])
        }
      ),
      { numRuns: 100 }
    )
  })

  it('trimSelectionsToLimit handles edge case of maxSelections = 0', () => {
    fc.assert(
      fc.property(selectionsArb, (selections) => {
        const { trimmed, removed } = trimSelectionsToLimit(selections, 0)
        
        // All items should be removed
        expect(trimmed).toEqual([])
        expect(removed).toEqual(selections)
      }),
      { numRuns: 100 }
    )
  })

  it('trimSelectionsToLimit handles empty selections array', () => {
    fc.assert(
      fc.property(maxSelectionsArb, (maxSelections) => {
        const { trimmed, removed } = trimSelectionsToLimit([], maxSelections)
        
        // Should return empty arrays
        expect(trimmed).toEqual([])
        expect(removed).toEqual([])
      }),
      { numRuns: 100 }
    )
  })
})

// ================================================================
// Combined Property Tests
// ================================================================

describe('Combined Properties: Rules Application + Enforcement', () => {
  it('applying rule then enforcing limits produces valid state', () => {
    fc.assert(
      fc.property(
        validConditionalRuleArb,
        selectionsArb,
        maxSelectionsArb,
        (rule, selections, defaultMax) => {
          // Get a random option from rules
          const optionIds = Object.keys(rule.rules)
          if (optionIds.length === 0) return true
          
          const selectedOptionId = optionIds[0]
          
          // Apply the rule
          const effectiveMax = getEffectiveMaxSelections(rule, selectedOptionId, defaultMax)
          
          // Enforce the limit
          const { trimmed } = trimSelectionsToLimit(selections, effectiveMax)
          
          // Result should always be within limits
          expect(trimmed.length).toBeLessThanOrEqual(effectiveMax)
        }
      ),
      { numRuns: 100 }
    )
  })
})
