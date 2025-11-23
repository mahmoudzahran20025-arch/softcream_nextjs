// ================================================================
// constants.ts - Centralized Configuration Constants
// ================================================================
// Created: November 22, 2025
// Purpose: Eliminate hardcoded values and magic numbers across the codebase

// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'https://softcream-api.mahmoud-zahran20025.workers.dev',
  TIMEOUT: 15000,
  TIMEOUT_SHORT: 10000,
  RETRY_ATTEMPTS: 1
} as const

// Timeouts
export const TIMEOUTS = {
  API_REQUEST: 15000,
  API_REQUEST_SHORT: 10000,
  DEBOUNCE_CART: 100,
  DEBOUNCE_STORAGE: 100,
  INTERACTION_LOCK: 1000,
  EVENT_DEDUP: 500
} as const

// Storage Keys
export const STORAGE_KEYS = {
  CART: 'cart',
  THEME: 'theme',
  LANGUAGE: 'language',
  USER_DATA: 'userData',
  DEVICE_ID: 'deviceId',
  USER_ORDERS: 'userOrders',
  CUSTOMER_PROFILE: 'customerProfile',
  CHECKOUT_FORM: 'checkoutFormData'
} as const

// Order Statuses
export const ORDER_STATUSES = {
  ACTIVE: [
    'pending', 'confirmed', 'preparing', 'out_for_delivery', 'ready',
    'جديد', 'مؤكد', 'قيد التحضير', 'في الطريق', 'جاهز',
    'new', 'active', 'processing', 'confirmed (', 'مقبول'
  ],
  FINAL: ['delivered', 'cancelled', 'تم التوصيل', 'ملغي', 'مكتمل', 'completed']
} as const

// Limits
export const LIMITS = {
  MAX_CART_QUANTITY: 50,
  PRODUCTS_CACHE_TTL: 5 * 60 * 1000, // 5 minutes
  QUERY_STALE_TIME: 5 * 60 * 1000, // 5 minutes
  QUERY_GC_TIME: 10 * 60 * 1000 // 10 minutes
} as const

console.log('✅ Constants loaded')
