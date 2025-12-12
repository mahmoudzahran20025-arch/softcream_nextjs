// ============================================
// Shared Types for Product Templates
// ============================================
// Active types used by current components
// ============================================

// Nutrition values interface - used by OptionCard, NutritionBadge
export interface NutritionValues {
  calories?: number
  protein?: number
  carbs?: number
  sugar?: number
  fat?: number
  fiber?: number
}

// Option interface - used by OptionsGrid, OptionCard
export interface Option {
  id: string
  name_ar: string
  name_en?: string
  description_ar?: string
  description_en?: string
  price: number
  image?: string
  nutrition?: NutritionValues
}

// Customization group interface - used by OptionGroupRenderer
export interface CustomizationGroup {
  groupId: string
  groupName: string
  groupDescription?: string
  groupIcon?: string
  isRequired: boolean
  minSelections: number
  maxSelections: number
  options: Option[]
}

// Accent colors available for templates
export type AccentColor = 'pink' | 'amber' | 'purple' | 'cyan' | 'emerald'

// Card sizes
export type CardSize = 'sm' | 'md' | 'lg'

// Grid columns
export type GridColumns = 2 | 3 | 4
