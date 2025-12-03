# تقرير تحليل الفجوات - Admin UI & Customer Frontend
# Admin & Frontend Gap Analysis Report

> تاريخ التحليل: December 2025
> المتطلبات: Requirements 6.1, 6.2

---

## 📊 ملخص تنفيذي | Executive Summary

هذا التقرير يحلل الفجوات بين النظام الجديد (Templates, UI Config, Unified Options) والأدمن الحالي + واجهة العميل (ProductModal).

### الحالة العامة | Overall Status

| المجال | الحالة | النسبة |
|--------|--------|--------|
| Template System (Admin) | ✅ مُنفذ | 90% |
| UI Config System (Admin) | ✅ مُنفذ | 85% |
| Options Management (Admin) | ✅ مُنفذ | 95% |
| Products Management (Admin) | ✅ مُنفذ | 90% |
| **ProductModal (Customer)** | ✅ مُنفذ | 95% |
| **Backend Compatibility** | ✅ متوافق | 98% |
| Search & Filtering | ⚠️ جزئي | 60% |
| Preview System | ⚠️ جزئي | 40% |

---

## 🔗 توافق Frontend-Backend | Frontend-Backend Compatibility

### ✅ Unified Options System - متوافق بالكامل

| المكون | Frontend | Backend | الحالة |
|--------|----------|---------|--------|
| Option Groups | `useProductConfiguration` | `option_groups` table | ✅ متوافق |
| Options | `customizationRules` | `options` table | ✅ متوافق |
| Containers | `containers` (group_id='containers') | `options WHERE group_id='containers'` | ✅ متوافق |
| Sizes | `sizes` (group_id='sizes') | `options WHERE group_id='sizes'` | ✅ متوافق |
| Product Options | `product_options` | `product_options` table | ✅ متوافق |
| UI Config | `ui_config` JSON | `ui_config` column | ✅ متوافق |
| Templates | `template_id` | `product_templates` table | ✅ متوافق |

### Data Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         Customer Flow (ProductModal)                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ProductModal                                                            │
│       │                                                                  │
│       ▼                                                                  │
│  useProductConfiguration ──────► getProductConfiguration API             │
│       │                                │                                 │
│       │                                ▼                                 │
│       │                    customizationService.js                       │
│       │                                │                                 │
│       │                                ▼                                 │
│       │                    ┌───────────────────────┐                     │
│       │                    │   Database (D1)       │                     │
│       │                    │   - option_groups     │                     │
│       │                    │   - options           │                     │
│       │                    │   - product_options   │                     │
│       │                    │   - product_templates │                     │
│       │                    └───────────────────────┘                     │
│       ▼                                                                  │
│  ProductTemplateRenderer                                                 │
│       │                                                                  │
│       ├── ComplexTemplate (layout_mode='complex')                        │
│       ├── MediumTemplate (layout_mode='medium')                          │
│       └── SimpleTemplate (layout_mode='simple')                          │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## ✅ المكونات المُنفذة | Implemented Components

### 1. نظام القوالب (Template System)

#### المكونات المُنفذة:
- ✅ `TemplateSelector` - اختيار القالب (Simple/Medium/Complex)
- ✅ `TemplateBadge` - عرض badge القالب في ProductCard
- ✅ `templates.api.ts` - API للقوالب مع fallback
- ✅ Template compatibility validation
- ✅ Suggested groups based on template

#### الملفات:
```
src/components/admin/products/TemplateSelector/index.tsx
src/components/admin/products/TemplateBadge/index.tsx
src/lib/admin/templates.api.ts
```

### 2. واجهة العميل - ProductModal (Customer Frontend)

#### المكونات المُنفذة:
- ✅ `ProductModal` - Modal رئيسي للمنتج
- ✅ `useProductConfiguration` - Hook موحد للتكوين
- ✅ `ProductTemplateRenderer` - عرض القوالب (Simple/Medium/Complex)
- ✅ `ComplexTemplate` - قالب المنتجات المعقدة (BYO)
- ✅ `MediumTemplate` - قالب المنتجات المتوسطة
- ✅ `SimpleTemplate` - قالب المنتجات البسيطة
- ✅ `ContainerSelector` - اختيار الحاوية
- ✅ `SizeSelector` - اختيار الحجم
- ✅ `CustomizationSummary` - ملخص التخصيصات
- ✅ `NutritionInfo` - معلومات التغذية
- ✅ `ActionFooter` - زر الإضافة للسلة

#### التوافق مع Backend:
- ✅ يستخدم `getProductConfiguration` API
- ✅ يدعم Unified Options System
- ✅ يدعم `layout_mode` للقوالب
- ✅ يحسب الأسعار والتغذية بشكل صحيح
- ✅ يدعم validation للاختيارات

#### الملفات:
```
src/components/modals/ProductModal/index.tsx
src/components/modals/ProductModal/useProductLogic.ts
src/components/modals/ProductModal/templates/ProductTemplateRenderer.tsx
src/components/modals/ProductModal/templates/builders/ComplexTemplate.tsx
src/components/modals/ProductModal/templates/composers/MediumTemplate.tsx
src/components/modals/ProductModal/templates/selectors/SimpleTemplate.tsx
src/hooks/useProductConfiguration.ts
```

### 3. نظام UI Config

#### المكونات المُنفذة:
- ✅ `UIConfigEditor` - محرر إعدادات العرض
- ✅ `DynamicIcon` - عرض الأيقونات (emoji, lucide, custom)
- ✅ JSON validation قبل الحفظ
- ✅ Display style options (cards, pills, list, grid)
- ✅ Icon animation & style options
- ✅ Color customization

#### الملفات:
```
src/components/admin/options/UIConfigEditor/index.tsx
src/components/ui/DynamicIcon.tsx
src/lib/uiConfig.ts
```

### 3. إدارة مجموعات الخيارات (Options Management)

#### المكونات المُنفذة:
- ✅ `OptionsPage` - صفحة إدارة المجموعات
- ✅ `OptionGroupCard` - بطاقة المجموعة مع DynamicIcon
- ✅ `GroupFormModal` - نموذج إنشاء/تعديل مع UIConfigEditor
- ✅ `OptionFormModal` - نموذج إنشاء/تعديل الخيارات
- ✅ `OptionItem` - عرض الخيار الفردي
- ✅ Drag & Drop reordering (@dnd-kit)
- ✅ Display style badge
- ✅ Edit UI Config button

#### الملفات:
```
src/components/admin/options/index.tsx
src/components/admin/options/OptionGroupCard.tsx
src/components/admin/options/GroupFormModal.tsx
src/components/admin/options/OptionFormModal.tsx
src/components/admin/options/OptionItem.tsx
```

### 4. إدارة المنتجات (Products Management)

#### المكونات المُنفذة:
- ✅ `ProductsPage` - صفحة إدارة المنتجات
- ✅ `ProductCard` - بطاقة المنتج مع TemplateBadge و OptionGroupsBadge
- ✅ `UnifiedProductForm` - نموذج موحد مع tabs
- ✅ `TemplateSelector` integration
- ✅ `OptionGroupsSection` - إدارة مجموعات الخيارات
- ✅ `NutritionSection` - القيم الغذائية
- ✅ Template compatibility warning
- ✅ Bulk selection & assignment

#### الملفات:
```
src/components/admin/products/index.tsx
src/components/admin/products/ProductCard.tsx
src/components/admin/products/UnifiedProductForm/index.tsx
src/components/admin/products/OptionGroupsBadge/index.tsx
```

---

## ⚠️ الفجوات المحددة | Identified Gaps

### Gap 1: Search Highlighting (متوسط الأولوية)
**Requirement: 4.5**

**الحالة الحالية:**
- البحث يعمل ولكن بدون highlighting للنص المطابق
- `HighlightText` component موجود في `OptionGroupCard` فقط

**المطلوب:**
- تطبيق `highlightText` utility على جميع نتائج البحث
- دعم highlighting للنص العربي والإنجليزي
- تطبيق على `ProductCard` و `OptionsPage`

**الملفات المتأثرة:**
```
src/components/admin/products/ProductCard.tsx
src/components/admin/products/index.tsx
```

---

### Gap 2: Live Preview System (منخفض الأولوية)
**Requirement: 3.5**

**الحالة الحالية:**
- `UIConfigEditor` يعرض preview للأيقونة فقط
- لا يوجد preview كامل لكيفية ظهور المجموعة للعملاء

**المطلوب:**
- إضافة preview panel يستخدم `OptionGroupRenderer`
- عرض كيف ستظهر المجموعة في واجهة العميل
- دعم real-time updates

**الملفات المتأثرة:**
```
src/components/admin/options/UIConfigEditor/index.tsx
src/components/admin/options/GroupFormModal.tsx
```

---

### Gap 3: Template Preview (منخفض الأولوية)
**Requirement: 2.3**

**الحالة الحالية:**
- `TemplateSelector` يعرض وصف القالب فقط
- لا يوجد preview لكيفية ظهور بطاقة المنتج

**المطلوب:**
- إضافة card preview لكل قالب
- استخدام `card_preview_config` من القالب
- عرض مثال حي للبطاقة

**الملفات المتأثرة:**
```
src/components/admin/products/TemplateSelector/index.tsx
```

---

### Gap 4: Option Nutrition Info (منخفض الأولوية)
**Requirement: 4.3**

**الحالة الحالية:**
- `OptionFormModal` لا يدعم إدخال معلومات غذائية للخيارات

**المطلوب:**
- إضافة حقول القيم الغذائية في `OptionFormModal`
- calories, protein, carbs, fat, sugar

**الملفات المتأثرة:**
```
src/components/admin/options/OptionFormModal.tsx
src/components/admin/options/types.ts
```

---

### Gap 5: Bulk Template Assignment (منخفض الأولوية)
**غير موجود في المتطلبات الأصلية**

**الحالة الحالية:**
- `BulkAssignModal` يدعم تعيين option groups فقط
- لا يدعم تعيين template لعدة منتجات

**المطلوب:**
- إضافة خيار تعيين template في bulk operations
- تحديث `BulkAssignModal` أو إنشاء modal جديد

**الملفات المتأثرة:**
```
src/components/admin/products/BulkAssignModal.tsx
```

---

## 🔍 المكونات التي لا تستخدم النظام الجديد

### 1. ProductForm.tsx (Legacy)
**الحالة:** ⚠️ موجود ولكن غير مستخدم

**التفاصيل:**
- الملف موجود كـ legacy component
- تم استبداله بـ `UnifiedProductForm`
- يمكن حذفه بأمان

**التوصية:** حذف الملف

---

### 2. ConfigModal (Deprecated)
**الحالة:** ✅ تم الحذف

**التفاصيل:**
- تم حذف `ConfigModal` واستبداله بـ `UnifiedProductForm`
- جميع الإشارات تم تحديثها

---

## 📋 قائمة الميزات المفقودة | Missing Features List

| # | الميزة | الأولوية | الجهد | المتطلب |
|---|--------|----------|-------|---------|
| 1 | Search Highlighting | متوسط | 2-3 ساعات | 4.5 |
| 2 | Live Preview for UI Config | منخفض | 4-6 ساعات | 3.5 |
| 3 | Template Card Preview | منخفض | 3-4 ساعات | 2.3 |
| 4 | Option Nutrition Fields | منخفض | 2-3 ساعات | 4.3 |
| 5 | Bulk Template Assignment | منخفض | 3-4 ساعات | - |

---

## 🎯 التوصيات | Recommendations

### الأولوية العالية (يجب تنفيذها):
1. ✅ جميع الميزات الأساسية مُنفذة

### الأولوية المتوسطة (يُنصح بتنفيذها):
1. **Search Highlighting** - تحسين تجربة البحث

### الأولوية المنخفضة (تحسينات مستقبلية):
1. Live Preview System
2. Template Card Preview
3. Option Nutrition Fields
4. Bulk Template Assignment

---

## 📊 مقارنة النظام القديم vs الجديد

| الميزة | النظام القديم | النظام الجديد |
|--------|---------------|---------------|
| إدارة القوالب | ❌ غير موجود | ✅ TemplateSelector |
| UI Config | ❌ hard-coded | ✅ metadata-driven |
| الأيقونات | ❌ emoji فقط | ✅ emoji, lucide, custom |
| Drag & Drop | ❌ غير موجود | ✅ @dnd-kit |
| Unified Form | ❌ forms منفصلة | ✅ tabs موحدة |
| Validation | ⚠️ جزئي | ✅ شامل |
| Error Messages | ⚠️ عامة | ✅ مفصلة |

---

## 📁 هيكل الملفات المُحدث

```
src/components/admin/
├── options/
│   ├── UIConfigEditor/
│   │   └── index.tsx          ✅ جديد
│   ├── index.tsx              ✅ محدث
│   ├── OptionGroupCard.tsx    ✅ محدث (DynamicIcon)
│   ├── GroupFormModal.tsx     ✅ محدث (UIConfigEditor)
│   ├── OptionFormModal.tsx    ✅ موجود
│   ├── OptionItem.tsx         ✅ موجود
│   └── types.ts               ✅ محدث
├── products/
│   ├── TemplateSelector/
│   │   └── index.tsx          ✅ جديد
│   ├── TemplateBadge/
│   │   └── index.tsx          ✅ جديد
│   ├── OptionGroupsBadge/
│   │   └── index.tsx          ✅ جديد
│   ├── UnifiedProductForm/
│   │   ├── index.tsx          ✅ محدث (Template tab)
│   │   ├── OptionGroupsSection.tsx ✅ موجود
│   │   ├── NutritionSection.tsx    ✅ موجود
│   │   └── types.ts           ✅ محدث
│   ├── index.tsx              ✅ محدث
│   ├── ProductCard.tsx        ✅ محدث (badges)
│   ├── ProductForm.tsx        ⚠️ legacy (يمكن حذفه)
│   └── types.ts               ✅ محدث
└── lib/admin/
    ├── templates.api.ts       ✅ جديد
    ├── options.api.ts         ✅ موجود
    └── products.api.ts        ✅ موجود
```

---

## ✅ الخلاصة | Conclusion

النظام الجديد مُنفذ بشكل شبه كامل مع:
- **90%** من ميزات Template System
- **85%** من ميزات UI Config System
- **95%** من ميزات Options Management
- **90%** من ميزات Products Management

الفجوات المتبقية هي تحسينات ثانوية لا تؤثر على الوظائف الأساسية.


---

# 📋 خطة التحسين | Improvement Plan

> Requirements: 6.3, 6.4

---

## 🎯 ترتيب التحسينات حسب الأولوية

### 🔴 أولوية عالية (High Priority)
> يجب تنفيذها في أقرب وقت

| # | التحسين | الوصف | الجهد المقدر | التأثير |
|---|---------|-------|-------------|---------|
| - | لا يوجد | جميع الميزات الأساسية مُنفذة | - | - |

**ملاحظة:** جميع الميزات ذات الأولوية العالية تم تنفيذها بنجاح.

---

### 🟡 أولوية متوسطة (Medium Priority)
> يُنصح بتنفيذها لتحسين تجربة المستخدم

| # | التحسين | الوصف | الجهد المقدر | التأثير |
|---|---------|-------|-------------|---------|
| M1 | Search Highlighting | إضافة highlighting للنص المطابق في البحث | 2-3 ساعات | متوسط |

#### M1: Search Highlighting

**الوصف:**
تحسين تجربة البحث بإضافة highlighting للنص المطابق في نتائج البحث.

**المهام:**
1. إنشاء `highlightText` utility function
2. تطبيق على `ProductCard` (الاسم العربي والإنجليزي)
3. تطبيق على `OptionsPage` (أسماء المجموعات والخيارات)
4. دعم RTL للنص العربي

**الملفات المتأثرة:**
```
src/lib/utils/highlightText.ts (جديد)
src/components/admin/products/ProductCard.tsx
src/components/admin/products/index.tsx
```

**الجهد المقدر:** 2-3 ساعات

**التأثير:** تحسين تجربة البحث وسهولة العثور على العناصر

---

### 🟢 أولوية منخفضة (Low Priority)
> تحسينات مستقبلية يمكن تأجيلها

| # | التحسين | الوصف | الجهد المقدر | التأثير |
|---|---------|-------|-------------|---------|
| L1 | Live Preview for UI Config | معاينة حية لإعدادات العرض | 4-6 ساعات | منخفض |
| L2 | Template Card Preview | معاينة بطاقة المنتج للقالب | 3-4 ساعات | منخفض |
| L3 | Option Nutrition Fields | حقول القيم الغذائية للخيارات | 2-3 ساعات | منخفض |
| L4 | Bulk Template Assignment | تعيين قالب لعدة منتجات | 3-4 ساعات | منخفض |
| L5 | Delete Legacy ProductForm | حذف الملف القديم | 0.5 ساعة | منخفض |

---

## 📝 تفاصيل التحسينات ذات الأولوية المنخفضة

### L1: Live Preview for UI Config

**الوصف:**
إضافة panel معاينة حية في `UIConfigEditor` يعرض كيف ستظهر المجموعة للعملاء.

**المهام:**
1. إضافة preview panel في `UIConfigEditor`
2. استخدام `OptionGroupRenderer` للمعاينة
3. تحديث المعاينة في real-time عند تغيير الإعدادات
4. إضافة sample options للمعاينة

**الملفات المتأثرة:**
```
src/components/admin/options/UIConfigEditor/index.tsx
src/components/admin/options/UIConfigEditor/PreviewPanel.tsx (جديد)
```

**الجهد المقدر:** 4-6 ساعات

---

### L2: Template Card Preview

**الوصف:**
إضافة معاينة لبطاقة المنتج في `TemplateSelector` لكل قالب.

**المهام:**
1. إنشاء `TemplatePreviewCard` component
2. استخدام `card_preview_config` من القالب
3. عرض مثال حي للبطاقة (CompactCard, StandardCard, WizardCard)
4. إضافة toggle للتبديل بين الوصف والمعاينة

**الملفات المتأثرة:**
```
src/components/admin/products/TemplateSelector/index.tsx
src/components/admin/products/TemplateSelector/TemplatePreviewCard.tsx (جديد)
```

**الجهد المقدر:** 3-4 ساعات

---

### L3: Option Nutrition Fields

**الوصف:**
إضافة حقول القيم الغذائية في نموذج إنشاء/تعديل الخيارات.

**المهام:**
1. تحديث `OptionFormModal` لإضافة حقول التغذية
2. تحديث `OptionFormData` type
3. تحديث API لحفظ القيم الغذائية
4. عرض القيم الغذائية في `OptionItem`

**الملفات المتأثرة:**
```
src/components/admin/options/OptionFormModal.tsx
src/components/admin/options/OptionItem.tsx
src/components/admin/options/types.ts
src/lib/admin/options.api.ts
```

**الجهد المقدر:** 2-3 ساعات

---

### L4: Bulk Template Assignment

**الوصف:**
إضافة إمكانية تعيين قالب لعدة منتجات دفعة واحدة.

**المهام:**
1. إضافة tab جديد في `BulkAssignModal` للقوالب
2. إضافة `TemplateSelector` في الـ modal
3. تحديث API لدعم bulk template assignment
4. إضافة validation للتوافق

**الملفات المتأثرة:**
```
src/components/admin/products/BulkAssignModal.tsx
src/lib/admin/products.api.ts
```

**الجهد المقدر:** 3-4 ساعات

---

### L5: Delete Legacy ProductForm

**الوصف:**
حذف ملف `ProductForm.tsx` القديم الذي تم استبداله بـ `UnifiedProductForm`.

**المهام:**
1. التأكد من عدم وجود imports للملف
2. حذف الملف
3. تحديث أي documentation

**الملفات المتأثرة:**
```
src/components/admin/products/ProductForm.tsx (حذف)
```

**الجهد المقدر:** 0.5 ساعة

---

## 📅 الجدول الزمني المقترح

### الأسبوع 1 (اختياري):
- [ ] M1: Search Highlighting (2-3 ساعات)

### الأسبوع 2-3 (اختياري):
- [ ] L1: Live Preview for UI Config (4-6 ساعات)
- [ ] L2: Template Card Preview (3-4 ساعات)

### الأسبوع 4 (اختياري):
- [ ] L3: Option Nutrition Fields (2-3 ساعات)
- [ ] L4: Bulk Template Assignment (3-4 ساعات)
- [ ] L5: Delete Legacy ProductForm (0.5 ساعة)

---

## 📊 ملخص الجهد الإجمالي

| الأولوية | عدد التحسينات | الجهد الإجمالي |
|----------|---------------|----------------|
| عالية | 0 | 0 ساعات |
| متوسطة | 1 | 2-3 ساعات |
| منخفضة | 5 | 13-17.5 ساعة |
| **الإجمالي** | **6** | **15-20.5 ساعة** |

---

## ✅ Action Items

### فوري (Immediate):
- [x] إنشاء تقرير تحليل الفجوات
- [x] إنشاء خطة التحسين

### قريب (Short-term):
- [ ] تنفيذ Search Highlighting (M1)

### مستقبلي (Future):
- [ ] تنفيذ التحسينات ذات الأولوية المنخفضة حسب الحاجة

---

## 📌 ملاحظات ختامية

1. **النظام الحالي مستقر وقابل للاستخدام** - جميع الميزات الأساسية مُنفذة
2. **التحسينات المقترحة اختيارية** - لا تؤثر على الوظائف الأساسية
3. **يُنصح بتنفيذ Search Highlighting** - تحسين ملموس لتجربة المستخدم
4. **التحسينات الأخرى يمكن تأجيلها** - حسب الأولويات والموارد المتاحة

---

---

## 🔌 Backend API Compatibility Analysis

### ✅ APIs المتوافقة بالكامل

| API Endpoint | Frontend Usage | Backend Handler | Status |
|--------------|----------------|-----------------|--------|
| `GET /products/:id/configuration` | `useProductConfiguration` | `customizationService.getProductConfiguration` | ✅ |
| `GET /admin/options` | `options.api.ts` | `byo.js/handleGetOptions` | ✅ |
| `POST /admin/options` | `createOption()` | `byo.js/handleCreateOption` | ✅ |
| `PUT /admin/options/:id` | `updateOption()` | `byo.js/handleUpdateOption` | ✅ |
| `DELETE /admin/options/:id` | `deleteOption()` | `byo.js/handleDeleteOption` | ✅ |
| `GET /admin/option-groups` | `getOptionGroups()` | `byo.js/handleGetOptionGroups` | ✅ |
| `POST /admin/option-groups` | `createOptionGroup()` | `byo.js/handleCreateOptionGroup` | ✅ |
| `PUT /admin/option-groups/:id` | `updateOptionGroup()` | `byo.js/handleUpdateOptionGroup` | ✅ |
| `DELETE /admin/option-groups/:id` | `deleteOptionGroup()` | `byo.js/handleDeleteOptionGroup` | ✅ |
| `GET /admin/containers` | `getContainers()` | `byo.js/handleGetContainers` | ✅ |
| `GET /admin/sizes` | `getSizes()` | `byo.js/handleGetSizes` | ✅ |
| `GET /admin/templates` | `templates.api.ts` | `templates.js` | ✅ |

### Database Schema Compatibility

```sql
-- Unified Options System (Backend)
option_groups (id, name_ar, name_en, ui_config, icon, display_order)
options (id, group_id, name_ar, name_en, base_price, calories, ...)
product_options (product_id, option_group_id, is_required, min_selections, max_selections)
product_templates (id, name_ar, complexity, option_groups_min, option_groups_max)
```

### Frontend Data Mapping

| Frontend Field | Backend Field | Notes |
|----------------|---------------|-------|
| `containerObj.priceModifier` | `options.base_price` | Containers are options with group_id='containers' |
| `sizeObj.priceModifier` | `options.base_price` | Sizes are options with group_id='sizes' |
| `customizationRules` | `option_groups + options` | Joined data from both tables |
| `layout_mode` | `products.layout_mode` | 'simple', 'medium', 'complex' |
| `template_id` | `products.template_id` | Reference to product_templates |

### ✅ Key Compatibility Points

1. **Unified Options System**: Frontend `useProductConfiguration` correctly maps to backend unified options
2. **Containers/Sizes**: Both are stored as options with special group_ids ('containers', 'sizes')
3. **UI Config**: JSON stored in `option_groups.ui_config`, parsed by frontend
4. **Templates**: `product_templates` table with complexity levels matches frontend template system
5. **Nutrition**: All nutrition fields (calories, protein, carbs, etc.) are consistent

### ⚠️ Minor Compatibility Notes

1. **Legacy Support**: `ProductTemplateRenderer` supports legacy `layout_mode` values ('builder', 'composer', 'selector')
2. **Fallback Templates**: `templates.api.ts` has fallback templates when API is unavailable
3. **Price Mapping**: Backend uses `base_price`, frontend maps to `priceModifier` for containers/sizes

---

*تم إنشاء هذا التقرير كجزء من spec: admin-testing-ui-improvement*
*Requirements: 6.1, 6.2, 6.3, 6.4*
