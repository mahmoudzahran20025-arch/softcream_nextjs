# 🎨 هندسة واجهة الأدمن للمنتجات
## Admin Products Frontend Architecture

> **تاريخ الإنشاء:** 4 ديسمبر 2025  
> **آخر تحديث:** 4 ديسمبر 2025  
> **الهدف:** توثيق الملفات والعلاقات في الـ Frontend

---

## 📚 ملفات التوثيق المرتبطة

| الملف | الموقع | الغرض |
|-------|--------|-------|
| Template System Guide | `./TEMPLATE_SYSTEM_GUIDE.md` | شرح نظام القوالب |
| Backend Relationships | `softcream-api/src/routes/admin/PRODUCTS_OPTIONS_RELATIONSHIPS.md` | علاقات الجداول |
| Backend Architecture | `softcream-api/src/database/BACKEND_ARCHITECTURE.md` | هندسة الباك اند |
| Admin Compatibility | `softcream-api/docs/BACKEND_ADMIN_COMPATIBILITY.md` | توافق الـ API |
| Spec Requirements | `.kiro/specs/admin-ui-redesign/requirements.md` | متطلبات التطوير |

---

## 📁 هيكل الملفات

```
src/components/admin/products/
├── UnifiedProductForm/           # فورم المنتج الموحد
│   ├── index.tsx                 # المكون الرئيسي
│   ├── ProductDetailsSection.tsx # تفاصيل المنتج
│   ├── OptionGroupsSection.tsx   # مجموعات الخيارات
│   ├── NutritionSection.tsx      # القيم الغذائية
│   ├── ValidationSummary.tsx     # ملخص التحقق
│   ├── ChangePreviewModal.tsx    # معاينة التغييرات
│   ├── changeTracking.ts         # تتبع التغييرات
│   └── types.ts                  # الأنواع
│
├── ProductWizard/                # معالج إنشاء المنتج (بديل)
│   ├── index.tsx
│   ├── BasicInfoStep.tsx
│   ├── TemplateOptionsStep.tsx
│   └── NutritionStep.tsx
│
├── TemplateSelector/             # اختيار القالب
│   └── index.tsx
│
├── TemplateBadge/                # شارة القالب
│   └── index.tsx
│
├── OptionGroupsBadge/            # شارة مجموعات الخيارات
│   └── index.tsx
│
├── BulkAssignModal.tsx           # تعيين جماعي للخيارات
├── ProductCard.tsx               # بطاقة المنتج في الأدمن
├── ProductForm.tsx               # فورم قديم (deprecated)
└── types.ts                      # أنواع مشتركة
```

---

## 🎯 نظام القوالب في الـ Frontend

### الملفات المرتبطة بكل قالب:

```
┌─────────────────────────────────────────────────────────────────┐
│                    TEMPLATE SYSTEM                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  template_id: 'template_1' (بسيط)                                │
│  ├── Card: src/components/ui/cards/SimpleCard.tsx               │
│  └── Modal: إضافة مباشرة للسلة (بدون modal)                      │
│                                                                  │
│  template_id: 'template_2' (متوسط)                               │
│  ├── Card: src/components/ui/cards/StandardProductCard.tsx      │
│  └── Modal: src/components/modals/ProductModal/templates/       │
│             └── builders/MediumTemplate.tsx                     │
│                                                                  │
│  template_id: 'template_3' (معقد - BYO)                          │
│  ├── Card: src/components/ui/cards/BYOProductCard.tsx           │
│  └── Modal: src/components/modals/ProductModal/templates/       │
│             └── builders/ComplexTemplate.tsx                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### ملف التوجيه الرئيسي:

```typescript
// src/components/ui/ProductCard.tsx
// يحدد أي بطاقة تُعرض بناءً على template_id

const getCardComponent = (templateId: string) => {
  switch (templateId) {
    case 'template_1':
      return SimpleCard;
    case 'template_2':
      return StandardProductCard;
    case 'template_3':
      return BYOProductCard;
    default:
      return StandardProductCard;
  }
};
```

```typescript
// src/components/modals/ProductModal/templates/ProductTemplateRenderer.tsx
// يحدد أي modal تُعرض بناءً على template_id

const getTemplateComponent = (templateId: string) => {
  switch (templateId) {
    case 'template_1':
      return SimpleTemplate;
    case 'template_2':
      return MediumTemplate;
    case 'template_3':
      return ComplexTemplate;
    default:
      return MediumTemplate;
  }
};
```

---

## 🔄 تدفق البيانات

### 1. جلب الخيارات للأدمن:

```typescript
// src/lib/admin/options.api.ts

// GET /admin/options
export async function getOptionGroups(): Promise<ApiResponse<OptionGroup[]>> {
  const response = await fetch(`${API_URL}/admin/options`, {
    headers: getAuthHeaders(),
  });
  return response.json();
}

// Response Structure:
interface OptionGroup {
  id: string;
  name_ar: string;
  name_en: string;
  options: Option[];  // ⚠️ قد يكون undefined!
}
```

### 2. عرض الخيارات:

```typescript
// src/components/admin/options/index.tsx
// الصفحة الرئيسية لإدارة الخيارات

// ⚠️ مشكلة محتملة: group.options قد يكون undefined
const allOptions = optionGroups.flatMap(group =>
  (group.options || []).map(option => ({  // ✅ تم إصلاحها
    ...option,
    groupName: group.name_ar,
    groupId: group.id,
  }))
);
```

### 3. فورم المنتج:

```typescript
// src/components/admin/products/UnifiedProductForm/index.tsx

// التبويبات الحالية:
const TABS = [
  { id: 'details', label: 'تفاصيل المنتج' },
  { id: 'template', label: 'القالب' },
  { id: 'uiConfig', label: 'إعدادات العرض' },
  { id: 'optionGroups', label: 'مجموعات الخيارات' },
  { id: 'nutrition', label: 'القيم الغذائية' },
];

// ⚠️ يمكن تبسيطها إلى 3 تبويبات فقط
```

---

## ⚠️ المشاكل المعروفة

### 1. خطأ `group.options` undefined:

```typescript
// ❌ الكود القديم (يسبب خطأ)
const allOptions = optionGroups.flatMap(group =>
  group.options.map(option => ({ ... }))
);

// ✅ الكود المصحح
const allOptions = optionGroups.flatMap(group =>
  (group.options || []).map(option => ({ ... }))
);
```

### 2. حقول قديمة في الفورم:

```typescript
// ⚠️ هذه الحقول لم تعد مستخدمة ويجب إزالتها:
// - product_type
// - card_style
// - layout_mode

// ✅ الحقل الوحيد المطلوب:
// - template_id
```

### 3. تبويبات كثيرة:

```typescript
// ⚠️ الحالي: 5 تبويبات
// ✅ المقترح: 3 تبويبات
// - الأساسيات (details + template + uiConfig)
// - الخيارات (optionGroups)
// - التغذية (nutrition)
```

---

## 📋 API Endpoints المستخدمة

### من `src/lib/admin/options.api.ts`:

| Function | Endpoint | الوظيفة |
|----------|----------|---------|
| `getOptionGroups()` | GET /admin/options | جلب المجموعات مع الخيارات |
| `createOptionGroup()` | POST /admin/option-groups | إنشاء مجموعة |
| `updateOptionGroup()` | PUT /admin/option-groups/:id | تحديث مجموعة |
| `deleteOptionGroup()` | DELETE /admin/option-groups/:id | حذف مجموعة |
| `createOption()` | POST /admin/options | إنشاء خيار |
| `updateOption()` | PUT /admin/options/:id | تحديث خيار |
| `deleteOption()` | DELETE /admin/options/:id | حذف خيار |

### من `src/lib/admin/products.api.ts`:

| Function | Endpoint | الوظيفة |
|----------|----------|---------|
| `getProducts()` | GET /admin/products | جلب المنتجات |
| `createProduct()` | POST /admin/products | إنشاء منتج |
| `updateProduct()` | PUT /admin/products/:id | تحديث منتج |
| `deleteProduct()` | DELETE /admin/products/:id | حذف منتج |
| `updateProductCustomization()` | PUT /admin/products/:id/customization | تحديث الخيارات |

---

## 🎨 مكونات UI المشتركة

### البطاقات:

```
src/components/ui/cards/
├── SimpleCard.tsx          # template_1
├── StandardProductCard.tsx # template_2
└── BYOProductCard.tsx      # template_3
```

### المكونات المشتركة:

```
src/components/ui/common/
├── DiscountBadge.tsx       # شارة الخصم
├── UnavailableOverlay.tsx  # طبقة "غير متاح"
└── NutritionSwiper.tsx     # عرض القيم الغذائية
```

### الـ Modals:

```
src/components/modals/ProductModal/
├── index.tsx                           # المكون الرئيسي
├── useProductLogic.ts                  # منطق المنتج
└── templates/
    ├── ProductTemplateRenderer.tsx     # موجه القوالب
    └── builders/
        ├── SimpleTemplate.tsx          # template_1
        ├── MediumTemplate.tsx          # template_2
        └── ComplexTemplate.tsx         # template_3
```

---

## 🔧 التحسينات المقترحة

### 1. تبسيط التبويبات:

```typescript
// من 5 تبويبات إلى 3:
const TABS = [
  { id: 'basics', label: 'الأساسيات' },      // details + template + uiConfig
  { id: 'options', label: 'الخيارات' },      // optionGroups
  { id: 'nutrition', label: 'التغذية' },     // nutrition
];
```

### 2. إزالة الحقول القديمة:

```typescript
// في ProductDetailsSection.tsx
// إزالة:
// - product_type selector
// - card_style selector
// - layout_mode selector
```

### 3. تحسين جدول الخيارات:

```typescript
// تحويل OptionsTable.tsx إلى بطاقات متجاوبة
// بدلاً من جدول غير متجاوب
```

---

## 🎯 الخلاصة

**الملفات الأساسية:**
1. `ProductCard.tsx` - يحدد البطاقة حسب template_id
2. `ProductTemplateRenderer.tsx` - يحدد الـ Modal حسب template_id
3. `UnifiedProductForm/index.tsx` - فورم إضافة/تعديل المنتج
4. `options.api.ts` - API للخيارات

**النقاط المهمة:**
- `template_id` هو المتحكم الوحيد في شكل العرض
- `group.options` قد يكون undefined (يجب التحقق دائماً)
- الحقول القديمة (product_type, card_style, layout_mode) يجب إزالتها
