'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ShoppingCart, Check, Flame, Zap, Brain, Activity, ChevronLeft } from 'lucide-react'
import Image from 'next/image'
import { useCart } from '@/providers/CartProvider'
import { CategoryConfig } from '@/config/categories'
import QuantitySelector from '../common/QuantitySelector'
import NutritionSwiper from '../common/NutritionSwiper'
import { UnavailableOverlay, DiscountBadge } from '../common'
import { HealthBadges } from '../health'
import { parseHealthKeywords } from '@/lib/health/keywords'

import type { Product } from '@/lib/api'
import type { ProductUIConfig } from '@/types/products'
import DynamicIcon from '../DynamicIcon'

/**
 * Badge Component - Displays ui_config badge with custom color
 * Requirements: 4.1, 4.2
 */
function ProductBadge({ badge, badgeColor }: { badge: string; badgeColor?: string }) {
  const defaultColor = '#FF6B9D'
  const bgColor = badgeColor || defaultColor

  return (
    <div
      className="absolute top-2 left-2 z-20 px-2 py-0.5 rounded-full text-white text-[10px] font-bold shadow-sm"
      style={{ backgroundColor: bgColor }}
    >
      {badge}
    </div>
  )
}

interface StandardProductCardProps {
  product: Product
  config?: CategoryConfig
  onAddToCart?: (product: Product, quantity: number) => void
  uiConfig?: ProductUIConfig
}

/**
 * StandardProductCard - بطاقة المنتجات المتوسطة (template_2)
 * تصميم موحد ومتماثل مع باقي الكاردات
 */
export default function StandardProductCard({ product, config, onAddToCart, uiConfig }: StandardProductCardProps) {
  const { addToCart } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)
  const [justAdded, setJustAdded] = useState(false)

  const isUnavailable = product.available === 0

  // Calculate discount percentage if old_price exists
  const discountPct = product.old_price && product.price && product.old_price > product.price
    ? Math.round(((product.old_price - product.price) / product.old_price) * 100)
    : 0

  // UI Config Visibility Flags (Default to true if undefined)
  const showImages = uiConfig?.show_images !== false
  const showPrices = uiConfig?.show_prices !== false

  const getEnergyConfig = () => {
    switch (product.energy_type) {
      case 'mental': return { Icon: Brain, color: 'text-purple-500' }
      case 'physical': return { Icon: Activity, color: 'text-orange-500' }
      case 'balanced': return { Icon: Zap, color: 'text-green-500' }
      default: return null
    }
  }
  const energyConfig = getEnergyConfig()

  const featuredOptions: Array<{ id: string; name: string; image?: string }> = product.options_preview?.featured_options?.slice(0, 3) || []
  const remainingCount = (product.options_preview?.total_options || 0) - 3

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isUnavailable) return
    setIsAdding(true)
    if (onAddToCart) onAddToCart(product, quantity)
    else addToCart(product, quantity)
    setJustAdded(true)
    setQuantity(1)
    setTimeout(() => { setJustAdded(false); setIsAdding(false) }, 1500)
  }

  const handleCardClick = () => {
    if (!isUnavailable) window.location.href = `/products/${product.id}`
  }

  return (
    <motion.div
      whileHover={!isUnavailable ? { y: -4 } : undefined}
      whileTap={!isUnavailable ? { scale: 0.98 } : undefined}
      className={`relative w-full ${isUnavailable ? 'opacity-60' : 'cursor-pointer'}`}
    >
      <div
        onClick={handleCardClick}
        className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800 shadow-md hover:shadow-xl transition-shadow duration-300 border border-slate-100 dark:border-slate-700 h-full flex flex-col"
      >
        {/* Image Section - Fixed aspect ratio */}
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-pink-50 to-rose-50 dark:from-slate-700 dark:to-slate-800 group">
          {product.image && showImages ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="200px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              {uiConfig?.icon ? (
                <DynamicIcon config={uiConfig.icon} size={48} />
              ) : (
                <span className="text-5xl">{config?.icon || '🍦'}</span>
              )}
            </div>
          )}

          {/* Discount Badge - Top Left (priority over ui_config badge) */}
          {discountPct > 0 ? (
            <div className="absolute top-2 left-2 z-20">
              <DiscountBadge discountPercentage={discountPct} size="sm" />
            </div>
          ) : uiConfig?.badge ? (
            /* UI Config Badge - Requirements 4.1, 4.2 */
            <ProductBadge badge={uiConfig.badge} badgeColor={uiConfig.badge_color} />
          ) : null}

          {/* Nutrition Badges - Top Right */}
          <div className="absolute top-2 right-2 flex flex-col gap-1 z-10">
            {product.calories && (
              <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm">
                <Flame size={10} className="text-orange-500" />
                <span className="text-[9px] font-bold text-orange-600 dark:text-orange-400">{product.calories}</span>
              </div>
            )}
            {energyConfig && product.energy_score && product.energy_score > 0 && (
              <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm">
                <energyConfig.Icon size={10} className={energyConfig.color} />
                <span className="text-[9px] font-bold text-slate-600 dark:text-slate-400">{product.energy_score}</span>
              </div>
            )}
          </div>

          {isUnavailable && <UnavailableOverlay variant="default" />}
        </div>

        {/* Content Section - Fixed padding */}
        <div className="p-3 flex-1 flex flex-col min-h-[140px]">
          {/* Name */}
          <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1 mb-1">
            {product.name}
          </h3>

          {/* Description */}
          {product.description && (
            <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 mb-1">
              {product.description}
            </p>
          )}

          {/* Options Preview */}
          {featuredOptions.length > 0 && (
            <div className="flex -space-x-1.5 space-x-reverse mb-1">
              {featuredOptions.map((opt) => (
                <div key={opt.id} className="w-5 h-5 rounded-full border border-white dark:border-slate-800 bg-slate-100 dark:bg-slate-700 overflow-hidden" title={opt.name}>
                  {opt.image ? <Image src={opt.image} alt={opt.name} fill className="object-cover" sizes="20px" /> : <span className="text-[6px]">🍦</span>}
                </div>
              ))}
              {remainingCount > 0 && (
                <div className="w-5 h-5 rounded-full border border-white dark:border-slate-800 bg-slate-200 dark:bg-slate-600 flex items-center justify-center text-[7px] font-bold text-slate-500">+{remainingCount}</div>
              )}
            </div>
          )}

          {/* Nutrition Swiper */}
          <NutritionSwiper calories={product.calories} protein={product.protein} energyScore={product.energy_score} className="mb-1" />

          {/* Health Tags */}
          {product.health_keywords && (
            <div className="mb-2">
              <HealthBadges keywords={parseHealthKeywords(product.health_keywords)} maxBadges={2} size="xs" />
            </div>
          )}

          {/* Price Row */}
          {showPrices && (
            <div className="mt-auto flex items-center justify-between mb-2">
              <div className="flex items-baseline gap-1">
                <span className={`text-base font-bold ${discountPct > 0 ? 'text-green-600' : 'text-[#FF6B9D]'}`}>
                  {product.price}<span className="text-[10px] text-slate-400 mr-0.5">ج.م</span>
                </span>
                {product.old_price && product.old_price > product.price && (
                  <span className="text-[10px] text-slate-400 line-through">{product.old_price}</span>
                )}
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); handleCardClick() }}
                className="text-[#FF6B9D] hover:text-[#FF5A8E] transition-colors"
              >
                <ChevronLeft size={18} strokeWidth={2.5} />
              </button>
            </div>
          )}

          {/* Action Bar */}
          <div className="flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleAddToCart}
              disabled={isAdding || isUnavailable}
              className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${justAdded ? 'bg-emerald-500 text-white' :
                isUnavailable ? 'bg-slate-200 text-slate-400' :
                  'bg-gradient-to-r from-[#FF6B9D] to-[#FF5A8E] text-white shadow-sm'
                }`}
            >
              {justAdded ? <Check size={18} /> : <ShoppingCart size={18} />}
            </motion.button>
            <div onClick={(e) => e.stopPropagation()} className="flex-1">
              <QuantitySelector
                quantity={quantity}
                onIncrease={() => setQuantity(Math.min(5, quantity + 1))}
                onDecrease={() => setQuantity(Math.max(1, quantity - 1))}
                min={1} max={5} size="sm" disabled={isUnavailable}
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
