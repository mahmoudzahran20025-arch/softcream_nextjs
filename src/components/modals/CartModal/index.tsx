'use client'

import { useState, useEffect, useMemo, useRef, lazy, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ShoppingCart, ShoppingBag } from 'lucide-react'
import { useCart } from '@/providers/CartProvider'
import { getProduct } from '@/lib/api'
import { debug } from '@/lib/debug'
import { useLanguage } from '@/providers/LanguageProvider'
import { calculateHealthScore } from '@/lib/utils/healthScore'
import { selectHealthInsight, parseHealthKeywords, type CartItemWithKeywords } from '@/lib/health/selectInsight'

import CartItem from './CartItem'
import CartSummary from './CartSummary'
// HealthyMeter available for future use

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
  const { language } = useLanguage()
  const isRTL = language === 'ar'
  const [productsWithAddons, setProductsWithAddons] = useState<Map<string, any>>(new Map())
  const [insightDismissed, setInsightDismissed] = useState(false)
  const fetchedRef = useRef<Set<string>>(new Set())
  const healthScoreDebounceRef = useRef<NodeJS.Timeout | null>(null)
  const [debouncedHealthScore, setDebouncedHealthScore] = useState<any>(null)

  // ✅ Fetch products
  const cartProductIds = useMemo(() => cart.map(item => item.productId).join(','), [cart])

  useEffect(() => {
    if (!isOpen || cart.length === 0) return
    const fetchProductsWithAddons = async () => {
      const newProductsMap = new Map(productsWithAddons)
      let hasNewProducts = false
      for (const item of cart) {
        if (fetchedRef.current.has(item.productId)) continue
        try {
          debug.cart(`Fetching product: ${item.productId}`)
          const productWithAddons = await getProduct(item.productId, { expand: ['options'] })
          if (item.selections) {
            const { getCustomizationRules } = await import('@/lib/api')
            const customizationRules = await getCustomizationRules(item.productId, 'ar')
              ; (productWithAddons as any).customizationRules = customizationRules
          }
          newProductsMap.set(item.productId, productWithAddons)
          fetchedRef.current.add(item.productId)
          hasNewProducts = true
        } catch (error) {
          debug.error(`Failed to fetch product ${item.productId}`, error)
        }
      }
      if (hasNewProducts) setProductsWithAddons(newProductsMap)
    }
    fetchProductsWithAddons()
  }, [cartProductIds, isOpen])

  // ✅ Health Calculations
  const healthScore = useMemo(() => {
    if (cart.length === 0) return null
    return calculateHealthScore(cart, productsWithAddons)
  }, [cart, productsWithAddons])

  useEffect(() => {
    if (healthScoreDebounceRef.current) clearTimeout(healthScoreDebounceRef.current)
    healthScoreDebounceRef.current = setTimeout(() => setDebouncedHealthScore(healthScore), 300)
    return () => { if (healthScoreDebounceRef.current) clearTimeout(healthScoreDebounceRef.current) }
  }, [healthScore])

  const cartItemsWithKeywords: CartItemWithKeywords[] = useMemo(() => {
    return cart.map(item => {
      const product = productsWithAddons.get(item.productId)
      const healthKeywords = parseHealthKeywords(product?.health_keywords)
      return { productId: item.productId, quantity: item.quantity, health_keywords: healthKeywords }
    })
  }, [cart, productsWithAddons])

  const healthInsightResult = useMemo(() => {
    if (!debouncedHealthScore || cart.length === 0) return null
    return selectHealthInsight(debouncedHealthScore.score, cartItemsWithKeywords)
  }, [debouncedHealthScore, cartItemsWithKeywords, cart.length])

  useEffect(() => setInsightDismissed(false), [cart.length])

  // ✅ Cart Totals Cache
  const { productsMap, addonsMap, optionsMap } = useMemo(() => {
    const pMap = allProducts.reduce((map, product) => { map[product.id] = product; return map }, {} as Record<string, Product>)
    const aMap: Record<string, any> = {}
    const oMap: Record<string, any> = {}
    productsWithAddons.forEach((productData) => {
      productData.addonsList?.forEach((addon: any) => aMap[addon.id] = addon)
      productData.customizationRules?.forEach((group: any) => group.options.forEach((option: any) => {
        oMap[option.id] = { id: option.id, name: option.name_ar, name_en: option.name_en, price: option.price || option.base_price || 0 }
      }))
    })
    return { productsMap: pMap, addonsMap: aMap, optionsMap: oMap }
  }, [allProducts, productsWithAddons.size])

  const total = useMemo(() => getCartTotal(productsMap, addonsMap, optionsMap), [getCartTotal, productsMap, addonsMap, optionsMap])

  // Lock Body Scroll
  useEffect(() => {
    if (isOpen) { document.body.style.overflow = 'hidden' }
    else { document.body.style.overflow = 'unset' }
    return () => { document.body.style.overflow = 'unset' }
  }, [isOpen])

  if (!isOpen) return null

  const totalItems = getCartCount()
  const isEmpty = cart.length === 0

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal Drawer */}
          <motion.div
            initial={{ x: isRTL ? '-100%' : '100%' }}
            animate={{ x: 0 }}
            exit={{ x: isRTL ? '-100%' : '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className={`relative w-full max-w-md h-full bg-white dark:bg-slate-900 shadow-2xl flex flex-col ${isRTL ? 'rounded-r-2xl' : 'rounded-l-2xl'}`}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-pink-100 dark:bg-pink-900/20 flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-pink-500" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    {language === 'ar' ? 'سلة الطلبات' : 'My Cart'}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {totalItems} {language === 'ar' ? 'عنصر' : 'items'}
                  </p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                <X className="w-6 h-6 text-slate-500" />
              </button>
            </div>

            {/* Cart Items & Health - Scrollable */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {isEmpty ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4 text-slate-400">
                  <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center animate-pulse">
                    <ShoppingBag className="w-10 h-10 opacity-20" />
                  </div>
                  <p className="text-lg font-medium">{language === 'ar' ? 'سلتك فارغة' : 'Your cart is empty'}</p>
                  <p className="text-sm max-w-[200px]">{language === 'ar' ? 'أضف بعض الآيس كريم اللذيذ!' : 'Add some delicious ice cream!'}</p>
                </div>
              ) : (
                <>
                  {/* Items List */}
                  <div className="space-y-3">
                    {cart.map((item, index) => {
                      const product = allProducts.find(p => p.id === item.productId)
                      if (!product) return null
                      const productWithAddons = productsWithAddons.get(item.productId)
                      const productAddons = productWithAddons?.addonsList || []
                      const customizationRules = (productWithAddons as any)?.customizationRules || []
                      const customizationOptions: any[] = []
                      customizationRules.forEach((group: any) => group.options.forEach((option: any) => customizationOptions.push({
                        id: option.id, name: option.name_ar || option.name, name_en: option.name_en, price: option.price || 0,
                        calories: option.calories || 0, protein: option.protein || 0, sugar: option.sugar || 0, groupIcon: group.groupIcon
                      })))

                      const selectionsKey = item.selections ? Object.entries(item.selections).map(([k, v]) => `${k}:${v.sort().join(',')}`).join('|') : ''
                      const itemKey = `${item.productId}-${(item.selectedAddons || []).sort().join('-')}-${selectionsKey}-${index}`

                      return (
                        <CartItem
                          key={itemKey} item={item} product={product} addons={productAddons}
                          customizationOptions={customizationOptions} onUpdateQuantity={updateCartQuantity} onRemove={removeFromCart}
                        />
                      )
                    })}
                  </div>



                  {/* Health Insight Card (Premium Redesign) */}
                  {healthInsightResult && !insightDismissed && (
                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                      <Suspense fallback={<div className="h-24 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />}>
                        <HealthInsightCard
                          insight={healthInsightResult.insight}
                          onDismiss={() => setInsightDismissed(true)}
                          delay={0.2}
                        />
                      </Suspense>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer Summary */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-slate-100 dark:border-slate-800">
              <CartSummary total={total} onCheckout={() => { if (!isEmpty) onCheckout?.() }} isEmpty={isEmpty} />
            </div>

          </motion.div>
        </div >
      )
      }
    </AnimatePresence >
  )
}
