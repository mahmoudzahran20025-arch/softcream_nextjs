# 🎯 خطة العمل التنفيذية - المشاكل الحرجة والعالية

**تاريخ الإنشاء:** 24 نوفمبر 2025  
**المصدر:** FORENSIC_ANALYSIS_REPORT.md  
**الأولوية:** CRITICAL + HIGH فقط  
**المدة المتوقعة:** 2-3 أسابيع

---

## 📋 جدول المحتويات

1. [Phase 1: CRITICAL Fixes (Week 1)](#phase-1-critical-fixes-week-1)
2. [Phase 2: HIGH Priority (Week 2)](#phase-2-high-priority-week-2)
3. [Dependencies Map](#dependencies-map)
4. [Testing Strategy](#testing-strategy)
5. [Rollback Plan](#rollback-plan)

---

## 🔴 PHASE 1: CRITICAL FIXES (Week 1)

### Task 1.1: Create ModalManager with Zustand
**Priority:** CRITICAL  
**Effort:** 2-3 days  
**Dependencies:** None

#### الملفات المتأثرة:
```
✅ NEW FILES:
- src/stores/modalStore.ts (NEW)

🔧 MODIFIED FILES:
- src/components/pages/PageContentClient.tsx (MAJOR REFACTOR)
- src/providers/Providers.tsx (MINOR UPDATE)

❌ DEPRECATED:
- Custom events: 'open-my-orders-modal', 'openTrackingModal', etc.
```

#### خطوات التنفيذ:

**Step 1.1.1: إنشاء Modal Store**
```typescript
// src/stores/modalStore.ts
import { create } from 'zustand'

type ModalType = 
  | 'cart' 
  | 'checkout' 
  | 'tracking' 
  | 'myOrders' 
  | 'editOrder' 
  | 'success' 
  | 'product'
  | 'nutrition'
  | null

interface ModalState {
  current: ModalType
  data: any
  history: ModalType[]
  
  // Actions
  open: (type: ModalType, data?: any) => void
  close: () => void
  back: () => void
  replace: (type: ModalType, data?: any) => void
}

export const useModalStore = create<ModalState>((set) => ({
  current: null,
  data: null,
  history: [],
  
  open: (type, data) => set((state) => ({
    current: type,
    data,
    history: [...state.history, type]
  })),
  
  close: () => set({
    current: null,
    data: null
  }),
  
  back: () => set((state) => {
    const history = [...state.history]
    history.pop()
    const previous = history[history.length - 1] || null
    return {
      current: previous,
      history
    }
  }),
  
  replace: (type, data) => set({
    current: type,
    data
  })
}))
```


**Step 1.1.2: Refactor PageContentClient**
```typescript
// src/components/pages/PageContentClient.tsx (BEFORE: 300+ lines)
// AFTER: ~150 lines

'use client'

import { useModalStore } from '@/stores/modalStore'
import { useProductsData } from '@/providers/ProductsProvider'
import dynamic from 'next/dynamic'

// Dynamic imports (same as before)
const ProductModal = dynamic(() => import('@/components/modals/ProductModal'), { ssr: false })
const CartModal = dynamic(() => import('@/components/modals/CartModal'), { ssr: false })
// ... other modals

export default function PageContentClient({ children }: { children?: ReactNode }) {
  const { products, selectedProduct, closeProduct } = useProductsData()
  const { current, data, open, close } = useModalStore()
  
  // ✅ SIMPLIFIED: No more 15+ useState hooks!
  
  return (
    <>
      <Header
        onOpenSidebar={() => open('sidebar')}
        onOpenCart={() => open('cart')}
      />
      
      {children}
      
      {/* Conditional rendering based on store */}
      {current === 'cart' && <CartModal isOpen onClose={close} onCheckout={() => open('checkout')} />}
      {current === 'checkout' && <CheckoutModal isOpen onClose={close} onCheckoutSuccess={(orderId, orderData) => open('success', orderData)} />}
      {current === 'success' && data && <OrderSuccessModal isOpen onClose={close} order={data} />}
      {/* ... other modals */}
    </>
  )
}
```

**Step 1.1.3: Remove Custom Events**
```typescript
// ❌ DELETE these event dispatches:
// src/components/ui/OrdersBadge.tsx
- window.dispatchEvent(new CustomEvent('open-my-orders-modal'))

// src/components/pages/PageContentClient.tsx
- window.addEventListener('open-my-orders-modal', ...)
- window.addEventListener('openTrackingModal', ...)
- window.addEventListener('orderStatusUpdate', ...)

// ✅ REPLACE with:
import { useModalStore } from '@/stores/modalStore'
const { open } = useModalStore()
open('myOrders')
```

#### Testing Checklist:
- [ ] All modals open correctly
- [ ] Modal history works (back button)
- [ ] No memory leaks (event listeners removed)
- [ ] Modal data passes correctly
- [ ] Close modal works from all modals



---

### Task 1.2: Split ThemeProvider (SRP)
**Priority:** CRITICAL  
**Effort:** 1 day  
**Dependencies:** None

#### الملفات المتأثرة:
```
✅ NEW FILES:
- src/providers/LanguageProvider.tsx (NEW)
- src/providers/ToastProvider.tsx (NEW)

🔧 MODIFIED FILES:
- src/providers/ThemeProvider.tsx (MAJOR REFACTOR - 300 lines → 100 lines)
- src/providers/Providers.tsx (UPDATE wrapper)

📦 KEEP AS IS:
- src/data/translations-data.ts
- src/data/translations-data-additions.ts
```

#### خطوات التنفيذ:

**Step 1.2.1: Create LanguageProvider**
```typescript
// src/providers/LanguageProvider.tsx
'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { storage } from '@/lib/storage.client'

interface LanguageContextType {
  language: 'ar' | 'en'
  setLanguage: (lang: 'ar' | 'en') => void
  toggleLanguage: () => void
  isRTL: boolean
  t: (key: string, params?: Record<string, any>) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) throw new Error('useLanguage must be used within LanguageProvider')
  return context
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<'ar' | 'en'>('ar')
  const [translations, setTranslations] = useState<any>(null)
  
  // Load translations
  useEffect(() => {
    import('@/data/translations-data').then(module => {
      setTranslations(module.translationsData)
    })
  }, [])
  
  // Hydrate from storage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = storage.getLang() as 'ar' | 'en'
      if (saved) setLanguageState(saved)
    }
  }, [])
  
  const setLanguage = useCallback((newLang: 'ar' | 'en') => {
    setLanguageState(newLang)
    storage.setLang(newLang)
    document.documentElement.lang = newLang
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr'
  }, [])
  
  const toggleLanguage = useCallback(() => {
    setLanguage(language === 'ar' ? 'en' : 'ar')
  }, [language, setLanguage])
  
  const t = useCallback((key: string, params: Record<string, any> = {}) => {
    if (!translations) return key
    const translation = translations[language]?.[key]
    if (!translation) return key
    
    let result = translation
    Object.keys(params).forEach(param => {
      result = result.replace(`{{${param}}}`, params[param])
    })
    return result
  }, [language, translations])
  
  return (
    <LanguageContext.Provider value={{
      language,
      setLanguage,
      toggleLanguage,
      isRTL: language === 'ar',
      t
    }}>
      {children}
    </LanguageContext.Provider>
  )
}
```



**Step 1.2.2: Create ToastProvider**
```typescript
// src/providers/ToastProvider.tsx
'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

interface Toast {
  id: number
  type: 'info' | 'success' | 'warning' | 'error'
  title?: string
  message: string
  duration?: number
}

interface ToastContextType {
  toasts: Toast[]
  showToast: (options: Omit<Toast, 'id'>) => number
  removeToast: (id: number) => void
  clearToasts: () => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used within ToastProvider')
  return context
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  
  const showToast = useCallback((options: Omit<Toast, 'id'>) => {
    const id = Date.now() + Math.random()
    const newToast: Toast = { id, ...options, duration: options.duration || 5000 }
    setToasts(prev => [...prev, newToast])
    return id
  }, [])
  
  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])
  
  const clearToasts = useCallback(() => {
    setToasts([])
  }, [])
  
  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast, clearToasts }}>
      {children}
    </ToastContext.Provider>
  )
}
```

**Step 1.2.3: Refactor ThemeProvider**
```typescript
// src/providers/ThemeProvider.tsx (AFTER: ~100 lines)
'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { storage } from '@/lib/storage.client'

interface ThemeContextType {
  theme: 'light' | 'dark'
  setTheme: (theme: 'light' | 'dark') => void
  toggleTheme: () => void
  isDark: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used within ThemeProvider')
  return context
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<'light' | 'dark'>('light')
  
  // Hydrate from storage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = storage.getTheme() as 'light' | 'dark'
      if (saved) setThemeState(saved)
    }
  }, [])
  
  const setTheme = useCallback((newTheme: 'light' | 'dark') => {
    setThemeState(newTheme)
    storage.setTheme(newTheme)
    
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark')
      document.body.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
      document.body.classList.remove('dark')
    }
  }, [])
  
  const toggleTheme = useCallback(() => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }, [theme, setTheme])
  
  return (
    <ThemeContext.Provider value={{
      theme,
      setTheme,
      toggleTheme,
      isDark: theme === 'dark'
    }}>
      {children}
    </ThemeContext.Provider>
  )
}
```

**Step 1.2.4: Update Providers Wrapper**
```typescript
// src/providers/Providers.tsx
'use client'

import { ReactNode } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/queryClient'
import { ThemeProvider } from './ThemeProvider'
import { LanguageProvider } from './LanguageProvider'
import { ToastProvider } from './ToastProvider'
import CartProvider from './CartProvider'

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          <ToastProvider>
            <CartProvider>
              {children}
            </CartProvider>
          </ToastProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
```

**Step 1.2.5: Update All Imports**
```typescript
// ❌ OLD:
import { useGlobal } from '@/providers/ThemeProvider'
const { language, t, showToast } = useGlobal()

// ✅ NEW:
import { useTheme } from '@/providers/ThemeProvider'
import { useLanguage } from '@/providers/LanguageProvider'
import { useToast } from '@/providers/ToastProvider'

const { isDark, toggleTheme } = useTheme()
const { language, t } = useLanguage()
const { showToast } = useToast()
```

#### Testing Checklist:
- [ ] Theme switching works
- [ ] Language switching works
- [ ] Translations load correctly
- [ ] Toasts display correctly
- [ ] No re-render issues
- [ ] All components updated

---

### Task 1.3: Replace Custom Events with Zustand
**Priority:** CRITICAL  
**Effort:** 2 days  
**Dependencies:** Task 1.1 (ModalStore)

#### الملفات المتأثرة:
```
✅ NEW FILES:
- src/stores/ordersStore.ts (NEW)

🔧 MODIFIED FILES:
- src/lib/storage.client.ts (REMOVE event system - 500 lines → 350 lines)
- src/components/ui/OrdersBadge.tsx (USE store instead of events)
- src/components/modals/MyOrdersModal/index.tsx (USE store)
- src/components/modals/CheckoutModal/useCheckoutLogic.ts (USE store)
- src/providers/CartProvider.tsx (USE store)

❌ DEPRECATED:
- OrdersEventManager class (DELETE)
- Custom events: 'ordersUpdated', 'react-cart-updated'
- window.dispatchEvent() calls
- window.addEventListener() calls
```

#### خطوات التنفيذ:

**Step 1.3.1: Create Orders Store**
```typescript
// src/stores/ordersStore.ts
import { create } from 'zustand'
import { storage } from '@/lib/storage.client'

interface Order {
  id: string
  status: string
  items: any[]
  total: number
  createdAt: string
  // ... other fields
}

interface OrdersState {
  orders: Order[]
  activeCount: number
  
  // Actions
  loadOrders: () => void
  addOrder: (order: Order) => void
  updateOrder: (id: string, updates: Partial<Order>) => void
  deleteOrder: (id: string) => void
  clearOrders: () => void
}

export const useOrdersStore = create<OrdersState>((set, get) => ({
  orders: [],
  activeCount: 0,
  
  loadOrders: () => {
    const orders = storage.getOrders()
    const activeCount = storage.getActiveOrdersCount()
    set({ orders, activeCount })
  },
  
  addOrder: (order) => {
    storage.addOrder(order)
    get().loadOrders()
  },
  
  updateOrder: (id, updates) => {
    storage.updateOrder(id, updates)
    get().loadOrders()
  },
  
  deleteOrder: (id) => {
    storage.deleteOrder(id)
    get().loadOrders()
  },
  
  clearOrders: () => {
    storage.clearOrders()
    set({ orders: [], activeCount: 0 })
  }
}))
```

**Step 1.3.2: Simplify storage.client.ts**
```typescript
// src/lib/storage.client.ts (REMOVE event system)

// ❌ DELETE:
class OrdersEventManager {
  // ... entire class
}

// ❌ DELETE:
triggerOrdersUpdate(orderId, action, count) {
  this.eventManager.triggerUpdate({ ... })
}

// ✅ KEEP: Only storage operations
addOrder(orderData: any): boolean {
  const orders = this.getOrders()
  orders.unshift(orderData)
  return this.local.set(STORAGE_KEYS.USER_ORDERS, orders)
  // NO EVENT DISPATCH
}
```

**Step 1.3.3: Update OrdersBadge**
```typescript
// src/components/ui/OrdersBadge.tsx

// ❌ OLD:
useEffect(() => {
  const handleOrdersUpdated = () => {
    const count = storage.getActiveOrdersCount()
    setActiveOrdersCount(count)
  }
  window.addEventListener('ordersUpdated', handleOrdersUpdated)
  return () => window.removeEventListener('ordersUpdated', handleOrdersUpdated)
}, [])

// ✅ NEW:
import { useOrdersStore } from '@/stores/ordersStore'

const { activeCount, loadOrders } = useOrdersStore()

useEffect(() => {
  loadOrders()
}, [loadOrders])

// Display activeCount directly (no events needed)
```

#### Testing Checklist:
- [ ] Orders badge updates correctly
- [ ] No memory leaks (event listeners removed)
- [ ] Orders persist in localStorage
- [ ] All order operations work
- [ ] Performance improved (no event overhead)

---

## 🟠 PHASE 2: HIGH PRIORITY (Week 2)

### Task 2.1: Simplify useCheckoutLogic
**Priority:** HIGH  
**Effort:** 2 days  
**Dependencies:** Task 1.3 (OrdersStore)

#### الملفات المتأثرة:
```
✅ NEW FILES:
- src/hooks/checkout/useCheckoutForm.ts (NEW)
- src/hooks/checkout/useDeliveryOptions.ts (NEW)
- src/hooks/checkout/useLocationPicker.ts (NEW)
- src/hooks/checkout/useCouponValidation.ts (NEW)
- src/hooks/checkout/usePriceCalculation.ts (NEW)
- src/hooks/checkout/useOrderSubmission.ts (NEW)

🔧 MODIFIED FILES:
- src/components/modals/CheckoutModal/useCheckoutLogic.ts (500 lines → 100 lines)

📦 KEEP AS IS:
- src/components/modals/CheckoutModal/validation.ts
```

#### خطوات التنفيذ:

**Step 2.1.1: Create useCheckoutForm**
```typescript
// src/hooks/checkout/useCheckoutForm.ts
import { useState, useCallback } from 'react'
import { validateForm } from '@/components/modals/CheckoutModal/validation'

export function useCheckoutForm() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error on change
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }, [errors])
  
  const validate = useCallback(() => {
    const validationErrors = validateForm(formData)
    setErrors(validationErrors)
    return Object.keys(validationErrors).length === 0
  }, [formData])
  
  return {
    formData,
    errors,
    handleInputChange,
    validate
  }
}
```

**Step 2.1.2: Create useDeliveryOptions**
```typescript
// src/hooks/checkout/useDeliveryOptions.ts
import { useState, useEffect } from 'react'
import { getBranches } from '@/lib/api'

export function useDeliveryOptions() {
  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup' | null>(null)
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null)
  const [branches, setBranches] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    if (deliveryMethod === 'pickup') {
      setLoading(true)
      getBranches()
        .then(setBranches)
        .catch(err => setError(err.message))
        .finally(() => setLoading(false))
    }
  }, [deliveryMethod])
  
  return {
    deliveryMethod,
    setDeliveryMethod,
    selectedBranch,
    setSelectedBranch,
    branches,
    loading,
    error
  }
}
```

**Step 2.1.3: Refactor useCheckoutLogic (Main Hook)**
```typescript
// src/components/modals/CheckoutModal/useCheckoutLogic.ts (AFTER: ~100 lines)
import { useCheckoutForm } from '@/hooks/checkout/useCheckoutForm'
import { useDeliveryOptions } from '@/hooks/checkout/useDeliveryOptions'
import { useLocationPicker } from '@/hooks/checkout/useLocationPicker'
import { useCouponValidation } from '@/hooks/checkout/useCouponValidation'
import { usePriceCalculation } from '@/hooks/checkout/usePriceCalculation'
import { useOrderSubmission } from '@/hooks/checkout/useOrderSubmission'

export function useCheckoutLogic({ isOpen, onClose, onCheckoutSuccess }) {
  const form = useCheckoutForm()
  const delivery = useDeliveryOptions()
  const location = useLocationPicker()
  const coupon = useCouponValidation()
  const prices = usePriceCalculation({
    deliveryMethod: delivery.deliveryMethod,
    location: location.userLocation,
    couponCode: coupon.couponCode
  })
  const submission = useOrderSubmission({
    formData: form.formData,
    deliveryMethod: delivery.deliveryMethod,
    selectedBranch: delivery.selectedBranch,
    location: location.userLocation,
    couponCode: coupon.couponCode,
    onSuccess: onCheckoutSuccess
  })
  
  return {
    // Form
    ...form,
    // Delivery
    ...delivery,
    // Location
    ...location,
    // Coupon
    ...coupon,
    // Prices
    ...prices,
    // Submission
    ...submission
  }
}
```

#### Testing Checklist:
- [ ] Form validation works
- [ ] Delivery options load correctly
- [ ] GPS location works
- [ ] Coupon validation works
- [ ] Price calculation correct
- [ ] Order submission successful
- [ ] All hooks independent and testable

---

### Task 2.2: Remove Admin Smart Polling Over-Engineering
**Priority:** HIGH  
**Effort:** 1 day  
**Dependencies:** None

#### الملفات المتأثرة:
```
🔧 MODIFIED FILES:
- src/lib/adminApi.ts (800 lines → 500 lines)
- src/components/admin/AdminApp.tsx (SIMPLIFY polling)

❌ DEPRECATED:
- SmartPollingManager class (DELETE)
- Activity tracking logic (DELETE)
- Request queue management (DELETE)
```

#### خطوات التنفيذ:

**Step 2.2.1: Simplify adminApi.ts**
```typescript
// src/lib/adminApi.ts

// ❌ DELETE:
class SmartPollingManager {
  // ... entire class (200+ lines)
}

// ✅ REPLACE with simple polling:
export function useAdminPolling(interval = 5000) {
  const { refetch } = useQuery({
    queryKey: ['admin', 'orders'],
    queryFn: getOrders,
    refetchInterval: interval
  })
  
  return { refetch }
}
```

**Step 2.2.2: Update AdminApp**
```typescript
// src/components/admin/AdminApp.tsx

// ❌ OLD:
const ordersPolling = new OrdersPolling((newOrders) => {
  setOrders(newOrders)
})
ordersPolling.start()

// ✅ NEW:
const { data: orders } = useQuery({
  queryKey: ['admin', 'orders'],
  queryFn: getOrders,
  refetchInterval: 5000 // Simple 5s polling
})
```

#### Testing Checklist:
- [ ] Admin orders update every 5s
- [ ] No performance issues
- [ ] Memory usage reduced
- [ ] Code simpler and maintainable

---

### Task 2.3: Delete Dead Code (Dynamic Route)
**Priority:** HIGH  
**Effort:** 10 minutes  
**Dependencies:** None

#### الملفات المتأثرة:
```
❌ DELETE:
- src/app/products/[id]/ (empty folder)
```

#### خطوات التنفيذ:

**Step 2.3.1: Delete Empty Folder**
```bash
# PowerShell
Remove-Item -Path "src/app/products" -Recurse -Force
```

**Step 2.3.2: Verify No References**
```bash
# Search for any references
rg "products/\[id\]" --type ts --type tsx
```

#### Testing Checklist:
- [ ] No broken imports
- [ ] App still builds
- [ ] No routing errors

---

### Task 2.4: Fix Context Boundaries Inconsistency
**Priority:** HIGH  
**Effort:** 30 minutes  
**Dependencies:** None

#### الملفات المتأثرة:
```
🔧 MODIFIED FILES:
- src/components/pages/PageContent.tsx (REMOVE CategoryTrackingProvider)
- src/providers/Providers.tsx (ADD CategoryTrackingProvider)
```

#### خطوات التنفيذ:

**Step 2.4.1: Move Provider to Providers.tsx**
```typescript
// src/providers/Providers.tsx
import { CategoryTrackingProvider } from './CategoryTrackingProvider'

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          <ToastProvider>
            <CategoryTrackingProvider>
              <CartProvider>
                {children}
              </CartProvider>
            </CategoryTrackingProvider>
          </ToastProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
```

**Step 2.4.2: Remove from PageContent**
```typescript
// src/components/pages/PageContent.tsx

// ❌ REMOVE:
<CategoryTrackingProvider>
  <PageContentClient>
    {/* ... */}
  </PageContentClient>
</CategoryTrackingProvider>

// ✅ KEEP:
<PageContentClient>
  {/* ... */}
</PageContentClient>
```

#### Testing Checklist:
- [ ] Category tracking still works
- [ ] No re-render issues
- [ ] Consistent with other providers

---

## 📊 DEPENDENCIES MAP

```
Phase 1 (Week 1):
├── Task 1.1: ModalManager ✅ (No dependencies)
├── Task 1.2: Split ThemeProvider ✅ (No dependencies)
└── Task 1.3: Replace Events → Depends on Task 1.1

Phase 2 (Week 2):
├── Task 2.1: Simplify useCheckoutLogic → Depends on Task 1.3
├── Task 2.2: Remove Smart Polling ✅ (No dependencies)
├── Task 2.3: Delete Dead Code ✅ (No dependencies)
└── Task 2.4: Fix Context Boundaries ✅ (No dependencies)
```

---

## 🧪 TESTING STRATEGY

### Unit Tests (After Each Task)
```typescript
// Example: Test ModalStore
describe('ModalStore', () => {
  it('should open modal', () => {
    const { result } = renderHook(() => useModalStore())
    act(() => {
      result.current.open('cart')
    })
    expect(result.current.current).toBe('cart')
  })
  
  it('should close modal', () => {
    const { result } = renderHook(() => useModalStore())
    act(() => {
      result.current.open('cart')
      result.current.close()
    })
    expect(result.current.current).toBeNull()
  })
})
```

### Integration Tests (After Phase Completion)
```typescript
// Example: Test Modal Flow
describe('Modal Flow', () => {
  it('should open cart → checkout → success', async () => {
    render(<App />)
    
    // Open cart
    fireEvent.click(screen.getByLabelText('Open cart'))
    expect(screen.getByText('سلة الطلبات')).toBeInTheDocument()
    
    // Checkout
    fireEvent.click(screen.getByText('تأكيد الطلب'))
    expect(screen.getByText('تأكيد الطلب')).toBeInTheDocument()
    
    // Submit
    fireEvent.click(screen.getByText('تأكيد الطلب'))
    await waitFor(() => {
      expect(screen.getByText('تم الطلب بنجاح')).toBeInTheDocument()
    })
  })
})
```

### E2E Tests (After All Phases)
```typescript
// Example: Playwright E2E
test('complete checkout flow', async ({ page }) => {
  await page.goto('/')
  
  // Add to cart
  await page.click('[data-testid="add-to-cart"]')
  
  // Open cart
  await page.click('[data-testid="cart-button"]')
  
  // Checkout
  await page.click('[data-testid="checkout-button"]')
  
  // Fill form
  await page.fill('[name="name"]', 'Test User')
  await page.fill('[name="phone"]', '01234567890')
  
  // Submit
  await page.click('[data-testid="submit-order"]')
  
  // Verify success
  await expect(page.locator('text=تم الطلب بنجاح')).toBeVisible()
})
```

---

## 🔄 ROLLBACK PLAN

### If Task Fails:
1. **Git Revert:** `git revert <commit-hash>`
2. **Restore Backup:** Copy from `/backup` folder
3. **Document Issue:** Add to `ROLLBACK_LOG.md`

### Backup Strategy:
```bash
# Before each task
git checkout -b backup/task-1.1
git commit -am "Backup before Task 1.1"

# After task completion
git checkout main
git merge backup/task-1.1
```

### Critical Files to Backup:
- `src/components/pages/PageContentClient.tsx`
- `src/providers/ThemeProvider.tsx`
- `src/lib/storage.client.ts`
- `src/lib/adminApi.ts`

---

## 📈 PROGRESS TRACKING

### Week 1 Progress:
- [ ] Task 1.1: ModalManager (Day 1-3)
- [ ] Task 1.2: Split ThemeProvider (Day 4)
- [ ] Task 1.3: Replace Events (Day 5-6)

### Week 2 Progress:
- [ ] Task 2.1: Simplify useCheckoutLogic (Day 1-2)
- [ ] Task 2.2: Remove Smart Polling (Day 3)
- [ ] Task 2.3: Delete Dead Code (Day 3)
- [ ] Task 2.4: Fix Context Boundaries (Day 3)

### Success Criteria:
- ✅ All tests passing
- ✅ No performance regression
- ✅ Code coverage > 80%
- ✅ Bundle size reduced by 10%
- ✅ No memory leaks

---

**End of Action Plan**

*Generated by Kiro AI Agent - November 24, 2025*  
*Based on FORENSIC_ANALYSIS_REPORT.md*
