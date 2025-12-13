/**
 * Coupons API - Admin Coupon Management
 * 🎯 Updated for v2 Coupon System
 */

import { apiRequest } from './apiClient'

// ===========================
// Types - v2 Coupon System
// ===========================

export type DiscountType = 'percent' | 'fixed_amount' | 'free_delivery' | 'free_item'
export type RestrictionType = 'none' | 'prefix' | 'phone' | 'company' | 'both'

export interface Coupon {
  code: string
  name: string
  // v2 Discount System
  discount_type: DiscountType
  discount_value: number
  max_discount: number | null
  // Legacy fields (for backward compatibility)
  discount_percent?: number
  discount_percent_child?: number
  discount_percent_parent_second?: number
  // Validity
  valid_from: number
  valid_to: number
  // Usage Limits
  min_order: number
  max_uses_total: number | null
  max_uses_per_user: number
  current_uses: number
  max_uses?: number // legacy
  // User Restrictions (NEW!)
  first_order_only: number
  requires_registration: number
  // Phone Restrictions
  restriction_type: RestrictionType
  restricted_prefixes: string | null
  restricted_company: string | null
  restricted_phone: string | null
  // Status
  active: number
  created_at: number
  updated_at: number | null
  // Messages
  message_ar?: string
  message_en?: string
  success_message_ar?: string
  success_message_en?: string
  // Free Item
  free_item_product_id?: string | null
  free_item_name_ar?: string | null
  free_item_name_en?: string | null
}

export interface CreateCouponData {
  code: string
  name: string
  // v2 Discount
  discountType: DiscountType
  discountValue: number
  maxDiscount?: number | null
  // Usage
  validDays: number
  minOrder?: number
  maxUsesTotal?: number | null
  maxUsesPerUser?: number
  // User Restrictions (NEW!)
  firstOrderOnly?: boolean
  requiresRegistration?: boolean
  // Phone Restrictions
  restrictionType?: RestrictionType
  restrictedPrefixes?: string[]
  restrictedCompany?: string
  restrictedPhone?: string
  // Messages
  messageAr?: string
  messageEn?: string
  successMessageAr?: string
  successMessageEn?: string
  // Free Item
  freeItemProductId?: string
  freeItemNameAr?: string
  freeItemNameEn?: string
}

export interface CouponStats {
  code: string
  name: string
  discountType: DiscountType
  discountValue: number
  status: string
  totalUses: number
  totalDiscount: number
  maxUsesTotal: number | null
  maxUsesPerUser: number
  remainingUses: number | string
  validFrom: string
  validTo: string
  restrictionType: RestrictionType
  firstOrderOnly: boolean
  requiresRegistration: boolean
  usageBreakdown?: Array<{
    discount_type: string
    usage_type: string
    count: number
    total_discount?: number
  }>
  usageHistory?: Array<{
    id: number | string
    coupon_code?: string
    user_phone: string
    order_id?: string
    discount_applied: number
    used_at: number
    usage_type: string
    customer_name?: string
    order_total?: number
  }>
}

// ===========================
// API Functions
// ===========================

export async function getCoupons(): Promise<{ data: Coupon[] }> {
  return apiRequest('/coupons')
}

export async function createCoupon(data: CreateCouponData): Promise<{
  success: boolean
  data: Coupon
}> {
  return apiRequest('/coupons', {
    method: 'POST',
    body: data
  })
}

export async function toggleCoupon(code: string): Promise<{
  success: boolean
  coupon: Coupon
}> {
  return apiRequest(`/coupons/${code}/toggle`, {
    method: 'PUT'
  })
}

export async function getCouponStats(code: string): Promise<CouponStats> {
  return apiRequest(`/coupons/${code}/stats`)
}

export async function deleteCoupon(code: string): Promise<{
  success: boolean
  message: string
}> {
  return apiRequest(`/coupons/${code}`, {
    method: 'DELETE'
  })
}

export async function updateCoupon(code: string, data: Partial<CreateCouponData>): Promise<{
  success: boolean
  message: string
  data: Coupon
}> {
  return apiRequest(`/coupons/${code}`, {
    method: 'PUT',
    body: data
  })
}
