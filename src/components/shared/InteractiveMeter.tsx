'use client'

import { motion } from 'framer-motion'
import { Plus, Minus } from 'lucide-react'
import type { Option } from '@/types/options'

interface InteractiveMeterProps {
    options: Option[]
    selectedIds: string[]
    onSelect: (id: string) => void
    accentColor: string
}

export default function InteractiveMeter({
    options,
    selectedIds,
    onSelect,
    accentColor
}: InteractiveMeterProps) {
    // Determine active index
    const activeIndex = options.findIndex(opt => selectedIds.includes(opt.id))
    const safeIndex = activeIndex === -1 ? 0 : activeIndex

    // Map colors
    const colorClasses: Record<string, string> = {
        pink: 'bg-pink-500 text-pink-500',
        amber: 'bg-amber-500 text-amber-500',
        purple: 'bg-purple-500 text-purple-500',
        cyan: 'bg-cyan-500 text-cyan-500',
        emerald: 'bg-emerald-500 text-emerald-500',
        default: 'bg-slate-500 text-slate-500'
    }
    const theme = colorClasses[accentColor] || colorClasses['default']
    const [bgClass] = theme.split(' ')

    const handleIncrement = () => {
        if (safeIndex < options.length - 1) {
            onSelect(options[safeIndex + 1].id)
        }
    }

    const handleDecrement = () => {
        if (safeIndex > 0) {
            onSelect(options[safeIndex - 1].id)
        }
    }

    return (
        <div className="w-full bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between gap-4">
                {/* Decrement Button */}
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={handleDecrement}
                    disabled={safeIndex === 0}
                    className={`p-2 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-600 disabled:opacity-50 ${safeIndex === 0 ? '' : 'hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                >
                    <Minus size={20} className="text-slate-600 dark:text-slate-400" />
                </motion.button>

                {/* Meter Display */}
                <div className="flex-1 flex flex-col items-center gap-2">
                    {/* Label */}
                    <div className="text-lg font-bold text-slate-800 dark:text-white">
                        {options[safeIndex]?.name_ar}
                    </div>

                    {/* Visual Gauge */}
                    <div className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden relative">
                        {/* Background segments for detail */}
                        <div className="absolute inset-0 flex">
                            {options.map((_, i) => (
                                <div key={i} className="flex-1 border-r border-white/20 dark:border-slate-800/20 last:border-0" />
                            ))}
                        </div>

                        {/* Fill Bar */}
                        <motion.div
                            initial={false}
                            animate={{
                                width: `${((safeIndex + 1) / options.length) * 100}%`
                            }}
                            className={`h-full ${bgClass} relative`}
                        >
                            <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/30" />
                        </motion.div>
                    </div>

                    {/* Step dots */}
                    <div className="flex justify-between w-full px-1">
                        {options.map((opt, i) => (
                            <button
                                key={opt.id}
                                onClick={() => onSelect(opt.id)}
                                className={`w-2 h-2 rounded-full transition-colors ${i <= safeIndex ? bgClass : 'bg-slate-300 dark:bg-slate-600'}`}
                            />
                        ))}
                    </div>
                </div>

                {/* Increment Button */}
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={handleIncrement}
                    disabled={safeIndex === options.length - 1}
                    className={`p-2 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-600 disabled:opacity-50 ${safeIndex === options.length - 1 ? '' : 'hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                >
                    <Plus size={20} className="text-slate-600 dark:text-slate-400" />
                </motion.button>
            </div>
        </div>
    )
}
