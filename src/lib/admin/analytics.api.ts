/**
 * Analytics API - Admin Dashboard & Statistics
 */

import { apiRequest } from './apiClient'
import type { Order } from './orders.api'

// ===========================
// Types
// ===========================

export interface DashboardAnalytics {
  today: {
    orders: number
    revenue: number
    growth: number
  }
  week: {
    orders: number
    revenue: number
    growth: number
  }
  month: {
    orders: number
    revenue: number
    growth: number
  }
  topProducts: Array<{
    id: string
    name: string
    sales: number
    revenue: number
  }>
  recentOrders: Order[]
}

export interface TrackingStatistics {
  orderStats: {
    total_orders: number
    confirmed: number
    preparing: number
    ready: number
    outfordelivery: number
    delivered: number
    cancelled: number
  }
  trackingMetrics: {
    total_active_orders: number
    avg_waiting_time: number
    delayed_orders: number
  }
  timestamp: string
}

export interface TodayStats {
  totalOrders: number
  totalRevenue: number
  averageOrderValue: number
  activeOrders: number
}

// ===========================
// API Functions
// ===========================

export async function getDashboardAnalytics(): Promise<DashboardAnalytics> {
  return apiRequest('/admin/dashboard')
}

export async function getSalesByPeriod(period: 'day' | 'week' | 'month'): Promise<{
  labels: string[]
  data: number[]
}> {
  return apiRequest(`/admin/analytics/sales?period=${period}`)
}

export async function getTodayStats(): Promise<TodayStats> {
  return apiRequest('/admin/stats/today')
}

export async function getTrackingStatistics(): Promise<{
  success: boolean
  data: TrackingStatistics
}> {
  return apiRequest('/admin/tracking/statistics')
}
