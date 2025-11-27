# ✅ إصلاح حساب السعر في الـ Checkout

## المشكلة
الـ Checkout كان بيبعت للـ API بس `productId` و `quantity` **بدون الـ `selections`**، عشان كده الـ Backend مش كان بيحسب سعر الـ customization.

**مثال:**
- سعر المنتج الأساسي: 45 ج.م
- الخيارات: صوص شوكولاتة (5 ج.م) + أوريو (8 ج.م) = 13 ج.م
- **المتوقع:** 45 + 13 = 58 ج.م
- **الفعلي:** 45 ج.م فقط ❌

## الحل

### 1. Frontend: useCheckoutLogic.ts ✅

#### إضافة selections في calculateOrderPrices:

```tsx
// ❌ BEFORE
const pricesData = await calculateOrderPrices(
  cart.map(item => ({
    productId: item.productId,
    quantity: item.quantity
  })),
  ...
)

// ✅ AFTER
const pricesData = await calculateOrderPrices(
  cart.map(item => ({
    productId: item.productId,
    quantity: item.quantity,
    selectedAddons: item.selectedAddons, // Legacy addons
    selections: item.selections // ✅ BYO customization
  })),
  ...
)
```

#### إضافة selections في submitOrder:

```tsx
// ❌ BEFORE
const orderData = {
  items: cart.map(item => ({
    productId: item.productId,
    quantity: item.quantity
  })),
  ...
}

// ✅ AFTER
const orderData = {
  items: cart.map(item => ({
    productId: item.productId,
    quantity: item.quantity,
    selectedAddons: item.selectedAddons,
    selections: item.selections // ✅ BYO customization
  })),
  ...
}
```

### 2. Backend: orderService.js ✅

#### إضافة حساب BYO customization:

```javascript
// After calculating addons...

// 🎨 BYO CUSTOMIZATION PRICE CALCULATION
let customizationTotal = 0;
const validatedSelections = [];

if (item.selections && typeof item.selections === 'object') {
  const { calculateSelectionPrice } = await import('./customizationService.js');
  
  try {
    const priceData = await calculateSelectionPrice(
      item.productId,
      item.selections,
      item.quantity,
      env
    );
    
    customizationTotal = priceData.customizationTotal || 0;
    validatedSelections.push(...(priceData.selectedOptions || []));
    
    console.log(`✅ Validated ${validatedSelections.length} customization options, total: ${customizationTotal} EGP`);
  } catch (error) {
    console.error(`❌ Failed to calculate customization price:`, error.message);
  }
}

// Calculate item price: (base + addons + customization) * quantity
const itemPrice = basePrice + addonsTotal + (customizationTotal / quantity);
const itemSubtotal = itemPrice * quantity;
```

#### تحديث calculatedItems:

```javascript
calculatedItems.push({
  productId: item.productId,
  name: product.name,
  price: basePrice,
  quantity,
  selectedAddons: validatedAddons,
  addonsTotal,
  selections: validatedSelections.length > 0 ? validatedSelections : undefined, // ✅ NEW
  customizationTotal: customizationTotal > 0 ? customizationTotal : undefined, // ✅ NEW
  itemPrice,
  subtotal: itemSubtotal
});
```

## كيف يعمل النظام الآن

### Flow الكامل:

```
1. User يختار خيارات في ProductModal
   ↓
2. يضغط "أضف للسلة"
   ↓
3. CartProvider يحفظ selections في cart
   ↓
4. User يفتح Checkout
   ↓
5. useCheckoutLogic يبعت selections للـ API
   ↓
6. Backend يستخدم customizationService.calculateSelectionPrice()
   ↓
7. Backend يحسب: base + addons + customization
   ↓
8. Frontend يعرض السعر الصحيح ✅
```

### مثال Request:

```json
POST /api/orders/prices
{
  "items": [
    {
      "productId": "soft_serve_cup",
      "quantity": 1,
      "selections": {
        "flavors": ["vanilla_flavor", "mango_flavor"],
        "sauces": ["chocolate_sauce"],
        "dry_toppings": ["oreo_crumble"]
      }
    }
  ],
  "deliveryMethod": "pickup",
  ...
}
```

### مثال Response:

```json
{
  "data": {
    "calculatedPrices": {
      "items": [
        {
          "productId": "soft_serve_cup",
          "name": "كوب سوفت سيرف مخصص",
          "price": 45,
          "quantity": 1,
          "selections": [
            {"id": "vanilla_flavor", "name": "فانيليا", "price": 0},
            {"id": "mango_flavor", "name": "مانجو", "price": 0},
            {"id": "chocolate_sauce", "name": "صوص شوكولاتة", "price": 5},
            {"id": "oreo_crumble", "name": "أوريو مفتت", "price": 8}
          ],
          "customizationTotal": 13,
          "itemPrice": 58,
          "subtotal": 58
        }
      ],
      "subtotal": 58,
      "deliveryFee": 0,
      "total": 58
    }
  }
}
```

## الأمان (Security)

### ✅ Backend Validation:

1. **لا نثق في الأسعار من Frontend**
   - نجلب الأسعار من قاعدة البيانات فقط
   - `calculateSelectionPrice()` يتحقق من كل option

2. **Validation Rules**
   - نتحقق من min/max selections
   - نتحقق من required groups
   - نتحقق من availability

3. **Price Snapshot**
   - نحفظ السعر وقت الطلب في `order_item_selections`
   - حتى لو تغير السعر لاحقاً، الطلب يبقى بنفس السعر

## Console Logs للتشخيص

### Frontend:
```
📊 Recalculating prices for delivery method: pickup
📍 Address input type: manual
📡 API Request [POST]: /orders/prices
📦 Body: {items: [{productId, quantity, selections}], ...}
✅ Prices calculated successfully: {subtotal: 58, ...}
```

### Backend:
```
💰 Calculate order prices: {items: 1, deliveryMethod: 'pickup', ...}
✅ Validated 4 customization options for product soft_serve_cup, total: 13 EGP
```

## الملفات المعدلة

### Frontend:
1. ✅ `src/components/modals/CheckoutModal/useCheckoutLogic.ts`
   - إضافة `selections` في `calculateOrderPrices` call
   - إضافة `selections` في `submitOrder` call

### Backend:
2. ✅ `src/services/orderService.js`
   - إضافة BYO customization price calculation
   - استخدام `customizationService.calculateSelectionPrice()`
   - تحديث `calculatedItems` ليشمل `selections` و `customizationTotal`

## الاختبار

### Test 1: حساب السعر في Checkout
1. أضف منتج مخصص للسلة مع خيارات
2. افتح Checkout
3. **المتوقع:**
   - ✅ السعر الإجمالي صحيح (base + customization)
   - ✅ Console log: `✅ Validated X customization options, total: Y EGP`

### Test 2: إتمام الطلب
1. أكمل بيانات الطلب
2. اضغط "تأكيد الطلب"
3. **المتوقع:**
   - ✅ الطلب يتم بنجاح
   - ✅ السعر في قاعدة البيانات صحيح
   - ✅ الـ selections محفوظة في `order_item_selections`

### Test 3: منتج legacy + منتج BYO
1. أضف منتج عادي مع addons
2. أضف منتج مخصص مع selections
3. افتح Checkout
4. **المتوقع:**
   - ✅ كل منتج يحسب سعره صح
   - ✅ الإجمالي = sum of both

## الخطوة التالية

جرب دلوقتي:
1. أضف منتج مخصص للسلة
2. افتح Checkout
3. تأكد إن السعر صحيح (83 ج.م في مثالك)
4. أكمل الطلب
5. تحقق من قاعدة البيانات

السعر المفروض يكون صح دلوقتي! 🎉
