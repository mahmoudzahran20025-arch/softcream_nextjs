'use client'

import { useMemo } from 'react'
import dynamic from 'next/dynamic'
// تم إزالة ProductCard لأنه تم نقله إلى ProductsSwiperWrapper
// import ProductCard from '@/components/client/ProductCard'
import { useProductsData } from '@/providers/ProductsProvider'

// ✅ Lazy load Swiper (heavy library ~50KB) - only load when products are displayed
// Create a wrapper component that handles Swiper loading
const ProductsSwiper = dynamic(
  () => import('./ProductsSwiperWrapper'),
  {
    ssr: false,
    loading: () => (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 min-h-[280px]">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-64 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
        ))}
      </div>
    ),
  }
)

interface Product {
  id: string
  name: string
  nameEn?: string
  price: number
  image?: string
  category?: string
  description?: string
  tags?: string
  ingredients?: string
  allergens?: string
  calories?: number
  protein?: number
  carbs?: number
  sugar?: number
  fat?: number
  fiber?: number
  energy_type?: string
  energy_score?: number
  badge?: string
}

export default function ProductsGrid() {
  const { filteredProducts } = useProductsData()
  const products = filteredProducts

  // Group products by category (memoized for performance)
  const groupedProducts = useMemo(() => {
    if (!products || products.length === 0) return []
    
    const groups: Record<string, Product[]> = {}
    
    products.forEach(product => {
      const category = product.category || 'أخرى'
      if (!groups[category]) {
        groups[category] = []
      }
      groups[category].push(product)
    })

    return Object.entries(groups).map(([category, items]) => ({
      category,
      products: items
    }))
  }, [products])

  if (!products || products.length === 0) {
    return (
      <section className="container mx-auto px-4 py-12">
        <div className="text-center">
          <p className="text-lg text-slate-600 dark:text-slate-400">
            لا توجد منتجات متاحة حالياً
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="container mx-auto px-4 py-12 space-y-8">
      {groupedProducts.map(({ category, products: categoryProducts }) => (
        <div key={category} className="space-y-4">
          {/* Category Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              {category}
            </h2>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {categoryProducts.length} منتج
            </span>
          </div>

          {/* Products Swiper - Lazy loaded */}
          <ProductsSwiper products={categoryProducts} category={category} />
        </div>
      ))}
    </section>
  )
}
