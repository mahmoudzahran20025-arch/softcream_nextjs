'use client'

import { getCategoryConfig, type CategoryConfig } from '@/config/categories'
import {
  BYOProductCard,
  StandardProductCard,
  FeaturedProductCard,
  CompactProductCard
} from './cards'

interface Product {
  id: string
  name: string
  nameEn?: string
  price: number
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
}

interface ProductCardProps {
  product: Product
  onAddToCart?: (product: Product, quantity: number) => void
  forceCardType?: 'standard' | 'byo' | 'featured' | 'compact'
}

/**
 * Smart ProductCard Component
 * ===========================
 * Automatically selects the appropriate card style based on product_type
 * 
 * Product Type → Card Type Mapping:
 * - byo_ice_cream → BYOProductCard
 * - preset_ice_cream → StandardProductCard (with customization)
 * - milkshake → StandardProductCard
 * - dessert → FeaturedProductCard
 * - standard → CompactProductCard
 */
export default function ProductCard({ product, forceCardType }: ProductCardProps) {
  // Determine card type from product_type (priority) or category (fallback)
  const cardType = forceCardType || getCardTypeFromProduct(product)
  
  // Get category configuration for styling
  const categoryConfig = getCategoryConfig(product.category, product.product_type)

  // Render appropriate card based on cardType
  switch (cardType) {
    case 'byo':
      return <BYOProductCard product={product} config={categoryConfig} />

    case 'featured':
      return <FeaturedProductCard product={product} config={categoryConfig} />

    case 'compact':
      return <CompactProductCard product={product} config={categoryConfig} />

    case 'standard':
    default:
      return <StandardProductCard product={product} config={categoryConfig} />
  }
}

/**
 * Determine card type from product properties
 */
function getCardTypeFromProduct(product: Product): CategoryConfig['cardType'] {
  const productType = product.product_type?.toLowerCase()
  
  // BYO products get special card
  if (productType === 'byo_ice_cream' || product.id.startsWith('byo_')) {
    return 'byo'
  }
  
  // Desserts get featured card
  if (productType === 'dessert') {
    return 'featured'
  }
  
  // Preset ice cream and milkshakes get standard card
  if (productType === 'preset_ice_cream' || productType === 'milkshake') {
    return 'standard'
  }
  
  // Standard products get compact card
  if (productType === 'standard') {
    return 'compact'
  }
  
  // Fallback to standard
  return 'standard'
}
