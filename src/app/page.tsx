import HomePageContent from '@/components/home/HomePageContent'
import { API_CONFIG } from '@/config/constants'

export const metadata = {
  title: 'Home - Soft Cream',
  description: 'اكتشف مجموعة السوفت كريم الغنية بالطاقة الطبيعية',
}

// ✅ Enable ISR with 60 second revalidation
export const revalidate = 60

// ✅ Simple fetch without AbortController (Node.js 22 compatibility)
async function fetchProducts(): Promise<any[]> {
  const url = `${API_CONFIG.BASE_URL}/products`
  
  try {
    console.log('📡 Fetching products:', url)
    
    // Use globalThis.fetch to ensure we're using the correct fetch
    const response = await globalThis.fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      next: { revalidate: 60 },
    } as RequestInit)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    
    const result = await response.json()
    console.log('✅ Products fetched successfully, count:', Array.isArray(result.data) ? result.data.length : 'N/A')
    return result.data || result || []
    
  } catch (error: any) {
    console.error('❌ Failed to fetch products:', error.message)
    // Return empty array to allow page to render
    return []
  }
}

export default async function HomePage() {
  const products = await fetchProducts()
  return <HomePageContent initialProducts={products} />
}
