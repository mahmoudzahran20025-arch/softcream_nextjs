// ============================================
// Shared Components for Product Templates
// ============================================

// Components
export { default as OptionCard } from './OptionCard'
export { default as OptionsGrid } from './OptionsGrid'

// Utilities
export { 
  getMaterialColor, 
  isRainbowColor, 
  RAINBOW_GRADIENT, 
  RAINBOW_GRADIENT_135 
} from './materialColors'

// Types
export type { 
  NutritionValues, 
  Option, 
  CustomizationGroup, 
  AccentColor, 
  CardSize, 
  GridColumns 
} from './types'
