'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Palette, IceCream, ChevronLeft, Flame, Zap } from 'lucide-react'
import Image from 'next/image'
import { CategoryConfig } from '@/config/categories'
import { HealthBadges } from '../health'
import { parseHealthKeywords } from '@/lib/health/keywords'
import NutritionSwiper from '../common/NutritionSwiper'
import { UnavailableOverlay, DiscountBadge } from '../common'

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
  energy_score?: number
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

interface BYOProductCardProps {
  product: Product
  config?: CategoryConfig
  uiConfig?: UIConfig
  // NO onAddToCart - ComplexCard always navigates to product page
}

/**
 * BYOProductCard (ComplexCard) - بطاقة المنتجات المعقدة (BYO)
 * ============================================================
 * تصميم premium للمنتجات المعقدة مع gradient وanimations
 * 
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10, 3.11, 3.12
 * - 3.1: Render for layout_mode='complex' or template_id='template_complex'
 * - 3.2: Use premium gradient background (pink to purple)
 * - 3.3: Display large product image with hover animation (scale and rotate)
 * - 3.4: Display customization count badge with Sparkles icon
 * - 3.5: Show "صمم بنفسك" CTA button with Palette icon
 * - 3.6: Navigate to product page (NOT add to cart directly)
 * - 3.7: Apply glow effect and scale animation on hover
 * - 3.8: Display up to 3 Health Badges with overlay variant
 * - 3.9: Display "يبدأ من" price label with large typography
 * - 3.10: NO Quantity Selector (user must customize first)
 * - 3.11: Display floating animated icons (Sparkles, IceCream)
 * - 3.12: Display description as tagline below product name
 */
export default function BYOProductCard({ product, config: _config, uiConfig }: BYOProductCardProps) {
  void _config // Reserved for future use
  
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
  const [isHovered, setIsHovered] = useState(false)

  const isUnavailable = product.available === 0

  // Requirement 3.6: Navigate to product page (NOT add to cart)
  const handleClick = () => {
    if (!isUnavailable) {
      window.location.href = `/products/${product.id}`
    }
  }

  // Get customization count from options_preview
  const customizationCount = product.options_preview?.total_options || 20

  return (
    <motion.div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      whileHover={!isUnavailable ? { y: -8 } : undefined}
      whileTap={!isUnavailable ? { scale: 0.98 } : undefined}
      className={`relative ${isUnavailable ? 'cursor-not-allowed' : 'cursor-pointer'} group`}
      style={{ maxHeight: '340px' }}
    >
      {/* Main Card - Requirement 3.2: Gradient background (pink → purple) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#FF6B9D] via-[#FF5A8E] to-[#9C27B0] shadow-xl shadow-pink-500/25 hover:shadow-2xl hover:shadow-pink-500/40 transition-all duration-500">

        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-30">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
            className="absolute -top-1/2 -right-1/2 w-full h-full"
            style={{
              background: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }}
          />
        </div>

        {/* Requirement 3.11: Floating animated icons */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={isHovered ? { y: [-5, 5, -5], rotate: [0, 10, 0] } : {}}
            transition={{ repeat: Infinity, duration: 3 }}
            className="absolute top-4 right-4"
          >
            <Sparkles className="w-6 h-6 text-white/60" />
          </motion.div>
          <motion.div
            animate={isHovered ? { y: [5, -5, 5], rotate: [0, -10, 0] } : {}}
            transition={{ repeat: Infinity, duration: 2.5, delay: 0.5 }}
            className="absolute top-8 left-6"
          >
            <IceCream className="w-5 h-5 text-white/40" />
          </motion.div>
        </div>

        {/* Product Image - Requirement 3.3: Large image with hover animation */}
        <div className="relative aspect-[4/5] p-4">
          {product.image ? (
            <motion.div
              animate={isHovered && !isUnavailable ? { scale: 1.1, rotate: 3 } : { scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              className="relative w-full h-full"
            >
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-contain drop-shadow-2xl"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </motion.div>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <motion.span
                animate={isHovered && !isUnavailable ? { scale: 1.2, rotate: 10 } : {}}
                className={`text-8xl drop-shadow-lg ${getIconAnimationClass()}`}
              >
                {uiConfig?.icon?.value || '🍦'}
              </motion.span>
            </div>
          )}

          {/* Badges on Image - Energy + Calories */}
          <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
            {/* Calories Badge */}
            {product.calories && product.calories > 0 && (
              <div className="bg-white/95 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
                <Flame size={12} className="text-orange-500" />
                <span className="text-[10px] font-bold text-orange-600">
                  {product.calories}
                </span>
              </div>
            )}

            {/* Energy Badge */}
            {product.energy_score && product.energy_score > 0 && (
              <div className="bg-white/95 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
                <Zap size={12} className="text-amber-500" />
                <span className="text-[10px] font-bold text-amber-600">
                  {product.energy_score}
                </span>
              </div>
            )}
          </div>

          {/* Discount Badge - Bottom Left (Requirement 4.2) */}
          {product.discount_percentage && product.discount_percentage > 0 && (
            <div className="absolute bottom-2 left-2">
              <DiscountBadge discountPercentage={product.discount_percentage} size="sm" />
            </div>
          )}

          {/* Requirement 3.4: Customization count badge with Sparkles icon */}
          <div className="absolute bottom-2 right-2 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-full flex items-center gap-1 shadow-lg">
            <Sparkles size={12} className="text-purple-500" />
            <span className="text-[10px] font-bold text-purple-600">
              {customizationCount}+ خيار
            </span>
          </div>
        </div>

        {/* Unavailable Overlay - Requirement 4.3 */}
        {isUnavailable && <UnavailableOverlay variant="premium" />}

        {/* Content */}
        <div className="relative px-5 pb-5 text-white">
          {/* Product Name */}
          <h3 className="text-xl font-bold mb-1 drop-shadow-sm line-clamp-1">
            {product.name}
          </h3>

          {/* Requirement 3.12: Description as tagline */}
          <p className="text-white/80 text-sm mb-3 line-clamp-1">
            {product.description || 'صمم آيس كريمك الخاص بنكهاتك المفضلة'}
          </p>

          {/* Requirement 3.8: Health Badges (3 max) with overlay variant */}
          <div className="mb-3">
            {product.health_keywords ? (
              <HealthBadges
                keywords={parseHealthKeywords(product.health_keywords)}
                maxBadges={3}
                size="xs"
                variant="overlay"
              />
            ) : (
              <div className="flex flex-wrap gap-2">
                <span className="text-[11px] bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-full flex items-center gap-1">
                  <Palette className="w-3 h-3" />
                  تخصيص كامل
                </span>
                <span className="text-[11px] bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-full flex items-center gap-1">
                  <IceCream className="w-3 h-3" />
                  {customizationCount}+ نكهة
                </span>
              </div>
            )}
          </div>

          {/* NutritionSwiper - Rotating nutrition info */}
          {(product.calories || product.protein || product.energy_score) && (
            <div className="mb-3 bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1.5">
              <NutritionSwiper
                calories={product.calories}
                protein={product.protein}
                energyScore={product.energy_score}
                className="text-white [&_span]:text-white [&_svg]:text-white"
              />
            </div>
          )}

          {/* Requirement 3.9: "يبدأ من" price label with large typography */}
          {/* Requirement 4.2: Discount display with old price strikethrough */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-white/70 text-xs block">يبدأ من</span>
              <div className="flex items-center gap-2">
                <span className={`text-3xl font-bold ${product.old_price ? 'text-green-300' : ''}`}>
                  {product.price}
                  <span className="text-base mr-1 opacity-80">ج.م</span>
                </span>
                {/* Old Price with strikethrough */}
                {product.old_price && product.old_price > product.price && (
                  <span className="text-lg text-white/50 line-through">
                    {product.old_price}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Requirement 3.5: "صمم بنفسك" CTA button with Palette icon */}
          {/* Requirement 3.10: NO Quantity Selector */}
          <motion.button
            whileHover={!isUnavailable ? { scale: 1.02 } : undefined}
            whileTap={!isUnavailable ? { scale: 0.98 } : undefined}
            disabled={isUnavailable}
            className={`w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 shadow-lg transition-all group ${
              isUnavailable
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                : 'bg-white text-[#FF6B9D] hover:shadow-xl'
            }`}
          >
            <Palette className="w-5 h-5" />
            <span>صمم بنفسك</span>
            <ChevronLeft className={`w-4 h-4 transition-transform ${!isUnavailable ? 'group-hover:-translate-x-1' : ''}`} />
          </motion.button>
        </div>
      </div>

      {/* Requirement 3.7: Glow effect on hover */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered && !isUnavailable ? 0.6 : 0 }}
        className="absolute -inset-3 bg-gradient-to-r from-pink-500/30 to-purple-500/30 rounded-[2rem] blur-2xl -z-10"
      />
    </motion.div>
  )
}
