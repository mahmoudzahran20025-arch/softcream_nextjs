'use client'

import { useRef } from 'react'
import { motion } from 'framer-motion'
import { useProductsData } from '@/providers/ProductsProvider'

// Manual category icons mapping since we don't have them in the data yet
const CATEGORY_ICONS: Record<string, string> = {
    'بوكسات العائلة': '🎁',
    'آيس كريم': '🍦',
    'ميلك شيك': '🥤',
    'مشروبات': '☕',
    'أخرى': '✨'
}

export default function CategoryRail() {
    const { filteredProducts } = useProductsData()
    const scrollContainerRef = useRef<HTMLDivElement>(null)

    // Extract unique categories
    const categories = Array.from(new Set(filteredProducts.map((p: any) => p.category || 'أخرى')))

    // Sort: 'بوكسات العائلة' first, then others
    categories.sort((a, b) => {
        // @ts-ignore
        if (a.includes('بوكسات')) return -1
        // @ts-ignore
        if (b.includes('بوكسات')) return 1
        return 0
    })

    // Smooth scroll to category section
    const scrollToCategory = (category: string) => {
        const element = document.getElementById(`category-${category}`)
        if (element) {
            // Find the header height to offset scrolldown
            const headerOffset = 180
            const elementPosition = element.getBoundingClientRect().top
            const offsetPosition = elementPosition + window.scrollY - headerOffset

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            })
        }
    }

    if (categories.length === 0) return null

    return (
        <div className="w-full relative group">
            <div
                ref={scrollContainerRef}
                className="flex items-center gap-3 overflow-x-auto pb-4 pt-2 px-4 scrollbar-hide snap-x"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {categories.map((category: unknown, index: number) => (
                    <motion.button
                        key={category as string}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => scrollToCategory(category as string)}
                        className={`
              flex items-center gap-2 px-5 py-3 rounded-full snap-start shrink-0 transition-all
              bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm
              hover:shadow-md hover:border-pink-200 dark:hover:border-slate-600 hover:scale-105
              active:scale-95 text-slate-700 dark:text-slate-200
            `}
                    >
                        <span className="text-xl">{CATEGORY_ICONS[category as string] || '✨'}</span>
                        <span className="font-bold whitespace-nowrap">{category as string}</span>
                    </motion.button>
                ))}
            </div>

            {/* Gradient Fade for scroll indication */}
            <div className="absolute left-0 top-0 bottom-4 w-12 bg-gradient-to-r from-white dark:from-slate-950 to-transparent pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-4 w-12 bg-gradient-to-l from-white dark:from-slate-950 to-transparent pointer-events-none" />
        </div>
    )
}
