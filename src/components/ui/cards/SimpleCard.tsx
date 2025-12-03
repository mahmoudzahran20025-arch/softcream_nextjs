'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ShoppingCart, Check, Flame, Zap } from 'lucide-react'
import Image from 'next/image'
import { useCart } from '@/providers/CartProvider'
import { CategoryConfig } from '@/config/categories'
import QuantitySelector from '../common/QuantitySelector'
import { UnavailableOverlay, DiscountBadge } from '../common'
import { HealthBadges } from '../health'
import { parseHealthKeywords } from '@/lib/health/keywords'

interface Product {
  id: string
  name: string
  nameEn?: string
  price: number
  old_price?: number
  discount_percentage?: number
  image?: string
  description?: string
  calories?: number
  energy_score?: number
  badge?: string
  health_keywords?: string
  available?: number
  layout_mode?: 'complex' | 'medium' | 'simple' | 'builder' | 'composer' | 'selector' | 'standard'
  template_id?: string
}

interface SimpleCardProps {
  product: Product
  config?: CategoryConfig
  onAddToCart?: (product: Product, quantity: number) => void
}

/**
 * SimpleCard - بطاقة المنتجات البسيطة
 * =====================================
 * تصميم مصغر للمنتجات البسيطة مع Quick Add
 * 
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8
 * - 1.1: Render for layout_mode='simple' or template_id='template_simple'
 * - 1.2: Display product image, name, and price only
 * - 1.3: Show Quick Add button overlay with ShoppingCart icon on hover
 * - 1.4: Add product to cart without opening modal
 * - 1.5: Use compact dimensions (max-height: 280px)
 * - 1.6: Display calorie badge with Flame icon on image
 * - 1.7: Include inline Quantity Selector (1-5 range)
 * - 1.8: Display badge with gradient background
 */
export default function SimpleCard({ product, config, onAddToCart }: SimpleCardProps) {
  const { addToCart } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)
  const [justAdded, setJustAdded] = useState(false)

  const isUnavailable = product.available === 0

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isUnavailable) return
    
    setIsAdding(true)
    try {
      if (onAddToCart) {
        onAddToCart(product, quantity)
      } else {
        addToCart(product, quantity)
      }
      setJustAdded(true)
      setQuantity(1)
      setTimeout(() => setJustAdded(false), 1500)
    } finally {
      setIsAdding(false)
    }
  }

  const handleCardClick = () => {
    if (!isUnavailable) {
      window.location.href = `/products/${product.id}`
    }
  }

  return (
    <motion.div
      whileHover={!isUnavailable ? { y: -2, scale: 1.01 } : undefined}
      whileTap={!isUnavailable ? { scale: 0.98 } : undefined}
      className={`relative ${isUnavailable ? 'opacity-60' : 'cursor-pointer'}`}
      style={{ maxHeight: '280px' }}
    >
      {/* Card Container */}
      <div 
        onClick={handleCardClick}
        className="relative overflow-hidden rounded-xl bg-white dark:bg-slate-800 shadow-md hover:shadow-lg transition-all duration-200 border border-slate-100 dark:border-slate-700 h-full flex flex-col"
      >
        {/* Square Image Container */}
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-pink-50 to-rose-50 dark:from-slate-700 dark:to-slate-800 group">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-300"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-4xl">{config?.icon || '🍦'}</span>
            </div>
          )}

          {/* Badges Container - Top */}
          <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
            {/* Calories Badge - Left */}
            {product.calories && (
              <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
                <Flame size={12} className="text-orange-500" />
                <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400">
                  {product.calories}
                </span>
              </div>
            )}

            {/* Energy Badge - Right (if no calories, show on left) */}
            {product.energy_score && product.energy_score > 0 && (
              <div className={`bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1 shadow-sm ${!product.calories ? '' : ''}`}>
                <Zap size={12} className="text-amber-500" />
                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
                  {product.energy_score}
                </span>
              </div>
            )}
          </div>

          {/* Product Badge - Bottom Right */}
          {product.badge && (
            <div className="absolute bottom-2 right-2 bg-gradient-to-r from-[#FF6B9D] to-[#FF5A8E] text-white px-2 py-0.5 rounded-full text-[10px] font-bold shadow-lg">
              {product.badge}
            </div>
          )}

          {/* Quick Add Overlay on Hover */}
          <motion.div
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-center pb-3 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleAddToCart}
              disabled={isAdding || isUnavailable}
              className={`px-4 py-2 rounded-full font-bold text-xs flex items-center gap-1.5 shadow-lg transition-all ${
                justAdded
                  ? 'bg-green-500 text-white'
                  : 'bg-white text-slate-800 hover:bg-[#FF6B9D] hover:text-white'
              }`}
            >
              {justAdded ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>تمت الإضافة</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>أضف للسلة</span>
                </>
              )}
            </motion.button>
          </motion.div>

          {/* Discount Badge - Bottom Left (Requirement 4.2) */}
          {product.discount_percentage && product.discount_percentage > 0 && (
            <div className="absolute bottom-2 left-2">
              <DiscountBadge discountPercentage={product.discount_percentage} size="sm" />
            </div>
          )}

          {/* Unavailable Overlay (Requirement 4.3) */}
          {isUnavailable && <UnavailableOverlay variant="default" />}
        </div>

        {/* Product Info */}
        <div className="p-3 flex-1 flex flex-col">
          {/* Name - Single Line */}
          <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1 mb-1">
            {product.name}
          </h3>

          {/* Health Badge - Max 1 */}
          {product.health_keywords && (
            <div className="mb-2">
              <HealthBadges
                keywords={parseHealthKeywords(product.health_keywords)}
                maxBadges={1}
                size="xs"
              />
            </div>
          )}

          {/* Price + Quantity Row */}
          <div className="mt-auto flex items-center justify-between gap-2">
            {/* Price with discount support (Requirement 4.2) */}
            <div className="flex items-center gap-1.5">
              <div className="flex items-baseline gap-0.5">
                <span className={`text-base font-bold ${product.old_price ? 'text-green-600 dark:text-green-400' : 'text-[#FF6B9D]'}`}>
                  {product.price}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                  ج.م
                </span>
              </div>
              {/* Old Price with strikethrough */}
              {product.old_price && product.old_price > product.price && (
                <span className="text-[10px] text-slate-400 dark:text-slate-500 line-through">
                  {product.old_price}
                </span>
              )}
            </div>

            {/* Quantity Selector (1-5) */}
            <div onClick={(e) => e.stopPropagation()} className="flex-shrink-0">
              <QuantitySelector
                quantity={quantity}
                onIncrease={() => setQuantity(Math.min(5, quantity + 1))}
                onDecrease={() => setQuantity(Math.max(1, quantity - 1))}
                min={1}
                max={5}
                size="sm"
                disabled={isUnavailable}
              />
            </div>
          </div>

          {/* Quick Add Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleAddToCart}
            disabled={isAdding || isUnavailable}
            className={`mt-2 w-full py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md hover:shadow-lg ${
              justAdded
                ? 'bg-emerald-500 text-white'
                : isUnavailable
                ? 'bg-slate-300 dark:bg-slate-600 text-slate-500 dark:text-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-[#FF6B9D] to-[#FF5A8E] hover:from-[#FF5A8E] hover:to-[#FF4979] text-white'
            }`}
          >
            {justAdded ? (
              <>
                <Check className="w-4 h-4" />
                <span>تمت الإضافة</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                <span>أضف للسلة</span>
              </>
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}
