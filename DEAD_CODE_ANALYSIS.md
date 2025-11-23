# 🔍 Dead Code & Unused Exports Analysis

**Date:** November 22, 2025  
**Analyst:** Senior Software Architect  
**Codebase:** soft-cream-nextjs/src/  
**Total Files Analyzed:** 85 files

---

## 🔴 Task 1: Dead Files (Never Imported)

### High Confidence (100% Dead) ✅

| File Path | Reason | Lines | Recommendation |
|-----------|--------|-------|----------------|
| `src/components/modals/TrackingModal/index.OLD.tsx` | Backup file with `.OLD` extension | 596 | **DELETE** immediately |
| `src/hooks/useOrderStatusSSE.ts` | Explicitly disabled with warning comment | 158 | **DELETE** (SSE replaced by polling) |
| `src/utils/batch-dom.ts` | Never imported anywhere | 81 | **DELETE** (unused utility) |

**Total Dead Code:** 835 lines

**Action Required:**
```bash
# Delete these files
rm src/components/modals/TrackingModal/index.OLD.tsx
rm src/hooks/useOrderStatusSSE.ts
rm src/utils/batch-dom.ts
```

---

### Medium Confidence (Potentially Dead) ⚠️

| File Path | Reason | Lines | Recommendation |
|-----------|--------|-------|----------------|
| `src/components/ui/common/index.ts` | Re-export file, check if used | 3 | **REVIEW** - May be used for barrel exports |

**Analysis:**
- This is a barrel export file that re-exports common components
- Need to verify if components are imported from this file or directly

**Verification Needed:**
```typescript
// Check if imports use:
import { PriceDisplay } from '@/components/ui/common'  // Via barrel
// OR
import { PriceDisplay } from '@/components/ui/common/PriceDisplay'  // Direct
```

---

### Low Confidence (Need Manual Review) ℹ️

**None found** - All other files are properly imported (including dynamic imports)

**Note:** The following files appear unused in static analysis but are actually imported dynamically:
- `MyOrdersModal/index.tsx` - ✅ Used via `dynamic(() => import(...))`
- `EditOrderModal/index.tsx` - ✅ Used via `dynamic(() => import(...))`
- `OrderSuccessModal/index.tsx` - ✅ Used via `dynamic(() => import(...))`
- `CheckoutModal/index.tsx` - ✅ Used via `dynamic(() => import(...))`
- `ProductModal/index.tsx` - ✅ Used via `dynamic(() => import(...))`
- `CartModal/index.tsx` - ✅ Used via `dynamic(() => import(...))`
- `TrackingModal/index.tsx` - ✅ Used via `dynamic(() => import(...))`

---

## 🟡 Task 2: Unused Exports Analysis

### File: `src/lib/api.ts`

#### HIGH Confidence - Never Used (Safe to Remove) 🔴

| Export Name | Type | Lines | Usage Count | Recommendation |
|-------------|------|-------|-------------|----------------|
| `getRecommendations()` | function | 265-267 | 0 | **DELETE** or mark `@deprecated` |
| `getNutritionSummary()` | function | 269-271 | 0 | **DELETE** or mark `@deprecated` |
| `getBranches()` | function | 277-279 | 0 | **DELETE** or mark `@deprecated` |
| `checkBranchAvailability()` | function | 281-283 | 0 | **DELETE** or mark `@deprecated` |
| `getBranchHours()` | function | 285-287 | 0 | **DELETE** or mark `@deprecated` |
| `cancelOrder()` | function | 307-309 | 0 | **DELETE** or mark `@deprecated` |
| `updateOrderStatus()` | function | 311-318 | 0 | **REVIEW** - May be used by admin |

#### Info: Purpose of Each Function

**`getRecommendations(productId, limit)`**
- **Purpose:** Fetches product recommendations based on product ID
- **Intended use:** Product recommendations feature
- **Status:** Feature not implemented yet
- **Decision:** 
  - Option 1: DELETE if feature not planned
  - Option 2: Mark as `@deprecated` with comment
  - Option 3: Keep if feature is planned soon

**`getNutritionSummary(productIds)`**
- **Purpose:** Aggregates nutrition data for multiple products
- **Intended use:** Cart nutrition summary
- **Status:** Not used (NutritionSummary component exists but doesn't call this)
- **Decision:** DELETE (functionality may be implemented differently)

**`getBranches()`**
- **Purpose:** Fetches list of all branches
- **Intended use:** Branch selection feature
- **Status:** Feature not implemented
- **Decision:** DELETE if multi-branch not planned

**`checkBranchAvailability(branchId)`**
- **Purpose:** Checks if a branch is currently available
- **Intended use:** Branch availability checking
- **Status:** Feature not implemented
- **Decision:** DELETE if multi-branch not planned

**`getBranchHours(branchId)`**
- **Purpose:** Gets operating hours for a specific branch
- **Intended use:** Display branch hours
- **Status:** Feature not implemented
- **Decision:** DELETE if multi-branch not planned

**`cancelOrder(orderId)`**
- **Purpose:** Cancels an order
- **Intended use:** Order cancellation feature
- **Status:** Not used in frontend (may be admin-only)
- **Decision:** DELETE from client API (keep in admin API if needed)

**`updateOrderStatus(orderId, status, ...)`**
- **Purpose:** Updates order status
- **Intended use:** Admin order management
- **Status:** Not used in client code
- **Decision:** MOVE to admin API file

---

### File: `src/lib/utils.ts`

#### HIGH Confidence - Never Used (Safe to Remove) 🔴

| Export Name | Type | Lines | Usage Count | Recommendation |
|-------------|------|-------|-------------|----------------|
| `openBranchDirections()` | function | 12-20 | 0 | **DELETE** |
| `formatPhoneForCall()` | function | 27-30 | 0 | **DELETE** |
| `getWhatsAppUrl()` | function | 37-41 | 0 | **DELETE** |
| `isValidCoordinates()` | function | 48-57 | 0 | **DELETE** |
| `formatDateArabic()` | function | 64-70 | 0 | **DELETE** |
| `formatCurrency()` | function | 77-79 | 0 | **DELETE** |
| `debounce()` | function | 86-94 | 0 | **DELETE** |
| `throttle()` | function | 101-112 | 0 | **DELETE** |

#### Info: Purpose of Each Function

**`openBranchDirections(lat, lng)`**
- **Purpose:** Opens Google Maps with directions to branch
- **Intended use:** Branch location feature
- **Status:** Not used (no branch selection UI)
- **Decision:** DELETE (can be re-added if needed)

**`formatPhoneForCall(phone)`**
- **Purpose:** Formats phone number for tel: links
- **Intended use:** Click-to-call functionality
- **Status:** Not used
- **Decision:** DELETE (can use inline formatting if needed)

**`getWhatsAppUrl(phone, message)`**
- **Purpose:** Generates WhatsApp URL
- **Intended use:** WhatsApp contact feature
- **Status:** Not used (WhatsApp links may be hardcoded)
- **Decision:** REVIEW - Check if WhatsApp feature exists

**`isValidCoordinates(lat, lng)`**
- **Purpose:** Validates GPS coordinates
- **Intended use:** Location validation
- **Status:** Not used
- **Decision:** DELETE (validation done elsewhere)

**`formatDateArabic(date)`**
- **Purpose:** Formats date in Arabic locale
- **Intended use:** Date display
- **Status:** Not used (dates formatted inline)
- **Decision:** DELETE (can use Intl.DateTimeFormat directly)

**`formatCurrency(amount)`**
- **Purpose:** Formats currency in EGP
- **Intended use:** Price display
- **Status:** Not used (PriceDisplay component exists)
- **Decision:** DELETE (replaced by component)

**`debounce(func, wait)`**
- **Purpose:** Debounces function calls
- **Intended use:** Performance optimization
- **Status:** Not used (debouncing done inline or in hooks)
- **Decision:** DELETE (not needed with current architecture)

**`throttle(func, limit)`**
- **Purpose:** Throttles function calls
- **Intended use:** Performance optimization
- **Status:** Not used
- **Decision:** DELETE (not needed)

---

### File: `src/hooks/useApiClient.ts`

#### HIGH Confidence - Never Used (Safe to Remove) 🔴

| Export Name | Type | Lines | Usage Count | Recommendation |
|-------------|------|-------|-------------|----------------|
| `trackEvent()` | function | 18-52 | 0 | **DELETE** or mark `@deprecated` |
| `getDeviceInfo()` | function | 57-77 | 0 | **DELETE** |
| `detectBaseURL()` | function | 82-94 | 0 | **DELETE** |
| `getErrorMessage()` | function | 99-123 | 0 | **DELETE** |

#### Info: Purpose of Each Function

**`trackEvent(event)`**
- **Purpose:** Tracks analytics events
- **Intended use:** Analytics tracking
- **Status:** Not used (analytics may not be implemented)
- **Decision:** 
  - DELETE if analytics not planned
  - KEEP if analytics will be added soon

**`getDeviceInfo()`**
- **Purpose:** Gets device information
- **Intended use:** Device fingerprinting
- **Status:** Not used
- **Decision:** DELETE (device ID handled in storage)

**`detectBaseURL()`**
- **Purpose:** Detects API base URL based on hostname
- **Intended use:** Environment detection
- **Status:** Not used (API_CONFIG.BASE_URL used instead)
- **Decision:** DELETE (replaced by constants)

**`getErrorMessage(error, lang)`**
- **Purpose:** Formats error messages with localization
- **Intended use:** Error handling
- **Status:** Not used (errors handled inline)
- **Decision:** DELETE (can be re-added if needed)

---

## 🟠 Task 3: Unused Internal Code

### File: `src/providers/ThemeProvider.tsx`

#### Unused State Variables (Already Fixed) ✅

| Line | Variable | Type | Reason | Status |
|------|----------|------|--------|--------|
| ~45 | `isLanguageHydrated` | state | Set but never read | ✅ **ALREADY REMOVED** in Phase 2 |
| ~46 | `isThemeHydrated` | state | Set but never read | ✅ **ALREADY REMOVED** in Phase 2 |

**Note:** These were already cleaned up in previous refactoring phases.

---

### File: `src/components/pages/ProductsSwiperWrapper.tsx`

#### Unused Props (Already Fixed) ✅

| Component | Line | Prop | Type | Reason | Status |
|-----------|------|------|------|--------|--------|
| `ProductsSwiperWrapper` | ~12 | `category` | string | Received but not used | ✅ **FIXED** - Now used in aria-label |

**Fix Applied:**
```typescript
// Before:
void category

// After:
aria-label={`Products in ${category} category`}
```

---

### File: `src/lib/storage.client.ts`

#### Unused Methods

| Line | Method | Reason | Recommendation |
|------|--------|--------|----------------|
| ~650 | `canCancelOrder()` | Defined but never called | **DELETE** |

**Analysis:**
```typescript
canCancelOrder(orderId: string): boolean {
  try {
    const order = this.getOrder(orderId)
    if (!order || !order.canCancelUntil) return false
    
    const deadline = new Date(order.canCancelUntil)
    const now = new Date()
    
    return now < deadline && order.status === 'pending'
  } catch (e) {
    return false
  }
}
```

**Decision:** DELETE - Order cancellation not implemented in UI

---

## 🔵 Task 4: Code Duplication Analysis

### ✅ Already Fixed in Previous Phases

#### 1. Swiper Configuration (FIXED) ✅
**Status:** Centralized in `src/config/swiperConfig.ts`
- **Before:** Duplicated in 3 files (36 lines)
- **After:** Single source of truth
- **Phase:** Phase 3

#### 2. Storage Keys (FIXED) ✅
**Status:** Centralized in `src/config/constants.ts`
- **Before:** Hardcoded 30+ times
- **After:** Single STORAGE_KEYS constant
- **Phase:** Phase 2

#### 3. API Configuration (FIXED) ✅
**Status:** Centralized in `src/config/constants.ts`
- **Before:** Hardcoded in 3 locations
- **After:** Single API_CONFIG constant
- **Phase:** Phase 2

#### 4. Event Listener Pattern (FIXED) ✅
**Status:** Extracted to `useWindowEvent` hook
- **Before:** Repeated 6 times (63 lines)
- **After:** Reusable hook (34 lines)
- **Phase:** Phase 4

---

### 🟡 Remaining Duplication (Low Priority)

#### 1. Modal Structure Pattern

**Locations:**
- All 9 modals in `src/components/modals/*/index.tsx`

**Similarity:** 70-80% similar structure
- Overlay backdrop
- Close on ESC key
- Lock body scroll
- RTL support
- Animation transitions

**Refactoring Opportunity:**
Create a `ModalWrapper` component (Phase 7 - Low Priority)

**Estimated Impact:**
- Would reduce ~200 lines of duplicate code
- Improve consistency
- Easier to maintain

**Decision:** LOW PRIORITY - Modals work well, refactoring is optional

---

## 📊 Summary Statistics

### Dead Code Found

| Category | Count | Lines | Status |
|----------|-------|-------|--------|
| **Dead Files** | 3 | 835 | Ready to DELETE |
| **Unused Exports (api.ts)** | 7 | ~50 | Ready to DELETE |
| **Unused Exports (utils.ts)** | 8 | ~80 | Ready to DELETE |
| **Unused Exports (useApiClient.ts)** | 4 | ~60 | Ready to DELETE |
| **Unused Methods** | 1 | ~15 | Ready to DELETE |
| **Total** | **23 items** | **~1,040 lines** | **Ready for cleanup** |

### Code Quality Improvements

| Metric | Before | After Cleanup | Improvement |
|--------|--------|---------------|-------------|
| **Dead Code** | ~1,040 lines | 0 lines | -100% |
| **Unused Exports** | 19 functions | 0 functions | -100% |
| **Dead Files** | 3 files | 0 files | -100% |
| **Bundle Size** | XXX KB | XXX KB | ~-25KB estimated |

---

## 🎯 Recommended Actions

### Phase 5: Delete Dead Files (5 minutes) 🔴 HIGH PRIORITY

```bash
# Delete confirmed dead files
rm src/components/modals/TrackingModal/index.OLD.tsx
rm src/hooks/useOrderStatusSSE.ts
rm src/utils/batch-dom.ts
```

**Impact:** -835 lines, immediate cleanup

---

### Phase 6: Remove Unused Exports (30 minutes) 🟡 MEDIUM PRIORITY

#### Option 1: Delete Immediately (Recommended)
```typescript
// In src/lib/api.ts - DELETE these functions:
- getRecommendations()
- getNutritionSummary()
- getBranches()
- checkBranchAvailability()
- getBranchHours()
- cancelOrder()

// In src/lib/utils.ts - DELETE entire file or keep only if needed:
- All 8 functions

// In src/hooks/useApiClient.ts - DELETE these functions:
- trackEvent()
- getDeviceInfo()
- detectBaseURL()
- getErrorMessage()

// In src/lib/storage.client.ts - DELETE:
- canCancelOrder()
```

**Impact:** -205 lines, cleaner API surface

#### Option 2: Mark as Deprecated (Conservative)
```typescript
/**
 * @deprecated Not currently used. Will be removed in next major version.
 * Use XYZ instead.
 */
export function getRecommendations() {
  // ...
}
```

**Impact:** Documents intent, allows gradual removal

---

### Phase 7: Optional Refactoring (2-3 hours) 🟢 LOW PRIORITY

1. **Create ModalWrapper component**
   - Extract common modal structure
   - Reduce ~200 lines of duplication
   - Improve consistency

2. **Review barrel exports**
   - Check if `src/components/ui/common/index.ts` is used
   - Remove if not needed

---

## 📝 Verification Checklist

Before deleting any code, verify:

- [ ] Run TypeScript compilation: `npm run build`
- [ ] Run tests: `npm test` (if tests exist)
- [ ] Search for dynamic imports: `grep -r "import(" src/`
- [ ] Check for string-based imports: `grep -r "require(" src/`
- [ ] Review git history for context
- [ ] Create backup branch: `git checkout -b cleanup/dead-code`

---

## 🚀 Next Steps

1. **Review this analysis** with the team
2. **Execute Phase 5** (delete dead files) - 5 minutes
3. **Execute Phase 6** (remove unused exports) - 30 minutes
4. **Test thoroughly** after each phase
5. **Commit changes** with clear messages
6. **Update documentation** if needed

---

**Analysis Complete** ✅  
**Ready for Cleanup** 🚀  
**Estimated Time:** 35-40 minutes  
**Expected Impact:** -1,040 lines, cleaner codebase, smaller bundle
