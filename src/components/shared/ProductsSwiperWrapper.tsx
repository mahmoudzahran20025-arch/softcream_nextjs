'use client'

import { memo, useMemo, useState, useEffect } from 'react'
import ProductCard from '@/components/ui/ProductCard'
import type { Product } from '@/lib/api'

interface ProductsSwiperWrapperProps {
  products: Product[]
  category: string
}

/**
 * Unified slide width for all card types
 */
const SLIDE_WIDTH_CLASS = 'flex-shrink-0 w-[170px] sm:w-[180px] md:w-[190px] lg:w-[200px]'

/**
 * Memoized Product Slide
 */
const ProductSlide = memo(function ProductSlide({ product }: { product: Product }) {
  return <ProductCard product={product} />
})

/**
 * ProductsSwiperWrapper - Simple CSS-based horizontal scroll
 * ==========================================================
 * Replaced Swiper with native CSS scroll-snap for stability
 * - No hydration issues
 * - Better performance
 * - Touch-friendly with momentum scrolling
 */
function ProductsSwiperWrapper({ products, category }: ProductsSwiperWrapperProps) {
  const [isMounted, setIsMounted] = useState(false)
  
  useEffect(() => {
    setIsMounted(true)
  }, [])
  
  const stableProducts = useMemo(() => products, [products])

  // Show skeleton while waiting for hydration
  if (!isMounted) {
    return (
      <div className="flex gap-4 overflow-hidden pb-4">
        {[...Array(Math.min(4, stableProducts.length))].map((_, i) => (
          <div 
            key={i} 
            className="flex-shrink-0 w-[170px] sm:w-[180px] md:w-[190px] lg:w-[200px] h-[320px] bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse"
          />
        ))}
      </div>
    )
  }

  return (
    <div 
      className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide"
      style={{
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        WebkitOverflowScrolling: 'touch'
      }}
      aria-label={`Products in ${category} category`}
    >
      {stableProducts.map((product) => (
        <div key={product.id} className={`${SLIDE_WIDTH_CLASS} snap-start`}>
          <ProductSlide product={product} />
        </div>
      ))}
    </div>
  )
}

export default memo(ProductsSwiperWrapper)
