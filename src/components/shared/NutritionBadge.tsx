'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Flame, Beef, Wheat, Droplet } from 'lucide-react'
import type { NutritionDisplayConfig } from '@/lib/uiConfig'

// ================================================================
// NutritionBadge Component
// ================================================================
// Displays nutrition information for options in various formats
// Requirements: 3.1, 3.2, 3.3, 3.4, 3.5

/**
 * Nutrition values interface matching the Option type
 */
export interface NutritionValues {
  calories?: number
  protein?: number
  carbs?: number
  fat?: number
  sugar?: number
  fiber?: number
}

/**
 * Props for NutritionBadge component
 */
export interface NutritionBadgeProps {
  /** Nutrition values to display */
  nutrition: NutritionValues
  /** Display format configuration */
  format?: 'compact' | 'detailed' | 'badges'
  /** Which fields to show */
  fields?: ('calories' | 'protein' | 'carbs' | 'fat')[]
  /** Whether to show tooltip on hover */
  showTooltip?: boolean
  /** Size variant */
  size?: 'sm' | 'md'
  /** Language for labels */
  language?: 'ar' | 'en'
  /** Custom class name */
  className?: string
}

// ================================================================
// Helper Functions
// ================================================================

/**
 * Check if nutrition data has any meaningful values
 * Requirements: 3.4 - Hide when all values are zero/missing
 */
export function hasNutritionData(nutrition?: NutritionValues): boolean {
  if (!nutrition) return false
  
  const { calories, protein, carbs, fat } = nutrition
  return Boolean(
    (calories && calories > 0) ||
    (protein && protein > 0) ||
    (carbs && carbs > 0) ||
    (fat && fat > 0)
  )
}



// ================================================================
// Labels and Icons
// ================================================================

const NUTRITION_LABELS = {
  ar: {
    calories: 'سعرة',
    protein: 'بروتين',
    carbs: 'كربوهيدرات',
    fat: 'دهون',
    sugar: 'سكر',
    fiber: 'ألياف'
  },
  en: {
    calories: 'cal',
    protein: 'protein',
    carbs: 'carbs',
    fat: 'fat',
    sugar: 'sugar',
    fiber: 'fiber'
  }
}

const NUTRITION_ICONS = {
  calories: Flame,
  protein: Beef,
  carbs: Wheat,
  fat: Droplet
}

// ================================================================
// Sub-Components
// ================================================================

/**
 * Compact format: "120 cal • 5g protein"
 * Requirements: 3.3
 */
function CompactFormat({
  nutrition,
  fields,
  language,
  size
}: {
  nutrition: NutritionValues
  fields: ('calories' | 'protein' | 'carbs' | 'fat')[]
  language: 'ar' | 'en'
  size: 'sm' | 'md'
}) {
  const labels = NUTRITION_LABELS[language]
  const parts: string[] = []

  fields.forEach(field => {
    const value = nutrition[field]
    if (value && value > 0) {
      if (field === 'calories') {
        parts.push(`${value} ${labels.calories}`)
      } else {
        parts.push(`${value}g ${labels[field]}`)
      }
    }
  })

  if (parts.length === 0) return null

  const textSize = size === 'sm' ? 'text-[10px]' : 'text-xs'

  return (
    <span className={`${textSize} text-slate-500 dark:text-slate-400`}>
      {parts.join(' • ')}
    </span>
  )
}

/**
 * Badges format: Individual badges for each nutrient
 */
function BadgesFormat({
  nutrition,
  fields,
  size
}: {
  nutrition: NutritionValues
  fields: ('calories' | 'protein' | 'carbs' | 'fat')[]
  size: 'sm' | 'md'
}) {
  const iconSize = size === 'sm' ? 10 : 12
  const textSize = size === 'sm' ? 'text-[9px]' : 'text-[10px]'
  const padding = size === 'sm' ? 'px-1.5 py-0.5' : 'px-2 py-1'

  return (
    <div className="flex flex-wrap gap-1">
      {fields.map(field => {
        const value = nutrition[field]
        if (!value || value <= 0) return null

        const Icon = NUTRITION_ICONS[field]
        const unit = field === 'calories' ? '' : 'g'

        return (
          <span
            key={field}
            className={`inline-flex items-center gap-0.5 ${padding} rounded-full bg-slate-100 dark:bg-slate-800 ${textSize} text-slate-600 dark:text-slate-400`}
          >
            <Icon size={iconSize} className="opacity-70" />
            <span>{value}{unit}</span>
          </span>
        )
      })}
    </div>
  )
}

/**
 * Detailed Tooltip Content
 * Requirements: 3.5
 */
function DetailedTooltip({
  nutrition,
  language
}: {
  nutrition: NutritionValues
  language: 'ar' | 'en'
}) {
  const labels = NUTRITION_LABELS[language]
  const allFields: (keyof NutritionValues)[] = ['calories', 'protein', 'carbs', 'fat', 'sugar', 'fiber']

  return (
    <div className="p-2 space-y-1 min-w-[120px]">
      <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 border-b border-slate-200 dark:border-slate-700 pb-1">
        {language === 'ar' ? 'القيم الغذائية' : 'Nutrition Facts'}
      </div>
      {allFields.map(field => {
        const value = nutrition[field]
        if (value === undefined || value === null) return null

        const unit = field === 'calories' ? '' : 'g'
        const label = labels[field as keyof typeof labels] || field

        return (
          <div key={field} className="flex justify-between text-[11px]">
            <span className="text-slate-500 dark:text-slate-400">{label}</span>
            <span className="text-slate-700 dark:text-slate-300 font-medium">
              {value}{unit}
            </span>
          </div>
        )
      })}
    </div>
  )
}

// ================================================================
// Main Component
// ================================================================

/**
 * NutritionBadge - Displays nutrition information for options
 * 
 * Requirements:
 * - 3.1: Display nutrition badges when option has nutrition data
 * - 3.2: Show when ui_config.nutrition.show is true
 * - 3.3: Use compact format (e.g., "120 cal • 5g protein")
 * - 3.4: Hide when nutrition data is zero or missing
 * - 3.5: Show detailed breakdown tooltip on hover
 */
export default function NutritionBadge({
  nutrition,
  format = 'compact',
  fields = ['calories', 'protein'],
  showTooltip = true,
  size = 'sm',
  language = 'ar',
  className = ''
}: NutritionBadgeProps) {
  const [isHovered, setIsHovered] = useState(false)

  // Requirements: 3.4 - Hide when all values are zero/missing
  if (!hasNutritionData(nutrition)) {
    return null
  }

  const renderContent = () => {
    switch (format) {
      case 'badges':
        return (
          <BadgesFormat
            nutrition={nutrition}
            fields={fields}
            size={size}
          />
        )
      case 'detailed':
        return (
          <DetailedTooltip
            nutrition={nutrition}
            language={language}
          />
        )
      case 'compact':
      default:
        return (
          <CompactFormat
            nutrition={nutrition}
            fields={fields}
            language={language}
            size={size}
          />
        )
    }
  }

  // For detailed format, just render directly without tooltip wrapper
  if (format === 'detailed') {
    return (
      <div className={`${className}`}>
        {renderContent()}
      </div>
    )
  }

  return (
    <div
      className={`relative inline-flex ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {renderContent()}

      {/* Tooltip - Requirements: 3.5 */}
      <AnimatePresence>
        {showTooltip && isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50"
          >
            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700">
              <DetailedTooltip nutrition={nutrition} language={language} />
            </div>
            {/* Tooltip arrow */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
              <div className="w-2 h-2 bg-white dark:bg-slate-900 border-r border-b border-slate-200 dark:border-slate-700 transform rotate-45" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ================================================================
// Wrapper Component for UIConfig Integration
// ================================================================

/**
 * NutritionBadgeWrapper - Handles conditional visibility based on UIConfig
 * Requirements: 3.1, 3.2
 */
export interface NutritionBadgeWrapperProps {
  /** Nutrition values from option */
  nutrition?: NutritionValues
  /** Nutrition display config from ui_config */
  config?: NutritionDisplayConfig
  /** Size variant */
  size?: 'sm' | 'md'
  /** Language */
  language?: 'ar' | 'en'
  /** Custom class name */
  className?: string
}

export function NutritionBadgeWrapper({
  nutrition,
  config,
  size = 'sm',
  language = 'ar',
  className = ''
}: NutritionBadgeWrapperProps) {
  // Requirements: 3.2 - Show only when ui_config.nutrition.show is true
  if (!config?.show) {
    return null
  }

  // Requirements: 3.4 - Hide when all nutrition values are zero/missing
  if (!nutrition || !hasNutritionData(nutrition)) {
    return null
  }

  return (
    <NutritionBadge
      nutrition={nutrition}
      format={config.format || 'compact'}
      fields={config.fields || ['calories']}
      showTooltip={true}
      size={size}
      language={language}
      className={className}
    />
  )
}
