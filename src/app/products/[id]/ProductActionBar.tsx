'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { ShoppingBag, Share2, Heart } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { useFavorites } from '@/hooks/useFavorites'

// Revert to simple interface without nav callbacks
interface ProductActionBarProps {
    product: any
    price: number
    onAdd: () => void
    disabled?: boolean
}

export default function ProductActionBar({ product, price, onAdd, disabled }: ProductActionBarProps) {
    const { toggleFavorite, isFavorite } = useFavorites()

    return (
        <motion.div
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            exit={{ y: -100 }}
            // ✅ Positioned below header (top-[72px]), reduced height (h-[64px])
            className="fixed top-[72px] left-0 right-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm h-[64px] flex items-center"
        >
            <div className="container mx-auto px-4 flex items-center justify-between">

                {/* Left: Product Info */}
                <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 shrink-0">
                        {product.image ? (
                            <Image
                                src={product.image}
                                alt={product.name}
                                fill
                                className="object-cover"
                                sizes="40px"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-lg">🍦</div>
                        )}
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                            {product.name}
                        </h3>
                        {/* Price moved here for compact layout */}
                        <p className="text-xs text-pink-500 font-medium">
                            {formatCurrency(price)}
                        </p>
                    </div>
                </div>

                {/* Right: Action Only (Nav is in Main Header) */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={async () => {
                            if (navigator.share) {
                                try {
                                    await navigator.share({
                                        title: 'SOFTCREAM',
                                        text: `Check out ${product.name} on SoftCream!`,
                                        url: window.location.href,
                                    })
                                } catch (error) {
                                    console.log('Error sharing:', error)
                                }
                            } else {
                                // Fallback: Copy to clipboard
                                navigator.clipboard.writeText(window.location.href)
                                alert('Link copied to clipboard!')
                            }
                        }}
                        className="p-2 text-slate-400 hover:text-pink-500 hover:bg-pink-50 dark:hover:bg-slate-800 rounded-full transition-all"
                        aria-label="مشاركة"
                    >
                        <Share2 className="w-5 h-5" />
                    </button>

                    <button
                        onClick={() => toggleFavorite(product)}
                        className={`p-2 rounded-full transition-all group ${isFavorite(product.id) ? 'text-red-500 bg-red-50 dark:bg-red-900/20' : 'text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-slate-800'}`}
                        aria-label="تفضيل"
                    >
                        <Heart className={`w-5 h-5 transition-colors ${isFavorite(product.id) ? 'fill-current' : 'group-hover:fill-current'}`} />
                    </button>

                    <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1" />

                    <button
                        onClick={onAdd}
                        disabled={disabled}
                        className="flex items-center gap-2 bg-gradient-to-r from-[#FF6B9D] to-[#FF5A8E] hover:from-[#FF5A8E] hover:to-[#FF4979] text-white px-6 py-2 rounded-full font-bold text-sm shadow-lg shadow-pink-500/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ShoppingBag className="w-4 h-4 ml-1" />
                        <span>إضافة</span>
                    </button>
                </div>

            </div>
        </motion.div>
    )
}
