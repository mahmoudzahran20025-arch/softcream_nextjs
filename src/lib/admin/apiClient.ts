/**
 * Admin API Client - Core HTTP Request Handler
 * 
 * Handles authentication via Secure Proxy (Cookies)
 * No client-side token storage.
 */

import { debug } from '@/lib/debug'

// Point to the local Next.js Proxy
const API_BASE_URL = '/api/admin'

// ===========================
// Authentication (Proxy Managed)
// ===========================

// Deprecated: Token is now HTTP-only cookie
export function getAdminToken(): string | null {
  return null
}

// Deprecated: Login is handled via /api/auth/login
export function setAdminToken(_token: string): void {
  // No-op
}

export function clearAdminToken(): void {
  // Call logout endpoint
  if (typeof window !== 'undefined') {
    fetch('/api/auth/logout', { method: 'POST' }).catch(console.error)
  }
}

// ===========================
// Request Deduplication
// ===========================

interface CachedRequest {
  promise: Promise<any>
  timestamp: number
}

const pendingRequests = new Map<string, CachedRequest>()
const DEDUP_WINDOW = 1000 // 1 second deduplication window

// ===========================
// HTTP Request Helper
// ===========================

interface RequestOptions {
  method?: string
  body?: any
  requiresAuth?: boolean
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = 'GET', body } = options

  // Create request key for deduplication (only for GET requests)
  const requestKey = method === 'GET' ? `${method}:${endpoint}` : null

  // Check if same request is already in flight OR was made recently
  if (requestKey) {
    const cached = pendingRequests.get(requestKey)
    if (cached) {
      const age = Date.now() - cached.timestamp
      if (age < DEDUP_WINDOW) {
        debug.api(`Deduplicating request (age: ${age}ms)`, requestKey)
        return cached.promise
      } else {
        pendingRequests.delete(requestKey)
      }
    }
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }

  // NOTE: No Authorization header needed here. 
  // The browser automatically sends the 'admin_session' cookie to /api/admin/*

  const config: RequestInit = {
    method,
    headers,
  }

  if (body && method !== 'GET') {
    config.body = JSON.stringify(body)
  }

  // Create the request promise
  const requestPromise = (async () => {
    try {
      // Construct Proxy URL
      // Endpoint typically starts with /, e.g. /orders
      // API_BASE_URL is /api/admin
      // Result: /api/admin/orders

      const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint
      const finalUrl = `${API_BASE_URL}/${cleanEndpoint}`

      debug.api(`${method} ${finalUrl}`)

      const response = await fetch(finalUrl, config)

      if (!response.ok) {
        // Handle RBAC errors specifically
        if (response.status === 401) {
          // Unauthorized - Redirect to login usually handled by middleware, but for AJAX:
          if (typeof window !== 'undefined') {
            window.location.href = '/admin/login'
          }
        }

        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        debug.error('API Error', { status: response.status, error: errorData })
        throw new Error(errorData.message || errorData.error || `HTTP ${response.status}`)
      }

      // Check content type before parsing JSON
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        return await response.json()
      } else {
        return {} as T
      }

    } catch (error) {
      debug.error('API Request Error', error)
      throw error
    } finally {
      // Keep in cache for DEDUP_WINDOW, then remove
      if (requestKey) {
        setTimeout(() => {
          pendingRequests.delete(requestKey)
        }, DEDUP_WINDOW)
      }
    }
  })()

  // Store in pending requests with timestamp
  if (requestKey) {
    pendingRequests.set(requestKey, {
      promise: requestPromise,
      timestamp: Date.now()
    })
  }

  return requestPromise
}

export { API_BASE_URL }
