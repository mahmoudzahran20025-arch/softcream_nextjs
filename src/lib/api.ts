// ================================================================
// api.ts - Server-Safe API Service for Next.js
// CRITICAL: Never send prices from frontend - backend calculates all prices
// ================================================================

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://softcream-api.mahmoud-zahran20025.workers.dev'

// ================================================================
// Types
// ================================================================

export interface ApiResponse<T> {
  data?: T
  success?: boolean
  error?: string
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
}

export interface OrderItem {
  productId: string
  quantity: number
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

// ================================================================
// Core HTTP Request Handler (Server-Safe)
// ================================================================

async function httpRequest<T>(
  method: string,
  endpoint: string,
  data: any = null,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_URL}?path=${encodeURIComponent(endpoint)}`

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...options.headers,
  }

  const config: RequestInit = {
    method,
    headers,
    ...options,
  }

  if (data && method !== 'GET') {
    config.body = JSON.stringify(data)
  }

  console.log(`📡 API Request [${method}]:`, endpoint)
  if (data && method !== 'GET') console.log('📦 Body:', data)

  try {
    const response = await fetch(url, config)
    console.log(`📥 Response Status: ${response.status}`)

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

    if (!response.ok) {
      const error = new Error(result.error || `HTTP ${response.status}: ${response.statusText}`)
      ;(error as any).status = response.status
      ;(error as any).data = result
      throw error
    }

    console.log('✅ Response:', result)
    return result.data || result
  } catch (error) {
    console.error('❌ API Request failed:', error)
    throw error
  }
}

// ================================================================
// Products API (Server-Safe)
// ================================================================

export async function getProducts(filters: Record<string, any> = {}): Promise<Product[]> {
  return httpRequest<Product[]>('GET', '/products', filters)
}

export async function getProduct(productId: string): Promise<Product> {
  return httpRequest<Product>('GET', `/products/${productId}`)
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

  return httpRequest<any>('POST', '/orders/submit', orderData)
}

export async function trackOrder(orderId: string): Promise<any> {
  return httpRequest<any>('GET', '/orders/track', { orderId })
}

export async function cancelOrder(orderId: string): Promise<any> {
  return httpRequest<any>('POST', '/orders/cancel', { orderId })
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

  const result = await httpRequest<any>('POST', '/orders/prices', {
    items,
    couponCode,
    deliveryMethod,
    customerPhone,
    location,
    addressInputType: inputType,
  })

  const calculatedPrices = result.calculatedPrices || result.data?.calculatedPrices || result
  if (!calculatedPrices) {
    throw new Error('Invalid response structure from price calculation')
  }

  return calculatedPrices
}

// ================================================================
// Coupons API (Server-Safe)
// ================================================================

export async function validateCoupon(
  code: string,
  phone: string,
  subtotal: number
): Promise<any> {
  return httpRequest<any>('POST', '/coupons/validate', {
    code,
    phone,
    subtotal,
  })
}
