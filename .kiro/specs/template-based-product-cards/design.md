# Design Document

## Overview

هذا التصميم يغطي تحسين تصميمات ProductCard في واجهة العميل بحيث تكون مختلفة ومميزة لكل Template:

1. **SimpleCard** - للمنتجات البسيطة (Quick Add)
2. **MediumCard** - للمنتجات المتوسطة (Options Preview)
3. **ComplexCard** - للمنتجات المعقدة BYO (Premium Design)

### الأهداف
- تصميمات مختلفة لكل نوع منتج
- أيقونات Lucide احترافية
- عرض بيانات مميزة (تغذية، صحة، خيارات)
- تجربة مستخدم تسويقية وصحية

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      ProductCard (Smart)                     │
│                   Selects card based on template             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │ SimpleCard  │  │ MediumCard  │  │ ComplexCard │          │
│  │ (Compact)   │  │ (Standard)  │  │ (Premium)   │          │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘          │
│         │                │                │                  │
│         └────────────────┼────────────────┘                  │
│                          │                                   │
│              ┌───────────▼───────────┐                       │
│              │   Shared Components   │                       │
│              │  - NutritionSwiper    │                       │
│              │  - HealthBadges       │                       │
│              │  - PriceDisplay       │                       │
│              │  - QuantitySelector   │                       │
│              │  - LucideIcons        │                       │
│              └───────────────────────┘                       │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. ProductCard (Smart Selector)

```typescript
// src/components/ui/ProductCard.tsx
interface ProductCardProps {
  product: Product;
  forceCardType?: 'simple' | 'medium' | 'complex';
  onAddToCart?: (product: Product, quantity: number) => void;
}

// Card type selection logic
function getCardType(product: Product): 'simple' | 'medium' | 'complex' {
  // Priority 1: template_id
  if (product.template_id === 'template_simple') return 'simple';
  if (product.template_id === 'template_medium') return 'medium';
  if (product.template_id === 'template_complex') return 'complex';
  
  // Priority 2: layout_mode
  if (product.layout_mode === 'simple' || product.layout_mode === 'selector') return 'simple';
  if (product.layout_mode === 'medium' || product.layout_mode === 'composer') return 'medium';
  if (product.layout_mode === 'complex' || product.layout_mode === 'builder') return 'complex';
  
  // Fallback
  return 'medium';
}
```

### 2. SimpleCard Component

```typescript
// src/components/ui/cards/SimpleCard.tsx
interface SimpleCardProps {
  product: Product;
  onAddToCart?: (product: Product, quantity: number) => void;
}

// Features:
// - Compact design (max-height: 200px)
// - Quick Add on hover
// - Inline Quantity Selector (1-5)
// - Calorie badge with Flame icon
// - No description, minimal info
```

**Visual Design:** (Height: ~280px)
```
┌─────────────────────┐
│  ┌───────────────┐  │
│  │    IMAGE      │  │  <- Square image
│  │ 🔥120 ⚡85    │  │  <- Calories + Energy badges
│  └───────────────┘  │
│  Product Name       │  <- Single line, truncated
│  💚 صحي            │  <- Health badge (1 max)
│  ┌─────┐ ┌───────┐  │
│  │ 25ج │ │ + 1 - │  │  <- Price + Quantity
│  └─────┘ └───────┘  │
│  ┌─────────────────┐│
│  │  🛒 أضف للسلة  ││  <- Quick Add button
│  └─────────────────┘│
└─────────────────────┘
```

### 3. MediumCard Component

```typescript
// src/components/ui/cards/MediumCard.tsx
interface MediumCardProps {
  product: Product;
  onAddToCart?: (product: Product, quantity: number) => void;
}

// Features:
// - Standard design with options preview
// - Nutrition Swiper (rotating)
// - Health Badges (max 2)
// - Energy badge with icon
// - Description (2 lines max)
// - Quantity Selector + Add to Cart
// - "اعرف المزيد" button
```

**Visual Design:** (Height: ~320px)
```
┌─────────────────────────┐
│  ┌───────────────────┐  │
│  │      IMAGE        │  │  <- 4:5 aspect ratio
│  │ ⚡85 🔥120 🏷️جديد│  │  <- Energy + Calories + Badge
│  └───────────────────┘  │
│  Product Name           │
│  وصف قصير للمنتج...     │  <- 1 line max
│  ┌──┐┌──┐┌──┐ +5        │  <- Options preview (3 circles)
│  └──┘└──┘└──┘           │
│  💚 صحي  🌿 طبيعي      │  <- Health badges (2 max)
│  🔥 120 سعرة ↔ 💪 8g   │  <- Nutrition Swiper (rotating)
│  ┌─────┐  ┌─────────┐   │
│  │ 35ج │  │ + 1 -   │   │  <- Price + Quantity
│  └─────┘  └─────────┘   │
│  ┌────────┐ ┌────────┐  │
│  │🛒 أضف │ │ المزيد │  │  <- Cart + Learn More
│  └────────┘ └────────┘  │
└─────────────────────────┘
```

### 4. ComplexCard Component

```typescript
// src/components/ui/cards/ComplexCard.tsx
interface ComplexCardProps {
  product: Product;
  // NO onAddToCart - always navigates to product page
}

// Features:
// - Premium gradient background (pink to purple)
// - Large image with hover animation
// - Customization count badge
// - "صمم بنفسك" CTA (navigates, doesn't add to cart)
// - NO Quantity Selector
// - Floating animated icons
// - "يبدأ من" price label
// - Health badges (overlay variant, max 3)
```

**Visual Design:** (Height: ~340px - same row height as MediumCard)
```
┌─────────────────────────────┐
│  ┌───────────────────────┐ │  (Gradient: pink → purple)
│  │       IMAGE           │ │  <- Animated on hover
│  │ ⚡85 🔥120            │ │  <- Energy + Calories
│  │  🎨 20+ خيار         │ │  <- Customization badge
│  └───────────────────────┘ │
│  آيس كريم مخصص             │  <- Product name
│  صمم آيس كريمك المفضل      │  <- Tagline (1 line)
│  💚 صحي 🌿 طبيعي ⚡ طاقة  │  <- Health badges (3 max)
│  🔥 120 سعرة ↔ 💪 8g      │  <- Nutrition Swiper
│  يبدأ من  45 ج.م           │  <- Price with label
│  ┌─────────────────────────┐│
│  │  🎨 صمم بنفسك  ←       ││  <- Premium CTA button
│  └─────────────────────────┘│  (White bg, pink text)
└─────────────────────────────┘
```

### 5. NutritionSwiper Component

```typescript
// src/components/ui/common/NutritionSwiper.tsx
interface NutritionSwiperProps {
  calories?: number;
  protein?: number;
  energyScore?: number;
  interval?: number; // default: 3000ms
}

// Rotating display of nutrition info
// Uses Lucide icons: Flame, Dumbbell, Zap
```

### 6. Lucide Icons Mapping

```typescript
// Icon usage across cards
const ICONS = {
  // Nutrition
  calories: Flame,      // orange-500
  protein: Dumbbell,    // blue-500
  energy: Zap,          // amber-500
  
  // Health
  healthy: Heart,       // green-500
  natural: Leaf,        // green-600
  
  // Energy Types
  mental: Brain,        // purple-500
  physical: Activity,   // orange-500
  balanced: Zap,        // green-500
  
  // Actions
  cart: ShoppingCart,
  customize: Palette,
  sparkle: Sparkles,
  navigate: ChevronLeft, // RTL
  
  // Status
  unavailable: XCircle,
  allergen: AlertTriangle,
  discount: Tag,
};
```

## Data Models

### Product (Extended)

```typescript
interface Product {
  id: string;
  name: string;
  nameEn?: string;
  price: number;
  old_price?: number;
  discount_percentage?: number;
  image?: string;
  description?: string;
  badge?: string;
  available?: number;
  
  // Template System
  template_id?: 'template_simple' | 'template_medium' | 'template_complex';
  layout_mode?: 'simple' | 'medium' | 'complex' | 'builder' | 'composer' | 'selector';
  
  // Nutrition
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  sugar?: number;
  fiber?: number;
  
  // Energy
  energy_type?: 'mental' | 'physical' | 'balanced';
  energy_score?: number;
  
  // Health
  health_keywords?: string; // JSON array
  allergens?: string;
  
  // Options Preview
  options_preview?: {
    total_groups: number;
    total_options: number;
    featured_options: Array<{
      id: string;
      name: string;
      image?: string;
    }>;
  };
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Card Type Selection
*For any* product with template_id or layout_mode, the ProductCard component should render the correct card type (SimpleCard for simple, MediumCard for medium, ComplexCard for complex).
**Validates: Requirements 1.1, 2.1, 3.1, 7.1**

### Property 2: Fallback Card Type
*For any* product without template_id and layout_mode, the ProductCard component should render MediumCard as fallback.
**Validates: Requirements 7.3**

### Property 3: Force Card Type Override
*For any* ProductCard with forceCardType prop, the component should render the specified card type regardless of product properties.
**Validates: Requirements 7.2**

### Property 4: ComplexCard Navigation Behavior
*For any* ComplexCard, clicking the card or CTA button should navigate to product page and should NOT trigger onAddToCart callback.
**Validates: Requirements 3.6**

### Property 5: ComplexCard No Quantity Selector
*For any* ComplexCard render, the component should NOT include a QuantitySelector component.
**Validates: Requirements 3.10**

### Property 6: Options Preview Limit
*For any* product with options_preview containing more than 3 featured_options, the MediumCard should display exactly 3 option thumbnails.
**Validates: Requirements 2.3**

### Property 7: Health Badges Limit
*For any* product with health_keywords, SimpleCard should display at most 1 badge, MediumCard should display at most 2 badges, and ComplexCard should display at most 3 badges.
**Validates: Requirements 2.4, 3.8**

### Property 8: Conditional Badge Display
*For any* product with a badge property, all card types should display the badge.
**Validates: Requirements 4.1**

### Property 9: Unavailable Product Overlay
*For any* product with available=0, all card types should display "غير متاح" overlay and disable interactions.
**Validates: Requirements 4.3**

### Property 10: Nutrition Swiper Rotation
*For any* product with multiple nutrition values (calories, protein, energy_score), the NutritionSwiper should cycle through all available values.
**Validates: Requirements 6.1**

## Card Height Consistency

جميع البطاقات يجب أن تكون بأطوال متناسقة في نفس الصف:

| Card Type | Max Height | Image Ratio |
|-----------|------------|-------------|
| SimpleCard | 280px | 1:1 (square) |
| MediumCard | 320px | 4:5 |
| ComplexCard | 340px | 4:5 |

**ملاحظات:**
- استخدام `line-clamp` للنصوص الطويلة
- الصورة تأخذ نسبة ثابتة
- المحتوى يتكيف مع المساحة المتاحة
- لا يوجد scroll داخل البطاقة

## Error Handling

```typescript
// Graceful fallbacks
const FALLBACKS = {
  image: '/images/placeholder-product.png',
  name: 'منتج',
  price: 0,
  cardType: 'medium',
};

// Error states
interface CardErrorState {
  hasError: boolean;
  errorMessage?: string;
  fallbackUI: ReactNode;
}
```

## Testing Strategy

### Unit Tests
- Card type selection logic
- Conditional rendering (badges, nutrition, options)
- Click handlers (navigation vs add to cart)
- Quantity selector range validation

### Property-Based Tests (using fast-check)
Each correctness property will be implemented as a property-based test:

1. **Property 1**: Generate random products with various template_id/layout_mode combinations, verify correct card type
2. **Property 2**: Generate products without template_id/layout_mode, verify MediumCard fallback
3. **Property 3**: Generate products with forceCardType prop, verify override behavior
4. **Property 4**: Generate ComplexCard clicks, verify navigation and no cart callback
5. **Property 5**: Generate ComplexCard renders, verify no QuantitySelector
6. **Property 6**: Generate products with 1-10 featured_options, verify max 3 displayed
7. **Property 7**: Generate products with 1-5 health_keywords, verify limits
8. **Property 8**: Generate products with/without badge, verify display
9. **Property 9**: Generate products with available=0/1, verify overlay
10. **Property 10**: Generate products with various nutrition values, verify rotation

### Test Configuration
```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    testTimeout: 30000,
  },
});
```

### Test Annotation Format
```typescript
/**
 * **Feature: template-based-product-cards, Property 1: Card Type Selection**
 * **Validates: Requirements 1.1, 2.1, 3.1, 7.1**
 */
```
