'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ShoppingCart, Check } from 'lucide-react'
import Image from 'next/image'
import { useCart } from '@/providers/CartProvider'
import { CategoryConfig } from '@/config/categories'
import { HealthBadges } from '../health'
import { parseHealthKeywords } from '@/lib/health/keywords'

interface Product {
  id: string
  name: string
  nameEn?: string
  price: number
  image?: string
  description?: string
  calories?: number
  health_keywords?: string
}

interface CompactProductCardProps {
  product: Product
  config: CategoryConfig
}

export default function CompactProductCard({ product, config }: CompactProductCardProps) {
  const { addToCart } = useCart()
  const [isAdding, setIsAdding] = useState(false)
  const [justAdded, setJustAdded] = useState(false)

  const handleCardClick = () => {
    window.location.href = `/products/${product.id}`
  }

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsAdding(true)
    try {
      addToCart(product, 1)
      setJustAdded(true)
      setTimeout(() => setJustAdded(false), 1500)
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleCardClick}
      className="relative cursor-pointer group"
    >
      {/* Compact Card */}
      <div className="relative overflow-hidden rounded-xl bg-white dark:bg-slate-800 shadow-md hover:shadow-lg transition-all duration-200 border border-slate-100 dark:border-slate-700">

        {/* Square Image */}
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800">
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
              <span className="text-4xl">{config.icon}</span>
            </div>
          )}

          {/* Calories Badge */}
          {product.calories && (
            <div className="absolute top-2 left-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-1.5 py-0.5 rounded-full text-[10px] font-bold text-orange-600 dark:text-orange-400 flex items-center gap-0.5">
              <span>🔥</span>
              <span>{product.calories}</span>
            </div>
          )}

          {/* Quick Add Overlay on Hover */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-center pb-3 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleAddToCart}
              disabled={isAdding}
              className={`px-4 py-2 rounded-full font-bold text-xs flex items-center gap-1.5 shadow-lg transition-all ${justAdded
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
        </div>

        {/* Compact Info */}
        <div className="p-3">
          {/* Name */}
          <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1 mb-1">
            {product.name}
          </h3>

          {/* Health Badges */}
          {product.health_keywords && (
            <div className="mb-1.5">
              <HealthBadges
                keywords={parseHealthKeywords(product.health_keywords)}
                maxBadges={1}
                size="xs"
              />
            </div>
          )}

          {/* Price Row */}
          <div className="flex items-center justify-between">
            <span className="text-base font-bold text-[#FF6B9D]">
              {product.price}
              <span className="text-xs mr-0.5 opacity-70">ج.م</span>
            </span>

            {/* Mini Cart Button */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleAddToCart}
              disabled={isAdding}
              className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-sm transition-all ${justAdded
                  ? 'bg-green-500 text-white'
                  : 'bg-gradient-to-r from-[#FF6B9D] to-[#FF5A8E] text-white hover:shadow-md'
                }`}
              aria-label="إضافة للسلة"
            >
              {justAdded ? (
                <Check className="w-4 h-4" />
              ) : (
                <ShoppingCart className="w-4 h-4" />
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
