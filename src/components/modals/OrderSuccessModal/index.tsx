'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { X, CheckCircle, Copy, MessageCircle, MapPin, Clock, Package, CreditCard } from 'lucide-react'

interface OrderItem {
  productId: string
  name: string
  quantity: number
  price: number
  total: number
}

interface OrderTotals {
  subtotal: number
  deliveryFee: number
  discount: number
  total: number
}

interface OrderCustomer {
  name: string
  phone: string
  address?: string | null
}

interface BranchInfo {
  id?: string
  name: string
  address?: string
  phone?: string
}

interface SavedOrder {
  id: string
  status: string
  createdAt: string
  items: OrderItem[]
  totals: OrderTotals
  deliveryMethod: 'pickup' | 'delivery'
  branch?: string | BranchInfo | null
  branchName?: string
  branchPhone?: string
  branchAddress?: string
  customer: OrderCustomer
  eta?: string
  etaEn?: string
  canCancelUntil?: string
  estimatedMinutes?: number
  couponCode?: string
  deliveryInfo?: any
}

interface OrderSuccessModalProps {
  isOpen: boolean
  onClose: () => void
  order: SavedOrder
  onTrackOrder?: () => void
  onEditOrder?: (order: SavedOrder) => void
  onContactWhatsApp?: () => void
}

// ================================================================
// Helper Functions
// ================================================================

const getBranchLabel = (branch?: string | BranchInfo | null): string => {
  if (!branch) return ''
  if (typeof branch === 'string') return branch
  return branch.name || branch.id || ''
}

/**
 * Extract first name from full name
 * Examples:
 * "أحمد محمد علي" → "أحمد"
 * "Ahmed Mohamed" → "Ahmed"
 */
const getFirstName = (fullName: string): string => {
  if (!fullName) return ''
  const trimmed = fullName.trim()
  const firstSpace = trimmed.indexOf(' ')
  return firstSpace > 0 ? trimmed.substring(0, firstSpace) : trimmed
}

const generateWhatsAppMessage = (order: SavedOrder): string => {
  const itemsList = order.items
    .map(item => `• ${item.name} × ${item.quantity} = ${item.total.toFixed(2)} ج.م`)
    .join('\n')

  const branchLabel = getBranchLabel(order.branch) || order.branchName || ''

  const message = `
🎉 *تأكيد الطلب*

📦 *رقم الطلب:* ${order.id}
👤 *الاسم:* ${order.customer.name}
📱 *الهاتف:* ${order.customer.phone}

*المنتجات:*
${itemsList}

💰 *الإجمالي:* ${order.totals.total.toFixed(2)} ج.م
${order.deliveryMethod === 'delivery' ? `🚚 *رسوم التوصيل:* ${order.totals.deliveryFee.toFixed(2)} ج.م` : '🏪 *الاستلام من الفرع*'}
${order.totals.discount > 0 ? `🎁 *الخصم:* ${order.totals.discount.toFixed(2)} ج.م` : ''}
${branchLabel ? `🏢 *الفرع:* ${branchLabel}` : ''}

⏱️ *الوقت المتوقع:* ${order.eta || '30-45 دقيقة'}
  `.trim()

  return message
}

const openWhatsApp = (order: SavedOrder): void => {
  try {
    const message = generateWhatsAppMessage(order)
    const encodedMessage = encodeURIComponent(message)
    const phoneNumber = order.branchPhone || order.customer.phone
    const phoneWithoutSpaces = phoneNumber.replace(/\D/g, '')
    const whatsappUrl = `https://wa.me/${phoneWithoutSpaces}?text=${encodedMessage}`
    
    console.log('📱 Opening WhatsApp:', {
      phone: phoneWithoutSpaces,
      isBranch: !!order.branchPhone,
      url: whatsappUrl.substring(0, 50) + '...'
    })
    
    window.open(whatsappUrl, '_blank')
  } catch (error) {
    console.error('❌ Failed to open WhatsApp:', error)
  }
}

// ================================================================
// 🎊 Confetti Animation
// ================================================================

const triggerConfetti = () => {
  const duration = 3000
  const animationEnd = Date.now() + duration
  const defaults = { 
    startVelocity: 30, 
    spread: 360, 
    ticks: 60, 
    zIndex: 10000,
    colors: ['#A3164D', '#9333ea', '#ec4899', '#f472b6', '#fbbf24'] // Soft Cream brand colors
  }

  const randomInRange = (min: number, max: number) => {
    return Math.random() * (max - min) + min
  }

  const interval = window.setInterval(() => {
    const timeLeft = animationEnd - Date.now()

    if (timeLeft <= 0) {
      return clearInterval(interval)
    }

    const particleCount = 50 * (timeLeft / duration)

    // Burst from left
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
    })

    // Burst from right
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
    })
  }, 250)
}

// ================================================================
// Main Component
// ================================================================

const OrderSuccessModal = ({
  isOpen,
  onClose,
  order,
  onTrackOrder,
  onContactWhatsApp
}: OrderSuccessModalProps) => {
  const [copied, setCopied] = useState(false)
  const branchLabel = getBranchLabel(order.branch) || order.branchName || ''
  const firstName = getFirstName(order.customer.name)

  console.log('🎯 OrderSuccessModal rendered:', { 
    isOpen, 
    orderId: order?.id, 
    branchLabel,
    firstName 
  })

  // ✅ Trigger confetti when modal opens
  useEffect(() => {
    if (isOpen) {
      console.log('🎊 Triggering confetti celebration!')
      // Small delay to ensure modal is visible
      const timer = setTimeout(() => {
        triggerConfetti()
      }, 100)
      
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  const handleCopyOrderId = () => {
    navigator.clipboard.writeText(order.id)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleWhatsApp = () => {
    if (onContactWhatsApp) {
      onContactWhatsApp()
    } else {
      openWhatsApp(order)
    }
  }

  // ✅ FIXED: Close this modal first, then let parent open tracking modal
  const handleTrackOrder = () => {
    console.log('📍 Track order clicked - closing success modal')
    onClose() // Close success modal first
    
    // Let parent handle opening tracking modal
    if (onTrackOrder) {
      setTimeout(() => {
        onTrackOrder()
      }, 300) // Small delay for smooth transition
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-gray-900/80 backdrop-blur-md z-[9300] flex items-center justify-center p-5 overflow-y-auto"
            onClick={onClose}
          >
            {/* Modal Content */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ 
                type: 'spring', 
                damping: 25, 
                stiffness: 300,
                duration: 0.3
              }}
              className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-[650px] w-full max-h-[90vh] overflow-y-auto shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                className="absolute top-4 right-4 bg-gray-100 dark:bg-gray-700 w-10 h-10 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white transition-all z-10"
                onClick={onClose}
              >
                <X className="w-5 h-5" />
              </button>

              {/* Success Animation */}
              <div className="text-center mb-7">
                {/* ✅ Enhanced Success Icon with Spring Animation */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ 
                    type: 'spring', 
                    damping: 10, 
                    stiffness: 200,
                    delay: 0.1
                  }}
                  className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white shadow-lg"
                >
                  <CheckCircle className="w-10 h-10" />
                </motion.div>

                {/* ✅ Personalized Headline */}
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-3xl font-black text-gray-800 dark:text-gray-100 mb-2"
                >
                  {firstName 
                    ? `شكراً لطلبك يا ${firstName}! 🎉` 
                    : 'شكراً لطلبك! 🎉'}
                </motion.h2>

                {/* ✅ Warmer Sub-text */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-base text-gray-600 dark:text-gray-400"
                >
                  أيس كريم السعادة في الطريق إليك 🍦🚀
                </motion.p>
              </div>

              {/* Order ID Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-700 dark:to-gray-600 rounded-2xl p-5 mb-6 border-2 border-blue-200 dark:border-gray-500"
              >
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">رقم الطلب</p>
                  <div className="flex items-center justify-center gap-3">
                    <p className="text-2xl font-black text-blue-600 dark:text-blue-400">#{order.id}</p>
                    <button
                      onClick={handleCopyOrderId}
                      className="p-2 hover:bg-blue-200 dark:hover:bg-gray-500 rounded-lg transition-all"
                      title="نسخ رقم الطلب"
                    >
                      <Copy className={`w-5 h-5 ${copied ? 'text-green-500' : 'text-gray-600 dark:text-gray-300'}`} />
                    </button>
                  </div>
                  {copied && (
                    <motion.p
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-xs text-green-600 mt-2"
                    >
                      تم النسخ! ✓
                    </motion.p>
                  )}
                </div>
              </motion.div>

              {/* Quick Info Cards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="grid grid-cols-2 gap-3 mb-6"
              >
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center gap-2 mb-1">
                    <Package className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <p className="text-xs text-gray-600 dark:text-gray-400">المنتجات</p>
                  </div>
                  <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
                    {order.items?.length || 0}
                  </p>
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <p className="text-xs text-gray-600 dark:text-gray-400">الوقت المتوقع</p>
                  </div>
                  <p className="text-xl font-bold text-green-600 dark:text-green-400">
                    {order.eta || '30-45 دقيقة'}
                  </p>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2 mb-1">
                    <CreditCard className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <p className="text-xs text-gray-600 dark:text-gray-400">الإجمالي</p>
                  </div>
                  <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                    {order.totals.total.toFixed(2)} ج.م
                  </p>
                </div>

                <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4 border border-orange-200 dark:border-orange-800">
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                    <p className="text-xs text-gray-600 dark:text-gray-400">التوصيل</p>
                  </div>
                  <p className="text-xl font-bold text-orange-600 dark:text-orange-400">
                    {order.deliveryMethod === 'delivery' ? 'للمنزل' : 'من الفرع'}
                  </p>
                </div>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex flex-col gap-3 mt-6"
              >
                {/* Track Order Button */}
                <button
                  onClick={handleTrackOrder}
                  className="w-full py-4 px-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  <Package className="w-5 h-5" />
                  📍 تتبع الطلب
                </button>

                {/* WhatsApp Button */}
                <button
                  onClick={handleWhatsApp}
                  className="w-full py-4 px-6 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  <MessageCircle className="w-5 h-5" />
                  تواصل عبر واتساب
                </button>

                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="w-full py-4 px-6 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-2xl font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
                >
                  إغلاق
                </button>
              </motion.div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default OrderSuccessModal
