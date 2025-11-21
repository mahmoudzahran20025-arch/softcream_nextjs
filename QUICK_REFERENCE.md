# ⚡ Quick Reference Card

## 🎨 Brand Colors (Copy-Paste Ready)

```tsx
// Primary Brand Color
className="bg-[#FF6B9D]"
className="text-[#FF6B9D]"
className="border-[#FF6B9D]"

// Gradients
className="bg-gradient-to-r from-[#FF6B9D] to-[#FF5A8E]"
className="hover:from-[#FF5A8E] hover:to-[#FF4979]"

// Shadows
className="shadow-lg shadow-pink-500/25"
className="hover:shadow-xl hover:shadow-pink-500/30"

// Focus Rings
className="focus:ring-2 focus:ring-[#FF6B9D]/20"
```

---

## 🧩 Shared Components (Import Paths)

```tsx
// Quantity Control
import QuantitySelector from '@/components/ui/common/QuantitySelector'

<QuantitySelector
  quantity={qty}
  onIncrease={() => setQty(qty + 1)}
  onDecrease={() => setQty(Math.max(1, qty - 1))}
  size="lg"  // or "sm"
/>

// Price Display
import PriceDisplay from '@/components/ui/common/PriceDisplay'

<PriceDisplay 
  price={99.99} 
  size="lg"  // "sm" | "md" | "lg"
  className="text-white"  // optional
/>

// Nutrition Icon
import NutritionIcon from '@/components/ui/common/NutritionIcon'

<NutritionIcon
  type="calories"  // "protein" | "carbs" | "sugar" | "fat"
  value={250}
  size="md"  // "sm" | "md" | "lg"
  variant="subtle"  // or "colored"
/>

// Skeleton Loader
import ProductCardSkeleton from '@/components/ui/skeletons/ProductCardSkeleton'

<ProductCardSkeleton />
```

---

## 🔄 TanStack Query Pattern

```tsx
import { useQuery } from '@tanstack/react-query'

const { data, isLoading, isFetching } = useQuery({
  queryKey: ['resource', id],
  queryFn: () => fetchResource(id),
  initialData: existingData,  // ← Instant UI!
  staleTime: 1000 * 60 * 5,   // 5 min cache
  gcTime: 1000 * 60 * 10,      // 10 min memory
})
```

---

## 📱 Responsive Classes

```tsx
// Mobile First Approach
className="text-sm md:text-base lg:text-lg"
className="grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
className="p-4 md:p-6 lg:p-8"

// Hide/Show by Breakpoint
className="block md:hidden"  // Mobile only
className="hidden md:block"  // Desktop only

// Flex Direction
className="flex-col md:flex-row"  // Stack on mobile, row on desktop
```

---

## 🎭 Common Animations

```tsx
// Framer Motion - Modal
<motion.div
  initial={{ opacity: 0, y: 100 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: 100 }}
  transition={{ type: 'spring', damping: 25 }}
>

// Framer Motion - Fade In
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.1 }}
>

// Framer Motion - Scale
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>

// CSS - Pulse
className="animate-pulse"

// CSS - Transition
className="transition-all duration-300"
className="active:scale-95"
```

---

## 🎯 Layout Patterns

### Split View (ProductModal)

```tsx
<div className="flex flex-col md:flex-row">
  {/* Left Column */}
  <div className="h-[35vh] md:h-full md:w-1/2">
    {/* Image */}
  </div>
  
  {/* Right Column */}
  <div className="flex-1 md:w-1/2 -mt-16 md:mt-0">
    {/* Content */}
  </div>
</div>
```

### Title + Price Row (CRITICAL)

```tsx
<div className="flex items-start justify-between gap-4 w-full mb-2">
  <div className="flex-1 min-w-0">
    <h2>{title}</h2>
  </div>
  <div className="flex-shrink-0 whitespace-nowrap pt-1">
    <PriceDisplay price={price} />
  </div>
</div>
```

### Sticky Footer

```tsx
<div className="flex flex-col h-full">
  <div className="flex-1 overflow-y-auto">
    {/* Scrollable content */}
  </div>
  <div className="sticky bottom-0 bg-white border-t">
    {/* Footer */}
  </div>
</div>
```

---

## 🎨 Button Styles

```tsx
// Primary Button
className="
  px-6 py-3 
  bg-gradient-to-r from-[#FF6B9D] to-[#FF5A8E] 
  hover:from-[#FF5A8E] hover:to-[#FF4979]
  text-white font-bold rounded-xl
  shadow-lg shadow-pink-500/25
  hover:shadow-xl hover:shadow-pink-500/30
  transition-all active:scale-95
"

// Secondary Button
className="
  px-6 py-3
  bg-white dark:bg-slate-800
  border-2 border-slate-200 dark:border-slate-700
  hover:border-[#FF6B9D]
  text-slate-700 dark:text-slate-300
  font-semibold rounded-xl
  transition-all
"

// Icon Button
className="
  w-10 h-10
  bg-slate-100 dark:bg-slate-800
  hover:bg-[#FF6B9D] hover:text-white
  rounded-full
  flex items-center justify-center
  transition-all
"
```

---

## 🎨 Card Styles

```tsx
// Standard Card
className="
  card  // ← Global class
  p-3
  hover:shadow-xl
  transition-all duration-300
"

// Gradient Card
className="
  bg-gradient-to-br from-pink-50 to-rose-50
  dark:from-slate-800 dark:to-slate-700
  rounded-2xl p-4
  border border-pink-100 dark:border-slate-700
"
```

---

## 🔍 Common Patterns

### Loading State

```tsx
{isLoading ? (
  <ProductCardSkeleton />
) : (
  <ProductCard product={product} />
)}
```

### Empty State

```tsx
{products.length === 0 && (
  <div className="flex flex-col items-center py-16">
    <SearchX className="w-12 h-12 text-slate-300" />
    <h3>No results found</h3>
    <button onClick={onClear}>Clear Filters</button>
  </div>
)}
```

### Conditional Rendering

```tsx
{condition && <Component />}
{condition ? <ComponentA /> : <ComponentB />}
```

### List Rendering

```tsx
{items.map((item) => (
  <Component key={item.id} item={item} />
))}
```

---

## 🐛 Debugging Checklist

```tsx
// 1. Check React DevTools
// - Component hierarchy
// - Props values
// - State values

// 2. Check TanStack Query DevTools
// - Cache status
// - Query keys
// - Stale time

// 3. Check Console
console.log('Debug:', { variable })
console.table(arrayData)

// 4. Check Network Tab
// - API calls
// - Response data
// - Status codes

// 5. Check Responsive
// - Mobile view (< 768px)
// - Tablet view (768-1024px)
// - Desktop view (> 1024px)
```

---

## 📦 Import Shortcuts

```tsx
// Providers
import { useCart } from '@/providers/CartProvider'
import { useProductsData } from '@/providers/ProductsProvider'

// API
import { getProduct, getProducts } from '@/lib/api'

// Icons
import { ShoppingCart, X, Plus, Minus } from 'lucide-react'

// Motion
import { motion, AnimatePresence } from 'framer-motion'

// Query
import { useQuery } from '@tanstack/react-query'
```

---

## ⚠️ Common Mistakes to Avoid

```tsx
// ❌ DON'T: Hardcode quantity controls
<button onClick={() => setQty(qty - 1)}>-</button>

// ✅ DO: Use shared component
<QuantitySelector ... />

// ❌ DON'T: Manual fetching in ProductModal
useEffect(() => { fetch(...) }, [])

// ✅ DO: Use the hook
const { displayProduct } = useProductLogic({ product, isOpen })

// ❌ DON'T: Forget min-w-0 on flex items
<div className="flex-1">

// ✅ DO: Add min-w-0 for text truncation
<div className="flex-1 min-w-0">

// ❌ DON'T: Forget dark mode
className="bg-white text-black"

// ✅ DO: Add dark variants
className="bg-white dark:bg-slate-900 text-black dark:text-white"
```

---

## 🚀 Performance Tips

```tsx
// 1. Memoize expensive calculations
const result = useMemo(() => expensiveCalc(data), [data])

// 2. Memoize callbacks
const handleClick = useCallback(() => {
  doSomething()
}, [dependency])

// 3. Lazy load heavy components
const HeavyComponent = dynamic(() => import('./Heavy'), {
  ssr: false,
  loading: () => <Skeleton />
})

// 4. Debounce user input
const debouncedSearch = useDebouncedValue(searchQuery, 300)

// 5. Use TanStack Query cache
// - Set appropriate staleTime
// - Use initialData for instant UI
```

---

## 📝 TypeScript Snippets

```tsx
// Product Interface
interface Product {
  id: string
  name: string
  price: number
  image?: string
  category?: string
  // ... more fields
}

// Component Props
interface MyComponentProps {
  product: Product
  onAction: () => void
  isLoading?: boolean
}

// Event Handlers
const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
  e.stopPropagation()
  // ...
}

// State with Type
const [products, setProducts] = useState<Product[]>([])
```

---

**Quick Reference Complete** ✅

*Bookmark this page for fast lookups!*
