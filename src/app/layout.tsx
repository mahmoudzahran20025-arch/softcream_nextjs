import type { Metadata } from 'next'
import { Cairo } from 'next/font/google'
import './globals.css'
import Providers from '@/providers/Providers'

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  variable: '--font-cairo',
  weight: ['400', '500', '600', '700', '800'],
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: 'Soft Cream - Smart Nutrition & Energy',
  description: 'طاقة نقية، طعم غني، تغذية ذكية',
  keywords: ['soft cream', 'energy', 'nutrition', 'سوفت كريم', 'طاقة'],
  authors: [{ name: 'Soft Cream Team' }],
  openGraph: {
    title: 'Soft Cream - الطاقة تبدأ هنا',
    description: 'اكتشف مجموعة السوفت كريم الغنية بالطاقة الطبيعية',
    type: 'website',
    locale: 'ar_EG',
    alternateLocale: ['en_US'],
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Soft Cream',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Soft Cream - Smart Nutrition & Energy',
    description: 'طاقة نقية، طعم غني، تغذية ذكية',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl" className={cairo.variable}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="font-cairo bg-white dark:bg-slate-950 text-slate-900 dark:text-white transition-colors">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}

// Force rebuild
