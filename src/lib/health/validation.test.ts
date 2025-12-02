import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { validateHealthKeywords, sanitizeHealthKeywords } from './validation';
import { VALID_HEALTH_KEYWORDS, type HealthKeyword } from './keywords';

/**
 * **Feature: health-driven-cart, Property 9: Keyword Validation**
 * *For any* array of keywords submitted for a product, the validation
 * should reject any keyword not in the predefined HEALTH_KEYWORDS list.
 * **Validates: Requirements 7.3**
 */
describe('Property 9: Keyword Validation', () => {
  it('accepts all valid keywords', () => {
    fc.assert(
      fc.property(
        fc.array(fc.constantFrom(...VALID_HEALTH_KEYWORDS), { minLength: 0, maxLength: 3 }),
        (keywords) => {
          // Remove duplicates for valid test
          const uniqueKeywords = [...new Set(keywords)];
          const result = validateHealthKeywords(uniqueKeywords);
          
          // All unique valid keywords should pass
          if (uniqueKeywords.length <= 3) {
            expect(result.valid).toBe(true);
            expect(result.invalidKeywords).toEqual([]);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('rejects invalid keywords', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.string({ minLength: 1, maxLength: 20 }).filter(s => !VALID_HEALTH_KEYWORDS.includes(s as HealthKeyword)),
          { minLength: 1, maxLength: 3 }
        ),
        (invalidKeywords) => {
          const result = validateHealthKeywords(invalidKeywords);
          
          expect(result.valid).toBe(false);
          expect(result.invalidKeywords.length).toBeGreaterThan(0);
          expect(result.errors.length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('rejects more than 3 keywords', () => {
    const keywords = ['high-protein', 'low-sugar', 'calcium', 'balanced'];
    const result = validateHealthKeywords(keywords);
    
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('Maximum 3'))).toBe(true);
  });

  it('detects duplicate keywords', () => {
    const keywords = ['high-protein', 'high-protein'];
    const result = validateHealthKeywords(keywords);
    
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('Duplicate'))).toBe(true);
  });

  it('returns valid keywords separately from invalid', () => {
    const keywords = ['high-protein', 'invalid-keyword', 'low-sugar'];
    const result = validateHealthKeywords(keywords);
    
    expect(result.validKeywords).toContain('high-protein');
    expect(result.validKeywords).toContain('low-sugar');
    expect(result.invalidKeywords).toContain('invalid-keyword');
  });

  it('empty array is valid', () => {
    const result = validateHealthKeywords([]);
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });
});

describe('sanitizeHealthKeywords', () => {
  it('removes invalid keywords', () => {
    const keywords = ['high-protein', 'invalid', 'low-sugar'];
    const result = sanitizeHealthKeywords(keywords);
    
    expect(result).toContain('high-protein');
    expect(result).toContain('low-sugar');
    expect(result).not.toContain('invalid');
  });

  it('removes duplicates', () => {
    const keywords = ['high-protein', 'high-protein', 'low-sugar'];
    const result = sanitizeHealthKeywords(keywords);
    
    expect(result.filter(k => k === 'high-protein').length).toBe(1);
  });

  it('limits to 3 keywords', () => {
    const keywords = ['high-protein', 'low-sugar', 'calcium', 'balanced', 'refreshing'];
    const result = sanitizeHealthKeywords(keywords);
    
    expect(result.length).toBeLessThanOrEqual(3);
  });

  it('preserves order of first 3 valid keywords', () => {
    const keywords = ['balanced', 'high-protein', 'low-sugar', 'calcium'];
    const result = sanitizeHealthKeywords(keywords);
    
    expect(result[0]).toBe('balanced');
    expect(result[1]).toBe('high-protein');
    expect(result[2]).toBe('low-sugar');
  });

  it('returns empty array for all invalid keywords', () => {
    const keywords = ['invalid1', 'invalid2', 'invalid3'];
    const result = sanitizeHealthKeywords(keywords);
    
    expect(result).toEqual([]);
  });
});
