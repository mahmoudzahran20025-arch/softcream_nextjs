'use client'

import { useMemo } from 'react'
import { Trash2, Flame, Dumbbell } from 'lucide-react'
import QuantitySelector from '@/components/ui/common/QuantitySelector'
import PriceDisplay from '@/components/ui/common/PriceDisplay'

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
}

interface CartItemData {
  productId: string
  quantity: number
  selectedAddons?: string[]
  selections?: Record<string, string[]> // BYO customization selections
}

interface CartItemProps {
  item: CartItemData
  product: Product
  addons?: any[] // Array of addon objects with id, name, price
  customizationOptions?: any[] // Array of BYO options with id, name, price, groupIcon
  onUpdateQuantity: (productId: string, quantity: number, addons?: string[], selections?: Record<string, string[]>) => void
  onRemove: (productId: string, addons?: string[], selections?: Record<string, string[]>) => void
}

export default function CartItem({ item, product, addons = [], customizationOptions = [], onUpdateQuantity, onRemove }: CartItemProps) {
  // ✅ Check for pre-calculated price (BYO products with sizes)
  const hasCalculatedPrice = item.selections?._calculatedPrice && parseFloat(item.selections._calculatedPrice[0]) > 0
  const calculatedPrice = hasCalculatedPrice ? parseFloat(item.selections!._calculatedPrice![0]) : 0

  // ✅ Extract container and size info
  const containerInfo = item.selections?._container
  const sizeInfo = item.selections?._size
  const containerPrice = containerInfo ? parseFloat(containerInfo[2] || '0') : 0
  const sizePrice = sizeInfo ? parseFloat(sizeInfo[2] || '0') : 0

  // ✅ Calculate legacy addons total
  const addonsTotal = (item.selectedAddons || []).reduce((sum, addonId) => {
    const addon = addons.find(a => a.id === addonId)
    return sum + (addon?.price || 0)
  }, 0)

  // ✅ Calculate BYO customization total (excluding special keys)
  const customizationTotal = item.selections
    ? Object.entries(item.selections)
      .filter(([key]) => !key.startsWith('_')) // Exclude _container, _size, _calculatedPrice
      .flatMap(([, values]) => values)
      .reduce((sum, optionId) => {
        const option = customizationOptions.find(o => o.id === optionId)
        return sum + (option?.price || 0)
      }, 0)
    : 0

  // ✅ Calculate item total
  const itemTotal = hasCalculatedPrice
    ? calculatedPrice * item.quantity
    : (product.price + containerPrice + sizePrice + addonsTotal + customizationTotal) * item.quantity

  // ✅ Check if this is a customizable product (has selections other than special keys)
  const customSelections = item.selections
    ? Object.entries(item.selections).filter(([key]) => !key.startsWith('_'))
    : []
  const isCustomizable = customSelections.length > 0 || !!containerInfo || !!sizeInfo

  // ✅ Calculate item nutrition for badges
  const itemNutrition = useMemo(() => {
    let calories = product.calories || 0
    let protein = product.protein || 0
    let sugar = product.sugar || 0

    // Add customization nutrition
    if (item.selections) {
      Object.entries(item.selections).forEach(([key, values]) => {
        if (key.startsWith('_')) return
        if (!Array.isArray(values)) return
        values.forEach(optionId => {
          const option = customizationOptions.find(o => o.id === optionId)
          if (option) {
            calories += option.calories || option.nutrition?.calories || 0
            protein += option.protein || option.nutrition?.protein || 0
            sugar += option.sugar || option.nutrition?.sugar || 0
          }
        })
      })
    }
    return { calories, protein, sugar }
  }, [product, item.selections, customizationOptions])

  return (
    <div className="relative group p-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl hover:border-pink-200 dark:hover:border-pink-800 transition-all shadow-sm">
      <div className="flex gap-3">
        {/* Product Image */}
        {product.image && (
          <img
            src={product.image}
            alt={product.name}
            className="w-20 h-20 object-cover rounded-xl bg-slate-100 dark:bg-slate-700 flex-shrink-0"
            loading="lazy"
          />
        )}

        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start gap-2">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-2">
                {product.name}
              </h3>
              {/* Base Price */}
              <div className="mt-0.5">
                <PriceDisplay
                  price={hasCalculatedPrice ? calculatedPrice : product.price}
                  size="sm"
                  className="text-slate-500 font-medium"
                />
              </div>
            </div>
            {/* Item Total (Top Right) */}
            <div className="flex-shrink-0">
              <PriceDisplay price={itemTotal} size="sm" className="font-black text-pink-500" />
            </div>
          </div>

          {/* Selections (Container/Size) */}
          {(containerInfo || sizeInfo) && (
            <div className="flex flex-wrap gap-1 mt-2">
              {containerInfo && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-bold border border-blue-100 flex items-center gap-1">
                  <span>🥤</span> {containerInfo[1]}
                </span>
              )}
              {sizeInfo && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 font-bold border border-amber-100 flex items-center gap-1">
                  <span>📏</span> {sizeInfo[1]}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Customizations & Addons (Full Width below) */}
      {(customSelections.length > 0 || (!isCustomizable && item.selectedAddons && item.selectedAddons.length > 0)) && (
        <div className="mt-2.5 pt-2.5 border-t border-slate-50 dark:border-slate-700/50 flex flex-wrap gap-1">
          {customSelections.flatMap(([, values]) => values).map((optionId) => {
            const option = customizationOptions.find(o => o.id === optionId)
            if (!option) return null
            return (
              <span key={optionId} className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                {option.name}
              </span>
            )
          })}
          {!isCustomizable && item.selectedAddons?.map(addonId => {
            const addon = addons.find(a => a.id === addonId)
            if (!addon) return null
            return (
              <span key={addonId} className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-100">
                +{addon.name}
              </span>
            )
          })}
        </div>
      )}

      {/* Bottom Row: Quantity & Remove (Left) -- Nutrition (Right) */}
      <div className="flex items-center justify-between mt-3 gap-2">
        <div className="flex items-center gap-2">
          <QuantitySelector
            quantity={item.quantity}
            onIncrease={() => onUpdateQuantity(item.productId, item.quantity + 1, item.selectedAddons, item.selections)}
            onDecrease={() => onUpdateQuantity(item.productId, item.quantity - 1, item.selectedAddons, item.selections)}
            size="sm"
          />
          <button
            onClick={() => onRemove(item.productId, item.selectedAddons, item.selections)}
            className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Nutrition Mini Badges (Stacked: Protein Top, Calories Bottom) */}
        <div className="flex flex-col items-end gap-1">
          {itemNutrition.protein > 0 && (
            <span className="flex items-center gap-1 text-[10px] text-blue-600 font-bold bg-blue-50 px-1.5 py-0.5 rounded-md border border-blue-100">
              <Dumbbell className="w-3 h-3" /> {Math.round(itemNutrition.protein)}g
            </span>
          )}
          {itemNutrition.calories > 0 && (
            <span className="flex items-center gap-1 text-[10px] text-orange-600 font-bold bg-orange-50 px-1.5 py-0.5 rounded-md border border-orange-100">
              <Flame className="w-3 h-3" /> {Math.round(itemNutrition.calories)}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
