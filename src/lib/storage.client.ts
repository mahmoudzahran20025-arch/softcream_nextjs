'use client'

// ================================================================
// storage.client.ts - Fixed Event System & Optimized
// ================================================================

import { STORAGE_KEYS, ORDER_STATUSES, TIMEOUTS } from '@/config/constants'

// ================================================================
// Event Manager - Single Source of Truth
// ================================================================
class OrdersEventManager {
  private static instance: OrdersEventManager
  private debounceTimer: NodeJS.Timeout | null = null
  private lastEventData: string = ''

  static getInstance(): OrdersEventManager {
    if (!OrdersEventManager.instance) {
      OrdersEventManager.instance = new OrdersEventManager()
    }
    return OrdersEventManager.instance
  }

  // ✅ Single Event Dispatch with Deduplication
  triggerUpdate(data: {
    orderId?: string
    action?: 'added' | 'updated' | 'cancelled' | 'deleted' | 'edited' | 'cartCleared'
    count?: number
  }) {
    if (typeof window === 'undefined') return

    // ✅ Prevent duplicate events
    const eventKey = JSON.stringify(data)
    if (eventKey === this.lastEventData) {
      console.log('⏭️ Skipping duplicate event')
      return
    }
    this.lastEventData = eventKey

    // ✅ Debounce: Batch multiple updates
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
    }

    this.debounceTimer = setTimeout(() => {
      const event = new CustomEvent('ordersUpdated', {
        detail: {
          ...data,
          timestamp: new Date().toISOString()
        }
      })
      window.dispatchEvent(event)
      console.log('📢 Event dispatched:', data)
      
      // Clear last event to allow new events
      setTimeout(() => {
        this.lastEventData = ''
      }, TIMEOUTS.EVENT_DEDUP)
    }, TIMEOUTS.DEBOUNCE_STORAGE)
  }

  cleanup() {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
    }
    this.lastEventData = ''
  }
}

// ================================================================
// Memory Store
// ================================================================
class MemoryStore {
  private store = new Map<string, any>()

  get(key: string, defaultValue: any = null): any {
    return this.store.has(key) ? this.store.get(key) : defaultValue
  }
  
  set(key: string, value: any): void {
    this.store.set(key, value)
  }
  
  remove(key: string): void {
    this.store.delete(key)
  }
  
  has(key: string): boolean {
    return this.store.has(key)
  }
  
  clear(): void {
    this.store.clear()
  }
}

// ================================================================
// Session Storage Wrapper
// ================================================================
class SessionStore {
  private available: boolean

  constructor() {
    this.available = this.checkAvailability()
  }
  
  private checkAvailability(): boolean {
    if (typeof window === 'undefined') return false
    
    try {
      const test = '__storage_test__'
      sessionStorage.setItem(test, test)
      sessionStorage.removeItem(test)
      return true
    } catch (e) {
      console.warn('⚠️ sessionStorage not available:', e)
      return false
    }
  }
  
  get(key: string, defaultValue: any = null): any {
    if (!this.available) return defaultValue
    
    try {
      const item = sessionStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch (e) {
      return defaultValue
    }
  }
  
  set(key: string, value: any): boolean {
    if (!this.available) return false
    
    try {
      sessionStorage.setItem(key, JSON.stringify(value))
      return true
    } catch (e) {
      return false
    }
  }
  
  remove(key: string): boolean {
    if (!this.available) return false
    
    try {
      sessionStorage.removeItem(key)
      return true
    } catch (e) {
      return false
    }
  }
  
  has(key: string): boolean {
    if (!this.available) return false
    return sessionStorage.getItem(key) !== null
  }
  
  clear(): boolean {
    if (!this.available) return false
    
    try {
      sessionStorage.clear()
      return true
    } catch (e) {
      return false
    }
  }
}

// ================================================================
// Local Storage Wrapper
// ================================================================
class LocalStore {
  private available: boolean

  constructor() {
    this.available = this.checkAvailability()
  }
  
  private checkAvailability(): boolean {
    if (typeof window === 'undefined') return false
    
    try {
      const test = '__storage_test__'
      localStorage.setItem(test, test)
      localStorage.removeItem(test)
      return true
    } catch (e) {
      return false
    }
  }
  
  get(key: string, defaultValue: any = null): any {
    if (!this.available) return defaultValue
    
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch (e) {
      return defaultValue
    }
  }
  
  set(key: string, value: any): boolean {
    if (!this.available) return false
    
    try {
      localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch (e) {
      return false
    }
  }
  
  remove(key: string): boolean {
    if (!this.available) return false
    
    try {
      localStorage.removeItem(key)
      return true
    } catch (e) {
      return false
    }
  }
  
  has(key: string): boolean {
    if (!this.available) return false
    return localStorage.getItem(key) !== null
  }
  
  clear(): boolean {
    if (!this.available) return false
    
    try {
      localStorage.clear()
      return true
    } catch (e) {
      return false
    }
  }
}

// ================================================================
// Storage Manager
// ================================================================
export class StorageManager {
  private memory: MemoryStore
  private session: SessionStore
  private local: LocalStore
  private eventManager: OrdersEventManager

  constructor() {
    this.memory = new MemoryStore()
    this.session = new SessionStore()
    this.local = new LocalStore()
    this.eventManager = OrdersEventManager.getInstance()
  }
  
  // Cart
  getCart(): any[] {
    return this.session.get(STORAGE_KEYS.CART, [])
  }
  
  setCart(cart: any[]): boolean {
    return this.session.set(STORAGE_KEYS.CART, cart)
  }
  
  clearCart(): boolean {
    return this.session.remove(STORAGE_KEYS.CART)
  }
  
  // Theme
  getTheme(): string {
    return this.session.get(STORAGE_KEYS.THEME, 'light')
  }
  
  setTheme(theme: string): boolean {
    return this.session.set(STORAGE_KEYS.THEME, theme)
  }
  
  // Language
  getLang(): string {
    return this.session.get(STORAGE_KEYS.LANGUAGE, 'ar')
  }
  
  setLang(lang: string): boolean {
    return this.session.set(STORAGE_KEYS.LANGUAGE, lang)
  }
  
  // User Data
  getUserData(): any {
    return this.session.get(STORAGE_KEYS.USER_DATA, null)
  }
  
  setUserData(userData: any): boolean {
    return this.session.set(STORAGE_KEYS.USER_DATA, userData)
  }
  
  clearUserData(): boolean {
    return this.session.remove(STORAGE_KEYS.USER_DATA)
  }
  
  // Device ID
  getDeviceId(): string {
    let deviceId = this.local.get(STORAGE_KEYS.DEVICE_ID)
    if (!deviceId) {
      deviceId = 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
      this.local.set(STORAGE_KEYS.DEVICE_ID, deviceId)
    }
    return deviceId
  }
  
  // ================================================================
  // Customer Profile Management (Guest Checkout Memory)
  // ================================================================
  
  /**
   * Save customer profile for auto-fill on next checkout
   * @param data Customer profile data
   * @returns Success boolean
   */
  saveCustomerProfile(data: { name: string; phone: string; address?: string }): boolean {
    try {
      const profile = {
        name: data.name.trim(),
        phone: data.phone.trim(),
        address: data.address?.trim() || '',
        savedAt: new Date().toISOString()
      }
      
      const success = this.local.set(STORAGE_KEYS.CUSTOMER_PROFILE, profile)
      
      if (success) {
        console.log('✅ Customer profile saved:', profile.name)
      }
      
      return success
    } catch (e) {
      console.error('❌ Failed to save customer profile:', e)
      return false
    }
  }
  
  /**
   * Get saved customer profile
   * @returns Customer profile or null
   */
  getCustomerProfile(): { name: string; phone: string; address: string; savedAt: string } | null {
    try {
      const profile = this.local.get(STORAGE_KEYS.CUSTOMER_PROFILE, null)
      
      if (profile) {
        console.log('📋 Customer profile loaded:', profile.name)
      }
      
      return profile
    } catch (e) {
      console.error('❌ Failed to load customer profile:', e)
      return null
    }
  }
  
  /**
   * Clear saved customer profile
   * @returns Success boolean
   */
  clearCustomerProfile(): boolean {
    try {
      const success = this.local.remove(STORAGE_KEYS.CUSTOMER_PROFILE)
      
      if (success) {
        console.log('🗑️ Customer profile cleared')
      }
      
      return success
    } catch (e) {
      console.error('❌ Failed to clear customer profile:', e)
      return false
    }
  }
  
  /**
   * Check if customer profile exists
   * @returns Boolean
   */
  hasCustomerProfile(): boolean {
    return this.local.has(STORAGE_KEYS.CUSTOMER_PROFILE)
  }
  
  // ================================================================
  // Orders Management - FIXED
  // ================================================================
  
  getOrders(): any[] {
    return this.local.get(STORAGE_KEYS.USER_ORDERS, [])
  }
  
  addOrder(orderData: any): boolean {
    try {
      const orders = this.getOrders()
      
      if (!orderData.id) {
        console.error('❌ Cannot add order without ID')
        return false
      }
      
      const existingIndex = orders.findIndex((o: any) => o.id === orderData.id)
      if (existingIndex !== -1) {
        orders[existingIndex] = {
          ...orders[existingIndex],
          ...orderData,
          lastUpdated: new Date().toISOString()
        }
      } else {
        orders.unshift({
          ...orderData,
          createdAt: orderData.createdAt || new Date().toISOString(),
          lastUpdated: new Date().toISOString()
        })
      }
      
      const success = this.local.set(STORAGE_KEYS.USER_ORDERS, orders)
      
      if (success) {
        console.log('✅ Order saved:', orderData.id)
        // ✅ Single event dispatch with ALL orders count
        this.eventManager.triggerUpdate({
          orderId: orderData.id,
          action: existingIndex !== -1 ? 'updated' : 'added',
          count: this.getOrders().length // ✅ Changed: Show all orders, not just active
        })
      }
      
      return success
    } catch (e) {
      console.error('❌ Failed to save order:', e)
      return false
    }
  }
  
  getOrder(orderId: string): any {
    const orders = this.getOrders()
    return orders.find((o: any) => o.id === orderId) || null
  }
  
  updateOrderStatus(orderId: string, newStatus: string): boolean {
    try {
      const orders = this.getOrders()
      const order = orders.find((o: any) => o.id === orderId)
      
      if (!order) {
        console.warn('⚠️ Order not found:', orderId)
        return false
      }
      
      // ✅ Skip if status unchanged
      if (order.status === newStatus) {
        console.log('⏭️ Status unchanged, skipping update')
        return true
      }
      
      order.status = newStatus
      order.lastUpdated = new Date().toISOString()
      
      const success = this.local.set(STORAGE_KEYS.USER_ORDERS, orders)
      
      if (success) {
        console.log('✅ Status updated:', orderId, '→', newStatus)
        // ✅ Single event dispatch with ALL orders count
        this.eventManager.triggerUpdate({
          orderId,
          action: 'updated',
          count: this.getOrders().length // ✅ Changed: Show all orders
        })
      }
      
      return success
    } catch (e) {
      console.error('❌ Failed to update status:', e)
      return false
    }
  }
  
  updateOrder(orderId: string, updates: any): boolean {
    try {
      const orders = this.getOrders()
      const orderIndex = orders.findIndex((o: any) => o.id === orderId)
      
      if (orderIndex === -1) {
        console.warn('⚠️ Order not found:', orderId)
        return false
      }
      
      orders[orderIndex] = {
        ...orders[orderIndex],
        ...updates,
        lastUpdated: new Date().toISOString()
      }
      
      const success = this.local.set(STORAGE_KEYS.USER_ORDERS, orders)
      
      if (success) {
        console.log('✅ Order updated:', orderId)
        // ✅ Single event dispatch with ALL orders count
        this.eventManager.triggerUpdate({
          orderId,
          action: 'updated',
          count: this.getOrders().length // ✅ Changed: Show all orders
        })
      }
      
      return success
    } catch (e) {
      console.error('❌ Failed to update order:', e)
      return false
    }
  }

  updateOrderItems(orderId: string, items: any[], totals: any): boolean {
    try {
      const orders = this.getOrders()
      const orderIndex = orders.findIndex((o: any) => o.id === orderId)
      
      if (orderIndex === -1) {
        console.warn('⚠️ Order not found:', orderId)
        return false
      }
      
      orders[orderIndex] = {
        ...orders[orderIndex],
        items,
        totals,
        total: totals.total,
        lastUpdated: new Date().toISOString()
      }
      
      const success = this.local.set(STORAGE_KEYS.USER_ORDERS, orders)
      
      if (success) {
        console.log('✅ Items updated:', orderId)
        // ✅ Single event dispatch with ALL orders count
        this.eventManager.triggerUpdate({
          orderId,
          action: 'edited',
          count: this.getOrders().length // ✅ Changed: Show all orders
        })
      }
      
      return success
    } catch (e) {
      console.error('❌ Failed to update items:', e)
      return false
    }
  }
  
  deleteOrder(orderId: string): boolean {
    try {
      const orders = this.getOrders()
      const filteredOrders = orders.filter((o: any) => o.id !== orderId)
      
      if (orders.length === filteredOrders.length) {
        console.warn('⚠️ Order not found:', orderId)
        return false
      }
      
      const success = this.local.set(STORAGE_KEYS.USER_ORDERS, filteredOrders)
      
      if (success) {
        console.log('🗑️ Order deleted:', orderId)
        // ✅ Single event dispatch with ALL orders count
        this.eventManager.triggerUpdate({
          orderId,
          action: 'deleted',
          count: this.getOrders().length // ✅ Changed: Show all orders
        })
      }
      
      return success
    } catch (e) {
      console.error('❌ Failed to delete order:', e)
      return false
    }
  }
  
  clearOrders(): boolean {
    try {
      const success = this.local.remove(STORAGE_KEYS.USER_ORDERS)
      
      if (success) {
        console.log('🗑️ All orders cleared')
        this.eventManager.triggerUpdate({ count: 0 })
      }
      
      return success
    } catch (e) {
      console.error('❌ Failed to clear orders:', e)
      return false
    }
  }
  
  getOrdersByStatus(statuses: string | string[]): any[] {
    const orders = this.getOrders()
    const statusArray = Array.isArray(statuses) ? statuses : [statuses]
    return orders.filter((o: any) => statusArray.includes(o.status))
  }
  
  getActiveOrders(): any[] {
    const allOrders = this.getOrders()
    
    const activeOrders = allOrders.filter((o: any) => {
      if (!o.status) return true
      
      const orderStatus = o.status.toString().trim()
      
      return ORDER_STATUSES.ACTIVE.some(status => {
        if (/^[a-zA-Z]+$/.test(status)) {
          return orderStatus.toLowerCase() === status.toLowerCase() || 
                 orderStatus.toLowerCase().startsWith(status.toLowerCase())
        }
        return orderStatus === status || orderStatus.startsWith(status)
      })
    })
    
    return activeOrders
  }
  
  getActiveOrdersCount(): number {
    return this.getActiveOrders().length
  }
  
  getCompletedOrders(): any[] {
    return this.getOrdersByStatus('delivered')
  }
  
  getCancelledOrders(): any[] {
    return this.getOrdersByStatus('cancelled')
  }
  
  canCancelOrder(orderId: string): boolean {
    try {
      const order = this.getOrder(orderId)
      if (!order || !order.canCancelUntil) return false
      
      const deadline = new Date(order.canCancelUntil)
      const now = new Date()
      
      return now < deadline && order.status === 'pending'
    } catch (e) {
      return false
    }
  }

  // 🎯 Phase 3: Update order with tracking data (progress, timeline, last_updated_by)
  updateOrderTracking(orderId: string, trackingData: any): boolean {
    try {
      const orders = this.getOrders()
      const orderIndex = orders.findIndex((o: any) => o.id === orderId)
      
      if (orderIndex === -1) {
        console.warn('⚠️ Order not found:', orderId)
        return false
      }
      
      const isFinalStatus = ORDER_STATUSES.FINAL.includes(trackingData.status)
      
      orders[orderIndex] = {
        ...orders[orderIndex],
        status: trackingData.status || orders[orderIndex].status,
        progress: trackingData.progress,
        last_updated_by: trackingData.last_updated_by,
        timeline: trackingData.timeline,
        lastUpdated: new Date().toISOString(),
        isFinal: isFinalStatus // Mark as final to prevent further polling
      }
      
      const success = this.local.set(STORAGE_KEYS.USER_ORDERS, orders)
      
      if (success) {
        console.log('🎯 Tracking data updated:', orderId, {
          status: trackingData.status,
          progress: trackingData.progress,
          last_updated_by: trackingData.last_updated_by,
          isFinal: isFinalStatus
        })
        
        // ✅ Only trigger event if not final status (reduce noise)
        if (!isFinalStatus) {
          this.eventManager.triggerUpdate({
            orderId,
            action: 'updated',
            count: this.getOrders().length // ✅ Changed: Show all orders
          })
        } else {
          console.log('🏁 Final status - no event triggered')
        }
      }
      
      return success
    } catch (e) {
      console.error('❌ Failed to update tracking:', e)
      return false
    }
  }
  
  // Products Cache
  getProductsCache(): any {
    return this.memory.get('products_cache')
  }
  
  setProductsCache(products: any[], timestamp: number): void {
    this.memory.set('products_cache', { products, timestamp })
  }
  
  clearProductsCache(): void {
    this.memory.remove('products_cache')
  }
  
  // ================================================================
  // Removed: Auth Token (Guest-only approach)
  // We're using device ID for identification instead
  // ================================================================
  
  // Checkout Form
  getCheckoutFormData(): any {
    return this.session.get(STORAGE_KEYS.CHECKOUT_FORM, null)
  }
  
  setCheckoutFormData(formData: any): boolean {
    return this.session.set(STORAGE_KEYS.CHECKOUT_FORM, formData)
  }
  
  clearCheckoutFormData(): boolean {
    return this.session.remove(STORAGE_KEYS.CHECKOUT_FORM)
  }
  
  // Session ID
  getSessionId(): string {
    let sessionId = this.memory.get('sessionId')
    if (!sessionId) {
      sessionId = this.generateUUID()
      this.memory.set('sessionId', sessionId)
    }
    return sessionId
  }
  
  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0
      const v = c === 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    })
  }
  
  // ✅ NEW: Public trigger function for external use (e.g., CartProvider)
  triggerOrdersUpdate(
    orderId?: string,
    action?: 'added' | 'updated' | 'cancelled' | 'deleted' | 'edited' | 'cartCleared',
    count?: number
  ): void {
    this.eventManager.triggerUpdate({
      orderId,
      action,
      count: count ?? this.getActiveOrdersCount()
    })
  }
  
  clearAll(): void {
    this.memory.clear()
    this.session.clear()
    this.eventManager.cleanup()
    console.log('🗑️ All cleared')
  }
}

export const storage = new StorageManager()

// ================================================================
// Export Helper Functions for Direct Usage
// ================================================================

/**
 * Get or create device ID (exported for convenience)
 */
export function getOrCreateDeviceId(): string {
  return storage.getDeviceId()
}

console.log('✅ Storage loaded (optimized with Customer Profile support)')
console.log('🔐 Device ID:', storage.getDeviceId())