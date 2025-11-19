'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Phone, MessageCircle, Store, MapPin, Package, Loader2, Edit, RefreshCw, TrendingUp, Clock, Navigation } from 'lucide-react'
import SimpleOrderTimer from '@/components/ui/SimpleOrderTimer'
import { storage } from '@/lib/storage.client'
import { useTheme } from '@/providers/ThemeProvider'
import { OrderPollerManager } from '@/lib/orderPoller'
import { FINAL_STATUSES, PICKUP_STAGES, DELIVERY_STAGES } from '@/lib/orderTracking'
import { openBranchDirections } from '@/lib/utils'

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

interface Branch {
  id?: string
  name: string
  address?: string
  phone?: string
  location_lat?: number
  location_lng?: number
}

interface Order {
  id: string
  status: string
  createdAt: string
  estimatedMinutes?: number
  canCancelUntil?: string
  items: OrderItem[]
  totals: OrderTotals
  customer: OrderCustomer
  deliveryMethod: 'pickup' | 'delivery'
  branch?: Branch | string | null
  branchPhone?: string
  eta?: string
  progress?: number
  last_updated_by?: string
  timeline?: Array<{ status: string; timestamp: string; updated_by: string }>
}

interface TrackingModalProps {
  isOpen: boolean
  onClose: () => void
  order?: Order | null
  onEditOrder?: (order: Order) => void
}

export default function TrackingModal({ isOpen, onClose, order, onEditOrder }: TrackingModalProps) {
  const { showToast } = useTheme()
  const [currentOrder, setCurrentOrder] = useState(order)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const pollerRef = useRef<any>(null)

  const getStatusLabel = (status: string): string => {
    const statusMap: Record<string, string> = {
      'pending': 'قيد المراجعة',
      'جديد': 'قيد المراجعة',
      'confirmed': 'تم التأكيد',
      'مؤكد': 'تم التأكيد',
      'preparing': 'قيد التحضير',
      'قيد التحضير': 'قيد التحضير',
      'out_for_delivery': 'في الطريق',
      'في الطريق': 'في الطريق',
      'ready': 'جاهز',
      'جاهز': 'جاهز',
      'delivered': 'تم التسليم',
      'cancelled': 'ملغي',
      'ملغي': 'ملغي'
    }
    return statusMap[status] || status
  }

  const formatUpdatedBy = (updatedBy: string): string => {
    if (!updatedBy) return 'النظام'
    if (updatedBy === 'system') return '🔧 النظام'
    if (updatedBy === 'auto-time-progress') return '⚡ تحديث تلقائي'
    if (updatedBy.startsWith('admin:')) return `👨‍💼 أدمن: ${updatedBy.split(':')[1]}`
    return updatedBy
  }

  // ✅ NEW: Use OrderPoller singleton
  useEffect(() => {
    if (!isOpen || !order?.id) {
      // Cleanup on close
      if (pollerRef.current) {
        const poller = OrderPollerManager.getInstance(order?.id || '')
        poller.unsubscribe(pollerRef.current)
        pollerRef.current = null
      }
      return
    }

    // Don't poll if order is in final status
    if (order && FINAL_STATUSES.includes(order.status)) {
      console.log('🏁 Order in final status, no polling needed:', order.id)
      return
    }

    // Get or create poller instance
    const poller = OrderPollerManager.getInstance(order.id)
    
    // Define callback
    const handleUpdate = (data: any) => {
      const oldStatus = currentOrder?.status
      const newStatus = data.status

      // Update local state
      setCurrentOrder(prev => prev ? {
        ...prev,
        status: newStatus,
        progress: data.progress,
        last_updated_by: data.last_updated_by,
        timeline: data.timeline,
        estimatedMinutes: data.estimatedMinutes || prev.estimatedMinutes,
        canCancelUntil: prev.canCancelUntil
      } : null)
      
      // Update storage
      storage.updateOrderTracking(order.id, {
        status: newStatus,
        progress: data.progress,
        last_updated_by: data.last_updated_by,
        timeline: data.timeline
      })

      // Show toast on status change
      if (oldStatus && oldStatus !== newStatus) {
        showToast({
          type: 'info',
          title: 'تحديث الطلب',
          message: `${getStatusLabel(newStatus)} - ${formatUpdatedBy(data.last_updated_by)}`,
          duration: 3000
        })
      }
    }
    
    // Subscribe to updates
    poller.subscribe(handleUpdate)
    pollerRef.current = handleUpdate
    
    console.log('✅ TrackingModal subscribed to OrderPoller:', order.id)

    // Cleanup on unmount
    return () => {
      if (pollerRef.current) {
        poller.unsubscribe(pollerRef.current)
        pollerRef.current = null
        console.log('🧹 TrackingModal unsubscribed from OrderPoller:', order.id)
      }
    }
  }, [isOpen, order?.id])

  useEffect(() => {
    if (order) {
      setCurrentOrder(order)
    }
  }, [order])

  const handleManualRefresh = async () => {
    if (!order?.id) return
    
    setIsRefreshing(true)
    try {
      const poller = OrderPollerManager.getInstance(order.id)
      await poller.refresh()
      showToast({
        type: 'success',
        title: 'تم التحديث',
        message: 'حالة الطلب محدثة',
        duration: 2000
      })
    } catch (error) {
      showToast({
        type: 'error',
        title: 'خطأ في التحديث',
        message: 'فشل في جلب الحالة',
        duration: 3000
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  const canEditOrder = (order: Order | null): boolean => {
    if (!order || !order.canCancelUntil) return false
    const deadline = new Date(order.canCancelUntil)
    const now = new Date()
    if (now > deadline) return false
    return ['pending', 'جديد'].includes(order.status)
  }

  const handleEditOrder = () => {
    if (!currentOrder || !onEditOrder) return
    if (!canEditOrder(currentOrder)) {
      showToast({
        type: 'warning',
        title: 'انتهت الفترة',
        message: 'انتهت فترة التعديل المسموحة (5 دقائق)',
        duration: 3000
      })
      return
    }
    onEditOrder(currentOrder)
  }

  const getBranchPhone = (): string | null => {
    if (!currentOrder) return null
    
    if (typeof currentOrder.branch === 'object' && currentOrder.branch?.phone) {
      return currentOrder.branch.phone
    }
    
    if (currentOrder.branchPhone) {
      return currentOrder.branchPhone
    }
    
    return currentOrder.customer.phone
  }

  const getBranchName = (): string => {
    if (!currentOrder?.branch) return 'غير محدد'
    if (typeof currentOrder.branch === 'string') return currentOrder.branch
    return currentOrder.branch.name || 'غير محدد'
  }

  const getBranchAddress = (): string | null => {
    if (!currentOrder?.branch) return null
    if (typeof currentOrder.branch === 'object') return currentOrder.branch.address || null
    return null
  }

  const handleCallBranch = () => {
    const phone = getBranchPhone()
    if (phone) {
      const cleanPhone = phone.replace(/\D/g, '')
      window.open(`tel:+2${cleanPhone}`, '_self')
    } else {
      showToast({
        type: 'error',
        title: 'خطأ',
        message: 'رقم الهاتف غير متاح',
        duration: 2000
      })
    }
  }

  const handleWhatsApp = () => {
    const phone = getBranchPhone()
    if (phone) {
      const cleanPhone = phone.replace(/\D/g, '')
      const message = `مرحباً 👋\n\nلدي استفسار عن الطلب:\n📦 رقم الطلب: #${currentOrder?.id}\n👤 الاسم: ${currentOrder?.customer.name}`
      window.open(`https://wa.me/+2${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank')
    } else {
      showToast({
        type: 'error',
        title: 'خطأ',
        message: 'رقم الواتساب غير متاح',
        duration: 2000
      })
    }
  }

  if (!isOpen || !currentOrder) return null

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-slate-900 rounded-3xl max-w-[580px] w-full max-h-[92vh] overflow-y-auto shadow-2xl animate-in zoom-in duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 🎨 Modern Header with Gradient */}
        <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-6 rounded-t-3xl">
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 flex items-center justify-center transition-all"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          <div className="flex items-center gap-4 text-white">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <Package className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-1">تتبع الطلب</h2>
              <div className="text-white/90 text-sm flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                يتم التحديث تلقائياً
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Order ID Card */}
          <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-5 border border-purple-200 dark:border-purple-800">
            <p className="text-xs font-medium text-purple-600 dark:text-purple-400 mb-1">رقم الطلب</p>
            <p className="text-3xl font-bold text-purple-700 dark:text-purple-300 font-mono">#{currentOrder.id}</p>
          </div>

          {/* Timer */}
          {currentOrder.createdAt && currentOrder.estimatedMinutes && currentOrder.canCancelUntil && (
            <SimpleOrderTimer
              createdAt={currentOrder.createdAt}
              estimatedMinutes={currentOrder.estimatedMinutes}
              canCancelUntil={currentOrder.canCancelUntil}
            />
          )}

          {/* 🎯 Enhanced Status Card with Pickup/Delivery Progress */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${
                  (currentOrder.status === 'pending' || currentOrder.status === 'جديد') ? 'bg-yellow-500 animate-pulse' :
                  (currentOrder.status === 'confirmed' || currentOrder.status === 'مؤكد') ? 'bg-green-500' :
                  (currentOrder.status === 'cancelled' || currentOrder.status === 'ملغي') ? 'bg-red-500' : 'bg-blue-500'
                }`} />
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">حالة الطلب</p>
                  <p className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                    {getStatusLabel(currentOrder.status)}
                  </p>
                </div>
              </div>
              <button 
                onClick={handleManualRefresh} 
                disabled={isRefreshing} 
                className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 disabled:opacity-50 transition-all"
                aria-label="تحديث يدوي"
              >
                {isRefreshing ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <RefreshCw className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* 🎯 Smart Progress Bar (Pickup = 4 stages, Delivery = 5 stages) */}
            {!FINAL_STATUSES.includes(currentOrder.status) && (
              <div className="space-y-4">
                {/* Progress Percentage */}
                {currentOrder.progress !== null && currentOrder.progress !== undefined && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">نسبة الإنجاز</span>
                    </div>
                    <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{currentOrder.progress}%</span>
                  </div>
                )}
                
                {/* Progress Bar */}
                <div className="relative w-full bg-slate-100 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 h-full rounded-full transition-all duration-700 ease-out relative"
                    style={{ width: `${currentOrder.progress || 0}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer"></div>
                  </div>
                </div>
                
                {/* 🎯 Stage Timeline (Pickup vs Delivery) */}
                <div className="pt-3">
                  <div className="flex justify-between items-start gap-2">
                    {(currentOrder.deliveryMethod === 'pickup' ? PICKUP_STAGES : DELIVERY_STAGES).map((stage) => {
                      const progress = currentOrder.progress || 0
                      const isCompleted = progress >= stage.progress
                      const isCurrent = Math.abs(progress - stage.progress) < 20
                      
                      return (
                        <div key={stage.id} className="flex flex-col items-center flex-1">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold transition-all mb-2 ${
                            isCompleted 
                              ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg scale-110' 
                              : isCurrent 
                                ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white animate-pulse shadow-lg' 
                                : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
                          }`}>
                            {isCompleted ? '✓' : stage.icon}
                          </div>
                          <span className={`text-xs text-center leading-tight ${
                            isCurrent ? 'font-bold text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400'
                          }`}>
                            {stage.label}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Last Updated By */}
            {currentOrder.last_updated_by && (
              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span className="text-xs text-slate-500 dark:text-slate-400">آخر تحديث بواسطة</span>
                  </div>
                  <p className={`text-sm font-semibold ${
                    currentOrder.last_updated_by === 'system' ? 'text-blue-600 dark:text-blue-400' :
                    currentOrder.last_updated_by === 'auto-time-progress' ? 'text-purple-600 dark:text-purple-400' :
                    currentOrder.last_updated_by.startsWith('admin:') ? 'text-orange-600 dark:text-orange-400' :
                    'text-slate-700 dark:text-slate-300'
                  }`}>
                    {formatUpdatedBy(currentOrder.last_updated_by)}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Customer Info */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold">
                {currentOrder.customer.name.charAt(0).toUpperCase()}
              </div>
              معلومات العميل
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">الاسم</span>
                <span className="font-semibold text-slate-900 dark:text-white">{currentOrder.customer.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">الهاتف</span>
                <span className="font-semibold text-slate-900 dark:text-white dir-ltr">{currentOrder.customer.phone}</span>
              </div>
              {currentOrder.customer.address && (
                <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                  <p className="text-slate-600 dark:text-slate-400 mb-2">العنوان</p>
                  <p className="font-semibold text-slate-900 dark:text-white">{currentOrder.customer.address}</p>
                </div>
              )}
            </div>
          </div>

          {/* 🎯 Enhanced Branch Info for Pickup */}
          {currentOrder.branch && (
            <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 rounded-2xl p-6 border-2 border-blue-200 dark:border-blue-800 shadow-lg">
              <div className="flex items-start gap-4 mb-5">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                  <Store className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-bold mb-1.5 uppercase tracking-wide">
                    {currentOrder.deliveryMethod === 'pickup' ? '🏪 استلام من الفرع' : '🚚 فرع التوصيل'}
                  </p>
                  <p className="font-black text-xl text-blue-700 dark:text-blue-300 mb-2">
                    {getBranchName()}
                  </p>
                  {getBranchAddress() && (
                    <div className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                      <MapPin className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <p className="leading-relaxed">{getBranchAddress()}</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* 🗺️ Pickup: Big Map Button */}
              {currentOrder.deliveryMethod === 'pickup' && typeof currentOrder.branch === 'object' && currentOrder.branch.location_lat && currentOrder.branch.location_lng && (
                <button
                  onClick={() => openBranchDirections(
                    (currentOrder.branch as any).location_lat,
                    (currentOrder.branch as any).location_lng
                  )}
                  className="w-full py-4 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 hover:from-blue-600 hover:via-indigo-600 hover:to-purple-700 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl active:scale-[0.98] mb-3"
                >
                  <Navigation className="w-6 h-6" />
                  <span className="text-lg">🗺️ فتح الاتجاهات في الخريطة</span>
                </button>
              )}
              
              {/* Contact Buttons */}
              {getBranchPhone() && (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleCallBranch}
                    className="flex items-center justify-center gap-2 py-3.5 bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 border-2 border-blue-300 dark:border-blue-700 rounded-xl font-bold text-blue-600 dark:text-blue-400 transition-all active:scale-95 shadow-sm"
                  >
                    <Phone className="w-5 h-5" />
                    <span>اتصال</span>
                  </button>
                  <button
                    onClick={handleWhatsApp}
                    className="flex items-center justify-center gap-2 py-3.5 bg-white dark:bg-slate-800 hover:bg-green-50 dark:hover:bg-slate-700 border-2 border-green-300 dark:border-green-700 rounded-xl font-bold text-green-600 dark:text-green-400 transition-all active:scale-95 shadow-sm"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span>واتساب</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Items */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4">المنتجات المطلوبة</h3>
            <div className="space-y-3">
              {currentOrder.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <div className="flex-1">
                    <p className="font-medium text-slate-900 dark:text-white">{item.name}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      {item.price.toFixed(2)} ج.م × {item.quantity}
                    </p>
                  </div>
                  <p className="font-bold text-lg text-purple-600 dark:text-purple-400">
                    {item.total.toFixed(2)} ج.م
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Total Summary */}
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-2xl p-5 border border-slate-200 dark:border-slate-600">
            <div className="space-y-3">
              <div className="flex justify-between text-slate-700 dark:text-slate-300">
                <span>المجموع الفرعي</span>
                <span className="font-semibold">{currentOrder.totals.subtotal.toFixed(2)} ج.م</span>
              </div>
              {currentOrder.totals.deliveryFee > 0 && (
                <div className="flex justify-between text-slate-700 dark:text-slate-300">
                  <span>رسوم التوصيل</span>
                  <span className="font-semibold">{currentOrder.totals.deliveryFee.toFixed(2)} ج.م</span>
                </div>
              )}
              {currentOrder.totals.discount > 0 && (
                <div className="flex justify-between text-green-600 dark:text-green-400">
                  <span>الخصم</span>
                  <span className="font-semibold">-{currentOrder.totals.discount.toFixed(2)} ج.م</span>
                </div>
              )}
              <div className="pt-3 border-t-2 border-slate-300 dark:border-slate-600 flex justify-between items-center">
                <span className="text-lg font-bold text-slate-800 dark:text-slate-100">الإجمالي</span>
                <span className="text-2xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {currentOrder.totals.total.toFixed(2)} ج.م
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {canEditOrder(currentOrder) && onEditOrder && (
              <button
                onClick={handleEditOrder}
                className="w-full py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-[0.98]"
              >
                <Edit className="w-5 h-5" />
                ✏️ تعديل الطلب
              </button>
            )}

            {/* Close Button */}
            <button
              onClick={onClose}
              className="w-full py-4 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-all"
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}