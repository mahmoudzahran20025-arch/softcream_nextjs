'use client'

import { useState, useEffect } from 'react'
import { X, Plus, Minus, Trash2, Flame, Droplets, Wheat, Activity, ShoppingCart } from 'lucide-react'
import { useCart } from '@/providers/CartProvider'

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
  const { cart, updateCartQuantity, removeFromCart } = useCart()
  const [nutritionData, setNutritionData] = useState<NutritionData | null>(null)

  // Calculate nutrition summary
  useEffect(() => {
    if (cart.length === 0) {
      setNutritionData(null)
      return
    }

    const calculateNutrition = () => {
      const totals = cart.reduce(
        (acc, item: any) => ({
          totalCalories: acc.totalCalories + ((item.calories || 0) * item.quantity),
          totalProtein: acc.totalProtein + ((item.protein || 0) * item.quantity),
          totalCarbs: acc.totalCarbs + ((item.carbs || 0) * item.quantity),
          totalFat: acc.totalFat + ((item.fat || 0) * item.quantity),
          totalSugar: acc.totalSugar + ((item.sugar || 0) * item.quantity),
        }),
        {
          totalCalories: 0,
          totalProtein: 0,
          totalCarbs: 0,
          totalFat: 0,
          totalSugar: 0,
        }
      )

      setNutritionData(totals)
    }

    calculateNutrition()
  }, [cart])

  if (!isOpen) return null

  const subtotal = cart.reduce((sum, item: any) => sum + item.price * item.quantity, 0)
  const totalItems = cart.reduce((sum, item: any) => sum + item.quantity, 0)

  const nutritionItems = [
    { icon: Flame, label: 'السعرات', value: nutritionData?.totalCalories || 0, unit: 'kcal', color: 'text-orange-500' },
    { icon: Droplets, label: 'البروتين', value: nutritionData?.totalProtein || 0, unit: 'g', color: 'text-red-500' },
    { icon: Wheat, label: 'الكربوهيدرات', value: nutritionData?.totalCarbs || 0, unit: 'g', color: 'text-yellow-500' },
    { icon: Activity, label: 'الدهون', value: nutritionData?.totalFat || 0, unit: 'g', color: 'text-pink-500' },
  ]

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
            {nutritionItems.map((item, index) => {
              const Icon = item.icon
              return (
                <div key={index} className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-600 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className={`w-5 h-5 ${item.color}`} />
                    <p className="text-xs text-slate-600 dark:text-slate-400">{item.label}</p>
                  </div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {Math.round(item.value)}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{item.unit}</p>
                </div>
              )
            })}
          </div>

          {/* Cart Items */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 dark:text-white">المنتجات ({totalItems})</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {cart.map((item: any) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-slate-900 dark:text-white">{item.name}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {item.price} ج.م × {item.quantity}
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateCartQuantity(item.productId, item.quantity - 1)}
                      className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-600 hover:bg-red-500 text-slate-700 dark:text-white hover:text-white flex items-center justify-center transition-colors"
                      aria-label="تقليل"
                    >
                      <Minus className="w-4 h-4" />
                    </button>

                    <span className="w-6 text-center font-bold text-slate-900 dark:text-white">
                      {item.quantity}
                    </span>

                    <button
                      onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                      className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-600 hover:bg-green-500 text-slate-700 dark:text-white hover:text-white flex items-center justify-center transition-colors"
                      aria-label="إضافة"
                    >
                      <Plus className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => removeFromCart(item.productId)}
                      className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-600 hover:bg-red-500 text-slate-700 dark:text-white hover:text-white flex items-center justify-center transition-colors"
                      aria-label="حذف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="border-t border-slate-200 dark:border-slate-700 pt-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-slate-600 dark:text-slate-400">المجموع:</span>
              <span className="font-bold text-lg text-slate-900 dark:text-white">
                {subtotal} ج.م
              </span>
            </div>
          </div>

          {/* Checkout Button */}
          <button
            onClick={() => {
              onCheckout?.()
              onClose()
            }}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-bold transition-all flex items-center justify-center gap-2"
          >
            <ShoppingCart className="w-5 h-5" />
            متابعة للدفع
          </button>
        </div>
      </div>
    </div>
  )
}
