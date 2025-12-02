import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import {
  HEALTH_KEYWORDS,
  VALID_HEALTH_KEYWORDS,
  getKeywordWeight,
  isValidHealthKeyword,
  type HealthKeyword,
} from './keywords';

/**
 * **Feature: health-driven-cart, Property 4: Keyword Weight Application**
 * *For any* cart with products containing health_keywords, the dominant keyword
 * calculation should apply the correct weights and multiply by quantity.
 * **Validates: Requirements 3.1, 3.2**
 */
describe('Property 4: Keyword Weight Application', () => {
  // Helper: Calculate weighted score for a cart item
  function calculateWeightedScore(
    keywords: HealthKeyword[],
    quantity: number
  ): Map<HealthKeyword, number> {
    const scores = new Map<HealthKeyword, number>();
    
    keywords.forEach(kw => {
      const weight = getKeywordWeight(kw);
      const score = weight * quantity;
      scores.set(kw, (scores.get(kw) || 0) + score);
    });
    
    return scores;
  }

  it('applies correct weights from HEALTH_KEYWORDS', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...VALID_HEALTH_KEYWORDS),
        (keyword) => {
          const weight = getKeywordWeight(keyword);
          const expectedWeight = HEALTH_KEYWORDS[keyword].weight;
          expect(weight).toBe(expectedWeight);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('high-protein and low-sugar have weight 3', () => {
    expect(getKeywordWeight('high-protein')).toBe(3);
    expect(getKeywordWeight('low-sugar')).toBe(3);
  });

  it('calcium, fiber-rich, probiotic have weight 2', () => {
    expect(getKeywordWeight('calcium')).toBe(2);
    expect(getKeywordWeight('fiber-rich')).toBe(2);
    expect(getKeywordWeight('probiotic')).toBe(2);
  });

  it('lifestyle keywords have weight 1', () => {
    expect(getKeywordWeight('energy-boost')).toBe(1);
    expect(getKeywordWeight('indulgent')).toBe(1);
    expect(getKeywordWeight('balanced')).toBe(1);
    expect(getKeywordWeight('refreshing')).toBe(1);
  });

  it('multiplies weight by quantity correctly', () => {
    fc.assert(
      fc.property(
        fc.array(fc.constantFrom(...VALID_HEALTH_KEYWORDS), { minLength: 1, maxLength: 3 }),
        fc.integer({ min: 1, max: 10 }),
        (keywords, quantity) => {
          const scores = calculateWeightedScore(keywords, quantity);
          
          // Each keyword's score should be weight * quantity
          keywords.forEach(kw => {
            const expectedScore = HEALTH_KEYWORDS[kw].weight * quantity;
            // Score might be higher if keyword appears multiple times
            expect(scores.get(kw)).toBeGreaterThanOrEqual(expectedScore);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it('accumulates scores for duplicate keywords', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...VALID_HEALTH_KEYWORDS),
        fc.integer({ min: 2, max: 5 }),
        fc.integer({ min: 1, max: 10 }),
        (keyword, duplicateCount, quantity) => {
          const keywords = Array(duplicateCount).fill(keyword) as HealthKeyword[];
          const scores = calculateWeightedScore(keywords, quantity);
          
          const expectedScore = HEALTH_KEYWORDS[keyword].weight * quantity * duplicateCount;
          expect(scores.get(keyword)).toBe(expectedScore);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('returns 1 for unknown keywords', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 20 }).filter(s => !isValidHealthKeyword(s)),
        (unknownKeyword) => {
          expect(getKeywordWeight(unknownKeyword)).toBe(1);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('isValidHealthKeyword returns true only for valid keywords', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...VALID_HEALTH_KEYWORDS),
        (keyword) => {
          expect(isValidHealthKeyword(keyword)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('isValidHealthKeyword returns false for invalid keywords', () => {
    const invalidKeywords = ['invalid', 'not-a-keyword', 'random', ''];
    invalidKeywords.forEach(kw => {
      expect(isValidHealthKeyword(kw)).toBe(false);
    });
  });
});
