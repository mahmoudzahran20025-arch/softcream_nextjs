'use client'

import { useState, useEffect } from 'react'
import { X, Plus, Minus, ShoppingCart, Flame, Droplets, Wheat, Candy } from 'lucide-react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { FreeMode } from 'swiper/modules'
import { useCart } from '@/providers/CartProvider'
import ProductCard from './ProductCard'

import 'swiper/css'
import 'swiper/css/free-mode'

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

interface ProductModalProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
  allProducts?: Product[]
}

export default function ProductModal({ product, isOpen, onClose, allProducts = [] }: ProductModalProps) {
  const { addToCart } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [showNutrition, setShowNutrition] = useState(false)
  const [recommendations, setRecommendations] = useState<Product[]>([])

  useEffect(() => {
    if (product && allProducts.length > 0) {
      // Get 5 random recommendations excluding current product
      const filtered = allProducts.filter(p => p.id !== product.id)
      const shuffled = filtered.sort(() => Math.random() - 0.5).slice(0, 5)
      setRecommendations(shuffled)
    }
  }, [product, allProducts])

  if (!isOpen || !product) return null

  const handleAddToCart = () => {
    addToCart(product, quantity)
    setQuantity(1)
    onClose()
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  // Parse JSON fields safely
  const tags = product.tags ? JSON.parse(product.tags) : []
  const ingredients = product.ingredients ? JSON.parse(product.ingredients) : []
  const allergens = product.allergens ? JSON.parse(product.allergens) : []

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative bg-white dark:bg-slate-800 w-full max-w-2xl rounded-t-3xl md:rounded-3xl max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-white dark:bg-slate-700 rounded-full shadow-lg flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
          aria-label="إغلاق"
        >
          <X className="w-6 h-6 text-slate-600 dark:text-slate-300" />
        </button>

        {/* Product Image */}
        <div className="relative h-64 md:h-80 overflow-hidden bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl">🍦</div>
          )}
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          
          {/* Badge */}
          {product.badge && (
            <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
              {product.badge}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Header */}
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2">
              {product.name}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base">
              {product.description}
            </p>
          </div>

          {/* Price & Quantity */}
          <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-700 rounded-2xl p-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {product.price * quantity}
              </span>
              <span className="text-slate-500 dark:text-slate-400">ج.م</span>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-3 bg-white dark:bg-slate-800 rounded-xl p-1 shadow-sm">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 flex items-center justify-center transition-colors"
                disabled={quantity <= 1}
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-8 text-center font-bold text-slate-900 dark:text-white">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-8 h-8 rounded-lg bg-purple-500 hover:bg-purple-600 text-white flex items-center justify-center transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Nutrition Facts */}
          {(product.calories || product.protein || product.carbs || product.sugar) && (
            <div className="grid grid-cols-4 gap-3">
              {product.calories && (
                <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
                  <Flame className="w-6 h-6 text-orange-500 mx-auto mb-1" />
                  <div className="text-lg font-bold text-slate-900 dark:text-white">{product.calories}</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">سعرة</div>
                </div>
              )}
              {product.protein && (
                <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <Droplets className="w-6 h-6 text-blue-500 mx-auto mb-1" />
                  <div className="text-lg font-bold text-slate-900 dark:text-white">{product.protein}g</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">بروتين</div>
                </div>
              )}
              {product.carbs && (
                <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
                  <Wheat className="w-6 h-6 text-yellow-600 mx-auto mb-1" />
                  <div className="text-lg font-bold text-slate-900 dark:text-white">{product.carbs}g</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">كربوهيدرات</div>
                </div>
              )}
              {product.sugar && (
                <div className="text-center p-3 bg-pink-50 dark:bg-pink-900/20 rounded-xl">
                  <Candy className="w-6 h-6 text-pink-500 mx-auto mb-1" />
                  <div className="text-lg font-bold text-slate-900 dark:text-white">{product.sugar}g</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">سكر</div>
                </div>
              )}
            </div>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-2">المميزات</h3>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag: string, index: number) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Detailed Nutrition (Collapsible) */}
          {(product.fat || product.fiber || ingredients.length > 0 || allergens.length > 0) && (
            <div>
              <button
                onClick={() => setShowNutrition(!showNutrition)}
                className="w-full text-right font-bold text-slate-900 dark:text-white mb-2 flex items-center justify-between"
              >
                <span>القيم الغذائية التفصيلية</span>
                <span className="text-purple-600 dark:text-purple-400">{showNutrition ? '−' : '+'}</span>
              </button>
              
              {showNutrition && (
                <div className="space-y-2">
                  {product.fat && (
                    <div className="flex justify-between py-2 border-b border-slate-200 dark:border-slate-700">
                      <span className="text-slate-600 dark:text-slate-400">الدهون</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{product.fat}g</span>
                    </div>
                  )}
                  {product.fiber && (
                    <div className="flex justify-between py-2 border-b border-slate-200 dark:border-slate-700">
                      <span className="text-slate-600 dark:text-slate-400">الألياف</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{product.fiber}g</span>
                    </div>
                  )}
                  {ingredients.length > 0 && (
                    <div className="py-2">
                      <span className="text-slate-600 dark:text-slate-400 block mb-1">المكونات:</span>
                      <span className="text-sm text-slate-700 dark:text-slate-300">{ingredients.join('، ')}</span>
                    </div>
                  )}
                  {allergens.length > 0 && (
                    <div className="py-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg px-3 border border-yellow-200 dark:border-yellow-900/50">
                      <span className="text-yellow-800 dark:text-yellow-300 font-semibold block mb-1">⚠️ تحذير الحساسية:</span>
                      <span className="text-sm text-yellow-700 dark:text-yellow-400">{allergens.join('، ')}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-3">قد يعجبك أيضاً</h3>
              <Swiper
                modules={[FreeMode]}
                spaceBetween={12}
                slidesPerView="auto"
                freeMode
                dir="rtl"
              >
                {recommendations.map(rec => (
                  <SwiperSlide key={rec.id} className="!w-[140px]">
                    <ProductCard product={rec} />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          )}

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all active:scale-95"
          >
            <ShoppingCart className="w-5 h-5" />
            <span>أضف إلى السلة ({quantity})</span>
          </button>
        </div>
      </div>
    </div>
  )
}
