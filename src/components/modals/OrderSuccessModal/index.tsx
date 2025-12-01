// ================================================================
// OrderSuccessModal - Main Component (Clean Architecture)
// ================================================================
// Structure:
// - types.ts: TypeScript interfaces
// - helpers.ts: Utility functions
// - PickupView.tsx: Branch pickup template
// - DeliveryView.tsx: Home delivery template
// - OrderSummary.tsx: Expandable order details
// - index.tsx: Main orchestrator (this file)
// ================================================================

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, Copy, MessageCircle, Package, Tag } from 'lucide-react'

// Local imports
import type { OrderSuccessModalProps } from './types'
import {
  getFirstName,
  getBranchPhone,
  getBranchWhatsApp,
  getBranchName,
  getBranchGoogleMapsUrl,
  generateWhatsAppInquiry,
  triggerConfetti
} from './helpers'
import PickupView from './PickupView'
import DeliveryView from './DeliveryView'
import OrderSummary from './OrderSummary'

// ================================================================
// Main Component
// ================================================================
const OrderSuccessModal = ({ isOpen, onClose, order, onTrackOrder }: OrderSuccessModalProps) => {
  const [copied, setCopied] = useState(false)

  // Derived values
  const firstName = getFirstName(order.customer.name)
  const branchPhone = getBranchPhone(order)
  const branchName = getBranchName(order)
  const hasLocation = !!getBranchGoogleMapsUrl(order)
  const isPickup = order.deliveryMethod === 'pickup'

  // Trigger confetti on open
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => triggerConfetti(), 100)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  // ===================================
  // Handlers
  // ===================================
  const handleCopyOrderId = () => {
    navigator.clipboard.writeText(order.id)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleTrackOrder = () => {
    onClose()
    if (onTrackOrder) setTimeout(() => onTrackOrder(), 200)
  }

  const handleWhatsAppInquiry = () => {
    const message = generateWhatsAppInquiry(order)
    const phoneNumber = getBranchWhatsApp(order) || branchPhone
    if (!phoneNumber) {
      alert('رقم الفرع غير متاح')
      return
    }
    const phoneClean = phoneNumber.replace(/\D/g, '')
    window.open(`https://wa.me/${phoneClean}?text=${encodeURIComponent(message)}`, '_blank')
  }

  const handleCallBranch = () => {
    if (branchPhone) {
      window.location.href = `tel:${branchPhone.replace(/\D/g, '')}`
    }
  }

  const handleOpenLocation = () => {
    const url = getBranchGoogleMapsUrl(order)
    if (url) window.open(url, '_blank')
  }

  // ===================================
  // Render
  // ===================================
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9300] flex items-center justify-center p-2 sm:p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl w-full max-w-[95vw] sm:max-w-md lg:max-w-lg overflow-hidden shadow-2xl max-h-[95vh] sm:max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >

            {/* ===================================== */}
            {/* Header */}
            {/* ===================================== */}
            <div className="bg-gradient-to-r from-pink-500 via-pink-600 to-purple-600 px-4 sm:px-6 py-4 sm:py-5 text-white relative flex-shrink-0">
              <button
                onClick={onClose}
                className="absolute top-3 right-3 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-all"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              <div className="flex items-center gap-3 sm:gap-4">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', damping: 10, delay: 0.1 }}
                  className="w-14 h-14 sm:w-16 sm:h-16 bg-white rounded-full flex items-center justify-center shadow-lg flex-shrink-0"
                >
                  <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-green-500" />
                </motion.div>
                <div className="min-w-0">
                  <h2 className="text-xl sm:text-2xl font-black truncate">
                    {firstName ? `شكراً ${firstName}! 🎉` : 'تم تأكيد طلبك! 🎉'}
                  </h2>
                  <p className="text-white/80 text-sm sm:text-base">سوفت كريم - طعم لذيذ، صحة أفضل 🍦</p>
                </div>
              </div>
            </div>

            {/* ===================================== */}
            {/* Scrollable Content */}
            {/* ===================================== */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 sm:space-y-4">

              {/* Order ID */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 sm:p-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">رقم الطلب</p>
                  <p className="text-lg sm:text-xl font-black text-pink-600 dark:text-pink-400">#{order.id}</p>
                </div>
                <button
                  onClick={handleCopyOrderId}
                  className={`p-2 sm:p-2.5 rounded-xl transition-all ${
                    copied
                      ? 'bg-green-100 dark:bg-green-900/30'
                      : 'bg-white dark:bg-gray-600 hover:bg-gray-100 dark:hover:bg-gray-500 shadow-sm'
                  }`}
                  title="نسخ رقم الطلب"
                >
                  <Copy className={`w-4 h-4 sm:w-5 sm:h-5 ${copied ? 'text-green-500' : 'text-gray-500 dark:text-gray-300'}`} />
                </button>
              </div>

              {/* Discount Badge */}
              {order.totals.discount > 0 && (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-3 sm:p-4 border-2 border-green-200 dark:border-green-700 flex items-center gap-3"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Tag className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base sm:text-lg font-black text-green-700 dark:text-green-400">
                      وفرت {order.totals.discount.toFixed(0)} ج.م! 🎉
                    </p>
                    {order.couponCode && (
                      <p className="text-xs sm:text-sm text-green-600 dark:text-green-500 truncate">
                        كوبون: {order.couponCode}
                      </p>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Total */}
              <div className="bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl p-4 sm:p-5 text-white text-center">
                <p className="text-xs sm:text-sm opacity-80 mb-1">الإجمالي</p>
                <p className="text-3xl sm:text-4xl font-black">{order.totals.total.toFixed(2)} ج.م</p>
              </div>

              {/* Pickup or Delivery View */}
              {isPickup ? (
                <PickupView
                  order={order}
                  branchName={branchName}
                  branchPhone={branchPhone}
                  hasLocation={hasLocation}
                  onOpenLocation={handleOpenLocation}
                  onCallBranch={handleCallBranch}
                />
              ) : (
                <DeliveryView order={order} />
              )}

              {/* Order Summary */}
              <OrderSummary order={order} />
            </div>

            {/* ===================================== */}
            {/* Fixed Bottom Actions */}
            {/* ===================================== */}
            <div className="flex-shrink-0 p-4 sm:p-5 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 space-y-2 sm:space-y-3">

              {/* Primary: Track Order */}
              <button
                onClick={handleTrackOrder}
                className="w-full py-3 sm:py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                <Package className="w-5 h-5" />
                📍 تتبع الطلب
              </button>

              {/* Secondary Actions Row */}
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                {/* WhatsApp */}
                <button
                  onClick={handleWhatsAppInquiry}
                  className="py-3 sm:py-3.5 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>استعلام واتساب</span>
                </button>

                {/* Close */}
                <button
                  onClick={onClose}
                  className="py-3 sm:py-3.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-medium text-xs sm:text-sm transition-all flex items-center justify-center gap-2 hover:bg-gray-300 dark:hover:bg-gray-600 active:scale-[0.98]"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>إغلاق</span>
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default OrderSuccessModal
