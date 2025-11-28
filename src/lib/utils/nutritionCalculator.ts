/**
 * Nutrition Calculator Utility
 * 
 * Single source of truth for all nutrition calculations
 * Used by: NutritionInfo, useCustomization, useProductConfiguration
 */

export interface NutritionValues {
  calories: number
  protein: number
  carbs: number
  sugar: number
  fat: number
  fiber: number
}

export interface EnergyData {
  energyType: 'physical' | 'mental' | 'balanced'
  energyScore: number
}

/**
 * Create empty nutrition object
 */
export function createEmptyNutrition(): NutritionValues {
  return {
    calories: 0,
    protein: 0,
    carbs: 0,
    sugar: 0,
    fat: 0,
    fiber: 0
  }
}

/**
 * Add two nutrition objects together
 */
export function addNutrition(
  base: Partial<NutritionValues>,
  addition: Partial<NutritionValues>
): NutritionValues {
  return {
    calories: (base.calories || 0) + (addition.calories || 0),
    protein: (base.protein || 0) + (addition.protein || 0),
    carbs: (base.carbs || 0) + (addition.carbs || 0),
    sugar: (base.sugar || 0) + (addition.sugar || 0),
    fat: (base.fat || 0) + (addition.fat || 0),
    fiber: (base.fiber || 0) + (addition.fiber || 0)
  }
}

/**
 * Multiply nutrition values by a factor (e.g., size multiplier)
 */
export function multiplyNutrition(
  nutrition: NutritionValues,
  multiplier: number
): NutritionValues {
  return {
    calories: Math.round(nutrition.calories * multiplier),
    protein: Math.round(nutrition.protein * multiplier * 10) / 10,
    carbs: Math.round(nutrition.carbs * multiplier),
    sugar: Math.round(nutrition.sugar * multiplier),
    fat: Math.round(nutrition.fat * multiplier * 10) / 10,
    fiber: Math.round(nutrition.fiber * multiplier * 10) / 10
  }
}

/**
 * Calculate total nutrition from base + customizations with size multiplier
 */
export function calculateTotalNutrition(params: {
  baseNutrition?: Partial<NutritionValues>
  containerNutrition?: Partial<NutritionValues>
  customizationNutrition?: Partial<NutritionValues>
  sizeMultiplier?: number
}): NutritionValues {
  const {
    baseNutrition = {},
    containerNutrition = {},
    customizationNutrition = {},
    sizeMultiplier = 1
  } = params

  // Start with container nutrition (not affected by size)
  let total = createEmptyNutrition()
  total = addNutrition(total, containerNutrition)

  // Add base + customization nutrition (affected by size multiplier)
  const scalableNutrition = addNutrition(baseNutrition, customizationNutrition)
  const scaledNutrition = multiplyNutrition(scalableNutrition, sizeMultiplier)
  
  return addNutrition(total, scaledNutrition)
}

/**
 * Calculate energy type and score based on nutrition
 * 
 * Logic:
 * - High Protein (> 15g) → Physical (Muscle)
 * - High Sugar (> 25g) → Mental (Quick Energy)
 * - Balanced → Balanced
 */
export function calculateEnergyData(nutrition: NutritionValues): EnergyData {
  const { protein, sugar, calories } = nutrition

  // Thresholds
  const HIGH_PROTEIN_THRESHOLD = 15
  const HIGH_SUGAR_THRESHOLD = 25

  let energyType: EnergyData['energyType'] = 'balanced'
  let energyScore = 50

  if (protein > HIGH_PROTEIN_THRESHOLD) {
    energyType = 'physical'
    energyScore = Math.min(95, 60 + (protein * 1.5))
  } else if (sugar > HIGH_SUGAR_THRESHOLD) {
    energyType = 'mental'
    energyScore = Math.min(90, 50 + (sugar * 1.2))
  } else {
    energyType = 'balanced'
    energyScore = Math.min(85, 40 + (calories / 10))
  }

  return {
    energyType,
    energyScore: Math.round(energyScore)
  }
}

/**
 * Check if nutrition data has any values worth displaying
 */
export function hasNutritionData(nutrition: Partial<NutritionValues>): boolean {
  return (
    (nutrition.calories || 0) > 0 ||
    (nutrition.protein || 0) > 0 ||
    (nutrition.carbs || 0) > 0 ||
    (nutrition.sugar || 0) > 0
  )
}

/**
 * Check if detailed nutrition info is available
 */
export function hasDetailedNutrition(
  nutrition: Partial<NutritionValues>,
  ingredients: string[] = [],
  allergens: string[] = []
): boolean {
  return (
    (nutrition.fat || 0) > 0 ||
    (nutrition.fiber || 0) > 0 ||
    ingredients.length > 0 ||
    allergens.length > 0
  )
}
