'use client'

import { motion } from 'framer-motion'
import { Sparkles, X, Flame } from 'lucide-react'

interface SelectedOption {
    id: string
    name: string
    price: number
    groupIcon?: string
    nutrition?: {
        calories?: number
    }
}

interface CustomizationSummaryProps {
    selections: SelectedOption[]
    onRemove?: (optionId: string) => void
    customizationTotal: number
}

export default function CustomizationSummary({
    selections,
    onRemove,
    customizationTotal
}: CustomizationSummaryProps) {
    if (selections.length === 0) return null

    return (
        <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="relative overflow-hidden bg-gradient-to-br from-pink-50 via-purple-50/80 to-pink-50 dark:from-pink-950/30 dark:via-purple-950/20 dark:to-pink-950/30 rounded-2xl p-4 md:p-5 border-2 border-pink-200/60 dark:border-pink-800/40 shadow-lg shadow-pink-100/50 dark:shadow-pink-900/20"
        >
            {/* Animated background gradient */}
            <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-pink-100/30 to-transparent dark:via-pink-900/10"
                animate={{
                    x: ['-100%', '100%'],
                }}
                transition={{
                    repeat: Infinity,
                    duration: 3,
                    ease: 'linear',
                }}
            />

            {/* Content */}
            <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <motion.div
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                        >
                            <Sparkles className="w-5 h-5 text-pink-500 fill-pink-500" />
                        </motion.div>
                        <h4 className="text-base md:text-sm font-bold text-slate-900 dark:text-white">
                            اختياراتك المخصصة
                        </h4>
                    </div>
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="text-xs font-semibold text-pink-600 dark:text-pink-400 bg-white/80 dark:bg-slate-800/60 px-3 py-1.5 rounded-full shadow-sm"
                    >
                        {selections.length} اختيار
                    </motion.div>
                </div>

                {/* Selected Items */}
                <div className="space-y-2 mb-4">
                    {selections.map((item, index) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex items-center justify-between bg-white/90 dark:bg-slate-800/70 backdrop-blur-sm rounded-xl p-3 md:p-2.5 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-center gap-2.5 md:gap-2 flex-1 min-w-0">
                                {item.groupIcon && (
                                    <span className="text-xl md:text-lg flex-shrink-0">{item.groupIcon}</span>
                                )}
                                <span className="text-sm md:text-[13px] font-medium text-slate-700 dark:text-slate-300 truncate">
                                    {item.name}
                                </span>
                            </div>

                            <div className="flex items-center gap-2.5 md:gap-2 flex-shrink-0">
                                {item.price > 0 ? (
                                    <span className="text-xs md:text-[11px] font-bold text-pink-600 dark:text-pink-400 whitespace-nowrap">
                                        +{item.price} ج.م
                                    </span>
                                ) : item.nutrition?.calories ? (
                                    <span className="text-xs md:text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                                        <Flame className="w-3 h-3" />
                                        {item.nutrition.calories} سعرة
                                    </span>
                                ) : null}

                                {onRemove && (
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => onRemove(item.id)}
                                        className="w-7 h-7 md:w-6 md:h-6 rounded-full bg-slate-200 dark:bg-slate-700 hover:bg-red-100 dark:hover:bg-red-900/40 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 flex items-center justify-center transition-all"
                                        aria-label="إزالة"
                                    >
                                        <X className="w-4 h-4 md:w-3.5 md:h-3.5" strokeWidth={2.5} />
                                    </motion.button>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Total */}
                {customizationTotal > 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="pt-3 border-t-2 border-pink-200/60 dark:border-pink-800/40 flex items-center justify-between"
                    >
                        <span className="text-sm md:text-[13px] font-semibold text-slate-700 dark:text-slate-300">
                            مجموع الإضافات
                        </span>
                        <motion.span
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="text-lg md:text-base font-bold text-pink-600 dark:text-pink-400"
                        >
                            {customizationTotal} ج.م
                        </motion.span>
                    </motion.div>
                )}
            </div>
        </motion.div>
    )
}
