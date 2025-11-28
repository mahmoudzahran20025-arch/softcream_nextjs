// src/lib/adminApi.ts
// Admin API Client for Soft Cream Dashboard (FIXED URL FORMAT)

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://softcream-api.mahmoud-zahran20025.workers.dev';

// ===========================
// Authentication
// ===========================

export function getAdminToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('admin_token');
}

export function setAdminToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('admin_token', token);
}

export function clearAdminToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('admin_token');
}

// ===========================
// HTTP Request Helper (FIXED + DEDUPLICATION)
// ===========================

interface RequestOptions {
  method?: string;
  body?: any;
  requiresAuth?: boolean;
}

// ✅ Request deduplication cache with timestamp
interface CachedRequest {
  promise: Promise<any>;
  timestamp: number;
}

const pendingRequests = new Map<string, CachedRequest>();
const DEDUP_WINDOW = 1000; // 1 second deduplication window

async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = 'GET', body, requiresAuth = true } = options;

  // ✅ Create request key for deduplication (only for GET requests)
  const requestKey = method === 'GET' ? `${method}:${endpoint}` : null;
  
  // ✅ Check if same request is already in flight OR was made recently
  if (requestKey) {
    const cached = pendingRequests.get(requestKey);
    if (cached) {
      const age = Date.now() - cached.timestamp;
      if (age < DEDUP_WINDOW) {
        console.log('🔄 Deduplicating request (age: ' + age + 'ms):', requestKey);
        return cached.promise;
      } else {
        // Old request, remove it
        pendingRequests.delete(requestKey);
      }
    }
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // Add admin token if required
  if (requiresAuth) {
    const token = getAdminToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const config: RequestInit = {
    method,
    headers,
  };

  if (body && method !== 'GET') {
    config.body = JSON.stringify(body);
  }

  // ✅ Create the request promise
  const requestPromise = (async () => {
    try {
      // ✅ FIX: Construct URL properly
      // Split endpoint into path and query params
      const [path, queryString] = endpoint.split('?');
      
      let finalUrl;
      if (queryString) {
        // If endpoint has query params, append them to the main URL
        finalUrl = `${API_BASE_URL}?path=${path}&${queryString}`;
      } else {
        // No query params, just path
        finalUrl = `${API_BASE_URL}?path=${path}`;
      }

      console.log('🔗 API Request:', method, finalUrl);

      const response = await fetch(finalUrl, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('❌ API Error:', response.status, errorData);
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ API Response:', data);
      return data;
    } catch (error) {
      console.error('❌ API Request Error:', error);
      throw error;
    } finally {
      // ✅ Keep in cache for DEDUP_WINDOW, then remove
      if (requestKey) {
        setTimeout(() => {
          pendingRequests.delete(requestKey);
        }, DEDUP_WINDOW);
      }
    }
  })();

  // ✅ Store in pending requests with timestamp
  if (requestKey) {
    pendingRequests.set(requestKey, {
      promise: requestPromise,
      timestamp: Date.now()
    });
  }

  return requestPromise;
}

// ===========================
// Orders API
// ===========================

export interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_address?: string;
  items: OrderItem[];
  subtotal: number;
  delivery_fee: number;
  discount: number;
  total: number;
  status: string;
  delivery_method: 'pickup' | 'delivery';
  coupon_code?: string;
  branch_id: string;
  branch_name: string;
  timestamp: number;
  eta_minutes: number;
  can_cancel_until?: string;
  // 🎯 Tracking fields for automatic progression
  progress?: number;
  elapsedMinutes?: number;
  isAutoProgressed?: boolean;
  nextStatus?: string;
  estimatedCompletionTime?: string;
  // 🚀 Enhanced tracking fields
  totalEstimatedTime?: number;
  pickupTime?: number;
  deliveryTime?: number;
  startTimestamp?: string;
  timeline?: OrderTimeline[];
  lastUpdateTimestamp?: string;
  // 📋 Backend tracking fields
  last_updated_by?: string;
  processed_date?: string;
  processed_by?: string;
}

export interface OrderItem {
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
}

export interface OrderTimeline {
  status: string;
  timestamp: string;
  duration?: number;
  completed?: boolean;
}

export interface BatchDataRequest {
  dataTypes: ('orders' | 'stats' | 'coupons' | 'analytics')[];
  filters?: {
    orders?: {
      status?: string;
      date?: string;
      branchId?: string;
      limit?: number;
      offset?: number;
    };
  };
}

export interface OrdersListResponse {
  success: boolean;
  data: {
    orders: Order[];
    total: number;
    stats: {
      new: number;
      preparing: number;
      ready: number;
      delivered: number;
      cancelled: number;
    };
  };
}

// Smart Polling Manager
// ===========================

export class SmartPollingManager {
  private activityLevels: Map<string, number> = new Map();
  private baseInterval: number = 3000; // 3 seconds base
  private maxInterval: number = 30000; // 30 seconds max
  private minInterval: number = 3000; // 3 seconds min
  private lastUpdateTimes: Map<string, number> = new Map();
  private concurrentRequests: number = 0;
  private maxConcurrent: number = 5;
  private requestQueue: Array<() => Promise<any>> = [];

  // Calculate optimal polling interval based on activity
  calculateInterval(dataType: string): number {
    const activityLevel = this.activityLevels.get(dataType) || 0;
    const lastUpdate = this.lastUpdateTimes.get(dataType) || 0;
    const timeSinceUpdate = Date.now() - lastUpdate;

    // High activity: more frequent polling
    if (activityLevel > 5) return this.minInterval;
    
    // Medium activity: moderate polling
    if (activityLevel > 2) return this.minInterval * 2;
    
    // Low activity: less frequent polling
    if (activityLevel > 0) return this.baseInterval * 3;
    
    // No recent activity: reduce polling frequency
    if (timeSinceUpdate > 60000) return Math.min(this.maxInterval, this.baseInterval * 10);
    
    return this.baseInterval;
  }

  // Update activity level for data type
  updateActivity(dataType: string, hasChanges: boolean) {
    const current = this.activityLevels.get(dataType) || 0;
    if (hasChanges) {
      this.activityLevels.set(dataType, Math.min(current + 1, 10));
      this.lastUpdateTimes.set(dataType, Date.now());
    } else {
      // Decay activity over time
      this.activityLevels.set(dataType, Math.max(0, current - 0.5));
    }
  }

  // Execute request with concurrency control
  async executeRequest<T>(requestFn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      const execute = async () => {
        try {
          this.concurrentRequests++;
          const result = await requestFn();
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          this.concurrentRequests--;
          this.processQueue();
        }
      };

      if (this.concurrentRequests < this.maxConcurrent) {
        execute();
      } else {
        this.requestQueue.push(execute);
      }
    });
  }

  // Process queued requests
  private processQueue() {
    if (this.requestQueue.length > 0 && this.concurrentRequests < this.maxConcurrent) {
      const nextRequest = this.requestQueue.shift();
      if (nextRequest) nextRequest();
    }
  }
}

// Global smart polling instance
export const smartPolling = new SmartPollingManager();

// Batch API Calls
// ===========================

// Batch API request for multiple data types
export async function getBatchData(request: BatchDataRequest): Promise<{
  orders?: Order[];
  stats?: any;
  coupons?: any[];
  analytics?: any;
  timestamp: number;
}> {
  return smartPolling.executeRequest(async () => {
    const results: any = { timestamp: Date.now() };
    const promises: Promise<any>[] = [];

    // Build concurrent requests
    if (request.dataTypes.includes('orders')) {
      promises.push(
        getOrders(request.filters?.orders)
          .then(res => {
            results.orders = res.data.orders;
            smartPolling.updateActivity('orders', results.orders.length > 0);
          })
      );
    }

    if (request.dataTypes.includes('stats')) {
      promises.push(
        getTodayStats()
          .then(res => {
            results.stats = res;
            smartPolling.updateActivity('stats', !!res);
          })
      );
    }

    if (request.dataTypes.includes('coupons')) {
      promises.push(
        getCoupons()
          .then(res => {
            results.coupons = res.data;
            smartPolling.updateActivity('coupons', results.coupons?.length > 0);
          })
      );
    }

    if (request.dataTypes.includes('analytics')) {
      promises.push(
        getDashboardAnalytics()
          .then(res => {
            results.analytics = res;
            smartPolling.updateActivity('analytics', !!res);
          })
      );
    }

    // Execute all requests concurrently
    await Promise.allSettled(promises);
    return results;
  });
}

// Enhanced getOrders with tracking data
export async function getOrdersWithTracking(params?: {
  status?: string;
  date?: string;
  branchId?: string;
  limit?: number;
  offset?: number;
  includeTracking?: boolean;
}): Promise<OrdersListResponse> {
  return smartPolling.executeRequest(async () => {
    const queryParams = new URLSearchParams();
    
    if (params?.status) queryParams.append('status', params.status);
    if (params?.date) queryParams.append('date', params.date);
    if (params?.branchId) queryParams.append('branchId', params.branchId);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    if (params?.includeTracking) queryParams.append('includeTracking', 'true');

    const queryString = queryParams.toString();
    const endpoint = `/admin/orders${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiRequest<OrdersListResponse>(endpoint);
    
    // Update activity based on results
    const hasOrders = response.data.orders.length > 0;
    smartPolling.updateActivity('orders', hasOrders);
    
    return response;
  });
}

// Get all orders with optional filters
export async function getOrders(params?: {
  status?: string;
  date?: string;
  branchId?: string;
  limit?: number;
  offset?: number;
}): Promise<OrdersListResponse> {
  const queryParams = new URLSearchParams();
  
  if (params?.status) queryParams.append('status', params.status);
  if (params?.date) queryParams.append('date', params.date);
  if (params?.branchId) queryParams.append('branchId', params.branchId);
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.offset) queryParams.append('offset', params.offset.toString());

  const queryString = queryParams.toString();
  const endpoint = `/admin/orders${queryString ? `?${queryString}` : ''}`;
  
  return apiRequest<OrdersListResponse>(endpoint);
}

// Get single order details
export async function getOrderById(orderId: string): Promise<{ data: Order }> {
  return apiRequest<{ data: Order }>(`/orders/status?id=${orderId}`, {
    requiresAuth: false
  });
}

// Get order tracking data from backend
export async function getOrderTracking(orderId: string): Promise<{
  success: boolean;
  data?: {
    orderId: string;
    status: string;
    progress_percentage: number | null;
    elapsed_minutes: number | null;
    is_auto_progressed: boolean;
    next_status: string | null;
    estimated_completion_time: string | null;
    last_updated_by: string;
    processed_date: string | null;
    processed_by: string | null;
    timeline?: Array<{
      status: string;
      timestamp: string;
      updated_by: string;
    }>;
  };
  error?: string;
}> {
  return apiRequest(`/admin/order/${orderId}/tracking`);
}

// Update order status with tracking information
export async function updateOrderStatusWithTracking(
  orderId: string,
  status: string,
  options?: {
    progress_percentage?: number;
    updated_by?: string;
  }
): Promise<{ 
  success: boolean; 
  message: string;
  data?: {
    orderId: string;
    status: string;
    progress_percentage: number | null;
    last_updated_by: string;
  };
}> {
  return apiRequest(`/admin/order/${orderId}/status`, {
    method: 'POST',
    body: {
      status,
      progress_percentage: options?.progress_percentage,
      updated_by: options?.updated_by || 'admin'
    }
  });
}

// Update order status
export async function updateOrderStatus(
  orderId: string,
  newStatus: string
): Promise<{ success: boolean; message: string }> {
  return apiRequest(`/admin/orders/${orderId}/status`, {
    method: 'PUT',
    body: { status: newStatus }
  });
}

// Get today's stats
export async function getTodayStats(): Promise<{
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  activeOrders: number;
}> {
  return apiRequest('/admin/stats/today');
}

// ===========================
// Coupons API
// ===========================

export interface Coupon {
  code: string;
  name: string;
  discount_percent: number;
  discount_percent_child?: number;
  discount_percent_parent_second?: number;  // Fixed field name
  valid_from: number;
  valid_to: number;
  min_order: number;
  max_uses: number;
  current_uses: number;
  active: number;
  created_at: number;
  message_ar?: string;
  message_en?: string;
  // Computed field for display
  valid_days?: number;
}

export interface CreateCouponData {
  code: string;
  name: string;
  discountPercent: number;
  discountPercentChild?: number;
  discountPercentSecond?: number;
  validDays: number;
  minOrder?: number;
  maxUses?: number;
  messageAr?: string;
  messageEn?: string;
}

// Get all coupons
export async function getCoupons(): Promise<{ data: Coupon[] }> {
  return apiRequest('/admin/coupons');
}

// Create new coupon
export async function createCoupon(data: CreateCouponData): Promise<{
  success: boolean;
  data: Coupon;
}> {
  return apiRequest('/admin/coupons', {
    method: 'POST',
    body: data
  });
}

// Toggle coupon active status
export async function toggleCoupon(code: string): Promise<{
  success: boolean;
  coupon: Coupon;
}> {
  return apiRequest(`/admin/coupons/${code}/toggle`, {
    method: 'PUT'
  });
}

// Get coupon statistics
export async function getCouponStats(code: string): Promise<{
  code: string;
  name: string;
  totalUses: number;
  maxUses: number;
  remainingUses: number;
  totalDiscount: number;
  usageBreakdown: Array<{
    usage_type: string;
    count: number;
    total_discount: number;
  }>;
  usageHistory: Array<{
    id: number;
    coupon_code: string;
    user_phone: string;
    order_id: string;
    usage_type: string;
    discount_applied: number;
    used_at: number;
    customer_name?: string;
    order_total?: number;
  }>;
}> {
  return apiRequest(`/admin/coupons/${code}/stats`);
}

// Delete coupon
export async function deleteCoupon(code: string): Promise<{
  success: boolean;
  message: string;
}> {
  return apiRequest(`/admin/coupons/${code}`, {
    method: 'DELETE'
  });
}

// Update coupon
export async function updateCoupon(code: string, data: Partial<CreateCouponData>): Promise<{
  success: boolean;
  message: string;
  data: Coupon;
}> {
  return apiRequest(`/admin/coupons/${code}`, {
    method: 'PUT',
    body: data
  });
}

// ===========================
// Analytics API
// ===========================

export interface DashboardAnalytics {
  today: {
    orders: number;
    revenue: number;
    growth: number;
  };
  week: {
    orders: number;
    revenue: number;
    growth: number;
  };
  month: {
    orders: number;
    revenue: number;
    growth: number;
  };
  topProducts: Array<{
    id: string;
    name: string;
    sales: number;
    revenue: number;
  }>;
  recentOrders: Order[];
}

// Get dashboard analytics
export async function getDashboardAnalytics(): Promise<DashboardAnalytics> {
  return apiRequest('/admin/dashboard');
}

// Get sales by period
export async function getSalesByPeriod(period: 'day' | 'week' | 'month'): Promise<{
  labels: string[];
  data: number[];
}> {
  return apiRequest(`/admin/analytics/sales?period=${period}`);
}
// Products API (Admin)
// ===========================

export interface Product {
  id: string;
  name: string;
  nameEn?: string;
  category: string;
  categoryEn?: string;
  price: number;
  description?: string;
  descriptionEn?: string;
  image?: string;
  badge?: string;
  available: number;
  
  // Nutrition fields
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  sugar?: number;
  fiber?: number;
  
  // Energy fields
  energy_type?: 'mental' | 'physical' | 'balanced' | 'none';
  energy_score?: number;
  
  // Metadata fields (JSON strings)
  tags?: string;
  ingredients?: string;
  nutrition_facts?: string;
  allergens?: string;
  allowed_addons?: string; // JSON array of addon IDs
}

// Get all products
export async function getProducts(): Promise<{ data: Product[] }> {
  return apiRequest('/products', { requiresAuth: false });
}

// Update product availability
export async function updateProductAvailability(
  productId: string,
  available: boolean
): Promise<{ success: boolean }> {
  return apiRequest(`/admin/products/${productId}/availability`, {
    method: 'PUT',
    body: { available: available ? 1 : 0 }
  });
}

// Create new product
export async function createProduct(data: Partial<Product>): Promise<{
  success: boolean;
  message: string;
}> {
  return apiRequest('/admin/products', {
    method: 'POST',
    body: data
  });
}

// Update product
export async function updateProduct(productId: string, data: Partial<Product>): Promise<{
  success: boolean;
  message: string;
}> {
  return apiRequest(`/admin/products/${productId}`, {
    method: 'PUT',
    body: data
  });
}

// Delete product
export async function deleteProduct(productId: string): Promise<{
  success: boolean;
  message: string;
}> {
  return apiRequest(`/admin/products/${productId}`, {
    method: 'DELETE'
  });
}

// ===========================
// Branches API
// ===========================

export interface Branch {
  id: string;
  name: string;
  name_en: string;
  address: string;
  phone: string;
  location_lat: number;
  location_lng: number;
  active: number;
}

// Get all branches
export async function getBranches(): Promise<{ data: Branch[] }> {
  return apiRequest('/branches', { requiresAuth: false });
}
// Real-time Updates (Polling)
// ===========================

export class OrdersPolling {
  private intervalId: number | null = null;
  private callback: (orders: Order[]) => void;
  private lastOrderId: string | null = null;
  private activeOrdersCount: number = 0;
  private baseInterval: number = 3000; // Reduced from 10 seconds to 3 seconds
  private fastInterval: number = 1500; // Fast polling when orders are active

  constructor(callback: (orders: Order[]) => void) {
    this.callback = callback;
  }

  start(intervalMs: number = this.baseInterval) {
    this.baseInterval = intervalMs;
    this.poll(); // Initial poll
    this.intervalId = window.setInterval(() => this.poll(), this.baseInterval);
  }

  stop() {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private async poll() {
    try {
      const response = await getOrders({ status: 'all', limit: 50 });
      const newOrders = response.data.orders;

      if (!newOrders) return;

      // Count active orders (pending, confirmed, preparing, out_for_delivery)
      const currentActiveOrders = newOrders.filter(order => 
        ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'ready'].includes(order.status)
      ).length;

      // Smart polling: use faster interval when there are active orders
      if (currentActiveOrders > 0 && this.activeOrdersCount === 0) {
        // Orders became active - switch to fast polling
        this.restartInterval(this.fastInterval);
        console.log(' Switched to fast polling - active orders:', currentActiveOrders);
      } else if (currentActiveOrders === 0 && this.activeOrdersCount > 0) {
        // No more active orders - switch back to normal polling
        this.restartInterval(this.baseInterval);
        console.log(' Switched to normal polling - no active orders');
      }

      this.activeOrdersCount = currentActiveOrders;

      // Check if there are new orders or status changes
      if (newOrders.length > 0) {
        const latestOrderId = newOrders[0].id;
        
        if (this.lastOrderId && latestOrderId !== this.lastOrderId) {
          console.log(' New order detected:', latestOrderId);
        }
        
        // Always check for status changes in existing orders
        const hasChanges = this.detectChanges(newOrders);
        if (hasChanges) {
          console.log('📊 Order status changes detected');
        }
        
        this.lastOrderId = latestOrderId;
        this.callback(newOrders);
      }
    } catch (error) {
      console.error(' Orders polling failed:', error);
    }
  }

  private restartInterval(newInterval: number) {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = window.setInterval(() => this.poll(), newInterval);
    }
  }

  private lastOrdersSnapshot: string = '';
  
  private detectChanges(orders: Order[]): boolean {
    // ✅ FIX: Actually detect changes by comparing snapshots
    const currentSnapshot = JSON.stringify(orders.map(o => ({
      id: o.id,
      status: o.status,
      timestamp: o.timestamp
    })));
    
    if (this.lastOrdersSnapshot === currentSnapshot) {
      return false; // No changes
    }
    
    this.lastOrdersSnapshot = currentSnapshot;
    return true; // Changes detected
  }
}

// ===========================
// Order Tracking API
// ===========================

export interface OrderTrackingData {
  order: Order;
  tracking: {
    progress: number;
    status: string;
    isAutoProgressed: boolean;
    elapsedMinutes: number;
    nextStatus?: string;
    estimatedCompletionTime?: string;
    timeline: OrderTimeline[];
  };
}

export interface OrderOverrideRequest {
  newStatus: string;
  reason?: string;
  estimatedTime?: number;
}

export interface TrackingStatistics {
  orderStats: {
    total_orders: number;
    confirmed: number;
    preparing: number;
    ready: number;
    outfordelivery: number;
    delivered: number;
    cancelled: number;
  };
  trackingMetrics: {
    total_active_orders: number;
    avg_waiting_time: number;
    delayed_orders: number;
  };
  timestamp: string;
}

// Admin override for order status with tracking integration
export async function overrideOrderStatus(
  orderId: string,
  request: OrderOverrideRequest
): Promise<{
  success: boolean;
  data: {
    orderId: string;
    oldStatus: string;
    newStatus: string;
    tracking: {
      progress: number;
      isAutoProgressed: boolean;
      processedBy: string;
      processedAt: string;
    };
  };
}> {
  return apiRequest(`/admin/orders/${orderId}/override-status`, {
    method: 'POST',
    body: request
  });
}

// Batch update tracking for all active orders
export async function batchUpdateTracking(): Promise<{
  success: boolean;
  data: {
    updatedOrders: number;
    updates: Array<{
      orderId: string;
      oldStatus: string;
      newStatus: string;
      progress: number;
    }>;
  };
}> {
  return apiRequest('/admin/orders/batch-update-tracking', {
    method: 'POST'
  });
}

// Get tracking statistics for admin dashboard
export async function getTrackingStatistics(): Promise<{
  success: boolean;
  data: TrackingStatistics;
}> {
  return apiRequest('/admin/tracking/statistics');
}

// ===========================
// Export All
// ===========================

export default {
  // Auth
  getAdminToken,
  setAdminToken,
  clearAdminToken,
  
  // Orders
  getOrders,
  getOrderById,
  updateOrderStatus,
  getTodayStats,
  
  // Coupons
  getCoupons,
  createCoupon,
  toggleCoupon,
  getCouponStats,
  deleteCoupon,
  updateCoupon,
  
  // Analytics
  getDashboardAnalytics,
  getSalesByPeriod,
  
  // Products
  getProducts,
  updateProductAvailability,
  createProduct,
  updateProduct,
  deleteProduct,
  
  // Branches
  getBranches,
  
  // Real-time
  OrdersPolling,
  
  // Order Tracking
  getOrderTracking,
  overrideOrderStatus,
  batchUpdateTracking,
  getTrackingStatistics
};

// ===========================
// BYO Options API (Admin)
// ===========================

export interface BYOOption {
  id: string;
  group_id: string;
  name_ar: string;
  name_en: string;
  description_ar?: string;
  description_en?: string;
  base_price: number;
  image?: string;
  available: number;
  display_order: number;
  calories: number;
  protein: number;
  carbs: number;
  sugar: number;
  fat: number;
  fiber: number;
}

export interface BYOOptionGroup {
  id: string;
  name_ar: string;
  name_en: string;
  description_ar?: string;
  description_en?: string;
  display_order: number;
  icon: string;
  options: BYOOption[];
}

// Get all BYO options grouped
export async function getBYOOptions(): Promise<{ success: boolean; data: BYOOptionGroup[] }> {
  return apiRequest('/admin/options');
}

// Create new BYO option
export async function createBYOOption(data: Partial<BYOOption> & { id: string }): Promise<{
  success: boolean;
  message: string;
}> {
  return apiRequest('/admin/options', {
    method: 'POST',
    body: data
  });
}

// Update BYO option
export async function updateBYOOption(optionId: string, data: Partial<BYOOption>): Promise<{
  success: boolean;
  message: string;
}> {
  return apiRequest(`/admin/options/${optionId}`, {
    method: 'PUT',
    body: data
  });
}

// Delete BYO option
export async function deleteBYOOption(optionId: string): Promise<{
  success: boolean;
  message: string;
}> {
  return apiRequest(`/admin/options/${optionId}`, {
    method: 'DELETE'
  });
}

// ===========================
// Product Configuration API (Admin)
// ===========================

export interface ProductConfiguration {
  product: {
    id: string;
    name: string;
    basePrice: number;
    productType: string;
    isCustomizable: boolean;
  };
  hasContainers: boolean;
  containers: any[];
  hasSizes: boolean;
  sizes: any[];
  hasCustomization: boolean;
  customizationRules: any[];
}

// Get product configuration
export async function getProductConfiguration(productId: string): Promise<{
  success: boolean;
  data: ProductConfiguration;
}> {
  return apiRequest(`/admin/products/${productId}/configuration`);
}

// Update product customization settings
export async function updateProductCustomization(productId: string, data: {
  is_customizable?: boolean;
  product_type?: string;
  customization_rules?: any[];
}): Promise<{
  success: boolean;
  message: string;
}> {
  return apiRequest(`/admin/products/${productId}/customization`, {
    method: 'PUT',
    body: data
  });
}
