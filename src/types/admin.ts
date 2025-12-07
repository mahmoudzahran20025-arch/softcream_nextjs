// ================================================================
// Admin Types - Unified Source of Truth
// All admin-specific types in one place
// Matches schema.sql exactly
// ================================================================

import type { UIConfig } from '@/lib/uiConfig'
import type { BaseProduct, NutritionInfo } from './products'

// Re-export base types for convenience
export type { BaseProduct, NutritionInfo }

// ================================================================
// Admin Option Types
// Matches schema.sql exactly
// ================================================================

/**
 * Admin Option - matches options table in schema.sql
 * Used in admin/options components
 */
export interface AdminOption {
  id: string
  group_id: string
  name_ar: string
  name_en: string
  description_ar?: string
  description_en?: string
  base_price: number
  image?: string
  available: number  // 0 or 1
  display_order: number
  // Nutrition (matches schema.sql)
  calories: number
  protein: number
  carbs: number
  fat: number
  sugar: number
  fiber: number
}

/**
 * Admin Option Group - matches option_groups table in schema.sql
 * Used in admin/options components
 */
export interface AdminOptionGroup {
  id: string
  name_ar: string
  name_en: string
  description_ar?: string
  description_en?: string
  display_style: 'cards' | 'pills' | 'list' | 'checkbox'
  display_order: number
  icon?: string
  ui_config?: string | UIConfig
  is_required: number  // 0 or 1
  min_selections: number
  max_selections: number
  options: AdminOption[]
}

// Type aliases for backward compatibility
export type Option = AdminOption
export type OptionGroup = AdminOptionGroup

// ================================================================
// Option Form Types
// ================================================================

/**
 * Form data for creating/editing option groups
 */
export interface OptionGroupFormData {
  id: string
  name_ar: string
  name_en: string
  description_ar?: string
  description_en?: string
  icon: string
  display_order: number
  ui_config?: UIConfig
}

/**
 * Form data for creating/editing options
 */
export interface OptionFormData {
  id: string
  group_id: string
  name_ar: string
  name_en: string
  description_ar?: string
  description_en?: string
  base_price: number
  image?: string
  display_order: number
  available: boolean
  // Nutrition fields
  calories: number
  protein: number
  carbs: number
  fat: number
  sugar: number
  fiber: number
}

// ================================================================
// Options Page State
// ================================================================

export interface OptionsPageState {
  optionGroups: OptionGroup[]
  isLoading: boolean
  searchQuery: string
  expandedGroups: Set<string>
  showGroupModal: boolean
  showOptionModal: boolean
  showDeleteModal: boolean
  editingGroup: OptionGroup | null
  editingOption: Option | null
  selectedGroupId: string | null
  deleteTarget: DeleteTarget | null
}

export interface DeleteTarget {
  type: 'group' | 'option'
  id: string
  name: string
  optionsCount?: number
  groupId?: string
}

// ================================================================
// Product Form Types
// ================================================================

/**
 * Product form data - unified for all product forms
 * Single source of truth for product editing
 */
export interface ProductFormData {
  id: string
  name: string
  nameEn: string
  category: string
  categoryEn: string
  price: string
  description: string
  descriptionEn: string
  image: string
  badge: string
  available: number
  // Template System
  template_id: string
  template_variant: string  // Priority 3: for template variations
  is_template_dynamic: number  // Priority 3: 0 or 1
  ui_config: string
  // Discount fields
  old_price: string
  // ❌ REMOVED: discount_percentage (calculated automatically in UI)
  // Nutrition fields
  calories: string
  protein: string
  carbs: string
  fat: string
  sugar: string
  fiber: string
  // Energy fields
  energy_type: string
  energy_score: string
  // Metadata fields (JSON strings)
  tags: string
  ingredients: string
  nutrition_facts: string
  allergens: string
  // Health-Driven Cart fields
  health_keywords: string[]
  health_benefit_ar: string
}

// ================================================================
// Option Group Assignment Types
// ================================================================

/**
 * Option group assignment for product customization
 * Used in UnifiedProductForm
 * 
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5 - Conditional Rules
 */
export interface OptionGroupAssignment {
  groupId: string
  isRequired: boolean
  minSelections: number
  maxSelections: number
  priceOverride?: number
  displayOrder: number
  /** Conditional max selections rules - JSON string or null */
  conditionalMaxSelections?: string | null
}

/**
 * Extended option group info for display in forms
 */
export interface OptionGroupInfo {
  id: string
  name?: string
  nameAr: string
  nameEn: string
  icon?: string
  defaultRequired?: boolean
  defaultMin?: number
  defaultMax?: number
  optionsCount: number
  ui_config?: UIConfig | any
  display_style?: string
  options?: Array<{
    id: string
    name: string
    name_ar: string
    name_en?: string
    price: number
    group_id: string
  }>
}

// ================================================================
// Container & Size Assignment Types
// ================================================================

export interface ContainerAssignment {
  containerId: string
  isDefault: boolean
}

export interface ContainerInfo {
  id: string
  name: string
  nameEn?: string
  price: number
  image?: string
}

export interface SizeAssignment {
  sizeId: string
  isDefault: boolean
}

export interface SizeInfo {
  id: string
  name: string
  nameEn?: string
  priceMultiplier: number
}

// ================================================================
// Unified Product Data
// ================================================================

/**
 * Complete unified product data for form submission
 */
export interface UnifiedProductData {
  product: ProductFormData
  optionGroupAssignments: OptionGroupAssignment[]
  containerAssignments: ContainerAssignment[]
  sizeAssignments: SizeAssignment[]
}

// ================================================================
// Form State Types
// ================================================================

export type FormTab = 'details' | 'template' | 'uiConfig' | 'optionGroups' | 'nutrition'

export interface FormState {
  activeTab: FormTab
  isDirty: boolean
  isSubmitting: boolean
  showValidationSummary: boolean
  showChangePreview: boolean
}

// ================================================================
// Change Tracking Types
// ================================================================

export interface OptionGroupChange {
  type: 'added' | 'removed' | 'modified'
  groupId: string
  groupName: string
  original?: OptionGroupAssignment
  current?: OptionGroupAssignment
  wasRequired?: boolean
}

export interface ContainerChange {
  type: 'added' | 'removed' | 'modified'
  containerId: string
  containerName: string
  original?: ContainerAssignment
  current?: ContainerAssignment
}

export interface SizeChange {
  type: 'added' | 'removed' | 'modified'
  sizeId: string
  sizeName: string
  original?: SizeAssignment
  current?: SizeAssignment
}

export interface ProductDetailChange {
  field: string
  fieldLabel: string
  originalValue: string | number
  currentValue: string | number
}

export interface ChangesSummary {
  hasChanges: boolean
  productChanges: ProductDetailChange[]
  optionGroupChanges: OptionGroupChange[]
  containerChanges: ContainerChange[]
  sizeChanges: SizeChange[]
  hasRequiredGroupRemoval: boolean
}

// ================================================================
// API Response Types
// ================================================================

export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface OptionGroupsResponse {
  success: boolean
  data: OptionGroup[]
}

// ================================================================
// Constants
// ================================================================

export const HEALTH_KEYWORDS_OPTIONS = {
  nutritional: [
    { value: 'high-protein', label: 'عالي البروتين', labelEn: 'High Protein' },
    { value: 'low-sugar', label: 'منخفض السكر', labelEn: 'Low Sugar' },
    { value: 'calcium', label: 'غني بالكالسيوم', labelEn: 'Rich in Calcium' },
    { value: 'fiber-rich', label: 'غني بالألياف', labelEn: 'Fiber Rich' },
    { value: 'probiotic', label: 'بروبيوتيك', labelEn: 'Probiotic' },
  ],
  lifestyle: [
    { value: 'energy-boost', label: 'يعزز الطاقة', labelEn: 'Energy Boost' },
    { value: 'indulgent', label: 'للاستمتاع', labelEn: 'Indulgent' },
    { value: 'balanced', label: 'متوازن', labelEn: 'Balanced' },
    { value: 'refreshing', label: 'منعش', labelEn: 'Refreshing' },
  ],
} as const

export const ICON_OPTIONS = [
  '🍦', '🍨', '🥤', '🧁', '🍰', '🍫', '🍓', '🍌',
  '🥜', '🍪', '🍩', '🧇', '🍯', '🥛', '☕', '🍵',
  '📦', '⭐', '✨', '💎', '🎁', '🏷️', '🔖', '📋',
]

// ================================================================
// Initial Values
// ================================================================

export const INITIAL_PRODUCT_FORM_DATA: ProductFormData = {
  id: '',
  name: '',
  nameEn: '',
  category: '',
  categoryEn: '',
  price: '',
  description: '',
  descriptionEn: '',
  image: '',
  badge: '',
  available: 1,
  template_id: 'template_1',
  template_variant: '',
  is_template_dynamic: 0,
  ui_config: '{}',
  old_price: '',
  // ❌ REMOVED: discount_percentage
  calories: '',
  protein: '',
  carbs: '',
  fat: '',
  sugar: '',
  fiber: '',
  energy_type: 'none',
  energy_score: '',
  tags: '',
  ingredients: '',
  nutrition_facts: '',
  allergens: '',
  health_keywords: [],
  health_benefit_ar: '',
}

export const INITIAL_OPTION_GROUP_FORM_DATA: OptionGroupFormData = {
  id: '',
  name_ar: '',
  name_en: '',
  description_ar: '',
  description_en: '',
  icon: '📦',
  display_order: 0,
  ui_config: {
    display_style: 'grid',
    columns: 3,
    card_size: 'md',
    show_images: true,
    show_prices: true,
    show_macros: false,
    accent_color: 'pink',
    icon: {
      type: 'emoji',
      value: '🍦',
      style: 'solid',
      animation: 'none',
    },
    layout: {
      spacing: 'normal',
      alignment: 'center',
    },
  },
}

export const INITIAL_OPTION_FORM_DATA: OptionFormData = {
  id: '',
  group_id: '',
  name_ar: '',
  name_en: '',
  description_ar: '',
  description_en: '',
  base_price: 0,
  image: '',
  display_order: 0,
  available: true,
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
  sugar: 0,
  fiber: 0,
}

export const INITIAL_UNIFIED_DATA: UnifiedProductData = {
  product: INITIAL_PRODUCT_FORM_DATA,
  optionGroupAssignments: [],
  containerAssignments: [],
  sizeAssignments: [],
}

export const INITIAL_FORM_STATE: FormState = {
  activeTab: 'details',
  isDirty: false,
  isSubmitting: false,
  showValidationSummary: false,
  showChangePreview: false,
}

export const EMPTY_CHANGES_SUMMARY: ChangesSummary = {
  hasChanges: false,
  productChanges: [],
  optionGroupChanges: [],
  containerChanges: [],
  sizeChanges: [],
  hasRequiredGroupRemoval: false,
}
