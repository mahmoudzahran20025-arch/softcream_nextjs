'use client'

import { useState, useEffect } from 'react'
import { X, Plus, Minus, ShoppingCart, Flame, Droplets, Wheat, Candy, Sparkles, ChevronDown, ChevronUp } from 'lucide-react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { FreeMode } from 'swiper/modules'
import { useCart } from '@/providers/CartProvider'
import ProductCard from '@/components/ui/ProductCard'
import { getProduct, Addon } from '@/lib/api'
import { motion, AnimatePresence } from 'framer-motion'

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
  addonsList?: Addon[]
  allowed_addons?: string
  ingredientsList?: string[]
  allergensList?: string[]
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
  const [selectedAddons, setSelectedAddons] = useState<string[]>([])
  const [expandedProduct, setExpandedProduct] = useState<Product | null>(null)
  const [isLoadingAddons, setIsLoadingAddons] = useState(false)

  // Fetch product with addons expansion when modal opens
  useEffect(() => {
    if (product && isOpen) {
      setIsLoadingAddons(true)
      getProduct(product.id, { expand: ['addons', 'ingredients', 'allergens'] })
        .then(expandedData => {
          setExpandedProduct(expandedData)
          setIsLoadingAddons(false)
        })
        .catch(error => {
          console.error('Failed to fetch product addons:', error)
          setExpandedProduct(product)
          setIsLoadingAddons(false)
        })
    }
  }, [product, isOpen])

  useEffect(() => {
    if (product && allProducts.length > 0) {
      // Get 5 random recommendations excluding current product
      const filtered = allProducts.filter(p => p.id !== product.id)
      const shuffled = filtered.sort(() => Math.random() - 0.5).slice(0, 5)
      setRecommendations(shuffled)
    }
  }, [product, allProducts])

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setQuantity(1)
      setSelectedAddons([])
      setExpandedProduct(null)
      setShowNutrition(false)
    }
  }, [isOpen])

  if (!isOpen || !product) return null

  const displayProduct = expandedProduct || product
  const addons = displayProduct.addonsList || []

  const handleAddToCart = () => {
    // Send undefined instead of empty array for consistency
    const addonsToSend = selectedAddons.length > 0 ? selectedAddons : undefined
    addToCart(product, quantity, addonsToSend)
    setQuantity(1)
    setSelectedAddons([])
    onClose()
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const toggleAddon = (addonId: string) => {
    setSelectedAddons(prev => 
      prev.includes(addonId)
        ? prev.filter(id => id !== addonId)
        : [...prev, addonId]
    )
  }

  // Calculate total price including addons
  const addonsTotal = selectedAddons.reduce((sum, addonId) => {
    const addon = addons.find(a => a.id === addonId)
    return sum + (addon?.price || 0)
  }, 0)
  const totalPrice = (displayProduct.price + addonsTotal) * quantity

  // Parse JSON fields safely
  const tags = displayProduct.tags ? JSON.parse(displayProduct.tags) : []
  const ingredients = displayProduct.ingredientsList || (displayProduct.ingredients ? JSON.parse(displayProduct.ingredients) : [])
  const allergens = displayProduct.allergensList || (displayProduct.allergens ? JSON.parse(displayProduct.allergens) : [])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={handleBackdropClick}
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            initial={{ y: 100, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 100, opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative bg-white dark:bg-slate-900 w-full max-w-5xl rounded-t-[2rem] md:rounded-3xl max-h-[92vh] overflow-hidden shadow-2xl flex flex-col md:flex-row"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 md:left-4 md:right-auto z-20 w-11 h-11 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-full shadow-xl flex items-center justify-center hover:bg-white dark:hover:bg-slate-700 transition-all hover:scale-110 active:scale-95"
              aria-label="إغلاق"
            >
              <X className="w-5 h-5 text-slate-700 dark:text-slate-200" />
            </button>

            {/* Product Image Section - Clean Hero */}
            <div className="relative h-[40vh] min-h-[300px] md:h-full md:w-1/2 bg-gray-100 dark:bg-slate-800 overflow-hidden group">
              {product.image ? (
                <motion.img
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.6 }}
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover object-center transition-transform duration-700 md:group-hover:scale-105"
                  width={600}
                  height={600}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-9xl opacity-20">🍦</span>
                </div>
              )}
              
              {/* Subtle Bottom Fade for Mobile */}
              <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white dark:from-slate-900 to-transparent md:hidden pointer-events-none" />
              
              {/* Energy Badge */}
              {product.energy_type && (
                <motion.div
                  initial={{ scale: 0, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.3, type: 'spring' }}
                  className="absolute top-6 left-6 md:top-8 md:left-8 bg-gradient-to-r from-amber-400 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{product.energy_type}</span>
                </motion.div>
              )}
              
              {/* Badge */}
              {product.badge && (
                <motion.div
                  initial={{ scale: 0, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.3, type: 'spring' }}
                  className="absolute top-6 right-6 md:top-8 md:right-8 bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg"
                >
                  {product.badge}
                </motion.div>
              )}
            </div>

            {/* Content Section - Scrollable with Sheet Overlap */}
            <div className="flex-1 flex flex-col md:w-1/2 overflow-hidden relative z-10 -mt-12 md:mt-0 rounded-t-[2.5rem] md:rounded-none bg-white dark:bg-slate-900 shadow-2xl md:shadow-none">
              {/* Mobile Handle Bar */}
              <div className="w-full flex justify-center pt-3 pb-1 md:hidden">
                <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full" />
              </div>
              
              <div className="flex-1 overflow-y-auto px-6 md:px-8 pt-4 md:pt-8 pb-24 space-y-6 scrollbar-thin scrollbar-thumb-purple-300 dark:scrollbar-thumb-purple-700 scrollbar-track-transparent">
                {/* Header */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2 font-cairo leading-tight">
                    {product.name}
                  </h2>
                  {product.nameEn && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-3 font-medium">
                      {product.nameEn}
                    </p>
                  )}
                  <p className="text-slate-500 dark:text-slate-400 text-base leading-relaxed">
                    {product.description}
                  </p>
                  
                  {/* Price Tag */}
                  <div className="mt-4 inline-flex items-baseline gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-5 py-2.5 rounded-full shadow-lg shadow-purple-500/30">
                    <span className="text-2xl font-bold">{displayProduct.price}</span>
                    <span className="text-sm font-medium">ج.م</span>
                  </div>
                </motion.div>

                {/* Energy Bar */}
                {product.energy_score && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="space-y-2"
                  >
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400 font-medium">مستوى الطاقة</span>
                      <span className="text-slate-900 dark:text-white font-bold">{product.energy_score}%</span>
                    </div>
                    <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${product.energy_score}%` }}
                        transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
                        className="h-full bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 rounded-full"
                      />
                    </div>
                  </motion.div>
                )}

                {/* Quick Nutrition Stats - Subtle */}
                {(product.calories || product.protein || product.carbs || product.sugar) && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="grid grid-cols-4 gap-2"
                  >
                    {product.calories && (
                      <div className="text-center p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                        <Flame className="w-4 h-4 text-slate-400 dark:text-slate-500 mx-auto mb-1" />
                        <div className="text-sm font-bold text-slate-900 dark:text-white">{product.calories}</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">سعرة</div>
                      </div>
                    )}
                    {product.protein && (
                      <div className="text-center p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                        <Droplets className="w-4 h-4 text-slate-400 dark:text-slate-500 mx-auto mb-1" />
                        <div className="text-sm font-bold text-slate-900 dark:text-white">{product.protein}g</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">بروتين</div>
                      </div>
                    )}
                    {product.carbs && (
                      <div className="text-center p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                        <Wheat className="w-4 h-4 text-slate-400 dark:text-slate-500 mx-auto mb-1" />
                        <div className="text-sm font-bold text-slate-900 dark:text-white">{product.carbs}g</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">كربوهيدرات</div>
                      </div>
                    )}
                    {product.sugar && (
                      <div className="text-center p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                        <Candy className="w-4 h-4 text-slate-400 dark:text-slate-500 mx-auto mb-1" />
                        <div className="text-sm font-bold text-slate-900 dark:text-white">{product.sugar}g</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">سكر</div>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Add-ons Section - Vertical Compact List */}
                {addons.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-3"
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-purple-500" />
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        أضف إضافات مميزة
                      </h3>
                    </div>
                    
                    {isLoadingAddons ? (
                      <div className="text-center py-8">
                        <div className="inline-block w-8 h-8 border-4 border-purple-200 dark:border-purple-800 border-t-purple-500 dark:border-t-purple-400 rounded-full animate-spin" />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {addons.map((addon, index) => {
                          const isSelected = selectedAddons.includes(addon.id)
                          return (
                            <motion.button
                              key={addon.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.4 + index * 0.05 }}
                              onClick={() => toggleAddon(addon.id)}
                              className={`
                                w-full flex items-center justify-between p-3 rounded-lg border transition-all
                                ${isSelected
                                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                                  : 'border-slate-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-600 hover:bg-slate-50 dark:hover:bg-slate-800'
                                }
                              `}
                            >
                              <div className="flex items-center gap-3 flex-1">
                                {/* Checkbox */}
                                <div className={`
                                  w-5 h-5 rounded border-2 flex items-center justify-center transition-all flex-shrink-0
                                  ${isSelected 
                                    ? 'bg-purple-500 border-purple-500' 
                                    : 'border-slate-300 dark:border-slate-600'
                                  }
                                `}>
                                  {isSelected && (
                                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                  )}
                                </div>
                                
                                <div className="text-right flex-1">
                                  <div className="text-sm font-semibold text-slate-900 dark:text-white">
                                    {addon.name}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="text-sm font-bold text-purple-600 dark:text-purple-400 flex-shrink-0">
                                +{addon.price} ج.م
                              </div>
                            </motion.button>
                          )
                        })}
                      </div>
                    )}
                    
                    {/* Selected Count Badge */}
                    {selectedAddons.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-2 text-sm text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 px-3 py-2 rounded-lg border border-purple-200 dark:border-purple-800"
                      >
                        <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center">
                          <span className="text-white text-xs font-bold">{selectedAddons.length}</span>
                        </div>
                        <span className="font-semibold">تم اختيار {selectedAddons.length} إضافة</span>
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {/* Tags */}
                {tags.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">المميزات</h3>
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag: string, index: number) => (
                        <motion.span
                          key={index}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.5 + index * 0.05 }}
                          className="px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-semibold border border-purple-200 dark:border-purple-800/50"
                        >
                          #{tag}
                        </motion.span>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Detailed Nutrition (Collapsible) */}
                {(product.fat || product.fiber || ingredients.length > 0 || allergens.length > 0) && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="border-t border-slate-200 dark:border-slate-700 pt-4"
                  >
                    <button
                      onClick={() => setShowNutrition(!showNutrition)}
                      className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors group"
                    >
                      <span className="text-base font-bold text-slate-900 dark:text-white">القيم الغذائية التفصيلية</span>
                      <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                        {showNutrition ? (
                          <ChevronUp className="w-4 h-4 text-white" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-white" />
                        )}
                      </div>
                    </button>
                    
                    <AnimatePresence>
                      {showNutrition && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-3 space-y-3 overflow-hidden"
                        >
                          {product.fat && (
                            <div className="flex justify-between items-center py-3 px-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                              <span className="text-slate-600 dark:text-slate-400 font-medium">الدهون</span>
                              <span className="font-bold text-slate-900 dark:text-white">{product.fat}g</span>
                            </div>
                          )}
                          {product.fiber && (
                            <div className="flex justify-between items-center py-3 px-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                              <span className="text-slate-600 dark:text-slate-400 font-medium">الألياف</span>
                              <span className="font-bold text-slate-900 dark:text-white">{product.fiber}g</span>
                            </div>
                          )}
                          {ingredients.length > 0 && (
                            <div className="py-4 px-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                              <span className="text-slate-700 dark:text-slate-300 font-bold block mb-2">المكونات:</span>
                              <span className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{ingredients.join('، ')}</span>
                            </div>
                          )}
                          {allergens.length > 0 && (
                            <div className="py-4 px-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30 rounded-xl border-2 border-yellow-300 dark:border-yellow-800/50">
                              <div className="flex items-start gap-2">
                                <span className="text-2xl">⚠️</span>
                                <div>
                                  <span className="text-yellow-800 dark:text-yellow-300 font-bold block mb-1">تحذير الحساسية</span>
                                  <span className="text-sm text-yellow-700 dark:text-yellow-400">{allergens.join('، ')}</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}

                {/* Recommendations */}
                {recommendations.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="pb-4"
                  >
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">قد يعجبك أيضاً</h3>
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
                  </motion.div>
                )}
              </div>

              {/* Action Bar - Sticky Footer Clean */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="relative border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 md:p-6"
              >
                <div className="flex items-center gap-3">
                  {/* Quantity Selector */}
                  <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-xl p-1.5">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      className="w-9 h-9 rounded-lg bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-all active:scale-95"
                    >
                      <Minus className="w-4 h-4 text-slate-700 dark:text-slate-200" />
                    </button>
                    <span className="w-8 text-center font-bold text-base text-slate-900 dark:text-white">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-9 h-9 rounded-lg bg-purple-500 hover:bg-purple-600 text-white flex items-center justify-center transition-all active:scale-95"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 py-3.5 px-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30 transition-all active:scale-[0.98]"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    <span>أضف للسلة • {totalPrice} ج.م</span>
                  </button>
                </div>

                {/* Price Breakdown */}
                {addonsTotal > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700"
                  >
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                      <span>السعر الأساسي ({quantity}×)</span>
                      <span className="font-semibold">{displayProduct.price * quantity} ج.م</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span>الإضافات ({selectedAddons.length})</span>
                      <span className="font-semibold">+{addonsTotal * quantity} ج.م</span>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}