/**
 * Insight Selection Algorithm
 * 
 * Selects the most relevant health insight based on:
 * 1. Health score range
 * 2. Dominant keywords from cart items
 */

import { type HealthKeyword, HEALTH_KEYWORDS, isValidHealthKeyword } from './keywords';
import { HEALTH_INSIGHTS, getFallbackInsight, type HealthInsight } from './insights';

export interface CartItemWithKeywords {
  productId: string;
  quantity: number;
  health_keywords: HealthKeyword[];
}

export interface InsightSelectionResult {
  insight: HealthInsight;
  dominantKeywords: HealthKeyword[];
  healthScore: number;
  matchReason: 'keyword' | 'score_range' | 'fallback';
}

/**
 * Extract dominant keywords from cart items
 * 
 * Calculates weighted scores for each keyword based on:
 * - Keyword weight (from HEALTH_KEYWORDS)
 * - Product quantity
 * 
 * Returns top 3 keywords sorted by score
 */
export function extractDominantKeywords(
  cartItems: CartItemWithKeywords[]
): HealthKeyword[] {
  const keywordScores = new Map<HealthKeyword, number>();
  
  cartItems.forEach(item => {
    item.health_keywords.forEach(kw => {
      if (!isValidHealthKeyword(kw)) return;
      
      const weight = HEALTH_KEYWORDS[kw].weight;
      const score = weight * item.quantity;
      keywordScores.set(kw, (keywordScores.get(kw) || 0) + score);
    });
  });
  
  return Array.from(keywordScores.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([kw]) => kw);
}

/**
 * Select the most relevant health insight
 * 
 * Algorithm:
 * 1. Filter insights by health score range
 * 2. Match by dominant keywords
 * 3. Return fallback if no match
 */
export function selectHealthInsight(
  healthScore: number,
  cartItems: CartItemWithKeywords[]
): InsightSelectionResult {
  const dominantKeywords = extractDominantKeywords(cartItems);
  
  // Filter by score range first (excluding fallback)
  const scoreMatchedInsights = HEALTH_INSIGHTS.filter(
    insight => 
      insight.id !== 'fallback' &&
      healthScore >= insight.scoreRange[0] && 
      healthScore <= insight.scoreRange[1]
  );
  
  // Then match by keywords
  const keywordMatchedInsight = scoreMatchedInsights.find(insight =>
    insight.keywords.length > 0 &&
    insight.keywords.some(kw => dominantKeywords.includes(kw))
  );
  
  if (keywordMatchedInsight) {
    return {
      insight: keywordMatchedInsight,
      dominantKeywords,
      healthScore,
      matchReason: 'keyword'
    };
  }
  
  // If we have score-matched insights but no keyword match, use first one
  if (scoreMatchedInsights.length > 0) {
    return {
      insight: scoreMatchedInsights[0],
      dominantKeywords,
      healthScore,
      matchReason: 'score_range'
    };
  }
  
  // Return fallback
  return {
    insight: getFallbackInsight(),
    dominantKeywords,
    healthScore,
    matchReason: 'fallback'
  };
}

/**
 * Parse health_keywords from JSON string (from database)
 */
export function parseHealthKeywords(jsonString: string | null | undefined): HealthKeyword[] {
  if (!jsonString || jsonString === 'null') return [];
  
  try {
    const parsed = JSON.parse(jsonString);
    if (!Array.isArray(parsed)) return [];
    
    return parsed.filter(isValidHealthKeyword);
  } catch {
    return [];
  }
}
