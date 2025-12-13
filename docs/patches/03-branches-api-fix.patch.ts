/**
 * PATCH 03: Fix Branches API
 * 
 * File: src/lib/admin/branches.api.ts
 * 
 * PROBLEM:
 * Branches is a PUBLIC endpoint at /branches, not an admin endpoint.
 * The frontend is incorrectly routing it through the admin proxy.
 * 
 * SOLUTION:
 * Call the public API directly instead of going through admin proxy.
 */

// ============================================
// BEFORE (entire file):
// ============================================
/*
import { apiRequest } from './apiClient'

export interface Branch {
  id: string
  name: string
  name_en: string
  address: string
  phone: string
  location_lat: number
  location_lng: number
  active: number
}

export async function getBranches(): Promise<{ data: Branch[] }> {
  return apiRequest('/branches', { requiresAuth: false })
}
*/

// ============================================
// AFTER (entire file):
// ============================================
/*
export interface Branch {
  id: string
  name: string
  name_en: string
  address: string
  phone: string
  location_lat: number
  location_lng: number
  active: number
}

// Use public API directly - branches is not an admin endpoint
export async function getBranches(): Promise<{ data: Branch[] }> {
  // Use the public API endpoint
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || ''
  
  try {
    const response = await fetch(`${apiUrl}/branches`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Failed to fetch branches:', error)
    // Return empty array as fallback
    return { data: [] }
  }
}
*/

// ============================================
// ALTERNATIVE: Keep using apiClient but with correct base URL
// ============================================
/*
// Option B: Create a separate public API client

// In src/lib/api.ts or similar:
const PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL || ''

export async function publicApiRequest<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${PUBLIC_API_URL}${endpoint}`, {
    headers: { 'Content-Type': 'application/json' }
  })
  return response.json()
}

// Then in branches.api.ts:
import { publicApiRequest } from '@/lib/api'

export async function getBranches(): Promise<{ data: Branch[] }> {
  return publicApiRequest('/branches')
}
*/

export {}
