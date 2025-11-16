'use client'

import { useState } from 'react'
import { useCart } from '@/providers/CartProvider'
import { useProductsData } from '@/providers/ProductsProvider'
import { ShoppingCart, Plus, Minus } from 'lucide-react'

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
      className="card p-3 hover:shadow-xl transition-all duration-300 h-full flex flex-col"
      onClick={handleCardClick}
    >
      {/* Image Container - Fixed Aspect Ratio for CLS Prevention */}
      <div className="relative w-full aspect-[4/5] bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg mb-3 overflow-hidden group">
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
          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
            {product.badge}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex-1 flex flex-col">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1 line-clamp-2">
          {product.name}
        </h3>

        {product.description && (
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-2 line-clamp-1">
            {product.description}
          </p>
        )}

        {/* Nutrition Quick View */}
        {product.calories && (
          <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">
            {product.calories} سعرة
          </div>
        )}
      </div>

      {/* Price and Controls */}
      <div className="mt-auto pt-3 border-t border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-2">
          <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
            {product.price} ج.م
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {quantity}x
          </span>
        </div>

        {/* Quantity Controls */}
        <div className="flex items-center gap-1 mb-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              setQuantity(Math.max(1, quantity - 1))
            }}
            className="flex-1 p-1 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-colors"
            disabled={quantity <= 1}
            aria-label="تقليل الكمية"
          >
            <Minus size={14} className="mx-auto" />
          </button>
          <span className="flex-1 text-center text-sm font-semibold">
            {quantity}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation()
              setQuantity(quantity + 1)
            }}
            className="flex-1 p-1 bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-900/50 text-purple-600 dark:text-purple-400 rounded transition-colors"
            aria-label="زيادة الكمية"
          >
            <Plus size={14} className="mx-auto" />
          </button>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={isAdding}
          className="w-full btn-primary py-2 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          aria-label="إضافة إلى العربة"
        >
          <ShoppingCart size={16} />
          <span className="text-sm font-semibold">أضف</span>
        </button>
      </div>
    </div>
  )
}
