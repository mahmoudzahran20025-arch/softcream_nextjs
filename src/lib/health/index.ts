/**
 * Health-Driven Cart Module
 * 
 * Exports all health-related utilities for the cart experience.
 */

// Keywords
export {
  HEALTH_KEYWORDS,
  VALID_HEALTH_KEYWORDS,
  getKeywordsByCategory,
  isValidHealthKeyword,
  getKeywordWeight,
  type HealthKeyword,
  type HealthKeywordConfig,
} from './keywords';

// Insights
export {
  HEALTH_INSIGHTS,
  getInsightById,
  getFallbackInsight,
  getInsightIds,
  type HealthInsight,
  type HealthInsightMessage,
} from './insights';

// Selection Algorithm
export {
  extractDominantKeywords,
  selectHealthInsight,
  parseHealthKeywords,
  type CartItemWithKeywords,
  type InsightSelectionResult,
} from './selectInsight';

// Validation
export {
  validateHealthKeywords,
  sanitizeHealthKeywords,
  type ValidationResult,
} from './validation';
