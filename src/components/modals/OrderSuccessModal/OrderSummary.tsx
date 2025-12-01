// ================================================================
// Order Summary Component - Expandable order details
// ================================================================

'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Package } from 'lucide-react'
import type { SavedOrder } from './types'

interface OrderSummaryProps {
  order: SavedOrder
}

const OrderSummary = ({ order }: OrderSummaryProps) => {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-3 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-purple-500" />
          <span className="text-sm font-bold text-gray-700 dark:text-gray-200">
            ملخص الطلب ({order.items?.length || 0} منتج)
          </span>
        </div>
        <motion.span
          animate={{ rotate: expanded ? 180 : 0 }}
          className="text-gray-500"
        >
          ▼
        </motion.span>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-gray-200 dark:border-gray-600"
          >
            <div className="p-3 space-y-2 max-h-40 overflow-y-auto">
              {order.items?.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-300">
                    {item.quantity}x {item.name}
                  </span>
                  <span className="font-medium text-gray-800 dark:text-gray-100">
                    {item.total?.toFixed(2)} ج.م
                  </span>
                </div>
              ))}
              <div className="border-t border-gray-200 dark:border-gray-600 pt-2 mt-2">
                {order.totals.discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>الخصم</span>
                    <span>-{order.totals.discount.toFixed(2)} ج.م</span>
                  </div>
                )}
                {order.totals.deliveryFee > 0 && (
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>التوصيل</span>
                    <span>{order.totals.deliveryFee.toFixed(2)} ج.م</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default OrderSummary
