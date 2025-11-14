'use client'

import { useMemo } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { FreeMode, Pagination } from 'swiper/modules'
import ProductCard from '@/components/client/ProductCard'

import 'swiper/css'
import 'swiper/css/free-mode'
import 'swiper/css/pagination'

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
  products: Product[]
}

export default function ProductsGrid({ products }: ProductsGridProps) {
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

          {/* Products Swiper */}
          <Swiper
            modules={[FreeMode, Pagination]}
            spaceBetween={16}
            slidesPerView="auto"
            freeMode={{
              enabled: true,
              sticky: false,
              momentum: true,
              momentumRatio: 0.5
            }}
            pagination={{
              clickable: true,
              dynamicBullets: true
            }}
            dir="rtl"
            className="!pb-12"
          >
            {categoryProducts.map(product => (
              <SwiperSlide
                key={product.id}
                className="!w-[160px] md:!w-[200px]"
              >
                <ProductCard product={product} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      ))}
    </section>
  )
}
