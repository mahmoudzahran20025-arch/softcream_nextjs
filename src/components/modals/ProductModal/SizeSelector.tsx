'use client'

import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { ProductSize } from '@/lib/api'

interface SizeSelectorProps {
  sizes: ProductSize[]
  selectedSize: string | null
  onSelect: (sizeId: string) => void
  basePrice: number
  showPriceAsTotal?: boolean
  showHeader?: boolean // Option to hide header if parent provides one
}

export default function SizeSelector({
  sizes,
  selectedSize,
  onSelect,
  basePrice,
  showPriceAsTotal = false,
  showHeader = false // Default: no header (parent handles it)
}: SizeSelectorProps) {
  if (!sizes || sizes.length === 0) return null
  if (sizes.length === 1) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-2"
    >
      {/* Optional Header - only if showHeader is true */}
      {showHeader && (
        <h4 className="font-semibold text-slate-700 dark:text-slate-300 text-sm">
          اختر المقاس
        </h4>
      )}

      {/* Size Options - Clean horizontal layout */}
      <div className="flex gap-2">
        {sizes.map((size, index) => {
          const isSelected = selectedSize === size.id
          const finalPrice = basePrice + size.priceModifier
          const displayPrice = showPriceAsTotal ? size.priceModifier : finalPrice

          return (
            <motion.button
              key={size.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onSelect(size.id)}
              className={`
                relative flex-1 p-3 rounded-2xl border-2 transition-all duration-200 text-center
                ${isSelected
                  ? 'border-pink-500 bg-gradient-to-br from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/30'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-pink-300 dark:hover:border-pink-700 hover:shadow-md'
                }
              `}
            >
              {/* Selected Check */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-md"
                >
                  <Check className="w-3 h-3 text-pink-500" strokeWidth={3} />
                </motion.div>
              )}

              {/* Size Name */}
              <div className={`font-bold text-sm ${
                isSelected ? 'text-white' : 'text-slate-900 dark:text-white'
              }`}>
                {size.name}
              </div>

              {/* Price */}
              <div className={`text-xs mt-1 font-medium ${
                isSelected ? 'text-white/80' : 'text-pink-600 dark:text-pink-400'
              }`}>
                {showPriceAsTotal ? (
                  <span>{displayPrice} ج.م</span>
                ) : (
                  size.priceModifier > 0 ? (
                    <span>+{size.priceModifier} ج.م</span>
                  ) : (
                    <span>{finalPrice} ج.م</span>
                  )
                )}
              </div>
            </motion.button>
          )
        })}
      </div>
    </motion.div>
  )
}
