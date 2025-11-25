// ✅ EXTRACTED LOGIC: useOrderTracking.ts
// All business logic, state management, and polling extracted from TrackingModal

'use client'

import { useState, useEffect, useRef } from 'react'
import { storage } from '@/lib/storage.client'
import { useToast } from '@/providers/ToastProvider'
import { OrderPollerManager } from '@/lib/orderPoller'
import { FINAL_STATUSES } from '@/lib/orderTracking'

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

export interface Order {
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

interface UseOrderTrackingProps {
  isOpen: boolean
  order?: Order | null
}

export const useOrderTracking = ({ isOpen, order }: UseOrderTrackingProps) => {
  const { showToast } = useToast()
  const [currentOrder, setCurrentOrder] = useState(order)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const pollerRef = useRef<any>(null)

  // ===================================
  // STATUS FORMATTING
  // ===================================
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

  // ===================================
  // ORDER POLLING LOGIC
  // ===================================
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
    
    console.log('✅ OrderTracking subscribed to OrderPoller:', order.id)

    // Cleanup on unmount
    return () => {
      if (pollerRef.current) {
        poller.unsubscribe(pollerRef.current)
        pollerRef.current = null
        console.log('🧹 OrderTracking unsubscribed from OrderPoller:', order.id)
      }
    }
  }, [isOpen, order?.id])

  // Sync order prop changes
  useEffect(() => {
    if (order) {
      setCurrentOrder(order)
    }
  }, [order])

  // ===================================
  // MANUAL REFRESH
  // ===================================
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

  // ===================================
  // EDIT ORDER LOGIC
  // ===================================
  const canEditOrder = (order: Order | null): boolean => {
    if (!order || !order.canCancelUntil) return false
    const deadline = new Date(order.canCancelUntil)
    const now = new Date()
    if (now > deadline) return false
    return ['pending', 'جديد'].includes(order.status)
  }

  // ===================================
  // BRANCH HELPERS
  // ===================================
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

  const getBranchLocation = (): { lat: number; lng: number } | null => {
    if (!currentOrder?.branch) return null
    if (typeof currentOrder.branch === 'object' && currentOrder.branch.location_lat && currentOrder.branch.location_lng) {
      return {
        lat: currentOrder.branch.location_lat,
        lng: currentOrder.branch.location_lng
      }
    }
    return null
  }

  // ===================================
  // CONTACT HANDLERS
  // ===================================
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

  // ===================================
  // RETURN ALL STATE AND HANDLERS
  // ===================================
  return {
    // State
    currentOrder,
    isRefreshing,
    
    // Formatters
    getStatusLabel,
    formatUpdatedBy,
    
    // Handlers
    handleManualRefresh,
    canEditOrder,
    
    // Branch helpers
    getBranchPhone,
    getBranchName,
    getBranchAddress,
    getBranchLocation,
    
    // Contact handlers
    handleCallBranch,
    handleWhatsApp
  }
}
