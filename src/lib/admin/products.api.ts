/**
 * Products API - Admin Product Management
 */

import { apiRequest } from './apiClient'

// ===========================
// Types
// ===========================

export interface Product {
  id: string
  name: string
  nameEn?: string
  category: string
  categoryEn?: string
  price: number
  description?: string
  descriptionEn?: string
  image?: string
  badge?: string
  available: number
  // Nutrition fields
  calories?: number
  protein?: number
  carbs?: number
  fat?: number
  sugar?: number
  fiber?: number
  // Energy fields
  energy_type?: 'mental' | 'physical' | 'balanced' | 'none'
  energy_score?: number
  // Metadata fields (JSON strings)
  tags?: string
  ingredients?: string
  nutrition_facts?: string
  allergens?: string
  allowed_addons?: string
}

export interface BYOOption {
  id: string
  group_id: string
  name_ar: string
  name_en: string
  description_ar?: string
  description_en?: string
  base_price: number
  image?: string
  available: number
  display_order: number
  calories: number
  protein: number
  carbs: number
  sugar: number
  fat: number
  fiber: number
}

export interface BYOOptionGroup {
  id: string
  name_ar: string
  name_en: string
  description_ar?: string
  description_en?: string
  display_order: number
  icon: string
  options: BYOOption[]
}

export interface ProductConfiguration {
  product: {
    id: string
    name: string
    basePrice: number
    productType: string
    isCustomizable: boolean
  }
  hasContainers: boolean
  containers: any[]
  hasSizes: boolean
  sizes: any[]
  hasCustomization: boolean
  customizationRules: any[]
}

// ===========================
// Products API Functions
// ===========================

export async function getProducts(): Promise<{ data: Product[] }> {
  return apiRequest('/products', { requiresAuth: false })
}

export async function updateProductAvailability(
  productId: string,
  available: boolean
): Promise<{ success: boolean }> {
  return apiRequest(`/admin/products/${productId}/availability`, {
    method: 'PUT',
    body: { available: available ? 1 : 0 }
  })
}

export async function createProduct(data: Partial<Product>): Promise<{
  success: boolean
  message: string
}> {
  return apiRequest('/admin/products', {
    method: 'POST',
    body: data
  })
}

export async function updateProduct(productId: string, data: Partial<Product>): Promise<{
  success: boolean
  message: string
}> {
  return apiRequest(`/admin/products/${productId}`, {
    method: 'PUT',
    body: data
  })
}

export async function deleteProduct(productId: string): Promise<{
  success: boolean
  message: string
}> {
  return apiRequest(`/admin/products/${productId}`, {
    method: 'DELETE'
  })
}

export async function getProductConfiguration(productId: string): Promise<{
  success: boolean
  data: ProductConfiguration
}> {
  return apiRequest(`/admin/products/${productId}/configuration`)
}

export async function updateProductCustomization(productId: string, data: {
  is_customizable?: boolean
  product_type?: string
  customization_rules?: any[]
}): Promise<{
  success: boolean
  message: string
}> {
  return apiRequest(`/admin/products/${productId}/customization`, {
    method: 'PUT',
    body: data
  })
}

// ===========================
// BYO Options API Functions
// ===========================

export async function getBYOOptions(): Promise<{ success: boolean; data: BYOOptionGroup[] }> {
  return apiRequest('/admin/options')
}

export async function createBYOOption(data: Partial<BYOOption> & { id: string }): Promise<{
  success: boolean
  message: string
}> {
  return apiRequest('/admin/options', {
    method: 'POST',
    body: data
  })
}

export async function updateBYOOption(optionId: string, data: Partial<BYOOption>): Promise<{
  success: boolean
  message: string
}> {
  return apiRequest(`/admin/options/${optionId}`, {
    method: 'PUT',
    body: data
  })
}

export async function deleteBYOOption(optionId: string): Promise<{
  success: boolean
  message: string
}> {
  return apiRequest(`/admin/options/${optionId}`, {
    method: 'DELETE'
  })
}
