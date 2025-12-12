import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getProducts, getProductForSEO } from '@/lib/api'
import { generateProductMetadata, generateProductJsonLd } from '@/lib/seo'
import ProductPageClient from '@/app/products/[id]/ProductPageClient'
import RichProductPage from '@/app/products/[id]/RichProductPage'

export const runtime = 'edge';


interface Props {
  params: Promise<{ id: string }>
  searchParams: Promise<{ lang?: 'ar' | 'en'; view?: 'modal' | 'full' }>
}



export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { id } = await params
  const { lang } = await searchParams

  try {
    const product = await getProductForSEO(id)
    if (!product) return { title: 'المنتج غير موجود' }
    return generateProductMetadata(product, lang || 'ar')
  } catch (error) {
    return { title: 'خطأ' }
  }
}

export default async function ProductPage({ params, searchParams }: Props) {
  const { id } = await params
  const { lang, view } = await searchParams

  try {
    const product = await getProductForSEO(id)
    if (!product) notFound()

    const allProducts = await getProducts()
    const jsonLd = generateProductJsonLd(product)

    // Determine which view to show
    // Default: Rich Product Page (full page with grid)
    // Modal view: For backward compatibility (when opened from home page modal)
    const useRichView = view !== 'modal'

    return (
      <>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        {useRichView ? (
          <RichProductPage product={product} allProducts={allProducts} language={lang || 'ar'} />
        ) : (
          <ProductPageClient product={product} allProducts={allProducts} language={lang || 'ar'} />
        )}
      </>
    )
  } catch (error) {
    notFound()
  }
}

export const revalidate = 3600
