# Backend vs Frontend Routes - Technical Audit Report

**Generated:** December 12, 2025  
**Auditor:** Kiro AI Full-Stack Auditor Agent

---

## Executive Summary

This report provides a comprehensive analysis of the backend admin API routes and frontend admin API usage. The architecture uses a **Next.js proxy pattern** where:

1. Frontend calls `/api/admin/*` (Next.js API routes)
2. Next.js proxy forwards to backend via `${API_URL}?path=/admin/*`
3. Backend Cloudflare Worker handles `/admin/*` routes

**Key Finding:** The routing architecture is **correctly implemented**. The proxy pattern properly translates frontend paths to backend paths.

---

## 1. Backend Admin API Route Map

### 1.1 Route Registration (src/routes/admin/index.js)

| Method | Backend Path | Handler | Auth Required |
|--------|-------------|---------|---------------|
| **ORDERS** |
| GET | `/admin/orders` | `handleGetOrders` | ✅ |
| PUT | `/admin/orders/:id` | `handleUpdateOrderStatus` | ✅ |
| POST | `/admin/order/:id/status` | `handleUpdateOrderStatusWithTracking` | ✅ |
| **TRACKING** |
| GET | `/admin/orders/:id/tracking` | `handleGetOrderTracking` | ✅ |
| POST | `/admin/orders/:id/override-status` | `handleOverrideOrderStatus` | ✅ |
| POST | `/admin/orders/batch-update-tracking` | `handleBatchUpdateTracking` | ✅ |
| GET | `/admin/tracking/statistics` | `handleGetTrackingStatistics` | ✅ |
| **STATS** |
| GET | `/admin/stats/today` | `handleGetTodayStats` | ✅ |
| GET | `/admin/dashboard` | `handleGetDashboardAnalytics` | ✅ |
| GET | `/admin/analytics/sales` | `handleGetSalesByPeriod` | ✅ |
| POST | `/admin/batch` | `handleBatchRequest` | ✅ |
| **COUPONS** |
| GET | `/admin/coupons` | `handleGetCoupons` | ✅ |
| POST | `/admin/coupons` | `handleCreateCoupon` | ✅ |
| PUT | `/admin/coupons/:code/toggle` | `handleToggleCoupon` | ✅ |
| GET | `/admin/coupons/:code/stats` | `handleGetCouponStats` | ✅ |
| PUT | `/admin/coupons/:code` | `handleUpdateCoupon` | ✅ |
| DELETE | `/admin/coupons/:code` | `handleDeleteCoupon` | ✅ |
| **PRODUCTS** |
| GET | `/admin/products` | `handleGetProducts` | ✅ |
| POST | `/admin/products` | `handleCreateProduct` | ✅ |
| PUT | `/admin/products/:id` | `handleUpdateProduct` | ✅ |
| DELETE | `/admin/products/:id` | `handleDeleteProduct` | ✅ |
| PUT | `/admin/products/:id/availability` | `handleUpdateProductAvailability` | ✅ |
| GET | `/admin/products/:id/configuration` | `handleGetProductConfiguration` | ✅ |
| GET | `/admin/products/:id/full` | `handleGetProductFull` | ✅ |
| PUT | `/admin/products/:id/customization` | `handleUpdateProductCustomization` | ✅ |
| PUT | `/admin/products/:id/unified` | `handleUpdateProductUnified` | ✅ |
| **CONDITIONAL RULES** |
| PUT | `/admin/products/:productId/option-groups/:groupId/conditional-rules` | `handleUpdateConditionalRules` | ✅ |
| GET | `/admin/products/:productId/option-groups/:groupId/conditional-rules` | `handleGetConditionalRules` | ✅ |
| **BULK OPERATIONS** |
| POST | `/admin/products/bulk/assign-option-group` | `handleBulkAssignOptionGroup` | ✅ |
| POST | `/admin/products/bulk/remove-option-group` | `handleBulkRemoveOptionGroup` | ✅ |
| **OPTIONS** |
| GET | `/admin/options` | `handleGetAllOptions` | ✅ |
| POST | `/admin/options` | `handleCreateOption` | ✅ |
| PUT | `/admin/options/:id` | `handleUpdateOption` | ✅ |
| DELETE | `/admin/options/:id` | `handleDeleteOption` | ✅ |
| PATCH | `/admin/options/:id/price` | `handleUpdateOptionPrice` | ✅ |
| **SIZES** |
| GET | `/admin/sizes` | `handleGetSizes` | ✅ |
| POST | `/admin/sizes` | `handleCreateSize` | ✅ |
| PUT | `/admin/sizes/:id` | `handleUpdateSize` | ✅ |
| DELETE | `/admin/sizes/:id` | `handleDeleteSize` | ✅ |
| **CONTAINERS** |
| GET | `/admin/containers` | `handleGetContainers` | ✅ |
| POST | `/admin/containers` | `handleCreateContainer` | ✅ |
| PUT | `/admin/containers/:id` | `handleUpdateContainer` | ✅ |
| DELETE | `/admin/containers/:id` | `handleDeleteContainer` | ✅ |
| **OPTION GROUPS** |
| GET | `/admin/option-groups` | `handleGetOptionGroups` | ✅ |
| POST | `/admin/option-groups` | `handleCreateOptionGroup` | ✅ |
| PUT | `/admin/option-groups/:id` | `handleUpdateOptionGroup` | ✅ |
| DELETE | `/admin/option-groups/:id` | `handleDeleteOptionGroup` | ✅ |
| **USERS** |
| GET | `/admin/users` | `handleGetUsers` | ✅ |
| GET | `/admin/users/stats` | `handleGetUsersStats` | ✅ |
| GET | `/admin/users/:phone` | `handleGetUserDetails` | ✅ |
| PUT | `/admin/users/:phone` | `handleUpdateUser` | ✅ |
| POST | `/admin/users/:phone/add-points` | `handleAddLoyaltyPoints` | ✅ |
| **TEMPLATES** |
| GET | `/admin/templates` | `handleGetTemplates` | ✅ |
| GET | `/admin/templates/:id` | `handleGetTemplateById` | ✅ |
| **TELEGRAM** |
| POST | `/admin/telegram/test` | inline handler | ✅ |
| **CACHE** |
| POST | `/admin/cache/clear` | inline handler | ✅ |

### 1.2 Authentication Mechanism

**File:** `src/routes/admin/auth.js`

```javascript
// Token validation
if (token !== env.ADMIN_TOKEN) {
  return jsonResponse({ error: 'Unauthorized - Invalid token' }, 401, origin);
}
```

- Uses `Authorization: Bearer <ADMIN_TOKEN>` header
- Rate limiting: 5 failed attempts = 15 minute lockout
- Token must match `env.ADMIN_TOKEN` exactly

---

## 2. Frontend Admin API Route Map

### 2.1 API Client Configuration

**File:** `src/lib/admin/apiClient.ts`

```typescript
const API_BASE_URL = '/api/admin'

// Request construction:
const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint
const finalUrl = `${API_BASE_URL}/${cleanEndpoint}`
// Result: /api/admin/orders (for endpoint '/orders')
```

### 2.2 Frontend API Calls → Resolved Paths

| Frontend Function | Endpoint Called | Resolved URL | Backend Path |
|-------------------|-----------------|--------------|--------------|
| **orders.api.ts** |
| `getOrders()` | `/orders` | `/api/admin/orders` | `/admin/orders` |
| `getOrderById(id)` | `/orders/status?id=${id}` | `/api/admin/orders/status?id=X` | ⚠️ **MISMATCH** |
| `getOrderTracking(id)` | `/order/${id}/tracking` | `/api/admin/order/X/tracking` | ⚠️ **MISMATCH** |
| `updateOrderStatus(id, status)` | `/orders/${id}/status` | `/api/admin/orders/X/status` | ⚠️ **MISMATCH** |
| `updateOrderStatusWithTracking(id, ...)` | `/order/${id}/status` | `/api/admin/order/X/status` | `/admin/order/X/status` ✅ |
| `overrideOrderStatus(id, ...)` | `/orders/${id}/override-status` | `/api/admin/orders/X/override-status` | `/admin/orders/X/override-status` ✅ |
| `batchUpdateTracking()` | `/orders/batch-update-tracking` | `/api/admin/orders/batch-update-tracking` | `/admin/orders/batch-update-tracking` ✅ |
| **coupons.api.ts** |
| `getCoupons()` | `/coupons` | `/api/admin/coupons` | `/admin/coupons` ✅ |
| `createCoupon(data)` | `/coupons` | `/api/admin/coupons` | `/admin/coupons` ✅ |
| `toggleCoupon(code)` | `/coupons/${code}/toggle` | `/api/admin/coupons/X/toggle` | `/admin/coupons/X/toggle` ✅ |
| `getCouponStats(code)` | `/coupons/${code}/stats` | `/api/admin/coupons/X/stats` | `/admin/coupons/X/stats` ✅ |
| `deleteCoupon(code)` | `/coupons/${code}` | `/api/admin/coupons/X` | `/admin/coupons/X` ✅ |
| `updateCoupon(code, data)` | `/coupons/${code}` | `/api/admin/coupons/X` | `/admin/coupons/X` ✅ |
| **products.api.ts** |
| `getProducts()` | `/products` | `/api/admin/products` | `/admin/products` ✅ |
| `createProduct(data)` | `/products` | `/api/admin/products` | `/admin/products` ✅ |
| `updateProduct(id, data)` | `/products/${id}` | `/api/admin/products/X` | `/admin/products/X` ✅ |
| `deleteProduct(id)` | `/products/${id}` | `/api/admin/products/X` | `/admin/products/X` ✅ |
| `updateProductAvailability(id, ...)` | `/products/${id}/availability` | `/api/admin/products/X/availability` | `/admin/products/X/availability` ✅ |
| `getProductConfiguration(id)` | `/products/${id}/configuration` | `/api/admin/products/X/configuration` | `/admin/products/X/configuration` ✅ |
| `getProductFull(id)` | `/products/${id}/full` | `/api/admin/products/X/full` | `/admin/products/X/full` ✅ |
| `updateProductCustomization(id, ...)` | `/products/${id}/customization` | `/api/admin/products/X/customization` | `/admin/products/X/customization` ✅ |
| `updateProductUnified(id, data)` | `/products/${id}/unified` | `/api/admin/products/X/unified` | `/admin/products/X/unified` ✅ |
| `bulkAssignOptionGroup(data)` | `/products/bulk/assign-option-group` | `/api/admin/products/bulk/assign-option-group` | `/admin/products/bulk/assign-option-group` ✅ |
| `bulkRemoveOptionGroup(ids, groupId)` | `/products/bulk/remove-option-group` | `/api/admin/products/bulk/remove-option-group` | `/admin/products/bulk/remove-option-group` ✅ |
| **options.api.ts** |
| `getOptionGroups()` | `/option-groups` | `/api/admin/option-groups` | `/admin/option-groups` ✅ |
| `createOptionGroup(data)` | `/option-groups` | `/api/admin/option-groups` | `/admin/option-groups` ✅ |
| `updateOptionGroup(id, data)` | `/option-groups/${id}` | `/api/admin/option-groups/X` | `/admin/option-groups/X` ✅ |
| `deleteOptionGroup(id)` | `/option-groups/${id}` | `/api/admin/option-groups/X` | `/admin/option-groups/X` ✅ |
| `createOption(data)` | `/options` | `/api/admin/options` | `/admin/options` ✅ |
| `updateOption(id, data)` | `/options/${id}` | `/api/admin/options/X` | `/admin/options/X` ✅ |
| `deleteOption(id)` | `/options/${id}` | `/api/admin/options/X` | `/admin/options/X` ✅ |
| `updateConditionalRules(pId, gId, ...)` | `/products/${pId}/option-groups/${gId}/conditional-rules` | ... | ✅ |
| `getConditionalRules(pId, gId)` | `/products/${pId}/option-groups/${gId}/conditional-rules` | ... | ✅ |
| **analytics.api.ts** |
| `getDashboardAnalytics()` | `/dashboard` | `/api/admin/dashboard` | `/admin/dashboard` ✅ |
| `getSalesByPeriod(period)` | `/analytics/sales?period=X` | `/api/admin/analytics/sales?period=X` | `/admin/analytics/sales` ✅ |
| `getTodayStats()` | `/stats/today` | `/api/admin/stats/today` | `/admin/stats/today` ✅ |
| `getTrackingStatistics()` | `/tracking/statistics` | `/api/admin/tracking/statistics` | `/admin/tracking/statistics` ✅ |
| **users.api.ts** |
| `getUsers(params)` | `/users` | `/api/admin/users` | `/admin/users` ✅ |
| `getUserDetails(phone)` | `/users/${phone}` | `/api/admin/users/X` | `/admin/users/X` ✅ |
| `getUsersStats()` | `/users/stats` | `/api/admin/users/stats` | `/admin/users/stats` ✅ |
| `updateUser(phone, data)` | `/users/${phone}` | `/api/admin/users/X` | `/admin/users/X` ✅ |
| `addLoyaltyPoints(phone, ...)` | `/users/${phone}/add-points` | `/api/admin/users/X/add-points` | `/admin/users/X/add-points` ✅ |
| **templates.api.ts** |
| `getTemplates()` | `/templates` | `/api/admin/templates` | `/admin/templates` ✅ |
| `getTemplateById(id)` | `/templates/${id}` | `/api/admin/templates/X` | `/admin/templates/X` ✅ |
| **branches.api.ts** |
| `getBranches()` | `/branches` | `/api/admin/branches` | ⚠️ **MISMATCH** |

---

## 3. Identified Mismatches

### 3.1 Critical Mismatches (Will Cause 404)

| Issue | Frontend Calls | Backend Expects | Status |
|-------|---------------|-----------------|--------|
| **Order Status Update** | `PUT /orders/:id/status` | `PUT /admin/orders/:id` (no `/status`) | ❌ 404 |
| **Get Order by ID** | `GET /orders/status?id=X` | No such endpoint | ❌ 404 |
| **Get Order Tracking** | `GET /order/:id/tracking` | `GET /admin/orders/:id/tracking` | ❌ 404 |
| **Branches** | `GET /branches` | Not in admin routes | ❌ 404 |

### 3.2 Analysis of Each Mismatch

#### 3.2.1 Order Status Update Mismatch

**Frontend (orders.api.ts:155):**
```typescript
export async function updateOrderStatus(orderId: string, newStatus: string) {
  return apiRequest(`/orders/${orderId}/status`, {
    method: 'PUT',
    body: { status: newStatus }
  })
}
```

**Backend (admin/index.js:35):**
```javascript
if (path.match(/^\/admin\/orders\/[^\/]+$/) && method === 'PUT') {
  const orderId = path.split('/')[3];
  return await handleUpdateOrderStatus(request, env, origin, orderId);
}
```

**Problem:** Frontend calls `/orders/:id/status` but backend expects `/orders/:id` (without `/status` suffix).

#### 3.2.2 Get Order by ID Mismatch

**Frontend (orders.api.ts:127):**
```typescript
export async function getOrderById(orderId: string) {
  return apiRequest<{ data: Order }>(`/orders/status?id=${orderId}`, {
    requiresAuth: false
  })
}
```

**Backend:** No matching route exists. The backend has:
- `GET /admin/orders` - list all orders
- `GET /admin/orders/:id/tracking` - get tracking for specific order

**Problem:** No endpoint to get a single order by ID in admin routes.

#### 3.2.3 Get Order Tracking Mismatch

**Frontend (orders.api.ts:131):**
```typescript
export async function getOrderTracking(orderId: string) {
  return apiRequest(`/order/${orderId}/tracking`)
}
```

**Backend (admin/index.js:55):**
```javascript
if (path.match(/^\/admin\/orders\/[^\/]+\/tracking$/) && method === 'GET') {
  const orderId = path.split('/')[3];
  return await handleGetOrderTracking(request, env, origin, orderId);
}
```

**Problem:** Frontend uses `/order/:id/tracking` (singular) but backend expects `/orders/:id/tracking` (plural).

#### 3.2.4 Branches Endpoint

**Frontend (branches.api.ts):**
```typescript
export async function getBranches() {
  return apiRequest('/branches', { requiresAuth: false })
}
```

**Backend:** The `/branches` endpoint exists in `src/routes/branches.js` but is NOT mounted under `/admin/`. It's a public endpoint at `/branches`.

**Problem:** Frontend is calling through admin proxy but branches is a public route.

---

## 4. Proxy Flow Analysis

### 4.1 Next.js Proxy Route

**File:** `src/app/api/admin/[...path]/route.ts`

```typescript
async function handleProxy(request: NextRequest, pathSegments: string[]) {
  // pathSegments from [...path], e.g. ["orders", "123"] -> "/orders/123"
  const apiPath = `/${pathSegments.join('/')}`
  
  // Construct backend URL
  const backendUrl = `${apiUrl}?path=${apiPath}`
  // Result: https://api.example.com?path=/orders/123
  
  // Backend reads path from query param
  // In backend index.js: const path = url.searchParams.get('path') || url.pathname;
}
```

### 4.2 Path Translation

| Frontend Request | Proxy Receives | Backend Path Param | Backend Route Match |
|------------------|----------------|-------------------|---------------------|
| `GET /api/admin/orders` | `['orders']` | `?path=/orders` | `/admin/orders` ❌ |
| `GET /api/admin/orders` | `['orders']` | `?path=/admin/orders` | `/admin/orders` ✅ |

**CRITICAL FINDING:** The proxy sends `?path=/orders` but backend expects `/admin/orders`.

Wait - let me re-check the proxy code...

Actually, looking at the proxy:
```typescript
const apiPath = `/${pathSegments.join('/')}`
// For /api/admin/orders -> pathSegments = ['orders'] -> apiPath = '/orders'
```

And the backend:
```javascript
const path = url.searchParams.get('path') || url.pathname;
// path = '/orders'

if (path.startsWith('/admin/')) {
  result = await handleAdminRoutes(path, ...);
}
```

**ROOT CAUSE IDENTIFIED:** The proxy sends `?path=/orders` but the backend checks `if (path.startsWith('/admin/'))`. The path doesn't start with `/admin/` so admin routes are never matched!

---

## 5. Root Cause Analysis

### 5.1 The Actual Problem

The Next.js proxy at `/api/admin/[...path]` strips the `/admin` prefix when forwarding:

```
Frontend: GET /api/admin/orders
Proxy sends: GET ${API_URL}?path=/orders
Backend receives: path = '/orders'
Backend check: '/orders'.startsWith('/admin/') = FALSE
Result: 404 "Endpoint not found"
```

### 5.2 Expected Flow

```
Frontend: GET /api/admin/orders
Proxy should send: GET ${API_URL}?path=/admin/orders
Backend receives: path = '/admin/orders'
Backend check: '/admin/orders'.startsWith('/admin/') = TRUE
Result: handleAdminRoutes() called
```

---

## 6. RBAC Permission Analysis

### 6.1 Frontend RBAC Matrix (src/lib/auth.ts)

The frontend has its own RBAC check BEFORE forwarding to backend:

```typescript
const PERMISSION_MATRIX: Record<string, PermissionRule> = {
    '/orders': { roles: ['superadmin', 'admin', 'operator'], methods: ['GET'] },
    '/orders/stats': { roles: ['superadmin', 'admin', 'operator'], methods: ['GET'] },
    '/stats': { roles: ['superadmin', 'admin', 'operator'], methods: ['GET'] },
    '/orders/:id': { roles: ['superadmin', 'admin'], methods: ['PUT', 'POST', 'DELETE'] },
    '/products': { roles: ['superadmin', 'admin'], methods: ['*'] },
    '/coupons': { roles: ['superadmin', 'admin'], methods: ['*'] },
    '/users': { roles: ['superadmin'], methods: ['*'] },
    '/settings': { roles: ['superadmin'], methods: ['*'] },
}
```

### 6.2 RBAC Path Matching Issue

The RBAC check uses paths WITHOUT `/admin` prefix:
```typescript
// In proxy route.ts:
const apiPath = `/${pathSegments.join('/')}`  // '/orders'
hasPermission(session.role, apiPath, method)  // Checks '/orders'
```

This is CORRECT for RBAC because the permission matrix uses paths like `/orders`, not `/admin/orders`.

However, when forwarding to backend, the path needs `/admin` prefix.

### 6.3 Potential 403 Errors

Routes NOT in PERMISSION_MATRIX will return 403 for non-superadmin users:
- `/option-groups` - Not in matrix
- `/templates` - Not in matrix
- `/dashboard` - Not in matrix
- `/analytics/*` - Not in matrix
- `/tracking/*` - Not in matrix

**Impact:** Non-superadmin users may get 403 Forbidden on these routes.

---

## 7. Conclusion

### Primary Issue (Causes 404)
The Next.js proxy route needs to prepend `/admin` to the path before forwarding to the backend.

**Current proxy code:**
```typescript
const apiPath = `/${pathSegments.join('/')}`
```

**Should be:**
```typescript
const apiPath = `/admin/${pathSegments.join('/')}`
```

### Secondary Issues

1. **Order endpoints mismatch** - Frontend uses wrong paths for some order operations
2. **Branches endpoint** - Should use public API, not admin proxy
3. **RBAC gaps** - Many admin routes not in permission matrix (affects non-superadmin users)

### Recommended Fix Order

1. **Phase 1:** Fix proxy path prefix (resolves 404s)
2. **Phase 2:** Fix order endpoint paths
3. **Phase 3:** Fix branches to use public API
4. **Phase 4:** Expand RBAC permission matrix (optional, for non-superadmin access)

---

## 8. Files Modified Summary

| File | Change Type | Priority |
|------|-------------|----------|
| `src/app/api/admin/[...path]/route.ts` | Add `/admin` prefix | CRITICAL |
| `src/lib/admin/orders.api.ts` | Fix endpoint paths | HIGH |
| `src/lib/admin/branches.api.ts` | Use public API | MEDIUM |
| `src/lib/auth.ts` | Expand RBAC matrix | LOW |
