/**
 * Admin Users API - إدارة المستخدمين
 */

import { apiRequest } from './apiClient';

// ==========================================
// Types
// ==========================================

export interface User {
  id: string;
  phone: string;
  name: string | null;
  email: string | null;
  default_address: string | null;
  default_location_lat: number | null;
  default_location_lng: number | null;
  total_orders: number;
  total_spent: number;
  last_order_date: number | null;
  loyalty_points: number;
  loyalty_tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  created_at: number;
  updated_at: number | null;
  // Formatted fields
  created_at_formatted?: string;
  last_order_date_formatted?: string;
  total_spent_formatted?: string;
}

export interface UserAddress {
  id: number;
  user_id: string;
  label: string;
  address: string;
  location_lat: number | null;
  location_lng: number | null;
  is_default: number;
  created_at: number;
}

export interface UsersListResponse {
  success: boolean;
  data: {
    users: User[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface UserDetailsResponse {
  success: boolean;
  data: {
    user: User;
    addresses: UserAddress[];
    recentOrders: any[];
    couponUsage: any[];
  };
}

export interface UsersStatsResponse {
  success: boolean;
  data: {
    totalUsers: number;
    newUsersThisMonth: number;
    activeUsers: number;
    tierBreakdown: {
      bronze: number;
      silver: number;
      gold: number;
      platinum: number;
    };
    topSpenders: User[];
    averages: {
      orderValue: string;
      ordersPerUser: string;
    };
  };
}

// ==========================================
// API Functions
// ==========================================

/**
 * Get users list with pagination and filters
 */
export async function getUsers(params?: {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  tier?: string;
}): Promise<UsersListResponse> {
  const queryParams = new URLSearchParams();

  if (params?.page) queryParams.set('page', params.page.toString());
  if (params?.limit) queryParams.set('limit', params.limit.toString());
  if (params?.search) queryParams.set('search', params.search);
  if (params?.sortBy) queryParams.set('sortBy', params.sortBy);
  if (params?.sortOrder) queryParams.set('sortOrder', params.sortOrder);
  if (params?.tier) queryParams.set('tier', params.tier);

  const query = queryParams.toString();
  return apiRequest<UsersListResponse>(`/users${query ? `?${query}` : ''}`);
}

/**
 * Get user details by phone
 */
export async function getUserDetails(phone: string): Promise<UserDetailsResponse> {
  return apiRequest<UserDetailsResponse>(`/users/${phone}`);
}

/**
 * Get users statistics
 */
export async function getUsersStats(): Promise<UsersStatsResponse> {
  return apiRequest<UsersStatsResponse>('/users/stats');
}

/**
 * Update user data
 */
export async function updateUser(phone: string, data: {
  name?: string;
  email?: string;
  loyalty_tier?: string;
  loyalty_points?: number;
}): Promise<{ success: boolean; message: string }> {
  return apiRequest(`/users/${phone}`, {
    method: 'PUT',
    body: data
  });
}

/**
 * Add loyalty points to user
 */
export async function addLoyaltyPoints(phone: string, points: number, reason?: string): Promise<{
  success: boolean;
  message: string;
  newTotal: number;
  newTier: string;
}> {
  return apiRequest(`/users/${phone}/add-points`, {
    method: 'POST',
    body: { points, reason }
  });
}
