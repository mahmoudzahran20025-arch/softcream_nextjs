'use client'

import { useState, useEffect, useMemo } from 'react'
import { X, Package, Clock, CheckCircle2, Truck, MapPin, Phone, Calendar, Store, Edit, PhoneCall } from 'lucide-react'
import { storage } from '@/lib/storage.client'
import { useTheme } from '@/providers/ThemeProvider'

interface MyOrdersModalProps {
  isOpen: boolean
  onClose: () => void
  onEditOrder?: (order: Order) => void
}

interface Order {
  id: string
  status: string
  items: any[]
  total: number
  customerName?: string
  customerPhone?: string
  deliveryAddress?: string
  createdAt: string
  lastUpdated?: string
  canCancelUntil?: string
  deliveryMethod?: 'pickup' | 'delivery'
  branch?: string
  branchName?: string
  branchPhone?: string
  branchAddress?: string
  totals?: {
    subtotal: number
    deliveryFee: number
    discount: number
    total: number
  }
  customer?: {
    name?: string
    phone?: string
    address?: string
  }
  // ✅ Tracking fields
  progress?: number
  last_updated_by?: string
  timeline?: Array<{ status: string; timestamp: string; updated_by: string }>
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: 'قيد الانتظار', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300', icon: Clock },
  confirmed: { label: 'مؤكد', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300', icon: CheckCircle2 },
  preparing: { label: 'قيد التحضير', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300', icon: Package },
  out_for_delivery: { label: 'في الطريق', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300', icon: Truck },
  ready: { label: 'جاهز', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300', icon: CheckCircle2 },
  delivered: { label: 'تم التسليم', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300', icon: CheckCircle2 },
  cancelled: { label: 'ملغى', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300', icon: X },
  'جديد': { label: 'جديد', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300', icon: Clock },
  'مؤكد': { label: 'مؤكد', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300', icon: CheckCircle2 },
  'قيد التحضير': { label: 'قيد التحضير', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300', icon: Package },
  'في الطريق': { label: 'في الطريق', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300', icon: Truck },
  'جاهز': { label: 'جاهز', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300', icon: CheckCircle2 },
  'ملغي': { label: 'ملغي', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300', icon: X },
}

export default function MyOrdersModal({ isOpen, onClose, onEditOrder }: MyOrdersModalProps) {
  const { language, showToast } = useTheme()
  const [orders, setOrders] = useState<Order[]>([])
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(false)
  const [timerKey, setTimerKey] = useState(0) // ✅ Force timer re-render

  // ✅ تحميل الطلبات عند الفتح فقط
  useEffect(() => {
    if (isOpen) {
      loadOrders()
    }
  }, [isOpen])

  // ✅ Timer update every second
  useEffect(() => {
    if (!isOpen || !selectedOrder) return
    const interval = setInterval(() => {
      setTimerKey(prev => prev + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [isOpen, selectedOrder])
  
  // ✅ الاستماع للتحديثات من الـ events فقط (لا polling!)
  useEffect(() => {
    const handleOrdersUpdated = (event: any) => {
      // ✅ NEW: Skip إذا الـ modal مش مفتوح – منع loads زائدة
      if (!isOpen) {
        console.log('⏭️ MyOrdersModal: Modal closed, skipping update')
        return
      }
      
      const { orderId, status, source } = event.detail || {}
      console.log(`📢 MyOrdersModal: Order ${orderId} updated to ${status} (source: ${source})`)
      
      // إعادة التحميل من localStorage
      loadOrders()
      
      // عرض Toast فقط للتحديثات من الـ backend
      if (status && source === 'polling') {
        showToast({
          type: 'info',
          title: language === 'ar' ? 'تحديث الطلب' : 'Order Updated',
          message: language === 'ar' 
            ? `تم تحديث حالة الطلب ${orderId || ''}`
            : `Order ${orderId || ''} status updated`,
          duration: 3000
        })
      }
    }
    
    if (typeof window !== 'undefined') {
      window.addEventListener('ordersUpdated', handleOrdersUpdated)
      return () => {
        window.removeEventListener('ordersUpdated', handleOrdersUpdated)
      }
    }
  }, [language, showToast, isOpen])  // ✅ NEW: أضف isOpen للـ deps، عشان يعاد register إذا تغير

  const loadOrders = () => {
    setLoading(true)
    try {
      const allOrders = storage.getOrders()
      setOrders(allOrders)
      console.log('📦 MyOrdersModal: Loaded orders:', allOrders.length)
    } catch (error) {
      console.error('Failed to load orders:', error)
    } finally {
      setLoading(false)
    }
  }

  // ✅ NEW: Memoize orders لمنع re-renders في الـ list
  const memoizedOrders = useMemo(() => orders, [orders])

  const handleCancelOrder = async (order: Order) => {
    if (!order.canCancelUntil) {
      alert(language === 'ar' ? 'لا يمكن إلغاء هذا الطلب' : 'Cannot cancel this order')
      return
    }
    
    const deadline = new Date(order.canCancelUntil)
    const now = new Date()
    
    if (now > deadline) {
      alert(language === 'ar' ? 'انتهت فترة الإلغاء المسموحة (5 دقائق)' : 'Cancel period expired (5 minutes)')
      return
    }
    
    if (!['pending', 'confirmed', 'جديد', 'مؤكد'].includes(order.status)) {
      alert(language === 'ar' ? 'لا يمكن إلغاء الطلب بعد قبوله' : 'Cannot cancel order after acceptance')
      return
    }
    
    if (!confirm(language === 'ar' ? 'هل تريد إلغاء هذا الطلب؟' : 'Are you sure you want to cancel this order?')) {
      return
    }
    
    try {
      const { cancelOrder } = await import('@/lib/api')
      const result = await cancelOrder(order.id)
      
      if (result.success || result.data?.success) {
        storage.updateOrderStatus(order.id, 'cancelled')
        loadOrders()
        setSelectedOrder(null)
        
        showToast({
          type: 'success',
          title: language === 'ar' ? 'تم الإلغاء' : 'Cancelled',
          message: language === 'ar' ? 'تم إلغاء الطلب بنجاح' : 'Order cancelled successfully',
          duration: 3000
        })
      } else {
        throw new Error(result.error || result.message || 'Failed to cancel order')
      }
    } catch (error: any) {
      console.error('Failed to cancel order:', error)
      showToast({
        type: 'error',
        title: language === 'ar' ? 'فشل الإلغاء' : 'Cancellation Failed',
        message: language === 'ar' 
          ? `فشل إلغاء الطلب: ${error.message || 'خطأ غير معروف'}`
          : `Failed to cancel order: ${error.message || 'Unknown error'}`,
        duration: 4000
      })
    }
  }

  const handleEditOrder = (order: Order) => {
    if (onEditOrder) {
      onEditOrder(order)
    }
  }

  const canEditOrder = (order: Order): boolean => {
    if (!order.canCancelUntil) return false
    const deadline = new Date(order.canCancelUntil)
    const now = new Date()
    if (now > deadline) return false
    return ['pending', 'جديد'].includes(order.status)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/75 backdrop-blur-md z-[9999] flex items-end md:items-center justify-center md:p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-t-3xl md:rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800 z-10">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {language === 'ar' ? 'طلباتي' : 'My Orders'}
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-red-500 hover:text-white flex items-center justify-center transition-colors"
            aria-label="إغلاق"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto max-h-[calc(90vh-80px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Package className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-4" />
              <p className="text-lg font-semibold text-slate-600 dark:text-slate-400">
                {language === 'ar' ? 'لا توجد طلبات' : 'No orders yet'}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-500 mt-2">
                {language === 'ar' ? 'ابدأ بطلب الآن!' : 'Start ordering now!'}
              </p>
            </div>
          ) : selectedOrder ? (
            // Order Details View
            <div className="space-y-6">
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-purple-600 dark:text-purple-400 hover:underline text-sm font-medium flex items-center gap-1"
              >
                ← {language === 'ar' ? 'العودة' : 'Back'}
              </button>

              {/* Order Header */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-slate-700 dark:to-slate-600 rounded-xl p-4 border-2 border-purple-200 dark:border-purple-800">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {language === 'ar' ? 'رقم الطلب' : 'Order ID'}
                    </p>
                    <p className="font-mono text-lg font-bold text-purple-600 dark:text-purple-400">
                      #{selectedOrder.id}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                      {language === 'ar' ? 'الحالة' : 'Status'}
                    </p>
                    <div className={`px-3 py-1 rounded-full text-sm font-bold ${STATUS_CONFIG[selectedOrder.status]?.color || STATUS_CONFIG.pending.color}`}>
                      {STATUS_CONFIG[selectedOrder.status]?.label || selectedOrder.status}
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-3">
                  {language === 'ar' ? 'المنتجات' : 'Items'}
                </h3>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">{item.name}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {language === 'ar' ? 'الكمية' : 'Qty'}: {item.quantity}
                        </p>
                      </div>
                      <p className="font-bold text-purple-600 dark:text-purple-400">
                        {item.price * item.quantity} ج.م
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Info */}
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                  <Phone className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {language === 'ar' ? 'رقم الهاتف' : 'Phone'}
                    </p>
                    <p className="font-medium text-slate-900 dark:text-white">{selectedOrder.customerPhone || selectedOrder.customer?.phone}</p>
                  </div>
                </div>

                {selectedOrder.deliveryAddress && (
                  <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                    <MapPin className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {language === 'ar' ? 'عنوان التسليم' : 'Delivery Address'}
                      </p>
                      <p className="font-medium text-slate-900 dark:text-white">{selectedOrder.deliveryAddress}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                  <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {language === 'ar' ? 'تاريخ الطلب' : 'Order Date'}
                    </p>
                    <p className="font-medium text-slate-900 dark:text-white">{formatDate(selectedOrder.createdAt)}</p>
                  </div>
                </div>
              </div>

              {/* ✅ Edit/Cancel Timer - Compact version */}
              {selectedOrder.canCancelUntil && 
               (() => {
                const deadline = new Date(selectedOrder.canCancelUntil)
                const now = new Date()
                if (now >= deadline) return null
                if (!['pending', 'جديد', 'مؤكد', 'confirmed'].includes(selectedOrder.status)) return null
                
                const remaining = deadline.getTime() - now.getTime()
                const minutes = Math.floor(remaining / 60000)
                const seconds = Math.floor((remaining % 60000) / 1000)
                
                if (minutes < 0 || seconds < 0) return null
                
                return (
                  <div key={timerKey} className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-4 border-2 border-amber-200 dark:border-amber-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400 animate-pulse" />
                        <div>
                          <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                            {language === 'ar' ? 'وقت التعديل/الإلغاء المتبقي' : 'Time left to edit/cancel'}
                          </p>
                          <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                            {language === 'ar' ? 'يمكنك تعديل أو إلغاء الطلب خلال هذا الوقت' : 'You can edit or cancel within this time'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-black text-amber-600 dark:text-amber-400 tabular-nums">
                          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                        </div>
                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                          {language === 'ar' ? 'دقيقة' : 'minutes'}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })()}

              {/* ✅ Action Buttons: Track & Edit */}
              {!['delivered', 'cancelled', 'تم التسليم', 'ملغي'].includes(selectedOrder.status) && (
                <div className="space-y-3">
                  {/* Track Order Button */}
                  <button
                    onClick={() => {
                      // Open TrackingModal
                      const event = new CustomEvent('openTrackingModal', { 
                        detail: { order: selectedOrder } 
                      })
                      window.dispatchEvent(event)
                    }}
                    className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-95"
                  >
                    <Package className="w-5 h-5" />
                    {language === 'ar' ? '📍 تتبع الطلب' : '📍 Track Order'}
                  </button>

                  {/* Edit Order Button (only in first 5 minutes) */}
                  {selectedOrder.canCancelUntil && 
                   new Date() < new Date(selectedOrder.canCancelUntil) &&
                   ['pending', 'جديد'].includes(selectedOrder.status) &&
                   onEditOrder && (
                    <button
                      onClick={() => {
                        onEditOrder(selectedOrder)
                        onClose()
                      }}
                      className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-95"
                    >
                      <Edit className="w-5 h-5" />
                      {language === 'ar' ? '✏️ تعديل الطلب' : '✏️ Edit Order'}
                    </button>
                  )}
                </div>
              )}

              {/* 🎯 Enhanced Tracking Information */}
              {(selectedOrder.progress !== undefined || selectedOrder.last_updated_by) && (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 border-2 border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2 mb-4">
                    <Package className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <p className="text-sm font-bold text-green-800 dark:text-green-300">
                      {language === 'ar' ? 'حالة الطلب' : 'Order Status'}
                    </p>
                  </div>
                  
                  {/* Progress Bar with Animation */}
                  {selectedOrder.progress !== undefined && (
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          {language === 'ar' ? 'نسبة الإنجاز' : 'Progress'}
                        </span>
                        <span className="text-lg font-bold text-green-600 dark:text-green-400">
                          {selectedOrder.progress}%
                        </span>
                      </div>
                      <div className="relative w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden shadow-inner">
                        <div 
                          className="h-full bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 transition-all duration-700 ease-out relative"
                          style={{ width: `${selectedOrder.progress}%` }}
                        >
                          {/* Shine effect */}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Last Updated By - Enhanced */}
                  {selectedOrder.last_updated_by && (
                    <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-green-100 dark:border-slate-700">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-xs text-slate-600 dark:text-slate-400">
                          {language === 'ar' ? 'آخر تحديث بواسطة' : 'Last updated by'}
                        </span>
                      </div>
                      <p className={`mt-1 font-semibold text-sm ${
                        selectedOrder.last_updated_by === 'system' ? 'text-blue-600 dark:text-blue-400' :
                        selectedOrder.last_updated_by === 'auto-time-progress' ? 'text-purple-600 dark:text-purple-400' :
                        selectedOrder.last_updated_by.startsWith('admin:') ? 'text-orange-600 dark:text-orange-400' :
                        'text-slate-700 dark:text-slate-300'
                      }`}>
                        {selectedOrder.last_updated_by === 'system' ? (language === 'ar' ? '🔧 النظام' : '🔧 System') :
                         selectedOrder.last_updated_by === 'auto-time-progress' ? (language === 'ar' ? '⚡ تحديث تلقائي' : '⚡ Auto-update') :
                         selectedOrder.last_updated_by.startsWith('admin:') ? `👨‍💼 ${selectedOrder.last_updated_by.split(':')[1]}` :
                         selectedOrder.last_updated_by}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Branch Info with Contact */}
              {(selectedOrder.branchName || selectedOrder.branch) && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 border-2 border-blue-200 dark:border-blue-800">
                  <div className="flex items-start gap-3 mb-3">
                    <Store className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                        {selectedOrder.deliveryMethod === 'pickup' 
                          ? (language === 'ar' ? 'الفرع المحدد للاستلام' : 'Pickup Branch')
                          : (language === 'ar' ? 'الفرع المسؤول عن التوصيل' : 'Delivery Branch')
                        }
                      </p>
                      <p className="font-bold text-lg text-blue-600 dark:text-blue-400">
                        {selectedOrder.branchName || selectedOrder.branch}
                      </p>
                      {selectedOrder.branchAddress && (
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 flex items-start gap-1">
                          <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                          {selectedOrder.branchAddress}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Contact Button */}
                  {selectedOrder.branchPhone && (
                    <a
                      href={`tel:${selectedOrder.branchPhone}`}
                      className="flex items-center justify-center gap-2 w-full py-2.5 bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 border-2 border-blue-200 dark:border-blue-700 rounded-lg font-semibold text-blue-600 dark:text-blue-400 transition-all active:scale-95"
                    >
                      <PhoneCall className="w-4 h-4" />
                      <span>{language === 'ar' ? 'اتصل بالفرع' : 'Call Branch'}</span>
                      <span className="text-sm opacity-75">({selectedOrder.branchPhone})</span>
                    </a>
                  )}
                </div>
              )}

              {/* Total */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-slate-700 dark:to-slate-600 rounded-xl p-4 border-2 border-purple-200 dark:border-purple-800">
                <div className="space-y-2 text-sm">
                  {selectedOrder.totals && (
                    <>
                      <div className="flex justify-between text-slate-700 dark:text-slate-300">
                        <span>{language === 'ar' ? 'المجموع الفرعي' : 'Subtotal'}:</span>
                        <span className="font-semibold">{selectedOrder.totals.subtotal?.toFixed(2) || 0} ج.م</span>
                      </div>
                      {selectedOrder.totals.deliveryFee > 0 && (
                        <div className="flex justify-between text-slate-700 dark:text-slate-300">
                          <span>{language === 'ar' ? 'رسوم التوصيل' : 'Delivery Fee'}:</span>
                          <span className="font-semibold">{selectedOrder.totals.deliveryFee.toFixed(2)} ج.م</span>
                        </div>
                      )}
                      {selectedOrder.totals.discount > 0 && (
                        <div className="flex justify-between text-green-600 dark:text-green-400">
                          <span>{language === 'ar' ? 'الخصم' : 'Discount'}:</span>
                          <span className="font-semibold">-{selectedOrder.totals.discount.toFixed(2)} ج.م</span>
                        </div>
                      )}
                    </>
                  )}
                  <div className="pt-2 border-t border-purple-200 dark:border-slate-500 flex justify-between font-bold text-lg">
                    <span className="text-slate-800 dark:text-slate-100">
                      {language === 'ar' ? 'الإجمالي' : 'Total'}:
                    </span>
                    <span className="text-purple-600 dark:text-purple-400">
                      {selectedOrder.total} ج.م
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {canEditOrder(selectedOrder) && (
                  <button
                    onClick={() => handleEditOrder(selectedOrder)}
                    className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg font-bold transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                  >
                    <Edit className="w-5 h-5" />
                    {language === 'ar' ? 'تعديل الطلب' : 'Edit Order'}
                  </button>
                )}

                {(() => {
                  const canCancel = selectedOrder.canCancelUntil && 
                    new Date(selectedOrder.canCancelUntil) > new Date() &&
                    ['pending', 'confirmed', 'preparing', 'جديد', 'مؤكد'].includes(selectedOrder.status)
                  
                  if (!canCancel) return null
                  
                  return (
                    <button
                      onClick={() => handleCancelOrder(selectedOrder)}
                      className="w-full py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-bold transition-colors"
                    >
                      {language === 'ar' ? 'إلغاء الطلب' : 'Cancel Order'}
                    </button>
                  )
                })()}
              </div>
            </div>
          ) : (
            // Orders List View
            <div className="space-y-3">
              {memoizedOrders.map((order) => {  // ✅ NEW: استخدم memoizedOrders
                const orderTotal = order.total || order.totals?.total || 0
                const deliveryMethod = order.deliveryMethod || (order.branch ? 'pickup' : 'delivery')
                
                return (
                  <button
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className="w-full text-left p-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-600 hover:from-purple-50 hover:to-pink-50 dark:hover:from-purple-900/20 dark:hover:to-pink-900/20 rounded-xl transition-all border-2 border-slate-200 dark:border-slate-600 hover:border-purple-300 dark:hover:border-purple-700 shadow-sm hover:shadow-md"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <p className="font-mono text-sm font-bold text-slate-900 dark:text-white">#{order.id}</p>
                          <div className={`px-2 py-1 rounded-full text-xs font-bold ${STATUS_CONFIG[order.status]?.color || STATUS_CONFIG.pending.color}`}>
                            {STATUS_CONFIG[order.status]?.label || order.status}
                          </div>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                          {formatDate(order.createdAt)}
                        </p>
                        
                        {/* ✅ Progress Bar in List */}
                        {order.progress !== undefined && !['delivered', 'cancelled', 'تم التسليم', 'ملغي'].includes(order.status) && (
                          <div className="mb-3">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs text-slate-600 dark:text-slate-400">
                                {language === 'ar' ? 'التقدم' : 'Progress'}
                              </span>
                              <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
                                {order.progress}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                                style={{ width: `${order.progress}%` }}
                              />
                            </div>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-3 text-sm">
                          <div className="flex items-center gap-1">
                            <Package className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            <span className="text-slate-600 dark:text-slate-400">
                              {order.items?.length || 0} {language === 'ar' ? 'منتج' : 'items'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            {deliveryMethod === 'pickup' ? (
                              <>
                                <Store className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                <span className="text-slate-600 dark:text-slate-400">
                                  {language === 'ar' ? 'استلام من الفرع' : 'Pickup'}
                                </span>
                              </>
                            ) : (
                              <>
                                <Truck className="w-4 h-4 text-green-600 dark:text-green-400" />
                                <span className="text-slate-600 dark:text-slate-400">
                                  {language === 'ar' ? 'توصيل' : 'Delivery'}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                          {orderTotal.toFixed(2)} ج.م
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {language === 'ar' ? 'اضغط للمزيد' : 'Tap for details'}
                        </p>
                      </div>
                    </div>
                  </button>
                )
              })}
              {memoizedOrders.length === 0 && (  // ✅ NEW: Handle empty state (مكرر للتوافق، لكن موجود بالفعل)
                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                  {language === 'ar' ? 'لا توجد طلبات حاليًا' : 'No orders yet'}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}