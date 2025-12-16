'use client'

import { Suspense } from 'react'
import ProductsGrid from '@/components/shared/ProductsGrid'
import Footer from '@/components/server/Footer'
import HomePageClient from '@/components/home/HomePageClient'
import ProductsProvider from '@/providers/ProductsProvider'
import { CategoryTrackingProvider } from '@/providers/CategoryTrackingProvider'
import StorytellingHero from '@/components/StorytellingHero'
import ScrollProgressButton from '@/components/ui/ScrollProgressButton'
import type { Product } from '@/lib/api'
import dynamic from 'next/dynamic'

// Lazy load storytelling components to keep initial load fast
const ProductShowcaseGrid = dynamic(() => import('@/components/products-page/ProductShowcaseGrid'), { ssr: true })
const BrandValuesGrid = dynamic(() => import('@/components/products-page/BrandValuesGrid'), { ssr: true })
const NutritionShowcase = dynamic(() => import('@/components/products-page/NutritionShowcase'), { ssr: true })
const BYOShowcase = dynamic(() => import('@/components/products-page/BYOShowcase'), { ssr: true })
const CategoryRail = dynamic(() => import('@/components/home/CategoryRail'), { ssr: false })

interface PageContentProps {
  initialProducts: Product[]
}

export default function HomePageContent({ initialProducts }: PageContentProps) {
  return (
    <ProductsProvider initialProducts={initialProducts}>
      <HomePageClient>
        <Suspense fallback={<div className="h-[70vh] bg-gradient-to-b from-slate-950 via-slate-900 to-black animate-pulse" />}>
          <StorytellingHero />
        </Suspense>
      </HomePageClient>
      <main className="min-h-screen bg-white dark:bg-slate-950">

        {/* Brand Story & Values - Moved from Products Page for better Discovery */}
        <Suspense fallback={<div className="h-96 animate-pulse bg-slate-100 dark:bg-slate-900" />}>
          <div className="space-y-16 py-12">
            <ProductShowcaseGrid />
            <BrandValuesGrid />
            <BYOShowcase />
            <NutritionShowcase />
          </div>
        </Suspense>

        {/* Products Grid */}
        <Suspense fallback={<div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-96 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>}>
          <ProductsGrid />
        </Suspense>

        {/* Footer */}
        <Suspense fallback={<div className="h-64 bg-slate-100 dark:bg-slate-900 animate-pulse" />}>
          <Footer />
        </Suspense>
      </main>

      {/* Scroll Progress Button */}
      <ScrollProgressButton />
    </ProductsProvider>
  )
}
