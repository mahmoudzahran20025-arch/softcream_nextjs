'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Palette, ChevronLeft, Flame, Zap } from 'lucide-react'
import Image from 'next/image'
import { CategoryConfig } from '@/config/categories'
import { HealthBadges } from '../health'
import { parseHealthKeywords } from '@/lib/health/keywords'
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
  template_id?: string
  options_preview?: {
    total_groups: number
    total_options: number
    featured_options: Array<{ id: string; name: string; image?: string }>
  }
}

interface UIConfig {
  icon?: { value: string; animation?: 'none' | 'pulse' | 'bounce' | 'spin' }
  badge?: string
  badge_color?: string
}

interface BYOProductCardProps {
  product: Product
  config?: CategoryConfig
  uiConfig?: UIConfig
}

/**
 * BYOProductCard - بطاقة المنتجات المعقدة (template_3)
 * تصميم موحد ومتماثل مع باقي الكاردات - مع لمسة premium
 */
export default function BYOProductCard({ product, config: _config, uiConfig }: BYOProductCardProps) {
  void _config
  const [isHovered, setIsHovered] = useState(false)
  const isUnavailable = product.available === 0
  const customizationCount = product.options_preview?.total_options || 20

  const discountPct = product.old_price && product.price && product.old_price > product.price
    ? Math.round(((product.old_price - product.price) / product.old_price) * 100)
    : (product.discount_percentage || 0)

  const handleClick = () => {
    if (!isUnavailable) window.location.href = `/products/${product.id}`
  }

  return (
    <motion.div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      whileHover={!isUnavailable ? { y: -4 } : undefined}
      whileTap={!isUnavailable ? { scale: 0.98 } : undefined}
      className={`relative w-full ${isUnavailable ? 'opacity-60' : 'cursor-pointer'}`}
    >
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-pink-50/50 to-slate-50 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 shadow-md hover:shadow-xl transition-shadow duration-300 border border-pink-100/50 dark:border-slate-600 h-full flex flex-col">
        
        {/* Image Section - Fixed aspect ratio */}
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-pink-100/30 to-rose-100/30 dark:from-slate-700 dark:to-slate-600 group">
          {product.image ? (
            <motion.div
              animate={isHovered && !isUnavailable ? { scale: 1.05 } : { scale: 1 }}
              transition={{ duration: 0.4 }}
              className="relative w-full h-full"
            >
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover"
                sizes="200px"
              />
            </motion.div>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-5xl">{uiConfig?.icon?.value || '🍦'}</span>
            </div>
          )}

          {/* Discount Badge - Top Left */}
          {discountPct > 0 && (
            <div className="absolute top-2 left-2 z-20">
              <DiscountBadge discountPercentage={discountPct} size="sm" />
            </div>
          )}

          {/* Nutrition Badges - Top Right */}
          <div className="absolute top-2 right-2 flex flex-col gap-1 z-10">
            {product.calories && product.calories > 0 && (
              <div className="bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm">
                <Flame size={10} className="text-orange-500" />
                <span className="text-[9px] font-bold text-orange-600">{product.calories}</span>
              </div>
            )}
            {product.energy_score && product.energy_score > 0 && (
              <div className="bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm">
                <Zap size={10} className="text-amber-500" />
                <span className="text-[9px] font-bold text-amber-600">{product.energy_score}</span>
              </div>
            )}
          </div>

          {/* Customization Badge - Bottom Right */}
          <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1 shadow-md z-10">
            <Sparkles size={12} className="text-[#FF6B9D]" />
            <span className="text-[10px] font-bold text-[#FF6B9D]">{customizationCount}+ خيار</span>
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
          <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 mb-1">
            {product.description || 'صمم آيس كريمك الخاص'}
          </p>

          {/* Health Tags */}
          {product.health_keywords && (
            <div className="mb-2">
              <HealthBadges keywords={parseHealthKeywords(product.health_keywords)} maxBadges={2} size="xs" />
            </div>
          )}

          {/* Price Row */}
          <div className="mt-auto flex items-center justify-between mb-2">
            <div>
              <span className="text-[9px] text-slate-400 block">يبدأ من</span>
              <div className="flex items-baseline gap-1">
                <span className={`text-base font-bold ${discountPct > 0 ? 'text-green-600' : 'text-[#FF6B9D]'}`}>
                  {product.price}<span className="text-[10px] text-slate-400 mr-0.5">ج.م</span>
                </span>
                {product.old_price && product.old_price > product.price && (
                  <span className="text-[10px] text-slate-400 line-through">{product.old_price}</span>
                )}
              </div>
            </div>
            <button className="text-[#FF6B9D] hover:text-[#FF5A8E] transition-colors">
              <ChevronLeft size={18} strokeWidth={2.5} />
            </button>
          </div>

          {/* CTA Button */}
          <motion.button
            whileTap={!isUnavailable ? { scale: 0.98 } : undefined}
            disabled={isUnavailable}
            className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
              isUnavailable
                ? 'bg-slate-200 text-slate-400'
                : 'bg-gradient-to-r from-[#FF6B9D] to-[#FF5A8E] text-white shadow-sm hover:shadow-md'
            }`}
          >
            <Palette size={14} />
            <span>صمم بنفسك</span>
          </motion.button>
        </div>
      </div>

      {/* Subtle Glow */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered && !isUnavailable ? 0.2 : 0 }}
        className="absolute -inset-1 bg-gradient-to-r from-pink-300/20 to-rose-300/20 rounded-2xl blur-lg -z-10"
      />
    </motion.div>
  )
}
