'use client'

import { useMemo, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { SearchX, IceCream } from 'lucide-react'
import { useProductsData } from '@/providers/ProductsProvider'
import { useCategoryTracking } from '@/providers/CategoryTrackingProvider'
import ProductCardSkeleton from '@/components/ui/skeletons/ProductCardSkeleton'

// Lazy load Swiper (heavy library ~50KB)
const ProductsSwiper = dynamic(
  () => import('@/components/shared/ProductsSwiperWrapper'),
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
  const { setActiveCategory, isUserInteracting } = useCategoryTracking()
  const observerRef = useRef<IntersectionObserver | null>(null)
  const hasScrolledRef = useRef(false) // Track if user has scrolled past hero
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

    // ✅ Dynamic ordering: Sort by product count (most products first)
    // This matches the FilterBar ordering automatically
    return Object.entries(groups)
      .sort(([, a], [, b]) => b.length - a.length)
      .map(([category, items]) => ({
        category,
        products: items
      }))
  }, [products])

  // ✅ Track scroll position to prevent premature activation
  useEffect(() => {
    const handleScroll = () => {
      // ✅ INCREASED threshold: Mark as scrolled once user passes hero section (500px)
      // This prevents activation when user is still viewing hero
      if (window.scrollY > 500) {
        hasScrolledRef.current = true
      }
    }
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // ✅ Smart IntersectionObserver for auto-highlighting
  useEffect(() => {
    if (isUserInteracting) return // Respect interaction lock
    
    // Clean up previous observer
    if (observerRef.current) {
      observerRef.current.disconnect()
    }
    
    // Create new observer with multiple thresholds
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (isUserInteracting) return // Double-check during callback
        
        // ✅ CRITICAL FIX: Only activate after user scrolls past hero section
        if (!hasScrolledRef.current) {
          return // Wait until user scrolls down
        }
        
        // ✅ IMPROVED LOGIC: Find the section that's most prominently in view
        // Filter entries that are actually visible (intersecting)
        const visibleEntries = entries.filter(entry => entry.isIntersecting && entry.intersectionRatio > 0)
        
        if (visibleEntries.length === 0) return
        
        // ✅ Smart selection: Prioritize sections that are crossing the threshold line
        // The threshold line is at the top of the viewport (after sticky header)
        const sortedEntries = visibleEntries.sort((a, b) => {
          const aRect = a.target.getBoundingClientRect()
          const bRect = b.target.getBoundingClientRect()
          
          // Calculate distance from threshold line (top of viewport + header offset)
          const thresholdLine = 180 // Header (72px) + Category Tabs (60px) + padding
          const aDistance = Math.abs(aRect.top - thresholdLine)
          const bDistance = Math.abs(bRect.top - thresholdLine)
          
          // Prefer the section closest to the threshold line
          return aDistance - bDistance
        })
        
        const bestMatch = sortedEntries[0]
        
        // ✅ STRICTER: Only update if section is significantly visible (>25%)
        if (bestMatch && bestMatch.intersectionRatio > 0.25) {
          const category = bestMatch.target.getAttribute('data-category')
          if (category) {
            setActiveCategory(category)
          }
        }
      },
      {
        // ✅ REDUCED thresholds to prevent flickering
        threshold: [0, 0.25, 0.5, 0.75],
        // ✅ INCREASED top margin to prevent premature activation
        // Header (72px) + Category Tabs (60px) + buffer (60px) = ~192px
        rootMargin: '-192px 0px -40% 0px'
      }
    )
    
    // Observe all category sections
    const sections = document.querySelectorAll('[data-category]')
    sections.forEach(section => {
      if (observerRef.current) {
        observerRef.current.observe(section)
      }
    })
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [isUserInteracting, setActiveCategory, groupedProducts.length])

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
        <section
          key={category}
          id={`category-${category}`}        // ✅ For scrollToCategory
          data-category={category}           // ✅ For IntersectionObserver
          className="space-y-4"
        >
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
        </section>
      ))}
    </section>
  )
}
