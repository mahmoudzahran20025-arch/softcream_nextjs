# 🪝 Custom Hooks

This directory contains reusable custom React hooks for the application.

---

## 📄 Available Hooks

### 1. **useAddToCart.ts** ✅ NEW
Unified add-to-cart logic for all product types.

**Purpose:** Single source of truth for cart operations

**Features:**
- Handles BYO products (containers + sizes + customizations)
- Handles preset products (sizes only)
- Handles legacy products (simple addons)
- Built-in validation with toast notifications
- Type-safe

**Usage:**
```typescript
import { useAddToCart } from '@/hooks/useAddToCart'

const { handleAddToCart, canAdd, validationErrors } = useAddToCart({
  product: displayProduct,
  quantity,
  productConfig: productConfig.hasContainers ? productConfig : null,
  customization: customization.isCustomizable ? customization : null,
  legacy: { selectedAddons, totalPrice },
  onSuccess: () => closeModal()
})

// In button
<button onClick={handleAddToCart} disabled={!canAdd}>
  Add to Cart
</button>
```

---

### 2. **useProductConfiguration.ts** ✅
Product configuration for sizes, containers, and customizations.

**Purpose:** Manage BYO and configurable product state

**Features:**
- Fetches product configuration from API
- Manages container/size selection
- Calculates total price and nutrition
- Validates customization rules

**Usage:**
```typescript
import { useProductConfiguration } from '@/hooks/useProductConfiguration'

const productConfig = useProductConfiguration({
  productId: product.id,
  isOpen: true
})

// Access state
productConfig.hasContainers
productConfig.selectedSize
productConfig.totalPrice
productConfig.validationResult
```

---

### 3. **useWindowEvent.ts** ✅
Centralized window event listener management with automatic cleanup.

**Purpose:** Eliminate duplicate event listener boilerplate

**Usage:**
```typescript
import { useWindowEvent } from '@/hooks/useWindowEvent'

useWindowEvent('ordersUpdated', (event) => {
  console.log('Orders updated:', event.detail)
}, [])
```

---

### 4. **useHydrated.ts** ✅
Detect when component has hydrated on the client.

**Purpose:** Defer animations and client-only features until hydration completes

**Usage:**
```typescript
import { useHydrated } from '@/hooks/useHydrated'

const isHydrated = useHydrated()

return (
  <div>
    {isHydrated ? (
      <AnimatedComponent />
    ) : (
      <StaticPlaceholder />
    )}
  </div>
)
```

---

### 5. **useRotatingText.ts** ✅
Hook for rotating text with smooth transitions.

**Purpose:** Animated text rotation in ProductCard

**Usage:**
```typescript
import { useRotatingText } from '@/hooks/useRotatingText'

const { currentText, isTransitioning, currentIndex } = useRotatingText(
  ['Text 1', 'Text 2', 'Text 3'],
  3000 // interval in ms
)
```

---

### ❌ REMOVED HOOKS

- **useApiClient.ts** - Removed (was dead code, never used)
- **useOrderStatusSSE.ts** - Disabled (replaced by smart polling)

---

## 🎯 Hook Patterns

### Event Listeners
Use `useWindowEvent` for all window event listeners:

```typescript
// ❌ Don't do this
useEffect(() => {
  const handler = () => { /* ... */ }
  window.addEventListener('myEvent', handler)
  return () => window.removeEventListener('myEvent', handler)
}, [])

// ✅ Do this instead
useWindowEvent('myEvent', () => { /* ... */ }, [])
```

### API Calls
Use `useApiClient` for client-side API utilities:

```typescript
// ✅ Good
const { trackEvent } = useApiClient()
await trackEvent({ name: 'click', button: 'submit' })
```

### Hydration
Use `useHydrated` for client-only features:

```typescript
// ✅ Good
const isHydrated = useHydrated()
if (!isHydrated) return <Skeleton />
```

---

## 📝 Creating New Hooks

### Step 1: Create the hook file
```typescript
// src/hooks/useMyHook.ts
'use client'

import { useState, useEffect } from 'react'

export function useMyHook(param: string) {
  const [value, setValue] = useState<string>('')

  useEffect(() => {
    // Hook logic here
  }, [param])

  return value
}
```

### Step 2: Add JSDoc documentation
```typescript
/**
 * Custom hook for doing something useful
 * 
 * @param param - Description of parameter
 * @returns Description of return value
 * 
 * @example
 * ```typescript
 * const value = useMyHook('test')
 * ```
 */
export function useMyHook(param: string) {
  // ...
}
```

### Step 3: Add to this README
Update the "Available Hooks" section with your new hook.

### Step 4: Write tests (optional)
```typescript
// src/hooks/__tests__/useMyHook.test.ts
import { renderHook } from '@testing-library/react'
import { useMyHook } from '../useMyHook'

describe('useMyHook', () => {
  it('should work correctly', () => {
    const { result } = renderHook(() => useMyHook('test'))
    expect(result.current).toBe('test')
  })
})
```

---

## 🚫 Anti-Patterns

### ❌ Don't create hooks for everything
```typescript
// Bad - unnecessary hook
function useGetUserName(user: User) {
  return user.name
}

// Good - just use the value directly
const userName = user.name
```

### ❌ Don't put business logic in hooks
```typescript
// Bad - business logic in hook
function useCalculateTotal(items: Item[]) {
  return items.reduce((sum, item) => sum + item.price, 0)
}

// Good - use a utility function
function calculateTotal(items: Item[]) {
  return items.reduce((sum, item) => sum + item.price, 0)
}
```

### ❌ Don't create hooks that return nothing
```typescript
// Bad - side effect only
function useTrackPageView(page: string) {
  useEffect(() => {
    trackEvent({ page })
  }, [page])
}

// Good - just use useEffect directly
useEffect(() => {
  trackEvent({ page })
}, [page])
```

---

## ✅ Best Practices

### 1. **Name hooks with "use" prefix**
```typescript
// ✅ Good
useWindowEvent()
useApiClient()
useHydrated()

// ❌ Bad
windowEvent()
apiClient()
isHydrated()
```

### 2. **Make hooks reusable**
```typescript
// ✅ Good - flexible and reusable
function useWindowEvent<T>(eventName: string, handler: (e: CustomEvent<T>) => void) {
  // ...
}

// ❌ Bad - too specific
function useOrdersUpdatedEvent(handler: () => void) {
  // ...
}
```

### 3. **Add type safety**
```typescript
// ✅ Good - type-safe
function useWindowEvent<T = any>(
  eventName: string,
  handler: (event: CustomEvent<T>) => void
) {
  // ...
}

// ❌ Bad - no types
function useWindowEvent(eventName, handler) {
  // ...
}
```

### 4. **Document with JSDoc**
```typescript
// ✅ Good - well documented
/**
 * Custom hook for window events
 * @param eventName - Name of the event
 * @param handler - Event handler function
 */
function useWindowEvent() {
  // ...
}

// ❌ Bad - no documentation
function useWindowEvent() {
  // ...
}
```

### 5. **Handle cleanup**
```typescript
// ✅ Good - cleanup handled
useEffect(() => {
  const handler = () => { /* ... */ }
  window.addEventListener('event', handler)
  return () => window.removeEventListener('event', handler)
}, [])

// ❌ Bad - no cleanup (memory leak)
useEffect(() => {
  window.addEventListener('event', () => { /* ... */ })
}, [])
```

---

## 📚 Related Documentation

- [PHASE_4_COMPLETE.md](../../PHASE_4_COMPLETE.md) - useWindowEvent implementation
- [React Hooks Documentation](https://react.dev/reference/react) - Official React hooks docs
- [Custom Hooks Guide](https://react.dev/learn/reusing-logic-with-custom-hooks) - React custom hooks guide

---

## 🎯 Future Hooks

Potential hooks to create in the future:

- `useLocalStorage` - localStorage with sync across tabs
- `useMediaQuery` - responsive breakpoints
- `useDebounce` - debounced values
- `useThrottle` - throttled callbacks
- `useIntersectionObserver` - intersection observer
- `useClickOutside` - detect clicks outside element
- `useKeyPress` - keyboard shortcuts
- `usePrevious` - previous value tracking

---

**Last Updated:** November 22, 2025  
**Maintainer:** Development Team
