/**
 * PATCH 02: Fix Orders API Endpoints
 * 
 * File: src/lib/admin/orders.api.ts
 * 
 * PROBLEMS:
 * 1. updateOrderStatus uses `/orders/:id/status` but backend expects `/orders/:id`
 * 2. getOrderTracking uses `/order/:id/tracking` (singular) but backend expects `/orders/:id/tracking` (plural)
 * 3. getOrderById uses non-existent endpoint `/orders/status?id=X`
 */

// ============================================
// FIX 1: updateOrderStatus
// ============================================

// BEFORE (Line ~155):
/*
export async function updateOrderStatus(
  orderId: string,
  newStatus: string
): Promise<{ success: boolean; message: string }> {
  return apiRequest(`/orders/${orderId}/status`, {
    method: 'PUT',
    body: { status: newStatus }
  })
}
*/

// AFTER:
/*
export async function updateOrderStatus(
  orderId: string,
  newStatus: string
): Promise<{ success: boolean; message: string }> {
  return apiRequest(`/orders/${orderId}`, {
    method: 'PUT',
    body: { status: newStatus }
  })
}
*/

// ============================================
// FIX 2: getOrderTracking
// ============================================

// BEFORE (Line ~131):
/*
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
  return apiRequest(`/order/${orderId}/tracking`)
}
*/

// AFTER:
/*
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
  return apiRequest(`/orders/${orderId}/tracking`)  // Changed /order/ to /orders/
}
*/

// ============================================
// FIX 3: getOrderById
// ============================================

// BEFORE (Line ~127):
/*
export async function getOrderById(orderId: string): Promise<{ data: Order }> {
  return apiRequest<{ data: Order }>(`/orders/status?id=${orderId}`, {
    requiresAuth: false
  })
}
*/

// AFTER (use tracking endpoint which returns order data):
/*
export async function getOrderById(orderId: string): Promise<{ data: Order }> {
  const response = await apiRequest<{
    success: boolean
    data: {
      order: Order
      tracking: any
    }
  }>(`/orders/${orderId}/tracking`)
  
  if (!response.success || !response.data?.order) {
    throw new Error('Order not found')
  }
  
  return { data: response.data.order }
}
*/

export {}
