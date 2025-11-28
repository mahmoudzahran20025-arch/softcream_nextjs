/**
 * Orders API - Admin Order Management
 */

import { apiRequest } from './apiClient'

// Note: smartPolling is imported dynamically to avoid circular dependency
// Use: const { smartPolling } = await import('./polling')

// ===========================
// Types
// ===========================

export interface OrderItem {
  product_id: string
  product_name: string
  quantity: number
  price: number
}

export interface OrderTimeline {
  status: string
  timestamp: string
  duration?: number
  completed?: boolean
}

export interface Order {
  id: string
  customer_name: string
  customer_phone: string
  customer_address?: string
  items: OrderItem[]
  subtotal: number
  delivery_fee: number
  discount: number
  total: number
  status: string
  delivery_method: 'pickup' | 'delivery'
  coupon_code?: string
  branch_id: string
  branch_name: string
  timestamp: number
  eta_minutes: number
  can_cancel_until?: string
  // Tracking fields
  progress?: number
  elapsedMinutes?: number
  isAutoProgressed?: boolean
  nextStatus?: string
  estimatedCompletionTime?: string
  totalEstimatedTime?: number
  pickupTime?: number
  deliveryTime?: number
  startTimestamp?: string
  timeline?: OrderTimeline[]
  lastUpdateTimestamp?: string
  last_updated_by?: string
  processed_date?: string
  processed_by?: string
}

export interface OrdersListResponse {
  success: boolean
  data: {
    orders: Order[]
    total: number
    stats: {
      new: number
      preparing: number
      ready: number
      delivered: number
      cancelled: number
    }
  }
}

export interface OrderTrackingData {
  order: Order
  tracking: {
    progress: number
    status: string
    isAutoProgressed: boolean
    elapsedMinutes: number
    nextStatus?: string
    estimatedCompletionTime?: string
    timeline: OrderTimeline[]
  }
}

export interface OrderOverrideRequest {
  newStatus: string
  reason?: string
  estimatedTime?: number
}

// ===========================
// API Functions
// ===========================

export async function getOrders(params?: {
  status?: string
  date?: string
  branchId?: string
  limit?: number
  offset?: number
}): Promise<OrdersListResponse> {
  const queryParams = new URLSearchParams()
  
  if (params?.status) queryParams.append('status', params.status)
  if (params?.date) queryParams.append('date', params.date)
  if (params?.branchId) queryParams.append('branchId', params.branchId)
  if (params?.limit) queryParams.append('limit', params.limit.toString())
  if (params?.offset) queryParams.append('offset', params.offset.toString())

  const queryString = queryParams.toString()
  const endpoint = `/admin/orders${queryString ? `?${queryString}` : ''}`
  
  return apiRequest<OrdersListResponse>(endpoint)
}

export async function getOrdersWithTracking(params?: {
  status?: string
  date?: string
  branchId?: string
  limit?: number
  offset?: number
  includeTracking?: boolean
}): Promise<OrdersListResponse> {
  // Dynamic import to avoid circular dependency
  const { smartPolling } = await import('./polling')
  
  return smartPolling.executeRequest(async () => {
    const queryParams = new URLSearchParams()
    
    if (params?.status) queryParams.append('status', params.status)
    if (params?.date) queryParams.append('date', params.date)
    if (params?.branchId) queryParams.append('branchId', params.branchId)
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.offset) queryParams.append('offset', params.offset.toString())
    if (params?.includeTracking) queryParams.append('includeTracking', 'true')

    const queryString = queryParams.toString()
    const endpoint = `/admin/orders${queryString ? `?${queryString}` : ''}`
    
    const response = await apiRequest<OrdersListResponse>(endpoint)
    
    const hasOrders = response.data.orders.length > 0
    smartPolling.updateActivity('orders', hasOrders)
    
    return response
  })
}

export async function getOrderById(orderId: string): Promise<{ data: Order }> {
  return apiRequest<{ data: Order }>(`/orders/status?id=${orderId}`, {
    requiresAuth: false
  })
}

export async function getOrderTracking(orderId: string): Promise<{
  success: boolean
  data?: {
    orderId: string
    status: string
    progress_percentage: number | null
    elapsed_minutes: number | null
    is_auto_progressed: boolean
    next_status: string | null
    estimated_completion_time: string | null
    last_updated_by: string
    processed_date: string | null
    processed_by: string | null
    timeline?: Array<{
      status: string
      timestamp: string
      updated_by: string
    }>
  }
  error?: string
}> {
  return apiRequest(`/admin/order/${orderId}/tracking`)
}

export async function updateOrderStatus(
  orderId: string,
  newStatus: string
): Promise<{ success: boolean; message: string }> {
  return apiRequest(`/admin/orders/${orderId}/status`, {
    method: 'PUT',
    body: { status: newStatus }
  })
}

export async function updateOrderStatusWithTracking(
  orderId: string,
  status: string,
  options?: {
    progress_percentage?: number
    updated_by?: string
  }
): Promise<{ 
  success: boolean
  message: string
  data?: {
    orderId: string
    status: string
    progress_percentage: number | null
    last_updated_by: string
  }
}> {
  return apiRequest(`/admin/order/${orderId}/status`, {
    method: 'POST',
    body: {
      status,
      progress_percentage: options?.progress_percentage,
      updated_by: options?.updated_by || 'admin'
    }
  })
}

export async function overrideOrderStatus(
  orderId: string,
  request: OrderOverrideRequest
): Promise<{
  success: boolean
  data: {
    orderId: string
    oldStatus: string
    newStatus: string
    tracking: {
      progress: number
      isAutoProgressed: boolean
      processedBy: string
      processedAt: string
    }
  }
}> {
  return apiRequest(`/admin/orders/${orderId}/override-status`, {
    method: 'POST',
    body: request
  })
}

export async function batchUpdateTracking(): Promise<{
  success: boolean
  data: {
    updatedOrders: number
    updates: Array<{
      orderId: string
      oldStatus: string
      newStatus: string
      progress: number
    }>
  }
}> {
  return apiRequest('/admin/orders/batch-update-tracking', {
    method: 'POST'
  })
}
