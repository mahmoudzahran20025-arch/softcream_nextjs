'use client'

import { Trash2 } from 'lucide-react'
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

  return (
    <div className="flex gap-4 p-4 bg-gradient-to-br from-pink-50 to-rose-50 dark:from-slate-700 dark:to-slate-600 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
      {/* Product Image */}
      {product.image && (
        <img
          src={product.image}
          alt={product.name}
          className="w-20 h-20 object-cover rounded-xl flex-shrink-0"
          loading="lazy"
        />
      )}

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-slate-900 dark:text-white truncate">
          {product.name}
        </h3>
        {/* ✅ FIX: Show calculated price for BYO products, or base price for regular products */}
        <div className="mt-1">
          <PriceDisplay 
            price={hasCalculatedPrice ? calculatedPrice : product.price} 
            size="sm" 
          />
        </div>

        {/* Show container and size info */}
        {(containerInfo || sizeInfo) && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {containerInfo && (
              <span className="text-xs px-2 py-1 rounded-full border font-medium flex items-center gap-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700">
                <span>🥤</span>
                <span>{containerInfo[1]}</span>
                {containerPrice > 0 && <span className="text-[10px] opacity-75">(+{containerPrice} ج.م)</span>}
              </span>
            )}
            {sizeInfo && (
              <span className="text-xs px-2 py-1 rounded-full border font-medium flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-700">
                <span>📏</span>
                <span>{sizeInfo[1]}</span>
                {sizePrice > 0 && <span className="text-[10px] opacity-75">({sizePrice} ج.م)</span>}
              </span>
            )}
          </div>
        )}

        {/* Show BYO customization selections */}
        {customSelections.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {customSelections.flatMap(([, values]) => values).map((optionId) => {
              const option = customizationOptions.find(o => o.id === optionId)
              if (!option) return null

              const isFree = option.price === 0

              return (
                <span
                  key={optionId}
                  className={`text-xs px-2 py-1 rounded-full border font-medium flex items-center gap-1 ${isFree
                      ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700'
                      : 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700'
                    }`}
                >
                  {option.groupIcon && <span>{option.groupIcon}</span>}
                  <span>{option.name}</span>
                  {!isFree && (
                    <span className="text-[10px] opacity-75">(+{option.price} ج.م)</span>
                  )}
                </span>
              )
            })}
          </div>
        )}

        {/* Show legacy addons (for non-customizable products) */}
        {!isCustomizable && item.selectedAddons && item.selectedAddons.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {item.selectedAddons.map((addonId) => {
              const addon = addons.find(a => a.id === addonId)
              if (!addon) return null

              return (
                <span
                  key={addonId}
                  className="text-xs bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 px-2 py-1 rounded-full border border-purple-200 dark:border-purple-700 font-medium flex items-center gap-1"
                >
                  <span>+{addon.name}</span>
                  <span className="text-[10px] opacity-75">({addon.price} ج.م)</span>
                </span>
              )
            })}
          </div>
        )}

        {/* ✅ Nutrition Summary (New) */}
        {customSelections.length > 0 && (
          <div className="mt-3 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
            {(() => {
              const nutrition = customSelections.flatMap(([, values]) => values).reduce((acc, optionId) => {
                const option = customizationOptions.find(o => o.id === optionId)
                if (option?.nutrition) {
                  acc.calories += option.nutrition.calories || 0
                  acc.protein += option.nutrition.protein || 0
                } else if (option?.calories) { // Fallback if nutrition is flat
                  acc.calories += option.calories || 0
                  acc.protein += option.protein || 0
                }
                return acc
              }, { calories: 0, protein: 0 })

              // Add base product nutrition if available (optional, maybe just show added nutrition)
              // For now, let's show total if we have data

              if (nutrition.calories > 0) {
                return (
                  <>
                    <span className="flex items-center gap-1 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 px-2 py-0.5 rounded-md">
                      <span>🔥</span>
                      <span>{nutrition.calories} سعرة</span>
                    </span>
                    {nutrition.protein > 0 && (
                      <span className="flex items-center gap-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-md">
                        <span>💪</span>
                        <span>{nutrition.protein}g بروتين</span>
                      </span>
                    )}
                  </>
                )
              }
              return null
            })()}
          </div>
        )}

        {/* Quantity Controls */}
        <div className="flex items-center gap-3 mt-3">
          <QuantitySelector
            quantity={item.quantity}
            onIncrease={() => onUpdateQuantity(item.productId, item.quantity + 1, item.selectedAddons, item.selections)}
            onDecrease={() => onUpdateQuantity(item.productId, item.quantity - 1, item.selectedAddons, item.selections)}
            size="sm"
          />

          <button
            onClick={() => onRemove(item.productId, item.selectedAddons, item.selections)}
            className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 hover:bg-red-500 text-red-500 hover:text-white flex items-center justify-center transition-colors"
            aria-label="حذف المنتج"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Item Total */}
      <div className="text-right flex-shrink-0">
        <PriceDisplay price={itemTotal} size="md" className="font-extrabold" />
      </div>
    </div>
  )
}
