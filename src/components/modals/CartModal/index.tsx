'use client'

import { useState, useEffect } from 'react'
import { X, ShoppingCart, Calculator, ShieldCheck, Truck, CheckCircle2, Minus, Plus, Trash2, Flame, Droplets, Wheat, Activity } from 'lucide-react'
import { useCart } from '@/providers/CartProvider'

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
  const { cart, updateCartQuantity, removeFromCart, getCartCount } = useCart()
  const [nutritionData, setNutritionData] = useState<any>(null)

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
  const total = cart.reduce((sum, item) => {
    const product = allProducts.find(p => p.id === item.productId)
    return sum + ((product?.price || 0) * item.quantity)
  }, 0)

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
            <div className="w-11 h-11 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-xl flex items-center justify-center shadow-sm">
              <ShoppingCart className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <span className="text-xl font-bold text-slate-900 dark:text-white" id="cart-title">
              سلة الطلبات
            </span>
            <span className="min-w-[28px] h-6 px-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full text-sm font-bold flex items-center justify-center shadow-lg">
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
              <div className="w-24 h-24 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-slate-700 dark:to-slate-600 rounded-full flex items-center justify-center mb-5 animate-pulse">
                <ShoppingCart className="w-12 h-12 text-purple-300 dark:text-slate-500" />
              </div>
              <p className="text-lg font-semibold text-slate-600 dark:text-slate-300 mb-2">
                سلتك فارغة حالياً
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                أضف بعض الآيس كريم اللذيذ! 🍦
              </p>
            </div>
          ) : (
            // Cart Items List
            <div className="space-y-4">
              {cart.map((item) => {
                const product = allProducts.find(p => p.id === item.productId)
                if (!product) return null

                return (
                  <div
                    key={item.productId}
                    className="flex gap-4 p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-slate-700 dark:to-slate-600 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
                  >
                    {/* Product Image */}
                    {product.image && (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-20 h-20 object-cover rounded-xl"
                        loading="lazy"
                      />
                    )}

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-900 dark:text-white truncate">
                        {product.name}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        {product.price} ج.م
                      </p>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => updateCartQuantity(item.productId, item.quantity - 1)}
                          className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 hover:bg-purple-600 hover:text-white flex items-center justify-center transition-colors"
                          aria-label="تقليل الكمية"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="font-bold text-slate-900 dark:text-white min-w-[30px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                          className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 hover:bg-purple-600 hover:text-white flex items-center justify-center transition-colors"
                          aria-label="زيادة الكمية"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => removeFromCart(item.productId)}
                          className="ml-auto w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 hover:bg-red-500 text-red-500 hover:text-white flex items-center justify-center transition-colors"
                          aria-label="حذف المنتج"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Item Total */}
                    <div className="text-right">
                      <p className="font-bold text-lg text-purple-600 dark:text-purple-400">
                        {product.price * item.quantity} ج.م
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Nutrition Summary */}
          {!isEmpty && nutritionData && (
            <div className="mt-6 p-4 bg-gradient-to-br from-orange-50 to-pink-50 dark:from-slate-700 dark:to-slate-600 border border-orange-100 dark:border-slate-600 rounded-2xl">
              <h3 className="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-500" />
                ملخص التغذية
              </h3>
              
              {/* Macros Grid */}
              <div className="grid grid-cols-4 gap-2">
                <div className="bg-white dark:bg-slate-800 rounded-xl p-3 text-center shadow-sm">
                  <Flame className="w-5 h-5 text-orange-500 mx-auto mb-1" />
                  <div className="text-lg font-bold text-slate-900 dark:text-white">
                    {nutritionData.totalCalories || 0}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">سعرات</div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-3 text-center shadow-sm">
                  <Droplets className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                  <div className="text-lg font-bold text-slate-900 dark:text-white">
                    {(nutritionData.totalProtein || 0).toFixed(1)}g
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">بروتين</div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-3 text-center shadow-sm">
                  <Wheat className="w-5 h-5 text-yellow-600 mx-auto mb-1" />
                  <div className="text-lg font-bold text-slate-900 dark:text-white">
                    {(nutritionData.totalCarbs || 0).toFixed(1)}g
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">كربوهيدرات</div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-3 text-center shadow-sm">
                  <Activity className="w-5 h-5 text-red-500 mx-auto mb-1" />
                  <div className="text-lg font-bold text-slate-900 dark:text-white">
                    {(nutritionData.totalFat || 0).toFixed(1)}g
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">دهون</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer (Total & Checkout) */}
        {!isEmpty && (
          <div className="p-5 border-t border-slate-200 dark:border-slate-700 space-y-4 sticky bottom-0 bg-white dark:bg-slate-800 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] z-10">
            {/* Total */}
            <div className="flex justify-between items-center bg-gradient-to-r from-purple-50 to-pink-50 dark:from-slate-700 dark:to-slate-600 rounded-2xl p-4 shadow-sm border border-purple-100 dark:border-slate-600">
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <span className="text-lg font-bold text-slate-700 dark:text-slate-300">
                  الإجمالي:
                </span>
              </div>
              <span className="text-2xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {total} ج.م
              </span>
            </div>

            {/* Checkout Button */}
            <button
              onClick={handleCheckout}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-3 shadow-lg transition-[transform,box-shadow] hover:-translate-y-1 hover:shadow-xl active:scale-95 relative overflow-hidden group"
            >
              <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <CheckCircle2 className="w-6 h-6 relative z-10" />
              <span className="relative z-10">إتمام الطلب</span>
            </button>

            {/* Trust Badges */}
            <div className="flex items-center justify-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-green-500" />
                <span>دفع آمن</span>
              </div>
              <div className="w-1 h-1 bg-slate-300 dark:bg-slate-600 rounded-full" />
              <div className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-blue-500" />
                <span>توصيل سريع</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
