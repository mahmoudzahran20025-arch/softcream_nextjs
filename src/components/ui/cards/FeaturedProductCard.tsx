'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ShoppingCart, Star, Flame, Zap } from 'lucide-react'
import Image from 'next/image'
import { useCart } from '@/providers/CartProvider'
import { CategoryConfig } from '@/config/categories'
import QuantitySelector from '../common/QuantitySelector'
import PriceDisplay from '../common/PriceDisplay'
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
  protein?: number
  badge?: string
  energy_type?: string
  energy_score?: number
  health_keywords?: string
}

interface FeaturedProductCardProps {
  product: Product
  config: CategoryConfig
}

export default function FeaturedProductCard({ product, config }: FeaturedProductCardProps) {
  const { addToCart } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)

  const handleCardClick = () => {
    window.location.href = `/products/${product.id}`
  }

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsAdding(true)
    addToCart(product, quantity)
    setQuantity(1)
    // Keep success state for 1.2 seconds
    setTimeout(() => setIsAdding(false), 1200)
  }

  return (
    <motion.div
      whileHover={{ y: -6 }}
      onClick={handleCardClick}
      className="relative cursor-pointer group h-full"
    >
      {/* Card */}
      <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800 shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-100 dark:border-slate-700 h-full flex flex-col">

        {/* Image Section */}
        <div className="relative aspect-[4/5] overflow-hidden">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
              sizes="(max-width: 768px) 50vw, 33vw"
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${config.gradient} flex items-center justify-center`}>
              <span className="text-6xl">{config.icon}</span>
            </div>
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {/* Badge */}
          {product.badge && (
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="absolute top-3 right-3 bg-gradient-to-r from-amber-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1"
            >
              <Star className="w-3 h-3 fill-white" />
              <span>{product.badge}</span>
            </motion.div>
          )}

          {/* Health Badges Overlay */}
          {product.health_keywords && (
            <div className="absolute bottom-3 right-3">
              <HealthBadges
                keywords={parseHealthKeywords(product.health_keywords)}
                maxBadges={2}
                size="xs"
                variant="overlay"
              />
            </div>
          )}

          {/* Bottom Content Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="text-lg font-bold text-white mb-1 line-clamp-1 drop-shadow-lg">
              {product.name}
            </h3>
            {product.description && (
              <p className="text-white/80 text-xs line-clamp-2 drop-shadow">
                {product.description}
              </p>
            )}
          </div>
        </div>

        {/* Action Section */}
        <div className="p-4 mt-auto">
          {/* Price Row */}
          <div className="flex items-center justify-between mb-3">
            <PriceDisplay price={product.price} size="lg" />
          </div>

          {/* Quantity Selector */}
          <div onClick={(e) => e.stopPropagation()} className="mb-3">
            <QuantitySelector
              quantity={quantity}
              onIncrease={() => setQuantity(q => q + 1)}
              onDecrease={() => setQuantity(q => Math.max(1, q - 1))}
              size="sm"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {/* Quick Add - Brand Color with Success State */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleAddToCart}
              disabled={isAdding}
              className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all ${isAdding
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gradient-to-r from-[#FF6B9D] to-[#FF5A8E] hover:from-[#FF5A8E] hover:to-[#FF4979] text-white'
                }`}
              aria-label="إضافة للسلة"
            >
              {isAdding ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500 }}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </motion.div>
              ) : (
                <ShoppingCart className="w-5 h-5" />
              )}
            </motion.button>

            {/* Details Button */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                window.location.href = `/products/${product.id}`
              }}
              className="flex-1 py-3 text-sm font-bold text-[#FF6B9D] hover:text-white flex items-center justify-center gap-2 transition-all rounded-xl border border-[#FF6B9D]/30 hover:bg-gradient-to-r hover:from-[#FF6B9D] hover:to-[#FF5A8E] hover:border-transparent"
            >
              <span>اعرف المزيد</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
