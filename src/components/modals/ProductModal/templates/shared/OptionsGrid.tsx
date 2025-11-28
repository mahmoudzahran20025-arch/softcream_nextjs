'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle } from 'lucide-react'
import OptionCard from './OptionCard'

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

interface OptionsGridProps {
  group: CustomizationGroup
  selections: string[]
  onSelectionChange: (ids: string[]) => void
  columns?: 2 | 3 | 4
  cardSize?: 'sm' | 'md' | 'lg'
  accentColor?: 'pink' | 'amber' | 'purple' | 'cyan' | 'emerald'
  showSelectionOrder?: boolean
  showImages?: boolean
  showDescriptions?: boolean
  showNutrition?: boolean
  language?: 'ar' | 'en'
}

export default function OptionsGrid({
  group,
  selections,
  onSelectionChange,
  columns = 2,
  cardSize = 'md',
  accentColor = 'pink',
  showSelectionOrder = false,
  showImages = true,
  showDescriptions = true,
  showNutrition = true,
  language = 'ar'
}: OptionsGridProps) {
  const handleToggle = (optionId: string) => {
    const isSelected = selections.includes(optionId)
    
    if (isSelected) {
      onSelectionChange(selections.filter(id => id !== optionId))
    } else if (selections.length < group.maxSelections) {
      onSelectionChange([...selections, optionId])
    } else if (group.maxSelections === 1) {
      onSelectionChange([optionId])
    }
  }

  const requirementMet = selections.length >= group.minSelections
  const hasSelections = selections.length > 0

  const gridClasses = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
  }

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
            <span className="text-xl">{group.groupIcon}</span>
          )}
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              {group.groupName}
              {group.isRequired && (
                <motion.span 
                  animate={!requirementMet ? { scale: [1, 1.05, 1] } : {}}
                  transition={{ repeat: !requirementMet ? Infinity : 0, duration: 1.5 }}
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    requirementMet
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400'
                      : 'bg-pink-50 dark:bg-pink-950/30 text-pink-600 dark:text-pink-400'
                  }`}
                >
                  {requirementMet ? '✓' : 'إجباري'}
                </motion.span>
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
        <motion.div 
          animate={hasSelections ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 0.3 }}
          className={`text-xs font-bold px-2.5 py-1 rounded-full ${
            requirementMet
              ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
              : hasSelections
                ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
          }`}
        >
          {selections.length} / {group.maxSelections}
        </motion.div>
      </div>

      {/* Options Grid */}
      <div className={`grid gap-3 ${gridClasses[columns]}`}>
        {group.options.map((option, index) => {
          const isSelected = selections.includes(option.id)
          const canSelect = !isSelected && selections.length < group.maxSelections
          const selectionOrder = showSelectionOrder ? selections.indexOf(option.id) + 1 : undefined

          return (
            <motion.div
              key={option.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.03 }}
            >
              <OptionCard
                option={option}
                isSelected={isSelected}
                canSelect={canSelect}
                onToggle={() => handleToggle(option.id)}
                selectionOrder={selectionOrder && selectionOrder > 0 ? selectionOrder : undefined}
                size={cardSize}
                accentColor={accentColor}
                showImage={showImages}
                showDescription={showDescriptions}
                showNutrition={showNutrition}
                language={language}
              />
            </motion.div>
          )
        })}
      </div>

      {/* Validation Message */}
      <AnimatePresence>
        {group.isRequired && !requirementMet && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 px-3 py-2.5 rounded-xl border border-amber-200 dark:border-amber-800/50"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="text-xs">
              يجب اختيار {group.minSelections} على الأقل من {group.groupName}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
