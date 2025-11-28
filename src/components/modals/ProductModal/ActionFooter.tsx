'use client'

import { ShoppingCart } from 'lucide-react'
import { motion } from 'framer-motion'
import QuantitySelector from '@/components/ui/common/QuantitySelector'
import PriceDisplay from '@/components/ui/common/PriceDisplay'

interface ActionFooterProps {
  quantity: number
  onIncrease: () => void
  onDecrease: () => void
  onAddToCart: () => void
  totalPrice: number
  basePrice: number
  addonsPrice: number
  selectedAddonsCount: number
}

export default function ActionFooter({
  quantity,
  onIncrease,
  onDecrease,
  onAddToCart,
  totalPrice,
  basePrice,
  addonsPrice,
  selectedAddonsCount
}: ActionFooterProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="relative border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 lg:p-6"
    >
      <div className="flex items-center gap-3">
        {/* Quantity Selector */}
        <QuantitySelector
          quantity={quantity}
          onIncrease={onIncrease}
          onDecrease={onDecrease}
          size="lg"
        />

        {/* Add to Cart Button - Responsive with proper sizing for medium screens */}
        <button
          onClick={onAddToCart}
          className="flex-1 min-h-[48px] max-h-[56px] py-3 px-4 lg:px-6 bg-gradient-to-r from-[#FF6B9D] to-[#FF5A8E] hover:from-[#FF5A8E] hover:to-[#FF4979] text-white rounded-xl font-bold text-sm lg:text-base flex items-center justify-center gap-1.5 lg:gap-2 shadow-lg shadow-pink-500/25 hover:shadow-xl hover:shadow-pink-500/30 transition-all active:scale-[0.98]"
        >
          <ShoppingCart className="w-4 h-4 lg:w-5 lg:h-5 flex-shrink-0" />
          <span className="hidden sm:inline whitespace-nowrap">أضف للسلة • </span>
          <span className="sm:hidden whitespace-nowrap">أضف • </span>
          <PriceDisplay price={totalPrice} size="md" className="text-white flex-shrink-0" />
        </button>
      </div>

      {/* Price Breakdown */}
      {(addonsPrice > 0 || basePrice === 0) && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700"
        >
          {basePrice > 0 && (
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
              <span>السعر الأساسي ({quantity}×)</span>
              <PriceDisplay price={basePrice * quantity} size="sm" />
            </div>
          )}
          {addonsPrice > 0 && (
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>{basePrice === 0 ? 'المقاس + الإضافات' : `الإضافات (${selectedAddonsCount})`}</span>
              <PriceDisplay price={addonsPrice * quantity} size="sm" />
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  )
}
