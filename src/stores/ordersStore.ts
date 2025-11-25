// ================================================================
// ordersStore.ts - Orders State Management with Zustand
// ================================================================
// Created: November 24, 2025
// Purpose: Replace custom events system with Zustand
// Benefits: Better performance, no memory leaks, easier debugging

import { create } from 'zustand'
import { storage } from '@/lib/storage.client'

interface Order {
  id: string
  status: string
  items: any[]
  total: number
  createdAt: string
  deliveryMethod?: 'delivery' | 'pickup'
  customer?: {
    name?: string
    phone?: string
    address?: string
  }
  totals?: {
    subtotal: number
    deliveryFee: number
    discount: number
    total: number
  }
  canCancelUntil?: string
  estimatedMinutes?: number
  progress?: number
  last_updated_by?: string
  timeline?: any[]
}

interface OrdersState {
  orders: Order[]
  activeCount: number
  
  // Actions
  loadOrders: () => void
  addOrder: (order: Order) => void
  updateOrder: (id: string, updates: Partial<Order>) => void
  updateOrderStatus: (id: string, status: string) => void
  updateOrderTracking: (id: string, trackingData: any) => void
  deleteOrder: (id: string) => void
  clearOrders: () => void
  getOrder: (id: string) => Order | undefined
  getActiveOrders: () => Order[]
}

export const useOrdersStore = create<OrdersState>((set, get) => ({
  orders: [],
  activeCount: 0,
  
  loadOrders: () => {
    const orders = storage.getOrders()
    const activeCount = storage.getActiveOrdersCount()
    set({ orders, activeCount })
    console.log('📦 Orders loaded:', orders.length, 'total,', activeCount, 'active')
  },
  
  addOrder: (order) => {
    storage.addOrder(order)
    get().loadOrders()
    console.log('➕ Order added:', order.id)
  },
  
  updateOrder: (id, updates) => {
    storage.updateOrder(id, updates)
    get().loadOrders()
    console.log('🔄 Order updated:', id)
  },
  
  updateOrderStatus: (id, status) => {
    storage.updateOrderStatus(id, status)
    get().loadOrders()
    console.log('📊 Order status updated:', id, '→', status)
  },
  
  updateOrderTracking: (id, trackingData) => {
    storage.updateOrderTracking(id, trackingData)
    get().loadOrders()
    console.log('🎯 Order tracking updated:', id)
  },
  
  deleteOrder: (id) => {
    storage.deleteOrder(id)
    get().loadOrders()
    console.log('🗑️ Order deleted:', id)
  },
  
  clearOrders: () => {
    storage.clearOrders()
    set({ orders: [], activeCount: 0 })
    console.log('🗑️ All orders cleared')
  },
  
  getOrder: (id) => {
    return get().orders.find(o => o.id === id)
  },
  
  getActiveOrders: () => {
    return storage.getActiveOrders()
  }
}))

console.log('✅ OrdersStore initialized')
