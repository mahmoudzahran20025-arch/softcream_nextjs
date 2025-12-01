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
  showHeader?: boolean
}

// Size visual scale
const getSizeScale = (sizeId: string, index: number, total: number): number => {
  const scales: Record<string, number> = {
    small: 0.6,
    medium: 0.8,
    large: 1.0,
    xl: 1.2,
    family: 1.3
  }
  return scales[sizeId] || (0.6 + (index / Math.max(total - 1, 1)) * 0.6)
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
    <div className="flex gap-1.5 justify-center">
      {sizes.map((size, index) => {
        const isSelected = selectedSize === size.id
        const finalPrice = basePrice + size.priceModifier
        const scale = getSizeScale(size.id, index, sizes.length)

        return (
          <motion.button
            key={size.id}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelect(size.id)}
            className={`
              relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all duration-200
              ${isSelected
                ? 'border-pink-500 bg-pink-500 text-white shadow-sm'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-pink-300 text-slate-700 dark:text-slate-300'
              }
            `}
          >
            {isSelected && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-white rounded-full flex items-center justify-center shadow-sm"
              >
                <Check className="w-2 h-2 text-pink-500" strokeWidth={3} />
              </motion.div>
            )}
            
            {/* Size dot indicator */}
            <span 
              className={`rounded-full ${isSelected ? 'bg-white/40' : 'bg-slate-300 dark:bg-slate-600'}`}
              style={{ width: `${10 * scale}px`, height: `${10 * scale}px` }}
            />
            <span className="text-[11px] font-semibold">{size.name}</span>
            <span className={`text-[11px] font-bold ${isSelected ? 'text-white' : 'text-pink-500'}`}>
              {finalPrice}
            </span>
          </motion.button>
        )
      })}
    </div>
  )
}
