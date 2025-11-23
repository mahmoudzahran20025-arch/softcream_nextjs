// ================================================================
// api.ts - Server-Safe API Service for Next.js
// ✅ FIXED: Device ID support + Proper error handling for validation
// CRITICAL: Never send prices from frontend - backend calculates all prices
// ================================================================

import { API_CONFIG, STORAGE_KEYS } from '@/config/constants'

const API_URL = API_CONFIG.BASE_URL

// Log API URL on module load (for debugging)
if (typeof window !== 'undefined') {
  console.log('🌐 API URL configured:', API_URL)
}

// ================================================================
// 🔐 Device ID Management
// ================================================================

function getOrCreateDeviceId(): string {
  if (typeof window === 'undefined') return 'server-side'
  
  let deviceId = localStorage.getItem(STORAGE_KEYS.DEVICE_ID)
  
  if (!deviceId) {
    // Generate unique device ID
    deviceId = `device_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
    localStorage.setItem(STORAGE_KEYS.DEVICE_ID, deviceId)
    console.log('✅ New device ID created:', deviceId)
  }
  
  return deviceId
}

// ================================================================
// Types
// ================================================================

export interface ApiResponse<T> {
  data?: T
  success?: boolean
  error?: string
}

export interface Addon {
  id: string
  name: string
  name_en: string
  type: 'topping' | 'sauce' | 'extra'
  price: number
  available?: number
}

export interface Product {
  id: string
  name: string
  nameEn?: string
  price: number
  image?: string
  category?: string
  description?: string
  tags?: string
  ingredients?: string
  allergens?: string
  calories?: number
  protein?: number
  carbs?: number
  sugar?: number
  fat?: number
  fiber?: number
  energy_type?: string
  energy_score?: number
  badge?: string
  // Add-ons support
  allowed_addons?: string
  addonsList?: Addon[]
  ingredientsList?: string[]
  allergensList?: string[]
  nutritionData?: any
}

export interface OrderItem {
  productId: string
  quantity: number
  selectedAddons?: string[] // Array of addon IDs
}

export interface OrderData {
  items: OrderItem[]
  customer: {
    name: string
    phone: string
    address?: string
  }
  deliveryMethod: 'delivery' | 'pickup'
  deliveryAddress?: string
  customerPhone?: string
  location?: { lat: number; lng: number }
  addressInputType?: 'gps' | 'manual'
  couponCode?: string | null
  deviceId?: string
  idempotencyKey?: string
}

export interface CalculatedPrices {
  subtotal: number
  discount?: number
  deliveryFee: number
  total: number
  items?: any[]
  deliveryInfo?: any
}

export interface CouponValidationResult {
  valid: boolean
  coupon?: any
  message?: string
  error?: string
  errorEn?: string
}

// ================================================================
// Core HTTP Request Handler (Server-Safe)
// ✅ FIXED: Better error handling for validation endpoints
// ================================================================

async function httpRequest<T>(
  method: string,
  endpoint: string,
  data: any = null,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_URL}${endpoint}`

  // ✅ Only add Content-Type for requests with body (POST, PUT, DELETE)
  // GET requests don't need Content-Type header, which avoids unnecessary CORS preflight
  const headers: HeadersInit = {
    'Accept': 'application/json',
    ...(data && method !== 'GET' ? { 'Content-Type': 'application/json' } : {}),
    ...options.headers,
  }

  // Add timeout using AbortController
  const timeout = API_CONFIG.TIMEOUT
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  const config: RequestInit = {
    method,
    headers,
    signal: controller.signal,
    ...options,
  }

  if (data && method !== 'GET') {
    config.body = JSON.stringify(data)
  }

  console.log(`📡 API Request [${method}]:`, endpoint, '→', url)
  if (data && method !== 'GET') console.log('📦 Body:', data)

  try {
    const response = await fetch(url, config)
    clearTimeout(timeoutId)
    console.log(`📥 Response Status: ${response.status} for ${endpoint}`)

    if (response.status === 204) {
      return { success: true, data: null } as any
    }

    let result
    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      try {
        result = await response.json()
      } catch (parseError) {
        console.warn('Failed to parse JSON response:', parseError)
        result = { success: false, error: 'Invalid JSON response' }
      }
    } else {
      const text = await response.text()
      console.warn('Non-JSON response:', text)
      result = { success: false, error: 'Expected JSON response', rawResponse: text }
    }

    // ✅ FIXED: Don't throw error for validation endpoints (they return 200 with valid: false)
    // Only throw for actual server errors (500, 401, 403, etc.)
    const isValidationEndpoint = endpoint.includes('/validate') || endpoint.includes('/coupons')
    
    if (!response.ok && !isValidationEndpoint) {
      const error = new Error(result.error || `HTTP ${response.status}: ${response.statusText}`)
      ;(error as any).status = response.status
      ;(error as any).data = result
      throw error
    }

    console.log('✅ Response:', result)
    return result.data || result
  } catch (error: any) {
    clearTimeout(timeoutId)
    console.error(`❌ API Request failed [${method} ${endpoint}]:`, error)
    console.error('   URL:', url)
    console.error('   Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack?.split('\n').slice(0, 3).join('\n')
    })
    
    // Enhance error message for timeout/connection issues
    if (error.name === 'AbortError' || error.message?.includes('timeout')) {
      const timeoutError = new Error('Request timeout. Please check your connection and try again.')
      ;(timeoutError as any).isTimeout = true
      throw timeoutError
    }
    
    if (error.message?.includes('Failed to fetch') || error.message?.includes('network')) {
      const networkError = new Error('Network error. Please check your connection.')
      ;(networkError as any).isNetworkError = true
      ;(networkError as any).originalError = error
      throw networkError
    }
    
    throw error
  }
}

// ================================================================
// Products API (Server-Safe)
// ================================================================

export async function getProducts(filters: Record<string, any> = {}): Promise<Product[]> {
  return httpRequest<Product[]>('GET', '/products', filters)
}

export async function getProduct(
  productId: string,
  options?: { expand?: string[] }
): Promise<Product> {
  let endpoint = `/products/${productId}`
  
  // Add expand parameter if provided
  if (options?.expand && options.expand.length > 0) {
    endpoint += `?expand=${options.expand.join(',')}`
  }
  
  return httpRequest<Product>('GET', endpoint)
}

export async function getRecommendations(productId: string, limit = 5): Promise<Product[]> {
  return httpRequest<Product[]>('GET', `/products/recommendations/${productId}`, { limit })
}

export async function getNutritionSummary(productIds: string[]): Promise<any> {
  return httpRequest<any>('POST', '/products/nutrition-summary', { productIds })
}

// ================================================================
// Branches API (Server-Safe)
// ================================================================

export async function getBranches(): Promise<any[]> {
  return httpRequest<any[]>('GET', '/branches')
}

export async function checkBranchAvailability(branchId: string): Promise<any> {
  return httpRequest<any>('GET', '/branches/availability', { branchId })
}

export async function getBranchHours(branchId: string): Promise<any> {
  return httpRequest<any>('GET', `/branches/${branchId}/hours`)
}

// ================================================================
// Orders API (Server-Safe)
// ================================================================

export async function submitOrder(orderData: OrderData): Promise<any> {
  // Security: Validate that no prices are sent
  if (orderData.items.some((item: any) => item.price || item.subtotal)) {
    throw new Error('Invalid order data: prices should not be sent from frontend')
  }

  // ✅ Add device ID if not present
  if (!orderData.deviceId) {
    orderData.deviceId = getOrCreateDeviceId()
  }

  // ✅ Generate idempotency key if not present
  if (!orderData.idempotencyKey) {
    orderData.idempotencyKey = `order_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
  }

  return httpRequest<any>('POST', '/orders/submit', orderData)
}

export async function trackOrder(orderId: string): Promise<any> {
  return httpRequest<any>('GET', '/orders/track', { orderId })
}

export async function cancelOrder(orderId: string): Promise<any> {
  return httpRequest<any>('DELETE', `/orders/${orderId}/cancel`)
}

export async function updateOrderStatus(orderId: string, status: string, processedBy?: string, estimatedMinutes?: number): Promise<any> {
  return httpRequest<any>('POST', `/orders/${orderId}/update`, {
    status,
    processedBy,
    estimatedMinutes
  })
}

export async function editOrder(orderId: string, items: OrderItem[]): Promise<any> {
  return httpRequest<any>('PUT', `/orders/${orderId}`, {
    items
  })
}

export async function calculateOrderPrices(
  items: OrderItem[],
  couponCode?: string | null,
  deliveryMethod: string = 'delivery',
  customerPhone?: string,
  location?: { lat: number; lng: number },
  addressInputType?: string
): Promise<CalculatedPrices> {
  const inputType = addressInputType || (location?.lat ? 'gps' : 'manual')
  
  // ✅ Add device ID
  const deviceId = getOrCreateDeviceId()

  const result = await httpRequest<any>('POST', '/orders/prices', {
    items,
    couponCode,
    deliveryMethod,
    customerPhone,
    location,
    addressInputType: inputType,
    deviceId, // ✅ NOW INCLUDED
  })

  const calculatedPrices = result.calculatedPrices || result.data?.calculatedPrices || result
  if (!calculatedPrices) {
    throw new Error('Invalid response structure from price calculation')
  }

  return calculatedPrices
}

// ================================================================
// Coupons API (Server-Safe)
// ✅ FIXED: Device ID + Proper validation response handling
// ================================================================

export async function validateCoupon(
  code: string,
  phone: string,
  subtotal: number
): Promise<CouponValidationResult> {
  try {
    // ✅ Get device ID
    const deviceId = getOrCreateDeviceId()
    
    console.log('🎟️ Validating coupon:', {
      code: code.trim().toUpperCase(),
      phone: phone.replace(/\D/g, ''),
      subtotal: Number(subtotal),
      deviceId
    })

    const result = await httpRequest<any>('POST', '/coupons/validate', {
      code: code.trim().toUpperCase(),
      phone: phone.replace(/\D/g, ''),
      subtotal: Number(subtotal),
      deviceId, // ✅ NOW INCLUDED
    })

    console.log('📥 Coupon validation response:', result)

    // ✅ FIXED: Handle response properly (backend returns 200 with valid: false for invalid coupons)
    if (result.valid === false) {
      return {
        valid: false,
        error: result.error,
        errorEn: result.errorEn,
        message: result.error || result.errorEn || 'Invalid coupon code'
      }
    }

    // ✅ SUCCESS
    return {
      valid: true,
      coupon: result.coupon,
      message: result.message || result.coupon?.messageAr
    }
    
  } catch (error: any) {
    console.error('❌ Coupon validation failed:', error)
    
    // Return validation error structure instead of throwing
    return {
      valid: false,
      error: error.message || 'Failed to validate coupon',
      message: error.message || 'Failed to validate coupon'
    }
  }
}

// ================================================================
// Export Device ID Helper (for direct usage if needed)
// ================================================================

export { getOrCreateDeviceId }

// ================================================================
// Module Load Confirmation
// ================================================================

console.log('✅ API Client loaded with Device ID support')
console.log('🔐 Device ID:', getOrCreateDeviceId())