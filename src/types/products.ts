// ================================================================
// Shared Product Types
// Used by both Admin and Customer paths
// Source of truth: softcream-api/schema.sql
// ================================================================

import type { Option, OptionGroup } from './options'

// Re-export for convenience
export type { Option, OptionGroup }

// ================================================================
// Base Product Type
// Matches schema.sql products table
// ================================================================

export interface BaseProduct {
  id: string
  name: string
  nameEn?: string
  category: string
  categoryEn?: string
  price: number
  description?: string
  descriptionEn?: string
  image?: string
  badge?: string
  available: number

  // Nutrition fields
  calories?: number
  protein?: number
  carbs?: number
  fat?: number
  sugar?: number
  fiber?: number

  // Energy fields
  energy_type?: 'mental' | 'physical' | 'balanced' | 'none'
  energy_score?: number

  // Metadata fields (JSON strings)
  tags?: string
  ingredients?: string
  nutrition_facts?: string
  allergens?: string

  // Template System Fields (purified)
  // Note: product_type, layout_mode, card_style are REMOVED from schema
  template_id?: string
  template_variant?: string
  is_template_dynamic?: number
  ui_config?: string

  // Pricing with Discounts
  old_price?: number
  // ❌ REMOVED: discount_percentage (calculated dynamically in frontend)
  // ❌ REMOVED: card_badge, card_badge_color (merged into ui_config - see schema.sql)

  // Health System Fields
  health_keywords?: string
  health_benefit_ar?: string
}

// ================================================================
// Nutrition Types
// ================================================================

export interface NutritionInfo {
  calories: number
  protein: number
  carbs: number
  fat: number
  sugar: number
  fiber: number
}

// ================================================================
// Container Types (Customer-facing response)
// ⚠️ NOTE: There is NO container_types table in schema.sql!
// Containers are stored as options in option_groups with id='containers'
// This type represents the TRANSFORMED response from backend
// ================================================================

export interface ContainerType {
  id: string
  name: string
  nameAr: string
  nameEn: string
  description?: string
  priceModifier: number  // Mapped from options.base_price
  image?: string
  maxSizes?: number      // Hardcoded in backend (default: 3)
  isDefault?: boolean    // First container is default
  nutrition: NutritionInfo
}

export interface ContainerAssignment {
  containerId: string
  isDefault: boolean
  container?: ContainerType
}

// ================================================================
// Size Types (Customer-facing response)
// ⚠️ NOTE: There is NO product_sizes table in schema.sql!
// Sizes are stored as options in option_groups with id='sizes'
// This type represents the TRANSFORMED response from backend
// ================================================================

export interface ProductSize {
  id: string
  name: string
  nameAr: string
  nameEn: string
  priceModifier: number       // Mapped from options.base_price
  nutritionMultiplier: number // Calculated in backend based on size id
  isDefault?: boolean         // First size is default
  containerId?: string        // Optional container filter
}

export interface SizeAssignment {
  sizeId: string
  isDefault: boolean
  priceOverride?: number | null
  available?: boolean
  size?: ProductSize
}

// ================================================================
// Option Group Assignment Types
// Matches schema.sql product_options table
// Note: Uses option_group_id (not group_id)
// 
// 📋 product_options columns (after Migration 0025):
// ┌─────────────────────────┬────────────────────────────────────────────┐
// │ Column                  │ Purpose                                    │
// ├─────────────────────────┼────────────────────────────────────────────┤
// │ product_id              │ FK to products.id                          │
// │ option_group_id         │ FK to option_groups.id                     │
// │ is_required             │ Is this group required for this product?   │
// │ min_selections          │ Minimum options customer must select       │
// │ max_selections          │ Maximum options customer can select        │
// │ price_override          │ Override option prices (NULL = base_price) │
// │ display_order           │ Order in product customization UI          │
// └─────────────────────────┴────────────────────────────────────────────┘
// 
// ❌ REMOVED columns (Migration 0025):
// - group_order (redundant with display_order)
// - is_required_override (not used by backend)
// - min_selections_override (not used by backend)
// - max_selections_override (not used by backend)
// ================================================================

export interface OptionGroupAssignment {
  /** The option group ID (from option_group_id column in database) */
  groupId: string
  isRequired: boolean
  minSelections: number
  maxSelections: number
  displayOrder: number
  /** Override option prices for this product (NULL = use base_price) */
  priceOverride?: number | null
  /** The option group details (populated by backend) */
  group?: OptionGroup
}

// ================================================================
// Customization Rule Type (Database Schema)
// Used for product_options relationship in Admin operations
// Note: Uses option_group_id as per unified options system
// ================================================================

export interface CustomizationRule {
  /** The option group ID (references option_groups.id via product_options.option_group_id) */
  option_group_id: string
  is_required?: boolean
  min_selections?: number
  max_selections?: number
  price_override?: number
  display_order?: number
}

// ================================================================
// Customization Option Type (Customer-facing)
// Option with price and nutrition for customer display
// ================================================================

export interface CustomizationOption {
  id: string
  name_ar: string
  name_en: string
  description_ar?: string
  description_en?: string
  base_price: number
  price: number  // Effective price (may include override)
  image?: string
  display_order: number
  nutrition: NutritionInfo
}

// ================================================================
// Customization Group Type (Customer-facing)
// Transformed response from /products/:id/configuration endpoint
// Note: Uses camelCase (groupId) as returned by backend
// ================================================================

export interface CustomizationGroup {
  /** The option group ID (camelCase as returned by backend) */
  groupId: string
  groupName: string
  groupDescription?: string
  groupIcon?: string
  isRequired: boolean
  minSelections: number
  maxSelections: number
  priceOverride?: number | null
  displayOrder: number
  options: CustomizationOption[]
}

// ================================================================
// Product Configuration Type
// Response from /products/:id/configuration endpoint
// ================================================================

export interface ProductConfiguration {
  product: {
    id: string
    name: string
    nameAr?: string
    nameEn?: string
    basePrice: number
    templateId: string  // Backend returns camelCase
    isCustomizable: boolean
    baseNutrition?: NutritionInfo
  }
  hasContainers: boolean
  containers: ContainerType[]
  hasSizes: boolean
  sizes: ProductSize[]
  hasCustomization: boolean
  /** Customer-facing customization groups with options */
  customizationRules: CustomizationGroup[]
}

// ================================================================
// Template Types
// ================================================================

export type TemplateId =
  | 'standard'
  | 'byo'
  | 'simple'
  | 'premium'
  | 'combo'
  | string  // Allow custom templates

export interface TemplateConfig {
  id: TemplateId
  name: string
  nameAr: string
  description?: string
  descriptionAr?: string
  recommendedOptionGroups?: number
  features?: string[]
}

// ================================================================
// UI Config Type (stored as JSON in products.ui_config)
// ================================================================

export interface ProductUIConfig {
  display_style?: 'grid' | 'list' | 'pills' | 'cards' | 'checkbox'
  columns?: 1 | 2 | 3 | 4
  card_size?: 'sm' | 'md' | 'lg'
  show_images?: boolean
  show_prices?: boolean
  show_macros?: boolean
  accent_color?: string
  icon?: {
    type: 'emoji' | 'lucide' | 'custom'
    value: string
    style?: 'solid' | 'gradient' | 'glow'
    animation?: 'none' | 'pulse' | 'bounce' | 'spin'
  }
  badge?: string
  badge_color?: string
  theme?: string
}

// ================================================================
// Helper function to parse ui_config JSON
// ================================================================

export function parseUIConfig(uiConfigString?: string): ProductUIConfig | null {
  if (!uiConfigString) return null
  try {
    return JSON.parse(uiConfigString) as ProductUIConfig
  } catch {
    return null
  }
}

// ================================================================
// Helper function to stringify ui_config
// ================================================================

export function stringifyUIConfig(config: ProductUIConfig): string {
  return JSON.stringify(config)
}
