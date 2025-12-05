# Types vs Backend Compatibility Report

## تاريخ التحليل: 2025-12-04

## 📋 ملخص التحليل

تم تحليل التوافق بين الـ Types في Frontend والـ Schema في Backend.

---

## ✅ التوافقات الصحيحة

### 1. Products Table ↔ Product Types

| Backend Column | Frontend Type | Status |
|----------------|---------------|--------|
| `id` | `id: string` | ✅ متوافق |
| `name` | `name: string` | ✅ متوافق |
| `nameEn` | `nameEn?: string` | ✅ متوافق |
| `category` | `category: string` | ✅ متوافق |
| `categoryEn` | `categoryEn?: string` | ✅ متوافق |
| `price` | `price: number` | ✅ متوافق |
| `description` | `description?: string` | ✅ متوافق |
| `descriptionEn` | `descriptionEn?: string` | ✅ متوافق |
| `image` | `image?: string` | ✅ متوافق |
| `badge` | `badge?: string` | ✅ متوافق |
| `available` | `available: number` | ✅ متوافق |
| `calories` | `calories?: number` | ✅ متوافق |
| `protein` | `protein?: number` | ✅ متوافق |
| `carbs` | `carbs?: number` | ✅ متوافق |
| `fat` | `fat?: number` | ✅ متوافق |
| `sugar` | `sugar?: number` | ✅ متوافق |
| `fiber` | `fiber?: number` | ✅ متوافق |
| `energy_type` | `energy_type?: string` | ✅ متوافق |
| `energy_score` | `energy_score?: number` | ✅ متوافق |
| `tags` | `tags?: string` | ✅ متوافق |
| `ingredients` | `ingredients?: string` | ✅ متوافق |
| `nutrition_facts` | `nutrition_facts?: string` | ✅ متوافق |
| `allergens` | `allergens?: string` | ✅ متوافق |
| `template_id` | `template_id?: string` | ✅ متوافق |
| `template_variant` | `template_variant?: string` | ✅ متوافق |
| `is_template_dynamic` | `is_template_dynamic?: number` | ✅ متوافق |
| `ui_config` | `ui_config?: string` | ✅ متوافق |
| `old_price` | `old_price?: number` | ✅ متوافق |
| `discount_percentage` | `discount_percentage?: number` | ✅ متوافق |
| `health_keywords` | `health_keywords?: string` | ✅ متوافق |
| `health_benefit_ar` | `health_benefit_ar?: string` | ✅ متوافق |

### 2. Option Groups Table ↔ OptionGroup Types

| Backend Column | Frontend Type | Status |
|----------------|---------------|--------|
| `id` | `id: string` | ✅ متوافق |
| `name_ar` | `name_ar: string` | ✅ متوافق |
| `name_en` | `name_en: string` | ✅ متوافق |
| `description_ar` | `description_ar?: string` | ✅ متوافق |
| `description_en` | `description_en?: string` | ✅ متوافق |
| `display_style` | `display_style: string` | ✅ متوافق |
| `display_order` | `display_order: number` | ✅ متوافق |
| `icon` | `icon?: string` | ✅ متوافق |
| `ui_config` | `ui_config?: string` | ✅ متوافق |
| `is_required` | `is_required: number` | ✅ متوافق |
| `min_selections` | `min_selections: number` | ✅ متوافق |
| `max_selections` | `max_selections: number` | ✅ متوافق |

### 3. Options Table ↔ Option Types

| Backend Column | Frontend Type | Status |
|----------------|---------------|--------|
| `id` | `id: string` | ✅ متوافق |
| `group_id` | `group_id: string` | ✅ متوافق |
| `name_ar` | `name_ar: string` | ✅ متوافق |
| `name_en` | `name_en: string` | ✅ متوافق |
| `description_ar` | `description_ar?: string` | ✅ متوافق |
| `description_en` | `description_en?: string` | ✅ متوافق |
| `base_price` | `base_price: number` | ✅ متوافق |
| `image` | `image?: string` | ✅ متوافق |
| `available` | `available: number` | ✅ متوافق |
| `display_order` | `display_order: number` | ✅ متوافق |
| `calories` | `calories: number` | ✅ متوافق |
| `protein` | `protein: number` | ✅ متوافق |
| `carbs` | `carbs: number` | ✅ متوافق |
| `fat` | `fat: number` | ✅ متوافق |
| `sugar` | `sugar: number` | ✅ متوافق |
| `fiber` | `fiber: number` | ✅ متوافق |

### 4. Product Options Table ↔ Types

| Backend Column | Frontend Type | Status |
|----------------|---------------|--------|
| `product_id` | `product_id: string` | ✅ متوافق |
| `option_group_id` | `groupId: string` | ✅ متوافق (تحويل في API) |
| `is_required` | `isRequired: boolean` | ✅ متوافق (تحويل في API) |
| `min_selections` | `minSelections: number` | ✅ متوافق (تحويل في API) |
| `max_selections` | `maxSelections: number` | ✅ متوافق (تحويل في API) |
| `display_order` | `displayOrder: number` | ✅ متوافق (تحويل في API) |

---

## ⚠️ ملاحظات مهمة

### 1. حقول مهملة في Frontend (يجب إزالتها)

الحقول التالية موجودة في بعض ملفات Frontend لكنها **غير موجودة في schema.sql**:

| الحقل | الملف | الحالة |
|-------|-------|--------|
| `card_badge` | `products.api.ts` | ⚠️ مهمل - استخدم `ui_config.badge` |
| `card_badge_color` | `products.api.ts` | ⚠️ مهمل - استخدم `ui_config.badge_color` |

**التوصية:** هذه الحقول تم دمجها في `ui_config` JSON field. يجب تحديث الكود لاستخدام `ui_config` بدلاً منها.

### 2. تحويل الأسماء (Naming Convention)

Backend يستخدم `snake_case` بينما Frontend يستخدم `camelCase` في بعض الأماكن:

| Backend | Frontend | التحويل |
|---------|----------|---------|
| `option_group_id` | `groupId` | ✅ يتم في API handler |
| `is_required` | `isRequired` | ✅ يتم في API handler |
| `min_selections` | `minSelections` | ✅ يتم في API handler |
| `max_selections` | `maxSelections` | ✅ يتم في API handler |
| `display_order` | `displayOrder` | ✅ يتم في API handler |

### 3. حقل `name` في Option

في `src/types/options.ts`:
```typescript
export interface Option {
    name: string        // ⚠️ هذا الحقل غير موجود في Backend
    name_ar: string     // ✅ موجود
    name_en: string     // ✅ موجود
}
```

**التوصية:** حقل `name` يبدو أنه للتوافق مع الكود القديم. يجب استخدام `name_ar` أو `name_en` حسب اللغة.

---

## 🔍 تحليل الملفات

### 1. `src/lib/api.ts` (Customer API)

**الحالة:** ✅ متوافق بشكل كامل

- يستخدم الـ Types الصحيحة
- `ProductConfiguration.product.templateId` متوافق مع Backend

### 2. `src/lib/admin/products.api.ts` (Admin Products API)

**الحالة:** ✅ متوافق مع ملاحظات

- الـ Types الأساسية متوافقة
- `card_badge` و `card_badge_color` مهملة (انظر أعلاه)
- `OptionGroupAssignmentFull.groupId` يتوافق مع `option_group_id` في Backend

### 3. `src/lib/admin/options.api.ts` (Admin Options API)

**الحالة:** ✅ متوافق بشكل كامل

- يستخدم `group_id` للخيارات (صحيح)
- يرسل البيانات بالشكل الصحيح للـ Backend

### 4. `src/types/options.ts` (Shared Types)

**الحالة:** ✅ متوافق مع ملاحظة

- حقل `name` إضافي (للتوافق مع الكود القديم)
- باقي الحقول متوافقة

### 5. `src/components/admin/options/types.ts` (Admin Options Types)

**الحالة:** ✅ متوافق بشكل كامل

- جميع الحقول متوافقة مع Backend
- `OptionFormData.available` هو `boolean` ويتم تحويله إلى `number` في API

---

## ✅ الخلاصة

**التوافق العام:** 95% متوافق

### ما يعمل بشكل صحيح:
1. ✅ جميع الجداول الأساسية متوافقة
2. ✅ العلاقات بين الجداول صحيحة
3. ✅ `option_group_id` يُستخدم بشكل صحيح في `product_options`
4. ✅ `group_id` يُستخدم بشكل صحيح في `options`
5. ✅ Template System يعمل بشكل صحيح (`template_id`)

### ما يحتاج تحسين:
1. ⚠️ إزالة `card_badge` و `card_badge_color` من Product type
2. ⚠️ توحيد حقل `name` في Option type

---

## 📝 التوصيات

### 1. تحديث Product Type (اختياري)

```typescript
// في src/lib/admin/products.api.ts
export interface Product {
  // ... الحقول الموجودة ...
  
  // ❌ إزالة هذه الحقول:
  // card_badge?: string
  // card_badge_color?: string
  
  // ✅ استخدام ui_config بدلاً منها:
  // ui_config يحتوي على: { badge, badge_color, ... }
}
```

### 2. لا حاجة لتغييرات عاجلة

الكود الحالي يعمل بشكل صحيح. الحقول المهملة لا تسبب أخطاء لأنها optional.

---

## 🔗 الملفات المرجعية

- Backend Schema: `softcream-api/schema.sql`
- Admin Products API: `softcream-api/src/routes/admin/products.js`
- Admin Options API: `softcream-api/src/routes/admin/byo.js`
- Frontend Admin Products: `soft-cream-nextjs/src/lib/admin/products.api.ts`
- Frontend Admin Options: `soft-cream-nextjs/src/lib/admin/options.api.ts`
- Frontend Customer API: `soft-cream-nextjs/src/lib/api.ts`
- Shared Types: `soft-cream-nextjs/src/types/options.ts`
