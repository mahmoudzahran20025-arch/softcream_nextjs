'use client'

import { useState, useMemo } from 'react'
import { useCart } from '@/providers/CartProvider'
import { useProductsData } from '@/providers/ProductsProvider'
import { ShoppingCart, Sparkles, Brain, Activity, Zap } from 'lucide-react'
import QuantitySelector from './common/QuantitySelector'
import PriceDisplay from './common/PriceDisplay'
import { useRotatingText } from '@/hooks/useRotatingText'

interface Product {
  id: string
  name: string
  nameEn?: string
  price: number
  image?: string
  category?: string
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
}

interface ProductCardProps {
  product: Product
  onAddToCart?: (product: Product, quantity: number) => void
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const { addToCart } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)

  const { openProduct } = useProductsData()

  // Check if product has addons
  const hasAddons = useMemo(() => {
    if (!product.allowed_addons) return false
    try {
      const addons = JSON.parse(product.allowed_addons)
      return Array.isArray(addons) && addons.length > 0
    } catch {
      return false
    }
  }, [product.allowed_addons])

  // Build rotating info texts with colors
  const infoTexts = useMemo(() => {
    const texts: Array<{ text: string; color: string; icon: string }> = []

    if (product.calories) {
      texts.push({
        text: `${product.calories} سعرة حرارية`,
        color: 'text-orange-600 dark:text-orange-400',
        icon: '🔥'
      })
    }

    if (product.protein && product.protein > 0) {
      texts.push({
        text: `${product.protein}g بروتين`,
        color: 'text-blue-600 dark:text-blue-400',
        icon: '💪'
      })
    }

    if (hasAddons) {
      texts.push({
        text: 'إضافات مميزة متاحة',
        color: 'text-purple-600 dark:text-purple-400',
        icon: '✨'
      })
    }

    if (product.energy_score && product.energy_score > 0) {
      texts.push({
        text: `طاقة ${product.energy_score}`,
        color: 'text-yellow-600 dark:text-yellow-400',
        icon: '⚡'
      })
    }

    if (texts.length === 0) {
      texts.push({
        text: product.description || 'اضغط لعرض التفاصيل',
        color: 'text-slate-600 dark:text-slate-400',
        icon: '👆'
      })
    }

    return texts
  }, [product, hasAddons])

  const { currentText: currentInfo, isTransitioning, currentIndex } = useRotatingText(
    infoTexts.map(t => t.text),
    2500
  )

  const currentColor = infoTexts[currentIndex]?.color || 'text-slate-600'
  const currentIcon = infoTexts[currentIndex]?.icon || ''

  // Get energy type config for badge
  const getEnergyConfig = () => {
    switch (product.energy_type) {
      case 'mental':
        return {
          Icon: Brain,
          bgClass: 'bg-purple-100/95 dark:bg-purple-900/95',
          textClass: 'text-purple-700 dark:text-purple-300',
          borderClass: 'border-purple-300 dark:border-purple-700'
        }
      case 'physical':
        return {
          Icon: Activity,
          bgClass: 'bg-orange-100/95 dark:bg-orange-900/95',
          textClass: 'text-orange-700 dark:text-orange-300',
          borderClass: 'border-orange-300 dark:border-orange-700'
        }
      case 'balanced':
        return {
          Icon: Zap,
          bgClass: 'bg-green-100/95 dark:bg-green-900/95',
          textClass: 'text-green-700 dark:text-green-300',
          borderClass: 'border-green-300 dark:border-green-700'
        }
      default:
        return null
    }
  }

  const energyConfig = getEnergyConfig()

  const handleCardClick = () => {
    openProduct(product)
  }

  const handleAddToCart = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    setIsAdding(true)
    try {
      if (onAddToCart) {
        onAddToCart(product, quantity)
      } else {
        addToCart(product, quantity)
      }
      setQuantity(1)
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <div
      className="card p-3 hover:shadow-xl transition-shadow duration-300 h-full flex flex-col cursor-pointer"
      onClick={handleCardClick}
      style={{ willChange: 'box-shadow' }}
    >
      {/* Image Container - Fixed Aspect Ratio for CLS Prevention */}
      <div className="relative w-full aspect-[4/5] bg-gradient-to-br from-pink-50 to-rose-50 dark:from-slate-800 dark:to-slate-700 rounded-lg mb-3 overflow-hidden group">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            loading="lazy"
            width={200}
            height={250}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400 dark:text-slate-600">
            🍦
          </div>
        )}

        {/* Badge */}
        {product.badge && (
          <div className="absolute top-2 right-2 bg-gradient-to-r from-[#FF6B9D] to-[#FF5A8E] text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
            {product.badge}
          </div>
        )}

        {/* Energy Type Badge - Top Left */}
        {energyConfig && (
          <div className={`absolute top-2 left-2 ${energyConfig.bgClass} ${energyConfig.textClass} backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1 shadow-lg border-2 ${energyConfig.borderClass}`}>
            <energyConfig.Icon size={14} strokeWidth={2.5} />
            {product.energy_score && product.energy_score > 0 && (
              <span className="text-xs font-bold">{product.energy_score}</span>
            )}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex-1 flex flex-col">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1 line-clamp-2">
          {product.name}
        </h3>

        {/* Description - First line */}
        {product.description && (
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-2 line-clamp-1">
            {product.description}
          </p>
        )}

        {/* Rotating Info Text with Colors - The Hook! */}
        <div className="min-h-[18px] mb-2 flex items-center gap-1">
          <span className="text-sm">{currentIcon}</span>
          <p
            className={`text-xs font-semibold transition-all duration-300 ${isTransitioning
                ? 'opacity-0 translate-y-1'
                : 'opacity-100 translate-y-0'
              } ${currentColor}`}
          >
            {currentInfo}
          </p>
        </div>
      </div>

      {/* Price and Controls */}
      <div className="mt-auto pt-2 border-t border-slate-200 dark:border-slate-700">
        {/* Price Row with Addons Badge */}
        <div className="flex items-center justify-between mb-2">
          <PriceDisplay price={product.price} size="md" />

          {/* Addons Indicator - Subtle badge */}
          {hasAddons && (
            <div className="bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-0.5 shadow-sm border border-purple-200 dark:border-purple-700">
              <Sparkles size={10} />
              <span>إضافات</span>
            </div>
          )}
        </div>

        {/* Unified Footer - Two Rows */}
        <div className="flex flex-col gap-1.5">
          {/* Row 1: Quantity Selector (Full Width) */}
          <div onClick={(e) => e.stopPropagation()}>
            <QuantitySelector
              quantity={quantity}
              onIncrease={() => setQuantity(quantity + 1)}
              onDecrease={() => setQuantity(Math.max(1, quantity - 1))}
              size="sm"
            />
          </div>

          {/* Row 2: Cart Icon + Learn More */}
          <div className="flex items-center gap-1.5">
            {/* Cart Icon Button */}
            <button
              onClick={handleAddToCart}
              disabled={isAdding}
              className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-[#FF6B9D] to-[#FF5A8E] hover:from-[#FF5A8E] hover:to-[#FF4979] text-white rounded-lg flex items-center justify-center transition-transform disabled:opacity-50 shadow-md hover:shadow-lg active:scale-[0.98]"
              style={{ willChange: 'transform' }}
              aria-label="إضافة إلى السلة"
            >
              <ShoppingCart size={18} strokeWidth={2.5} />
            </button>

            {/* Learn More Button - Brand Color */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                openProduct(product)
              }}
              className="flex-1 py-2 text-xs font-bold text-[#FF6B9D] hover:text-white dark:text-[#FF6B9D] dark:hover:text-white flex items-center justify-center gap-1.5 transition-all duration-300 group hover:bg-gradient-to-r hover:from-[#FF6B9D] hover:to-[#FF5A8E] rounded-lg border border-[#FF6B9D]/30 hover:border-transparent"
            >
              <span className="group-hover:translate-x-0.5 transition-transform duration-300">
                اعرف المزيد
              </span>
              <svg
                className="w-3.5 h-3.5 group-hover:translate-x-[-2px] transition-transform duration-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
