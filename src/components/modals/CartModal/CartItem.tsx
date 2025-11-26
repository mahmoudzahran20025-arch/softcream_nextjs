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
}

interface CartItemProps {
  item: CartItemData
  product: Product
  addons?: any[] // Array of addon objects with id, name, price
  onUpdateQuantity: (productId: string, quantity: number, addons?: string[]) => void
  onRemove: (productId: string, addons?: string[]) => void
}

export default function CartItem({ item, product, addons = [], onUpdateQuantity, onRemove }: CartItemProps) {
  // ✅ FIX: Calculate addons total properly
  const addonsTotal = (item.selectedAddons || []).reduce((sum, addonId) => {
    const addon = addons.find(a => a.id === addonId)
    return sum + (addon?.price || 0)
  }, 0)
  
  // ✅ FIX: Calculate item total: (base price + addons) * quantity
  const itemTotal = (product.price + addonsTotal) * item.quantity

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
        <div className="mt-1">
          <PriceDisplay price={product.price} size="sm" />
        </div>
        
        {/* Show selected addons with names and prices */}
        {item.selectedAddons && item.selectedAddons.length > 0 && (
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

        {/* Quantity Controls */}
        <div className="flex items-center gap-3 mt-3">
          <QuantitySelector
            quantity={item.quantity}
            onIncrease={() => onUpdateQuantity(item.productId, item.quantity + 1, item.selectedAddons)}
            onDecrease={() => onUpdateQuantity(item.productId, item.quantity - 1, item.selectedAddons)}
            size="sm"
          />
          
          <button
            onClick={() => onRemove(item.productId, item.selectedAddons)}
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
