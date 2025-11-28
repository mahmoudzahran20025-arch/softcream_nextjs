# 📋 سجل التغييرات - 2025-11-28

## ملخص التغييرات
تم توحيد حسابات التغذية والأسعار لإزالة التكرار في الكود.

---

## ⚠️ تحديث مهم - تم استعادة الملفات

### الملفات التي تم استعادتها (كانت مستخدمة فعلياً):

| الملف | مكان الاستخدام |
|-------|----------------|
| `NutritionCard.tsx` | `CartModal/index.tsx` |
| `NutritionSummary.tsx` | `PageContentClient.tsx` |

**ملاحظة:** تم أرشفة هذه الملفات بالخطأ في الجلسة السابقة. تم استعادتها الآن.

### مجلد الأرشيف: `archive/unused-nutrition-components_2025-11-28/`
يحتوي على نسخ احتياطية فقط - الملفات الأصلية تم استعادتها إلى `src/components/ui/`

---

## 2. تحديث useProductConfiguration.ts

### الملف: `src/hooks/useProductConfiguration.ts`

### التغييرات:
```typescript
// قبل:
function createEmptyNutrition(): NutritionTotals { ... }
// حسابات يدوية للتغذية

// بعد:
import { createEmptyNutrition, addNutrition, multiplyNutrition, calculateEnergyData } from '@/lib/utils/nutritionCalculator'
// استخدام الدوال الموحدة
```

### الدوال المستخدمة الآن:
- `createEmptyNutrition()` - إنشاء كائن تغذية فارغ
- `addNutrition(base, addition)` - جمع قيم التغذية
- `multiplyNutrition(nutrition, multiplier)` - ضرب التغذية بمعامل (للمقاسات)
- `calculateEnergyData(nutrition)` - حساب نوع ودرجة الطاقة

### للتراجع:
```typescript
// 1. إزالة الـ import
// import { createEmptyNutrition, addNutrition, multiplyNutrition, calculateEnergyData } from '@/lib/utils/nutritionCalculator'

// 2. إضافة الدالة المحلية
function createEmptyNutrition(): NutritionTotals {
  return { calories: 0, protein: 0, carbs: 0, sugar: 0, fat: 0, fiber: 0 }
}

// 3. استبدال addNutrition بالحساب اليدوي:
// nutrition.calories += option.nutrition.calories || 0
// nutrition.protein += option.nutrition.protein || 0
// ... إلخ

// 4. استبدال multiplyNutrition بالحساب اليدوي:
// nutrition.calories += Math.round(customizationData.nutrition.calories * multiplier)
// ... إلخ

// 5. استبدال calculateEnergyData بالمنطق القديم:
// if (totalProtein > 15) { energyType = 'physical'; ... }
// else if (totalSugar > 25) { energyType = 'mental'; ... }
// else { energyType = 'balanced'; ... }
```

---

## 3. تحديث CartProvider.tsx

### الملف: `src/providers/CartProvider.tsx`

### التغييرات:
```typescript
// قبل:
// حسابات يدوية للأسعار في getCartTotal

// بعد:
import { calculateCartItemPrice } from '@/lib/utils/priceCalculator'

const getCartTotal = useCallback((...) => {
  return cart.reduce((total, item) => {
    const product = productsMap[item.productId]
    if (!product) return total
    
    return total + calculateCartItemPrice(
      product.price,
      item.selections,
      item.selectedAddons,
      addonsMap,
      optionsMap,
      item.quantity
    )
  }, 0)
}, [cart])
```

### للتراجع:
```typescript
// 1. إزالة الـ import
// import { calculateCartItemPrice } from '@/lib/utils/priceCalculator'

// 2. استبدال getCartTotal بالكود القديم:
const getCartTotal = useCallback((productsMap, addonsMap, optionsMap) => {
  return cart.reduce((total, item) => {
    const product = productsMap[item.productId]
    if (!product) return total
    
    let itemPrice = product.price
    
    // Check for pre-calculated price (BYO products)
    if (item.selections?._calculatedPrice) {
      const calculatedPrice = parseFloat(item.selections._calculatedPrice[0]) || 0
      if (calculatedPrice > 0) {
        return total + (calculatedPrice * item.quantity)
      }
    }
    
    // Add container price
    if (item.selections?._container?.[2]) {
      itemPrice += parseFloat(item.selections._container[2]) || 0
    }
    
    // Add size price
    if (item.selections?._size?.[2]) {
      itemPrice += parseFloat(item.selections._size[2]) || 0
    }
    
    // Add legacy addon prices
    if (addonsMap && item.selectedAddons?.length) {
      const addonsTotal = item.selectedAddons.reduce((sum, addonId) => {
        return sum + (addonsMap[addonId]?.price || 0)
      }, 0)
      itemPrice += addonsTotal
    }
    
    // Add BYO customization prices
    if (optionsMap && item.selections) {
      const customizationSelections = Object.entries(item.selections)
        .filter(([key]) => !key.startsWith('_'))
        .flatMap(([, values]) => values)
      
      const customizationTotal = customizationSelections.reduce((sum, optionId) => {
        return sum + (optionsMap[optionId]?.price || 0)
      }, 0)
      itemPrice += customizationTotal
    }
    
    return total + (itemPrice * item.quantity)
  }, 0)
}, [cart])
```

---

## 4. الملفات المرجعية (لم تتغير)

| الملف | الدور |
|-------|-------|
| `lib/utils/nutritionCalculator.ts` | حسابات التغذية الموحدة |
| `lib/utils/priceCalculator.ts` | حسابات الأسعار الموحدة |
| `lib/utils/index.ts` | Barrel export |

---

## 5. اختبار التغييرات

### للتحقق من عمل النظام:

1. **اختبار ProductModal:**
   - افتح منتج BYO (مثل Soft Serve Cup)
   - اختر حاوية ومقاس ونكهات
   - تأكد من تحديث التغذية والسعر

2. **اختبار السلة:**
   - أضف منتج للسلة
   - تأكد من صحة السعر الإجمالي
   - أضف منتج BYO مع تخصيصات
   - تأكد من صحة السعر

3. **اختبار Checkout:**
   - أكمل عملية شراء
   - تأكد من صحة الأسعار في الفاتورة

---

## 6. الأخطاء المحتملة وحلولها

### خطأ: "Cannot read property 'calories' of undefined"
**السبب:** كائن التغذية غير موجود
**الحل:** تأكد من استخدام `createEmptyNutrition()` كقيمة افتراضية

### خطأ: "calculateCartItemPrice is not a function"
**السبب:** الـ import غير صحيح
**الحل:** تأكد من المسار: `@/lib/utils/priceCalculator`

### خطأ: السعر يظهر 0
**السبب:** `_calculatedPrice` غير موجود في selections
**الحل:** تأكد من أن useAddToCart يضيف `_calculatedPrice` للـ selections

---

## 7. تاريخ التغييرات

| الوقت | الإجراء |
|-------|---------|
| 2025-11-28 | أرشفة NutritionCard.tsx و NutritionSummary.tsx |
| 2025-11-28 | تحديث useProductConfiguration لاستخدام nutritionCalculator |
| 2025-11-28 | تحديث CartProvider لاستخدام priceCalculator |
| 2025-11-28 | إنشاء ملف التوثيق |

---

## 8. المراجع

- `PRODUCT_FLOW_ANALYSIS.md` - تحليل تدفق المنتج
- `archive/unused-nutrition-components_2025-11-28/README.md` - توثيق الأرشيف
