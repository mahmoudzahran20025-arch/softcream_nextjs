'use client'

import dynamic from 'next/dynamic'
import { useModalStore } from '@/stores/modalStore'
import ProductsHero from './ProductsHero'
import Header from '@/components/ui/Header'
import FilterBar from '@/components/home/FilterBar'
import ProductsGrid from '@/components/shared/ProductsGrid'
import Footer from '@/components/server/Footer'
import ModalOrchestrator from '@/components/modals/ModalOrchestrator'
import ProductsProvider from '@/providers/ProductsProvider'
import { CategoryTrackingProvider } from '@/providers/CategoryTrackingProvider'

// Lazy load components
const ToastContainer = dynamic(() => import('@/components/ui/ToastContainer'), { ssr: false })
const OrdersBadge = dynamic(() => import('@/components/ui/OrdersBadge'), { ssr: false })
const ScrollProgressButton = dynamic(() => import('@/components/ui/ScrollProgressButton'), { ssr: false })

interface ProductsPageContentProps {
    allProducts?: any[]
}

export default function ProductsPageContent({ allProducts = [] }: ProductsPageContentProps) {
    const { open } = useModalStore()

    return (
        <ProductsProvider initialProducts={allProducts}>
            <CategoryTrackingProvider>
                <div className="min-h-screen bg-warm-50 dark:bg-slate-950">
                    {/* Header - Fixed */}
                    <div className="fixed top-0 left-0 right-0 z-50">
                        <Header
                            onOpenCart={() => open('cart')}
                            onOpenSidebar={() => open('sidebar')}
                        />
                    </div>

                    {/* Spacer for fixed header */}
                    <div className="h-[72px]" />

                    {/* Hero Section */}
                    <ProductsHero />

                    {/* Section Divider - Simple */}
                    <div className="py-8 bg-gradient-to-b from-white to-pink-50/30 dark:from-slate-950 dark:to-slate-900">
                        <div className="container mx-auto px-4 text-center">
                            <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-2">
                                تصفح منتجاتنا
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                اختر من مجموعتنا المتنوعة
                            </p>
                            <div className="mt-4 flex items-center justify-center gap-2">
                                <div className="h-px w-12 bg-gradient-to-r from-transparent to-pink-300 dark:to-pink-700" />
                                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-[#FF6B9D] to-[#FF5A8E]" />
                                <div className="h-px w-12 bg-gradient-to-l from-transparent to-pink-300 dark:to-pink-700" />
                            </div>
                        </div>
                    </div>

                    {/* Filter Bar - Sticky */}
                    <div className="sticky top-[72px] z-40">
                        <FilterBar />
                    </div>

                    {/* Products Grid */}
                    <section className="container mx-auto px-4 py-8">
                        <ProductsGrid />
                    </section>

                    {/* Footer */}
                    <Footer />

                    {/* Modals - Using centralized orchestrator */}
                    <ModalOrchestrator allProducts={allProducts} />

                    {/* UI Components */}
                    <ToastContainer />
                    <OrdersBadge onClick={() => open('myOrders')} />
                    <ScrollProgressButton />
                </div>
            </CategoryTrackingProvider>
        </ProductsProvider>
    )
}
