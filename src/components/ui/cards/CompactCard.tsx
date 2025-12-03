'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { ShoppingCart } from 'lucide-react'
import { CategoryConfig } from '@/config/categories'
import PriceDisplay from '@/components/ui/common/PriceDisplay'

interface Product {
    id: string
    name: string
    nameEn?: string
    price: number
    old_price?: number
    discount_percentage?: number
    image?: string
    description?: string
    template_id?: string
    card_badge?: string
    card_badge_color?: string
}

interface CompactCardProps {
    product: Product
    config: CategoryConfig
}

/**
 * CompactCard - Template 1 (Simple)
 * ==================================
 * For products with minimal customization (1-2 options)
 * Features: Quick add to cart, compact layout
 */
export default function CompactCard({ product, config: _config }: CompactCardProps) {
    void _config

    const handleClick = () => {
        window.location.href = `/products/${product.id}`
    }

    const handleQuickAdd = (e: React.MouseEvent) => {
        e.stopPropagation()
        // TODO: Implement quick add to cart
        console.log('Quick add:', product.id)
    }

    return (
        <motion.div
            onClick={handleClick}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.98 }}
            className="relative cursor-pointer group"
        >
            <div className="card p-3 hover:shadow-lg transition-all duration-300 h-full flex flex-col">
                {/* Image Container */}
                <div className="relative w-full aspect-square bg-gradient-to-br from-pink-50 to-rose-50 dark:from-slate-800 dark:to-slate-700 rounded-lg mb-2 overflow-hidden">
                    {product.image ? (
                        <Image
                            src={product.image}
                            alt={product.name}
                            className="object-cover group-hover:scale-110 transition-transform duration-300"
                            fill
                            sizes="(max-width: 768px) 50vw, 33vw"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl">
                            🍦
                        </div>
                    )}

                    {/* Discount Badge */}
                    {product.discount_percentage && product.discount_percentage > 0 && (
                        <motion.div
                            initial={{ scale: 0, rotate: -12 }}
                            animate={{ scale: 1, rotate: -12 }}
                            className="absolute top-1 right-1 bg-red-500 text-white px-2 py-0.5 rounded-full text-[10px] font-bold shadow-lg"
                        >
                            -{product.discount_percentage}%
                        </motion.div>
                    )}

                    {/* Custom Badge */}
                    {product.card_badge && (
                        <div className={`absolute top-1 left-1 ${product.card_badge_color === 'green' ? 'bg-green-500' :
                                product.card_badge_color === 'blue' ? 'bg-blue-500' :
                                    'bg-pink-500'
                            } text-white px-2 py-0.5 rounded-full text-[10px] font-bold`}>
                            {product.card_badge}
                        </div>
                    )}
                </div>

                {/* Product Info */}
                <div className="flex-1 flex flex-col">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1 line-clamp-2">
                        {product.name}
                    </h3>

                    {/* Price */}
                    <div className="mt-auto">
                        <PriceDisplay
                            price={product.price}
                            oldPrice={product.old_price}
                            size="sm"
                        />
                    </div>
                </div>

                {/* Quick Add Button */}
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleQuickAdd}
                    className="mt-2 w-full py-2 bg-gradient-to-r from-[#FF6B9D] to-[#FF5A8E] hover:from-[#FF5A8E] hover:to-[#FF4979] text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 shadow-md"
                >
                    <ShoppingCart size={14} />
                    <span>إضافة سريعة</span>
                </motion.button>
            </div>
        </motion.div>
    )
}
