'use client'

// ================================================================
// storage.client.ts - Client-Side Storage Manager for Next.js
// ================================================================

// ================================================================
// In-Memory Store (for runtime data)
// ================================================================
class MemoryStore {
  private store = new Map<string, any>()

  constructor() {
    console.log('✅ MemoryStore initialized')
  }
  
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
  
  size(): number {
    return this.store.size
  }
  
  keys(): string[] {
    return Array.from(this.store.keys())
  }
}

// ================================================================
// Session Storage Wrapper (safe for SSR)
// ================================================================
class SessionStore {
  private available: boolean

  constructor() {
    this.available = this.checkAvailability()
    console.log('✅ SessionStore initialized (available:', this.available, ')')
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
      console.warn(`Failed to get ${key} from sessionStorage:`, e)
      return defaultValue
    }
  }
  
  set(key: string, value: any): boolean {
    if (!this.available) {
      console.warn(`sessionStorage not available, cannot save ${key}`)
      return false
    }
    
    try {
      sessionStorage.setItem(key, JSON.stringify(value))
      return true
    } catch (e) {
      console.warn(`Failed to save ${key} to sessionStorage:`, e)
      return false
    }
  }
  
  remove(key: string): boolean {
    if (!this.available) return false
    
    try {
      sessionStorage.removeItem(key)
      return true
    } catch (e) {
      console.warn(`Failed to remove ${key} from sessionStorage:`, e)
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
      console.warn('Failed to clear sessionStorage:', e)
      return false
    }
  }
}

// ================================================================
// Local Storage Wrapper (for persistent data)
// ================================================================
class LocalStore {
  private available: boolean

  constructor() {
    this.available = this.checkAvailability()
    console.log('✅ LocalStore initialized (available:', this.available, ')')
  }
  
  private checkAvailability(): boolean {
    if (typeof window === 'undefined') return false
    
    try {
      const test = '__storage_test__'
      localStorage.setItem(test, test)
      localStorage.removeItem(test)
      return true
    } catch (e) {
      console.warn('⚠️ localStorage not available:', e)
      return false
    }
  }
  
  get(key: string, defaultValue: any = null): any {
    if (!this.available) return defaultValue
    
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch (e) {
      console.warn(`Failed to get ${key} from localStorage:`, e)
      return defaultValue
    }
  }
  
  set(key: string, value: any): boolean {
    if (!this.available) {
      console.warn(`localStorage not available, cannot save ${key}`)
      return false
    }
    
    try {
      localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch (e) {
      console.warn(`Failed to save ${key} to localStorage:`, e)
      return false
    }
  }
  
  remove(key: string): boolean {
    if (!this.available) return false
    
    try {
      localStorage.removeItem(key)
      return true
    } catch (e) {
      console.warn(`Failed to remove ${key} from localStorage:`, e)
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
      console.warn('Failed to clear localStorage:', e)
      return false
    }
  }
}

// ================================================================
// Unified Storage API
// ================================================================
export class StorageManager {
  private memory: MemoryStore
  private session: SessionStore
  private local: LocalStore

  constructor() {
    this.memory = new MemoryStore()
    this.session = new SessionStore()
    this.local = new LocalStore()
    console.log('✅ StorageManager initialized')
  }
  
  // ================================================================
  // Cart data - use session storage
  // ================================================================
  getCart(): any[] {
    return this.session.get('cart', [])
  }
  
  setCart(cart: any[]): boolean {
    return this.session.set('cart', cart)
  }
  
  clearCart(): boolean {
    return this.session.remove('cart')
  }
  
  // ================================================================
  // Theme - use session storage
  // ================================================================
  getTheme(): string {
    return this.session.get('theme', 'light')
  }
  
  setTheme(theme: string): boolean {
    return this.session.set('theme', theme)
  }
  
  // ================================================================
  // Language - use session storage
  // ================================================================
  getLang(): string {
    return this.session.get('language', 'ar')
  }
  
  setLang(lang: string): boolean {
    return this.session.set('language', lang)
  }
  
  // ================================================================
  // User data - use session storage
  // ================================================================
  getUserData(): any {
    return this.session.get('userData', null)
  }
  
  setUserData(userData: any): boolean {
    return this.session.set('userData', userData)
  }
  
  clearUserData(): boolean {
    return this.session.remove('userData')
  }
  
  // ================================================================
  // Device ID - use localStorage (persistent)
  // ================================================================
  getDeviceId(): string {
    let deviceId = this.local.get('deviceId')
    if (!deviceId) {
      deviceId = 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
      this.local.set('deviceId', deviceId)
    }
    return deviceId
  }
  
  // ================================================================
  // Orders Management - use localStorage (persistent)
  // ================================================================
  
  getOrders(): any[] {
    const orders = this.local.get('userOrders', [])
    console.log('📦 Retrieved orders:', orders.length)
    return orders
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
        console.warn('⚠️ Order already exists, updating instead')
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
      
      const success = this.local.set('userOrders', orders)
      
      if (success) {
        console.log('✅ Order saved successfully:', orderData.id)
        this.triggerOrdersBadgeUpdate()
        this.triggerOrdersUpdate(orderData.id, existingIndex !== -1 ? 'updated' : 'added')
      }
      
      return success
    } catch (e) {
      console.error('❌ Failed to save order:', e)
      return false
    }
  }
  
  getOrder(orderId: string): any {
    const orders = this.getOrders()
    const order = orders.find((o: any) => o.id === orderId)
    console.log('🔍 Found order:', orderId, '→', !!order)
    return order || null
  }
  
  updateOrderStatus(orderId: string, newStatus: string): boolean {
    try {
      const orders = this.getOrders()
      const order = orders.find((o: any) => o.id === orderId)
      
      if (!order) {
        console.warn('⚠️ Order not found:', orderId)
        return false
      }
      
      order.status = newStatus
      order.lastUpdated = new Date().toISOString()
      
      const success = this.local.set('userOrders', orders)
      
      if (success) {
        console.log('✅ Order status updated:', orderId, '→', newStatus)
        this.triggerOrdersBadgeUpdate()
        this.triggerOrdersUpdate(orderId, 'updated')
      }
      
      return success
    } catch (e) {
      console.error('❌ Failed to update order status:', e)
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
      
      const success = this.local.set('userOrders', orders)
      
      if (success) {
        console.log('✅ Order updated:', orderId)
        this.triggerOrdersBadgeUpdate()
        this.triggerOrdersUpdate(orderId, 'updated')
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
      
      const success = this.local.set('userOrders', orders)
      
      if (success) {
        console.log('✅ Order items updated:', orderId)
        this.triggerOrdersBadgeUpdate()
        this.triggerOrdersUpdate(orderId, 'edited')
      }
      
      return success
    } catch (e) {
      console.error('❌ Failed to update order items:', e)
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
      
      const success = this.local.set('userOrders', filteredOrders)
      
      if (success) {
        console.log('🗑️ Order deleted:', orderId)
        this.triggerOrdersBadgeUpdate()
        this.triggerOrdersUpdate(orderId, 'deleted')
      }
      
      return success
    } catch (e) {
      console.error('❌ Failed to delete order:', e)
      return false
    }
  }
  
  clearOrders(): boolean {
    try {
      const success = this.local.remove('userOrders')
      
      if (success) {
        console.log('🗑️ All orders cleared')
        this.triggerOrdersBadgeUpdate()
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
    // Support both English and Arabic statuses
    const activeStatuses = [
      // English
      'pending', 'confirmed', 'preparing', 'out_for_delivery', 'ready',
      // Arabic equivalents
      'جديد', 'مؤكد', 'قيد التحضير', 'في الطريق', 'جاهز',
      // Common variations
      'new', 'active', 'processing',
      // Statuses from Telegram callbacks (with operator name)
      'confirmed (', 'مقبول'
    ]
    
    const allOrders = this.getOrders()
    
    // Debug: Log all orders with their statuses
    console.log('🔍 All orders statuses:', allOrders.map((o: any) => ({ id: o.id, status: o.status })))
    
    // Filter active orders (support both English and Arabic)
    const activeOrders = allOrders.filter((o: any) => {
      // If no status, consider it as pending (for backward compatibility)
      if (!o.status) {
        console.warn('⚠️ Order without status found:', o.id, '- treating as pending')
        return true // Include orders without status as active
      }
      
      const orderStatus = o.status.toString().trim()
      
      // Check if status matches any active status (case-insensitive for English)
      return activeStatuses.some(status => {
        // For English statuses, compare case-insensitive
        if (/^[a-zA-Z]+$/.test(status)) {
          return orderStatus.toLowerCase() === status.toLowerCase() || 
                 orderStatus.toLowerCase().startsWith(status.toLowerCase())
        }
        // For Arabic statuses, compare as-is or starts with
        return orderStatus === status || orderStatus.startsWith(status)
      })
    })
    
    console.log('📊 Active orders count:', activeOrders.length, 'out of', allOrders.length)
    console.log('📊 Active statuses filter:', activeStatuses)
    
    // Debug: Log which orders are active
    if (activeOrders.length > 0) {
      console.log('✅ Active orders:', activeOrders.map((o: any) => ({ id: o.id, status: o.status })))
    } else {
      console.warn('⚠️ No active orders found!')
      console.warn('⚠️ Found statuses:', [...new Set(allOrders.map((o: any) => o.status))])
      console.warn('⚠️ Expected one of:', activeStatuses)
    }
    
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
      if (!order || !order.canCancelUntil) {
        console.warn('⚠️ Order not found or no cancel deadline:', orderId)
        return false
      }
      
      const deadline = new Date(order.canCancelUntil)
      const now = new Date()
      
      const canCancel = now < deadline && order.status === 'pending'
      console.log('🔍 Can cancel order:', orderId, '→', canCancel)
      
      return canCancel
    } catch (e) {
      console.error('❌ Failed to check cancel eligibility:', e)
      return false
    }
  }
  
  private triggerOrdersBadgeUpdate(): void {
    if (typeof window !== 'undefined') {
      const count = this.getActiveOrdersCount()
      const event = new CustomEvent('ordersUpdated', {
        detail: { 
          count: count,
          timestamp: new Date().toISOString()
        }
      })
      window.dispatchEvent(event)
      console.log('📢 Orders badge update triggered - count:', count)
    }
  }
  
  triggerOrdersUpdate(orderId: string, action: 'added' | 'updated' | 'cancelled' | 'deleted' | 'edited'): void {
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('ordersUpdated', {
        detail: { 
          orderId,
          action,
          count: this.getActiveOrdersCount(),
          timestamp: new Date().toISOString()
        }
      })
      window.dispatchEvent(event)
      console.log('📢 Orders update triggered:', action, orderId)
    }
  }
  
  // ================================================================
  // Products cache - use memory store (5 min TTL)
  // ================================================================
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
  // Auth token - use memory store (security)
  // ================================================================
  getAuthToken(): string | null {
    return this.memory.get('authToken')
  }
  
  setAuthToken(token: string): void {
    this.memory.set('authToken', token)
  }
  
  clearAuthToken(): void {
    this.memory.remove('authToken')
  }
  
  // ================================================================
  // Form data - use session storage
  // ================================================================
  getCheckoutFormData(): any {
    return this.session.get('checkoutFormData', null)
  }
  
  setCheckoutFormData(formData: any): boolean {
    return this.session.set('checkoutFormData', formData)
  }
  
  clearCheckoutFormData(): boolean {
    return this.session.remove('checkoutFormData')
  }
  
  // ================================================================
  // Session ID - use memory store
  // ================================================================
  getSessionId(): string {
    let sessionId = this.memory.get('sessionId')
    if (!sessionId) {
      sessionId = this.generateUUID()
      this.memory.set('sessionId', sessionId)
    }
    return sessionId
  }
  
  // ================================================================
  // Helper: UUID Generator
  // ================================================================
  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0
      const v = c === 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    })
  }
  
  // ================================================================
  // Clear all data
  // ================================================================
  clearAll(): void {
    this.memory.clear()
    this.session.clear()
    // Don't clear localStorage (keep deviceId and orders)
    console.log('🗑️ Session and memory storage cleared')
  }
}

// ================================================================
// Export Singleton Instance
// ================================================================
export const storage = new StorageManager()

console.log('✅ Storage module loaded (Client-side only)')