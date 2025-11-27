'use client'

import { motion } from 'framer-motion'
import { ContainerType } from '@/lib/api'

interface ContainerSelectorProps {
  containers: ContainerType[]
  selectedContainer: string | null
  onSelect: (containerId: string) => void
}

export default function ContainerSelector({
  containers,
  selectedContainer,
  onSelect
}: ContainerSelectorProps) {
  if (!containers || containers.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <span className="text-xl">📦</span>
        <h4 className="font-bold text-slate-900 dark:text-white">اختر الحاوية</h4>
      </div>

      {/* Container Options */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {containers.map((container) => {
          const isSelected = selectedContainer === container.id
          const hasNutrition = container.nutrition.calories > 0

          return (
            <motion.button
              key={container.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect(container.id)}
              className={`
                relative p-4 rounded-2xl border-2 transition-all duration-200
                ${isSelected
                  ? 'border-pink-500 bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-950/30 dark:to-rose-950/30 shadow-lg shadow-pink-200/50 dark:shadow-pink-900/30'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-pink-300 dark:hover:border-pink-700'
                }
              `}
            >
              {/* Selected Indicator */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center shadow-lg"
                >
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </motion.div>
              )}

              {/* Icon */}
              <div className="text-3xl mb-2">
                {container.id === 'cup' && '🥤'}
                {container.id === 'cone' && '🍦'}
                {container.id === 'choco_cone' && '🍫'}
                {!['cup', 'cone', 'choco_cone'].includes(container.id) && '📦'}
              </div>

              {/* Name */}
              <div className="font-bold text-slate-900 dark:text-white text-sm">
                {container.name}
              </div>

              {/* Price Modifier */}
              {container.priceModifier !== 0 && (
                <div className={`text-xs mt-1 font-medium ${
                  container.priceModifier > 0 
                    ? 'text-orange-600 dark:text-orange-400' 
                    : 'text-green-600 dark:text-green-400'
                }`}>
                  {container.priceModifier > 0 ? '+' : ''}{container.priceModifier} ر.س
                </div>
              )}

              {/* Nutrition Badge */}
              {hasNutrition && (
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                  {container.nutrition.calories} سعرة
                </div>
              )}

              {/* Max Sizes Info */}
              <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                {container.maxSizes === 1 ? 'مقاس واحد' : `${container.maxSizes} مقاسات`}
              </div>
            </motion.button>
          )
        })}
      </div>
    </motion.div>
  )
}
