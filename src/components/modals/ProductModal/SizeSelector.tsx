'use client'

import { motion } from 'framer-motion'
import { ProductSize } from '@/lib/api'

interface SizeSelectorProps {
  sizes: ProductSize[]
  selectedSize: string | null
  onSelect: (sizeId: string) => void
  basePrice: number
  showPriceAsTotal?: boolean // For BYO: show size price as total, not modifier
}

export default function SizeSelector({
  sizes,
  selectedSize,
  onSelect,
  basePrice,
  showPriceAsTotal = false
}: SizeSelectorProps) {
  if (!sizes || sizes.length === 0) return null

  // Don't show if only one size
  if (sizes.length === 1) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="space-y-3"
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <span className="text-xl">📏</span>
        <h4 className="font-bold text-slate-900 dark:text-white">اختر المقاس</h4>
      </div>

      {/* Size Options */}
      <div className="flex gap-2 flex-wrap">
        {sizes.map((size) => {
          const isSelected = selectedSize === size.id
          const finalPrice = basePrice + size.priceModifier

          // For BYO: show size price as total (size contains full price)
          // For others: show base + modifier
          const displayPrice = showPriceAsTotal
            ? size.priceModifier // Size IS the price for BYO
            : finalPrice

          return (
            <motion.button
              key={size.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelect(size.id)}
              className={`
                relative flex-1 min-w-[80px] max-w-[120px] p-3 rounded-xl border-2 transition-all duration-200
                ${isSelected
                  ? 'border-pink-500 bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-950/30 dark:to-rose-950/30 shadow-md'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-pink-300 dark:hover:border-pink-700'
                }
              `}
            >
              {/* Selected Indicator */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-pink-500 rounded-full flex items-center justify-center"
                >
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </motion.div>
              )}

              {/* Size Icon */}
              <div className="text-2xl mb-2 filter drop-shadow-sm transition-transform group-hover:scale-110">
                {size.id === 'small' && '🧁'}
                {size.id === 'medium' && '🍨'}
                {size.id === 'large' && '🥡'}
                {!['small', 'medium', 'large'].includes(size.id) && '📦'}
              </div>

              {/* Name */}
              <div className={`font-bold text-sm ${isSelected ? 'text-pink-600 dark:text-pink-400' : 'text-slate-900 dark:text-white'
                }`}>
                {size.name}
              </div>

              {/* Price - Different display for BYO vs others */}
              <div className={`text-xs mt-0.5 font-medium ${isSelected ? 'text-pink-500' : 'text-slate-500 dark:text-slate-400'
                }`}>
                {showPriceAsTotal ? (
                  // BYO: Show size price directly
                  <span>{displayPrice} ج.م</span>
                ) : (
                  // Others: Show +modifier or base price
                  size.priceModifier > 0 ? (
                    <span>+{size.priceModifier} ج.م</span>
                  ) : (
                    <span>{finalPrice} ج.م</span>
                  )
                )}
              </div>

              {/* Nutrition Multiplier Badge */}
              {size.nutritionMultiplier !== 1 && (
                <div className="text-[9px] text-slate-400 dark:text-slate-500 mt-0.5">
                  {size.nutritionMultiplier < 1 ? '🍃 أخف' : '💪 أكبر'}
                </div>
              )}
            </motion.button>
          )
        })}
      </div>
    </motion.div>
  )
}
