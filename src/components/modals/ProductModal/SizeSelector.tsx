'use client'

import { motion } from 'framer-motion'
import { Check, Circle } from 'lucide-react'
import { ProductSize } from '@/lib/api'

interface SizeSelectorProps {
  sizes: ProductSize[]
  selectedSize: string | null
  onSelect: (sizeId: string) => void
  basePrice: number
  showPriceAsTotal?: boolean
  showHeader?: boolean
}

// Size scale factor for visual representation
const getSizeScale = (name: string, index: number, total: number): number => {
  const lower = name.toLowerCase()
  if (lower.includes('صغير') || lower.includes('small') || lower.includes('mini')) return 0.7
  if (lower.includes('كبير') || lower.includes('large') || lower.includes('big')) return 1.1
  if (lower.includes('عائلي') || lower.includes('family') || lower.includes('xl')) return 1.3
  // Default: scale based on position
  return 0.7 + (index / Math.max(total - 1, 1)) * 0.6
}

export default function SizeSelector({
  sizes,
  selectedSize,
  onSelect,
  basePrice
}: SizeSelectorProps) {
  if (!sizes || sizes.length === 0) return null
  if (sizes.length === 1) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-2"
    >
      {/* Compact Horizontal Layout */}
      <div className="flex gap-2 justify-center">
        {sizes.map((size, index) => {
          const isSelected = selectedSize === size.id
          const finalPrice = basePrice + size.priceModifier
          const scale = getSizeScale(size.name, index, sizes.length)

          return (
            <motion.button
              key={size.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelect(size.id)}
              className={`
                relative flex-1 max-w-[120px] py-3 px-2 rounded-xl border-2 transition-all duration-200 text-center
                ${isSelected
                  ? 'border-pink-500 bg-gradient-to-br from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/25'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 hover:border-pink-300 dark:hover:border-pink-700'
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

              {/* Size Icon - Scaled Circle */}
              <div className="flex justify-center mb-1.5">
                <Circle 
                  className={`transition-all ${
                    isSelected ? 'text-white fill-white/20' : 'text-slate-300 dark:text-slate-600'
                  }`}
                  style={{ 
                    width: `${18 * scale}px`, 
                    height: `${18 * scale}px` 
                  }}
                  strokeWidth={2}
                />
              </div>

              {/* Size Name */}
              <div className={`text-xs font-bold mb-0.5 ${
                isSelected ? 'text-white' : 'text-slate-700 dark:text-slate-300'
              }`}>
                {size.name}
              </div>

              {/* Price */}
              <div className={`text-sm font-bold ${
                isSelected ? 'text-white' : 'text-pink-600 dark:text-pink-400'
              }`}>
                {finalPrice}
                <span className="text-[10px] mr-0.5 opacity-80">ج.م</span>
              </div>
            </motion.button>
          )
        })}
      </div>
    </motion.div>
  )
}
