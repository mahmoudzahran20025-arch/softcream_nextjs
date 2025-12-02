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
  // UI Hint
  product_type?: string
}

/**
 * BYO Option interface
 * Uses option_group_id as per unified options system (Requirements 5.2)
 */
export interface BYOOption {
  id: string
  /** @deprecated Use option_group_id instead */
  group_id?: string
  /** The option group this option belongs to (unified options system) */
  option_group_id: string
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
// Full Product Types (for unified form)
// ===========================

export interface OptionGroupInfo {
  id: string
  nameAr: string
  nameEn: string
  icon?: string
  defaultRequired: boolean
  defaultMin: number
  defaultMax: number
  optionsCount: number
}

/**
 * Full option group assignment with group details
 * Uses option_group_id as per unified options system (Requirements 5.2)
 */
export interface OptionGroupAssignmentFull {
  /** The option group ID (from option_group_id column in database) */
  groupId: string
  isRequired: boolean
  minSelections: number
  maxSelections: number
  displayOrder: number
  // Override flags (null means using group default)
  isRequiredOverride: number | null
  minSelectionsOverride: number | null
  maxSelectionsOverride: number | null
  group: OptionGroupInfo
}

export interface ContainerInfo {
  id: string
  nameAr: string
  nameEn: string
  priceModifier: number
  image?: string
  nutrition: {
    calories: number
    protein: number
    carbs: number
    fat: number
    sugar: number
    fiber: number
  }
}

export interface ContainerAssignmentFull {
  containerId: string
  isDefault: boolean
  container: ContainerInfo
}

export interface SizeInfo {
  id: string
  nameAr: string
  nameEn: string
  priceModifier: number
  nutritionMultiplier: number
}

export interface SizeAssignmentFull {
  sizeId: string
  isDefault: boolean
  priceOverride: number | null
  available: boolean
  size: SizeInfo
}

export interface ProductFullResponse {
  success: boolean
  data: {
    product: Product
    optionGroups: OptionGroupAssignmentFull[]
    containers: ContainerAssignmentFull[]
    sizes: SizeAssignmentFull[]
  }
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

/**
 * Get full product data including all assignments (option groups, containers, sizes)
 * Used for editing products in the unified form
 */
export async function getProductFull(productId: string): Promise<ProductFullResponse> {
  return apiRequest(`/admin/products/${productId}/full`)
}

/**
 * Customization rule for product options
 * Uses option_group_id as per unified options system (Requirements 5.2)
 */
export interface CustomizationRule {
  /** The option group ID (unified options system) */
  option_group_id: string
  /** @deprecated Use option_group_id instead */
  group_id?: string
  is_required?: boolean
  min_selections?: number
  max_selections?: number
  price_override?: number
  display_order?: number
}

/**
 * Update product customization data
 * Uses option_group_id in customization_rules as per unified options system (Requirements 5.2)
 */
export interface UpdateProductCustomizationData {
  product_type?: string
  customization_rules?: CustomizationRule[]
  containers?: { container_id: string; is_default?: boolean }[]
  sizes?: { size_id: string; is_default?: boolean }[]
}

/**
 * Update product customization settings
 * Requirements 5.2: Send data using option_group_id field
 */
export async function updateProductCustomization(
  productId: string, 
  data: UpdateProductCustomizationData
): Promise<{
  success: boolean
  message: string
}> {
  // Ensure all customization rules use option_group_id
  const normalizedData = {
    ...data,
    customization_rules: data.customization_rules?.map(rule => ({
      ...rule,
      // Ensure option_group_id is set (prefer option_group_id over group_id)
      option_group_id: rule.option_group_id || rule.group_id,
      // Remove deprecated group_id from payload
      group_id: undefined
    }))
  }
  
  return apiRequest(`/admin/products/${productId}/customization`, {
    method: 'PUT',
    body: normalizedData
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

// ===========================
// Unified Product API Functions
// ===========================

/**
 * Option group assignment for unified product creation/update
 * Requirements: 1.3, 1.5, 5.2
 * 
 * Note: groupId maps to option_group_id in the database (unified options system)
 */
export interface OptionGroupAssignmentInput {
  /** The option group ID (maps to option_group_id in database) */
  groupId: string
  isRequired: boolean
  minSelections: number
  maxSelections: number
  priceOverride?: number
  displayOrder: number
}

/**
 * Container assignment for unified product creation/update
 */
export interface ContainerAssignmentInput {
  containerId: string
  isDefault: boolean
}

/**
 * Size assignment for unified product creation/update
 */
export interface SizeAssignmentInput {
  sizeId: string
  isDefault: boolean
}

/**
 * Request body for unified product creation
 * Requirements: 1.5 - Save product and all assignments in a single transaction
 */
export interface CreateProductUnifiedRequest {
  product: Partial<Product>
  optionGroups?: OptionGroupAssignmentInput[]
  containers?: ContainerAssignmentInput[]
  sizes?: SizeAssignmentInput[]
}

/**
 * Response from unified product creation
 */
export interface CreateProductUnifiedResponse {
  success: boolean
  message: string
  data?: {
    productId: string
    optionGroupsAssigned: number
    containersAssigned: number
    sizesAssigned: number
  }
}

/**
 * Create a product with all its assignments (option groups, containers, sizes) in a single transaction
 * Requirements: 1.5 - Save both product data and product_options relationships atomically
 * 
 * @param data - Unified product data including product details and all assignments
 * @returns Promise with success status and created product info
 */
export async function createProductUnified(
  data: CreateProductUnifiedRequest
): Promise<CreateProductUnifiedResponse> {
  return apiRequest('/admin/products/unified', {
    method: 'POST',
    body: data
  })
}

/**
 * Update a product with all its assignments (option groups, containers, sizes) in a single transaction
 * Requirements: 2.4 - Update product data and product_options atomically
 * 
 * @param productId - The product ID to update
 * @param data - Unified product data including product details and all assignments
 * @returns Promise with success status
 */
export async function updateProductUnified(
  productId: string,
  data: CreateProductUnifiedRequest
): Promise<CreateProductUnifiedResponse> {
  return apiRequest(`/admin/products/${productId}/unified`, {
    method: 'PUT',
    body: data
  })
}

// ===========================
// Bulk Operations API Functions
// ===========================

/**
 * Request body for bulk option group assignment
 * Requirements: 6.2, 6.3
 */
export interface BulkAssignOptionGroupRequest {
  productIds: string[]
  assignment: OptionGroupAssignmentInput
}

/**
 * Result for a single product in bulk assignment
 */
export interface BulkAssignProductResult {
  productId: string
  success: boolean
  error?: string
}

/**
 * Response from bulk option group assignment
 * Requirements: 6.3 - Report success/failure for each product
 */
export interface BulkAssignOptionGroupResponse {
  success: boolean
  message: string
  results: BulkAssignProductResult[]
  summary: {
    total: number
    succeeded: number
    failed: number
  }
}

/**
 * Bulk assign an option group to multiple products
 * Requirements: 6.3 - Apply configuration to all selected products and report success/failure for each
 * 
 * @param data - Product IDs and the option group assignment configuration
 * @returns Promise with results for each product
 */
export async function bulkAssignOptionGroup(
  data: BulkAssignOptionGroupRequest
): Promise<BulkAssignOptionGroupResponse> {
  return apiRequest('/admin/products/bulk/assign-option-group', {
    method: 'POST',
    body: data
  })
}

/**
 * Bulk remove an option group from multiple products
 * 
 * @param productIds - Array of product IDs
 * @param groupId - The option group ID to remove
 * @returns Promise with results for each product
 */
export async function bulkRemoveOptionGroup(
  productIds: string[],
  groupId: string
): Promise<BulkAssignOptionGroupResponse> {
  return apiRequest('/admin/products/bulk/remove-option-group', {
    method: 'POST',
    body: { productIds, groupId }
  })
}
