'use client'

import { useState, useEffect, useMemo } from 'react'
import { X, Package, Clock, CheckCircle2, Truck, MapPin, Phone, Store, Edit, PhoneCall, ChevronLeft } from 'lucide-react'
import { storage } from '@/lib/storage.client'
import { useToast } from '@/providers/ToastProvider'
import { useLanguage } from '@/providers/LanguageProvider'

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
  const { language } = useLanguage()
  const { showToast } = useToast()
  const [orders, setOrders] = useState<Order[]>([])
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadOrders()
    }
  }, [isOpen])
  
  useEffect(() => {
    const handleOrdersUpdated = (event: any) => {
      if (!isOpen) {
        console.log('⭐️ MyOrdersModal: Modal closed, skipping update')
        return
      }
      
      const { orderId, status, source } = event.detail || {}
      console.log(`📢 MyOrdersModal: Order ${orderId} updated to ${status} (source: ${source})`)
      
      loadOrders()
      
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
  }, [language, showToast, isOpen])

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

  const memoizedOrders = useMemo(() => orders, [orders])

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
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-end md:items-center justify-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-t-3xl md:rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 🎨 Modern Header */}
        <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 p-6">
          <button
            onClick={onClose}
            className="absolute top-4 left-4 w-9 h-9 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 flex items-center justify-center transition-all"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          <div className="flex items-center gap-3 text-white">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">
                {language === 'ar' ? 'طلباتي' : 'My Orders'}
              </h2>
              <p className="text-white/80 text-sm mt-0.5">
                {language === 'ar' ? `${orders.length} طلب` : `${orders.length} orders`}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto max-h-[calc(92vh-120px)]">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="relative">
                <div className="w-12 h-12 rounded-full border-4 border-purple-200 dark:border-purple-900"></div>
                <div className="w-12 h-12 rounded-full border-4 border-purple-600 border-t-transparent animate-spin absolute top-0"></div>
              </div>
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                <Package className="w-10 h-10 text-slate-400 dark:text-slate-600" />
              </div>
              <p className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
                {language === 'ar' ? 'لا توجد طلبات' : 'No orders yet'}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-500">
                {language === 'ar' ? 'ابدأ بطلب الآن!' : 'Start ordering now!'}
              </p>
            </div>
          ) : selectedOrder ? (
            // 🎯 Order Details View - Enhanced
            <div className="space-y-5 animate-in fade-in slide-in-from-right duration-300">
              <button
                onClick={() => setSelectedOrder(null)}
                className="flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:gap-3 transition-all font-medium group"
              >
                <ChevronLeft className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                {language === 'ar' ? 'العودة' : 'Back'}
              </button>

              {/* Order Header Card */}
              <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-5 border border-purple-200 dark:border-purple-800">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-xs font-medium text-purple-600 dark:text-purple-400 mb-1">
                      {language === 'ar' ? 'رقم الطلب' : 'Order ID'}
                    </p>
                    <p className="font-mono text-2xl font-bold text-purple-700 dark:text-purple-300">
                      #{selectedOrder.id}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                      {formatDate(selectedOrder.createdAt)}
                    </p>
                  </div>
                  <div className={`px-4 py-2 rounded-xl text-sm font-bold ${STATUS_CONFIG[selectedOrder.status]?.color || STATUS_CONFIG.pending.color}`}>
                    {STATUS_CONFIG[selectedOrder.status]?.label || selectedOrder.status}
                  </div>
                </div>

                {/* Progress Bar */}
                {selectedOrder.progress !== undefined && !['delivered', 'cancelled', 'تم التسليم', 'ملغي'].includes(selectedOrder.status) && (
                  <div className="mt-5 pt-5 border-t border-purple-200 dark:border-purple-800">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {language === 'ar' ? 'التقدم' : 'Progress'}
                      </span>
                      <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                        {selectedOrder.progress}%
                      </span>
                    </div>
                    <div className="relative w-full bg-purple-100 dark:bg-purple-900/30 rounded-full h-2.5 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 transition-all duration-700 ease-out relative overflow-hidden"
                        style={{ width: `${selectedOrder.progress}%` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer"></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Order Items */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700">
                <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5 text-purple-600" />
                  {language === 'ar' ? 'المنتجات' : 'Items'}
                </h3>
                <div className="space-y-3">
                  {selectedOrder.items?.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                      <div className="flex-1">
                        <p className="font-medium text-slate-900 dark:text-white">{item.name}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                          {item.price} {language === 'ar' ? 'ج.م' : 'EGP'} × {item.quantity}
                        </p>
                      </div>
                      <p className="font-bold text-lg text-purple-600 dark:text-purple-400">
                        {item.price * item.quantity} {language === 'ar' ? 'ج.م' : 'EGP'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <Phone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {language === 'ar' ? 'رقم الهاتف' : 'Phone'}
                      </p>
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {selectedOrder.customerPhone || selectedOrder.customer?.phone}
                      </p>
                    </div>
                  </div>
                </div>

                {selectedOrder.deliveryAddress && (
                  <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                          {language === 'ar' ? 'عنوان التسليم' : 'Delivery Address'}
                        </p>
                        <p className="font-medium text-slate-900 dark:text-white text-sm">
                          {selectedOrder.deliveryAddress}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Branch Info */}
              {(selectedOrder.branchName || selectedOrder.branch) && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-5 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center flex-shrink-0">
                      <Store className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">
                        {selectedOrder.deliveryMethod === 'pickup' 
                          ? (language === 'ar' ? 'الفرع المحدد للاستلام' : 'Pickup Branch')
                          : (language === 'ar' ? 'الفرع المسؤول عن التوصيل' : 'Delivery Branch')
                        }
                      </p>
                      <p className="font-bold text-lg text-blue-700 dark:text-blue-300 mb-2">
                        {selectedOrder.branchName || selectedOrder.branch}
                      </p>
                      {selectedOrder.branchAddress && (
                        <p className="text-sm text-slate-600 dark:text-slate-400 flex items-start gap-2">
                          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          {selectedOrder.branchAddress}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {selectedOrder.branchPhone && (
                    <a
                      href={`tel:${selectedOrder.branchPhone}`}
                      className="mt-4 flex items-center justify-center gap-2 w-full py-3 bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 border-2 border-blue-300 dark:border-blue-700 rounded-xl font-semibold text-blue-600 dark:text-blue-400 transition-all active:scale-95"
                    >
                      <PhoneCall className="w-5 h-5" />
                      <span>{language === 'ar' ? 'اتصل بالفرع' : 'Call Branch'}</span>
                    </a>
                  )}
                </div>
              )}

              {/* Total Summary */}
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-2xl p-5 border border-slate-200 dark:border-slate-600">
                <div className="space-y-3">
                  {selectedOrder.totals && (
                    <>
                      <div className="flex justify-between text-slate-700 dark:text-slate-300">
                        <span>{language === 'ar' ? 'المجموع الفرعي' : 'Subtotal'}</span>
                        <span className="font-semibold">{selectedOrder.totals.subtotal?.toFixed(2) || 0} ج.م</span>
                      </div>
                      {selectedOrder.totals.deliveryFee > 0 && (
                        <div className="flex justify-between text-slate-700 dark:text-slate-300">
                          <span>{language === 'ar' ? 'رسوم التوصيل' : 'Delivery Fee'}</span>
                          <span className="font-semibold">{selectedOrder.totals.deliveryFee.toFixed(2)} ج.م</span>
                        </div>
                      )}
                      {selectedOrder.totals.discount > 0 && (
                        <div className="flex justify-between text-green-600 dark:text-green-400">
                          <span>{language === 'ar' ? 'الخصم' : 'Discount'}</span>
                          <span className="font-semibold">-{selectedOrder.totals.discount.toFixed(2)} ج.م</span>
                        </div>
                      )}
                    </>
                  )}
                  <div className="pt-3 border-t-2 border-slate-300 dark:border-slate-600 flex justify-between items-center">
                    <span className="text-lg font-bold text-slate-800 dark:text-slate-100">
                      {language === 'ar' ? 'الإجمالي' : 'Total'}
                    </span>
                    <span className="text-2xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      {(selectedOrder.total || selectedOrder.totals?.total || 0).toFixed(2)} ج.م
                    </span>
                  </div>                </div>
              </div>

              {/* Action Buttons */}
              {!['delivered', 'cancelled', 'تم التسليم', 'ملغي'].includes(selectedOrder.status) && (
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      const event = new CustomEvent('openTrackingModal', { 
                        detail: { order: selectedOrder } 
                      })
                      window.dispatchEvent(event)
                    }}
                    className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-[0.98]"
                  >
                    <Package className="w-5 h-5" />
                    {language === 'ar' ? '🔍 تتبع الطلب' : '🔍 Track Order'}
                  </button>

                  {canEditOrder(selectedOrder) && onEditOrder && (
                    <button
                      onClick={() => {
                        onEditOrder(selectedOrder)
                        onClose()
                      }}
                      className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-[0.98]"
                    >
                      <Edit className="w-5 h-5" />
                      {language === 'ar' ? '✏️ تعديل الطلب' : '✏️ Edit Order'}
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            // Orders List View
            <div className="space-y-3">
              {memoizedOrders.map((order) => {
                const orderTotal = order.total || order.totals?.total || 0
                const deliveryMethod = order.deliveryMethod || (order.branch ? 'pickup' : 'delivery')
                
                return (
                  <button
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className="w-full text-left p-5 bg-white dark:bg-slate-800 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 dark:hover:from-purple-900/10 dark:hover:to-pink-900/10 rounded-2xl transition-all border border-slate-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-lg group"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-3">
                          <p className="font-mono text-base font-bold text-slate-900 dark:text-white">
                            #{order.id}
                          </p>
                          <div className={`px-3 py-1 rounded-full text-xs font-bold ${STATUS_CONFIG[order.status]?.color || STATUS_CONFIG.pending.color}`}>
                            {STATUS_CONFIG[order.status]?.label || order.status}
                          </div>
                        </div>
                        
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                          {formatDate(order.createdAt)}
                        </p>

                        {order.progress !== undefined && !['delivered', 'cancelled', 'تم التسليم', 'ملغي'].includes(order.status) && (
                          <div className="mb-3">
                            <div className="flex justify-between items-center mb-1.5">
                              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                                {language === 'ar' ? 'التقدم' : 'Progress'}
                              </span>
                              <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
                                {order.progress}%
                              </span>
                            </div>
                            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                                style={{ width: `${order.progress}%` }}
                              />
                            </div>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                          <div className="flex items-center gap-1.5">
                            <Package className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            <span>{order.items?.length || 0} {language === 'ar' ? 'منتج' : 'items'}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {deliveryMethod === 'pickup' ? (
                              <>
                                <Store className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                <span>{language === 'ar' ? 'استلام' : 'Pickup'}</span>
                              </>
                            ) : (
                              <>
                                <Truck className="w-4 h-4 text-green-600 dark:text-green-400" />
                                <span>{language === 'ar' ? 'توصيل' : 'Delivery'}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right flex flex-col items-end gap-2">
                        <p className="text-2xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                          {orderTotal.toFixed(2)}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {language === 'ar' ? 'ج.م' : 'EGP'}
                        </p>
                        <div className="mt-1 flex items-center gap-1 text-purple-600 dark:text-purple-400 text-xs font-medium group-hover:gap-2 transition-all">
                          <span>{language === 'ar' ? 'التفاصيل' : 'Details'}</span>
                          <ChevronLeft className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}