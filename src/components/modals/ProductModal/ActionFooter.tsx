'use client'

import { ShoppingCart, Check, ChevronDown, Flame } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import QuantitySelector from '@/components/ui/common/QuantitySelector'
import PriceDisplay from '@/components/ui/common/PriceDisplay'

interface SelectedOption {
  id: string
  name: string
  price: number
  groupId: string
  groupIcon?: string
  nutrition?: {
    calories?: number
  }
}

interface ActionFooterProps {
  quantity: number
  onIncrease: () => void
  onDecrease: () => void
  onAddToCart: () => void
  totalPrice: number
  basePrice: number
  addonsPrice: number
  selectedAddonsCount: number
  isValid?: boolean
  validationMessage?: string
  selectedOptions?: SelectedOption[]
  containerName?: string
  sizeName?: string
}

export default function ActionFooter({
  quantity,
  onIncrease,
  onDecrease,
  onAddToCart,
  totalPrice,
  basePrice,
  addonsPrice,
  selectedAddonsCount,
  isValid = true,
  validationMessage,
  selectedOptions = [],
  containerName,
  sizeName
}: ActionFooterProps) {
  const [showDetails, setShowDetails] = useState(false)
  const showBreakdown = addonsPrice > 0 || basePrice === 0
  const hasSelections = selectedOptions.length > 0 || containerName || sizeName

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, type: 'spring', damping: 25 }}
      className="relative border-t border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md"
    >
      {/* Validation Message */}
      <AnimatePresence>
        {!isValid && validationMessage && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-800/50 px-4 py-2"
          >
            <p className="text-xs text-amber-700 dark:text-amber-400 text-center">
              ⚠️ {validationMessage}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Price Breakdown (Collapsible) */}
      <AnimatePresence>
        {showBreakdown && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 lg:px-6 pt-3 pb-1 border-b border-slate-100 dark:border-slate-800"
          >
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              {basePrice > 0 ? (
                <>
                  <div className="flex items-center gap-4">
                    <span>الأساسي: <PriceDisplay price={basePrice} size="sm" className="inline" /></span>
                    {addonsPrice > 0 && (
                      <span className="text-pink-600 dark:text-pink-400">
                        + إضافات: <PriceDisplay price={addonsPrice} size="sm" className="inline" />
                      </span>
                    )}
                  </div>
                  {quantity > 1 && (
                    <span className="text-slate-400">×{quantity}</span>
                  )}
                </>
              ) : (
                <>
                  <span>المقاس + الإضافات</span>
                  <PriceDisplay price={addonsPrice} size="sm" />
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Action Row */}
      <div className="p-4 lg:p-5">
        <div className="flex items-center gap-3">
          {/* Quantity Selector */}
          <div className="flex-shrink-0">
            <QuantitySelector
              quantity={quantity}
              onIncrease={onIncrease}
              onDecrease={onDecrease}
              size="lg"
            />
          </div>

          {/* Add to Cart Button */}
          <motion.button
            onClick={onAddToCart}
            disabled={!isValid}
            whileHover={isValid ? { scale: 1.02 } : {}}
            whileTap={isValid ? { scale: 0.98 } : {}}
            className={`
              flex-1 min-h-[52px] py-3.5 px-5 rounded-2xl font-bold text-base
              flex items-center justify-center gap-2
              transition-all duration-200
              ${isValid
                ? 'bg-gradient-to-r from-[#FF6B9D] to-[#FF5A8E] hover:from-[#FF5A8E] hover:to-[#FF4979] text-white shadow-lg shadow-pink-500/25 hover:shadow-xl hover:shadow-pink-500/30'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
              }
            `}
          >
            <ShoppingCart className="w-5 h-5 flex-shrink-0" />
            <span className="whitespace-nowrap">أضف للسلة</span>
            <span className="mx-1 opacity-50">•</span>
            <PriceDisplay 
              price={totalPrice} 
              size="md" 
              className={isValid ? 'text-white' : 'text-slate-400 dark:text-slate-500'}
            />
          </motion.button>
        </div>

        {/* Selection Summary - Expandable */}
        {hasSelections && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-2"
          >
            {/* Toggle Button */}
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="w-full flex items-center justify-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors py-1"
            >
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              <span>اختياراتك ({selectedAddonsCount})</span>
              <motion.div
                animate={{ rotate: showDetails ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </motion.div>
            </button>

            {/* Expanded Details */}
            <AnimatePresence>
              {showDetails && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-2 pb-1 space-y-1.5">
                    {/* Container & Size */}
                    {(containerName || sizeName) && (
                      <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                        {containerName && (
                          <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                            🥤 {containerName}
                          </span>
                        )}
                        {sizeName && (
                          <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                            📏 {sizeName}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Selected Options */}
                    {selectedOptions.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {selectedOptions.map((opt) => (
                          <span
                            key={opt.id}
                            className="inline-flex items-center gap-1 text-[11px] bg-pink-50 dark:bg-pink-950/30 text-pink-700 dark:text-pink-300 px-2 py-1 rounded-full"
                          >
                            {opt.groupIcon && <span className="text-xs">{opt.groupIcon}</span>}
                            <span>{opt.name}</span>
                            {opt.nutrition?.calories && (
                              <span className="flex items-center gap-0.5 text-[10px] opacity-70">
                                <Flame className="w-2.5 h-2.5" />
                                {opt.nutrition.calories}
                              </span>
                            )}
                            {opt.price > 0 && (
                              <span className="text-[10px] opacity-70">+{opt.price}</span>
                            )}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Safe Area Padding for iOS */}
      <div className="h-safe-area-inset-bottom bg-white dark:bg-slate-900" />
    </motion.div>
  )
}
