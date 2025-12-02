/**
 * Health Score Calculator
 * 
 * Calculates a health score (0-100) based on nutrition values from
 * cart items including their customizations.
 */

export interface NutritionData {
  calories?: number
  protein?: number
  carbs?: number
  sugar?: number
  fat?: number
  fiber?: number
  satFat?: number
}

export interface CartItemForScore {
  productId: string
  quantity: number
  selectedAddons?: string[]
  selections?: Record<string, string[]>
}

export interface HealthScoreResult {
  score: number // 0-100
  level: 'Very Poor' | 'Poor' | 'Fair' | 'Good' | 'Excellent'
  color: string
  breakdown: {
    sugarScore: number
    proteinScore: number
    satFatScore: number
    caloriesPenalty: number
  }
  totalNutrition: NutritionData
}

// Scoring Weights
const WEIGHTS = {
  sugar: 0.45,
  protein: 0.30,
  satFat: 0.20,
  calories: 0.05,
}

// Score boundaries
const MAX_RAW = 1.5
const MIN_RAW = -1.35

/**
 * Calculate sugar score (-2 to +2)
 */
function calculateSugarScore(sugar: number): number {
  if (sugar < 6) return 2
  if (sugar < 12) return 1
  if (sugar < 20) return 0
  if (sugar < 30) return -1
  return -2
}

/**
 * Calculate protein score (0 to +2)
 */
function calculateProteinScore(protein: number): number {
  if (protein >= 10) return 2
  if (protein >= 6) return 1
  return 0
}

/**
 * Calculate saturated fat score (-2 to 0)
 */
function calculateSatFatScore(satFat: number): number {
  if (satFat >= 6) return -2
  if (satFat >= 3) return -1
  return 0
}

/**
 * Calculate calories penalty (0 to -1)
 */
function calculateCaloriesPenalty(calories: number): number {
  if (calories > 450) return -1
  if (calories > 350) return -0.5
  return 0
}

/**
 * Get nutrition from a product including customizations
 */
function getItemNutrition(
  item: CartItemForScore,
  productsMap: Map<string, any>
): NutritionData {
  const product = productsMap.get(item.productId) || {}
  
  // Start with base product nutrition
  let calories = product.calories || 0
  let protein = product.protein || 0
  let carbs = product.carbs || 0
  let sugar = product.sugar || 0
  let fat = product.fat || 0
  let fiber = product.fiber || 0
  let satFat = product.satFat || 0
  
  // Add nutrition from customization rules (options)
  const customizationRules = product.customizationRules || []
  const selections = item.selections || {}
  
  customizationRules.forEach((group: any) => {
    const selectedOptionIds = selections[group.groupId] || []
    
    group.options?.forEach((option: any) => {
      if (selectedOptionIds.includes(option.id)) {
        // Add option nutrition
        const optionNutrition = option.nutrition || option
        calories += optionNutrition.calories || 0
        protein += optionNutrition.protein || 0
        carbs += optionNutrition.carbs || 0
        sugar += optionNutrition.sugar || 0
        fat += optionNutrition.fat || 0
        fiber += optionNutrition.fiber || 0
        satFat += optionNutrition.satFat || 0
      }
    })
  })
  
  // Add nutrition from addons (legacy support)
  const addonsList = product.addonsList || []
  const selectedAddons = item.selectedAddons || []
  
  addonsList.forEach((addon: any) => {
    if (selectedAddons.includes(addon.id)) {
      calories += addon.calories || 0
      protein += addon.protein || 0
      carbs += addon.carbs || 0
      sugar += addon.sugar || 0
      fat += addon.fat || 0
      fiber += addon.fiber || 0
      satFat += addon.satFat || 0
    }
  })
  
  return { calories, protein, carbs, sugar, fat, fiber, satFat }
}

/**
 * Calculate raw score from nutrition data
 */
function calculateRawScore(nutrition: NutritionData): {
  rawScore: number
  sugarScore: number
  proteinScore: number
  satFatScore: number
  caloriesPenalty: number
} {
  const sugarScore = calculateSugarScore(nutrition.sugar || 0)
  const proteinScore = calculateProteinScore(nutrition.protein || 0)
  const satFatScore = calculateSatFatScore(nutrition.satFat || 0)
  const caloriesPenalty = calculateCaloriesPenalty(nutrition.calories || 0)
  
  const rawScore =
    WEIGHTS.sugar * sugarScore +
    WEIGHTS.protein * proteinScore +
    WEIGHTS.satFat * satFatScore +
    WEIGHTS.calories * caloriesPenalty
  
  return { rawScore, sugarScore, proteinScore, satFatScore, caloriesPenalty }
}

/**
 * Normalize raw score to 0-100 range
 */
function normalizeScore(rawScore: number): number {
  const normalized = ((rawScore - MIN_RAW) / (MAX_RAW - MIN_RAW)) * 100
  // Clamp to 0-100
  return Math.max(0, Math.min(100, normalized))
}

/**
 * Get level and color from score
 */
function getScoreLevel(score: number): { level: HealthScoreResult['level']; color: string } {
  if (score <= 20) return { level: 'Very Poor', color: '#ef4444' }
  if (score <= 40) return { level: 'Poor', color: '#f97316' }
  if (score <= 60) return { level: 'Fair', color: '#eab308' }
  if (score <= 80) return { level: 'Good', color: '#84cc16' }
  return { level: 'Excellent', color: '#22c55e' }
}

/**
 * Calculate health score for cart items
 * 
 * Includes nutrition from:
 * - Base product
 * - Selected customization options
 * - Selected addons
 */
export const calculateHealthScore = (
  items: CartItemForScore[],
  productsMap: Map<string, any>
): HealthScoreResult => {
  if (items.length === 0) {
    return {
      score: 100,
      level: 'Excellent',
      color: '#22c55e',
      breakdown: { sugarScore: 0, proteinScore: 0, satFatScore: 0, caloriesPenalty: 0 },
      totalNutrition: { calories: 0, protein: 0, carbs: 0, sugar: 0, fat: 0, fiber: 0, satFat: 0 }
    }
  }
  
  let totalQty = 0
  let weightedScoreSum = 0
  let totalSugarScore = 0
  let totalProteinScore = 0
  let totalSatFatScore = 0
  let totalCaloriesPenalty = 0
  
  // Aggregate total nutrition
  const totalNutrition: NutritionData = {
    calories: 0, protein: 0, carbs: 0, sugar: 0, fat: 0, fiber: 0, satFat: 0
  }
  
  items.forEach((item) => {
    const nutrition = getItemNutrition(item, productsMap)
    const { rawScore, sugarScore, proteinScore, satFatScore, caloriesPenalty } = calculateRawScore(nutrition)
    const normalized = normalizeScore(rawScore)
    
    weightedScoreSum += normalized * item.quantity
    totalQty += item.quantity
    
    // Accumulate breakdown scores
    totalSugarScore += sugarScore * item.quantity
    totalProteinScore += proteinScore * item.quantity
    totalSatFatScore += satFatScore * item.quantity
    totalCaloriesPenalty += caloriesPenalty * item.quantity
    
    // Accumulate total nutrition
    totalNutrition.calories! += (nutrition.calories || 0) * item.quantity
    totalNutrition.protein! += (nutrition.protein || 0) * item.quantity
    totalNutrition.carbs! += (nutrition.carbs || 0) * item.quantity
    totalNutrition.sugar! += (nutrition.sugar || 0) * item.quantity
    totalNutrition.fat! += (nutrition.fat || 0) * item.quantity
    totalNutrition.fiber! += (nutrition.fiber || 0) * item.quantity
    totalNutrition.satFat! += (nutrition.satFat || 0) * item.quantity
  })
  
  const finalScore = Math.round(weightedScoreSum / totalQty)
  // Ensure score is within bounds
  const clampedScore = Math.max(0, Math.min(100, finalScore))
  const { level, color } = getScoreLevel(clampedScore)
  
  return {
    score: clampedScore,
    level,
    color,
    breakdown: {
      sugarScore: totalQty > 0 ? totalSugarScore / totalQty : 0,
      proteinScore: totalQty > 0 ? totalProteinScore / totalQty : 0,
      satFatScore: totalQty > 0 ? totalSatFatScore / totalQty : 0,
      caloriesPenalty: totalQty > 0 ? totalCaloriesPenalty / totalQty : 0,
    },
    totalNutrition
  }
}

/**
 * Calculate health score from raw nutrition values (for testing)
 */
export const calculateHealthScoreFromNutrition = (
  nutrition: NutritionData
): number => {
  const { rawScore } = calculateRawScore(nutrition)
  const normalized = normalizeScore(rawScore)
  return Math.round(normalized)
}
