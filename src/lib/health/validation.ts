/**
 * Health Keywords Validation
 * 
 * Validates health keywords for product submissions.
 */

import { isValidHealthKeyword, type HealthKeyword } from './keywords';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  validKeywords: HealthKeyword[];
  invalidKeywords: string[];
}

/**
 * Validate an array of health keywords
 * 
 * Rules:
 * - All keywords must be from the predefined HEALTH_KEYWORDS list
 * - Maximum 3 keywords allowed
 * - No duplicates
 */
export function validateHealthKeywords(keywords: string[]): ValidationResult {
  const errors: string[] = [];
  const validKeywords: HealthKeyword[] = [];
  const invalidKeywords: string[] = [];
  const seen = new Set<string>();

  // Check for duplicates and validate each keyword
  keywords.forEach(kw => {
    if (seen.has(kw)) {
      errors.push(`Duplicate keyword: ${kw}`);
      return;
    }
    seen.add(kw);

    if (isValidHealthKeyword(kw)) {
      validKeywords.push(kw);
    } else {
      invalidKeywords.push(kw);
      errors.push(`Invalid keyword: ${kw}`);
    }
  });

  // Check maximum limit
  if (keywords.length > 3) {
    errors.push(`Maximum 3 keywords allowed, got ${keywords.length}`);
  }

  return {
    valid: errors.length === 0,
    errors,
    validKeywords,
    invalidKeywords
  };
}

/**
 * Sanitize keywords array - remove invalid and duplicates, limit to 3
 */
export function sanitizeHealthKeywords(keywords: string[]): HealthKeyword[] {
  const seen = new Set<string>();
  const result: HealthKeyword[] = [];

  for (const kw of keywords) {
    if (result.length >= 3) break;
    if (seen.has(kw)) continue;
    seen.add(kw);

    if (isValidHealthKeyword(kw)) {
      result.push(kw);
    }
  }

  return result;
}
