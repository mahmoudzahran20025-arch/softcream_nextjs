/**
 * Health Score Calculator
 * 
 * Calculates health score for cart items based on nutrition data.
 * Used by CartModal to display HealthyMeter and HealthInsightCard.
 */

export interface NutritionData {
  calories?: number
  protein?: number
  carbs?: number
  sugar?: number
  fat?: number
  satFat?: number
  fiber?: number
}

export interface CartItemForScore {
  productId: string
  quantity: number
  selectedAddons?: string[]
  selections?: Record<string, string[]>
}

export interface HealthScoreResult {
  score: number
  level: 'Very Poor' | 'Poor' | 'Fair' | 'Good' | 'Excellent'
  color: string
  totalNutrition: NutritionData
}

/**
 * Calculate health score from nutrition values
 * 
 * Formula:
 * - Base score: 100
 * - Deductions:
 *   - Sugar: -1 point per 2g (max -40)
 *   - Saturated Fat: -1 point per 1g (max -30)
 *   - Calories: -1 point per 50 over 200 (max -20)
 * - Bonuses:
 *   - Protein: +1 point per 3g (max +15)
 *   - Fiber: +1 point per 2g (max +10)
 */
export function calculateHealthScoreFromNutrition(nutrition: NutritionData): number {
  let score = 100
  
  const sugar = nutrition.sugar || 0
  const satFat = nutrition.satFat || 0
  const calories = nutrition.calories || 0
  const protein = nutrition.protein || 0
  const fiber = nutrition.fiber || 0
  
  // Deductions
  const sugarPenalty = Math.min(40, Math.floor(sugar / 2))
  const satFatPenalty = Math.min(30, Math.floor(satFat))
  const caloriePenalty = Math.min(20, Math.max(0, Math.floor((calories - 200) / 50)))
  
  score -= sugarPenalty
  score -= satFatPenalty
  score -= caloriePenalty
  
  // Bonuses
  const proteinBonus = Math.min(15, Math.floor(protein / 3))
  const fiberBonus = Math.min(10, Math.floor(fiber / 2))
  
  score += proteinBonus
  score += fiberBonus
  
  // Clamp to 0-100
  return Math.max(0, Math.min(100, score))
}

/**
 * Get level and color based on score
 */
function getScoreLevel(score: number): { level: HealthScoreResult['level'], color: string } {
  if (score >= 81) return { level: 'Excellent', color: '#22c55e' }
  if (score >= 61) return { level: 'Good', color: '#84cc16' }
  if (score >= 41) return { level: 'Fair', color: '#eab308' }
  if (score >= 21) return { level: 'Poor', color: '#f97316' }
  return { level: 'Very Poor', color: '#ef4444' }
}

/**
 * Calculate health score for cart items
 * 
 * Aggregates nutrition from:
 * - Base product nutrition
 * - Customization options nutrition
 * - Addons nutrition (legacy)
 * - Multiplied by quantity
 */
export function calculateHealthScore(
  items: CartItemForScore[],
  productsMap: Map<string, any>
): HealthScoreResult {
  // Empty cart = perfect score
  if (items.length === 0) {
    return {
      score: 100,
      level: 'Excellent',
      color: '#22c55e',
      totalNutrition: { calories: 0, protein: 0, sugar: 0, satFat: 0, fiber: 0 }
    }
  }
  
  const totalNutrition: NutritionData = {
    calories: 0,
    protein: 0,
    carbs: 0,
    sugar: 0,
    fat: 0,
    satFat: 0,
    fiber: 0
  }
  
  items.forEach(item => {
    const product = productsMap.get(item.productId)
    if (!product) return
    
    let itemNutrition: NutritionData = {
      calories: product.calories || 0,
      protein: product.protein || 0,
      carbs: product.carbs || 0,
      sugar: product.sugar || 0,
      fat: product.fat || 0,
      satFat: product.satFat || 0,
      fiber: product.fiber || 0
    }
    
    // Add customization options nutrition
    if (item.selections && product.customizationRules) {
      product.customizationRules.forEach((group: any) => {
        const selectedIds = item.selections?.[group.groupId] || []
        selectedIds.forEach((optionId: string) => {
          const option = group.options?.find((o: any) => o.id === optionId)
          if (option?.nutrition) {
            itemNutrition.calories! += option.nutrition.calories || 0
            itemNutrition.protein! += option.nutrition.protein || 0
            itemNutrition.carbs! += option.nutrition.carbs || 0
            itemNutrition.sugar! += option.nutrition.sugar || 0
            itemNutrition.fat! += option.nutrition.fat || 0
            itemNutrition.fiber! += option.nutrition.fiber || 0
          }
        })
      })
    }
    
    // Add addons nutrition (legacy support)
    if (item.selectedAddons && product.addonsList) {
      item.selectedAddons.forEach((addonId: string) => {
        const addon = product.addonsList?.find((a: any) => a.id === addonId)
        if (addon) {
          itemNutrition.calories! += addon.calories || 0
          itemNutrition.protein! += addon.protein || 0
          itemNutrition.carbs! += addon.carbs || 0
          itemNutrition.sugar! += addon.sugar || 0
          itemNutrition.fat! += addon.fat || 0
          itemNutrition.fiber! += addon.fiber || 0
        }
      })
    }
    
    // Multiply by quantity
    const qty = item.quantity || 1
    totalNutrition.calories! += (itemNutrition.calories || 0) * qty
    totalNutrition.protein! += (itemNutrition.protein || 0) * qty
    totalNutrition.carbs! += (itemNutrition.carbs || 0) * qty
    totalNutrition.sugar! += (itemNutrition.sugar || 0) * qty
    totalNutrition.fat! += (itemNutrition.fat || 0) * qty
    totalNutrition.satFat! += (itemNutrition.satFat || 0) * qty
    totalNutrition.fiber! += (itemNutrition.fiber || 0) * qty
  })
  
  const score = calculateHealthScoreFromNutrition(totalNutrition)
  const { level, color } = getScoreLevel(score)
  
  return {
    score,
    level,
    color,
    totalNutrition
  }
}
