# 📁 Configuration Files

This directory contains centralized configuration constants for the entire application.

---

## 📄 Files

### 1. **constants.ts**
Centralized configuration constants to eliminate hardcoded values.

**Contains:**
- `API_CONFIG` - API configuration (BASE_URL, TIMEOUT, RETRY_ATTEMPTS)
- `TIMEOUTS` - All timeout values (debounce, interaction locks, etc.)
- `STORAGE_KEYS` - All localStorage/sessionStorage keys
- `ORDER_STATUSES` - Order status arrays (ACTIVE, FINAL)
- `LIMITS` - Application limits (cart quantity, cache TTL, etc.)

**Usage:**
```typescript
import { API_CONFIG, STORAGE_KEYS, TIMEOUTS } from '@/config/constants'

// API calls
const response = await fetch(API_CONFIG.BASE_URL + '/products')

// Storage
const cart = storage.get(STORAGE_KEYS.CART)

// Timeouts
setTimeout(() => { /* ... */ }, TIMEOUTS.DEBOUNCE_CART)
```

---

### 2. **swiperConfig.ts**
Centralized Swiper.js configuration to eliminate duplicate configs.

**Contains:**
- `defaultSwiperConfig` - Base Swiper configuration
- `productSwiperConfig` - Product-specific Swiper config (extends default)

**Usage:**
```typescript
import { productSwiperConfig } from '@/config/swiperConfig'

<Swiper {...productSwiperConfig}>
  {/* slides */}
</Swiper>
```

---

### 3. **categoryIcons.ts** (Existing)
Category icon mappings for the application.

---

## 🎯 Benefits

### 1. **Single Source of Truth**
- All configuration in one place
- Easy to find and update values
- No more hunting for hardcoded values

### 2. **Type Safety**
- TypeScript autocomplete for all constants
- Compile-time checks for typos
- `as const` for literal types

### 3. **Maintainability**
- Change once, update everywhere
- Clear documentation
- Consistent naming conventions

### 4. **Developer Experience**
- IntelliSense support
- Easy to discover available constants
- Self-documenting code

---

## 📝 Adding New Constants

### Step 1: Add to constants.ts
```typescript
export const MY_NEW_CONFIG = {
  VALUE_1: 'something',
  VALUE_2: 123
} as const
```

### Step 2: Import where needed
```typescript
import { MY_NEW_CONFIG } from '@/config/constants'

const value = MY_NEW_CONFIG.VALUE_1
```

### Step 3: Remove old hardcoded values
```typescript
// ❌ Before
const value = 'something'

// ✅ After
const value = MY_NEW_CONFIG.VALUE_1
```

---

## 🚫 Don't Do This

### ❌ Hardcoding values
```typescript
// Bad
const timeout = 15000
const apiUrl = 'https://api.example.com'
```

### ✅ Use constants instead
```typescript
// Good
import { API_CONFIG, TIMEOUTS } from '@/config/constants'
const timeout = TIMEOUTS.API_REQUEST
const apiUrl = API_CONFIG.BASE_URL
```

---

## 📊 Current Constants

### API_CONFIG
- `BASE_URL` - API base URL
- `TIMEOUT` - Default API timeout (15s)
- `TIMEOUT_SHORT` - Short API timeout (10s)
- `RETRY_ATTEMPTS` - Number of retry attempts

### TIMEOUTS
- `API_REQUEST` - API request timeout (15s)
- `API_REQUEST_SHORT` - Short API timeout (10s)
- `DEBOUNCE_CART` - Cart debounce (100ms)
- `DEBOUNCE_STORAGE` - Storage debounce (100ms)
- `INTERACTION_LOCK` - User interaction lock (1s)
- `EVENT_DEDUP` - Event deduplication (500ms)

### STORAGE_KEYS
- `CART` - Shopping cart
- `THEME` - Theme preference
- `LANGUAGE` - Language preference
- `USER_DATA` - User data
- `DEVICE_ID` - Device identifier
- `USER_ORDERS` - User orders
- `CUSTOMER_PROFILE` - Customer profile
- `CHECKOUT_FORM` - Checkout form data

### ORDER_STATUSES
- `ACTIVE` - Active order statuses (pending, confirmed, etc.)
- `FINAL` - Final order statuses (delivered, cancelled, etc.)

### LIMITS
- `MAX_CART_QUANTITY` - Maximum cart quantity (50)
- `PRODUCTS_CACHE_TTL` - Products cache TTL (5 min)
- `QUERY_STALE_TIME` - React Query stale time (5 min)
- `QUERY_GC_TIME` - React Query GC time (10 min)

---

## 🔄 Migration Guide

If you find hardcoded values in the codebase:

1. **Identify the value type** (API URL, timeout, storage key, etc.)
2. **Check if constant exists** in `constants.ts`
3. **If exists:** Import and use it
4. **If not exists:** Add it to `constants.ts` first
5. **Replace all occurrences** of the hardcoded value
6. **Test thoroughly**

---

## 📚 Related Documentation

- [REFACTORING_COMPLETE.md](../../REFACTORING_COMPLETE.md) - Refactoring summary
- [BEFORE_AFTER_COMPARISON.md](../../BEFORE_AFTER_COMPARISON.md) - Before/after examples
- [CLEANUP_CHECKLIST.md](../../CLEANUP_CHECKLIST.md) - Full cleanup checklist

---

**Last Updated:** November 22, 2025  
**Maintainer:** Development Team
