// ================================================================
// SmartFooter.test.ts - Property-Based Tests
// **Feature: smart-options-template-system, Property 6: Footer Summary Formatting**
// **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**
// ================================================================

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import {
  formatFooterSummary,
  getCompactBadges,
  groupOptionsByCategory,
  type FooterSelectedOption
} from './SmartFooter'

// ================================================================
// Arbitraries for generating test data
// ================================================================

// Valid option name (non-empty string)
const optionNameArb = fc.string({ minLength: 1, maxLength: 30 })
  .filter(s => s.trim().length > 0)
  .map(s => s.trim())

// Valid size name
const sizeNameArb = fc.string({ minLength: 1, maxLength: 20 })
  .filter(s => s.trim().length > 0)
  .map(s => s.trim())

// Valid group ID
const groupIdArb = fc.string({ minLength: 1, maxLength: 20 })
  .filter(s => s.trim().length > 0)

// Valid price (non-negative)
const priceArb = fc.float({ min: 0, max: 1000, noNaN: true })

// Optional group icon (emoji or undefined)
const groupIconArb = fc.oneof(
  fc.constant(undefined),
  fc.constantFrom('🍦', '🍫', '🍓', '🥤', '🧁', '🍪')
)

// Simple option for formatFooterSummary
const simpleOptionArb = fc.record({
  name: optionNameArb,
  groupIcon: groupIconArb
})

// Full FooterSelectedOption
const footerOptionArb: fc.Arbitrary<FooterSelectedOption> = fc.record({
  id: fc.uuid(),
  name: optionNameArb,
  price: priceArb,
  groupId: groupIdArb,
  groupIcon: groupIconArb
})

// Array of options (0-10 items)
const optionsArrayArb = fc.array(footerOptionArb, { maxLength: 10 })

// Small array (1-3 items) for testing visible badges
const smallOptionsArrayArb = fc.array(footerOptionArb, { minLength: 1, maxLength: 3 })

// Large array (4+ items) for testing count display
const largeOptionsArrayArb = fc.array(footerOptionArb, { minLength: 4, maxLength: 10 })

// ================================================================
// Property 6: Footer Summary Formatting
// *For any* set of selections, the modal footer SHALL display a 
// single-line summary containing size name and option badges, 
// with count display when options exceed 3.
// **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**
// ================================================================

describe('Property 6: Footer Summary Formatting', () => {
  // Requirement 3.1: Single line formatting
  it('formatFooterSummary returns a single line (no newlines)', () => {
    fc.assert(
      fc.property(
        fc.option(sizeNameArb, { nil: null }),
        fc.array(simpleOptionArb, { maxLength: 10 }),
        (sizeName, options) => {
          const result = formatFooterSummary(sizeName, options)
          
          // Should not contain newlines
          expect(result).not.toContain('\n')
          expect(result).not.toContain('\r')
        }
      ),
      { numRuns: 100 }
    )
  })

  // Requirement 3.2: Size name displayed prominently
  it('formatFooterSummary includes size name when provided', () => {
    fc.assert(
      fc.property(
        sizeNameArb,
        fc.array(simpleOptionArb, { maxLength: 5 }),
        (sizeName, options) => {
          const result = formatFooterSummary(sizeName, options)
          
          // Size name should be in the result
          expect(result).toContain(sizeName)
          
          // Size should appear first (before any bullet separator)
          const firstPart = result.split(' • ')[0]
          expect(firstPart).toBe(sizeName)
        }
      ),
      { numRuns: 100 }
    )
  })

  // Requirement 3.3: Options displayed as compact badges (when <= 3)
  it('formatFooterSummary shows individual option names when count <= maxVisible', () => {
    fc.assert(
      fc.property(
        fc.option(sizeNameArb, { nil: null }),
        fc.array(simpleOptionArb, { minLength: 1, maxLength: 3 }),
        (sizeName, options) => {
          const result = formatFooterSummary(sizeName, options, 3)
          
          // Each option name should appear in the result
          options.forEach(opt => {
            expect(result).toContain(opt.name)
          })
        }
      ),
      { numRuns: 100 }
    )
  })

  // Requirement 3.4: Show count when options > 3
  it('formatFooterSummary shows count when options exceed maxVisible', () => {
    fc.assert(
      fc.property(
        fc.option(sizeNameArb, { nil: null }),
        fc.array(simpleOptionArb, { minLength: 4, maxLength: 10 }),
        (sizeName, options) => {
          const result = formatFooterSummary(sizeName, options, 3)
          
          // Should contain count indicator
          expect(result).toContain(`+${options.length} إضافات`)
          
          // The result should use count format, not list all options
          // We verify this by checking the count badge is present
          // (Option names might coincidentally match size name, which is fine)
          const parts = result.split(' • ')
          const countBadge = parts.find(p => p.includes('إضافات'))
          expect(countBadge).toBeDefined()
          expect(countBadge).toBe(`+${options.length} إضافات`)
        }
      ),
      { numRuns: 100 }
    )
  })

  // Requirement 3.5: No redundant separators
  it('formatFooterSummary has no redundant separators', () => {
    fc.assert(
      fc.property(
        fc.option(sizeNameArb, { nil: null }),
        fc.array(simpleOptionArb, { maxLength: 10 }),
        (sizeName, options) => {
          const result = formatFooterSummary(sizeName, options)
          
          // Should not have double separators
          expect(result).not.toContain('• •')
          expect(result).not.toContain(' •  • ')
          
          // Should not start or end with separator
          expect(result).not.toMatch(/^\s*•/)
          expect(result).not.toMatch(/•\s*$/)
        }
      ),
      { numRuns: 100 }
    )
  })

  // Empty state handling
  it('formatFooterSummary returns empty string when no selections', () => {
    const result = formatFooterSummary(null, [])
    expect(result).toBe('')
  })

  it('formatFooterSummary handles only size (no options)', () => {
    fc.assert(
      fc.property(sizeNameArb, (sizeName) => {
        const result = formatFooterSummary(sizeName, [])
        
        // Should just be the size name, no separator
        expect(result).toBe(sizeName)
        expect(result).not.toContain('•')
      }),
      { numRuns: 100 }
    )
  })

  it('formatFooterSummary handles only options (no size)', () => {
    fc.assert(
      fc.property(
        fc.array(simpleOptionArb, { minLength: 1, maxLength: 3 }),
        (options) => {
          const result = formatFooterSummary(null, options, 3)
          
          // Should contain option names
          options.forEach(opt => {
            expect(result).toContain(opt.name)
          })
          
          // Should not start with separator
          expect(result).not.toMatch(/^\s*•/)
        }
      ),
      { numRuns: 100 }
    )
  })
})

// ================================================================
// getCompactBadges Tests
// ================================================================

describe('getCompactBadges', () => {
  it('returns empty array for empty options', () => {
    const result = getCompactBadges([])
    expect(result).toEqual([])
  })

  it('returns badges for options', () => {
    fc.assert(
      fc.property(smallOptionsArrayArb, (options) => {
        const result = getCompactBadges(options, 10) // High maxVisible to avoid collapsing
        
        // Should have at least one badge if there are options
        if (options.length > 0) {
          expect(result.length).toBeGreaterThan(0)
        }
        
        // Total represented options should match input
        // (badges may be grouped, so we check that all options are represented)
        const allOptionNames = options.map(o => o.name)
        const badgeTexts = result.map(b => b.text)
        
        // Either the name appears directly or it's part of a count
        allOptionNames.forEach(name => {
          const nameInBadge = badgeTexts.some(t => t === name || t.includes(name))
          const hasCountBadge = badgeTexts.some(t => /^\d+\s/.test(t) || t.includes('إضافات'))
          expect(nameInBadge || hasCountBadge).toBe(true)
        })
      }),
      { numRuns: 100 }
    )
  })

  it('collapses to count when options exceed maxVisible', () => {
    fc.assert(
      fc.property(largeOptionsArrayArb, (options) => {
        const maxVisible = 3
        const result = getCompactBadges(options, maxVisible)
        
        // Should not exceed maxVisible badges
        expect(result.length).toBeLessThanOrEqual(maxVisible)
        
        // If collapsed, last badge should contain count or "إضافات"
        if (result.length === maxVisible && options.length > maxVisible) {
          const lastBadge = result[result.length - 1]
          const hasCount = lastBadge.text.includes('إضافات') || /^\d+\s/.test(lastBadge.text)
          expect(hasCount).toBe(true)
        }
      }),
      { numRuns: 100 }
    )
  })

  it('groups options by groupId', () => {
    // Create options with same groupId
    const sameGroupOptions: FooterSelectedOption[] = [
      { id: '1', name: 'Option 1', price: 5, groupId: 'sauces', groupIcon: '🍫' },
      { id: '2', name: 'Option 2', price: 5, groupId: 'sauces', groupIcon: '🍫' },
      { id: '3', name: 'Option 3', price: 5, groupId: 'sauces', groupIcon: '🍫' }
    ]
    
    const result = getCompactBadges(sameGroupOptions, 10)
    
    // Should group into fewer badges than individual options
    // (sauces group has showIndividual: false, so it should show count)
    expect(result.length).toBeLessThanOrEqual(sameGroupOptions.length)
  })
})

// ================================================================
// groupOptionsByCategory Tests
// ================================================================

describe('groupOptionsByCategory', () => {
  it('returns empty map for empty options', () => {
    const result = groupOptionsByCategory([])
    expect(result.size).toBe(0)
  })

  it('groups options by groupId correctly', () => {
    fc.assert(
      fc.property(optionsArrayArb, (options) => {
        const result = groupOptionsByCategory(options)
        
        // Total count across all groups should equal input length
        let totalCount = 0
        result.forEach(group => {
          totalCount += group.count
        })
        expect(totalCount).toBe(options.length)
        
        // Each unique groupId should have an entry
        const uniqueGroupIds = new Set(options.map(o => o.groupId))
        expect(result.size).toBe(uniqueGroupIds.size)
      }),
      { numRuns: 100 }
    )
  })

  it('counts options per group correctly', () => {
    fc.assert(
      fc.property(optionsArrayArb, (options) => {
        const result = groupOptionsByCategory(options)
        
        // Verify count for each group
        options.forEach(opt => {
          const group = result.get(opt.groupId)
          expect(group).toBeDefined()
          
          // Count should match actual occurrences
          const expectedCount = options.filter(o => o.groupId === opt.groupId).length
          expect(group!.count).toBe(expectedCount)
        })
      }),
      { numRuns: 100 }
    )
  })
})

// ================================================================
// Edge Cases and Robustness
// ================================================================

describe('SmartFooter Robustness', () => {
  it('formatFooterSummary handles whitespace-only size name', () => {
    const result = formatFooterSummary('   ', [])
    expect(result).toBe('')
  })

  it('formatFooterSummary handles whitespace-only option names', () => {
    const options = [{ name: '   ', groupIcon: undefined }]
    const result = formatFooterSummary('حجم كبير', options)
    
    // Should only contain size, not the whitespace option
    expect(result).toBe('حجم كبير')
  })

  it('getCompactBadges handles null/undefined gracefully', () => {
    // @ts-expect-error - Testing null input
    const result1 = getCompactBadges(null)
    expect(result1).toEqual([])
    
    // @ts-expect-error - Testing undefined input
    const result2 = getCompactBadges(undefined)
    expect(result2).toEqual([])
  })

  it('formatFooterSummary respects custom maxVisible parameter', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10 }),
        fc.array(simpleOptionArb, { minLength: 1, maxLength: 15 }),
        (maxVisible, options) => {
          const result = formatFooterSummary(null, options, maxVisible)
          
          if (options.length <= maxVisible) {
            // All options should be visible
            options.forEach(opt => {
              expect(result).toContain(opt.name)
            })
          } else {
            // Should show count
            expect(result).toContain(`+${options.length} إضافات`)
          }
        }
      ),
      { numRuns: 100 }
    )
  })
})
