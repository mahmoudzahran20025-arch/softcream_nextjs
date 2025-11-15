import { Suspense } from 'react'
import PageContent from '@/components/client/PageContent'
import { getProducts } from '@/lib/api'

export const metadata = {
  title: 'Home - Soft Cream',
  description: 'اكتشف مجموعة السوفت كريم الغنية بالطاقة الطبيعية',
}

export const revalidate = 60 // ISR: revalidate every 60 seconds

// ✅ Separate data fetching component for better error handling and loading states
async function ProductsData() {
  try {
    // Add timeout to prevent hanging requests
    const products = await Promise.race([
      getProducts(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      )
    ]) as any[]

    return <PageContent initialProducts={products || []} />
  } catch (error) {
    console.error('Failed to fetch products:', error)
    // Return empty state instead of crashing
    return <PageContent initialProducts={[]} />
  }
}

export default async function HomePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    }>
      <ProductsData />
    </Suspense>
  )
}
