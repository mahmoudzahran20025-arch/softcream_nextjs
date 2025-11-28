/**
 * Admin API Client - Core HTTP Request Handler
 * 
 * Handles authentication, request deduplication, and base URL configuration
 */

import { debug } from '@/lib/debug'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://softcream-api.mahmoud-zahran20025.workers.dev'

// ===========================
// Authentication
// ===========================

export function getAdminToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('admin_token')
}

export function setAdminToken(token: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem('admin_token', token)
}

export function clearAdminToken(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem('admin_token')
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
  const { method = 'GET', body, requiresAuth = true } = options

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

  // Add admin token if required
  if (requiresAuth) {
    const token = getAdminToken()
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
  }

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
      // Construct URL properly
      const [path, queryString] = endpoint.split('?')
      
      let finalUrl
      if (queryString) {
        finalUrl = `${API_BASE_URL}?path=${path}&${queryString}`
      } else {
        finalUrl = `${API_BASE_URL}?path=${path}`
      }

      debug.api(`${method} ${finalUrl}`)

      const response = await fetch(finalUrl, config)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        debug.error('API Error', { status: response.status, error: errorData })
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const data = await response.json()
      return data
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
