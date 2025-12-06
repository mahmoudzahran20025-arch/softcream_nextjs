'use client'

import { getCategoryConfig } from '@/config/categories'
import {
  BYOProductCard,
  StandardProductCard,
  SimpleCard
} from './cards'

/**
 * UIConfig Interface - إعدادات العرض المتقدمة
 * ============================================
 * يتم تخزينها كـ JSON في عمود ui_config
 * 
 * Requirements: 4.2, 4.3, 4.4, 4.5, 4.6, 5.1, 5.3, 5.4, 5.5
 */
export interface UIConfig {
  // إعدادات العرض
  display_style?: 'cards' | 'buttons' | 'list' | 'grid'
  columns?: number // 1-6
  card_size?: 'small' | 'medium' | 'large'
  show_images?: boolean
  show_prices?: boolean

  // إعدادات الأيقونة
  icon?: {
    type: 'emoji' | 'icon' | 'image'
    value: string
    animation?: 'none' | 'pulse' | 'bounce' | 'spin'
    style?: 'normal' | 'gradient' | 'glow'
  }

  // الشارة (مدمجة من card_badge)
  badge?: string
  badge_color?: string
}

/**
 * Parse ui_config from JSON string to UIConfig object
 * Returns empty object if parsing fails
 */
export function parseUIConfig(uiConfigStr?: string): UIConfig {
  if (!uiConfigStr) return {}
  try {
    return JSON.parse(uiConfigStr) as UIConfig
  } catch {
    console.warn('Failed to parse ui_config, using defaults')
    return {}
  }
}

export interface Product {
  id: string
  name: string
  nameEn?: string
  price: number
  old_price?: number
  discount_percentage?: number
  image?: string
  category?: string
  description?: string
  tags?: string
  ingredients?: string
  allergens?: string
  calories?: number
  protein?: number
  carbs?: number
  sugar?: number
  fat?: number
  fiber?: number
  energy_type?: string
  energy_score?: number
  badge?: string
  allowed_addons?: string
  is_customizable?: number

  // ✅ Template System Fields (النظام الموحد)
  template_id?: string
  template_variant?: string
  is_template_dynamic?: number
  ui_config?: string // JSON string - UIConfig

  // ✅ Options Preview
  options_preview?: {
    total_groups: number
    total_options: number
    featured_options: Array<{
      id: string
      name: string
      image?: string
    }>
  }
}

interface ProductCardProps {
  product: Product
  onAddToCart?: (product: Product, quantity: number) => void
  forceCardType?: 'simple' | 'medium' | 'complex' | 'standard' | 'wizard' | 'byo'
}

/**
 * Smart ProductCard Component
 * ===========================
 * Automatically selects the appropriate card style based on template_id ONLY
 * 
 * Template ID → Card Type Mapping:
 * - template_1 → SimpleCard (Quick add, minimal UI)
 * - template_2 → StandardProductCard (Options preview)
 * - template_3 → BYOProductCard (Premium BYO style)
 * - forceCardType override → Custom card type
 * 
 * ui_config Support:
 * - Reads display settings from product.ui_config
 * - Applies badge and badge_color from ui_config
 * 
 * Requirements: 9.1, 9.2, 9.3, 9.4
 */
export default function ProductCard({ product, forceCardType, onAddToCart }: ProductCardProps) {
  // Determine card type from forceCardType (priority) or template_id
  const cardType = forceCardType ? normalizeCardType(forceCardType) : getCardTypeFromProduct(product)

  // Get category configuration for styling
  const categoryConfig = getCategoryConfig(product.category)

  // Parse ui_config for display settings (Requirement 9.4)
  const uiConfig = parseUIConfig(product.ui_config)

  // Apply ui_config badge if product.badge is not set
  const productWithUIConfig = {
    ...product,
    badge: product.badge || uiConfig.badge,
  }

  // Render appropriate card based on cardType
  // Requirements 9.1, 9.2, 9.3: Automatically select correct card type based on template_id
  switch (cardType) {
    // SimpleCard - للمنتجات البسيطة (template_1)
    // Requirements 9.1: template_id='template_1' → SimpleCard
    case 'simple':
      return <SimpleCard product={productWithUIConfig} config={categoryConfig} onAddToCart={onAddToCart} uiConfig={uiConfig} />

    // ComplexCard - للمنتجات المعقدة BYO (template_3)
    // Requirements 9.3: template_id='template_3' → BYOProductCard
    case 'complex':
      return <BYOProductCard product={productWithUIConfig} config={categoryConfig} uiConfig={uiConfig} />

    // MediumCard - للمنتجات المتوسطة (template_2 - default fallback)
    // Requirements 9.2: template_id='template_2' → StandardCard
    case 'medium':
    default:
      return <StandardProductCard product={productWithUIConfig} config={categoryConfig} onAddToCart={onAddToCart} uiConfig={uiConfig} />
  }
}

/**
 * Normalize forceCardType to internal card type
 * ✅ Unified System: Only 3 card types (simple, medium, complex)
 */
function normalizeCardType(forceCardType: string): CardType {
  switch (forceCardType) {
    case 'simple':
      return 'simple'
    case 'medium':
    case 'standard':
      return 'medium'
    case 'complex':
    case 'wizard':
    case 'byo':
      return 'complex'
    default:
      return 'medium'
  }
}

// Internal card type union - ✅ Unified: Only 3 types
export type CardType = 'simple' | 'medium' | 'complex'

/**
 * Determine card type from product template_id
 * ============================================
 * ✅ Unified System: Uses template_id as SINGLE source of truth
 * ❌ NO fallback to layout_mode (removed)
 * ❌ NO fallback to product_type (removed)
 * 
 * Template ID → Card Type Mapping:
 * - template_1 → simple (SimpleCard)
 * - template_2 → medium (StandardProductCard) 
 * - template_3 → complex (BYOProductCard/WizardCard)
 * 
 * Requirements:
 * - 9.1: template_id='template_1' → SimpleCard
 * - 9.2: template_id='template_2' → StandardCard
 * - 9.3: template_id='template_3' → WizardCard
 */
export function getCardTypeFromProduct(product: Product): CardType {
  // ✅ Use template_id as SINGLE source of truth
  // ❌ NO fallback to layout_mode or product_type

  if (!product.template_id) {
    // Default to medium (StandardCard) when template_id is missing
    // This is a safe fallback per design document error handling
    console.warn(`Product ${product.id} lacks template_id, using default medium card`)
    return 'medium'
  }

  switch (product.template_id) {
    // template_1 → SimpleCard (منتجات بسيطة)
    case 'template_1':
      return 'simple'

    // template_2 → StandardCard (منتجات متوسطة)
    case 'template_2':
      return 'medium'

    // template_3 → BYOProductCard/WizardCard (منتجات BYO معقدة)
    case 'template_3':
      return 'complex'

    // template_lifestyle → StandardCard (معالج نمط الحياة)
    // Uses StandardCard for listing, opens LifestyleWizard in modal
    case 'template_lifestyle':
      return 'medium'

    default:
      // Unknown template_id - use medium as safe fallback
      console.warn(`Unknown template_id: ${product.template_id}, using default medium card`)
      return 'medium'
  }
}

