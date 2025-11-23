# ✅ Codebase Cleanup Checklist

## 🔴 IMMEDIATE ACTIONS (High Priority)

### Phase 1: Delete Dead Files (9 files)

```bash
# Run these commands to delete confirmed dead files:

# 1. TrackingModal backup
rm src/components/modals/TrackingModal/index.OLD.tsx

# 2. Old Hero component (replaced by StorytellingHero)
rm src/components/server/Hero.tsx

# 3. Duplicate ProductsGrid (use pages version)
rm src/components/server/ProductsGrid.tsx

# 4. Disabled SSE hook (replaced by polling)
rm src/hooks/useOrderStatusSSE.ts

# 5. Unused order poller
rm src/lib/orderPoller.ts

# 6. Unused admin realtime
rm src/lib/adminRealtime.ts

# 7. Unused Framer Motion config
rm src/lib/motion-shared.ts

# 8. Unused order tracking utilities
rm src/lib/orderTracking.ts

# 9. Unused batch DOM utilities
rm src/utils/batch-dom.ts
```

**Expected Impact:**
- ~800 lines of code removed
- ~15-20KB bundle size reduction
- Cleaner codebase

---

### Phase 2: Create Constants File

**File:** `src/config/constants.ts`

```typescript
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
```

**Then update:**
- `src/lib/api.ts` - use `API_CONFIG`
- `src/lib/storage.client.ts` - use `STORAGE_KEYS`, `ORDER_STATUSES`
- `src/providers/CartProvider.tsx` - use `TIMEOUTS`, `LIMITS`
- `src/hooks/useApiClient.ts` - use `API_CONFIG`

---

### Phase 3: Create Swiper Config

**File:** `src/config/swiperConfig.ts`

```typescript
import { FreeMode, Pagination } from 'swiper/modules'

export const defaultSwiperConfig = {
  modules: [FreeMode, Pagination],
  spaceBetween: 16,
  slidesPerView: "auto" as const,
  freeMode: {
    enabled: true,
    sticky: false,
    momentum: true,
    momentumRatio: 0.5
  },
  pagination: {
    clickable: true,
    dynamicBullets: true
  },
  dir: "rtl" as const
}

export const productSwiperConfig = {
  ...defaultSwiperConfig,
  className: "!pb-12"
}
```

**Then update:**
- `src/components/pages/ProductsGrid.tsx`
- `src/components/pages/ProductsSwiperWrapper.tsx`
- `src/components/server/ProductsGrid.tsx` (if not deleted)

---

## 🟡 MEDIUM PRIORITY

### Phase 4: Create Custom Hooks

**File:** `src/hooks/useWindowEvent.ts`

```typescript
'use client'

import { useEffect } from 'react'

export function useWindowEvent<T = any>(
  eventName: string,
  handler: (event: CustomEvent<T>) => void,
  deps: any[] = []
) {
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const wrappedHandler = (event: Event) => {
      handler(event as CustomEvent<T>)
    }
    
    window.addEventListener(eventName, wrappedHandler)
    return () => window.removeEventListener(eventName, wrappedHandler)
  }, [eventName, handler, ...deps])
}
```

**Then refactor:**
- `src/components/pages/PageContentClient.tsx` (3 event listeners)
- `src/components/pages/Sidebar.tsx` (2 event listeners)
- `src/providers/CartProvider.tsx` (1 event listener)

---

### Phase 5: Clean Up Unused Exports

**Review and remove unused functions:**

1. **`src/lib/api.ts`**
   - Consider removing if truly unused:
     - `getRecommendations()`
     - `getNutritionSummary()`
     - `getBranches()`
     - `checkBranchAvailability()`
     - `getBranchHours()`
     - `cancelOrder()`
   - Or add `@deprecated` JSDoc comments

2. **`src/lib/utils.ts`**
   - Consider removing if truly unused:
     - `openBranchDirections()`
     - `formatPhoneForCall()`
     - `getWhatsAppUrl()`
     - `isValidCoordinates()`
     - `formatDateArabic()`
     - `formatCurrency()`
     - `debounce()`
     - `throttle()`
   - Or move to separate `utils/unused.ts` for future use

3. **`src/hooks/useApiClient.ts`**
   - Consider removing if truly unused:
     - `trackEvent()`
     - `getDeviceInfo()`
     - `detectBaseURL()`
     - `getErrorMessage()`

---

### Phase 6: Remove Dead Code

**`src/providers/ThemeProvider.tsx`**

Remove unused state variables:

```typescript
// DELETE these lines:
const [isLanguageHydrated, setIsLanguageHydrated] = useState(false)
const [isThemeHydrated, setIsThemeHydrated] = useState(false)
void isLanguageHydrated
void isThemeHydrated
```

**`src/components/pages/ProductsSwiperWrapper.tsx`**

Remove unused prop:

```typescript
// DELETE this line:
void category

// Or use it:
aria-label={`Products in ${category} category`}
```

**`src/lib/storage.client.ts`**

Remove unused method:

```typescript
// DELETE canCancelOrder() method if never called
```

---

## 🟢 LOW PRIORITY (Nice to Have)

### Phase 7: Create ModalWrapper Component

**File:** `src/components/ui/common/ModalWrapper.tsx`

```typescript
'use client'

import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'

interface ModalWrapperProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  title?: string
  showCloseButton?: boolean
}

export function ModalWrapper({
  isOpen,
  onClose,
  children,
  size = 'md',
  title,
  showCloseButton = true
}: ModalWrapperProps) {
  // Lock scroll when open
  useEffect(() => {
    if (isOpen && typeof window !== 'undefined') {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = ''
      }
    }
  }, [isOpen])

  // ESC key handler
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen && typeof window !== 'undefined') {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full'
  }

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/50 z-50 transition-opacity"
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className={`bg-white dark:bg-gray-900 rounded-2xl shadow-2xl ${sizeClasses[size]} w-full max-h-[90vh] overflow-hidden flex flex-col`}
          role="dialog"
          aria-modal="true"
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              {title && (
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {title}
                </h2>
              )}
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center transition-colors"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                </button>
              )}
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    </>
  )
}
```

**Then refactor all modals to use it.**

---

### Phase 8: Add JSDoc Comments

Add documentation to complex functions:

```typescript
/**
 * Calculate order prices including addons, delivery fee, and coupon discount
 * @param items - Array of cart items with product IDs and quantities
 * @param couponCode - Optional coupon code for discount
 * @param deliveryMethod - 'delivery' or 'pickup'
 * @param customerPhone - Customer phone for coupon validation
 * @param location - GPS coordinates for delivery fee calculation
 * @param addressInputType - 'gps' or 'manual'
 * @returns Calculated prices with subtotal, discount, delivery fee, and total
 */
export async function calculateOrderPrices(
  items: OrderItem[],
  couponCode?: string | null,
  deliveryMethod: string = 'delivery',
  customerPhone?: string,
  location?: { lat: number; lng: number },
  addressInputType?: string
): Promise<CalculatedPrices> {
  // ...
}
```

---

## 📊 Progress Tracking

- [ ] Phase 1: Delete 9 dead files
- [ ] Phase 2: Create constants.ts
- [ ] Phase 3: Create swiperConfig.ts
- [ ] Phase 4: Create useWindowEvent hook
- [ ] Phase 5: Review unused exports
- [ ] Phase 6: Remove dead code
- [ ] Phase 7: Create ModalWrapper (optional)
- [ ] Phase 8: Add JSDoc comments (optional)

---

## 🎯 Expected Results

**Before Cleanup:**
- Total files: ~90
- Dead files: 9
- Redundant code: ~800 lines
- Bundle size: ~XXX KB

**After Cleanup:**
- Total files: ~81
- Dead files: 0
- Redundant code: 0
- Bundle size: ~XXX KB (15-20KB reduction)
- Maintainability: ⬆️ Significantly improved
- Code duplication: ⬇️ Reduced by ~60%

---

**Last Updated:** November 22, 2025  
**Status:** Ready for execution
