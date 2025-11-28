'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Check, Flame, Plus } from 'lucide-react'
import Image from 'next/image'

interface NutritionValues {
  calories?: number
  protein?: number
  carbs?: number
  sugar?: number
  fat?: number
  fiber?: number
}

interface Option {
  id: string
  name_ar: string
  name_en?: string
  description_ar?: string
  description_en?: string
  price: number
  image?: string
  nutrition?: NutritionValues
}

interface OptionCardProps {
  option: Option
  isSelected: boolean
  canSelect: boolean
  onToggle: () => void
  selectionOrder?: number // For showing 1, 2, 3...
  size?: 'sm' | 'md' | 'lg'
  accentColor?: 'pink' | 'amber' | 'purple' | 'cyan' | 'emerald'
  showImage?: boolean
  showDescription?: boolean
  showNutrition?: boolean // Show calories instead of "مجاناً"
  language?: 'ar' | 'en'
}

export default function OptionCard({
  option,
  isSelected,
  canSelect,
  onToggle,
  selectionOrder,
  size = 'md',
  accentColor = 'pink',
  showImage = true,
  showDescription = true,
  showNutrition = true,
  language = 'ar'
}: OptionCardProps) {
  const sizeClasses = {
    sm: 'p-2.5 min-h-[70px]',
    md: 'p-3.5 min-h-[90px]',
    lg: 'p-4 min-h-[110px]'
  }

  const colorMap = {
    pink: {
      gradient: 'from-pink-500 via-pink-600 to-purple-600',
      shadow: 'shadow-pink-500/40',
      border: 'border-pink-400/50',
      hoverBorder: 'hover:border-pink-300 dark:hover:border-pink-700',
      price: 'text-pink-600 dark:text-pink-400'
    },
    amber: {
      gradient: 'from-amber-500 via-orange-500 to-amber-600',
      shadow: 'shadow-amber-500/40',
      border: 'border-amber-400/50',
      hoverBorder: 'hover:border-amber-300 dark:hover:border-amber-700',
      price: 'text-amber-600 dark:text-amber-400'
    },
    purple: {
      gradient: 'from-purple-500 via-purple-600 to-indigo-600',
      shadow: 'shadow-purple-500/40',
      border: 'border-purple-400/50',
      hoverBorder: 'hover:border-purple-300 dark:hover:border-purple-700',
      price: 'text-purple-600 dark:text-purple-400'
    },
    cyan: {
      gradient: 'from-cyan-500 via-cyan-600 to-blue-600',
      shadow: 'shadow-cyan-500/40',
      border: 'border-cyan-400/50',
      hoverBorder: 'hover:border-cyan-300 dark:hover:border-cyan-700',
      price: 'text-cyan-600 dark:text-cyan-400'
    },
    emerald: {
      gradient: 'from-emerald-500 via-emerald-600 to-teal-600',
      shadow: 'shadow-emerald-500/40',
      border: 'border-emerald-400/50',
      hoverBorder: 'hover:border-emerald-300 dark:hover:border-emerald-700',
      price: 'text-emerald-600 dark:text-emerald-400'
    }
  }

  const colors = colorMap[accentColor]
  const name = language === 'ar' ? option.name_ar : (option.name_en || option.name_ar)
  const description = language === 'ar' ? option.description_ar : (option.description_en || option.description_ar)

  return (
    <motion.button
      onClick={onToggle}
      disabled={!canSelect && !isSelected}
      whileHover={canSelect || isSelected ? { scale: 1.02, y: -3 } : {}}
      whileTap={{ scale: canSelect || isSelected ? 0.97 : 1 }}
      animate={isSelected ? {
        boxShadow: [
          `0 4px 20px rgba(236, 72, 153, 0.3)`,
          `0 8px 30px rgba(236, 72, 153, 0.4)`,
          `0 4px 20px rgba(236, 72, 153, 0.3)`
        ]
      } : {}}
      transition={{ boxShadow: { repeat: Infinity, duration: 2 } }}
      className={`
        relative rounded-2xl text-right transition-all duration-200 overflow-hidden
        ${sizeClasses[size]}
        ${isSelected
          ? `bg-gradient-to-br ${colors.gradient} text-white shadow-xl ${colors.shadow} border-2 ${colors.border}`
          : canSelect
            ? `bg-white dark:bg-slate-800/80 border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:shadow-lg ${colors.hoverBorder}`
            : 'bg-slate-50/50 dark:bg-slate-800/30 border-2 border-dashed border-slate-200/50 dark:border-slate-700/30 text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-50'
        }
      `}
    >
      {/* Selection Order Badge */}
      <AnimatePresence>
        {isSelected && selectionOrder && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            className="absolute -top-1 -right-1 w-6 h-6 bg-white text-pink-600 rounded-full flex items-center justify-center text-xs font-bold shadow-lg z-10"
          >
            {selectionOrder}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selection Check */}
      <AnimatePresence>
        {isSelected && !selectionOrder && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            className="absolute top-2 left-2 w-6 h-6 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center"
          >
            <Check className="w-4 h-4 text-white" strokeWidth={3} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Icon for unselected */}
      {!isSelected && canSelect && (
        <div className="absolute top-2 left-2 w-5 h-5 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center opacity-50">
          <Plus className="w-3 h-3 text-slate-500" />
        </div>
      )}

      {/* Content */}
      <div className="flex flex-col h-full justify-between">
        {/* Top: Image + Name */}
        <div className="flex items-start gap-2">
          {/* Option Image */}
          {showImage && option.image && (
            <div className={`flex-shrink-0 rounded-xl overflow-hidden ${
              isSelected ? 'ring-2 ring-white/30' : 'ring-1 ring-slate-200 dark:ring-slate-700'
            }`}>
              <Image
                src={option.image}
                alt={name}
                width={40}
                height={40}
                className="w-10 h-10 object-cover"
              />
            </div>
          )}

          <div className="flex-1 min-w-0">
            {/* Name */}
            <h4 className={`text-sm font-bold leading-tight ${
              isSelected ? 'text-white' : 'text-slate-900 dark:text-white'
            }`}>
              {name}
            </h4>

            {/* Description */}
            {showDescription && description && (
              <p className={`text-[10px] leading-tight mt-0.5 line-clamp-2 ${
                isSelected ? 'text-white/70' : 'text-slate-500 dark:text-slate-400'
              }`}>
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Bottom: Price or Nutrition */}
        <div className="flex items-center justify-end mt-2">
          {option.price > 0 ? (
            // Show price if there's additional cost
            <div className={`text-xs font-bold flex items-center gap-1 ${
              isSelected ? 'text-white' : colors.price
            }`}>
              <span>+{option.price}</span>
              <span className="text-[10px] opacity-80">ج.م</span>
            </div>
          ) : showNutrition && option.nutrition?.calories ? (
            // Show calories instead of "مجاناً"
            <div className={`text-[11px] font-medium inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${
              isSelected
                ? 'bg-white/15 text-white/90'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}>
              <Flame className="w-3 h-3" />
              <span>{option.nutrition.calories}</span>
              <span className="text-[9px] opacity-70">سعرة</span>
            </div>
          ) : null}
        </div>
      </div>
    </motion.button>
  )
}
