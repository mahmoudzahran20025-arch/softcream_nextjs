# ✅ تحديث عرض الـ Customization في السلة

## المشكلة
الـ CartItem كان بيعرض الـ legacy addons بس، لكن مش بيعرض الـ BYO customization selections.

## الحل

### 1. تحديث CartItem.tsx ✅

#### إضافة دعم الـ customization selections:

```tsx
interface CartItemData {
  productId: string
  quantity: number
  selectedAddons?: string[]
  selections?: Record<string, string[]> // ✅ NEW: BYO selections
}

interface CartItemProps {
  // ...
  customizationOptions?: any[] // ✅ NEW: Array of BYO options
  onUpdateQuantity: (productId, quantity, addons?, selections?) => void
  onRemove: (productId, addons?, selections?) => void
}
```

#### حساب السعر الصحيح:

```tsx
// Legacy addons total
const addonsTotal = (item.selectedAddons || []).reduce(...)

// ✅ NEW: BYO customization total
const customizationTotal = item.selections 
  ? Object.values(item.selections).flat().reduce((sum, optionId) => {
      const option = customizationOptions.find(o => o.id === optionId)
      return sum + (option?.price || 0)
    }, 0)
  : 0

// Total = base + addons + customization
const itemTotal = (product.price + addonsTotal + customizationTotal) * item.quantity
```

#### عرض الـ selections بتصميم جميل:

```tsx
{/* BYO Customization Selections */}
{isCustomizable && (
  <div className="flex flex-wrap gap-1.5 mt-2">
    {Object.values(item.selections!).flat().map((optionId) => {
      const option = customizationOptions.find(o => o.id === optionId)
      const isFree = option.price === 0
      
      return (
        <span className={isFree ? 'green-badge' : 'purple-badge'}>
          {option.groupIcon} {option.name}
          {isFree ? '✨ مجاناً' : `(+${option.price} ج.م)`}
        </span>
      )
    })}
  </div>
)}

{/* Legacy Addons (for non-customizable products) */}
{!isCustomizable && item.selectedAddons && ...}
```

### 2. تحديث CartModal/index.tsx ✅

#### بناء customizationOptions من الـ rules:

```tsx
{cart.map((item, index) => {
  const productWithAddons = productsWithAddons.get(item.productId)
  const customizationRules = productWithAddons?.customizationRules || []
  
  // ✅ Build flat array of all options
  const customizationOptions: any[] = []
  customizationRules.forEach((group: any) => {
    group.options.forEach((option: any) => {
      customizationOptions.push({
        id: option.id,
        name: option.name_ar,
        price: option.price || option.base_price || 0,
        groupIcon: group.groupIcon
      })
    })
  })
  
  return (
    <CartItem
      item={item}
      product={product}
      addons={productAddons}
      customizationOptions={customizationOptions} // ✅ Pass to CartItem
      onUpdateQuantity={updateCartQuantity}
      onRemove={removeFromCart}
    />
  )
})}
```

## التصميم الجديد

### مثال: منتج مخصص في السلة

```
┌─────────────────────────────────────────────────────┐
│ 🍦 [صورة]  كوب سوفت سيرف مخصص        58 ج.م      │
│             45 ج.م                                  │
│                                                     │
│  🍦 فراولة ✨ مجاناً                               │
│  🍦 مانجو ✨ مجاناً                                │
│  🍫 صوص شوكولاتة (+5 ج.م)                         │
│  🍪 أوريو مفتت (+8 ج.م)                           │
│                                                     │
│  [- 1 +]  [🗑️]                                     │
└─────────────────────────────────────────────────────┘
```

### الألوان:

- **خيارات مجانية** (0 ج.م): 
  - 🟢 Green badge: `bg-green-50 text-green-700 border-green-200`
  - ✨ أيقونة sparkles

- **خيارات مدفوعة** (> 0 ج.م):
  - 🟣 Purple badge: `bg-purple-50 text-purple-700 border-purple-200`
  - السعر بين قوسين: `(+5 ج.م)`

- **Group Icons**:
  - 🍦 للنكهات
  - 🍫 للصوصات
  - 🍪 للإضافات المقرمشة

## الفرق بين Legacy و BYO

### Legacy Addons (المنتجات القديمة):
```tsx
selectedAddons: ["addon_1", "addon_2"]
```
- يظهر بـ purple badges
- بدون group icons
- السعر بين قوسين

### BYO Customization (المنتجات الجديدة):
```tsx
selections: {
  "flavors": ["vanilla_flavor", "mango_flavor"],
  "sauces": ["chocolate_sauce"],
  "dry_toppings": ["oreo_crumble"]
}
```
- يظهر بـ green badges (مجاني) أو purple badges (مدفوع)
- مع group icons (🍦 🍫 🍪)
- "✨ مجاناً" للخيارات المجانية

## الملفات المعدلة

1. ✅ `src/components/modals/CartModal/CartItem.tsx`
   - إضافة دعم `selections` و `customizationOptions`
   - حساب `customizationTotal`
   - عرض الـ selections بتصميم جميل
   - تمرير `selections` للـ callbacks

2. ✅ `src/components/modals/CartModal/index.tsx`
   - بناء `customizationOptions` من الـ `customizationRules`
   - تمرير `customizationOptions` للـ `CartItem`
   - تحديث الـ `itemKey` ليشمل الـ selections

## الاختبار

### Test 1: منتج مخصص في السلة
1. أضف `soft_serve_cup` مع خيارات
2. افتح السلة
3. **المتوقع:**
   - ✅ الخيارات تظهر مع الـ icons
   - ✅ الخيارات المجانية بـ green badge + ✨
   - ✅ الخيارات المدفوعة بـ purple badge + السعر
   - ✅ السعر الإجمالي صحيح

### Test 2: منتج legacy في السلة
1. أضف منتج عادي مع addons
2. افتح السلة
3. **المتوقع:**
   - ✅ الـ addons تظهر بـ purple badges
   - ✅ السعر صحيح

### Test 3: منتجين مختلفين
1. أضف منتج مخصص + منتج legacy
2. افتح السلة
3. **المتوقع:**
   - ✅ كل منتج يعرض خياراته بشكل صحيح
   - ✅ الإجمالي صحيح

## Console Logs للتشخيص

```
💰 Cart calculation: {productsCount: 2, addonsCount: 5, optionsCount: 18}
💰 Customization total for soft_serve_cup: 13
```

## الخطوة التالية

جرب دلوقتي وتأكد إن:
1. ✅ الخيارات بتظهر في السلة
2. ✅ الألوان صحيحة (green للمجاني، purple للمدفوع)
3. ✅ الـ icons بتظهر (🍦 🍫 🍪)
4. ✅ السعر الإجمالي صحيح
