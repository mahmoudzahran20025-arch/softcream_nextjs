# 🍦 Soft Cream Web App

[![Next.js](https://img.shields.io/badge/Next.js-16.0.3-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.15-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react&logoColor=black)](https://react.dev/)

A modern, high-performance ice cream ordering web application built with Next.js 16 App Router, featuring smart cart management, real-time order tracking, and optimized data loading.

---

## ✨ Key Features

### 🛒 Smart Cart System

Unique item signature logic that treats products with different add-ons as separate cart items:

```typescript
// Same product + different addons = DIFFERENT cart items
// Product A + [Addon 1, Addon 2] → Cart Item 1
// Product A + [Addon 3]          → Cart Item 2
// Product A + []                 → Cart Item 3

interface CartItem {
  productId: string
  quantity: number
  selectedAddons?: string[]  // Array of addon IDs
}
```

### ⚡ Optimized Performance

- **Smart Expansion Pattern**: Load only needed data via `?expand=` parameter
- **Server Components**: Static content rendered on server
- **Client Components**: Interactive features with minimal JavaScript
- **Image Optimization**: Lazy loading and responsive images
- **Code Splitting**: Automatic route-based splitting

### 🎨 Modern UI/UX

- **RTL/LTR Support**: Full Arabic and English support
- **Dark/Light Mode**: Seamless theme switching
- **Responsive Design**: Mobile-first approach
- **Smooth Animations**: Framer Motion integration
- **Swiper Carousels**: Touch-friendly product browsing

### 🔄 Real-time Features

- **Order Tracking**: Live order status updates
- **Cart Persistence**: SessionStorage-based cart
- **Nutrition Summary**: Real-time nutrition calculations
- **Smart Filtering**: Instant product search and filtering

### 🔒 Security & Validation

- **Client-side Validation**: Form validation with TypeScript
- **Server-side Pricing**: Never trust frontend prices
- **Idempotency Keys**: Prevent duplicate orders
- **Device Tracking**: Secure device identification

---

## 🏗️ Architecture

### App Router Structure

```
src/
├── app/                      # Next.js App Router
│   ├── layout.tsx            # Root layout (RTL, fonts)
│   ├── page.tsx              # Home page (SSR + ISR)
│   ├── admin/                # Admin dashboard
│   ├── globals.css           # Global styles
│   ├── error.tsx             # Error boundary
│   ├── loading.tsx           # Loading UI
│   └── not-found.tsx         # 404 page
├── components/               # React Components
│   ├── modals/               # Modal components
│   │   ├── ProductModal/     # Product details + addons
│   │   ├── CartModal/        # Shopping cart
│   │   └── CheckoutModal/    # 3-step checkout
│   ├── pages/                # Page-specific components
│   │   ├── Home/             # Homepage components
│   │   └── ProductsGrid.tsx  # Product grid
│   ├── server/               # Server Components
│   │   └── Footer.tsx        # Static footer
│   └── ui/                   # Reusable UI components
│       ├── ProductCard.tsx   # Product card
│       ├── NutritionCard.tsx # Nutrition display
│       └── common/           # Common UI elements
├── providers/                # React Context Providers
│   ├── Providers.tsx         # Root provider wrapper
│   ├── CartProvider.tsx      # Cart state (with addons)
│   ├── ProductsProvider.tsx  # Product filtering
│   └── ThemeProvider.tsx     # Dark mode + i18n
├── lib/                      # Core utilities
│   ├── api.ts                # API client (server-safe)
│   ├── adminApi.ts           # Admin API client
│   ├── orderPoller.ts        # Real-time polling
│   ├── storage.client.ts     # Storage manager
│   └── queryClient.ts        # TanStack Query config
├── hooks/                    # Custom React Hooks
│   ├── useApiClient.ts       # API request hook
│   └── useHydrated.ts        # SSR hydration check
├── data/                     # Static data
│   └── translations-data.ts  # i18n strings
└── utils/                    # Utility functions
    └── batch-dom.ts          # DOM batch operations
```

### Component Strategy

| Component | Type | Reason |
|-----------|------|--------|
| `Footer` | Server | Static content |
| `ProductsGrid` | Client | Interactive (Swiper) |
| `ProductCard` | Client | Add to cart action |
| `Header` | Client | Theme/language toggle |
| `CartModal` | Client | State management |
| `CheckoutModal` | Client | Form handling |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Backend API running (see [softcream-api](../softcream-api))

### Installation

```bash
# Clone the repository
cd soft-cream-nextjs

# Install dependencies
npm install
```

### Environment Setup

Create a `.env.local` file in the root directory:

```env
# Backend API URL
NEXT_PUBLIC_API_URL=https://softcream-api.your-subdomain.workers.dev

# Optional: Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

### Development

```bash
# Start development server
npm run dev

# Application will be available at:
# http://localhost:3000
```

### Build & Deploy

```bash
# Type check
npm run type-check

# Lint code
npm run lint

# Build for production
npm run build

# Start production server
npm start
```

---

## 📦 State Management

### Cart Provider (Enhanced with Add-ons)

```typescript
import { useCart } from '@/providers/CartProvider'

function ProductModal() {
  const { cart, addToCart, removeFromCart, getCartTotal } = useCart()
  
  // Add product with addons
  const handleAddToCart = () => {
    addToCart(product, quantity, ['addon-1', 'addon-2'])
  }
  
  // Calculate total with addon prices
  const total = getCartTotal(productsMap, addonsMap)
}
```

### Products Provider

```typescript
import { useProductsData } from '@/providers/ProductsProvider'

function FilterBar() {
  const { filteredProducts, applyFilters } = useProductsData()
  
  // Apply filters
  applyFilters({
    searchQuery: 'chocolate',
    category: 'ice-cream',
    energyType: 'mental'
  })
}
```

### Theme Provider

```typescript
import { useGlobal } from '@/providers/ThemeProvider'

function Header() {
  const { theme, toggleTheme, language, t } = useGlobal()
  
  // Toggle dark mode
  toggleTheme()
  
  // Get translated text
  const title = t('app.title')
}
```

---

## 🎨 Styling

### Tailwind Configuration

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        primary: { /* purple shades */ },
      },
      fontFamily: {
        cairo: ['var(--font-cairo)', 'sans-serif'],
      },
    },
  },
}
```

### Dark Mode Support

```tsx
// Always provide dark mode variants
<div className="
  bg-white dark:bg-slate-950
  text-slate-900 dark:text-white
  border-slate-200 dark:border-slate-700
">
```

### RTL Support

```tsx
// Layout is RTL by default (Arabic)
<html lang="ar" dir="rtl">

// Use logical properties
className="ms-4"  // margin-inline-start (RTL-aware)
className="me-4"  // margin-inline-end (RTL-aware)
```

---

## 🔌 API Integration

### Smart Expansion Pattern

```typescript
import { getProducts, getProduct } from '@/lib/api'

// Request only needed data
const products = await getProducts({ 
  expand: ['ingredients', 'nutrition', 'addons'] 
})

const product = await getProduct(productId, { 
  expand: ['recommendations', 'addons'] 
})
```

### Order Submission

```typescript
import { submitOrder } from '@/lib/api'

// Never send prices from frontend
const orderData = {
  items: [
    { 
      productId: '1', 
      quantity: 2,
      selectedAddons: ['addon-1', 'addon-2']  // Only IDs
    }
  ],
  customer: { name, phone, address },
  deliveryMethod: 'delivery',
  location: { lat, lng }
}

const result = await submitOrder(orderData)
```

---

## 🧪 Testing & Quality

### Type Checking

```bash
# Run TypeScript type checker
npm run type-check

# Expected: 0 errors
```

### Linting

```bash
# Run ESLint
npm run lint

# Auto-fix issues
npm run lint:fix
```

### Manual Testing Checklist

- [ ] Order submission flow (delivery + pickup)
- [ ] Cart persistence across page reloads
- [ ] Add-ons selection and pricing
- [ ] Dark mode toggle
- [ ] RTL layout correctness
- [ ] Mobile responsiveness
- [ ] Order tracking updates

---

## 📊 Performance Optimization

### Image Optimization

```tsx
import Image from 'next/image'

<Image 
  src={product.image} 
  alt={product.name}
  width={200}
  height={250}
  loading="lazy"
/>
```

### Code Splitting

```tsx
// Dynamic imports for heavy components
const AdminApp = dynamic(() => import('@/components/admin/AdminApp'), {
  ssr: false,
  loading: () => <LoadingSpinner />
})
```

### Memoization

```tsx
// Memoize expensive calculations
const productsMap = useMemo(() => {
  return products.reduce((map, product) => {
    map[product.id] = product
    return map
  }, {})
}, [products])
```

---

## 📁 Project Structure Details

### Modal Components

```
components/modals/
├── ProductModal/
│   ├── index.tsx           # Main modal
│   ├── ProductHeader.tsx   # Product info
│   ├── ProductImage.tsx    # Image display
│   ├── AddonsList.tsx      # Addons selection (NEW)
│   ├── NutritionInfo.tsx   # Nutrition facts
│   ├── ActionFooter.tsx    # Add to cart button
│   └── useProductLogic.ts  # Modal logic hook
├── CartModal/
│   ├── index.tsx           # Cart modal
│   ├── CartItem.tsx        # Cart item with addons
│   └── CartSummary.tsx     # Price summary
└── CheckoutModal/
    ├── index.tsx           # 3-step checkout
    └── validation.ts       # Form validation
```

### UI Components

```
components/ui/
├── ProductCard.tsx         # Product card
├── NutritionCard.tsx       # Nutrition display
├── NutritionSummary.tsx    # Cart nutrition
├── common/
│   ├── NutritionIcon.tsx   # Nutrition icons
│   └── QuantitySelector.tsx # Quantity input
└── skeletons/
    └── ProductCardSkeleton.tsx # Loading state
```

---

## 📚 Documentation

- **[.cursorrules](/.cursorrules)** - Complete development rules and patterns
- **[ARCHITECTURE.md](/ARCHITECTURE.md)** - Detailed architecture guide
- **[COMPONENT_MAP.md](/COMPONENT_MAP.md)** - Component relationships
- **[QUICK_REFERENCE.md](/QUICK_REFERENCE.md)** - Quick reference guide

---

## 🔧 Configuration Files

### TypeScript Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Next.js Configuration

```javascript
// next.config.js
module.exports = {
  reactStrictMode: true,
  images: {
    domains: ['your-image-domain.com'],
  },
}
```

---

## 🌐 Internationalization

### Supported Languages

- **Arabic (ar)**: Primary language, RTL layout
- **English (en)**: Secondary language, LTR layout

### Translation Usage

```typescript
import { useGlobal } from '@/providers/ThemeProvider'

function Component() {
  const { t, language } = useGlobal()
  
  return (
    <h1>{t('home.hero.title')}</h1>
  )
}
```

---

## 🤝 Contributing

1. Follow TypeScript strict mode
2. Use functional components with hooks
3. Follow the coding standards in `.cursorrules`
4. Write meaningful commit messages
5. Update documentation for new features

---

## 📄 License

Private - All rights reserved

---

## 🔗 Related Projects

- **Backend API**: [softcream-api](../softcream-api) - Cloudflare Workers API

---

## 📈 Project Status

**Status**: ✅ Production Ready  
**Last Updated**: November 21, 2025  
**Version**: 0.1.0

### Recent Updates

- ✅ Add-ons System implemented
- ✅ Smart Expansion Pattern added
- ✅ Cart logic enhanced with addon support
- ✅ Server-side price validation
- ✅ Real-time order tracking
- ✅ Dark mode support
- ✅ RTL/LTR support

---

**Built with ❤️ using Next.js 16**
