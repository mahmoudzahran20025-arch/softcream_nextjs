'use client'

import { useState } from 'react'
import { useCart } from '@/providers/CartProvider'
import { useProductsData } from '@/providers/ProductsProvider'
import { ShoppingCart } from 'lucide-react'
import QuantitySelector from './common/QuantitySelector'
import PriceDisplay from './common/PriceDisplay'

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
        <div className="flex items-center justify-between mb-3">
          <PriceDisplay price={product.price} size="md" />
        </div>

        {/* Quantity Controls */}
        <div className="mb-2" onClick={(e) => e.stopPropagation()}>
          <QuantitySelector
            quantity={quantity}
            onIncrease={() => setQuantity(quantity + 1)}
            onDecrease={() => setQuantity(Math.max(1, quantity - 1))}
            size="sm"
          />
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={isAdding}
          className="w-full bg-gradient-to-r from-[#FF6B9D] to-[#FF5A8E] hover:from-[#FF5A8E] hover:to-[#FF4979] text-white py-2 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-md hover:shadow-lg active:scale-[0.98]"
          aria-label="إضافة إلى العربة"
        >
          <ShoppingCart size={16} />
          <span className="text-sm font-semibold">أضف</span>
        </button>
      </div>
    </div>
  )
}
