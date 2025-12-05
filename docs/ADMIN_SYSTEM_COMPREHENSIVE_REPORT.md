# 📊 تقرير شامل: نظام إدارة Soft Cream

> تاريخ التقرير: 2025-12-04
> الإصدار: 2.0

---

## 📑 فهرس المحتويات

1. [نظرة عامة](#نظرة-عامة)
2. [هيكل لوحة التحكم](#هيكل-لوحة-التحكم)
3. [نظام المنتجات](#نظام-المنتجات)
4. [نظام القوالب (Templates)](#نظام-القوالب)
5. [نظام الخيارات (Options)](#نظام-الخيارات)
6. [تدفق البيانات](#تدفق-البيانات)
7. [الـ API Endpoints](#الـ-api-endpoints)
8. [خريطة الملفات](#خريطة-الملفات)

---

## نظرة عامة

### الهدف
نظام إدارة متكامل لمتجر Soft Cream يتيح:
- إدارة المنتجات والأسعار
- تخصيص خيارات المنتجات (نكهات، إضافات، صوصات)
- إدارة الطلبات والعملاء
- نظام الكوبونات والخصومات
- تحليلات المبيعات

### التقنيات المستخدمة
| الطبقة | التقنية |
|--------|---------|
| Frontend | Next.js 14 + React 18 + TypeScript |
| Styling | Tailwind CSS |
| Backend | Cloudflare Workers + Hono |
| Database | Cloudflare D1 (SQLite) |
| State | React useState + useEffect |

---

## هيكل لوحة التحكم

### الصفحات الرئيسية

```
/admin
├── 📊 Dashboard      - لوحة التحكم الرئيسية
├── 📦 Orders         - إدارة الطلبات
├── 🛍️ Products       - إدارة المنتجات
├── ⚙️ Customization  - إعدادات التخصيص (Option Groups)
├── 🏷️ Coupons        - إدارة الكوبونات
├── 👥 Users          - إدارة العملاء
├── 📈 Analytics      - الإحصائيات
└── ⚙️ Settings       - الإعدادات العامة
```

### المكونات الرئيسية

```
src/components/admin/
├── AdminApp.tsx              # المكون الرئيسي
├── Sidebar.tsx               # القائمة الجانبية
├── Header.tsx                # الهيدر
├── DashboardPage.tsx         # لوحة التحكم
├── OrdersPage.tsx            # الطلبات
├── ProductsPage.tsx          # المنتجات (wrapper)
├── CustomizationSettingsPage.tsx  # التخصيص
├── CouponsPage.tsx           # الكوبونات
├── UsersPage.tsx             # العملاء
├── AnalyticsPage.tsx         # الإحصائيات
└── SettingsPage.tsx          # الإعدادات
```

---

## نظام المنتجات

### صلاحيات الأدمن

| الصلاحية | الوصف | الـ API |
|----------|-------|---------|
| عرض المنتجات | قائمة كل المنتجات | `GET /admin/products` |
| إضافة منتج | إنشاء منتج جديد | `POST /admin/products/unified` |
| تعديل منتج | تحديث بيانات منتج | `PUT /admin/products/:id/unified` |
| حذف منتج | حذف منتج | `DELETE /admin/products/:id` |
| تغيير التوفر | تفعيل/تعطيل منتج | `PUT /admin/products/:id` |
| تعيين خيارات | ربط option groups | `PUT /admin/products/:id/unified` |
| تعيين جماعي | ربط خيارات لعدة منتجات | `POST /admin/products/bulk-assign` |

### بيانات المنتج

```typescript
interface Product {
  // الأساسيات
  id: string;
  name: string;
  nameEn?: string;
  category: string;
  categoryEn?: string;
  price: number;
  description?: string;
  descriptionEn?: string;
  image?: string;
  badge?: string;
  available: 0 | 1;
  
  // القالب (Template)
  template_id: string;  // 'template_1' | 'template_2' | 'template_3'
  
  // الخصم
  old_price?: number;
  discount_percentage?: number;
  
  // القيم الغذائية
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  sugar?: number;
  fiber?: number;
  
  // الطاقة
  energy_type?: 'mental' | 'physical' | 'balanced' | 'none';
  energy_score?: number;
  
  // الصحة
  health_keywords?: string[];  // JSON array
  health_benefit_ar?: string;
}
```

### واجهات إضافة/تعديل المنتج

#### 1. ProductWizard (الوضع البسيط) ✨ جديد

```
الخطوة 1: الأساسيات
├── اسم المنتج (عربي/إنجليزي)
├── السعر
├── الفئة
├── الصورة
└── الخصم (اختياري)

الخطوة 2: القالب والخيارات
├── اختيار القالب (بسيط/قياسي/BYO)
└── تعيين مجموعات الخيارات

الخطوة 3: التغذية (اختياري)
├── السعرات والقيم الغذائية
├── نوع الطاقة
└── الكلمات الصحية
```

#### 2. UnifiedProductForm (الوضع المتقدم)

```
Tab 1: تفاصيل المنتج
Tab 2: القالب
Tab 3: مجموعات الخيارات
Tab 4: القيم الغذائية
```

---

## نظام القوالب

### القوالب المتاحة

| القالب | الوصف | عدد الخيارات | الاستخدام |
|--------|-------|--------------|-----------|
| `template_1` | بسيط | 0-1 | منتجات بدون تخصيص |
| `template_2` | قياسي | 1-3 | منتجات مع خيارات أساسية |
| `template_3` | BYO | 2-6 | اصنع بنفسك |

### تأثير القالب على العرض

#### في الـ Frontend (العميل)

```
ProductCard (الكارد)
├── template_1 → SimpleCard
├── template_2 → StandardProductCard
└── template_3 → BYOProductCard

ProductModal (المودال)
├── template_1 → SimpleTemplate
├── template_2 → StandardTemplate
└── template_3 → BYOTemplate (wizard steps)
```

#### الملفات المسؤولة

```
src/components/ui/cards/
├── SimpleCard.tsx           # للمنتجات البسيطة
├── StandardProductCard.tsx  # للمنتجات القياسية
└── BYOProductCard.tsx       # لـ Build Your Own

src/components/modals/ProductModal/templates/
├── ProductTemplateRenderer.tsx  # يختار القالب المناسب
├── SimpleTemplate.tsx
├── StandardTemplate.tsx
└── BYOTemplate.tsx
```

---

## نظام الخيارات

### هيكل البيانات

```
Option Groups (مجموعات الخيارات)
├── id: string
├── name_ar: string
├── name_en: string
├── icon: string
├── display_order: number
├── selection_type: 'single' | 'multiple'
├── min_selections: number
├── max_selections: number
└── options: Option[]

Option (خيار واحد)
├── id: string
├── group_id: string
├── name_ar: string
├── name_en: string
├── base_price: number
├── available: 0 | 1
├── calories: number
├── protein: number
├── carbs: number
├── fat: number
├── sugar: number
└── fiber: number
```

### صلاحيات إدارة الخيارات

| الصلاحية | الوصف | الـ API |
|----------|-------|---------|
| عرض المجموعات | قائمة كل المجموعات | `GET /admin/byo/options` |
| إضافة مجموعة | إنشاء مجموعة جديدة | `POST /admin/byo/groups` |
| تعديل مجموعة | تحديث بيانات مجموعة | `PUT /admin/byo/groups/:id` |
| حذف مجموعة | حذف مجموعة | `DELETE /admin/byo/groups/:id` |
| إضافة خيار | إنشاء خيار جديد | `POST /admin/byo/options` |
| تعديل خيار | تحديث بيانات خيار | `PUT /admin/byo/options/:id` |
| حذف خيار | حذف خيار | `DELETE /admin/byo/options/:id` |
| تغيير التوفر | تفعيل/تعطيل خيار | `PUT /admin/byo/options/:id/availability` |
| إعادة الترتيب | ترتيب المجموعات | `PUT /admin/byo/groups/reorder` |

### واجهات إدارة الخيارات

```
صفحة التخصيص (/admin → Customization)
├── عرض المجموعات (Cards View)
│   ├── OptionGroupCard - كارد لكل مجموعة
│   ├── OptionItem - عنصر لكل خيار
│   └── Drag & Drop لإعادة الترتيب
│
└── جدول شامل (Table View)
    └── OptionsTable - جدول مع inline editing
```

---

## تدفق البيانات

### إضافة منتج جديد

```
1. الأدمن يضغط "إضافة منتج"
   ↓
2. يفتح ProductWizard
   ↓
3. الخطوة 1: إدخال الأساسيات
   ↓
4. الخطوة 2: اختيار القالب + الخيارات
   ↓
5. الخطوة 3: القيم الغذائية (اختياري)
   ↓
6. الضغط على "حفظ"
   ↓
7. API Call: POST /admin/products/unified
   {
     product: { ... },
     optionGroups: [ { groupId, isRequired, min, max } ]
   }
   ↓
8. Backend يحفظ في:
   - products table
   - product_options table (العلاقات)
   ↓
9. تحديث القائمة في الـ Frontend
```

### عرض المنتج للعميل

```
1. العميل يفتح صفحة المنتجات
   ↓
2. API Call: GET /products
   ↓
3. لكل منتج:
   - قراءة template_id
   - اختيار الكارد المناسب
   ↓
4. عند الضغط على المنتج:
   - API Call: GET /products/:id
   - يشمل option_groups المرتبطة
   ↓
5. ProductModal يعرض:
   - ProductTemplateRenderer يختار القالب
   - عرض الخيارات حسب القالب
```

---

## الـ API Endpoints

### Products API

```
GET    /admin/products              # قائمة المنتجات
GET    /admin/products/:id          # منتج واحد
POST   /admin/products/unified      # إنشاء منتج مع الخيارات
PUT    /admin/products/:id/unified  # تحديث منتج مع الخيارات
DELETE /admin/products/:id          # حذف منتج
POST   /admin/products/bulk-assign  # تعيين جماعي
```

### Options API

```
GET    /admin/byo/options           # كل المجموعات والخيارات
POST   /admin/byo/groups            # إنشاء مجموعة
PUT    /admin/byo/groups/:id        # تحديث مجموعة
DELETE /admin/byo/groups/:id        # حذف مجموعة
PUT    /admin/byo/groups/reorder    # إعادة ترتيب

POST   /admin/byo/options           # إنشاء خيار
PUT    /admin/byo/options/:id       # تحديث خيار
DELETE /admin/byo/options/:id       # حذف خيار
PUT    /admin/byo/options/:id/availability  # تغيير التوفر
```

### Templates API

```
GET    /admin/templates             # قائمة القوالب
GET    /admin/templates/:id         # قالب واحد
```

---

## خريطة الملفات

### Frontend (Next.js)

```
soft-cream-nextjs/
├── src/
│   ├── app/admin/page.tsx          # صفحة الأدمن
│   │
│   ├── components/admin/
│   │   ├── AdminApp.tsx            # المكون الرئيسي
│   │   ├── Sidebar.tsx             # القائمة الجانبية
│   │   │
│   │   ├── products/
│   │   │   ├── index.tsx           # صفحة المنتجات
│   │   │   ├── ProductCard.tsx     # كارد المنتج
│   │   │   ├── ProductWizard/      # ✨ Wizard جديد
│   │   │   │   ├── index.tsx
│   │   │   │   ├── BasicInfoStep.tsx
│   │   │   │   ├── TemplateOptionsStep.tsx
│   │   │   │   └── NutritionStep.tsx
│   │   │   ├── UnifiedProductForm/ # الفورم المتقدم
│   │   │   ├── BulkAssignModal.tsx
│   │   │   └── types.ts
│   │   │
│   │   ├── options/
│   │   │   ├── index.tsx           # صفحة الخيارات
│   │   │   ├── OptionGroupCard.tsx
│   │   │   ├── OptionItem.tsx
│   │   │   ├── OptionsTable.tsx    # جدول شامل
│   │   │   ├── GroupFormModal.tsx
│   │   │   ├── OptionFormModal.tsx
│   │   │   └── types.ts
│   │   │
│   │   └── coupons/
│   │       └── ...
│   │
│   ├── lib/admin/
│   │   ├── index.ts                # تصدير موحد
│   │   ├── products.api.ts         # API المنتجات
│   │   ├── options.api.ts          # API الخيارات
│   │   ├── templates.api.ts        # API القوالب
│   │   └── validation/             # التحقق من البيانات
│   │
│   └── components/modals/ProductModal/
│       ├── index.tsx               # المودال الرئيسي
│       └── templates/
│           ├── ProductTemplateRenderer.tsx
│           ├── SimpleTemplate.tsx
│           ├── StandardTemplate.tsx
│           └── BYOTemplate.tsx
```

### Backend (Cloudflare Workers)

```
softcream-api/
├── src/
│   ├── index.js                    # Entry point
│   │
│   ├── routes/admin/
│   │   ├── index.js                # Admin router
│   │   ├── products.js             # Products endpoints
│   │   ├── byo.js                  # Options endpoints
│   │   ├── templates.js            # Templates endpoints
│   │   └── ...
│   │
│   ├── database/
│   │   ├── schemas/
│   │   │   ├── products.js         # Products schema
│   │   │   └── ...
│   │   └── init.js                 # DB initialization
│   │
│   └── services/
│       ├── customizationService.js # Options logic
│       └── ...
│
└── schema.sql                      # Database schema
```

---

## ملاحظات للمطورين

### عند تعديل القوالب

1. تحديث `templates` table في الـ Backend
2. تحديث `TEMPLATE_PRESETS` في `TemplateOptionsStep.tsx`
3. تحديث `ProductTemplateRenderer.tsx` لدعم القالب الجديد
4. إنشاء component جديد للقالب في `templates/`

### عند إضافة حقل جديد للمنتج

1. تحديث `products` table في `schema.sql`
2. تحديث `Product` interface في `products.api.ts`
3. تحديث `ProductFormData` في `types.ts`
4. إضافة الحقل في `BasicInfoStep.tsx` أو `NutritionStep.tsx`
5. تحديث `handleUnifiedSubmit` في `products/index.tsx`

### عند إضافة مجموعة خيارات جديدة

1. إضافة من واجهة الأدمن (Customization)
2. أو عبر API: `POST /admin/byo/groups`
3. الخيارات ستظهر تلقائياً في فورم المنتج

---

## الخلاصة

نظام الأدمن يوفر تحكم كامل في:
- ✅ المنتجات (CRUD + bulk operations)
- ✅ القوالب (3 أنواع)
- ✅ الخيارات (groups + options)
- ✅ الأسعار والخصومات
- ✅ القيم الغذائية
- ✅ التوفر والحالة

مع واجهتين للإضافة/التعديل:
- 🧙 **Wizard**: للاستخدام اليومي السريع
- ⚙️ **Advanced**: للتحكم الكامل في كل التفاصيل
