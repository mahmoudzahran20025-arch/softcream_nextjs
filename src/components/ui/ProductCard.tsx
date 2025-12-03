'use client'

import { getCategoryConfig } from '@/config/categories'
import {
  BYOProductCard,
  StandardProductCard,
  FeaturedProductCard,
  CompactProductCard,
  SimpleCard
} from './cards'

export interface Product {
  id: string
  name: string
  nameEn?: string
  price: number
  old_price?: number
  discount_percentage?: number
  image?: string
  category?: string
  product_type?: string
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

  // ✅ Template System Fields
  template_id?: string
  template_variant?: string
  is_template_dynamic?: number
  ui_config?: string
  card_style?: string
  card_badge?: string
  card_badge_color?: string

  // ✅ Layout Mode (fallback)
  layout_mode?: 'complex' | 'medium' | 'simple' | 'builder' | 'composer' | 'selector' | 'standard'
  options_preview?: any
}

interface ProductCardProps {
  product: Product
  onAddToCart?: (product: Product, quantity: number) => void
  forceCardType?: 'simple' | 'medium' | 'complex' | 'standard' | 'wizard' | 'compact' | 'featured' | 'byo'
}

/**
 * Smart ProductCard Component
 * ===========================
 * Automatically selects the appropriate card style based on template_id or layout_mode
 * 
 * Template/Layout Mode → Card Type Mapping:
 * - template_complex/complex/builder → ComplexCard (BYOProductCard - Premium BYO style)
 * - template_medium/medium/composer → MediumCard (StandardProductCard - Options preview)
 * - template_simple/simple/selector → SimpleCard (Quick add, minimal UI)
 * - forceCardType override → Custom card type
 * 
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5
 */
export default function ProductCard({ product, forceCardType, onAddToCart }: ProductCardProps) {
  // Determine card type from forceCardType (priority) or product properties
  const cardType = forceCardType ? normalizeCardType(forceCardType) : getCardTypeFromProduct(product)

  // Get category configuration for styling
  const categoryConfig = getCategoryConfig(product.category, product.product_type)

  // Render appropriate card based on cardType
  // Requirements 7.1: Automatically select correct card type based on template_id or layout_mode
  switch (cardType) {
    // SimpleCard - للمنتجات البسيطة (Requirements 1.1)
    case 'simple':
      return <SimpleCard product={product} config={categoryConfig} onAddToCart={onAddToCart} />

    // ComplexCard - للمنتجات المعقدة BYO (Requirements 3.1)
    case 'complex':
      return <BYOProductCard product={product} config={categoryConfig} />

    // Legacy cards (for backward compatibility)
    case 'featured':
      return <FeaturedProductCard product={product} config={categoryConfig} />

    case 'compact':
      return <CompactProductCard product={product} config={categoryConfig} />

    // MediumCard - للمنتجات المتوسطة (Requirements 2.1, 7.3 - default fallback)
    case 'medium':
    default:
      return <StandardProductCard product={product} config={categoryConfig} onAddToCart={onAddToCart} />
  }
}

/**
 * Normalize forceCardType to internal card type
 * Requirements 7.2: forceCardType prop overrides automatic selection
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
    case 'featured':
      return 'featured'
    case 'compact':
      return 'compact'
    default:
      return 'medium'
  }
}

// Internal card type union
export type CardType = 'simple' | 'medium' | 'complex' | 'featured' | 'compact'

/**
 * Determine card type from product properties
 * Priority: template_id → layout_mode → product_type → default (medium)
 * 
 * Template ID Mapping (Primary - from Backend):
 * - template_1 → simple (SimpleCard)
 * - template_2 → medium (StandardProductCard)
 * - template_3 → complex (BYOProductCard)
 * 
 * Legacy aliases kept for backward compatibility:
 * - template_simple, template_medium, template_complex
 * - selector, composer, builder (layout_mode values)
 * 
 * Requirements:
 * - 7.1: Automatically select correct card type based on template_id or layout_mode
 * - 7.3: Fallback to MediumCard when product lacks template_id and layout_mode
 */
export function getCardTypeFromProduct(product: Product): CardType {
  // ✅ Priority 1: template_id (Template System - highest priority)
  if (product.template_id) {
    switch (product.template_id) {
      // Primary IDs (from Backend)
      case 'template_1':
      case 'template_simple':  // Legacy alias
        return 'simple'

      case 'template_2':
      case 'template_medium':  // Legacy alias
        return 'medium'

      case 'template_3':
      case 'template_complex':  // Legacy alias
        return 'complex'
    }
  }

  // ✅ Priority 2: layout_mode (fallback for products without template_id)
  if (product.layout_mode) {
    switch (product.layout_mode) {
      case 'simple':
      case 'selector':  // Legacy alias
        return 'simple'

      case 'medium':
      case 'composer':  // Legacy alias
      case 'standard':  // Legacy alias
        return 'medium'

      case 'complex':
      case 'builder':  // Legacy alias
        return 'complex'
    }
  }

  // ✅ Priority 3: product_type (legacy fallback)
  const productType = product.product_type?.toLowerCase()

  if (productType === 'byo_ice_cream' || product.id.startsWith('byo_')) {
    return 'complex'
  }

  if (productType === 'dessert') {
    return 'featured'
  }

  // ✅ Requirements 7.3: Default fallback to MediumCard
  return 'medium'
}
