# 🏗️ Soft Cream - Architecture Documentation

**Last Updated:** November 21, 2025  
**Version:** 2.0 - Post-Refactor  
**Primary Brand Color:** `#FF6B9D`

---

## 📋 Table of Contents

1. [Design System](#design-system)
2. [Shared UI Primitives](#shared-ui-primitives)
3. [Component Architecture](#component-architecture)
4. [Performance Optimizations](#performance-optimizations)
5. [Critical Development Rules](#critical-development-rules)
6. [File Structure](#file-structure)

---

## 🎨 Design System

### Brand Identity

**Primary Color:** `#FF6B9D` (Pink/Watermelon)

**Color Palette:**
```typescript
primary: {
  50: '#fff1f5',
  100: '#ffe4ec',
  200: '#ffcadb',
  300: '#ffa0bc',
  400: '#ff6b9d',  // ← PRIMARY
  500: '#ff5a8e',
  600: '#ff4979',
  700: '#e63869',
  800: '#cc2f5c',
  900: '#b32750',
}
```

### Styling Rules

**Rounded Corners:**
- Containers/Cards: `rounded-2xl` (16px)
- Modals: `rounded-3xl` (24px)
- Buttons: `rounded-xl` (12px)
- Pills/Badges: `rounded-full`

**Shadows:**
- Default: `shadow-lg`
- Brand-tinted: `shadow-pink-500/20` or `shadow-pink-500/30`
- Hover: `hover:shadow-xl hover:shadow-pink-500/30`

**Gradients:**
- Primary: `from-[#FF6B9D] to-[#FF5A8E]`
- Hover: `hover:from-[#FF5A8E] hover:to-[#FF4979]`

**Transitions:**
- Standard: `transition-all duration-300`
- Active states: `active:scale-95` or `active:scale-[0.98]`

---

## 🧩 Shared UI Primitives

**Location:** `src/components/ui/common/`

### 1. QuantitySelector

**Purpose:** Reusable increment/decrement control

**Props:**
```typescript
{
  quantity: number
  onIncrease: () => void
  onDecrease: () => void
  min?: number
  max?: number
  size?: 'sm' | 'lg'
  disabled?: boolean
}
```

**Sizes:**
- `sm`: For ProductCard (compact)
- `lg`: For ProductModal footer

**Usage:**
```tsx
<QuantitySelector
  quantity={quantity}
  onIncrease={() => setQuantity(q => q + 1)}
  onDecrease={() => setQuantity(q => Math.max(1, q - 1))}
  size="lg"
/>
```

### 2. PriceDisplay

**Purpose:** Standardized currency formatting

**Props:**
```typescript
{
  price: number
  currency?: string  // default: 'ج.م'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}
```

**Features:**
- Smart text color detection (supports white text on colored backgrounds)
- Consistent typography
- Brand color by default

**Usage:**
```tsx
<PriceDisplay price={99.99} size="lg" />
<PriceDisplay price={50} size="md" className="text-white" />
```

### 3. NutritionIcon

**Purpose:** Unified nutrition badges

**Props:**
```typescript
{
  type: 'calories' | 'protein' | 'carbs' | 'sugar' | 'fat'
  value: number
  unit?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'colored' | 'subtle'
}
```

**Variants:**
- `colored`: Full color backgrounds (for emphasis)
- `subtle`: Grayscale (for compact displays)

**Usage:**
```tsx
<NutritionIcon type="calories" value={250} size="sm" variant="subtle" />
```

---

## 🛠️ Component Architecture

### ProductModal (Split Architecture)

**Location:** `src/components/modals/ProductModal/`

**Structure:**
```
ProductModal/
├── index.tsx              (Orchestrator - 150 lines)
├── useProductLogic.ts     (Business Logic Hook)
├── ProductImage.tsx       (Left Column - Image Only)
├── ProductHeader.tsx      (Title + Price + Description)
├── NutritionInfo.tsx      (Nutrition Grid + Details)
├── AddonsList.tsx         (Addons + Tags)
└── ActionFooter.tsx       (Sticky Footer)
```

#### index.tsx (Orchestrator)

**Responsibilities:**
- Layout control (split view)
- State coordination
- Modal animations
- Recommendations

**Key Layout:**
```tsx
<div className="flex flex-col md:flex-row">
  {/* Left Column (Desktop) / Top (Mobile) */}
  <ProductImage product={displayProduct} />

  {/* Right Column (Desktop) / Bottom (Mobile) */}
  <div className="flex-1 flex flex-col md:w-1/2 -mt-16 md:mt-0">
    <div className="flex-1 overflow-y-auto">
      <ProductHeader product={displayProduct} />
      <NutritionInfo ... />
      <AddonsList ... />
    </div>
    <ActionFooter ... />
  </div>
</div>
```

#### useProductLogic.ts (Performance Hook)

**Purpose:** Optimistic UI with TanStack Query

**Key Features:**
- ✅ Instant modal open (0ms) using `initialData`
- ✅ Smart caching (5 min stale time)
- ✅ Background data refresh
- ✅ Automatic deduplication

**Implementation:**
```typescript
const { data: displayProduct, isFetching } = useQuery({
  queryKey: ['product', product?.id, 'detailed'],
  queryFn: () => getProduct(product.id, { expand: [...] }),
  initialData: product,  // ← INSTANT OPEN!
  staleTime: 1000 * 60 * 5,  // 5 min cache
  gcTime: 1000 * 60 * 10,     // 10 min memory
})
```

**Returns:**
```typescript
{
  displayProduct,
  isFetchingAddons,
  quantity,
  setQuantity,
  selectedAddons,
  toggleAddon,
  addons,
  addonsTotal,
  totalPrice,
  tags,
  ingredients,
  allergens,
}
```

#### ProductImage.tsx

**Responsibilities:**
- Product image display
- Energy type badge (on image)
- Promo badge (on image)
- Mobile fade gradient

**Layout:**
```tsx
className="h-[35vh] min-h-[280px] md:h-full md:w-1/2"
```

#### ProductHeader.tsx

**Responsibilities:**
- Title + Price row (compact layout)
- English name
- Description
- Inline energy score badge

**Critical Layout:**
```tsx
<div className="flex items-start justify-between gap-4 w-full mb-2">
  <div className="flex-1 min-w-0">
    {/* Title - can wrap */}
  </div>
  <div className="flex-shrink-0 whitespace-nowrap pt-1">
    {/* Price - never wraps */}
  </div>
</div>
```

⚠️ **DO NOT MODIFY** these flex classes without testing!

#### NutritionInfo.tsx

**Responsibilities:**
- Compact nutrition grid (4 icons)
- Collapsible detailed section
- Ingredients & allergens

**Features:**
- Internal state for collapse/expand
- Uses `<NutritionIcon />` primitives
- Smooth AnimatePresence transitions

#### AddonsList.tsx

**Responsibilities:**
- Addons list with checkboxes
- Skeleton loading state
- Selected count badge
- Tags section

**Loading State:**
```tsx
{isLoading && addons.length === 0 ? (
  <div className="space-y-2">
    {[1, 2, 3].map((i) => (
      <div className="... animate-pulse">
        {/* Skeleton bars */}
      </div>
    ))}
  </div>
) : (
  // Real addons
)}
```

#### ActionFooter.tsx

**Responsibilities:**
- Quantity selector
- Add to cart button
- Price breakdown (when addons selected)

**Features:**
- Sticky positioning
- Animated price breakdown
- Uses shared primitives

---

### CartModal (Refactored)

**Location:** `src/components/modals/CartModal/`

**Structure:**
```
CartModal/
├── index.tsx          (Orchestrator)
├── CartItem.tsx       (Individual item)
└── CartSummary.tsx    (Footer with total)
```

**Key Features:**
- Uses `<QuantitySelector />` in CartItem
- Uses `<PriceDisplay />` throughout
- Nutrition summary integration

---

### ProductCard

**Location:** `src/components/ui/ProductCard.tsx`

**Features:**
- Uses shared `<QuantitySelector size="sm" />`
- Uses shared `<PriceDisplay size="md" />`
- Brand-colored buttons and badges
- Preserves `stopPropagation` logic
- Integrates with `useProductsData`

**Layout:**
```tsx
<div className="card p-3">
  <div className="aspect-[4/5] bg-gradient-to-br from-pink-50 to-rose-50">
    {/* Image */}
  </div>
  {/* Content */}
  <QuantitySelector size="sm" ... />
  <button className="bg-gradient-to-r from-[#FF6B9D] to-[#FF5A8E]">
    Add to Cart
  </button>
</div>
```

---

### Home Page Components

#### FilterBar

**Location:** `src/components/pages/Home/FilterBar.tsx`

**Features:**
- Search with 300ms debounce
- Advanced filters panel
- Active filter count badge
- Brand-colored active states
- Dark mode support

**Props:**
```typescript
{
  onFiltersChange?: (filters: any) => void
  onClearFilters?: () => void
}
```

#### ProductsGrid

**Location:** `src/components/pages/ProductsGrid.tsx`

**Features:**
- Loading state with skeletons
- Empty state with clear action
- Grouped by category
- Lazy-loaded Swiper

**Props:**
```typescript
{
  isLoading?: boolean
  onClearFilters?: () => void
}
```

**States:**
1. **Loading:** Shows 3 skeleton categories
2. **Empty:** Shows SearchX icon + clear button
3. **Normal:** Shows grouped products

#### ProductCardSkeleton

**Location:** `src/components/ui/skeletons/ProductCardSkeleton.tsx`

**Purpose:** Loading placeholder matching ProductCard layout

**Features:**
- Matches exact aspect ratio (4:5)
- Same spacing and structure
- Smooth pulse animation
- Dark mode support

---

## ⚡ Performance Optimizations

### 1. TanStack Query Integration

**Benefits:**
- ✅ Instant modal opens (0ms perceived delay)
- ✅ Smart caching (no duplicate requests)
- ✅ Background refresh
- ✅ Automatic error handling

**Before vs After:**
```
BEFORE:
User clicks → Modal opens empty → API call → Wait 200-500ms → Content appears
Reopen same product → API call AGAIN → Wait 200-500ms

AFTER:
User clicks → Modal opens INSTANTLY with data → Background refresh
Reopen same product → Modal opens INSTANTLY from cache (0ms)
```

### 2. Lazy Loading

**Swiper:**
```typescript
const ProductsSwiper = dynamic(
  () => import('./ProductsSwiperWrapper'),
  { ssr: false, loading: () => <Skeleton /> }
)
```

**Benefits:**
- Reduces initial bundle size (~50KB)
- Loads only when needed
- Shows skeleton during load

### 3. Memoization

**ProductsGrid:**
```typescript
const groupedProducts = useMemo(() => {
  // Expensive grouping logic
}, [products])
```

**Benefits:**
- Prevents unnecessary recalculations
- Improves filter performance

### 4. Debouncing

**FilterBar Search:**
```typescript
searchTimeoutRef.current = setTimeout(() => {
  applyAllFilters({ ...localFilters, searchQuery: query })
}, 300)
```

**Benefits:**
- Reduces API calls
- Smoother typing experience

---

## ⚠️ Critical Development Rules

### 1. DO NOT Revert Structure

❌ **NEVER** merge sub-components back into monolithic files

**Bad:**
```tsx
// ProductModal/index.tsx (5000 lines)
export default function ProductModal() {
  // Everything in one file
}
```

**Good:**
```tsx
// ProductModal/index.tsx (150 lines)
import ProductImage from './ProductImage'
import ProductHeader from './ProductHeader'
// ...
```

### 2. DO NOT Break Caching

❌ **NEVER** add manual `useEffect` fetching back to ProductModal

**Bad:**
```tsx
useEffect(() => {
  fetch(`/api/products/${id}`)
    .then(res => res.json())
    .then(data => setProduct(data))
}, [id])
```

**Good:**
```tsx
const { displayProduct } = useProductLogic({ product, isOpen })
```

### 3. Use Shared Components

❌ **NEVER** hardcode quantity controls

**Bad:**
```tsx
<button onClick={() => setQty(qty - 1)}>-</button>
<span>{qty}</span>
<button onClick={() => setQty(qty + 1)}>+</button>
```

**Good:**
```tsx
<QuantitySelector
  quantity={qty}
  onIncrease={() => setQty(qty + 1)}
  onDecrease={() => setQty(qty - 1)}
/>
```

### 4. Maintain Layout Classes

⚠️ **CRITICAL:** ProductHeader Title/Price row depends on specific flex classes

**Required Classes:**
```tsx
<div className="flex items-start justify-between gap-4 w-full mb-2">
  <div className="flex-1 min-w-0">
    {/* Title */}
  </div>
  <div className="flex-shrink-0 whitespace-nowrap pt-1">
    {/* Price */}
  </div>
</div>
```

**Why:**
- `min-w-0`: Allows text truncation
- `flex-shrink-0`: Prevents price from shrinking
- `whitespace-nowrap`: Prevents price from wrapping
- `pt-1`: Aligns with text baseline

### 5. Preserve Business Logic

✅ **ALWAYS** keep these intact:
- Price calculations
- Addon toggling
- Cart operations
- Filter logic
- State management

### 6. Test Responsive Layouts

✅ **ALWAYS** test on:
- Mobile (< 768px)
- Tablet (768px - 1024px)
- Desktop (> 1024px)

**Key Breakpoints:**
- `md:` - 768px
- `lg:` - 1024px

---

## 📁 File Structure

```
src/
├── components/
│   ├── modals/
│   │   ├── ProductModal/
│   │   │   ├── index.tsx
│   │   │   ├── useProductLogic.ts
│   │   │   ├── ProductImage.tsx
│   │   │   ├── ProductHeader.tsx
│   │   │   ├── NutritionInfo.tsx
│   │   │   ├── AddonsList.tsx
│   │   │   └── ActionFooter.tsx
│   │   └── CartModal/
│   │       ├── index.tsx
│   │       ├── CartItem.tsx
│   │       └── CartSummary.tsx
│   ├── pages/
│   │   ├── Home/
│   │   │   └── FilterBar.tsx
│   │   └── ProductsGrid.tsx
│   └── ui/
│       ├── common/
│       │   ├── QuantitySelector.tsx
│       │   ├── PriceDisplay.tsx
│       │   └── NutritionIcon.tsx
│       ├── skeletons/
│       │   └── ProductCardSkeleton.tsx
│       ├── ProductCard.tsx
│       ├── NutritionCard.tsx
│       └── NutritionSummary.tsx
├── providers/
│   ├── CartProvider.tsx
│   ├── ProductsProvider.tsx
│   └── Providers.tsx
└── lib/
    ├── api.ts
    └── queryClient.ts
```

---

## 🎯 Quick Reference

### Adding a New Feature

1. **Check if shared primitive exists** (`ui/common/`)
2. **Create sub-components** (not monolithic files)
3. **Use TanStack Query** for data fetching
4. **Apply brand colors** (`#FF6B9D`)
5. **Add loading states** (skeletons)
6. **Test responsive** (mobile → desktop)
7. **Verify dark mode** (all states)

### Debugging Checklist

- [ ] Are you using shared primitives?
- [ ] Is TanStack Query caching working?
- [ ] Are flex classes correct in ProductHeader?
- [ ] Is the component split properly?
- [ ] Are animations smooth?
- [ ] Does dark mode work?
- [ ] Is it responsive?

### Performance Checklist

- [ ] Using `useMemo` for expensive calculations?
- [ ] Using `useCallback` for stable references?
- [ ] Lazy loading heavy components?
- [ ] Debouncing user input?
- [ ] Using TanStack Query cache?
- [ ] Showing loading states?

---

## 📚 Additional Resources

- **TanStack Query Docs:** https://tanstack.com/query/latest
- **Framer Motion Docs:** https://www.framer.com/motion/
- **Tailwind CSS Docs:** https://tailwindcss.com/docs

---

**End of Architecture Documentation**

*For questions or clarifications, refer to this document first.*
