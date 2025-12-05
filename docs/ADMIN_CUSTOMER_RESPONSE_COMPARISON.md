# مقارنة Admin vs Customer Responses

## 📋 ملخص المقارنة

هذا المستند يوثق الفروقات والتوافقات بين استجابات Admin API و Customer API.

---

## 🔄 نظرة عامة على المنهجية

```
                    ┌─────────────────┐
                    │    Backend      │
                    │   (المنبع)      │
                    │   schema.sql    │
                    └────────┬────────┘
                             │
              ┌──────────────┴──────────────┐
              │                             │
              ▼                             ▼
    ┌─────────────────┐           ┌─────────────────┐
    │   Admin API     │           │  Customer API   │
    │  /admin/...     │           │  /products/...  │
    └─────────────────┘           └─────────────────┘
```

---

## 📊 جدول المقارنة الرئيسي

### 1. Products Endpoints

| الوظيفة | Admin Endpoint | Customer Endpoint | الفرق |
|---------|----------------|-------------------|-------|
| جلب المنتجات | `GET /admin/products` | `GET /products` | Admin: كل الحقول، Customer: حقول محددة |
| جلب منتج واحد | `GET /admin/products/:id/full` | `GET /products/:id` | Admin: مع العلاقات، Customer: بيانات أساسية |
| تكوين المنتج | `GET /admin/products/:id/configuration` | `GET /products/:id/configuration` | **متطابق** ✅ |

### 2. Options Endpoints

| الوظيفة | Admin Endpoint | Customer Endpoint | الفرق |
|---------|----------------|-------------------|-------|
| جلب الخيارات | `GET /admin/options` | `GET /products/:id/customization-rules` | Admin: كل المجموعات، Customer: للمنتج فقط |
| جلب الأحجام | `GET /admin/sizes` | `GET /products/:id/sizes` | Admin: كل الأحجام، Customer: للمنتج فقط |
| جلب الحاويات | `GET /admin/containers` | `GET /products/:id/containers` | Admin: كل الحاويات، Customer: للمنتج فقط |

---

## 📦 تفاصيل الاستجابات

### 1. GET /admin/products vs GET /products

#### Admin Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "product_1",
      "name": "آيس كريم فانيلا",
      "nameEn": "Vanilla Ice Cream",
      "category": "ice-cream",
      "categoryEn": "Ice Cream",
      "price": 15,
      "description": "...",
      "descriptionEn": "...",
      "image": "...",
      "badge": "...",
      "available": 1,
      "template_id": "template_1",
      "ui_config": "{}",
      "old_price": null,
      "discount_percentage": null,
      "calories": 200,
      "protein": 4,
      "carbs": 25,
      "fat": 10,
      "sugar": 20,
      "fiber": 0,
      "energy_type": "balanced",
      "energy_score": 50,
      "tags": "...",
      "ingredients": "...",
      "nutrition_facts": "...",
      "allergens": "...",
      "health_keywords": "...",
      "health_benefit_ar": "..."
    }
  ]
}
```

#### Customer Response:
```json
{
  "data": [
    {
      "id": "product_1",
      "name": "آيس كريم فانيلا",
      "nameEn": "Vanilla Ice Cream",
      "price": 15,
      "image": "...",
      "category": "ice-cream",
      "categoryEn": "Ice Cream",
      "description": "...",
      "descriptionEn": "...",
      "available": 1,
      "calories": 200,
      "protein": 4,
      "carbs": 25,
      "fat": 10,
      "sugar": 20,
      "fiber": 0,
      "energy_type": "balanced",
      "energy_score": 50,
      "badge": "...",
      "template_id": "template_1",
      "ui_config": "{}",
      "old_price": null,
      "discount_percentage": null,
      "health_keywords": "...",
      "health_benefit_ar": "..."
    }
  ]
}
```

**✅ التوافق:** الحقول الأساسية متطابقة. Admin يحصل على كل الحقول، Customer يحصل على نفس البيانات.

---

### 2. GET /admin/products/:id/full vs GET /products/:id/configuration

#### Admin Response (`/admin/products/:id/full`):
```json
{
  "success": true,
  "data": {
    "product": {
      "id": "product_1",
      "name": "...",
      "price": 15,
      "template_id": "template_1",
      "ui_config": "{}",
      // ... كل حقول المنتج
    },
    "optionGroups": [
      {
        "groupId": "toppings",
        "isRequired": false,
        "minSelections": 0,
        "maxSelections": 3,
        "displayOrder": 1,
        "isRequiredOverride": null,
        "minSelectionsOverride": null,
        "maxSelectionsOverride": null,
        "group": {
          "id": "toppings",
          "nameAr": "الإضافات",
          "nameEn": "Toppings",
          "icon": "🍫",
          "defaultRequired": false,
          "defaultMin": 0,
          "defaultMax": 5,
          "optionsCount": 10
        }
      }
    ]
  }
}
```

#### Customer Response (`/products/:id/configuration`):
```json
{
  "data": {
    "product": {
      "id": "product_1",
      "name": "آيس كريم فانيلا",
      "nameAr": "آيس كريم فانيلا",
      "nameEn": "Vanilla Ice Cream",
      "basePrice": 15,
      "templateId": "template_1",
      "isCustomizable": true,
      "baseNutrition": {
        "calories": 200,
        "protein": 4,
        "carbs": 25,
        "sugar": 20,
        "fat": 10,
        "fiber": 0
      }
    },
    "hasContainers": true,
    "containers": [...],
    "hasSizes": true,
    "sizes": [...],
    "hasCustomization": true,
    "customizationRules": [
      {
        "groupId": "toppings",
        "groupName": "الإضافات",
        "groupDescription": "...",
        "groupIcon": "🍫",
        "isRequired": false,
        "minSelections": 0,
        "maxSelections": 3,
        "priceOverride": null,
        "displayOrder": 1,
        "options": [
          {
            "id": "chocolate_chips",
            "name_ar": "رقائق شوكولاتة",
            "name_en": "Chocolate Chips",
            "base_price": 2,
            "price": 2,
            "image": "...",
            "nutrition": {
              "calories": 50,
              "protein": 1,
              "carbs": 8,
              "sugar": 6,
              "fat": 3,
              "fiber": 0
            }
          }
        ]
      }
    ]
  }
}
```

**⚠️ الفروقات المهمة:**

| الحقل | Admin | Customer | ملاحظة |
|-------|-------|----------|--------|
| `price` vs `basePrice` | `price` | `basePrice` | تسمية مختلفة |
| `template_id` vs `templateId` | `template_id` | `templateId` | snake_case vs camelCase |
| `options` | غير موجود | موجود مع كل group | Customer يحصل على الخيارات مباشرة |
| `isCustomizable` | غير موجود | موجود | Customer يحصل على flag مشتق |
| `baseNutrition` | غير موجود | موجود | Customer يحصل على التغذية الأساسية |

---

### 3. GET /admin/options vs GET /products/:id/customization-rules

#### Admin Response (`/admin/options`):
```json
{
  "success": true,
  "data": [
    {
      "id": "toppings",
      "name_ar": "الإضافات",
      "name_en": "Toppings",
      "description_ar": "...",
      "description_en": "...",
      "display_order": 1,
      "icon": "🍫",
      "options": [
        {
          "id": "chocolate_chips",
          "group_id": "toppings",
          "name_ar": "رقائق شوكولاتة",
          "name_en": "Chocolate Chips",
          "description_ar": "...",
          "description_en": "...",
          "base_price": 2,
          "image": "...",
          "available": 1,
          "display_order": 1,
          "calories": 50,
          "protein": 1,
          "carbs": 8,
          "sugar": 6,
          "fat": 3,
          "fiber": 0
        }
      ]
    }
  ]
}
```

#### Customer Response (`/products/:id/customization-rules`):
```json
{
  "data": [
    {
      "groupId": "toppings",
      "groupName": "الإضافات",
      "groupDescription": "...",
      "groupIcon": "🍫",
      "isRequired": false,
      "minSelections": 0,
      "maxSelections": 3,
      "priceOverride": null,
      "displayOrder": 1,
      "options": [
        {
          "id": "chocolate_chips",
          "name_ar": "رقائق شوكولاتة",
          "name_en": "Chocolate Chips",
          "description_ar": "...",
          "description_en": "...",
          "base_price": 2,
          "price": 2,
          "image": "...",
          "display_order": 1,
          "calories": 50,
          "protein": 1,
          "carbs": 8,
          "sugar": 6,
          "fat": 3,
          "fiber": 0,
          "nutrition": {
            "calories": 50,
            "protein": 1,
            "carbs": 8,
            "sugar": 6,
            "fat": 3,
            "fiber": 0
          }
        }
      ]
    }
  ]
}
```

**⚠️ الفروقات المهمة:**

| الحقل | Admin | Customer | ملاحظة |
|-------|-------|----------|--------|
| `id` vs `groupId` | `id` | `groupId` | تسمية مختلفة |
| `name_ar` vs `groupName` | `name_ar` | `groupName` (حسب اللغة) | Customer يدمج حسب اللغة |
| `isRequired`, `minSelections`, `maxSelections` | غير موجود | موجود | Customer يحصل على قواعد المنتج |
| `priceOverride` | غير موجود | موجود | Customer يحصل على السعر المخصص |
| `price` في options | غير موجود | موجود | Customer يحصل على السعر الفعلي (مع override) |
| `nutrition` object | غير موجود | موجود | Customer يحصل على object منظم |
| `available` | موجود | غير موجود | Admin فقط يرى حالة التوفر |
| `group_id` في options | موجود | غير موجود | Admin يرى الربط |

---

## 🔑 الحقول المشتركة (Shared Fields)

### في جدول `products`:
- `id`, `name`, `nameEn`, `category`, `categoryEn`
- `price`, `description`, `descriptionEn`
- `image`, `badge`, `available`
- `template_id`, `ui_config`
- `old_price`, `discount_percentage`
- `calories`, `protein`, `carbs`, `fat`, `sugar`, `fiber`
- `energy_type`, `energy_score`
- `tags`, `ingredients`, `nutrition_facts`, `allergens`
- `health_keywords`, `health_benefit_ar`

### في جدول `option_groups`:
- `id`, `name_ar`, `name_en`
- `description_ar`, `description_en`
- `display_order`, `icon`

### في جدول `options`:
- `id`, `group_id`, `name_ar`, `name_en`
- `description_ar`, `description_en`
- `base_price`, `image`, `display_order`, `available`
- `calories`, `protein`, `carbs`, `sugar`, `fat`, `fiber`

### في جدول `product_options`:
- `product_id`, `option_group_id`
- `is_required`, `min_selections`, `max_selections`
- `price_override`, `display_order`

---

## ⚠️ التناقضات المكتشفة

### 1. تسمية الحقول (Naming Conventions)

| الموقع | Admin | Customer | التوصية |
|--------|-------|----------|---------|
| سعر المنتج | `price` | `basePrice` | توحيد إلى `price` |
| معرف القالب | `template_id` | `templateId` | توحيد إلى `template_id` |
| معرف المجموعة | `id` | `groupId` | توحيد إلى `id` |
| اسم المجموعة | `name_ar` | `groupName` | توحيد إلى `name_ar`/`name_en` |

### 2. بنية البيانات (Data Structure)

| الموضوع | Admin | Customer | ملاحظة |
|---------|-------|----------|--------|
| التغذية | حقول منفصلة | `nutrition` object | Customer يجمعها في object |
| الخيارات | بدون `price` | مع `price` | Customer يحسب السعر الفعلي |
| التوفر | `available` موجود | غير موجود | Customer لا يحتاج رؤية غير المتوفر |

### 3. البيانات الإضافية

| البيانات | Admin | Customer | ملاحظة |
|----------|-------|----------|--------|
| `isCustomizable` | غير موجود | موجود | مشتق من وجود option_groups |
| `baseNutrition` | غير موجود | موجود | مجمع من حقول المنتج |
| Override flags | موجود | غير موجود | Admin فقط يحتاجها |

---

## ✅ التوافقات المؤكدة

1. **نفس الجداول:** كلا الـ API يقرأ من نفس الجداول
2. **نفس العلاقات:** `product_options.option_group_id` → `option_groups.id`
3. **نفس البيانات الأساسية:** المنتجات والخيارات متطابقة
4. **نفس القواعد:** `is_required`, `min_selections`, `max_selections`

---

## 📝 توصيات للتحسين

### 1. توحيد التسميات في Frontend Types

```typescript
// src/types/shared.ts
export interface BaseProduct {
  id: string
  name: string
  nameEn?: string
  price: number  // توحيد: استخدام price دائماً
  template_id?: string  // توحيد: استخدام snake_case
  // ...
}

export interface BaseOptionGroup {
  id: string  // توحيد: استخدام id وليس groupId
  name_ar: string
  name_en: string
  // ...
}
```

### 2. إضافة Transformer Functions

```typescript
// src/lib/transformers.ts

// تحويل Admin response إلى Customer format
export function transformAdminToCustomer(adminProduct: AdminProduct): CustomerProduct {
  return {
    ...adminProduct,
    basePrice: adminProduct.price,
    templateId: adminProduct.template_id,
    // ...
  }
}

// تحويل Customer response إلى Admin format
export function transformCustomerToAdmin(customerProduct: CustomerProduct): AdminProduct {
  return {
    ...customerProduct,
    price: customerProduct.basePrice,
    template_id: customerProduct.templateId,
    // ...
  }
}
```

### 3. Null Checks المطلوبة

```typescript
// عند التعامل مع options
(group.options || []).map(option => ...)

// عند التعامل مع nutrition
const nutrition = option.nutrition || {
  calories: option.calories || 0,
  protein: option.protein || 0,
  // ...
}
```

---

## 📅 تاريخ التحديث

- **التاريخ:** 2025-12-04
- **المهمة:** Task 0.3 - قارن بين Admin و Customer responses
- **الحالة:** ✅ مكتمل
