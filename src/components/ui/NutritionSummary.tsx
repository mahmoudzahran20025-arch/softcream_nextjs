'use client'

import { useState, useEffect } from 'react'
import { X, ShoppingCart } from 'lucide-react'
import { useCart } from '@/providers/CartProvider'
import { useProductsData } from '@/providers/ProductsProvider'
import NutritionIcon from './common/NutritionIcon'
import QuantitySelector from './common/QuantitySelector'
import PriceDisplay from './common/PriceDisplay'

interface NutritionData {
  totalCalories: number
  totalProtein: number
  totalCarbs: number
  totalFat: number
  totalSugar: number
}

interface NutritionSummaryProps {
  isOpen: boolean
  onClose: () => void
  onCheckout?: () => void
}

export default function NutritionSummary({ isOpen, onClose, onCheckout }: NutritionSummaryProps) {
  const { cart, updateCartQuantity } = useCart()
  const { productsMap } = useProductsData()
  const [nutritionData, setNutritionData] = useState<NutritionData | null>(null)

  // Calculate nutrition summary
  useEffect(() => {
    if (cart.length === 0) {
      setNutritionData(null)
      return
    }

    const calculateNutrition = () => {
      const totals = cart.reduce(
        (acc, item: any) => {
          const product = productsMap[item.productId]
          const calories = product?.calories || 0
          const protein = product?.protein || 0
          const carbs = product?.carbs || 0
          const fat = product?.fat || 0
          const sugar = product?.sugar || 0

          return {
            totalCalories: acc.totalCalories + calories * item.quantity,
            totalProtein: acc.totalProtein + protein * item.quantity,
            totalCarbs: acc.totalCarbs + carbs * item.quantity,
            totalFat: acc.totalFat + fat * item.quantity,
            totalSugar: acc.totalSugar + sugar * item.quantity,
          }
        },
        {
          totalCalories: 0,
          totalProtein: 0,
          totalCarbs: 0,
          totalFat: 0,
          totalSugar: 0,
        },
      )

      setNutritionData(totals)
    }

    calculateNutrition()
  }, [cart, productsMap])

  if (!isOpen) return null

  const subtotal = cart.reduce((sum, item: any) => {
    const product = productsMap[item.productId]
    return sum + ((product?.price || 0) * item.quantity)
  }, 0)
  const totalItems = cart.reduce((sum, item: any) => sum + item.quantity, 0)

  return (
    <div
      className="fixed inset-0 bg-black/75 backdrop-blur-md z-[9999] flex items-end md:items-center justify-center md:p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-t-3xl md:rounded-3xl max-w-[500px] w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800 z-10">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            ملخص التغذية
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-red-500 hover:text-white flex items-center justify-center transition-colors"
            aria-label="إغلاق"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Nutrition Cards */}
          <div className="grid grid-cols-2 gap-3">
            <NutritionIcon
              type="calories"
              value={Math.round(nutritionData?.totalCalories || 0)}
              size="lg"
              variant="colored"
            />
            <NutritionIcon
              type="protein"
              value={parseFloat((nutritionData?.totalProtein || 0).toFixed(1))}
              size="lg"
              variant="colored"
            />
            <NutritionIcon
              type="carbs"
              value={parseFloat((nutritionData?.totalCarbs || 0).toFixed(1))}
              size="lg"
              variant="colored"
            />
            <NutritionIcon
              type="fat"
              value={parseFloat((nutritionData?.totalFat || 0).toFixed(1))}
              size="lg"
              variant="colored"
            />
          </div>

          {/* Cart Items */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 dark:text-white">المنتجات ({totalItems})</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {cart.map((item: any) => {
                const product = productsMap[item.productId]
                if (!product) return null

                return (
                  <div key={item.productId} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 dark:text-white truncate">{product.name}</p>
                      <PriceDisplay price={product.price} size="sm" />
                    </div>

                    {/* Quantity Controls */}
                    <QuantitySelector
                      quantity={item.quantity}
                      onIncrease={() => updateCartQuantity(item.productId, item.quantity + 1)}
                      onDecrease={() => updateCartQuantity(item.productId, item.quantity - 1)}
                      size="sm"
                    />
                  </div>
                )
              })}
            </div>
          </div>

          {/* Summary */}
          <div className="border-t border-slate-200 dark:border-slate-700 pt-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-slate-600 dark:text-slate-400">المجموع:</span>
              <PriceDisplay price={subtotal} size="lg" className="font-extrabold" />
            </div>
          </div>

          {/* Checkout Button */}
          <button
            onClick={() => {
              onCheckout?.()
              onClose()
            }}
            className="w-full py-3 bg-gradient-to-r from-[#FF6B9D] to-[#FF5A8E] hover:from-[#FF5A8E] hover:to-[#FF4979] text-white rounded-lg font-bold transition-all flex items-center justify-center gap-2 shadow-lg"
          >
            <ShoppingCart className="w-5 h-5" />
            متابعة للدفع
          </button>
        </div>
      </div>
    </div>
  )
}
