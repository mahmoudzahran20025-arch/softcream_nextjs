# Component Quick Start Guide

## 🎯 Finding Components

### Modals (User Interactions)
```typescript
import CartModal from '@/components/modals/CartModal'
import CheckoutModal from '@/components/modals/CheckoutModal'
import ProductModal from '@/components/modals/ProductModal'
import TrackingModal from '@/components/modals/TrackingModal'
import OrderSuccessModal from '@/components/modals/OrderSuccessModal'
```

### UI Components (Reusable Elements)
```typescript
import Header from '@/components/ui/Header'
import ProductCard from '@/components/ui/ProductCard'
import FilterBar from '@/components/ui/FilterBar'
import OrdersBadge from '@/components/ui/OrdersBadge'
import ToastContainer from '@/components/ui/ToastContainer'
```

### Page Components (Page Layout)
```typescript
import PageContent from '@/components/pages/PageContent'
import ProductsGrid from '@/components/pages/ProductsGrid'
import Sidebar from '@/components/pages/Sidebar'
```

### Hero Section
```typescript
import StorytellingHero from '@/components/StorytellingHero'
```

### Server Components
```typescript
import Footer from '@/components/server/Footer'
```

---

## 📁 Directory Structure at a Glance

```
src/components/
├── modals/          ← User interaction dialogs
├── ui/              ← Reusable UI elements
├── pages/           ← Page-level components
├── StorytellingHero/← Hero section (independent)
├── server/          ← Server-only components
└── ARCHITECTURE.md  ← Full documentation
```

---

## ➕ Adding a New Component

### New Modal
```bash
# 1. Create folder
mkdir src/components/modals/YourModal

# 2. Create file
touch src/components/modals/YourModal/index.tsx

# 3. Add code
# 'use client'
# export default function YourModal() { ... }

# 4. Import in PageContentClient
# const YourModal = dynamic(() => import('@/components/modals/YourModal'), {
#   ssr: false,
#   loading: () => null,
# })
```

### New UI Component
```bash
# 1. Create file
touch src/components/ui/YourComponent.tsx

# 2. Add code
# export default function YourComponent() { ... }

# 3. Import where needed
# import YourComponent from '@/components/ui/YourComponent'
```

### New Page Component
```bash
# 1. Create file
touch src/components/pages/YourPage.tsx

# 2. Add code
# export default function YourPage() { ... }

# 3. Import in app
# import YourPage from '@/components/pages/YourPage'
```

---

## 🔍 Component Categories

| Category | Location | When to Use | Example |
|----------|----------|-------------|---------|
| **Modal** | `modals/` | User interactions, dialogs | CartModal, CheckoutModal |
| **UI** | `ui/` | Reusable, stateless elements | Header, ProductCard |
| **Page** | `pages/` | Page composition, layout | PageContent, ProductsGrid |
| **Hero** | `StorytellingHero/` | Hero section | StorytellingHero |
| **Server** | `server/` | Server-only rendering | Footer |

---

## ✅ Import Checklist

Before importing a component, ask:

- [ ] Is it a modal? → Use `@/components/modals/`
- [ ] Is it a reusable UI element? → Use `@/components/ui/`
- [ ] Is it a page component? → Use `@/components/pages/`
- [ ] Is it the hero section? → Use `@/components/StorytellingHero`
- [ ] Is it server-only? → Use `@/components/server/`

---

## 🚀 Common Tasks

### Import a Modal
```typescript
import dynamic from 'next/dynamic'

const CartModal = dynamic(() => import('@/components/modals/CartModal'), {
  ssr: false,
  loading: () => null,
})
```

### Import a UI Component
```typescript
import Header from '@/components/ui/Header'
```

### Import a Page Component
```typescript
import ProductsGrid from '@/components/pages/ProductsGrid'
```

### Use StorytellingHero
```typescript
import StorytellingHero from '@/components/StorytellingHero'

export default function Page() {
  return <StorytellingHero />
}
```

---

## 📝 File Naming

- **Folders:** `PascalCase` (e.g., `CartModal`, `ProductCard`)
- **Components:** `PascalCase` (e.g., `Header.tsx`)
- **Index files:** Always `index.tsx`
- **Utilities:** `camelCase` (e.g., `validation.ts`)

---

## 🎨 Component Template

### Modal Template
```typescript
'use client'

import { X } from 'lucide-react'

interface YourModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function YourModal({ isOpen, onClose }: YourModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Modal Title</h2>
          <button onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>
        {/* Content */}
      </div>
    </div>
  )
}
```

### UI Component Template
```typescript
interface YourComponentProps {
  // Props
}

export default function YourComponent({ }: YourComponentProps) {
  return (
    <div>
      {/* Content */}
    </div>
  )
}
```

### Page Component Template
```typescript
import Header from '@/components/ui/Header'
import ProductsGrid from '@/components/pages/ProductsGrid'

export default function YourPage() {
  return (
    <>
      <Header />
      <main>
        <ProductsGrid />
      </main>
    </>
  )
}
```

---

## 🐛 Troubleshooting

### Import Not Found
- Check the component exists in the correct folder
- Verify the path uses `@/components/` alias
- Run `npm run type-check` to verify

### Component Not Rendering
- Check if it's a modal (needs dynamic import)
- Verify `'use client'` directive if needed
- Check browser console for errors

### Build Fails
- Run `npm run build` to see full error
- Check all import paths are correct
- Verify no circular dependencies

---

## 📚 Learn More

- Full documentation: `src/components/ARCHITECTURE.md`
- Refactoring details: `REFACTORING_SUMMARY.md`
- Performance notes: `perf/README.md`

---

**Last Updated:** November 16, 2025  
**Version:** 1.0
