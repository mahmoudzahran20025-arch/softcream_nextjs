'use client'

import { useState } from 'react'
import { Sparkles, Star, ChevronDown, ChevronUp, Tag } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import PriceDisplay from '@/components/ui/common/PriceDisplay'
import { DiscountBadge } from '@/components/ui/common'
import { HealthBadges } from '@/components/ui/health'
import { parseHealthKeywords } from '@/lib/health/keywords'

interface Product {
  id: string
  name: string
  nameEn?: string
  price: number
  old_price?: number  // ✅ NEW: for discount display
  description?: string
  energy_score?: number
  category?: string
  rating?: number
  reviewCount?: number
  health_keywords?: string
}

interface ProductHeaderProps {
  product: Product
  displayPrice?: number
}

export default function ProductHeader({ product, displayPrice }: ProductHeaderProps) {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)

  // Check if description is long enough to need expansion
  const descriptionLength = product.description?.length || 0
  const needsExpansion = descriptionLength > 120

  // ✅ Calculate discount percentage
  const discountPct = product.old_price && product.old_price > product.price
    ? Math.round(((product.old_price - product.price) / product.old_price) * 100)
    : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="space-y-3"
    >
      {/* Quick Info Bar - Category & Rating */}
      <div className="flex items-center justify-between gap-2">
        {/* Category Badge */}
        {product.category && (
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-pink-50 dark:bg-pink-950/30 text-pink-600 dark:text-pink-400 rounded-lg text-xs font-medium"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-pink-500" />
            {product.category}
          </motion.span>
        )}

        {/* Rating */}
        {product.rating && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-1 text-sm"
          >
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span className="font-bold text-slate-900 dark:text-white">{product.rating}</span>
            {product.reviewCount && (
              <span className="text-slate-400 dark:text-slate-500 text-xs">
                ({product.reviewCount})
              </span>
            )}
          </motion.div>
        )}
      </div>

      {/* Title and Price Row */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Arabic Name */}
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white font-cairo leading-tight">
            {product.name}
          </h2>

          {/* English Name */}
          {product.nameEn && (
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 font-medium">
              {product.nameEn}
            </p>
          )}

          {/* Health Badges */}
          {product.health_keywords && (
            <div className="mt-2">
              <HealthBadges
                keywords={parseHealthKeywords(product.health_keywords)}
                maxBadges={3}
                size="sm"
              />
            </div>
          )}
        </div>

        {/* Price + Badges */}
        <div className="flex-shrink-0 flex flex-col items-end gap-2">
          {/* ✅ Discount Badge - Prominent like apps */}
          {discountPct > 0 && (
            <motion.div
              initial={{ scale: 0, rotate: -12 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-red-500 via-red-600 to-rose-600 text-white px-3 py-1.5 rounded-xl shadow-lg shadow-red-500/30 flex items-center gap-1.5">
                <Tag className="w-4 h-4" />
                <span className="font-black text-sm">خصم {discountPct}%</span>
              </div>
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-xl animate-pulse" />
            </motion.div>
          )}

          {/* ✅ NEW: Pass oldPrice to show discount */}
          <PriceDisplay
            price={displayPrice ?? product.price}
            oldPrice={product.old_price}
            size="lg"
            className="text-pink-600 dark:text-pink-400"
          />

          {/* Energy Score Badge */}
          {product.energy_score && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-full text-[10px] font-bold shadow-sm"
            >
              <Sparkles className="w-2.5 h-2.5" />
              {product.energy_score}%
            </motion.span>
          )}
        </div>
      </div>

      {/* Description - Expandable */}
      {product.description && (
        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.p
              key={isDescriptionExpanded ? 'expanded' : 'collapsed'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`text-slate-500 dark:text-slate-400 text-sm leading-relaxed ${!isDescriptionExpanded && needsExpansion ? 'line-clamp-2' : ''
                }`}
            >
              {product.description}
            </motion.p>
          </AnimatePresence>

          {/* Expand/Collapse Button */}
          {needsExpansion && (
            <button
              onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
              className="mt-1 flex items-center gap-1 text-xs text-pink-600 dark:text-pink-400 font-medium hover:text-pink-700 dark:hover:text-pink-300 transition-colors"
            >
              {isDescriptionExpanded ? (
                <>
                  <span>عرض أقل</span>
                  <ChevronUp className="w-3.5 h-3.5" />
                </>
              ) : (
                <>
                  <span>عرض المزيد</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent" />
    </motion.div>
  )
}
