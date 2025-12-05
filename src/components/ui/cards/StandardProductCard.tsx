'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ShoppingCart, Check, Flame, Zap, Brain, Activity, ChevronLeft } from 'lucide-react'
import Image from 'next/image'
import { useCart } from '@/providers/CartProvider'
import { CategoryConfig } from '@/config/categories'
import QuantitySelector from '../common/QuantitySelector'
import PriceDisplay from '../common/PriceDisplay'
import NutritionSwiper from '../common/NutritionSwiper'
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
  protein?: number
  energy_type?: string
  energy_score?: number
  badge?: string
  health_keywords?: string
  available?: number
  layout_mode?: 'complex' | 'medium' | 'simple' | 'builder' | 'composer' | 'selector' | 'standard'
  template_id?: string
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

/**
 * UIConfig Interface - إعدادات العرض المتقدمة
 */
interface UIConfig {
  display_style?: 'cards' | 'buttons' | 'list' | 'grid'
  columns?: number
  card_size?: 'small' | 'medium' | 'large'
  show_images?: boolean
  show_prices?: boolean
  icon?: {
    type: 'emoji' | 'icon' | 'image'
    value: string
    animation?: 'none' | 'pulse' | 'bounce' | 'spin'
    style?: 'normal' | 'gradient' | 'glow'
  }
  badge?: string
  badge_color?: string
}

interface StandardProductCardProps {
  product: Product
  config?: CategoryConfig
  onAddToCart?: (product: Product, quantity: number) => void
  uiConfig?: UIConfig
}

/**
 * StandardProductCard (MediumCard) - بطاقة المنتجات المتوسطة
 * =========================================================
 * تصميم متوسط للمنتجات مع Options Preview و NutritionSwiper
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 2.10
 * - 2.1: Render for layout_mode='medium' or template_id='template_medium'
 * - 2.2: Display product image, name, price, and short description (max 2 lines)
 * - 2.3: Display up to 3 featured options as circular thumbnails with tooltip
 * - 2.4: Display up to 2 Health Badges with Lucide icons
 * - 2.5: Show "اعرف المزيد" button with ChevronLeft icon
 * - 2.6: Navigate to product detail page on click
 * - 2.7: Display energy badge with Lucide icon (Brain/Activity/Zap)
 * - 2.8: Include Quantity Selector with add to cart button
 * - 2.9: Display rotating Nutrition Swiper (calories, protein, energy)
 * - 2.10: Display description with elegant typography
 */
export default function StandardProductCard({ product, config, onAddToCart, uiConfig }: StandardProductCardProps) {
  const { addToCart } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)
  const [justAdded, setJustAdded] = useState(false)

  const isUnavailable = product.available === 0
  
  // Get icon animation class from uiConfig
  const getIconAnimationClass = () => {
    if (!uiConfig?.icon?.animation) return ''
    switch (uiConfig.icon.animation) {
      case 'pulse': return 'animate-pulse'
      case 'bounce': return 'animate-bounce'
      case 'spin': return 'animate-spin'
      default: return ''
    }
  }

  // Get energy type config for badge (Requirement 2.7)
  const getEnergyConfig = () => {
    switch (product.energy_type) {
      case 'mental':
        return {
          Icon: Brain,
          bgClass: 'bg-purple-100/95 dark:bg-purple-900/95',
          textClass: 'text-purple-700 dark:text-purple-300',
        }
      case 'physical':
        return {
          Icon: Activity,
          bgClass: 'bg-orange-100/95 dark:bg-orange-900/95',
          textClass: 'text-orange-700 dark:text-orange-300',
        }
      case 'balanced':
        return {
          Icon: Zap,
          bgClass: 'bg-green-100/95 dark:bg-green-900/95',
          textClass: 'text-green-700 dark:text-green-300',
        }
      default:
        return null
    }
  }

  const energyConfig = getEnergyConfig()

  const handleCardClick = () => {
    if (!isUnavailable) {
      window.location.href = `/products/${product.id}`
    }
  }

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

  const handleLearnMore = (e: React.MouseEvent) => {
    e.stopPropagation()
    window.location.href = `/products/${product.id}`
  }

  // Get featured options (max 3) - Requirement 2.3
  const featuredOptions = product.options_preview?.featured_options?.slice(0, 3) || []
  const remainingOptionsCount = (product.options_preview?.total_options || 0) - 3

  return (
    <motion.div
      whileHover={!isUnavailable ? { y: -3, scale: 1.01 } : undefined}
      whileTap={!isUnavailable ? { scale: 0.98 } : undefined}
      className={`relative ${isUnavailable ? 'opacity-60' : 'cursor-pointer'}`}
      style={{ maxHeight: '320px' }}
    >
      {/* Card Container - Glassmorphism */}
      <div
        onClick={handleCardClick}
        className="relative overflow-hidden rounded-2xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl shadow-sm hover:shadow-2xl hover:shadow-pink-500/10 transition-all duration-500 border border-white/50 dark:border-slate-700/50 group h-full flex flex-col"
      >
        {/* Image Container - 4:5 aspect ratio */}
        <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-br from-pink-50/50 to-rose-50/50 dark:from-slate-700/50 dark:to-slate-800/50">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className={`text-5xl ${getIconAnimationClass()}`}>
                {uiConfig?.icon?.value || config?.icon || '🍦'}
              </span>
            </div>
          )}

          {/* Top Badges Row - Energy + Calories */}
          <div className="absolute top-2 left-2 right-2 flex justify-between items-start z-10">
            {/* Energy Badge - Left (Requirement 2.7) */}
            {energyConfig && product.energy_score && product.energy_score > 0 && (
              <div className={`${energyConfig.bgClass} ${energyConfig.textClass} backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm border border-white/20`}>
                <energyConfig.Icon size={12} strokeWidth={2.5} />
                <span className="text-[10px] font-bold">{product.energy_score}</span>
              </div>
            )}

            {/* Calories Badge - Right */}
            {product.calories && (
              <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm mr-auto border border-white/20">
                <Flame size={12} className="text-orange-500" />
                <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400">
                  {product.calories}
                </span>
              </div>
            )}
          </div>

          {/* Product Badge - Bottom Right (supports ui_config.badge_color) */}
          {product.badge && (
            <div 
              className="absolute bottom-2 right-2 text-white px-2.5 py-1 rounded-full text-[10px] font-bold shadow-lg shadow-pink-500/20 z-10"
              style={{ 
                background: uiConfig?.badge_color 
                  ? uiConfig.badge_color 
                  : 'linear-gradient(to right, #FF6B9D, #FF5A8E)' 
              }}
            >
              {product.badge}
            </div>
          )}

          {/* Discount Badge - Bottom Left (Requirement 4.2) */}
          {product.discount_percentage && product.discount_percentage > 0 && (
            <div className="absolute bottom-2 left-2 z-10">
              <DiscountBadge discountPercentage={product.discount_percentage} size="sm" />
            </div>
          )}

          {/* Unavailable Overlay (Requirement 4.3) */}
          {isUnavailable && <UnavailableOverlay variant="default" />}
        </div>

        {/* Product Info */}
        <div className="p-4 flex-1 flex flex-col relative">
          {/* Name - Requirement 2.2 */}
          <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-1 mb-1 group-hover:text-[#FF6B9D] transition-colors">
            {product.name}
          </h3>

          {/* Description - Max 1 line (Requirement 2.10) */}
          {product.description && !product.options_preview?.featured_options?.length && (
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mb-2">
              {product.description}
            </p>
          )}

          {/* Options Preview - Max 3 circles (Requirement 2.3) */}
          {featuredOptions.length > 0 && (
            <div className="mb-2">
              <div className="flex -space-x-2 space-x-reverse overflow-hidden py-1">
                {featuredOptions.map((opt) => (
                  <div
                    key={opt.id}
                    className="relative w-7 h-7 rounded-full border-2 border-white dark:border-slate-800 bg-slate-100 dark:bg-slate-700 overflow-hidden shadow-sm hover:z-10 hover:scale-110 transition-transform duration-300"
                    title={opt.name}
                  >
                    {opt.image ? (
                      <Image
                        src={opt.image}
                        alt={opt.name}
                        fill
                        className="object-cover"
                        sizes="28px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[8px]">
                        🍦
                      </div>
                    )}
                  </div>
                ))}
                {remainingOptionsCount > 0 && (
                  <div className="relative w-7 h-7 rounded-full border-2 border-white dark:border-slate-800 bg-slate-200 dark:bg-slate-600 flex items-center justify-center text-[9px] font-bold text-slate-600 dark:text-slate-300 shadow-sm">
                    +{remainingOptionsCount}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Health Badges - Max 2 (Requirement 2.4) */}
          {product.health_keywords && (
            <div className="mb-2">
              <HealthBadges
                keywords={parseHealthKeywords(product.health_keywords)}
                maxBadges={2}
                size="xs"
              />
            </div>
          )}

          {/* Nutrition Swiper (Requirement 2.9) */}
          <NutritionSwiper
            calories={product.calories}
            protein={product.protein}
            energyScore={product.energy_score}
            className="mb-3"
          />

          {/* Price Row - Always Visible */}
          <div className="flex items-center gap-2 mt-auto">
            <PriceDisplay
              price={product.price}
              oldPrice={product.old_price}
              size="lg"
              className="text-[#FF6B9D]"
            />
          </div>

          {/* Controls - Reveal on Hover (Glass Effect) */}
          <div className="absolute inset-x-0 bottom-0 p-4 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-t border-white/20 dark:border-slate-700/30 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out flex flex-col gap-2 z-20">
            {/* Quantity Selector (Requirement 2.8) */}
            <div onClick={(e) => e.stopPropagation()}>
              <QuantitySelector
                quantity={quantity}
                onIncrease={() => setQuantity(quantity + 1)}
                onDecrease={() => setQuantity(Math.max(1, quantity - 1))}
                size="sm"
                disabled={isUnavailable}
                className="w-full bg-slate-50 dark:bg-slate-700/50"
              />
            </div>

            {/* Cart + Learn More Row */}
            <div className="flex items-center gap-2">
              {/* Cart Button */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleAddToCart}
                disabled={isAdding || isUnavailable}
                className={`flex-1 h-10 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-pink-500/20 ${justAdded
                    ? 'bg-emerald-500 text-white'
                    : isUnavailable
                      ? 'bg-slate-300 dark:bg-slate-600 text-slate-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-[#FF6B9D] to-[#FF5A8E] hover:from-[#FF5A8E] hover:to-[#FF4979] text-white'
                  }`}
                aria-label="إضافة إلى السلة"
              >
                {justAdded ? (
                  <>
                    <Check size={18} strokeWidth={3} />
                    <span className="text-xs font-bold">تمت الإضافة</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart size={18} strokeWidth={2.5} />
                    <span className="text-xs font-bold">إضافة</span>
                  </>
                )}
              </motion.button>

              {/* Learn More Button (Requirement 2.5) */}
              <button
                onClick={handleLearnMore}
                disabled={isUnavailable}
                className={`w-10 h-10 flex items-center justify-center rounded-xl border transition-all duration-300 ${isUnavailable
                    ? 'text-slate-400 border-slate-200 dark:border-slate-700 cursor-not-allowed'
                    : 'text-slate-400 hover:text-[#FF6B9D] border-slate-200 dark:border-slate-700 hover:border-[#FF6B9D] hover:bg-pink-50 dark:hover:bg-pink-950/30'
                  }`}
              >
                <ChevronLeft size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
