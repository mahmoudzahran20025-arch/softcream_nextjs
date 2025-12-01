// ================================================================
// Delivery View Component - For home delivery orders
// ================================================================

'use client'

import { motion } from 'framer-motion'
import { Truck, Edit3 } from 'lucide-react'
import type { SavedOrder } from './types'

// ================================================================
// Marquee Component for Delivery Tips
// ================================================================
const DeliveryMarquee = () => {
  const tips = [
    '🚀 توصيل سريع خلال 30-45 دقيقة',
    '✏️ يمكنك تعديل طلبك خلال 5 دقائق',
    '📍 تتبع طلبك في الوقت الحقيقي',
    '💬 تواصل معنا عبر واتساب',
    '🍦 سوفت كريم - طعم لذيذ، صحة أفضل'
  ]

  return (
    <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-2 overflow-hidden rounded-xl">
      <motion.div
        className="flex whitespace-nowrap"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      >
        {[...tips, ...tips].map((tip, i) => (
          <span key={i} className="mx-8 text-sm font-medium">{tip}</span>
        ))}
      </motion.div>
    </div>
  )
}

// ================================================================
// Delivery View Component
// ================================================================
interface DeliveryViewProps {
  order: SavedOrder
}

const DeliveryView = ({ order }: DeliveryViewProps) => (
  <div className="space-y-3">
    {/* Delivery Marquee */}
    <DeliveryMarquee />

    {/* Delivery Info Card */}
    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-4 border-2 border-blue-200 dark:border-blue-700">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
          <Truck className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">توصيل للمنزل</p>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-200 line-clamp-2">
            {order.customer.address || 'العنوان المحدد'}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            ⏱️ الوصول خلال {order.eta || '30-45 دقيقة'}
          </p>
        </div>
      </div>

      {/* Edit Order Reminder */}
      <div className="mt-3 p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center gap-2">
        <Edit3 className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
        <span className="text-xs text-yellow-700 dark:text-yellow-300">
          يمكنك تعديل طلبك خلال 5 دقائق من الآن
        </span>
      </div>
    </div>
  </div>
)

export default DeliveryView
