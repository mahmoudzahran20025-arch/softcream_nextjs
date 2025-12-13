# Fix Plan - Admin API Route Mismatches

**Generated:** December 12, 2025  
**Priority:** CRITICAL

---

## Decision Recommendation

**Option C: Patch frontend to match backend without rollback**

### Rationale:
1. Backend routes are well-structured and follow REST conventions
2. The issue is a simple path prefix problem in the proxy
3. Minimal code changes required (1 line fix + 3 endpoint corrections)
4. No breaking changes to existing backend API contracts

---

## Fix Plan

### Phase 1: Critical Fix - Proxy Path Prefix (IMMEDIATE)

**File:** `soft-cream-nextjs/src/app/api/admin/[...path]/route.ts`

**Current Code (Line ~50):**
```typescript
const apiPath = `/${pathSegments.join('/')}`
```

**Fixed Code:**
```typescript
const apiPath = `/admin/${pathSegments.join('/')}`
```

**Impact:** This single change fixes ALL admin API calls by ensuring the `/admin` prefix is included when forwarding to the backend.

---

### Phase 2: Frontend Endpoint Corrections

#### Fix 2.1: Order Status Update

**File:** `soft-cream-nextjs/src/lib/admin/orders.api.ts`

**Current (Line ~155):**
```typescript
export async function updateOrderStatus(
  orderId: string,
  newStatus: string
): Promise<{ success: boolean; message: string }> {
  return apiRequest(`/orders/${orderId}/status`, {
    method: 'PUT',
    body: { status: newStatus }
  })
}
```

**Fixed:**
```typescript
export async function updateOrderStatus(
  orderId: string,
  newStatus: string
): Promise<{ success: boolean; message: string }> {
  return apiRequest(`/orders/${orderId}`, {
    method: 'PUT',
    body: { status: newStatus }
  })
}
```

**Reason:** Backend expects `PUT /admin/orders/:id` not `PUT /admin/orders/:id/status`

---

#### Fix 2.2: Get Order Tracking

**File:** `soft-cream-nextjs/src/lib/admin/orders.api.ts`

**Current (Line ~131):**
```typescript
export async function getOrderTracking(orderId: string) {
  return apiRequest(`/order/${orderId}/tracking`)
}
```

**Fixed:**
```typescript
export async function getOrderTracking(orderId: string) {
  return apiRequest(`/orders/${orderId}/tracking`)
}
```

**Reason:** Backend uses plural `/orders/` not singular `/order/`

---

#### Fix 2.3: Get Order By ID

**File:** `soft-cream-nextjs/src/lib/admin/orders.api.ts`

**Current (Line ~127):**
```typescript
export async function getOrderById(orderId: string): Promise<{ data: Order }> {
  return apiRequest<{ data: Order }>(`/orders/status?id=${orderId}`, {
    requiresAuth: false
  })
}
```

**Options:**

**Option A - Use tracking endpoint (recommended):**
```typescript
export async function getOrderById(orderId: string): Promise<{ data: Order }> {
  const response = await apiRequest<{ success: boolean; data: { order: Order } }>(
    `/orders/${orderId}/tracking`
  )
  return { data: response.data.order }
}
```

**Option B - Add new backend endpoint:**
Add `GET /admin/orders/:id` to backend that returns single order.

---

#### Fix 2.4: Branches API

**File:** `soft-cream-nextjs/src/lib/admin/branches.api.ts`

**Current:**
```typescript
export async function getBranches(): Promise<{ data: Branch[] }> {
  return apiRequest('/branches', { requiresAuth: false })
}
```

**Fixed - Use public API directly:**
```typescript
const PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL || ''

export async function getBranches(): Promise<{ data: Branch[] }> {
  const response = await fetch(`${PUBLIC_API_URL}/branches`)
  return response.json()
}
```

**Reason:** Branches is a public endpoint, not an admin endpoint. Should not go through admin proxy.

---

## Implementation Order

1. **Phase 1** - Fix proxy (1 line change) - Fixes 90% of issues
2. **Phase 2.1** - Fix updateOrderStatus endpoint
3. **Phase 2.2** - Fix getOrderTracking endpoint  
4. **Phase 2.3** - Fix getOrderById endpoint
5. **Phase 2.4** - Fix getBranches to use public API

---

## Testing Checklist

After applying fixes, verify:

- [ ] `GET /api/admin/orders` returns orders list
- [ ] `PUT /api/admin/orders/:id` updates order status
- [ ] `GET /api/admin/orders/:id/tracking` returns tracking data
- [ ] `GET /api/admin/products` returns products list
- [ ] `GET /api/admin/coupons` returns coupons list
- [ ] `GET /api/admin/option-groups` returns option groups
- [ ] `GET /api/admin/templates` returns templates
- [ ] `GET /api/admin/users` returns users list
- [ ] `GET /api/admin/dashboard` returns analytics
- [ ] `GET /api/admin/stats/today` returns today's stats

---

---

### Phase 3: RBAC Permission Matrix Expansion (Optional)

**File:** `soft-cream-nextjs/src/lib/auth.ts`

If non-superadmin users need access to additional routes, expand the PERMISSION_MATRIX:

```typescript
const PERMISSION_MATRIX: Record<string, PermissionRule> = {
    // Existing rules...
    '/orders': { roles: ['superadmin', 'admin', 'operator'], methods: ['GET'] },
    '/orders/stats': { roles: ['superadmin', 'admin', 'operator'], methods: ['GET'] },
    '/stats': { roles: ['superadmin', 'admin', 'operator'], methods: ['GET'] },
    '/orders/:id': { roles: ['superadmin', 'admin'], methods: ['PUT', 'POST', 'DELETE'] },
    '/products': { roles: ['superadmin', 'admin'], methods: ['*'] },
    '/coupons': { roles: ['superadmin', 'admin'], methods: ['*'] },
    '/users': { roles: ['superadmin'], methods: ['*'] },
    '/settings': { roles: ['superadmin'], methods: ['*'] },
    
    // NEW: Add missing admin routes
    '/option-groups': { roles: ['superadmin', 'admin'], methods: ['*'] },
    '/options': { roles: ['superadmin', 'admin'], methods: ['*'] },
    '/templates': { roles: ['superadmin', 'admin', 'operator'], methods: ['GET'] },
    '/dashboard': { roles: ['superadmin', 'admin', 'operator'], methods: ['GET'] },
    '/analytics': { roles: ['superadmin', 'admin', 'operator'], methods: ['GET'] },
    '/tracking': { roles: ['superadmin', 'admin', 'operator'], methods: ['GET'] },
    '/batch': { roles: ['superadmin', 'admin', 'operator'], methods: ['POST'] },
}
```

---

## Rollback Plan

If issues persist after fixes:

1. Revert proxy change: `git checkout src/app/api/admin/[...path]/route.ts`
2. Revert orders.api.ts changes: `git checkout src/lib/admin/orders.api.ts`
3. Revert branches.api.ts changes: `git checkout src/lib/admin/branches.api.ts`

---

## Ready-to-Apply Patches

See companion files:
- `patches/01-proxy-fix.patch.ts` - Critical proxy path fix
- `patches/02-orders-api-fix.patch.ts` - Order endpoint corrections
- `patches/03-branches-api-fix.patch.ts` - Branches public API fix
