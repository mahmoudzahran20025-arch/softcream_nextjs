'use client'

import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import type { Option } from '@/types/options'

interface RenderedOption extends Option {
    price?: number
}

interface HeroSelectionRendererProps {
    options: Option[] | RenderedOption[]
    selectedIds: string[]
    onSelect: (id: string) => void
    accentColor: string
}

export default function HeroSelectionRenderer({
    options,
    selectedIds,
    onSelect,
    accentColor
}: HeroSelectionRendererProps) {
    // Map colors to styles
    const colors: Record<string, string> = {
        pink: 'from-pink-500 to-rose-500',
        amber: 'from-amber-500 to-orange-500',
        purple: 'from-purple-500 to-violet-500',
        cyan: 'from-cyan-500 to-blue-500',
        emerald: 'from-emerald-500 to-green-500',
        default: 'from-slate-500 to-slate-700'
    }
    const gradient = colors[accentColor] || colors['default']

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {options.map((opt) => {
                const option = opt as RenderedOption
                const isSelected = selectedIds.includes(option.id)

                return (
                    <motion.button
                        key={option.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{
                            opacity: 1,
                            scale: isSelected ? 1.05 : 1,
                            borderColor: isSelected ? 'var(--accent)' : 'transparent'
                        }}
                        whileHover={{ scale: 1.02, y: -5 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onSelect(option.id)}
                        className={`
                            relative overflow-hidden group
                            flex flex-col items-center justify-center
                            p-6 rounded-3xl
                            bg-white/40 dark:bg-slate-800/40 
                            backdrop-blur-md border border-white/20 dark:border-white/10
                            shadow-xl hover:shadow-2xl transition-all duration-300
                            ${isSelected ? `ring-2 ring-offset-2 ring-${accentColor}-500` : ''}
                        `}
                    >
                        {/* Background Splashes */}
                        <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 bg-gradient-to-br ${gradient} transition-opacity duration-500`} />

                        {/* Hero Image - Circular */}
                        <div className="relative w-24 h-24 mb-4">
                            <div className={`absolute inset-0 rounded-full bg-gradient-to-tr ${gradient} opacity-20 blur-xl group-hover:opacity-40 transition-opacity`} />
                            {option.image ? (
                                <img
                                    src={option.image}
                                    alt={option.name_ar}
                                    className="w-full h-full object-cover rounded-full shadow-lg border-4 border-white dark:border-slate-700"
                                />
                            ) : (
                                <div className="w-full h-full rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-3xl shadow-inner">
                                    🍦
                                </div>
                            )}

                            {/* Selection Check Pop */}
                            {isSelected && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className={`absolute -right-2 -bottom-2 w-8 h-8 rounded-full bg-gradient-to-r ${gradient} flex items-center justify-center text-white shadow-lg`}
                                >
                                    <Check size={16} strokeWidth={3} />
                                </motion.div>
                            )}
                        </div>

                        {/* Text Content */}
                        <div className="text-center relative z-10">
                            <h3 className="font-bold text-slate-800 dark:text-white text-lg mb-1">
                                {option.name_ar}
                            </h3>
                            {(option.price !== undefined || option.base_price > 0) && (
                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold bg-${accentColor}-100 dark:bg-${accentColor}-900/30 text-${accentColor}-600 dark:text-${accentColor}-400`}>
                                    +{option.price ?? option.base_price} ج.م
                                </span>
                            )}
                        </div>
                    </motion.button>
                )
            })}
        </div>
    )
}
