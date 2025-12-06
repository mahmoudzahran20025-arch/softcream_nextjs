# API Structure Documentation

## Overview

This document describes the API fetching architecture in the SoftCream Next.js frontend.
The structure follows a clear separation between customer-facing and admin APIs.

**Last Updated:** Phase 4 - Smart Options & Template System

## Directory Structure

```
src/lib/
├── api.ts                    # Customer-facing API (main entry point)
├── admin/                    # Admin-specific APIs
│   ├── index.ts              # Barrel export for all admin APIs
│   ├── apiClient.ts          # Core HTTP handler with auth
│   ├── products.api.ts       # Product management
│   ├── orders.api.ts         # Order management
│   ├── coupons.api.ts        # Coupon management
│   ├── templates.api.ts      # Template management
│   ├── options.api.ts        # Option groups management (includes conditional rules)
│   ├── analytics.api.ts      # Analytics & dashboard
│   ├── branches.api.ts       # Branch management
│   ├── users.api.ts          # User management
│   ├── batch.api.ts          # Batch operations
│   ├── polling.ts            # Smart polling utilities
│   ├── errorMessages.ts      # Error message translations
│   └── validation/           # Validation utilities
├── utils/                    # Utility functions
│   ├── index.ts              # Barrel export
│   ├── priceCalculator.ts    # Cart price calculations
│   ├── nutritionCalculator.ts # Nutrition calculations
│   └── healthScore.ts        # Health score calculations
├── dataValidator.ts          # API response validation
├── uiConfig.ts               # UI config parsing utilities
├── orderPoller.ts            # Customer order tracking polling
├── orderTracking.ts          # Order status management utilities
├── adminRealtime.ts          # Admin real-time updates (⚠️ deprecated - use manual refresh)
└── ...
```

## Usage Guidelines

### Customer-Facing API (`api.ts`)

Use for all customer-facing operations:

```typescript
import { 
  getProducts, 
  getProduct, 
  getProductConfiguration,
  submitOrder,
  validateCoupon 
} from '@/lib/api'
```

### Admin API (`admin/`)

Use for all admin panel operations:

```typescript
// Named imports (recommended)
import { 
  getProducts, 
  createProduct, 
  updateProduct,
  getOptionGroups 
} from '@/lib/admin'

// Or import specific API file
import { getTemplates } from '@/lib/admin/templates.api'
```

### Data Providers

For shared data across components, use providers:

```typescript
import { useProductsData } from '@/providers/ProductsProvider'

function MyComponent() {
  const { products, filteredProducts } = useProductsData()
  // ...
}
```

### Price Calculations

Two price calculators exist for different purposes:

1. **Cart calculations** (`lib/utils/priceCalculator.ts`):
   ```typescript
   import { calculateCartItemPrice, calculateCartTotal } from '@/lib/utils'
   ```

2. **Product modal** (`hooks/usePriceCalculator.ts`):
   ```typescript
   import { usePriceCalculator } from '@/hooks/usePriceCalculator'
   ```

## Best Practices

1. **No duplicate fetches**: Use providers for shared data
2. **Centralized API calls**: All API calls go through `api.ts` or `admin/`
3. **Type safety**: Import types from `@/types/products` and `@/types/options`
4. **Error handling**: Use `dataValidator.ts` for response validation
5. **Caching**: Use React Query for automatic caching

## Adding New API Endpoints

### Customer API
Add to `src/lib/api.ts`:
```typescript
export async function newEndpoint(params: Params): Promise<Response> {
  return httpRequest<Response>('GET', '/endpoint', params)
}
```

### Admin API
Create or update file in `src/lib/admin/`:
```typescript
// In src/lib/admin/newFeature.api.ts
import { apiRequest } from './apiClient'

export async function newAdminEndpoint(): Promise<Response> {
  return apiRequest('/admin/endpoint')
}
```

Then export from `src/lib/admin/index.ts`.

## Hooks for Data Fetching

Custom hooks that wrap API calls:

```
src/hooks/
├── useProductConfiguration.ts  # Product configuration fetching
├── useConditionalOptions.ts    # Conditional options logic
├── usePriceCalculator.ts       # Product modal price calculations
└── useAddToCart.ts             # Cart operations
```

## Deprecated Files

| File | Status | Replacement |
|------|--------|-------------|
| `adminRealtime.ts` | ⚠️ Deprecated | Use manual refresh in admin panel |

## Requirements Compliance

- **10.1**: Single centralized service file ✅ (`api.ts` for customer, `admin/` for admin)
- **10.2**: Data sharing through providers ✅ (`ProductsProvider`)
- **10.3**: No duplicate API call files ✅ (consolidated structure)
- **10.4**: Established pattern in `src/lib/api.ts` ✅
- **10.5**: Appropriate caching via React Query ✅

## Audit Summary (Phase 4)

### Files Reviewed
- `src/lib/api.ts` - Main customer API ✅
- `src/lib/admin/*.ts` - Admin APIs ✅
- `src/lib/utils/*.ts` - Utility functions ✅
- `src/providers/*.tsx` - Data providers ✅
- `src/hooks/*.ts` - Custom hooks ✅

### Findings
1. **No duplicate API fetching files found** - Structure is well-organized
2. **Clear separation** between customer (`api.ts`) and admin (`admin/`) APIs
3. **Two price calculators** serve different purposes:
   - `lib/utils/priceCalculator.ts` - Cart calculations
   - `hooks/usePriceCalculator.ts` - Product modal with conditional options
4. **adminRealtime.ts** is deprecated but still used - documented for future cleanup

### Recommendations
1. Consider removing `adminRealtime.ts` in future cleanup
2. Continue using established patterns for new API endpoints
3. Use React Query for caching in new components
