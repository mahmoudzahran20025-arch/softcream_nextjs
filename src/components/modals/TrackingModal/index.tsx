'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Phone, MessageCircle, XCircle, Store, MapPin, Package, Loader2, Edit, AlertCircle, RefreshCw } from 'lucide-react'
import SimpleOrderTimer from '@/components/ui/SimpleOrderTimer'
import { storage } from '@/lib/storage.client'
import { useTheme } from '@/providers/ThemeProvider'

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
  // NEW TRACKING FIELDS
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

// ✅ Smart Polling Configuration (Optimized - تم التحسين)
const POLLING_CONFIG = {
  'جديد': 10000,          // 10s - New order (كان 3s)
  'pending': 10000,       // 10s
  'مؤكد': 15000,          // 15s - Confirmed (كان 5s)
  'confirmed': 15000,     // 15s
  'قيد التحضير': 20000,  // 20s - Preparing (كان 10s)
  'preparing': 20000,     // 20s
  'جاري التوصيل': 30000, // 30s - Out for delivery (كان 5s)
  'out_for_delivery': 30000, // 30s
  'في الطريق': 30000,    // 30s - Out for delivery
  'جاهز': 30000,          // 30s - Ready for pickup (كان 15s)
  'ready': 30000,         // 30s
  'default': 15000        // 15s - Default
}

// ✅ Final statuses - stop polling
const FINAL_STATUSES = ['delivered', 'cancelled', 'تم التوصيل', 'ملغي', 'مكتمل', 'completed']

export default function TrackingModal({ isOpen, onClose, order, onEditOrder }: TrackingModalProps) {
  const { showToast } = useTheme()
  const [currentOrder, setCurrentOrder] = useState(order)
  const [canCancel, setCanCancel] = useState(true)
  const [isCancelling, setIsCancelling] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false) // ✅ FIX: For manual refresh
  
  // ✅ Refs to prevent memory leaks
  const isMountedRef = useRef(true)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastFetchRef = useRef<number>(0)
  const fetchCountRef = useRef<number>(0)
  const unchangedCountRef = useRef<number>(0) // ✅ FIX: Unchanged counter
  const lastModifiedRef = useRef<string | null>(null) // ✅ For Conditional Requests

  // Helper functions - defined before useEffect
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

  // Format update source for display
  const formatUpdatedBy = (updatedBy: string): string => {
    if (!updatedBy) return 'النظام'
    if (updatedBy === 'system') return '🔧 النظام'
    if (updatedBy === 'auto-time-progress') return '⚡ تحديث تلقائي'
    if (updatedBy.startsWith('admin:')) return `👨‍💼 أدمن: ${updatedBy.split(':')[1]}`
    return updatedBy
  }

  // Fetch status function - moved outside useEffect
  const fetchStatus = async () => {
    if (!isMountedRef.current || !isOpen || !order?.id) return
    
    const now = Date.now()
    
    // ✅ Rate limiting: Min 1 second between requests
    if (now - lastFetchRef.current < 1000) {
      console.log('⏭️ Skipping fetch (rate limited)')
      return
    }
    lastFetchRef.current = now

    // ✅ FIX: Max fetches limit
    if (fetchCountRef.current > 20) {
      console.log('🛑 Max fetches reached, stopping polling')
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
      return
    }

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://softcream-api.mahmoud-zahran20025.workers.dev'
      // 🎯 Use new tracking endpoint - path should be part of URL, not query parameter
      const url = `${API_URL}/orders/${order.id}/tracking`
      
      // ✅ إضافة If-Modified-Since للـ Conditional Requests
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
      
      if (lastModifiedRef.current) {
        headers['If-Modified-Since'] = lastModifiedRef.current
      }

      const response = await fetch(url, {
        method: 'GET',
        headers
      })
      
      // ✅ معالجة 304 Not Modified
      if (response.status === 304) {
        console.log('✅ Not Modified (304) - no changes')
        unchangedCountRef.current++
        return
      }
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ API Error Details:', {
          status: response.status,
          statusText: response.statusText,
          url: url,
          body: errorText
        })
        
        // ✅ معالجة خاصة للـ Rate Limiting
        if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After')
          const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : 30000 // 30s default
          console.log(`🔒 Rate limited - waiting ${waitTime/1000}s before retry`)
          unchangedCountRef.current++
          
          // زيادة الـ interval للـ polling التالي
          setTimeout(() => {
            if (isMountedRef.current) {
              fetchStatus()
            }
          }, waitTime)
          return
        }
        
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      // ✅ حفظ Last-Modified header
      const lastModified = response.headers.get('Last-Modified')
      if (lastModified) {
        lastModifiedRef.current = lastModified
        console.log('📅 Last-Modified saved:', lastModified)
      }

      // ✅ Cache awareness logging
      const cacheStatus = response.headers.get('X-Cache')
      const rateLimitRemaining = response.headers.get('X-RateLimit-Remaining')
      if (cacheStatus) {
        console.log(`📦 Cache status: ${cacheStatus}`)
      }
      if (rateLimitRemaining) {
        console.log(`🔒 Rate limit remaining: ${rateLimitRemaining}`)
      }

      const trackingData = data.data
      
      if (trackingData && isMountedRef.current) {
        const oldStatus = currentOrder?.status
        const newStatus = trackingData.status

        setCurrentOrder(prev => prev ? {
          ...prev,
          status: newStatus,
          progress: trackingData.progress_percentage,
          last_updated_by: trackingData.last_updated_by,
          timeline: trackingData.timeline,
          estimatedMinutes: trackingData.total_estimated_minutes,
          canCancelUntil: prev.canCancelUntil
        } : null)
        
        // 🎯 Update storage with tracking data
        storage.updateOrderTracking(order.id, {
          progress: trackingData.progress_percentage,
          last_updated_by: trackingData.last_updated_by,
          timeline: trackingData.timeline
        })

        // ✅ Show toast only on actual status change
        if (oldStatus && oldStatus !== newStatus) {
          showToast({
            type: 'info',
            title: 'تحديث الطلب',
            message: `${getStatusLabel(newStatus)} - ${formatUpdatedBy(trackingData.last_updated_by)}`,
            duration: 3000
          })
          unchangedCountRef.current = 0 // Reset on change
        } else {
          unchangedCountRef.current++ // Increment unchanged
        }

        fetchCountRef.current++
        console.log(`✅ Status: ${newStatus} (${trackingData.progress_percentage}%) - Updated by: ${trackingData.last_updated_by} (fetch #${fetchCountRef.current})`)

        // ✅ Stop polling if order is complete
        if (FINAL_STATUSES.includes(newStatus)) {
          console.log('🏁 Order complete, stopping polling')
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
            timeoutRef.current = null
          }
          return
        }
      }
    } catch (error) {
      console.error('❌ Fetch error:', error)
      unchangedCountRef.current++ // ✅ FIX: Treat error as unchanged
    }
  }

  // ✅ Smart Polling with cleanup
  useEffect(() => {
    if (!isOpen || !order?.id) {
      // Clean up on close
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
      return
    }

    isMountedRef.current = true
    fetchCountRef.current = 0
    unchangedCountRef.current = 0

    const scheduleNextPoll = () => {
      if (!isMountedRef.current || !isOpen) return
      
      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      // ✅ Don't poll if final status
      if (currentOrder && FINAL_STATUSES.includes(currentOrder.status)) {
        console.log('🛑 Final status reached, no more polling')
        return
      }

      // ✅ FIX: Stop polling if canCancelUntil expired (5 min window over)
      if (currentOrder?.canCancelUntil) {
        const deadline = new Date(currentOrder.canCancelUntil)
        const now = new Date()
        if (now >= deadline) {
          console.log('🛑 5-min edit/cancel window expired, stopping polling (use phone for changes)')
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
            timeoutRef.current = null
          }
          return
        }
      }

      // ✅ Get interval based on status
      const status = currentOrder?.status || 'default'
      let interval = (POLLING_CONFIG as any)[status] || POLLING_CONFIG.default
      
      // ✅ FIX: Increase interval if unchanged >5
      if (unchangedCountRef.current > 5) {
        interval = Math.max(interval * 3, 30000) // 30s min
        console.log('⏸️ Paused mode: unchanged for 5+ fetches')
      }
      
      console.log(`⏰ Next poll in ${interval / 1000}s (status: ${status})`)
      
      timeoutRef.current = setTimeout(async () => {
        await fetchStatus()
        scheduleNextPoll()
      }, interval)
    }

    // ✅ Initial fetch
    fetchStatus().then(() => {
      scheduleNextPoll()
    })

    // ✅ Cleanup on unmount
    return () => {
      console.log('🧹 Cleaning up polling')
      isMountedRef.current = false
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }
  }, [isOpen, order?.id, currentOrder?.status, currentOrder?.canCancelUntil]) // ✅ FIX: Add canCancelUntil to deps

  // Update currentOrder when prop changes
  useEffect(() => {
    if (order) {
      setCurrentOrder(order)
    }
  }, [order])

  // Check if can cancel
  useEffect(() => {
    if (!currentOrder?.canCancelUntil) {
      setCanCancel(false)
      return
    }
    
    const deadline = new Date(currentOrder.canCancelUntil)
    const now = new Date()
    setCanCancel(now < deadline)
  }, [currentOrder?.canCancelUntil])

  const handleManualRefresh = async () => {
    if (!order?.id) return
    
    setIsRefreshing(true)
    try {
      await fetchStatus()
      showToast({
        type: 'success',
        title: 'تم التحديث',
        message: 'حالة الطلب محدثة',
        duration: 2000
      })
      unchangedCountRef.current = 0
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

  const handleCancelOrder = async () => {
    if (!canCancel || !currentOrder) return
    
    const confirmed = window.confirm(
      'هل أنت متأكد من إلغاء الطلب؟\n\n' +
      '⚠️ لا يمكن التراجع عن هذا الإجراء'
    )
    
    if (!confirmed) return
    
    setIsCancelling(true)
    
    try {
      const { cancelOrder } = await import('@/lib/api')
      const result = await cancelOrder(currentOrder.id)
      
      const responseData = result.data || result
      
      if (!result.success && !responseData?.success) {
        throw new Error(responseData?.message || responseData?.error || result.error || 'فشل الإلغاء')
      }
      
      storage.updateOrderStatus(currentOrder.id, 'cancelled')
      storage.updateOrder(currentOrder.id, {
        status: 'cancelled',
        canCancelUntil: null
      })
      
      setCurrentOrder({
        ...currentOrder,
        status: 'cancelled',
        canCancelUntil: undefined
      })
      
      setCanCancel(false)
      
      showToast({
        type: 'success',
        title: 'تم الإلغاء',
        message: 'تم إلغاء الطلب بنجاح',
        duration: 3000
      })
      
      setTimeout(() => {
        onClose()
      }, 2000)
      
    } catch (error: any) {
      console.error('Failed to cancel order:', error)
      const errorMessage = error.message || error.error || 'خطأ غير معروف'
      showToast({
        type: 'error',
        title: 'فشل الإلغاء',
        message: errorMessage,
        duration: 4000
      })
    } finally {
      setIsCancelling(false)
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

  const getTimeRemaining = (): string | null => {
    if (!currentOrder?.canCancelUntil) return null
    const deadline = new Date(currentOrder.canCancelUntil)
    const now = new Date()
    const diff = deadline.getTime() - now.getTime()
    if (diff <= 0) return null
    const minutes = Math.floor(diff / 60000)
    const seconds = Math.floor((diff % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
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
      className="fixed inset-0 bg-black/75 backdrop-blur-md z-[9999] flex items-center justify-center p-5"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-3xl max-w-[550px] w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b-2 border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
          <div className="flex items-center gap-3">
            <Package className="w-6 h-6 text-purple-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">تتبع الطلب</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                يتم التحديث تلقائياً
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all"
            aria-label="إغلاق"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Order ID */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-4 border-2 border-purple-200 dark:border-purple-800">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">رقم الطلب</p>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">#{currentOrder.id}</p>
          </div>

          {/* Timer */}
          {currentOrder.createdAt && currentOrder.estimatedMinutes && currentOrder.canCancelUntil && (
            <SimpleOrderTimer
              createdAt={currentOrder.createdAt}
              estimatedMinutes={currentOrder.estimatedMinutes}
              canCancelUntil={currentOrder.canCancelUntil}
              onCanCancelExpired={() => setCanCancel(false)}
            />
          )}

          {/* Status */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border-2 border-blue-200 dark:border-blue-800">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">حالة الطلب</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${
                  (currentOrder.status === 'pending' || currentOrder.status === 'جديد') ? 'bg-yellow-500 animate-pulse' :
                  (currentOrder.status === 'confirmed' || currentOrder.status === 'مؤكد') ? 'bg-green-500' :
                  (currentOrder.status === 'cancelled' || currentOrder.status === 'ملغي') ? 'bg-red-500' : 'bg-blue-500'
                }`} />
                <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {getStatusLabel(currentOrder.status)}
                </p>
              </div>
              {/* ✅ FIX: Refresh button */}
              <button 
                onClick={handleManualRefresh} 
                disabled={isRefreshing} 
                className="p-1 rounded-full bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center"
                aria-label="تحديث يدوي"
              >
                {isRefreshing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Customer Info */}
          <div className="space-y-3">
            <h3 className="font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                {currentOrder.customer.name.charAt(0).toUpperCase()}
              </div>
              معلومات العميل
            </h3>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">الاسم:</span>
                <span className="font-semibold text-gray-800 dark:text-gray-100">{currentOrder.customer.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">الهاتف:</span>
                <span className="font-semibold text-gray-800 dark:text-gray-100 dir-ltr">{currentOrder.customer.phone}</span>
              </div>
              {currentOrder.customer.address && (
                <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
                  <p className="text-gray-600 dark:text-gray-400 mb-1">العنوان:</p>
                  <p className="font-semibold text-gray-800 dark:text-gray-100">{currentOrder.customer.address}</p>
                </div>
              )}
            </div>
          </div>

          {/* Branch Info (Pickup) */}
          {currentOrder.deliveryMethod === 'pickup' && currentOrder.branch && (
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border-2 border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 mb-3">
                <Store className="w-5 h-5 text-green-600" />
                <p className="font-bold text-green-800 dark:text-green-400">الفرع المحدد للاستلام</p>
              </div>
              <div className="space-y-2 text-sm">
                <p className="font-bold text-gray-800 dark:text-gray-100 text-base">
                  {getBranchName()}
                </p>
                {getBranchAddress() && (
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-600 dark:text-gray-400">{getBranchAddress()}</p>
                  </div>
                )}
                {getBranchPhone() && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <p className="text-gray-600 dark:text-gray-400 dir-ltr">{getBranchPhone()}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Items */}
          <div className="space-y-3">
            <h3 className="font-bold text-gray-800 dark:text-gray-100">المنتجات المطلوبة</h3>
            <div className="space-y-2">
              {currentOrder.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                  <div>
                    <p className="font-medium text-gray-800 dark:text-gray-100">{item.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {item.price.toFixed(2)} ج.م × {item.quantity}
                    </p>
                  </div>
                  <p className="font-bold text-purple-600 dark:text-purple-400">
                    {item.total.toFixed(2)} ج.م
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Total Summary */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-4 border-2 border-purple-200 dark:border-purple-800">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-700 dark:text-gray-300">
                <span>المجموع الفرعي:</span>
                <span className="font-semibold">{currentOrder.totals.subtotal.toFixed(2)} ج.م</span>
              </div>
              {currentOrder.totals.deliveryFee > 0 && (
                <div className="flex justify-between text-gray-700 dark:text-gray-300">
                  <span>رسوم التوصيل:</span>
                  <span className="font-semibold">{currentOrder.totals.deliveryFee.toFixed(2)} ج.م</span>
                </div>
              )}
              {currentOrder.totals.discount > 0 && (
                <div className="flex justify-between text-green-600 dark:text-green-400">
                  <span>الخصم:</span>
                  <span className="font-semibold">-{currentOrder.totals.discount.toFixed(2)} ج.م</span>
                </div>
              )}
              <div className="pt-2 border-t-2 border-purple-300 dark:border-purple-700 flex justify-between font-bold text-lg">
                <span className="text-gray-800 dark:text-gray-100">الإجمالي:</span>
                <span className="text-purple-600 dark:text-purple-400">
                  {currentOrder.totals.total.toFixed(2)} ج.م
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {/* Edit Button */}
            {canEditOrder(currentOrder) && onEditOrder && (
              <>
                <button
                  onClick={handleEditOrder}
                  className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-95"
                >
                  <Edit className="w-5 h-5" />
                  ✏️ تعديل الطلب
                </button>
                {getTimeRemaining() && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-3 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      <span className="font-bold">الوقت المتبقي للتعديل:</span> {getTimeRemaining()} دقيقة
                    </p>
                  </div>
                )}
              </>
            )}

            {/* Cancel Button */}
            {canCancel && (currentOrder.status === 'pending' || currentOrder.status === 'جديد') && (
              <button
                onClick={handleCancelOrder}
                disabled={isCancelling}
                className="w-full py-3 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 disabled:cursor-not-allowed shadow-lg hover:shadow-xl active:scale-95"
              >
                {isCancelling ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    جاري الإلغاء...
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5" />
                    ❌ إلغاء الطلب
                  </>
                )}
              </button>
            )}

            {/* Contact Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleCallBranch}
                className="py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-95"
              >
                <Phone className="w-5 h-5" />
                اتصال
              </button>
              <button
                onClick={handleWhatsApp}
                className="py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-95"
              >
                <MessageCircle className="w-5 h-5" />
                واتساب
              </button>
            </div>

            {/* Close */}
            <button
              onClick={onClose}
              className="w-full py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-xl font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}