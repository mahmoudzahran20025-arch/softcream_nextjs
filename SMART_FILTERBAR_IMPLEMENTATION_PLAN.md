# 🎯 Smart FilterBar & Auto-Tracking System - Implementation Plan

## ✅ Phase 1: Foundation (COMPLETED)

### 1. CategoryTrackingProvider Created ✅
**File:** `src/providers/CategoryTrackingProvider.tsx`

**Features:**
- ✅ Scoped state management (NOT in global Providers.tsx)
- ✅ `activeCategory` state tracking
- ✅ `isUserInteracting` lock to prevent scroll-fighting
- ✅ `scrollToCategory()` helper with smooth scroll
- ✅ `isCompactMode` state for FilterBar height
- ✅ RTL-aware scrolling support
- ✅ Interaction timeout management (1s delay)

**State Management:**
```typescript
{
  activeCategory: string | null,
  setActiveCategory: (category: string | null) => void,
  isUserInteracting: boolean,
  setIsUserInteracting: (interacting: boolean) => void,
  scrollToCategory: (categoryId: string) => void,
  isCompactMode: boolean,
  setIsCompactMode: (compact: boolean) => void
}
```

---

### 2. PageContent Integration ✅
**File:** `src/components/pages/PageContent.tsx`

**Changes:**
- ✅ Imported `CategoryTrackingProvider`
- ✅ Wrapped content with scoped provider
- ✅ Provider only active in Menu/Home view
- ✅ State created/destroyed with page lifecycle

**Architecture:**
```
ProductsProvider
  └── CategoryTrackingProvider (Scoped)
      ├── PageContentClient
      │   ├── Header
      │   ├── FilterBar (will consume context)
      │   └── Modals
      └── Main
          └── ProductsGrid (will consume context)
```

---

## 🚧 Phase 2: FilterBar Refactor (NEXT STEPS)

### Required Changes to `src/components/pages/Home/FilterBar.tsx`

#### 1. Consume CategoryTracking Context
```typescript
import { useCategoryTracking } from '@/providers/CategoryTrackingProvider'

const {
  activeCategory,
  scrollToCategory,
  isCompactMode,
  setIsCompactMode
} = useCategoryTracking()
```

#### 2. Add Compact Mode Logic
```typescript
useEffect(() => {
  const handleScroll = () => {
    const scrollY = window.scrollY
    setIsCompactMode(scrollY > 150)
  }
  
  window.addEventListener('scroll', handleScroll, { passive: true })
  return () => window.removeEventListener('scroll', handleScroll)
}, [setIsCompactMode])
```

#### 3. Category Tabs with Auto-Highlight
```typescript
// Add horizontal scrollable category tabs
<div className="flex gap-2 overflow-x-auto scrollbar-hide">
  {CATEGORIES.map(cat => (
    <button
      key={cat.value || 'all'}
      onClick={() => scrollToCategory(cat.value || 'all')}
      className={`
        ${activeCategory === cat.value ? 'active-styles' : 'inactive-styles'}
      `}
    >
      {cat.label}
    </button>
  ))}
</div>
```

#### 4. Compact Mode Styles
```typescript
<div className={`
  transition-all duration-300
  ${isCompactMode 
    ? 'py-2 min-h-[60px]'  // Compact
    : 'py-4 min-h-[80px]'  // Normal
  }
`}>
```

#### 5. Mobile Drawer for Advanced Filters
```typescript
import { motion, AnimatePresence } from 'framer-motion'

<AnimatePresence>
  {showAdvanced && (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      className="fixed inset-x-0 bottom-0 z-50 bg-white dark:bg-slate-900 rounded-t-3xl shadow-2xl"
    >
      {/* Advanced filters content */}
    </motion.div>
  )}
</AnimatePresence>
```

---

## 🚧 Phase 3: ProductsGrid Refactor (NEXT STEPS)

### Required Changes to `src/components/pages/ProductsGrid.tsx`

#### 1. Consume CategoryTracking Context
```typescript
import { useCategoryTracking } from '@/providers/CategoryTrackingProvider'

const {
  setActiveCategory,
  isUserInteracting
} = useCategoryTracking()
```

#### 2. Add IntersectionObserver
```typescript
useEffect(() => {
  if (isUserInteracting) return // Don't update during manual scroll
  
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
          const category = entry.target.getAttribute('data-category')
          if (category) {
            setActiveCategory(category)
          }
        }
      })
    },
    {
      threshold: [0.5],
      rootMargin: '-180px 0px -50% 0px' // Account for sticky header
    }
  )
  
  // Observe all category sections
  document.querySelectorAll('[data-category]').forEach(el => {
    observer.observe(el)
  })
  
  return () => observer.disconnect()
}, [isUserInteracting, setActiveCategory])
```

#### 3. Add Category IDs and Data Attributes
```typescript
{groupedProducts.map(({ category, products: categoryProducts }) => (
  <div 
    key={category}
    id={`category-${category}`}           // ✅ For scrollToCategory
    data-category={category}               // ✅ For IntersectionObserver
    className="space-y-4"
  >
    {/* Category content */}
  </div>
))}
```

---

## 📋 Implementation Checklist

### Phase 1: Foundation ✅
- [x] Create CategoryTrackingProvider
- [x] Add to PageContent (scoped)
- [x] Test provider mounting/unmounting

### Phase 2: FilterBar
- [ ] Import useCategoryTracking hook
- [ ] Add scroll listener for compact mode
- [ ] Create category tabs UI
- [ ] Implement click-to-scroll
- [ ] Add active category highlighting
- [ ] Create mobile drawer with Framer Motion
- [ ] Test RTL horizontal scrolling
- [ ] Test compact mode transition

### Phase 3: ProductsGrid
- [ ] Import useCategoryTracking hook
- [ ] Add category IDs to sections
- [ ] Add data-category attributes
- [ ] Implement IntersectionObserver
- [ ] Test auto-highlight on scroll
- [ ] Test interaction lock
- [ ] Handle empty categories

### Phase 4: Testing
- [ ] Test scroll-to-category
- [ ] Test auto-highlight
- [ ] Test interaction lock (no fighting)
- [ ] Test compact mode
- [ ] Test mobile drawer
- [ ] Test RTL support
- [ ] Test performance (useMemo)
- [ ] Test edge cases

---

## 🎨 UX Requirements

### Desktop
- ✅ Sticky FilterBar at top
- ✅ Compact mode after 150px scroll
- ✅ Horizontal category tabs
- ✅ Panel for advanced filters
- ✅ Auto-highlight active category

### Mobile
- ✅ Compact FilterBar
- ✅ Horizontal scrollable tabs
- ✅ Bottom drawer for advanced filters
- ✅ Touch-friendly tap targets
- ✅ Smooth animations

### RTL Support
- ✅ Horizontal scroll works in Arabic
- ✅ Scroll direction correct
- ✅ Tab alignment correct

---

## 🔧 Technical Details

### Scroll Offset Calculation
```typescript
// Header: 72px (sticky)
// FilterBar: 80-120px (sticky, varies with compact mode)
// Total offset: ~180px
const headerOffset = 180
```

### Interaction Lock Duration
```typescript
// 1 second delay after click
// Allows smooth scroll to complete
const INTERACTION_LOCK_DURATION = 1000
```

### IntersectionObserver Thresholds
```typescript
{
  threshold: [0.5],                    // 50% visible
  rootMargin: '-180px 0px -50% 0px'   // Account for header
}
```

---

## 📦 Dependencies

### Required
- ✅ React 18+ (already installed)
- ✅ TypeScript (already installed)
- ✅ Tailwind CSS (already installed)
- ⚠️ Framer Motion (need to install)

### Installation
```bash
npm install framer-motion
```

---

## 🚀 Next Steps

1. **Install Framer Motion**
   ```bash
   npm install framer-motion
   ```

2. **Refactor FilterBar**
   - Add category tabs
   - Implement compact mode
   - Create mobile drawer

3. **Refactor ProductsGrid**
   - Add IntersectionObserver
   - Add category IDs
   - Test auto-highlight

4. **Test & Polish**
   - Test all interactions
   - Fix any bugs
   - Optimize performance

---

## 📊 Current Status

**Phase 1:** ✅ COMPLETE  
**Phase 2:** 🚧 READY TO START  
**Phase 3:** 🚧 PENDING  
**Phase 4:** 🚧 PENDING  

**Overall Progress:** 25% Complete

---

## 🎯 Success Criteria

- ✅ Category tabs auto-highlight on scroll
- ✅ Click tab scrolls to category smoothly
- ✅ No scroll-fighting during interactions
- ✅ Compact mode activates after 150px
- ✅ Mobile drawer works smoothly
- ✅ RTL support works correctly
- ✅ Performance is optimal (no jank)
- ✅ All edge cases handled

---

**Status:** Foundation Complete - Ready for FilterBar Refactor  
**Next Action:** Install Framer Motion and refactor FilterBar component
