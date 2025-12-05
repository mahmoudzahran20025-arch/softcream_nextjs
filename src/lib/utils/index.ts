/**
 * Utils - Barrel Export
 */

// Price calculations
export {
  calculateProductPrice,
  calculateCartItemPrice,
  calculateCartTotal,
  formatPrice,
  calculateDiscount,
  type PriceComponents,
  type CartItemSelections
} from './priceCalculator'

// Nutrition calculations
export {
  createEmptyNutrition,
  addNutrition,
  multiplyNutrition,
  calculateTotalNutrition,
  calculateEnergyData,
  hasNutritionData,
  hasDetailedNutrition,
  type NutritionValues,
  type EnergyData
} from './nutritionCalculator'

// Health Score calculations
export {
  calculateHealthScore,
  calculateHealthScoreFromNutrition,
  type NutritionData,
  type CartItemForScore,
  type HealthScoreResult
} from './healthScore'
