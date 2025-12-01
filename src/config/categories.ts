/**
 * Category Configuration System
 * =============================
 * Central configuration for all product categories
 * Controls: UI, Templates, Grid Layout, Behavior
 */

// ================================================================
// Types
// ================================================================

export type CardType = 'standard' | 'byo' | 'featured' | 'compact'
export type ModalTemplate = 'BYOTemplate' | 'PresetTemplate' | 'DessertTemplate' | 'MilkshakeTemplate' | 'StandardTemplate'
export type SortOption = 'price' | 'popularity' | 'name' | 'calories'

export interface GridColumns {
  mobile: number   // < 768px
  tablet: number   // 768px - 1024px
  desktop: number  // > 1024px
}

export interface CategoryConfig {
  // Identity
  id: string
  name_ar: string
  name_en: string
  description_ar?: string
  description_en?: string

  // Visual
  icon: string           // Emoji or icon name
  color: string          // Primary color (hex)
  gradient: string       // Tailwind gradient classes
  bgPattern?: string     // Optional background pattern

  // Card Configuration
  cardType: CardType
  gridColumns: GridColumns
  cardAspectRatio?: string  // e.g., '4/5', '1/1', '16/9'

  // Behavior
  showQuickAdd: boolean      // Show cart button on card
  showCustomizeButton: boolean
  showNutritionPreview: boolean
  showPriceRange: boolean    // "يبدأ من X ج.م" vs fixed price

  // Modal/Template
  modalTemplate: ModalTemplate
  requiresCustomization: boolean

  // Sorting & Display
  defaultSortBy: SortOption
  priority: number  // Display order (lower = first)

  // CTA (Call to Action)
  ctaText_ar: string
  ctaText_en: string
  ctaIcon?: string
}

// ================================================================
// Category Configurations
// ================================================================

export const CATEGORIES: Record<string, CategoryConfig> = {
  // ─────────────────────────────────────────────────────────────
  // Soft Serve (BYO - Custom Cup/Cone)
  // ─────────────────────────────────────────────────────────────
  soft_serve: {
    id: 'soft_serve',
    name_ar: 'سوفت سيرف',
    name_en: 'Soft Serve',
    description_ar: 'صمم آيس كريمك الخاص',
    description_en: 'Build your own ice cream',

    icon: '🍦',
    color: '#FF6B9D',
    gradient: 'from-pink-500 via-rose-500 to-pink-600',

    cardType: 'byo',
    gridColumns: { mobile: 1, tablet: 2, desktop: 2 },
    cardAspectRatio: '4/5',

    showQuickAdd: false,
    showCustomizeButton: true,
    showNutritionPreview: false,
    showPriceRange: true,

    modalTemplate: 'BYOTemplate',
    requiresCustomization: true,

    defaultSortBy: 'popularity',
    priority: 1,

    ctaText_ar: 'صمم بنفسك',
    ctaText_en: 'Build Your Own',
    ctaIcon: '🎨'
  },

  // ─────────────────────────────────────────────────────────────
  // Milkshake
  // ─────────────────────────────────────────────────────────────
  milkshake: {
    id: 'milkshake',
    name_ar: 'ميلك شيك',
    name_en: 'Milkshake',
    description_ar: 'ميلك شيك طازج ولذيذ',
    description_en: 'Fresh & delicious milkshakes',

    icon: '🥤',
    color: '#F59E0B',
    gradient: 'from-amber-400 via-orange-500 to-amber-600',

    cardType: 'standard',
    gridColumns: { mobile: 2, tablet: 3, desktop: 4 },
    cardAspectRatio: '4/5',

    showQuickAdd: true,
    showCustomizeButton: true,
    showNutritionPreview: true,
    showPriceRange: false,

    modalTemplate: 'MilkshakeTemplate',
    requiresCustomization: false,

    defaultSortBy: 'popularity',
    priority: 2,

    ctaText_ar: 'أضف للسلة',
    ctaText_en: 'Add to Cart',
    ctaIcon: '🛒'
  },

  // ─────────────────────────────────────────────────────────────
  // Dessert
  // ─────────────────────────────────────────────────────────────
  dessert: {
    id: 'dessert',
    name_ar: 'حلويات',
    name_en: 'Desserts',
    description_ar: 'حلويات شهية مع الآيس كريم',
    description_en: 'Delicious desserts with ice cream',

    icon: '🍰',
    color: '#8B5CF6',
    gradient: 'from-purple-500 via-violet-500 to-purple-600',

    cardType: 'featured',
    gridColumns: { mobile: 2, tablet: 2, desktop: 3 },
    cardAspectRatio: '4/5',

    showQuickAdd: true,
    showCustomizeButton: true,
    showNutritionPreview: true,
    showPriceRange: false,

    modalTemplate: 'DessertTemplate',
    requiresCustomization: false,

    defaultSortBy: 'popularity',
    priority: 3,

    ctaText_ar: 'اطلب الآن',
    ctaText_en: 'Order Now',
    ctaIcon: '✨'
  },

  // ─────────────────────────────────────────────────────────────
  // Preset Flavors
  // ─────────────────────────────────────────────────────────────
  preset: {
    id: 'preset',
    name_ar: 'نكهات جاهزة',
    name_en: 'Preset Flavors',
    description_ar: 'نكهات مميزة جاهزة للطلب',
    description_en: 'Ready-to-order signature flavors',

    icon: '⭐',
    color: '#06B6D4',
    gradient: 'from-cyan-500 via-teal-500 to-cyan-600',

    cardType: 'compact',
    gridColumns: { mobile: 2, tablet: 3, desktop: 4 },
    cardAspectRatio: '1/1',

    showQuickAdd: true,
    showCustomizeButton: false,
    showNutritionPreview: false,
    showPriceRange: false,

    modalTemplate: 'PresetTemplate',
    requiresCustomization: false,

    defaultSortBy: 'name',
    priority: 4,

    ctaText_ar: 'أضف للسلة',
    ctaText_en: 'Add to Cart',
    ctaIcon: '🛒'
  }
}

// ================================================================
// Helper Functions
// ================================================================

/**
 * Get category configuration by product_type or category name
 * Priority: product_type > category name matching > fallback
 */
export function getCategoryConfig(
  categoryOrType: string | undefined,
  productType?: string
): CategoryConfig {
  // ─────────────────────────────────────────────────────────────
  // Priority 1: Use product_type from backend (most reliable)
  // ─────────────────────────────────────────────────────────────
  if (productType) {
    const typeMap: Record<string, CategoryConfig> = {
      byo: CATEGORIES.soft_serve,
      soft_serve: CATEGORIES.soft_serve,
      preset: CATEGORIES.preset,
      milkshake: CATEGORIES.milkshake,
      dessert: CATEGORIES.dessert,
      standard: CATEGORIES.milkshake
    }
    if (typeMap[productType]) {
      return typeMap[productType]
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Priority 2: Match by category name
  // ─────────────────────────────────────────────────────────────
  if (!categoryOrType) return CATEGORIES.milkshake

  const normalized = categoryOrType.toLowerCase().replace(/[\s-]/g, '_')

  // Direct match
  if (CATEGORIES[normalized]) {
    return CATEGORIES[normalized]
  }

  // Soft Serve / BYO
  if (
    categoryOrType.includes('سوفت') ||
    categoryOrType.includes('سيرف') ||
    categoryOrType.includes('كاستم') ||
    categoryOrType.includes('مخصص') ||
    categoryOrType.includes('Custom') ||
    normalized.includes('soft') ||
    normalized.includes('serve') ||
    normalized.includes('cup') ||
    normalized.includes('cone') ||
    normalized.includes('custom') ||
    normalized.includes('byo')
  ) {
    return CATEGORIES.soft_serve
  }

  // Milkshake
  if (
    categoryOrType.includes('ميلك') ||
    categoryOrType.includes('شيك') ||
    normalized.includes('milk') ||
    normalized.includes('shake')
  ) {
    return CATEGORIES.milkshake
  }

  // Dessert
  if (
    categoryOrType.includes('حلويات') ||
    categoryOrType.includes('براوني') ||
    categoryOrType.includes('وافل') ||
    categoryOrType.includes('كيك') ||
    normalized.includes('dessert') ||
    normalized.includes('sweet') ||
    normalized.includes('brownie') ||
    normalized.includes('waffle') ||
    normalized.includes('cake')
  ) {
    return CATEGORIES.dessert
  }

  // Preset Flavors
  if (
    categoryOrType.includes('جاهز') ||
    categoryOrType.includes('نكهات') ||
    categoryOrType.includes('كلاسيك') ||
    normalized.includes('preset') ||
    normalized.includes('flavor') ||
    normalized.includes('classic')
  ) {
    return CATEGORIES.preset
  }

  // Default fallback
  return CATEGORIES.milkshake
}

/**
 * Get category config from product object
 * Uses product_type if available, falls back to category
 */
export function getProductCategoryConfig(product: {
  category?: string
  product_type?: string
  has_containers?: boolean | number
  has_customization?: boolean | number
}): CategoryConfig {
  // If product has containers or customization, it's BYO
  if (product.has_containers || product.has_customization) {
    return CATEGORIES.soft_serve
  }

  return getCategoryConfig(product.category, product.product_type)
}

/**
 * Get all categories sorted by priority
 */
export function getSortedCategories(): CategoryConfig[] {
  return Object.values(CATEGORIES).sort((a, b) => a.priority - b.priority)
}

/**
 * Get grid class for a category
 */
export function getGridClass(categoryId: string): string {
  const config = getCategoryConfig(categoryId)
  return `grid-cols-${config.gridColumns.mobile} md:grid-cols-${config.gridColumns.tablet} lg:grid-cols-${config.gridColumns.desktop}`
}

/**
 * Check if category requires customization before adding to cart
 */
export function requiresCustomization(categoryId: string): boolean {
  return getCategoryConfig(categoryId).requiresCustomization
}

/**
 * Get complementary categories for recommendations
 */
export function getComplementaryCategories(categoryId: string): string[] {
  const map: Record<string, string[]> = {
    soft_serve: ['dessert', 'milkshake'],
    milkshake: ['soft_serve', 'dessert'],
    dessert: ['soft_serve', 'milkshake'],
    preset: ['soft_serve', 'dessert']
  }
  return map[categoryId] || ['soft_serve', 'dessert']
}

/**
 * Get category color as CSS variable or hex
 */
export function getCategoryColor(categoryId: string): string {
  return getCategoryConfig(categoryId).color
}

/**
 * Check if product is BYO type
 */
export function isBYOCategory(categoryId: string | undefined): boolean {
  if (!categoryId) return false
  const config = getCategoryConfig(categoryId)
  return config.cardType === 'byo' || config.requiresCustomization
}
