# 🛒 CartModal System

## Overview

نظام سلة التسوق المركزي للتطبيق. يدعم المنتجات العادية والمنتجات القابلة للتخصيص (BYO).

## File Structure

```
CartModal/
├── index.tsx          # المكون الرئيسي
├── CartItem.tsx       # عنصر المنتج في السلة
├── CartSummary.tsx    # ملخص السلة وزر الدفع
└── README.md          # هذا الملف
```

## Dependencies

### Providers
```typescript
import { useCart } from '@/providers/CartProvider'
```

### Utilities
```typescript
import { debug } from '@/lib/debug'
import { getProduct, getCustomizationRules } from '@/lib/api'
```

### Related Files
| File | Purpose |
|------|---------|
| `providers/CartProvider.tsx` | إدارة حالة السلة |
| `lib/utils/priceCalculator.ts` | حسابات الأسعار |
| `lib/utils/nutritionCalculator.ts` | حسابات القيم الغذائية |
| `stores/modalStore.ts` | التحكم في فتح/إغلاق الـ Modal |

## Usage

### Basic Usage (with ModalOrchestrator)
```tsx
// في ModalOrchestrator.tsx
{current === 'cart' && (
  <CartModal
    isOpen={true}
    onClose={close}
    onCheckout={() => open('checkout')}
    allProducts={allProducts}
  />
)}
```

### Direct Usage
```tsx
import CartModal from '@/components/modals/CartModal'

<CartModal
  isOpen={isCartOpen}
  onClose={() => setIsCartOpen(false)}
  onCheckout={handleCheckout}
  allProducts={products}
/>
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `isOpen` | `boolean` | ✅ | حالة فتح/إغلاق الـ Modal |
| `onClose` | `() => void` | ✅ | دالة الإغلاق |
| `onCheckout` | `() => void` | ❌ | دالة الانتقال للدفع |
| `allProducts` | `Product[]` | ❌ | قائمة المنتجات للحسابات |

## Cart Item Structure

```typescript
interface CartItem {
  productId: string
  quantity: number
  selectedAddons?: string[]           // Legacy addons
  selections?: {
    _container?: [id, name, price]    // الحاوية المختارة
    _size?: [id, name, price]         // الحجم المختار
    _calculatedPrice?: [totalPrice]   // السعر المحسوب مسبقاً
    [groupId: string]: string[]       // خيارات التخصيص
  }
}
```

## Features

### ✅ Optimizations Applied
- `useMemo` للحسابات (منع re-renders)
- `useRef` لتتبع المنتجات المحملة (منع duplicate API calls)
- `debug.cart()` للـ logging (development only)

### ✅ Supported Product Types
1. **Regular Products** - منتجات عادية بدون تخصيص
2. **Products with Addons** - منتجات مع إضافات (Legacy)
3. **BYO Products** - منتجات قابلة للتخصيص الكامل

### ✅ Calculations
- **Price**: يدعم السعر المحسوب مسبقاً (`_calculatedPrice`) أو الحساب اليدوي
- **Nutrition**: يحسب القيم الغذائية من المنتج + التخصيصات

## Data Flow

```
┌─────────────────────────────────────────────────────────┐
│                    CartModal                             │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  1. useCart() ──────────► cart items                    │
│                                                          │
│  2. useEffect ──────────► fetch customization rules     │
│     (on cart change)      for BYO products              │
│                                                          │
│  3. useMemo ────────────► calculate nutrition           │
│     (cart + products)     calculate total price         │
│                                                          │
│  4. Render ─────────────► CartItem (for each item)      │
│                           CartSummary (total + checkout) │
│                           NutritionCard (if data)       │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## CartProvider Integration

```typescript
// CartProvider يوفر:
const {
  cart,                    // قائمة العناصر
  addToCart,               // إضافة منتج
  removeFromCart,          // حذف منتج
  updateCartQuantity,      // تحديث الكمية
  clearCart,               // تفريغ السلة
  getCartCount,            // عدد العناصر
  getCartTotal,            // الإجمالي
} = useCart()
```

## Debugging

```typescript
// في development فقط
debug.cart('Cart calculation', {
  productsCount: 20,
  addonsCount: 0,
  optionsCount: 3
})

// Output:
// 🛒 [CART] Cart calculation { productsCount: 20, ... }
```

## Performance Notes

### Before Optimization
```
- 8+ re-renders on modal open
- console.log in render body
- calculations in render body
```

### After Optimization
```
- 2-3 re-renders only
- debug.cart() in useEffect
- all calculations in useMemo
```

## Related Components

| Component | Description |
|-----------|-------------|
| `NutritionCard` | عرض ملخص القيم الغذائية |
| `QuantitySelector` | التحكم في الكمية |
| `PriceDisplay` | عرض السعر بالتنسيق الصحيح |
| `CheckoutModal` | الانتقال للدفع |

## Recent Updates

### ✅ December 2025
- استخدام `nutritionCalculator` من `lib/utils/nutritionCalculator`
- تحسين الـ performance باستخدام `useMemo` و `useRef`
- استخدام `debug.cart()` بدلاً من `console.log`

## Future Improvements

- [ ] إضافة animations للإضافة/الحذف
- [ ] دعم الـ offline mode
- [ ] تحسين الـ accessibility
- [ ] إضافة unit tests
