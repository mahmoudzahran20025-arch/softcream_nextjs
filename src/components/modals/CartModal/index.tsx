'use client'

import { useState, useEffect } from 'react'
import { X, ShoppingCart } from 'lucide-react'
import { useCart } from '@/providers/CartProvider'
import { getProduct } from '@/lib/api'
import CartItem from './CartItem'
import CartSummary from './CartSummary'
import NutritionCard from '@/components/ui/NutritionCard'

interface Product {
  id: string
  name: string
  nameEn?: string
  price: number
  image?: string
  category?: string
  description?: string
}


interface CartModalProps {
  isOpen: boolean
  onClose: () => void
  onCheckout?: () => void
  allProducts?: Product[]
}

export default function CartModal({ isOpen, onClose, onCheckout, allProducts = [] }: CartModalProps) {
  const { cart, updateCartQuantity, removeFromCart, getCartCount, getCartTotal } = useCart()
  const [nutritionData, setNutritionData] = useState<any>(null)
  const [productsWithAddons, setProductsWithAddons] = useState<Map<string, any>>(new Map())

  // ✅ FIX: Fetch products with addons for cart items
  useEffect(() => {
    if (!isOpen || cart.length === 0) return

    const fetchProductsWithAddons = async () => {
      const newProductsMap = new Map()
      
      for (const item of cart) {
        // Skip if already fetched
        if (productsWithAddons.has(item.productId)) {
          newProductsMap.set(item.productId, productsWithAddons.get(item.productId))
          continue
        }

        try {
          const productWithAddons = await getProduct(item.productId, { expand: ['addons'] })
          newProductsMap.set(item.productId, productWithAddons)
        } catch (error) {
          console.error(`Failed to fetch addons for product ${item.productId}:`, error)
        }
      }

      setProductsWithAddons(newProductsMap)
    }

    fetchProductsWithAddons()
  }, [cart, isOpen])

  // Calculate nutrition summary from cart items
  useEffect(() => {
    if (cart.length === 0) {
      setNutritionData(null)
      return
    }

    const calculateNutrition = () => {
      let totalCalories = 0
      let totalProtein = 0
      let totalCarbs = 0
      let totalFat = 0

      cart.forEach(item => {
        const product = allProducts.find(p => p.id === item.productId)
        if (product) {
          // Assuming these properties exist on product
          const prod = product as any
          totalCalories += (prod.calories || 0) * item.quantity
          totalProtein += (prod.protein || 0) * item.quantity
          totalCarbs += (prod.carbs || 0) * item.quantity
          totalFat += (prod.fat || 0) * item.quantity
        }
      })

      setNutritionData({
        totalCalories,
        totalProtein,
        totalCarbs,
        totalFat
      })
    }

    calculateNutrition()
  }, [cart, allProducts])

  if (!isOpen) return null

  const totalItems = getCartCount()
  
  // ✅ FIX: Build products map for getCartTotal
  const productsMap = allProducts.reduce((map, product) => {
    map[product.id] = product
    return map
  }, {} as Record<string, Product>)
  
  // ✅ FIX: Use getCartTotal which includes addons prices
  const total = getCartTotal(productsMap)

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

                  // ✅ FIX: Get addons list from fetched product with addons
                  const productWithAddons = productsWithAddons.get(item.productId)
                  const productAddons = productWithAddons?.addonsList || []

                  // Create unique key combining productId and addons
                  const itemKey = `${item.productId}-${(item.selectedAddons || []).sort().join('-')}-${index}`

                  return (
                    <CartItem
                      key={itemKey}
                      item={item}
                      product={product}
                      addons={productAddons}
                      onUpdateQuantity={updateCartQuantity}
                      onRemove={removeFromCart}
                    />
                  )
                })}
              </div>

              {/* Nutrition Summary */}
              {nutritionData && (
                <NutritionCard nutritionData={nutritionData} />
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
