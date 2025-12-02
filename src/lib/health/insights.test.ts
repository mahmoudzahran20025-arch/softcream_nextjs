import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { HEALTH_INSIGHTS, getFallbackInsight, getInsightById } from './insights';

describe('Health Insights Library', () => {
  /**
   * **Feature: health-driven-cart, Property 2: Insight Lines Maximum Length**
   * *For any* health insight in the library, the lines array should contain at most 3 elements.
   * **Validates: Requirements 2.2**
   */
  describe('Property 2: Insight Lines Maximum Length', () => {
    it('all insights have at most 3 lines', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...HEALTH_INSIGHTS),
          (insight) => {
            expect(insight.message.lines.length).toBeLessThanOrEqual(3);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('no insight has empty lines array', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...HEALTH_INSIGHTS),
          (insight) => {
            expect(insight.message.lines.length).toBeGreaterThan(0);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * **Feature: health-driven-cart, Property 3: Insight Structure Completeness**
   * *For any* health insight returned by the library, it should contain a non-empty title,
   * a non-empty emoji, a lines array, and a keywords array.
   * **Validates: Requirements 2.4**
   */
  describe('Property 3: Insight Structure Completeness', () => {
    it('all insights have non-empty title', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...HEALTH_INSIGHTS),
          (insight) => {
            expect(insight.message.title).toBeTruthy();
            expect(insight.message.title.length).toBeGreaterThan(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('all insights have non-empty emoji', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...HEALTH_INSIGHTS),
          (insight) => {
            expect(insight.message.emoji).toBeTruthy();
            expect(insight.message.emoji.length).toBeGreaterThan(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('all insights have lines array', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...HEALTH_INSIGHTS),
          (insight) => {
            expect(Array.isArray(insight.message.lines)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('all insights have keywords array', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...HEALTH_INSIGHTS),
          (insight) => {
            expect(Array.isArray(insight.keywords)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('all insights have valid score range', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...HEALTH_INSIGHTS),
          (insight) => {
            const [min, max] = insight.scoreRange;
            expect(min).toBeGreaterThanOrEqual(0);
            expect(max).toBeLessThanOrEqual(100);
            expect(min).toBeLessThanOrEqual(max);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('all insights have unique id', () => {
      const ids = HEALTH_INSIGHTS.map(i => i.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });

  /**
   * **Feature: health-driven-cart, Property 8: Insight Emoji Category Match**
   * *For any* health insight, the emoji in the message should match the insight's category.
   * **Validates: Requirements 6.4**
   */
  describe('Property 8: Insight Emoji Category Match', () => {
    const EXPECTED_EMOJIS: Record<string, string> = {
      'high_protein': '💪',
      'low_sugar': '🌱',
      'balanced': '⚖️',
      'indulgent': '🎉',
      'fallback': '🍦',
    };

    it('each insight has the correct emoji for its category', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...HEALTH_INSIGHTS),
          (insight) => {
            const expectedEmoji = EXPECTED_EMOJIS[insight.id];
            if (expectedEmoji) {
              expect(insight.message.emoji).toBe(expectedEmoji);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('high_protein insight has muscle emoji', () => {
      const insight = getInsightById('high_protein');
      expect(insight?.message.emoji).toBe('💪');
    });

    it('low_sugar insight has plant emoji', () => {
      const insight = getInsightById('low_sugar');
      expect(insight?.message.emoji).toBe('🌱');
    });

    it('balanced insight has balance emoji', () => {
      const insight = getInsightById('balanced');
      expect(insight?.message.emoji).toBe('⚖️');
    });

    it('indulgent insight has celebration emoji', () => {
      const insight = getInsightById('indulgent');
      expect(insight?.message.emoji).toBe('🎉');
    });

    it('fallback insight has ice cream emoji', () => {
      const fallback = getFallbackInsight();
      expect(fallback.message.emoji).toBe('🍦');
    });
  });

  describe('Library Structure', () => {
    it('has exactly 5 insight categories', () => {
      expect(HEALTH_INSIGHTS.length).toBe(5);
    });

    it('has all required categories', () => {
      const ids = HEALTH_INSIGHTS.map(i => i.id);
      expect(ids).toContain('high_protein');
      expect(ids).toContain('low_sugar');
      expect(ids).toContain('balanced');
      expect(ids).toContain('indulgent');
      expect(ids).toContain('fallback');
    });

    it('fallback insight has empty keywords array', () => {
      const fallback = getFallbackInsight();
      expect(fallback.keywords).toEqual([]);
    });

    it('fallback insight covers full score range', () => {
      const fallback = getFallbackInsight();
      expect(fallback.scoreRange).toEqual([0, 100]);
    });
  });
});
