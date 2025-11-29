'use client'

// ============================================
// Shared Types for Product Templates
// ============================================

export interface NutritionValues {
  calories?: number
  protein?: number
  carbs?: number
  sugar?: number
  fat?: number
  fiber?: number
}

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

// Base props shared by all templates
export interface BaseTemplateProps {
  product: any
  sizes: any[]
  selectedSize: any
  onSizeSelect: (size: any) => void
  customizationRules: CustomizationGroup[]
  selections: Record<string, string[]>
  onSelectionChange: (groupId: string, ids: string[]) => void
}

// Extended props for BYO template (includes containers)
export interface BYOTemplateProps extends BaseTemplateProps {
  containers: any[]
  selectedContainer: any
  onContainerSelect: (container: any) => void
}

// Accent colors available for templates
export type AccentColor = 'pink' | 'amber' | 'purple' | 'cyan' | 'emerald'

// Card sizes
export type CardSize = 'sm' | 'md' | 'lg'

// Grid columns
export type GridColumns = 2 | 3 | 4
