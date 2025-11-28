# 📊 Backend Data Flow Documentation
## دليل شامل لفهم البيانات القادمة من الـ Backend

---

## 🗄️ Database Schema Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DATABASE STRUCTURE                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐          │
│  │  products   │────▶│ product_options  │◀────│  option_groups  │          │
│  │             │     │    (rules)       │     │                 │          │
│  └──────┬──────┘     └────────┬─────────┘     └────────┬────────┘          │
│         │                     │                        │                    │
│         │                     ▼                        ▼                    │
│         │            ┌─────────────────┐      ┌─────────────────┐          │
│         │            │    options      │◀─────│   (flavors,     │          │
│         │            │                 │      │   toppings,     │          │
│         │            └─────────────────┘      │   sauces)       │          │
│         │                                     └─────────────────┘          │
│         │                                                                   │
│         ▼                                                                   │
│  ┌──────────────────┐     ┌─────────────────┐                              │
│  │product_containers│────▶│ container_types │  (كوب / كون)                 │
│  └──────────────────┘     └─────────────────┘                              │
│         │                                                                   │
│         ▼                                                                   │
│  ┌──────────────────┐     ┌─────────────────┐                              │
│  │product_size_opts │────▶│  product_sizes  │  (صغير/وسط/كبير)             │
│  └──────────────────┘     └─────────────────┘                              │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📦 Products Table

### الحقول الأساسية (مستخدمة ✅)
| Field | Type | Description | Frontend Usage |
|-------|------|-------------|----------------|
| `id` | TEXT | معرف المنتج | ✅ مستخدم |
| `name` | TEXT | الاسم بالعربي | ✅ مستخدم |
| `nameEn` | TEXT | الاسم بالإنجليزي | ✅ مستخدم |
| `price` | REAL | السعر الأساسي | ✅ مستخدم |
| `image` | TEXT | رابط الصورة | ✅ مستخدم |
| `category` | TEXT | التصنيف بالعربي | ✅ مستخدم |
| `categoryEn` | TEXT | التصنيف بالإنجليزي | ⚠️ غير مستخدم |
| `description` | TEXT | الوصف بالعربي | ✅ مستخدم |
| `descriptionEn` | TEXT | الوصف بالإنجليزي | ⚠️ غير مستخدم |
| `badge` | TEXT | شارة المنتج | ✅ مستخدم |
| `available` | INTEGER | متاح للبيع | ✅ مستخدم (filtering) |
| `is_customizable` | INTEGER | قابل للتخصيص | ✅ مستخدم |
| `product_type` | TEXT | نوع المنتج | ✅ مستخدم |

### حقول التغذية (مستخدمة ✅)
| Field | Type | Description | Frontend Usage |
|-------|------|-------------|----------------|
| `calories` | INTEGER | السعرات الحرارية | ✅ مستخدم |
| `protein` | REAL | البروتين | ✅ مستخدم |
| `carbs` | REAL | الكربوهيدرات | ✅ مستخدم |
| `fat` | REAL | الدهون | ✅ مستخدم |
| `sugar` | REAL | السكر | ✅ مستخدم |
| `fiber` | REAL | الألياف | ✅ مستخدم |

### حقول الطاقة (مستخدمة ✅)
| Field | Type | Description | Frontend Usage |
|-------|------|-------------|----------------|
| `energy_type` | TEXT | نوع الطاقة (mental/physical/balanced) | ✅ مستخدم |
| `energy_score` | INTEGER | درجة الطاقة | ✅ مستخدم |

### حقول JSON (Metadata)
| Field | Type | Description | Frontend Usage |
|-------|------|-------------|----------------|
| `tags` | TEXT (JSON) | التاجات | ⚠️ محدود الاستخدام |
| `ingredients` | TEXT (JSON) | المكونات | ⚠️ محدود الاستخدام |
| `nutrition_facts` | TEXT (JSON) | معلومات تغذية إضافية | ❌ غير مستخدم |
| `allergens` | TEXT (JSON) | مسببات الحساسية | ⚠️ محدود الاستخدام |
| `allowed_addons` | TEXT (JSON) | الإضافات المسموحة | ⚠️ نظام قديم |

---

## 🎨 Product Types

```
product_type VALUES:
├── 'byo_ice_cream'     → Build Your Own (تخصيص كامل)
├── 'preset_ice_cream'  → آيس كريم جاهز (مقاسات + إضافات)
├── 'milkshake'         → ميلك شيك (مقاسات + إضافات)
├── 'dessert'           → حلويات (إضافات فقط)
└── 'standard'          → منتج عادي (بدون تخصيص)
```

---

## 📦 Container Types Table

```sql
container_types {
  id: TEXT PRIMARY KEY
  name_ar: TEXT          -- "كوب" / "كون"
  name_en: TEXT          -- "Cup" / "Cone"
  description_ar: TEXT
  description_en: TEXT
  price_modifier: REAL   -- فرق السعر (+0 للكوب، +5 للكون)
  image: TEXT
  -- Nutrition (الكون له سعرات)
  calories: INTEGER
  protein: REAL
  carbs: REAL
  sugar: REAL
  fat: REAL
  fiber: REAL
  max_sizes: INTEGER     -- الكوب=3، الكون=1
  display_order: INTEGER
  available: INTEGER
}
```

### Frontend Response Format:
```typescript
interface ContainerType {
  id: string
  name: string           // حسب اللغة
  nameAr: string
  nameEn: string
  description?: string
  priceModifier: number
  image?: string
  maxSizes: number
  isDefault: boolean
  nutrition: {
    calories: number
    protein: number
    carbs: number
    sugar: number
    fat: number
    fiber: number
  }
}
```

---

## 📏 Product Sizes Table

```sql
product_sizes {
  id: TEXT PRIMARY KEY
  name_ar: TEXT              -- "صغير" / "وسط" / "كبير"
  name_en: TEXT              -- "Small" / "Medium" / "Large"
  price_modifier: REAL       -- -10 / 0 / +10
  nutrition_multiplier: REAL -- 0.7 / 1.0 / 1.3
  display_order: INTEGER
}
```

### Frontend Response Format:
```typescript
interface ProductSize {
  id: string
  name: string           // حسب اللغة
  nameAr: string
  nameEn: string
  priceModifier: number
  nutritionMultiplier: number
  isDefault: boolean
  containerId?: string   // إذا كان مرتبط بحاوية معينة
}
```

---

## 🎨 Customization System

### Option Groups Table
```sql
option_groups {
  id: TEXT PRIMARY KEY
  name_ar: TEXT          -- "النكهات" / "الإضافات" / "الصوصات"
  name_en: TEXT
  description_ar: TEXT
  description_en: TEXT
  display_order: INTEGER
  icon: TEXT             -- أيقونة المجموعة
}
```

### Options Table
```sql
options {
  id: TEXT PRIMARY KEY
  group_id: TEXT         -- FK to option_groups
  name_ar: TEXT
  name_en: TEXT
  description_ar: TEXT
  description_en: TEXT
  base_price: REAL       -- السعر الأساسي
  image: TEXT
  available: INTEGER
  display_order: INTEGER
  -- Nutrition
  calories: INTEGER
  protein: REAL
  carbs: REAL
  sugar: REAL
  fat: REAL
  fiber: REAL
}
```

### Product Options (Rules) Table
```sql
product_options {
  id: INTEGER PRIMARY KEY
  product_id: TEXT       -- FK to products
  option_group_id: TEXT  -- FK to option_groups
  is_required: INTEGER   -- هل مطلوب؟
  min_selections: INTEGER -- الحد الأدنى
  max_selections: INTEGER -- الحد الأقصى
  price_override: REAL   -- سعر مخصص (يتجاوز base_price)
  display_order: INTEGER
}
```

### Frontend Response Format:
```typescript
interface CustomizationRule {
  groupId: string
  groupName: string        // حسب اللغة
  groupDescription?: string
  groupIcon?: string
  isRequired: boolean
  minSelections: number
  maxSelections: number
  priceOverride?: number
  displayOrder: number
  options: Array<{
    id: string
    name_ar: string
    name_en: string
    description_ar?: string
    description_en?: string
    price: number          // base_price أو price_override
    image?: string
    display_order: number
    nutrition: {
      calories: number
      protein: number
      carbs: number
      sugar: number
      fat: number
      fiber: number
    }
  }>
}
```

---

## 🔄 API Endpoints

### 1. Get Product Configuration (الأهم)
```
GET /products/{productId}/configuration?lang=ar
```

**Response:**
```typescript
interface ProductConfiguration {
  product: {
    id: string
    name: string
    nameAr: string
    nameEn: string
    basePrice: number
    productType: 'byo_ice_cream' | 'preset_ice_cream' | 'milkshake' | 'dessert' | 'standard'
    isCustomizable: boolean
    baseNutrition: NutritionValues
  }
  hasContainers: boolean
  containers: ContainerType[]
  hasSizes: boolean
  sizes: ProductSize[]
  hasCustomization: boolean
  customizationRules: CustomizationRule[]
}
```

### 2. Get Products List
```
GET /products
```

### 3. Get Single Product
```
GET /products/{productId}?expand=ingredients,nutrition,allergens,addons
```

### 4. Calculate Price
```
POST /products/{productId}/calculate-price
Body: {
  containerId?: string
  sizeId?: string
  selections?: Record<string, string[]>
  quantity?: number
}
```

---

## ⚠️ Unused/Deprecated Data

### حقول غير مستخدمة في الـ Frontend:

| Field | Table | Reason |
|-------|-------|--------|
| `categoryEn` | products | لا يوجد دعم للغة الإنجليزية في الـ UI |
| `descriptionEn` | products | لا يوجد دعم للغة الإنجليزية في الـ UI |
| `nutrition_facts` | products | تم استبداله بحقول منفصلة |
| `allowed_addons` | products | نظام قديم - تم استبداله بـ customization |
| `tags` | products | استخدام محدود جداً |
| `allergens` | products | لا يظهر في الـ UI |
| `ingredients` | products | لا يظهر في الـ UI |

### أنظمة قديمة (Deprecated):
1. **Addons System** (`addons` table + `allowed_addons` field)
   - تم استبداله بـ Customization System
   - لا يزال موجود للتوافق مع الطلبات القديمة

---

## 📊 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              DATA FLOW                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  User Opens Product Modal                                                    │
│           │                                                                  │
│           ▼                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  API Call: GET /products/{id}/configuration                          │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│           │                                                                  │
│           ▼                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Backend: getProductConfiguration()                                  │   │
│  │  ├── Fetch product from products table                               │   │
│  │  ├── Fetch containers from container_types + product_containers      │   │
│  │  ├── Fetch sizes from product_sizes + product_size_options           │   │
│  │  └── Fetch rules from product_options + option_groups + options      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│           │                                                                  │
│           ▼                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Frontend: useProductConfiguration() Hook                            │   │
│  │  ├── Parse configuration                                             │   │
│  │  ├── Set default container & size                                    │   │
│  │  ├── Calculate prices dynamically                                    │   │
│  │  └── Calculate nutrition dynamically                                 │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│           │                                                                  │
│           ▼                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Template Rendering (based on product_type)                          │   │
│  │  ├── BYOTemplate      → Full customization                           │   │
│  │  ├── PresetTemplate   → Sizes + Addons                               │   │
│  │  ├── MilkshakeTemplate→ Sizes + Addons                               │   │
│  │  ├── DessertTemplate  → Addons only                                  │   │
│  │  └── StandardTemplate → No customization                             │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Price Calculation Formula

```
Total Price = Base Price
            + Container Price Modifier
            + Size Price Modifier
            + Σ(Selected Options Prices)
```

## 🥗 Nutrition Calculation Formula

```
Total Nutrition = Container Nutrition (fixed)
                + (Σ(Selected Options Nutrition) × Size Multiplier)
```

---

## 📝 Notes for Developers

1. **Language Support**: حالياً الـ Frontend يستخدم العربي فقط، لكن الـ Backend يدعم الإنجليزي
2. **Price Security**: الأسعار تُحسب في الـ Backend فقط - لا ترسل أسعار من الـ Frontend
3. **Caching**: الـ Backend يستخدم caching للـ products و configurations
4. **Validation**: الـ Backend يتحقق من صحة الاختيارات قبل إنشاء الطلب

---

*Last Updated: November 28, 2025*
