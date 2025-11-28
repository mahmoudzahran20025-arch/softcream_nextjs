/**
 * Admin API - Barrel Export
 * 
 * Usage:
 *   import { getOrders, getCoupons } from '@/lib/admin'
 *   // or
 *   import * as adminApi from '@/lib/admin'
 */

// API Client & Auth
export {
  apiRequest,
  getAdminToken,
  setAdminToken,
  clearAdminToken,
  API_BASE_URL
} from './apiClient'

// Orders
export {
  getOrders,
  getOrdersWithTracking,
  getOrderById,
  getOrderTracking,
  updateOrderStatus,
  updateOrderStatusWithTracking,
  overrideOrderStatus,
  batchUpdateTracking,
  type Order,
  type OrderItem,
  type OrderTimeline,
  type OrdersListResponse,
  type OrderTrackingData,
  type OrderOverrideRequest
} from './orders.api'

// Coupons
export {
  getCoupons,
  createCoupon,
  toggleCoupon,
  getCouponStats,
  deleteCoupon,
  updateCoupon,
  type Coupon,
  type CreateCouponData,
  type CouponStats
} from './coupons.api'

// Products
export {
  getProducts,
  updateProductAvailability,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductConfiguration,
  updateProductCustomization,
  getBYOOptions,
  createBYOOption,
  updateBYOOption,
  deleteBYOOption,
  type Product,
  type BYOOption,
  type BYOOptionGroup,
  type ProductConfiguration
} from './products.api'

// Analytics
export {
  getDashboardAnalytics,
  getSalesByPeriod,
  getTodayStats,
  getTrackingStatistics,
  type DashboardAnalytics,
  type TrackingStatistics,
  type TodayStats
} from './analytics.api'

// Branches
export {
  getBranches,
  type Branch
} from './branches.api'

// Batch
export {
  getBatchData,
  type BatchDataRequest,
  type BatchDataResponse
} from './batch.api'

// Polling
export {
  SmartPollingManager,
  smartPolling,
  OrdersPolling
} from './polling'

// Re-import for default export (backward compatibility)
import {
  getAdminToken as _getAdminToken,
  setAdminToken as _setAdminToken,
  clearAdminToken as _clearAdminToken
} from './apiClient'
import {
  getOrders as _getOrders,
  getOrderById as _getOrderById,
  updateOrderStatus as _updateOrderStatus,
  getOrderTracking as _getOrderTracking,
  overrideOrderStatus as _overrideOrderStatus,
  batchUpdateTracking as _batchUpdateTracking
} from './orders.api'
import {
  getCoupons as _getCoupons,
  createCoupon as _createCoupon,
  toggleCoupon as _toggleCoupon,
  getCouponStats as _getCouponStats,
  deleteCoupon as _deleteCoupon,
  updateCoupon as _updateCoupon
} from './coupons.api'
import {
  getProducts as _getProducts,
  updateProductAvailability as _updateProductAvailability,
  createProduct as _createProduct,
  updateProduct as _updateProduct,
  deleteProduct as _deleteProduct
} from './products.api'
import {
  getDashboardAnalytics as _getDashboardAnalytics,
  getSalesByPeriod as _getSalesByPeriod,
  getTodayStats as _getTodayStats,
  getTrackingStatistics as _getTrackingStatistics
} from './analytics.api'
import { getBranches as _getBranches } from './branches.api'
import { OrdersPolling as _OrdersPolling } from './polling'

// Default export for backward compatibility
export default {
  // Auth
  getAdminToken: _getAdminToken,
  setAdminToken: _setAdminToken,
  clearAdminToken: _clearAdminToken,
  
  // Orders
  getOrders: _getOrders,
  getOrderById: _getOrderById,
  updateOrderStatus: _updateOrderStatus,
  getTodayStats: _getTodayStats,
  
  // Coupons
  getCoupons: _getCoupons,
  createCoupon: _createCoupon,
  toggleCoupon: _toggleCoupon,
  getCouponStats: _getCouponStats,
  deleteCoupon: _deleteCoupon,
  updateCoupon: _updateCoupon,
  
  // Analytics
  getDashboardAnalytics: _getDashboardAnalytics,
  getSalesByPeriod: _getSalesByPeriod,
  
  // Products
  getProducts: _getProducts,
  updateProductAvailability: _updateProductAvailability,
  createProduct: _createProduct,
  updateProduct: _updateProduct,
  deleteProduct: _deleteProduct,
  
  // Branches
  getBranches: _getBranches,
  
  // Polling
  OrdersPolling: _OrdersPolling,
  
  // Tracking
  getOrderTracking: _getOrderTracking,
  overrideOrderStatus: _overrideOrderStatus,
  batchUpdateTracking: _batchUpdateTracking,
  getTrackingStatistics: _getTrackingStatistics
}
