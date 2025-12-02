'use client'

import { useState, useEffect, useMemo, useRef, lazy, Suspense } from 'react'
import { X, ShoppingCart } from 'lucide-react'
import { useCart } from '@/providers/CartProvider'
import { getProduct } from '@/lib/api'
import { debug } from '@/lib/debug'
// Note: nutritionCalculator utilities available if needed for future enhancements
import { calculateHealthScore } from '@/lib/utils/healthScore'
import { selectHealthInsight, parseHealthKeywords, type CartItemWithKeywords } from '@/lib/health/selectInsight'

import CartItem from './CartItem'
import CartSummary from './CartSummary'
import HealthyMeter from './HealthyMeter'

// Lazy load HealthInsightCard for performance
const HealthInsightCard = lazy(() => import('./HealthInsightCard'))

interface Product {
  id: string
  name: string
  nameEn?: string
  price: number
  image?: string
  category?: string
  description?: string
  calories?: number
  protein?: number
  carbs?: number
  sugar?: number
  fat?: number
  fiber?: number
}

interface CartModalProps {
  isOpen: boolean
  onClose: () => void
  onCheckout?: () => void
  allProducts?: Product[]
}

export default function CartModal({ isOpen, onClose, onCheckout, allProducts = [] }: CartModalProps) {
  const { cart, updateCartQuantity, removeFromCart, getCartCount, getCartTotal } = useCart()
  const [productsWithAddons, setProductsWithAddons] = useState<Map<string, any>>(new Map())
  const [insightDismissed, setInsightDismissed] = useState(false)
  const fetchedRef = useRef<Set<string>>(new Set())
  const healthScoreDebounceRef = useRef<NodeJS.Timeout | null>(null)
  const [debouncedHealthScore, setDebouncedHealthScore] = useState<any>(null)

  // ✅ Fetch products with addons AND customization rules for cart items
  // Using ref to prevent duplicate fetches
  const cartProductIds = useMemo(() => cart.map(item => item.productId).join(','), [cart])
  
  useEffect(() => {
    if (!isOpen || cart.length === 0) return

    const fetchProductsWithAddons = async () => {
      const newProductsMap = new Map(productsWithAddons)
      let hasNewProducts = false

      for (const item of cart) {
        // Skip if already fetched (using ref)
        if (fetchedRef.current.has(item.productId)) continue

        try {
          debug.cart(`Fetching product: ${item.productId}`)
          const productWithAddons = await getProduct(item.productId, { expand: ['options'] })

          // If product has customization selections, fetch customization rules
          if (item.selections) {
            const { getCustomizationRules } = await import('@/lib/api')
            const customizationRules = await getCustomizationRules(item.productId, 'ar')
            ;(productWithAddons as any).customizationRules = customizationRules
          }

          newProductsMap.set(item.productId, productWithAddons)
          fetchedRef.current.add(item.productId)
          hasNewProducts = true
        } catch (error) {
          debug.error(`Failed to fetch product ${item.productId}`, error)
        }
      }

      if (hasNewProducts) {
        setProductsWithAddons(newProductsMap)
      }
    }

    fetchProductsWithAddons()
  }, [cartProductIds, isOpen])

  // ✅ Calculate health score with debouncing (300ms)
  const healthScore = useMemo(() => {
    if (cart.length === 0) return null
    return calculateHealthScore(cart, productsWithAddons)
  }, [cart, productsWithAddons])

  // Debounce health score updates for performance
  useEffect(() => {
    if (healthScoreDebounceRef.current) {
      clearTimeout(healthScoreDebounceRef.current)
    }
    healthScoreDebounceRef.current = setTimeout(() => {
      setDebouncedHealthScore(healthScore)
    }, 300)
    return () => {
      if (healthScoreDebounceRef.current) {
        clearTimeout(healthScoreDebounceRef.current)
      }
    }
  }, [healthScore])

  // ✅ Extract health keywords from cart items for insight selection
  const cartItemsWithKeywords: CartItemWithKeywords[] = useMemo(() => {
    return cart.map(item => {
      const product = productsWithAddons.get(item.productId)
      const healthKeywords = parseHealthKeywords(product?.health_keywords)
      return {
        productId: item.productId,
        quantity: item.quantity,
        health_keywords: healthKeywords
      }
    })
  }, [cart, productsWithAddons])

  // ✅ Select health insight based on score and keywords
  const healthInsightResult = useMemo(() => {
    if (!debouncedHealthScore || cart.length === 0) return null
    return selectHealthInsight(debouncedHealthScore.score, cartItemsWithKeywords)
  }, [debouncedHealthScore, cartItemsWithKeywords, cart.length])

  // Reset insight dismissed state when cart changes significantly
  useEffect(() => {
    setInsightDismissed(false)
  }, [cart.length])

  // ✅ Memoize all calculations to prevent re-renders
  const { productsMap, addonsMap, optionsMap } = useMemo(() => {
    const pMap = allProducts.reduce((map, product) => {
      map[product.id] = product
      return map
    }, {} as Record<string, Product>)

    const aMap: Record<string, any> = {}
    const oMap: Record<string, any> = {}

    productsWithAddons.forEach((productData) => {
      if (productData.addonsList) {
        productData.addonsList.forEach((addon: any) => {
          aMap[addon.id] = addon
        })
      }
      if (productData.customizationRules) {
        productData.customizationRules.forEach((group: any) => {
          group.options.forEach((option: any) => {
            oMap[option.id] = {
              id: option.id,
              name: option.name_ar,
              name_en: option.name_en,
              price: option.price || option.base_price || 0
            }
          })
        })
      }
    })

    return { productsMap: pMap, addonsMap: aMap, optionsMap: oMap }
  }, [allProducts, productsWithAddons.size])

  // ✅ Log only when values actually change
  useEffect(() => {
    debug.cart('Cart calculation', {
      productsCount: Object.keys(productsMap).length,
      addonsCount: Object.keys(addonsMap).length,
      optionsCount: Object.keys(optionsMap).length
    })
  }, [productsMap, addonsMap, optionsMap])

  const total = useMemo(() => 
    getCartTotal(productsMap, addonsMap, optionsMap),
    [getCartTotal, productsMap, addonsMap, optionsMap]
  )

  if (!isOpen) return null

  const totalItems = getCartCount()

  const isEmpty = cart.length === 0

  const handleCheckout = () => {
    if (isEmpty) return
    if (onCheckout) {
      onCheckout()
    }
  }

  const handleClose = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    onClose()
  }

  return (
    <div
      className="fixed inset-0 bg-black/75 backdrop-blur-md z-[9999] flex items-end md:items-center justify-center md:p-6"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="cart-title"
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-t-3xl md:rounded-3xl max-w-[750px] w-full max-h-[92vh] md:max-h-[85vh] overflow-hidden shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800 z-10 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-pink-50 to-rose-50 dark:from-slate-700 dark:to-slate-600 rounded-xl flex items-center justify-center shadow-sm">
              <ShoppingCart className="w-6 h-6 text-[#FF6B9D]" />
            </div>
            <span className="text-xl font-bold text-slate-900 dark:text-white" id="cart-title">
              سلة الطلبات
            </span>
            <span className="min-w-[28px] h-6 px-2.5 bg-gradient-to-r from-[#FF6B9D] to-[#FF5A8E] text-white rounded-full text-sm font-bold flex items-center justify-center shadow-lg">
              {totalItems}
            </span>
          </div>
          <button
            className="w-11 h-11 rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-red-500 hover:text-white flex items-center justify-center transition-[transform,background-color] hover:rotate-90 duration-300 hover:shadow-lg active:scale-95"
            onClick={handleClose}
            aria-label="إغلاق السلة"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="p-5 min-h-[350px] max-h-[calc(92vh-240px)] md:max-h-[calc(85vh-280px)] overflow-y-auto">
          {isEmpty ? (
            // Empty State
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-pink-50 to-rose-50 dark:from-slate-700 dark:to-slate-600 rounded-full flex items-center justify-center mb-5 animate-pulse">
                <ShoppingCart className="w-12 h-12 text-[#FF6B9D]/50" />
              </div>
              <p className="text-lg font-semibold text-slate-600 dark:text-slate-300 mb-2">
                سلتك فارغة حالياً
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                أضف بعض الآيس كريم اللذيذ! 🍦
              </p>
            </div>
          ) : (
            <>
              {/* Cart Items List */}
              <div className="space-y-4">
                {cart.map((item, index) => {
                  const product = allProducts.find(p => p.id === item.productId)
                  if (!product) return null

                  // ✅ Get addons list from fetched product with addons
                  const productWithAddons = productsWithAddons.get(item.productId)
                  const productAddons = productWithAddons?.addonsList || []

                  // ✅ Get customization options from fetched customization rules (with nutrition)
                  const customizationRules = (productWithAddons as any)?.customizationRules || []
                  const customizationOptions: any[] = []

                  customizationRules.forEach((group: any) => {
                    group.options.forEach((option: any) => {
                      customizationOptions.push({
                        id: option.id,
                        name: option.name_ar || option.name,
                        name_en: option.name_en,
                        price: option.price || option.base_price || 0,
                        groupIcon: group.groupIcon,
                        // ✅ Include nutrition data
                        calories: option.calories || option.nutrition?.calories || 0,
                        protein: option.protein || option.nutrition?.protein || 0,
                        carbs: option.carbs || option.nutrition?.carbs || 0,
                        sugar: option.sugar || option.nutrition?.sugar || 0,
                        fat: option.fat || option.nutrition?.fat || 0,
                        fiber: option.fiber || option.nutrition?.fiber || 0,
                        nutrition: option.nutrition || {
                          calories: option.calories || 0,
                          protein: option.protein || 0,
                          carbs: option.carbs || 0,
                          sugar: option.sugar || 0,
                          fat: option.fat || 0,
                          fiber: option.fiber || 0
                        }
                      })
                    })
                  })

                  // Create unique key combining productId, addons, and selections
                  const selectionsKey = item.selections
                    ? Object.entries(item.selections).map(([k, v]) => `${k}:${v.sort().join(',')}`).join('|')
                    : ''
                  const itemKey = `${item.productId}-${(item.selectedAddons || []).sort().join('-')}-${selectionsKey}-${index}`

                  return (
                    <CartItem
                      key={itemKey}
                      item={item}
                      product={product}
                      addons={productAddons}
                      customizationOptions={customizationOptions}
                      onUpdateQuantity={updateCartQuantity}
                      onRemove={removeFromCart}
                    />
                  )
                })}
              </div>

              {/* Healthy Meter */}
              {debouncedHealthScore && (
                <div className="mt-6 px-1">
                  <HealthyMeter result={debouncedHealthScore} />
                </div>
              )}

              {/* Health Insight Card */}
              {healthInsightResult && !insightDismissed && (
                <div className="mt-4 px-1">
                  <Suspense fallback={
                    <div className="rounded-2xl bg-gradient-to-br from-green-50 to-blue-50 p-4 animate-pulse">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 bg-slate-200 rounded-full" />
                        <div className="w-24 h-4 bg-slate-200 rounded" />
                      </div>
                      <div className="space-y-2">
                        <div className="w-full h-3 bg-slate-200 rounded" />
                        <div className="w-3/4 h-3 bg-slate-200 rounded" />
                      </div>
                    </div>
                  }>
                    <HealthInsightCard 
                      insight={healthInsightResult.insight}
                      onDismiss={() => setInsightDismissed(true)}
                      delay={0.5}
                    />
                  </Suspense>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer (Total & Checkout) */}
        <CartSummary
          total={total}
          onCheckout={handleCheckout}
          isEmpty={isEmpty}
        />
      </div>
    </div>
  )
}
