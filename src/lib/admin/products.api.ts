/**
 * Products API - Admin Product Management
 * 
 * Uses shared types from @/types/products and @/types/options
 * Source of truth: softcream-api/schema.sql
 */

import { apiRequest } from './apiClient'

// ===========================
// Import Shared Types
// ===========================

import type {
  BaseProduct,
  ProductConfiguration as SharedProductConfiguration,
  ContainerType,
  ProductSize,
  OptionGroupAssignment,
  CustomizationRule,
  NutritionInfo,
  ContainerAssignment,
  SizeAssignment,
} from '@/types/products'

import type { Option, OptionGroup } from '@/types/options'

// ===========================
// Re-export Shared Types for convenience
// ===========================

export type {
  BaseProduct,
  ContainerType,
  ProductSize,
  CustomizationRule,
  NutritionInfo,
  Option,
  OptionGroup,
}

// ===========================
// Admin-Specific Type Aliases
// ===========================

/**
 * Product type for Admin operations
 * Alias for BaseProduct from shared types
 */
export type Product = BaseProduct

/**
 * BYO Option - Alias for Option from shared types
 * Note: Options table uses `group_id` to reference option_groups.id
 * This is different from product_options which uses `option_group_id`
 */
export type BYOOption = Option

/**
 * BYO Option Group - Alias for OptionGroup from shared types
 */
export type BYOOptionGroup = OptionGroup

/**
 * Product Configuration for Admin
 * Uses shared ProductConfiguration type
 */
export type ProductConfiguration = SharedProductConfiguration

// ===========================
// Full Product Types (for unified form)
// Admin-specific extended types
// ===========================

/**
 * Option Group Info for Admin display
 * Summary information about an option group
 */
export interface OptionGroupInfo {
  id: string
  nameAr: string
  nameEn: string
  icon?: string
  defaultMin: number
  defaultMax: number
  optionsCount: number
  ui_config?: any
  display_style?: string
}

/**
 * Full option group assignment with group details
 * Extends OptionGroupAssignment from shared types with admin-specific fields
 * Uses option_group_id as per unified options system (Requirements 5.2)
 * 
 * Note: Override columns were removed in Migration 0025
 * - is_required, min_selections, max_selections are now the only values
 * - price_override is still available for per-product pricing
 */
export interface OptionGroupAssignmentFull extends Omit<OptionGroupAssignment, 'group'> {
  group: OptionGroupInfo
}

/**
 * Container Info for Admin display
 * Summary information about a container type
 */
export interface ContainerInfo {
  id: string
  nameAr: string
  nameEn: string
  priceModifier: number
  image?: string
  nutrition: NutritionInfo
}

/**
 * Full container assignment with container details
 * Extends ContainerAssignment from shared types
 */
export interface ContainerAssignmentFull extends Omit<ContainerAssignment, 'container'> {
  container: ContainerInfo
}

/**
 * Size Info for Admin display
 * Summary information about a product size
 */
export interface SizeInfo {
  id: string
  nameAr: string
  nameEn: string
  priceModifier: number
  nutritionMultiplier: number
}

/**
 * Full size assignment with size details
 * Extends SizeAssignment from shared types
 */
export interface SizeAssignmentFull extends Omit<SizeAssignment, 'size'> {
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
  return apiRequest(`/products/${productId}/availability`, {
    method: 'PUT',
    body: { available: available ? 1 : 0 }
  })
}

export async function createProduct(data: Partial<Product>): Promise<{
  success: boolean
  message: string
}> {
  return apiRequest('/products', {
    method: 'POST',
    body: data
  })
}

export async function updateProduct(productId: string, data: Partial<Product>): Promise<{
  success: boolean
  message: string
}> {
  return apiRequest(`/products/${productId}`, {
    method: 'PUT',
    body: data
  })
}

export async function deleteProduct(productId: string): Promise<{
  success: boolean
  message: string
}> {
  return apiRequest(`/products/${productId}`, {
    method: 'DELETE'
  })
}

export async function getProductConfiguration(productId: string): Promise<{
  success: boolean
  data: ProductConfiguration
}> {
  return apiRequest(`/products/${productId}/configuration`)
}

/**
 * Get full product data including all assignments (option groups, containers, sizes)
 * Used for editing products in the unified form
 */
export async function getProductFull(productId: string): Promise<ProductFullResponse> {
  return apiRequest(`/products/${productId}/full`)
}

// CustomizationRule is imported from @/types/products
// Uses option_group_id as per unified options system
// Note: product_options table uses option_group_id (not group_id)

/**
 * Update product customization data
 * Uses option_group_id in customization_rules as per unified options system
 */
export interface UpdateProductCustomizationData {
  product_type?: string
  customization_rules?: CustomizationRule[]
  containers?: { container_id: string; is_default?: boolean }[]
  sizes?: { size_id: string; is_default?: boolean }[]
}

/**
 * Update product customization settings
 * Sends data using option_group_id field (unified options system)
 */
export async function updateProductCustomization(
  productId: string,
  data: UpdateProductCustomizationData
): Promise<{
  success: boolean
  message: string
}> {
  return apiRequest(`/products/${productId}/customization`, {
    method: 'PUT',
    body: data
  })
}

// ===========================
// BYO Options API Functions
// ===========================

export async function getBYOOptions(): Promise<{ success: boolean; data: BYOOptionGroup[] }> {
  return apiRequest('/option-groups')
}


export async function createBYOOption(data: Partial<BYOOption> & { id: string }): Promise<{
  success: boolean
  message: string
}> {
  return apiRequest('/options', {
    method: 'POST',
    body: data
  })
}

export async function updateBYOOption(optionId: string, data: Partial<BYOOption>): Promise<{
  success: boolean
  message: string
}> {
  return apiRequest(`/options/${optionId}`, {
    method: 'PUT',
    body: data
  })
}

export async function deleteBYOOption(optionId: string): Promise<{
  success: boolean
  message: string
}> {
  return apiRequest(`/options/${optionId}`, {
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
 * Uses POST /admin/products which supports unified format
 * 
 * @param data - Unified product data including product details and all assignments
 * @returns Promise with success status and created product info
 */
export async function createProductUnified(
  data: CreateProductUnifiedRequest
): Promise<CreateProductUnifiedResponse> {
  return apiRequest('/products', {
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
  return apiRequest(`/products/${productId}/unified`, {
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
  return apiRequest('/products/bulk/assign-option-group', {
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
  return apiRequest('/products/bulk/remove-option-group', {
    method: 'POST',
    body: { productIds, groupId }
  })
}
