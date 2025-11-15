# Component Architecture - Enterprise Structure

## Overview
The component directory has been reorganized into a scalable, enterprise-grade structure with clear separation of concerns. This document outlines the new architecture and guidelines for maintaining it.

---

## Directory Structure

```
src/components/
├── modals/                    # Modal dialogs (user interactions)
│   ├── CartModal/
│   │   └── index.tsx
│   ├── CheckoutModal/
│   │   ├── index.tsx
│   │   ├── DeliveryOptions.tsx
│   │   ├── CheckoutForm.tsx
│   │   ├── OrderSummary.tsx
│   │   └── validation.ts
│   ├── ProductModal/
│   │   └── index.tsx
│   ├── TrackingModal/
│   │   └── index.tsx
│   ├── MyOrdersModal/
│   │   └── index.tsx
│   ├── EditOrderModal/
│   │   └── index.tsx
│   ├── OrderSuccessModal/
│   │   └── index.tsx
│   └── Orders System - Complete Documentation.md
│
├── ui/                        # Reusable UI components
│   ├── Header.tsx
│   ├── FilterBar.tsx
│   ├── TrustBanner.tsx
│   ├── OrdersBadge.tsx
│   ├── ToastContainer.tsx
│   ├── ProductCard.tsx
│   ├── NutritionSummary.tsx
│   ├── SimpleOrderTimer.tsx
│   └── MarqueeSwiper.tsx
│
├── pages/                     # Page-level components
│   ├── PageContent.tsx
│   ├── PageContentClient.tsx
│   ├── ProductsGrid.tsx
│   ├── ProductsSwiperWrapper.tsx
│   └── Sidebar.tsx
│
├── StorytellingHero/          # Independent hero section
│   ├── index.tsx
│   ├── HeroIntro.tsx
│   ├── HeroFooter.tsx
│   ├── StoryCard.tsx
│   ├── StoryCardStack.tsx
│   ├── IconComponent.tsx
│   ├── InteractiveSections.tsx
│   └── data/
│       └── stories.ts
│
├── server/                    # Server-side components
│   ├── Footer.tsx
│   ├── Hero.tsx
│   └── ProductsGrid.tsx
│
└── client/                    # (DEPRECATED - now empty)
```

---

## Component Categories

### 1. **Modals** (`src/components/modals/`)
**Purpose:** User interaction dialogs and modal windows  
**Characteristics:**
- Client-side only (`'use client'`)
- Dynamically imported with `ssr: false`
- Each modal in its own folder with `index.tsx`
- Sub-components and utilities co-located

**Examples:**
- `CartModal/index.tsx` - Shopping cart display
- `CheckoutModal/index.tsx` - Order checkout flow
- `ProductModal/index.tsx` - Product details view
- `TrackingModal/index.tsx` - Order tracking
- `OrderSuccessModal/index.tsx` - Success confirmation

**Import Pattern:**
```typescript
import CartModal from '@/components/modals/CartModal'
```

---

### 2. **UI Components** (`src/components/ui/`)
**Purpose:** Reusable, stateless UI elements  
**Characteristics:**
- Presentational components
- Can be server or client components
- No business logic
- Highly reusable across the app

**Examples:**
- `Header.tsx` - Navigation header
- `ProductCard.tsx` - Product display card
- `FilterBar.tsx` - Product filtering
- `OrdersBadge.tsx` - Order count badge
- `ToastContainer.tsx` - Notification system

**Import Pattern:**
```typescript
import Header from '@/components/ui/Header'
import ProductCard from '@/components/ui/ProductCard'
```

---

### 3. **Pages** (`src/components/pages/`)
**Purpose:** Page-level layout and composition components  
**Characteristics:**
- Orchestrate multiple components
- Handle page-level state and logic
- Combine UI components and modals
- Server or client components as needed

**Examples:**
- `PageContent.tsx` - Main page layout (server)
- `PageContentClient.tsx` - Client-side interactions
- `ProductsGrid.tsx` - Products display
- `Sidebar.tsx` - Navigation sidebar

**Import Pattern:**
```typescript
import PageContent from '@/components/pages/PageContent'
import ProductsGrid from '@/components/pages/ProductsGrid'
```

---

### 4. **StorytellingHero** (`src/components/StorytellingHero/`)
**Purpose:** Independent hero section with animations  
**Characteristics:**
- Self-contained feature section
- Uses framer-motion for animations
- Hydration-aware rendering
- Shared motion imports via `@/lib/motion-shared`

**Sub-components:**
- `HeroIntro.tsx` - Hero introduction
- `HeroFooter.tsx` - Hero footer
- `StoryCard.tsx` - Story card with animations
- `StoryCardStack.tsx` - Card stack container
- `IconComponent.tsx` - Icon rendering
- `InteractiveSections.tsx` - Interactive sections

**Import Pattern:**
```typescript
import StorytellingHero from '@/components/StorytellingHero'
```

---

### 5. **Server Components** (`src/components/server/`)
**Purpose:** Server-side only components  
**Characteristics:**
- No `'use client'` directive
- Direct database access (if needed)
- No client-side state
- Reduced JavaScript payload

**Examples:**
- `Footer.tsx` - Static footer
- `Hero.tsx` - Static hero section
- `ProductsGrid.tsx` - Server-rendered products

**Import Pattern:**
```typescript
import Footer from '@/components/server/Footer'
```

---

## Import Guidelines

### ✅ Correct Import Patterns

**From modals:**
```typescript
const CheckoutModal = dynamic(() => import('@/components/modals/CheckoutModal'), {
  ssr: false,
  loading: () => null,
})
```

**From UI:**
```typescript
import Header from '@/components/ui/Header'
import ProductCard from '@/components/ui/ProductCard'
```

**From pages:**
```typescript
import PageContent from '@/components/pages/PageContent'
```

**From StorytellingHero:**
```typescript
import StorytellingHero from '@/components/StorytellingHero'
```

**From server:**
```typescript
import Footer from '@/components/server/Footer'
```

### ❌ Avoid

```typescript
// Don't use old paths
import CartModal from '@/components/client/CartModal'

// Don't use relative paths from different categories
import Header from '../../ui/Header'

// Don't mix concerns
import { CheckoutModal, Header, ProductsGrid } from '@/components'
```

---

## Adding New Components

### New Modal
1. Create folder: `src/components/modals/YourModal/`
2. Create file: `src/components/modals/YourModal/index.tsx`
3. Add sub-components if needed
4. Import in `PageContentClient.tsx` with dynamic import

### New UI Component
1. Create file: `src/components/ui/YourComponent.tsx`
2. Keep it stateless and reusable
3. Import where needed

### New Page Component
1. Create file: `src/components/pages/YourPage.tsx`
2. Compose UI and modal components
3. Handle page-level logic

---

## Performance Considerations

### Dynamic Imports
Modals are dynamically imported with `ssr: false`:
```typescript
const CheckoutModal = dynamic(() => import('@/components/modals/CheckoutModal'), {
  ssr: false,
  loading: () => null,
})
```

### Hydration Gating
Components using animations gate them until hydration:
```typescript
const isHydrated = useHydrated()
if (!isHydrated) return <StaticContent />
return <AnimatedContent />
```

### Shared Utilities
- Motion imports: `@/lib/motion-shared`
- DOM batching: `@/utils/batch-dom`
- Storage: `@/lib/storage.client`

---

## Maintenance Guidelines

### When Refactoring
1. Update import paths in all dependent files
2. Run `npm run build` to verify
3. Check TypeScript errors: `npm run type-check`
4. Test in browser

### Adding Dependencies
- Keep modals lightweight
- Move heavy logic to utilities
- Use code splitting for large libraries

### Testing
- Test modal interactions
- Verify UI component reusability
- Check page-level composition

---

## File Naming Conventions

- **Folders:** PascalCase (e.g., `CartModal`, `ProductCard`)
- **Files:** PascalCase for components (e.g., `Header.tsx`)
- **Index files:** Always `index.tsx` for folder exports
- **Utilities:** camelCase (e.g., `validation.ts`)

---

## Migration Notes

### From Old Structure
- `src/components/client/` → Distributed to `modals/`, `ui/`, `pages/`
- `src/components/server/` → Remains unchanged
- `src/components/StorytellingHero/` → Remains as independent section

### Import Updates
All imports have been updated to use the new paths:
- `@/components/client/CartModal` → `@/components/modals/CartModal`
- `@/components/client/Header` → `@/components/ui/Header`
- `@/components/client/PageContent` → `@/components/pages/PageContent`

---

## Architecture Principles

1. **Separation of Concerns**
   - Modals handle user interactions
   - UI components are presentational
   - Pages orchestrate composition

2. **Scalability**
   - Easy to add new modals
   - Clear folder structure
   - Consistent naming conventions

3. **Performance**
   - Dynamic imports for modals
   - Server components where possible
   - Shared utilities for common tasks

4. **Maintainability**
   - Co-locate related files
   - Clear import paths
   - Consistent patterns

---

## Quick Reference

| Category | Location | Purpose | Import |
|----------|----------|---------|--------|
| Modals | `modals/ModalName/` | User interactions | `@/components/modals/ModalName` |
| UI | `ui/ComponentName.tsx` | Reusable elements | `@/components/ui/ComponentName` |
| Pages | `pages/PageName.tsx` | Page composition | `@/components/pages/PageName` |
| Hero | `StorytellingHero/` | Hero section | `@/components/StorytellingHero` |
| Server | `server/ComponentName.tsx` | Server-only | `@/components/server/ComponentName` |

---

**Last Updated:** November 16, 2025  
**Version:** 1.0 - Enterprise Structure  
**Status:** ✅ Active
