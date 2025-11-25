import { Suspense } from 'react'
import ProductsGrid from '@/components/pages/ProductsGrid'
import Footer from '@/components/server/Footer'
import PageContentClient from '@/components/pages/PageContentClient'
import ProductsProvider from '@/providers/ProductsProvider'
import StorytellingHero from '@/components/StorytellingHero'

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

interface PageContentProps {
  initialProducts: Product[]
}

export default function PageContent({ initialProducts }: PageContentProps) {
  return (
    <ProductsProvider initialProducts={initialProducts}>
      <PageContentClient>
        <Suspense fallback={<div className="h-[70vh] bg-gradient-to-b from-slate-950 via-slate-900 to-black animate-pulse" />}>
          <StorytellingHero />
        </Suspense>
      </PageContentClient>
      <main className="min-h-screen bg-white dark:bg-slate-950">

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
    </ProductsProvider>
  )
}
