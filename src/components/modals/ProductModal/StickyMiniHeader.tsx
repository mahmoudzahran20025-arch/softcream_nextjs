'use client'

import { motion, AnimatePresence } from 'framer-motion'
import PriceDisplay from '@/components/ui/common/PriceDisplay'

interface StickyMiniHeaderProps {
  productName: string
  totalPrice: number
  isVisible: boolean
}

export default function StickyMiniHeader({ 
  productName, 
  totalPrice, 
  isVisible 
}: StickyMiniHeaderProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="absolute top-0 left-0 right-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-700/50 shadow-sm"
        >
          <div className="flex items-center justify-between px-4 py-3 lg:px-6">
            {/* Product Name */}
            <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate flex-1 ml-4">
              {productName}
            </h3>

            {/* Price Badge */}
            <div className="flex-shrink-0 bg-gradient-to-r from-pink-500 to-rose-500 text-white px-3 py-1 rounded-full shadow-sm">
              <PriceDisplay 
                price={totalPrice} 
                size="sm" 
                className="text-white font-bold"
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
