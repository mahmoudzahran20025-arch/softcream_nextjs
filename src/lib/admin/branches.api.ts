/**
 * Branches API - Admin Branch Management
 */

import { apiRequest } from './apiClient'

// ===========================
// Types
// ===========================

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

// ===========================
// API Functions
// ===========================

export async function getBranches(): Promise<{ data: Branch[] }> {
  return apiRequest('/branches', { requiresAuth: false })
}
