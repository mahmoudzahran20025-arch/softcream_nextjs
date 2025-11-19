// ================================================================
// orderPoller.ts - Singleton Order Polling Manager
// Shared polling instance per orderId across all components
// ================================================================

import { POLLING_CONFIG, FINAL_STATUSES } from './orderTracking'

interface OrderTrackingData {
  orderId: string
  status: string
  progress?: number | null
  last_updated_by?: string
  timeline?: Array<{ status: string; timestamp: string; updated_by: string }>
  estimatedMinutes?: number
}

type SubscriberCallback = (data: OrderTrackingData) => void

class OrderPoller {
  private orderId: string
  private subscribers: Set<SubscriberCallback> = new Set()
  private timeoutId: NodeJS.Timeout | null = null
  private lastFetchTime: number = 0
  private fetchCount: number = 0
  private unchangedCount: number = 0
  private lastModified: string | null = null
  private lastStatus: string | null = null
  private isPolling: boolean = false
  private currentInterval: number = 15000 // Default 15s

  constructor(orderId: string) {
    this.orderId = orderId
    console.log(`🎯 OrderPoller created for order: ${orderId}`)
  }

  // Subscribe to order updates
  subscribe(callback: SubscriberCallback): void {
    this.subscribers.add(callback)
    console.log(`📢 Subscriber added for ${this.orderId} (total: ${this.subscribers.size})`)
    
    // Start polling if not already started
    if (!this.isPolling) {
      this.start()
    }
  }

  // Unsubscribe from order updates
  unsubscribe(callback: SubscriberCallback): void {
    this.subscribers.delete(callback)
    console.log(`📤 Subscriber removed for ${this.orderId} (remaining: ${this.subscribers.size})`)
    
    // Stop polling if no more subscribers
    if (this.subscribers.size === 0) {
      this.stop()
      // Remove from global map after a delay (allow for quick re-subscription)
      setTimeout(() => {
        if (this.subscribers.size === 0) {
          OrderPollerManager.removeInstance(this.orderId)
        }
      }, 5000)
    }
  }

  // Start polling
  private start(): void {
    if (this.isPolling) {
      console.log(`⏭️ Already polling ${this.orderId}`)
      return
    }

    this.isPolling = true
    console.log(`▶️ Starting polling for ${this.orderId}`)
    
    // Initial fetch
    this.fetch().then(() => {
      this.scheduleNext()
    })
  }

  // Stop polling
  private stop(): void {
    if (!this.isPolling) return

    this.isPolling = false
    
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
      this.timeoutId = null
    }
    
    console.log(`⏸️ Stopped polling for ${this.orderId}`)
  }

  // Fetch order tracking data
  private async fetch(): Promise<void> {
    const now = Date.now()
    
    // Rate limiting: minimum 1s between fetches
    if (now - this.lastFetchTime < 1000) {
      console.log(`⏭️ Rate limited: ${this.orderId}`)
      return
    }
    
    this.lastFetchTime = now

    // Max fetch limit: 50 fetches per session
    if (this.fetchCount >= 50) {
      console.log(`🛑 Max fetches reached for ${this.orderId}, stopping`)
      this.stop()
      return
    }

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://softcream-api.mahmoud-zahran20025.workers.dev'
      const url = `${API_URL}/orders/${this.orderId}/tracking`
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
      
      // Add If-Modified-Since for 304 support
      if (this.lastModified) {
        headers['If-Modified-Since'] = this.lastModified
      }

      const response = await fetch(url, {
        method: 'GET',
        headers
      })
      
      // Handle 304 Not Modified
      if (response.status === 304) {
        console.log(`✅ 304 Not Modified: ${this.orderId}`)
        this.unchangedCount++
        return
      }
      
      // Handle rate limiting
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After')
        const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : 30000
        console.log(`🔒 Rate limited: ${this.orderId} - waiting ${waitTime/1000}s`)
        this.unchangedCount++
        this.currentInterval = waitTime
        return
      }
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      // Save Last-Modified header
      const lastModified = response.headers.get('Last-Modified')
      if (lastModified) {
        this.lastModified = lastModified
      }

      const data = await response.json()
      const trackingData = data.data
      
      if (trackingData) {
        const newStatus = trackingData.status
        const hasStatusChanged = this.lastStatus !== newStatus
        
        // Prepare tracking data
        const orderData: OrderTrackingData = {
          orderId: this.orderId,
          status: newStatus,
          progress: trackingData.progress ?? trackingData.progress_percentage ?? null,
          last_updated_by: trackingData.last_updated_by || 'system',
          timeline: trackingData.timeline,
          estimatedMinutes: trackingData.estimatedMinutes ?? trackingData.total_estimated_minutes
        }
        
        // Notify all subscribers
        this.notifySubscribers(orderData)
        
        // Update counters
        this.fetchCount++
        
        if (hasStatusChanged) {
          console.log(`🔄 Status changed: ${this.orderId} → ${newStatus}`)
          this.unchangedCount = 0
          this.lastStatus = newStatus
        } else {
          this.unchangedCount++
        }
        
        // Check if order is in final status
        if (FINAL_STATUSES.includes(newStatus)) {
          console.log(`🏁 Final status reached: ${this.orderId} (${newStatus})`)
          this.stop()
          return
        }
        
        // Adjust interval based on unchanged count
        this.adjustInterval(newStatus)
      }
    } catch (error) {
      console.error(`❌ Fetch error for ${this.orderId}:`, error)
      this.unchangedCount++
    }
  }

  // Adjust polling interval based on status and unchanged count
  private adjustInterval(status: string): void {
    // Get base interval from config
    let baseInterval = (POLLING_CONFIG as any)[status] || POLLING_CONFIG.default
    
    // If unchanged for 4+ fetches, increase interval
    if (this.unchangedCount >= 4) {
      baseInterval = Math.min(baseInterval * 3, 90000) // Max 90s
      console.log(`⏸️ Paused mode: ${this.orderId} (unchanged: ${this.unchangedCount})`)
    }
    
    this.currentInterval = baseInterval
  }

  // Schedule next fetch
  private scheduleNext(): void {
    if (!this.isPolling) return
    
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
    }
    
    console.log(`⏰ Next poll for ${this.orderId} in ${this.currentInterval / 1000}s`)
    
    this.timeoutId = setTimeout(async () => {
      await this.fetch()
      this.scheduleNext()
    }, this.currentInterval)
  }

  // Notify all subscribers
  private notifySubscribers(data: OrderTrackingData): void {
    this.subscribers.forEach(callback => {
      try {
        callback(data)
      } catch (error) {
        console.error(`❌ Subscriber callback error for ${this.orderId}:`, error)
      }
    })
  }

  // Manual refresh (for user-triggered refresh)
  async refresh(): Promise<void> {
    console.log(`🔄 Manual refresh: ${this.orderId}`)
    this.unchangedCount = 0 // Reset unchanged count
    await this.fetch()
  }

  // Get current status
  getStatus(): { isPolling: boolean; fetchCount: number; unchangedCount: number } {
    return {
      isPolling: this.isPolling,
      fetchCount: this.fetchCount,
      unchangedCount: this.unchangedCount
    }
  }
}

// ================================================================
// OrderPollerManager - Singleton Manager
// ================================================================

class OrderPollerManager {
  private static instances: Map<string, OrderPoller> = new Map()

  static getInstance(orderId: string): OrderPoller {
    if (!this.instances.has(orderId)) {
      const poller = new OrderPoller(orderId)
      this.instances.set(orderId, poller)
      console.log(`✨ New OrderPoller instance created: ${orderId}`)
    }
    
    return this.instances.get(orderId)!
  }

  static removeInstance(orderId: string): void {
    const poller = this.instances.get(orderId)
    if (poller) {
      // Ensure it's stopped
      const status = poller.getStatus()
      if (status.isPolling) {
        console.warn(`⚠️ Removing active poller: ${orderId}`)
      }
      
      this.instances.delete(orderId)
      console.log(`🗑️ OrderPoller instance removed: ${orderId}`)
    }
  }

  static getActivePollers(): string[] {
    return Array.from(this.instances.keys())
  }

  static getPollerStatus(orderId: string): { isPolling: boolean; fetchCount: number; unchangedCount: number } | null {
    const poller = this.instances.get(orderId)
    return poller ? poller.getStatus() : null
  }

  static stopAll(): void {
    console.log(`🛑 Stopping all pollers (${this.instances.size})`)
    this.instances.forEach((_poller, orderId) => {
      console.log(`⏸️ Stopping: ${orderId}`)
    })
    this.instances.clear()
  }
}

// Export singleton manager
export { OrderPollerManager }

// Export for debugging
if (typeof window !== 'undefined') {
  (window as any).__orderPollers = OrderPollerManager
}

console.log('✅ OrderPoller loaded')
