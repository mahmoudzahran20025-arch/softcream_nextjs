/**
 * Health Keywords Taxonomy
 * 
 * Defines all valid health keywords with their weights and categories.
 * Used for insight selection algorithm and admin product management.
 */

export interface HealthKeywordConfig {
  weight: number;
  category: 'nutritional' | 'lifestyle' | 'special';
  label_ar: string;
  label_en: string;
}

/**
 * Health Keywords with weights and metadata
 * 
 * Weight determines priority in insight selection:
 * - High Priority (weight: 3): high-protein, low-sugar
 * - Medium Priority (weight: 2): calcium, fiber-rich, probiotic
 * - Low Priority (weight: 1): energy-boost, indulgent, balanced, refreshing
 */
export const HEALTH_KEYWORDS = {
  // High Priority (weight: 3)
  'high-protein': {
    weight: 3,
    category: 'nutritional',
    label_ar: 'عالي البروتين',
    label_en: 'High Protein'
  },
  'low-sugar': {
    weight: 3,
    category: 'nutritional',
    label_ar: 'منخفض السكر',
    label_en: 'Low Sugar'
  },

  // Medium Priority (weight: 2)
  'calcium': {
    weight: 2,
    category: 'nutritional',
    label_ar: 'غني بالكالسيوم',
    label_en: 'Rich in Calcium'
  },
  'fiber-rich': {
    weight: 2,
    category: 'nutritional',
    label_ar: 'غني بالألياف',
    label_en: 'Fiber Rich'
  },
  'probiotic': {
    weight: 2,
    category: 'nutritional',
    label_ar: 'بروبيوتيك',
    label_en: 'Probiotic'
  },

  // Low Priority (weight: 1)
  'energy-boost': {
    weight: 1,
    category: 'lifestyle',
    label_ar: 'يعزز الطاقة',
    label_en: 'Energy Boost'
  },
  'indulgent': {
    weight: 1,
    category: 'lifestyle',
    label_ar: 'للاستمتاع',
    label_en: 'Indulgent'
  },
  'balanced': {
    weight: 1,
    category: 'lifestyle',
    label_ar: 'متوازن',
    label_en: 'Balanced'
  },
  'refreshing': {
    weight: 1,
    category: 'lifestyle',
    label_ar: 'منعش',
    label_en: 'Refreshing'
  },
} as const;

export type HealthKeyword = keyof typeof HEALTH_KEYWORDS;

/**
 * Get all valid health keywords as an array
 */
export const VALID_HEALTH_KEYWORDS: HealthKeyword[] = Object.keys(HEALTH_KEYWORDS) as HealthKeyword[];

/**
 * Get keywords grouped by category for admin UI
 */
export function getKeywordsByCategory(): Record<string, { keyword: HealthKeyword; config: HealthKeywordConfig }[]> {
  const grouped: Record<string, { keyword: HealthKeyword; config: HealthKeywordConfig }[]> = {
    nutritional: [],
    lifestyle: [],
    special: [],
  };

  (Object.entries(HEALTH_KEYWORDS) as [HealthKeyword, HealthKeywordConfig][]).forEach(([keyword, config]) => {
    grouped[config.category].push({ keyword, config });
  });

  return grouped;
}

/**
 * Validate if a keyword is valid
 */
export function isValidHealthKeyword(keyword: string): keyword is HealthKeyword {
  return keyword in HEALTH_KEYWORDS;
}

/**
 * Get keyword weight (returns 1 for unknown keywords)
 */
export function getKeywordWeight(keyword: string): number {
  if (isValidHealthKeyword(keyword)) {
    return HEALTH_KEYWORDS[keyword].weight;
  }
  return 1;
}

/**
 * Parse health keywords from JSON string (from backend)
 * Returns array of keyword objects with id and weight
 */
export function parseHealthKeywords(keywordsJson: string | null | undefined): Array<{ id: HealthKeyword; weight: number }> {
  if (!keywordsJson) return [];

  try {
    const parsed = JSON.parse(keywordsJson);
    const keywords = Array.isArray(parsed) ? parsed : [];

    return keywords
      .filter(isValidHealthKeyword)
      .map(keyword => ({
        id: keyword,
        weight: HEALTH_KEYWORDS[keyword].weight
      }));
  } catch (error) {
    console.warn('Failed to parse health keywords:', error);
    return [];
  }
}
