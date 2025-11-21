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
      className="relative border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 md:p-6"
    >
      <div className="flex items-center gap-3">
        {/* Quantity Selector */}
        <QuantitySelector
          quantity={quantity}
          onIncrease={onIncrease}
          onDecrease={onDecrease}
          size="lg"
        />

        {/* Add to Cart Button */}
        <button
          onClick={onAddToCart}
          className="flex-1 py-3.5 px-6 bg-gradient-to-r from-[#FF6B9D] to-[#FF5A8E] hover:from-[#FF5A8E] hover:to-[#FF4979] text-white rounded-xl font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-pink-500/25 hover:shadow-xl hover:shadow-pink-500/30 transition-all active:scale-[0.98]"
        >
          <ShoppingCart className="w-5 h-5" />
          <span>أضف للسلة • </span>
          <PriceDisplay price={totalPrice} size="md" className="text-white" />
        </button>
      </div>

      {/* Price Breakdown */}
      {addonsPrice > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>السعر الأساسي ({quantity}×)</span>
            <PriceDisplay price={basePrice * quantity} size="sm" />
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>الإضافات ({selectedAddonsCount})</span>
            <PriceDisplay price={addonsPrice * quantity} size="sm" />
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
