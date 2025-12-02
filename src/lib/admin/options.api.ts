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
  return apiRequest('/admin/options');
}

/**
 * Create a new option group
 * Requirements: 2.4
 */
export async function createOptionGroup(
  data: OptionGroupFormData
): Promise<ApiResponse<void>> {
  return apiRequest('/admin/option-groups', {
    method: 'POST',
    body: {
      id: data.id,
      name_ar: data.name_ar,
      name_en: data.name_en,
      description_ar: data.description_ar || null,
      description_en: data.description_en || null,
      icon: data.icon,
      display_order: data.display_order,
    },
  });
}

/**
 * Update an existing option group
 * Requirements: 3.3
 */
export async function updateOptionGroup(
  groupId: string,
  data: Partial<OptionGroupFormData>
): Promise<ApiResponse<void>> {
  return apiRequest(`/admin/option-groups/${groupId}`, {
    method: 'PUT',
    body: {
      name_ar: data.name_ar,
      name_en: data.name_en,
      description_ar: data.description_ar,
      description_en: data.description_en,
      icon: data.icon,
      display_order: data.display_order,
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
  return apiRequest(`/admin/option-groups/${groupId}`, {
    method: 'DELETE',
  });
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
  return apiRequest('/admin/options', {
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

  return apiRequest(`/admin/options/${optionId}`, {
    method: 'PUT',
    body,
  });
}

/**
 * Delete an option
 * Requirements: 7.2
 */
export async function deleteOption(optionId: string): Promise<ApiResponse<void>> {
  return apiRequest(`/admin/options/${optionId}`, {
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
  return apiRequest(`/admin/options/${optionId}`, {
    method: 'PUT',
    body: {
      available: available ? 1 : 0,
    },
  });
}
