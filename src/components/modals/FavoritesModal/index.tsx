'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Heart, ShoppingBag, ArrowRight } from 'lucide-react'
import { useLanguage } from '@/providers/LanguageProvider'
import { useFavorites } from '@/hooks/useFavorites'
import { formatCurrency } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'

interface FavoritesModalProps {
    isOpen: boolean
    onClose: () => void
}

export default function FavoritesModal({ isOpen, onClose }: FavoritesModalProps) {
    const { language, t } = useLanguage()
    const { favorites, toggleFavorite } = useFavorites()
    const isRTL = language === 'ar'

    // Lock body scroll when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }
        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [isOpen])

    if (!isOpen) return null

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[60] flex justify-end">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/30 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Modal Panel */}
                    <motion.div
                        initial={{ x: isRTL ? '-100%' : '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: isRTL ? '-100%' : '100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        className={`relative w-full max-w-md h-full bg-white dark:bg-slate-900 shadow-2xl flex flex-col ${isRTL ? 'rounded-r-2xl' : 'rounded-l-2xl'
                            }`}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-pink-100 dark:bg-pink-900/20 flex items-center justify-center text-pink-500">
                                    <Heart className="w-5 h-5 fill-current" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                        {language === 'ar' ? 'المفضلة' : 'Favorites'}
                                    </h2>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        {favorites.length} {language === 'ar' ? 'منتجات' : 'items'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                            >
                                <X className="w-6 h-6 text-slate-500" />
                            </button>
                        </div>

                        {/* List */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-4">
                            {favorites.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center space-y-4 text-slate-400">
                                    <Heart className="w-16 h-16 opacity-20" />
                                    <p className="text-lg font-medium">
                                        {language === 'ar' ? 'لا يوجد مفضلة بعد' : 'No favorites yet'}
                                    </p>
                                    <p className="text-sm max-w-[200px]">
                                        {language === 'ar'
                                            ? 'اضغط على القلب في صفحة المنتج لإضافته هنا'
                                            : 'Tap the heart on any product page to add it here'}
                                    </p>
                                </div>
                            ) : (
                                favorites.map((product) => (
                                    <motion.div
                                        key={product.id}
                                        layoutId={product.id}
                                        className="group relative flex gap-4 p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:border-pink-200 dark:hover:border-pink-800 transition-all shadow-sm hover:shadow-md"
                                    >
                                        {/* Image */}
                                        <Link href={`/products/${product.id}`} onClick={onClose} className="shrink-0 relative w-20 h-20 bg-slate-100 dark:bg-slate-700 rounded-xl overflow-hidden">
                                            {product.image ? (
                                                <Image src={product.image} alt={product.name} fill className="object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-2xl">🍦</div>
                                            )}
                                        </Link>

                                        {/* Info */}
                                        <div className="flex-1 flex flex-col justify-between">
                                            <div>
                                                <Link href={`/products/${product.id}`} onClick={onClose}>
                                                    <h3 className="font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-pink-500 transition-colors">
                                                        {product.name}
                                                    </h3>
                                                </Link>
                                                <p className="text-sm font-bold text-pink-500 mt-1">
                                                    {formatCurrency(product.price)}
                                                </p>
                                            </div>

                                            <div className="flex items-center justify-between mt-2">
                                                <Link
                                                    href={`/products/${product.id}`}
                                                    onClick={onClose}
                                                    className="text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center gap-1"
                                                >
                                                    {language === 'ar' ? 'عرض المنتج' : 'View Product'}
                                                    <ArrowRight className={`w-3 h-3 ${isRTL ? 'rotate-180' : ''}`} />
                                                </Link>

                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault()
                                                        e.stopPropagation()
                                                        toggleFavorite(product)
                                                    }}
                                                    className="p-1.5 bg-red-50 text-red-500 rounded-full hover:bg-red-100 transition-colors"
                                                >
                                                    <Heart className="w-4 h-4 fill-current" />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        {favorites.length > 0 && (
                            <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                                <button onClick={onClose} className="w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold hover:opacity-90 transition-opacity">
                                    {language === 'ar' ? 'متابعة التسوق' : 'Continue Shopping'}
                                </button>
                            </div>
                        )}

                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
