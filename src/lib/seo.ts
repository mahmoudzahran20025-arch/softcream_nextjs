// ================================================================
// SEO Utilities for Product Pages
// ================================================================

import type { Metadata } from 'next'
import { Product } from './api'

export function generateProductMetadata(product: Product, language: 'ar' | 'en' = 'ar'): Metadata {
  const isArabic = language === 'ar'
  const name = isArabic ? product.name : (product.nameEn || product.name)
  const description = product.description || `${name} - آيس كريم طازج من سوفت كريم`
  
  const title = `${name} - سوفت كريم`
  
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: product.image ? [{ url: product.image, width: 1200, height: 630, alt: name }] : [],
      locale: isArabic ? 'ar_EG' : 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: product.image ? [product.image] : [],
    },
  }
}

export function generateProductJsonLd(product: Product) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || product.name,
    image: product.image || '',
    sku: product.id,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'EGP',
      availability: 'https://schema.org/InStock',
    },
  }
}
