import { Metadata } from 'next'
import { getProducts } from '@/lib/api'
import ProductsPageContent from '@/components/products-page/ProductsPageContent'

export const metadata: Metadata = {
    title: 'منتجاتنا - Soft Cream | آيس كريم صحي طبيعي',
    description: 'اكتشف مجموعة منتجاتنا من الآيس كريم الصحي بمكونات طبيعية 100%، سكريات أقل بنسبة 40%، وقيم غذائية متوازنة. صمم منتجك الخاص الآن!',
    keywords: 'آيس كريم صحي, سوفت كريم, قيم غذائية, منتجات طبيعية, Build Your Own',
    openGraph: {
        title: 'منتجاتنا - Soft Cream',
        description: 'آيس كريم صحي بمكونات طبيعية 100%',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'منتجاتنا - Soft Cream',
        description: 'آيس كريم صحي بمكونات طبيعية 100%',
    }
}

export default async function ProductsPage() {
    // Fetch products server-side
    const allProducts = await getProducts()
    
    // ProductsProvider & CategoryTrackingProvider are now inside ProductsPageContent (Client Component)
    return <ProductsPageContent allProducts={allProducts} />
}

export const revalidate = 3600 // Revalidate every hour
