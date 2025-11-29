# 🏗️ Category-Based Architecture Plan

## 📊 تحليل الوضع الحالي

### هيكل البيانات:
```
API → getProducts() → Product[]
                         ↓
                    category: string (من الباك إند)
                         ↓
              ProductsGrid يجمع بالـ category
                         ↓
              ProductsSwiper يعرض كل category
```

### الـ Categories الحالية (من الباك إند):
- `soft_serve` - سوفت سيرف (Custom Cup/Cone - BYO)
- `milkshake` - ميلك شيك
- `dessert` - حلويات
- `preset` - نكهات جاهزة

### المشكلة الحالية:
1. **ProductCard واحد لكل المنتجات** - مش بيفرق بين BYO والعادي
2. **الـ category مجرد string** - مفيش metadata إضافية
3. **التصميم موحد** - كل الكروت شكلها واحد

---

## 🎯 الرؤية الجديدة: Category-Driven UI

### المبدأ:
> **الـ Category هي المحرك الأساسي للتصميم والسلوك**

### الفوائد:
1. ✅ تصميم مخصص لكل نوع منتج
2. ✅ تجربة مستخدم أفضل
3. ✅ سهولة التوسع مستقبلاً
4. ✅ Recommendations ذكية بناءً على الـ category
5. ✅ أداء أفضل (prefetch بناءً على الـ category)

---

## 📐 الهيكل المقترح

### 1. Category Configuration (جديد)
```typescript
// src/config/categories.ts
export interface CategoryConfig {
  id: string
  name_ar: string
  name_en: string
  icon: string
  color: string
  gradient: string
  
  // UI Configuration
  cardType: 'standard' | 'byo' | 'featured' | 'compact'
  gridColumns: { mobile: number; tablet: number; desktop: number }
  showQuickAdd: boolean
  showCustomizeButton: boolean
  
  // Template mapping
  modalTemplate: 'BYOTemplate' | 'PresetTemplate' | 'DessertTemplate' | 'MilkshakeTemplate' | 'StandardTemplate'
  
  // Behavior
  requiresCustomization: boolean
  defaultSortBy: 'price' | 'popularity' | 'name'
}

export const CATEGORIES: Record<string, CategoryConfig> = {
  soft_serve: {
    id: 'soft_serve',
    name_ar: 'سوفت سيرف',
    name_en: 'Soft Serve',
    icon: '🍦',
    color: '#FF6B9D',
    gradient: 'from-pink-500 to-rose-500',
    
    cardType: 'byo',
    gridColumns: { mobile: 1, tablet: 2, desktop: 2 },
    showQuickAdd: false,
    showCustomizeButton: true,
    
    modalTemplate: 'BYOTemplate',
    requiresCustomization: true,
    defaultSortBy: 'popularity'
  },
  
  milkshake: {
    id: 'milkshake',
    name_ar: 'ميلك شيك',
    name_en: 'Milkshake',
    icon: '🥤',
    color: '#F59E0B',
    gradient: 'from-amber-500 to-orange-500',
    
    cardType: 'standard',
    gridColumns: { mobile: 2, tablet: 3, desktop: 4 },
    showQuickAdd: true,
    showCustomizeButton: true,
    
    modalTemplate: 'MilkshakeTemplate',
    requiresCustomization: false,
    defaultSortBy: 'popularity'
  },
  
  dessert: {
    id: 'dessert',
    name_ar: 'حلويات',
    name_en: 'Desserts',
    icon: '🍰',
    color: '#8B5CF6',
    gradient: 'from-purple-500 to-indigo-500',
    
    cardType: 'featured',
    gridColumns: { mobile: 2, tablet: 2, desktop: 3 },
    showQuickAdd: true,
    showCustomizeButton: true,
    
    modalTemplate: 'DessertTemplate',
    requiresCustomization: false,
    defaultSortBy: 'price'
  },
  
  preset: {
    id: 'preset',
    name_ar: 'نكهات جاهزة',
    name_en: 'Preset Flavors',
    icon: '⭐',
    color: '#06B6D4',
    gradient: 'from-cyan-500 to-blue-500',
    
    cardType: 'compact',
    gridColumns: { mobile: 2, tablet: 3, desktop: 4 },
    showQuickAdd: true,
    showCustomizeButton: false,
    
    modalTemplate: 'PresetTemplate',
    requiresCustomization: false,
    defaultSortBy: 'name'
  }
}
```

### 2. Smart ProductCard (محسن)
```typescript
// src/components/ui/ProductCard.tsx
export default function ProductCard({ product }: ProductCardProps) {
  const categoryConfig = CATEGORIES[product.category] || CATEGORIES.preset
  
  // Render based on cardType
  switch (categoryConfig.cardType) {
    case 'byo':
      return <BYOProductCard product={product} config={categoryConfig} />
    case 'featured':
      return <FeaturedProductCard product={product} config={categoryConfig} />
    case 'compact':
      return <CompactProductCard product={product} config={categoryConfig} />
    default:
      return <StandardProductCard product={product} config={categoryConfig} />
  }
}
```

### 3. Dynamic Grid Layout
```typescript
// src/components/pages/CategorySection.tsx
export default function CategorySection({ category, products }: Props) {
  const config = CATEGORIES[category]
  
  const gridClass = `
    grid gap-4
    grid-cols-${config.gridColumns.mobile}
    md:grid-cols-${config.gridColumns.tablet}
    lg:grid-cols-${config.gridColumns.desktop}
  `
  
  return (
    <section className={gridClass}>
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </section>
  )
}
```

---

## 🚀 خطة التنفيذ المرحلية

### Phase 1: Foundation (الأساس)
- [ ] إنشاء `src/config/categories.ts`
- [ ] إضافة `getCategoryConfig()` helper
- [ ] تحديث ProductCard ليقرأ الـ config

### Phase 2: Card Variants (أنواع الكروت)
- [ ] إنشاء `BYOProductCard` - للـ Custom Cup/Cone
- [ ] إنشاء `FeaturedProductCard` - للحلويات
- [ ] إنشاء `CompactProductCard` - للنكهات الجاهزة
- [ ] تحديث `StandardProductCard` - الافتراضي

### Phase 3: Grid Optimization (تحسين العرض)
- [ ] تحديث `ProductsGrid` ليستخدم الـ config
- [ ] Dynamic grid columns per category
- [ ] Category-specific animations

### Phase 4: Data Flow Optimization (تحسين الأداء)
- [ ] Prefetch product configuration based on category
- [ ] Smart caching per category
- [ ] Progressive loading

---

## 📈 تحسين الأداء (Data Flow)

### الوضع الحالي:
```
Home Page Load
     ↓
getProducts() → All products
     ↓
User clicks product
     ↓
getProductConfiguration() → Fetch config (SLOW!)
     ↓
Show Modal
```

### الوضع المحسن:
```
Home Page Load
     ↓
getProducts() → All products (with basic config hints)
     ↓
ProductCard renders → Knows cardType from category
     ↓
User hovers/focuses → Prefetch configuration
     ↓
User clicks → Config already cached (FAST!)
     ↓
Show Modal instantly
```

### Implementation:
```typescript
// Prefetch on hover
const handleMouseEnter = () => {
  if (categoryConfig.requiresCustomization) {
    queryClient.prefetchQuery({
      queryKey: ['product-configuration', product.id],
      queryFn: () => getProductConfiguration(product.id)
    })
  }
}
```

---

## 🎨 تصميم الكروت المختلفة

### BYOProductCard (Custom Cup/Cone):
```
┌─────────────────────────┐
│  [صورة كبيرة]           │
│                         │
│  🍦 Custom Cup          │
│  "صمم كوبك الخاص"       │
│                         │
│  ┌─────────────────┐    │
│  │  صمم بنفسك 🎨   │    │
│  └─────────────────┘    │
│                         │
│  يبدأ من 25 ج.م         │
└─────────────────────────┘
```

### StandardProductCard (Milkshake):
```
┌─────────────────────────┐
│  [صورة]     [🛒]        │
│                         │
│  Chocolate Milkshake    │
│  ميلك شيك شوكولاتة      │
│                         │
│  35 ج.م    [اعرف المزيد]│
└─────────────────────────┘
```

### FeaturedProductCard (Dessert):
```
┌─────────────────────────┐
│  [صورة كبيرة مع badge]  │
│  ⭐ الأكثر مبيعاً       │
│                         │
│  Brownie Fudge          │
│  براوني فدج             │
│  🔥 180 سعرة            │
│                         │
│  40 ج.م  [🛒] [تخصيص]   │
└─────────────────────────┘
```

### CompactProductCard (Preset):
```
┌───────────────┐
│ [صورة صغيرة] │
│ Vanilla       │
│ 25 ج.م  [🛒]  │
└───────────────┘
```

---

## 🔗 Recommendations System

### Category-Based Recommendations:
```typescript
function getRecommendations(product: Product): Product[] {
  const config = CATEGORIES[product.category]
  
  // 1. Same category products
  const sameCategory = products.filter(p => 
    p.category === product.category && p.id !== product.id
  )
  
  // 2. Complementary categories
  const complementary = getComplementaryCategories(product.category)
  const complementaryProducts = products.filter(p =>
    complementary.includes(p.category)
  )
  
  // 3. Mix and return
  return [...sameCategory.slice(0, 3), ...complementaryProducts.slice(0, 2)]
}

function getComplementaryCategories(category: string): string[] {
  const map = {
    soft_serve: ['dessert', 'milkshake'],
    milkshake: ['soft_serve', 'dessert'],
    dessert: ['soft_serve', 'milkshake'],
    preset: ['soft_serve', 'dessert']
  }
  return map[category] || []
}
```

---

## ✅ الخلاصة

### المميزات:
1. **Scalable** - سهل إضافة categories جديدة
2. **Maintainable** - كل category معزولة
3. **Performant** - Prefetch ذكي
4. **Flexible** - تصميم مختلف لكل نوع
5. **Consistent** - Config موحد

### الأولويات:
1. 🔴 **عالية**: إنشاء Category Config
2. 🔴 **عالية**: BYOProductCard
3. 🟡 **متوسطة**: Grid optimization
4. 🟢 **منخفضة**: Prefetch optimization

---

*آخر تحديث: November 2025*
