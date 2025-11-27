'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Check, Sparkles } from 'lucide-react'

interface Option {
    id: string
    name_ar: string
    name_en: string
    description_ar?: string
    description_en?: string
    price: number
    image?: string
}

interface CustomizationGroup {
    groupId: string
    groupName: string
    groupDescription?: string
    groupIcon?: string
    isRequired: boolean
    minSelections: number
    maxSelections: number
    options: Option[]
}

interface CustomizationSelectorProps {
    group: CustomizationGroup
    selections: string[]
    onSelectionChange: (selectedIds: string[]) => void
    language?: 'ar' | 'en'
    showFreeLabel?: boolean // Show "مجاناً مع المقاس" for BYO flavors
    compact?: boolean // Compact mode for dessert template
}

export default function CustomizationSelector({
    group,
    selections,
    onSelectionChange,
    language = 'ar',
    showFreeLabel = false,
    compact = false
}: CustomizationSelectorProps) {
    const handleToggle = (optionId: string) => {
        const isSelected = selections.includes(optionId)

        if (isSelected) {
            // Remove selection
            onSelectionChange(selections.filter(id => id !== optionId))
        } else {
            // Add selection (check max limit)
            if (selections.length >= group.maxSelections) {
                // If max reached, replace last selection for single-select, or do nothing for multi-select
                if (group.maxSelections === 1) {
                    onSelectionChange([optionId])
                }
                // For multi-select, we could show a toast/error, but for UX we'll just prevent
                return
            }
            onSelectionChange([...selections, optionId])
        }
    }

    const requirementMet = selections.length >= group.minSelections && selections.length <= group.maxSelections

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
        >
            {/* Group Header */}
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                    {group.groupIcon && (
                        <span className="text-2xl">{group.groupIcon}</span>
                    )}
                    <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            {group.groupName}
                            {group.isRequired && (
                                <span className="text-xs font-normal text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/30 px-2 py-0.5 rounded-full">
                                    إجباري
                                </span>
                            )}
                        </h3>
                        {group.groupDescription && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                {group.groupDescription}
                            </p>
                        )}
                    </div>
                </div>

                {/* Selection Counter */}
                <div className="text-left">
                    <div className={`text-xs font-semibold transition-colors ${requirementMet
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : group.isRequired
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-slate-500 dark:text-slate-400'
                        }`}>
                        {selections.length} / {group.maxSelections}
                    </div>
                    {group.minSelections > 0 && (
                        <div className="text-[10px] text-slate-400 dark:text-slate-500">
                            {group.minSelections === group.maxSelections
                                ? `اختر ${group.minSelections}`
                                : `${group.minSelections}-${group.maxSelections}`
                            }
                        </div>
                    )}
                </div>
            </div>

            {/* Free with size label for BYO */}
            {showFreeLabel && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-3 py-1.5 rounded-lg inline-flex items-center gap-1 w-fit"
                >
                    <span>✨</span>
                    مجاناً مع المقاس
                </motion.div>
            )}

            {/* Options Grid - Enhanced responsive layout */}
            <div className={`grid gap-2 md:gap-3 ${
                compact 
                    ? 'grid-cols-3 md:grid-cols-4' 
                    : 'grid-cols-2 md:grid-cols-3'
            }`}>
                {group.options.map((option) => {
                    const isSelected = selections.includes(option.id)
                    const canSelect = !isSelected && selections.length < group.maxSelections

                    return (
                        <motion.button
                            key={option.id}
                            onClick={() => handleToggle(option.id)}
                            disabled={!canSelect && !isSelected}
                            whileHover={canSelect || isSelected ? { scale: 1.02, y: -2 } : {}}
                            whileTap={{ scale: canSelect || isSelected ? 0.96 : 1 }}
                            animate={isSelected ? {
                                boxShadow: [
                                    '0 4px 20px rgba(236, 72, 153, 0.3)',
                                    '0 6px 25px rgba(236, 72, 153, 0.4)',
                                    '0 4px 20px rgba(236, 72, 153, 0.3)'
                                ]
                            } : {}}
                            transition={{ boxShadow: { repeat: Infinity, duration: 2 } }}
                            className={`
                relative rounded-2xl text-right transition-all duration-200
                ${compact ? 'p-2.5 md:p-2 min-h-[70px] md:min-h-[65px]' : 'p-4 md:p-3.5 min-h-[90px] md:min-h-[85px]'}
                ${isSelected
                                    ? 'bg-gradient-to-br from-pink-500 via-pink-600 to-purple-600 text-white shadow-xl shadow-pink-500/40 border-2 border-pink-400/50'
                                    : canSelect
                                        ? 'bg-white dark:bg-slate-800/70 hover:bg-slate-50 dark:hover:bg-slate-800 border-2 border-slate-200 dark:border-slate-700/70 text-slate-700 dark:text-slate-300 hover:shadow-md hover:border-pink-300 dark:hover:border-pink-700'
                                        : 'bg-slate-50/50 dark:bg-slate-800/20 border-2 border-dashed border-slate-200/50 dark:border-slate-700/30 text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-50'
                                }
              `}
                        >
                            {/* Selection Check */}
                            <AnimatePresence>
                                {isSelected && (
                                    <motion.div
                                        initial={{ scale: 0, rotate: -180 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        exit={{ scale: 0, rotate: 180 }}
                                        className="absolute top-2 left-2 w-5 h-5 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center"
                                    >
                                        <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Sparkle Effect for Free Items */}
                            {option.price === 0 && isSelected && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="absolute top-2 right-2"
                                >
                                    <Sparkles className="w-4 h-4 text-yellow-300 fill-yellow-300" />
                                </motion.div>
                            )}

                            {/* Option Content */}
                            <div className="space-y-1.5">
                                <div className={`text-sm md:text-[13px] font-bold leading-tight ${isSelected ? 'text-white' : 'text-slate-900 dark:text-white'
                                    }`}>
                                    {language === 'ar' ? option.name_ar : option.name_en}
                                </div>

                                {option.description_ar && (
                                    <div className={`text-[10px] leading-tight ${isSelected
                                        ? 'text-white/80'
                                        : 'text-slate-500 dark:text-slate-400'
                                        }`}>
                                        {language === 'ar' ? option.description_ar : option.description_en}
                                    </div>
                                )}

                                {/* Price Tag */}
                                {option.price > 0 ? (
                                    <div className={`text-xs md:text-[11px] font-bold flex items-center gap-1 justify-end mt-auto ${isSelected
                                        ? 'text-white'
                                        : 'text-pink-600 dark:text-pink-400'
                                        }`}>
                                        <span>+{option.price}</span>
                                        <span className="text-[10px]">ج.م</span>
                                    </div>
                                ) : (
                                    <motion.div
                                        animate={{ scale: isSelected ? [1, 1.1, 1] : 1 }}
                                        transition={{ repeat: isSelected ? Infinity : 0, duration: 2 }}
                                        className={`text-[11px] font-semibold inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${isSelected
                                            ? 'bg-yellow-400/20 text-yellow-200'
                                            : 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400'
                                            }`}
                                    >
                                        <span className="text-[10px]">✨</span>
                                        مجاناً
                                    </motion.div>
                                )}
                            </div>
                        </motion.button>
                    )
                })}
            </div>

            {/* Validation Message */}
            <AnimatePresence>
                {group.isRequired && selections.length < group.minSelections && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 px-3 py-2 rounded-lg"
                    >
                        ⚠️ يجب اختيار {group.minSelections} على الأقل من {group.groupName}
                    </motion.div>
                )}
                {selections.length > group.maxSelections && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 px-3 py-2 rounded-lg"
                    >
                        ❌ الحد الأقصى {group.maxSelections} من {group.groupName}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}
