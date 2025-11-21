'use client'

import { useMemo } from 'react'
import dynamic from 'next/dynamic'
import { SearchX, IceCream } from 'lucide-react'
import { useProductsData } from '@/providers/ProductsProvider'
import ProductCardSkeleton from '@/components/ui/skeletons/ProductCardSkeleton'

// Lazy load Swiper (heavy library ~50KB)
const ProductsSwiper = dynamic(
  () => import('./ProductsSwiperWrapper'),
  {
    ssr: false,
    loading: () => (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <ProductCardSkeleton key={i} />
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

interface ProductsGridProps {
  isLoading?: boolean
  onClearFilters?: () => void
}

export default function ProductsGrid({ isLoading = false, onClearFilters }: ProductsGridProps) {
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

  // Loading State - Skeleton Categories
  if (isLoading) {
    return (
      <section className="container mx-auto px-4 py-12 space-y-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-4">
            {/* Category Title Skeleton */}
            <div className="flex items-center justify-between">
              <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-32 animate-pulse" />
              <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-16 animate-pulse" />
            </div>

            {/* Products Skeleton Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, j) => (
                <ProductCardSkeleton key={j} />
              ))}
            </div>
          </div>
        ))}
      </section>
    )
  }

  // Empty State - No Results
  if (!products || products.length === 0) {
    return (
      <section className="container mx-auto px-4 py-12">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          {/* Icon */}
          <div className="relative mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-pink-50 to-rose-50 dark:from-slate-800 dark:to-slate-700 rounded-full flex items-center justify-center">
              <SearchX className="w-12 h-12 text-slate-300 dark:text-slate-600" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-gradient-to-br from-pink-100 to-rose-100 dark:from-slate-700 dark:to-slate-600 rounded-full flex items-center justify-center">
              <IceCream className="w-6 h-6 text-slate-400 dark:text-slate-500" />
            </div>
          </div>

          {/* Message */}
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            لم نجد أي منتجات
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md">
            جرب تعديل الفلاتر أو البحث بكلمات مختلفة للعثور على ما تبحث عنه
          </p>

          {/* Clear Filters Button */}
          {onClearFilters && (
            <button
              onClick={onClearFilters}
              className="px-6 py-3 bg-gradient-to-r from-[#FF6B9D] to-[#FF5A8E] hover:from-[#FF5A8E] hover:to-[#FF4979] text-white rounded-xl font-bold transition-all shadow-lg shadow-pink-500/25 hover:shadow-xl hover:shadow-pink-500/30 active:scale-95"
            >
              🗑️ مسح جميع الفلاتر
            </button>
          )}
        </div>
      </section>
    )
  }

  // Products Display
  return (
    <section className="container mx-auto px-4 py-12 space-y-8">
      {groupedProducts.map(({ category, products: categoryProducts }) => (
        <div key={category} className="space-y-4">
          {/* Category Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              {category}
            </h2>
            <span className="text-sm text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
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
