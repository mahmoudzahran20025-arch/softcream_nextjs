/**
 * Smart Polling Manager - Intelligent API Polling
 * 
 * Features:
 * - Activity-based polling intervals
 * - Request concurrency control
 * - Automatic interval adjustment
 */

import { debug } from '@/lib/debug'

// ===========================
// Smart Polling Manager
// ===========================

export class SmartPollingManager {
  private activityLevels: Map<string, number> = new Map()
  private baseInterval: number = 3000 // 3 seconds base
  private maxInterval: number = 30000 // 30 seconds max
  private minInterval: number = 3000 // 3 seconds min
  private lastUpdateTimes: Map<string, number> = new Map()
  private concurrentRequests: number = 0
  private maxConcurrent: number = 5
  private requestQueue: Array<() => Promise<any>> = []

  calculateInterval(dataType: string): number {
    const activityLevel = this.activityLevels.get(dataType) || 0
    const lastUpdate = this.lastUpdateTimes.get(dataType) || 0
    const timeSinceUpdate = Date.now() - lastUpdate

    if (activityLevel > 5) return this.minInterval
    if (activityLevel > 2) return this.minInterval * 2
    if (activityLevel > 0) return this.baseInterval * 3
    if (timeSinceUpdate > 60000) return Math.min(this.maxInterval, this.baseInterval * 10)
    
    return this.baseInterval
  }

  updateActivity(dataType: string, hasChanges: boolean) {
    const current = this.activityLevels.get(dataType) || 0
    if (hasChanges) {
      this.activityLevels.set(dataType, Math.min(current + 1, 10))
      this.lastUpdateTimes.set(dataType, Date.now())
    } else {
      this.activityLevels.set(dataType, Math.max(0, current - 0.5))
    }
  }

  async executeRequest<T>(requestFn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      const execute = async () => {
        try {
          this.concurrentRequests++
          const result = await requestFn()
          resolve(result)
        } catch (error) {
          reject(error)
        } finally {
          this.concurrentRequests--
          this.processQueue()
        }
      }

      if (this.concurrentRequests < this.maxConcurrent) {
        execute()
      } else {
        this.requestQueue.push(execute)
      }
    })
  }

  private processQueue() {
    if (this.requestQueue.length > 0 && this.concurrentRequests < this.maxConcurrent) {
      const nextRequest = this.requestQueue.shift()
      if (nextRequest) nextRequest()
    }
  }
}

// Global instance
export const smartPolling = new SmartPollingManager()

// ===========================
// Orders Polling Class
// ===========================

import type { Order } from './orders.api'
import { getOrders } from './orders.api'

export class OrdersPolling {
  private intervalId: number | null = null
  private callback: (orders: Order[]) => void
  private lastOrderId: string | null = null
  private activeOrdersCount: number = 0
  private baseInterval: number = 3000
  private fastInterval: number = 1500
  private lastOrdersSnapshot: string = ''

  constructor(callback: (orders: Order[]) => void) {
    this.callback = callback
  }

  start(intervalMs: number = this.baseInterval) {
    this.baseInterval = intervalMs
    this.poll()
    this.intervalId = window.setInterval(() => this.poll(), this.baseInterval)
  }

  stop() {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }

  private async poll() {
    try {
      const response = await getOrders({ status: 'all', limit: 50 })
      const newOrders = response.data.orders

      if (!newOrders) return

      const currentActiveOrders = newOrders.filter(order => 
        ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'ready'].includes(order.status)
      ).length

      if (currentActiveOrders > 0 && this.activeOrdersCount === 0) {
        this.restartInterval(this.fastInterval)
        debug.api('Switched to fast polling - active orders:', currentActiveOrders)
      } else if (currentActiveOrders === 0 && this.activeOrdersCount > 0) {
        this.restartInterval(this.baseInterval)
        debug.api('Switched to normal polling - no active orders')
      }

      this.activeOrdersCount = currentActiveOrders

      if (newOrders.length > 0) {
        const latestOrderId = newOrders[0].id
        
        if (this.lastOrderId && latestOrderId !== this.lastOrderId) {
          debug.api('New order detected:', latestOrderId)
        }
        
        const hasChanges = this.detectChanges(newOrders)
        if (hasChanges) {
          debug.api('Order status changes detected')
        }
        
        this.lastOrderId = latestOrderId
        this.callback(newOrders)
      }
    } catch (error) {
      debug.error('Orders polling failed', error)
    }
  }

  private restartInterval(newInterval: number) {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId)
      this.intervalId = window.setInterval(() => this.poll(), newInterval)
    }
  }

  private detectChanges(orders: Order[]): boolean {
    const currentSnapshot = JSON.stringify(orders.map(o => ({
      id: o.id,
      status: o.status,
      timestamp: o.timestamp
    })))
    
    if (this.lastOrdersSnapshot === currentSnapshot) {
      return false
    }
    
    this.lastOrdersSnapshot = currentSnapshot
    return true
  }
}
