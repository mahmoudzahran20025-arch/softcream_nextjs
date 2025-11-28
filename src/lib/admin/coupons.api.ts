/**
 * Coupons API - Admin Coupon Management
 */

import { apiRequest } from './apiClient'

// ===========================
// Types
// ===========================

export interface Coupon {
  code: string
  name: string
  discount_percent: number
  discount_percent_child?: number
  discount_percent_parent_second?: number
  valid_from: number
  valid_to: number
  min_order: number
  max_uses: number
  current_uses: number
  active: number
  created_at: number
  message_ar?: string
  message_en?: string
  valid_days?: number
}

export interface CreateCouponData {
  code: string
  name: string
  discountPercent: number
  discountPercentChild?: number
  discountPercentSecond?: number
  validDays: number
  minOrder?: number
  maxUses?: number
  messageAr?: string
  messageEn?: string
}

export interface CouponStats {
  code: string
  name: string
  totalUses: number
  maxUses: number
  remainingUses: number
  totalDiscount: number
  usageBreakdown: Array<{
    usage_type: string
    count: number
    total_discount: number
  }>
  usageHistory: Array<{
    id: number
    coupon_code: string
    user_phone: string
    order_id: string
    usage_type: string
    discount_applied: number
    used_at: number
    customer_name?: string
    order_total?: number
  }>
}

// ===========================
// API Functions
// ===========================

export async function getCoupons(): Promise<{ data: Coupon[] }> {
  return apiRequest('/admin/coupons')
}

export async function createCoupon(data: CreateCouponData): Promise<{
  success: boolean
  data: Coupon
}> {
  return apiRequest('/admin/coupons', {
    method: 'POST',
    body: data
  })
}

export async function toggleCoupon(code: string): Promise<{
  success: boolean
  coupon: Coupon
}> {
  return apiRequest(`/admin/coupons/${code}/toggle`, {
    method: 'PUT'
  })
}

export async function getCouponStats(code: string): Promise<CouponStats> {
  return apiRequest(`/admin/coupons/${code}/stats`)
}

export async function deleteCoupon(code: string): Promise<{
  success: boolean
  message: string
}> {
  return apiRequest(`/admin/coupons/${code}`, {
    method: 'DELETE'
  })
}

export async function updateCoupon(code: string, data: Partial<CreateCouponData>): Promise<{
  success: boolean
  message: string
  data: Coupon
}> {
  return apiRequest(`/admin/coupons/${code}`, {
    method: 'PUT',
    body: data
  })
}
