'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { SimpleCard } from '@/components/ui/cards'
import { getCategoryConfig } from '@/config/categories'

interface Product {
    id: string
    name: string
    price: number
    old_price?: number
    image?: string
    category?: string
    template_id?: string // ✅ Unified System - single source of truth
}

interface RecommendationsSectionProps {
    productId: string
    className?: string
}

/**
 * RecommendationsSection Component
 * =================================
 * Displays recommended products based on template and category similarity
 */
export default function RecommendationsSection({
    productId,
    className = ''
}: RecommendationsSectionProps) {
    const [recommendations, setRecommendations] = useState<Product[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function fetchRecommendations() {
            try {
                setIsLoading(true)
                // Fetch recommendations from API with expand=recommendations
                const response = await fetch(`/api/products/${productId}?expand=recommendations`)
                const data = await response.json()

                if (data.recommendations) {
                    setRecommendations(data.recommendations)
                }
            } catch (error) {
                console.error('Failed to fetch recommendations:', error)
            } finally {
                setIsLoading(false)
            }
        }

        if (productId) {
            fetchRecommendations()
        }
    }, [productId])

    if (isLoading) {
        return (
            <div className={`py-8 ${className}`}>
                <div className="flex items-center justify-center gap-2 text-slate-400">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                        className="w-5 h-5 border-2 border-slate-300 border-t-pink-500 rounded-full"
                    />
                    <span className="text-sm">جاري التحميل...</span>
                </div>
            </div>
        )
    }

    if (recommendations.length === 0) {
        return null
    }

    return (
        <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`space-y-4 ${className}`}
        >
            {/* Section Header */}
            <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-pink-500" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    منتجات مشابهة
                </h3>
                <div className="flex-1 h-px bg-gradient-to-r from-pink-200 to-transparent dark:from-pink-800" />
            </div>

            {/* Recommendations Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {recommendations.map(product => (
                    <SimpleCard
                        key={product.id}
                        product={product}
                        config={getCategoryConfig(product.category)}
                    />
                ))}
            </div>
        </motion.section>
    )
}
