/**
 * Options API - Admin Option Groups & Options Management
 * Requirements: 2.4, 3.3, 4.4, 5.5, 6.3, 7.2, 8.1
 */

import { apiRequest } from './apiClient';
import type {
  OptionGroupFormData,
  OptionFormData,
  OptionGroupsResponse,
  ApiResponse,
} from '@/components/admin/options/types';

// ===========================
// Option Groups API Functions
// ===========================

/**
 * Get all option groups with their options
 * Requirements: 1.1
 */
export async function getOptionGroups(): Promise<OptionGroupsResponse> {
  return apiRequest('/option-groups');
}


/**
 * Create a new option group
 * Requirements: 2.4, 3.1, 3.4
 */
export async function createOptionGroup(
  data: OptionGroupFormData
): Promise<ApiResponse<void>> {
  return apiRequest('/option-groups', {
    method: 'POST',
    body: {
      id: data.id,
      name_ar: data.name_ar,
      name_en: data.name_en,
      description_ar: data.description_ar || null,
      description_en: data.description_en || null,
      icon: data.icon,
      display_order: data.display_order,
      ui_config: data.ui_config || null,
    },
  });
}

/**
 * Update an existing option group
 * Requirements: 3.3, 3.1, 3.4
 */
export async function updateOptionGroup(
  groupId: string,
  data: Partial<OptionGroupFormData>
): Promise<ApiResponse<void>> {
  return apiRequest(`/option-groups/${groupId}`, {
    method: 'PUT',
    body: {
      name_ar: data.name_ar,
      name_en: data.name_en,
      description_ar: data.description_ar,
      description_en: data.description_en,
      icon: data.icon,
      display_order: data.display_order,
      ui_config: data.ui_config,
    },
  });
}

/**
 * Delete an option group
 * Requirements: 4.4
 */
export async function deleteOptionGroup(
  groupId: string
): Promise<ApiResponse<void>> {
  return apiRequest(`/option-groups/${groupId}`, {
    method: 'DELETE',
  });
}

/**
 * Reorder option groups by updating display_order
 * Note: This endpoint is not yet implemented in the backend
 * TODO: Implement PUT /admin/option-groups/reorder in backend
 * 
 * @param orderedIds - Array of group IDs in the new order
 * @deprecated Backend endpoint not available - use updateOptionGroup for individual updates
 */
export async function reorderOptionGroups(
  orderedIds: string[]
): Promise<ApiResponse<void>> {
  // Fallback: Update each group's display_order individually
  const results = await Promise.all(
    orderedIds.map((id, index) =>
      updateOptionGroup(id, { display_order: index })
    )
  );

  const allSucceeded = results.every(r => r.success);
  return { success: allSucceeded };
}

// ===========================
// Options API Functions
// ===========================

/**
 * Create a new option
 * Requirements: 5.5
 */
export async function createOption(
  data: OptionFormData
): Promise<ApiResponse<void>> {
  return apiRequest('/options', {
    method: 'POST',
    body: {
      id: data.id,
      group_id: data.group_id,
      name_ar: data.name_ar,
      name_en: data.name_en,
      description_ar: data.description_ar || null,
      description_en: data.description_en || null,
      base_price: data.base_price,
      image: data.image || null,
      display_order: data.display_order,
      available: data.available ? 1 : 0,
      calories: data.calories,
      protein: data.protein,
      carbs: data.carbs,
      fat: data.fat,
      sugar: data.sugar,
      fiber: data.fiber,
    },
  });
}

/**
 * Update an existing option
 * Requirements: 6.3
 */
export async function updateOption(
  optionId: string,
  data: Partial<OptionFormData>
): Promise<ApiResponse<void>> {
  const body: Record<string, unknown> = {};

  // Only include fields that are provided
  if (data.name_ar !== undefined) body.name_ar = data.name_ar;
  if (data.name_en !== undefined) body.name_en = data.name_en;
  if (data.description_ar !== undefined) body.description_ar = data.description_ar;
  if (data.description_en !== undefined) body.description_en = data.description_en;
  if (data.base_price !== undefined) body.base_price = data.base_price;
  if (data.image !== undefined) body.image = data.image;
  if (data.display_order !== undefined) body.display_order = data.display_order;
  if (data.available !== undefined) body.available = data.available ? 1 : 0;
  if (data.calories !== undefined) body.calories = data.calories;
  if (data.protein !== undefined) body.protein = data.protein;
  if (data.carbs !== undefined) body.carbs = data.carbs;
  if (data.fat !== undefined) body.fat = data.fat;
  if (data.sugar !== undefined) body.sugar = data.sugar;
  if (data.fiber !== undefined) body.fiber = data.fiber;

  return apiRequest(`/options/${optionId}`, {
    method: 'PUT',
    body,
  });
}

/**
 * Delete an option
 * Requirements: 7.2
 */
export async function deleteOption(optionId: string): Promise<ApiResponse<void>> {
  return apiRequest(`/options/${optionId}`, {
    method: 'DELETE',
  });
}

/**
 * Toggle option availability
 * Requirements: 8.1
 */
export async function toggleOptionAvailability(
  optionId: string,
  available: boolean
): Promise<ApiResponse<void>> {
  try {
    const result = await apiRequest(`/options/${optionId}`, {
      method: 'PUT',
      body: {
        available: available ? 1 : 0,
      },
    });
    return result as ApiResponse<void>;
  } catch (error) {
    console.error('Error toggling option availability:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'فشل في تحديث حالة التوفر',
    };
  }
}

// ===========================
// Option Pricing API Functions
// ===========================

/**
 * Get all options with optional filtering by group_id
 */
export async function getAllOptions(groupId?: string): Promise<any[]> {
  const url = groupId
    ? `/options?group_id=${groupId}`
    : '/options';

  const result = await apiRequest<{ data?: any[] }>(url);
  return result.data || [];
}

/**
 * Update option base_price
 */
export async function updateOptionPrice(
  optionId: string,
  basePrice: number
): Promise<any> {
  return apiRequest(`/options/${optionId}/price`, {
    method: 'PATCH',
    body: { base_price: basePrice },
  });
}



// ===========================
// Conditional Rules API Functions
// Requirements: 6.1, 6.2, 6.3, 6.4, 6.5
// ===========================

/**
 * Update conditional rules for a product-option group assignment
 * Requirements: 6.4 - Save conditional rules as JSON in product_options.conditional_max_selections
 * 
 * @param productId - The product ID
 * @param optionGroupId - The option group ID
 * @param conditionalRules - JSON string of conditional rules or null to clear
 */
export async function updateConditionalRules(
  productId: string,
  optionGroupId: string,
  conditionalRules: string | null
): Promise<ApiResponse<void>> {
  return apiRequest(`/products/${productId}/option-groups/${optionGroupId}/conditional-rules`, {
    method: 'PUT',
    body: {
      conditional_max_selections: conditionalRules,
    },
  });
}

/**
 * Get conditional rules for a product-option group assignment
 * 
 * @param productId - The product ID
 * @param optionGroupId - The option group ID
 */
export async function getConditionalRules(
  productId: string,
  optionGroupId: string
): Promise<ApiResponse<{ conditional_max_selections: string | null }>> {
  return apiRequest(`/products/${productId}/option-groups/${optionGroupId}/conditional-rules`);
}
