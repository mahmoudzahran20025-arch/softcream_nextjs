/**
 * Batch API - Combined Data Fetching
 */

import { smartPolling } from './polling'
import { getOrders, type Order } from './orders.api'
import { getCoupons, type Coupon } from './coupons.api'
import { getTodayStats, getDashboardAnalytics } from './analytics.api'

// ===========================
// Types
// ===========================

export interface BatchDataRequest {
  dataTypes: ('orders' | 'stats' | 'coupons' | 'analytics')[]
  filters?: {
    orders?: {
      status?: string
      date?: string
      branchId?: string
      limit?: number
      offset?: number
    }
  }
}

export interface BatchDataResponse {
  orders?: Order[]
  stats?: any
  coupons?: Coupon[]
  analytics?: any
  timestamp: number
}

// ===========================
// API Functions
// ===========================

export async function getBatchData(request: BatchDataRequest): Promise<BatchDataResponse> {
  return smartPolling.executeRequest(async () => {
    const results: BatchDataResponse = { timestamp: Date.now() }
    const promises: Promise<any>[] = []

    if (request.dataTypes.includes('orders')) {
      promises.push(
        getOrders(request.filters?.orders)
          .then(res => {
            results.orders = res.data.orders
            smartPolling.updateActivity('orders', results.orders.length > 0)
          })
      )
    }

    if (request.dataTypes.includes('stats')) {
      promises.push(
        getTodayStats()
          .then(res => {
            results.stats = res
            smartPolling.updateActivity('stats', !!res)
          })
      )
    }

    if (request.dataTypes.includes('coupons')) {
      promises.push(
        getCoupons()
          .then(res => {
            results.coupons = res.data
            smartPolling.updateActivity('coupons', (results.coupons?.length || 0) > 0)
          })
      )
    }

    if (request.dataTypes.includes('analytics')) {
      promises.push(
        getDashboardAnalytics()
          .then(res => {
            results.analytics = res
            smartPolling.updateActivity('analytics', !!res)
          })
      )
    }

    await Promise.allSettled(promises)
    return results
  })
}
