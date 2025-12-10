'use client'

/**
 * OptionRenderer - Unified Option Rendering Component
 * ====================================================
 * Renders individual options based on fallback_style from UIConfig
 * 
 * Requirements:
 * - 7.1: Cards style - image, title, description (truncated), price, nutrition
 * - 7.2: Grid style - image, title, price only
 * - 7.3: Pills style - title, price modifier only
 * - 7.4: List style - icon, title, description, price in horizontal layout
 * - 7.5: Checkbox style - checkbox, title, price in compact format
 */

import { motion, AnimatePresence } from 'framer-motion'
import { Check, Plus, Circle } from 'lucide-react'
import Image from 'next/image'
import type { FallbackStyle, UIConfig } from '@/lib/uiConfig'
import { NutritionBadgeWrapper, type NutritionValues } from './NutritionBadge'
import DynamicIcon from '@/components/ui/DynamicIcon'
import { getMaterialColor, isRainbowColor, RAINBOW_GRADIENT, RAINBOW_GRADIENT_135 } from '@/components/modals/ProductModal/templates/shared/materialColors'

// ================================================================
// Types
// ================================================================

export interface OptionData {
  id: string
  name_ar: string
  name_en?: string
  description_ar?: string
  description_en?: string
  base_price?: number
  price?: number
  image?: string
  color?: string
  calories?: number
  protein?: number
  carbs?: number
  fat?: number
  sugar?: number
  fiber?: number
  nutrition?: NutritionValues
}

export interface OptionRendererProps {
  /** Option data to render */
  option: OptionData
  /** Fallback style to use for rendering */
  style: FallbackStyle
  /** UI configuration from group */
  uiConfig: UIConfig
  /** Whether this option is currently selected */
  isSelected: boolean
  /** Whether this option can be selected (not at max) */
  canSelect: boolean
  /** Callback when option is toggled */
  onSelect: () => void
  /** Selection order number (for multi-select) */
  selectionOrder?: number
  /** Language for display */
  language?: 'ar' | 'en'
  /** Accent color for styling */
  accentColor?: 'pink' | 'amber' | 'purple' | 'cyan' | 'emerald'
}

// ================================================================
// Content Boundaries per Style (Design Document)
// ================================================================

/**
 * Content boundaries define what each style shows
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5
 */
export const STYLE_CONTENT_MAP: Record<FallbackStyle, string[]> = {
  cards: ['image', 'title', 'description', 'price', 'nutrition'],
  grid: ['image', 'title', 'price'],
  list: ['icon', 'title', 'description', 'price'],
  pills: ['title', 'price_modifier'],
  checkbox: ['checkbox', 'title', 'price']
}

// ================================================================
// Color Maps
// ================================================================

const ACCENT_COLORS = {
  pink: {
    gradient: 'from-pink-500 via-pink-600 to-purple-600',
    shadow: 'shadow-pink-500/40',
    border: 'border-pink-400/50',
    hoverBorder: 'hover:border-pink-300 dark:hover:border-pink-700',
    price: 'text-pink-600 dark:text-pink-400',
    bg: 'bg-pink-500',
    bgLight: 'bg-pink-50 dark:bg-pink-950/20',
    ring: 'ring-pink-500'
  },
  amber: {
    gradient: 'from-amber-500 via-orange-500 to-amber-600',
    shadow: 'shadow-amber-500/40',
    border: 'border-amber-400/50',
    hoverBorder: 'hover:border-amber-300 dark:hover:border-amber-700',
    price: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-500',
    bgLight: 'bg-amber-50 dark:bg-amber-950/20',
    ring: 'ring-amber-500'
  },
  purple: {
    gradient: 'from-purple-500 via-purple-600 to-indigo-600',
    shadow: 'shadow-purple-500/40',
    border: 'border-purple-400/50',
    hoverBorder: 'hover:border-purple-300 dark:hover:border-purple-700',
    price: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-500',
    bgLight: 'bg-purple-50 dark:bg-purple-950/20',
    ring: 'ring-purple-500'
  },
  cyan: {
    gradient: 'from-cyan-500 via-cyan-600 to-blue-600',
    shadow: 'shadow-cyan-500/40',
    border: 'border-cyan-400/50',
    hoverBorder: 'hover:border-cyan-300 dark:hover:border-cyan-700',
    price: 'text-cyan-600 dark:text-cyan-400',
    bg: 'bg-cyan-500',
    bgLight: 'bg-cyan-50 dark:bg-cyan-950/20',
    ring: 'ring-cyan-500'
  },
  emerald: {
    gradient: 'from-emerald-500 via-emerald-600 to-teal-600',
    shadow: 'shadow-emerald-500/40',
    border: 'border-emerald-400/50',
    hoverBorder: 'hover:border-emerald-300 dark:hover:border-emerald-700',
    price: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-500',
    bgLight: 'bg-emerald-50 dark:bg-emerald-950/20',
    ring: 'ring-emerald-500'
  }
}

// ================================================================
// Helper Functions
// ================================================================

/** Get option name based on language */
function getOptionName(option: OptionData, language: 'ar' | 'en'): string {
  return language === 'ar' ? option.name_ar : (option.name_en || option.name_ar)
}

/** Get option description based on language */
function getOptionDescription(option: OptionData, language: 'ar' | 'en'): string | undefined {
  return language === 'ar' ? option.description_ar : (option.description_en || option.description_ar)
}

/** Get option price (supports both base_price and price fields) */
function getOptionPrice(option: OptionData): number {
  return option.base_price ?? option.price ?? 0
}

/** Get nutrition values from option */
function getNutritionValues(option: OptionData): NutritionValues {
  if (option.nutrition) return option.nutrition
  return {
    calories: option.calories,
    protein: option.protein,
    carbs: option.carbs,
    fat: option.fat,
    sugar: option.sugar,
    fiber: option.fiber
  }
}

/** Truncate text to specified length */
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '...'
}


// ================================================================
// Cards Style Renderer
// ================================================================

/**
 * Cards Style - Full featured card with bordered styling
 * Requirements: 7.1
 * Shows: image (optional), title, description (truncated), price, nutrition (if enabled)
 */
function CardsStyleRenderer({
  option,
  uiConfig,
  isSelected,
  canSelect,
  onSelect,
  selectionOrder,
  language = 'ar',
  accentColor = 'pink'
}: Omit<OptionRendererProps, 'style'>) {
  const colors = ACCENT_COLORS[accentColor]
  const name = getOptionName(option, language)
  const description = getOptionDescription(option, language)
  const price = getOptionPrice(option)
  const nutrition = getNutritionValues(option)
  
  // Material color for visual accent
  const materialColor = option.color || getMaterialColor(name)
  const isRainbow = isRainbowColor(materialColor)
  
  const showImage = uiConfig.show_images !== false
  const showDescription = uiConfig.show_descriptions !== false
  const nutritionConfig = uiConfig.nutrition

  return (
    <motion.button
      onClick={onSelect}
      disabled={!canSelect && !isSelected}
      whileHover={canSelect || isSelected ? { scale: 1.02, y: -2 } : {}}
      whileTap={{ scale: canSelect || isSelected ? 0.98 : 1 }}
      className={`
        relative w-full rounded-2xl text-right transition-all duration-200 overflow-hidden
        p-3.5 min-h-[100px]
        ${isSelected
          ? `bg-gradient-to-br ${colors.gradient} text-white shadow-xl ${colors.shadow} border-2 ${colors.border}`
          : canSelect
            ? `bg-white dark:bg-slate-800/80 border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:shadow-lg ${colors.hoverBorder}`
            : 'bg-slate-50/50 dark:bg-slate-800/30 border-2 border-dashed border-slate-200/50 dark:border-slate-700/30 text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-50'
        }
      `}
    >
      {/* Material Color Accent - Right Border */}
      {materialColor && !isSelected && !isRainbow && (
        <div 
          className="absolute right-0 top-0 bottom-0 w-1 rounded-r-full"
          style={{ backgroundColor: materialColor, opacity: 0.8 }}
        />
      )}
      
      {/* Rainbow gradient for sprinkles */}
      {isRainbow && !isSelected && (
        <div 
          className="absolute right-0 top-0 bottom-0 w-1 rounded-r-full"
          style={{ background: RAINBOW_GRADIENT }}
        />
      )}

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
      <div className="flex flex-col h-full justify-between pr-2">
        {/* Top: Image + Name + Description */}
        <div className="flex items-start gap-2">
          {/* Option Image or Color Circle */}
          {showImage && option.image ? (
            <div className={`flex-shrink-0 rounded-xl overflow-hidden ${
              isSelected ? 'ring-2 ring-white/30' : 'ring-1 ring-slate-200 dark:ring-slate-700'
            }`}>
              <Image
                src={option.image}
                alt={name}
                width={44}
                height={44}
                className="w-11 h-11 object-cover"
              />
            </div>
          ) : materialColor && !isRainbow ? (
            <div 
              className={`flex-shrink-0 w-10 h-10 rounded-xl ${
                isSelected ? 'ring-2 ring-white/30' : 'ring-1 ring-slate-200 dark:ring-slate-700'
              }`}
              style={{ backgroundColor: materialColor }}
            />
          ) : isRainbow ? (
            <div 
              className={`flex-shrink-0 w-10 h-10 rounded-xl ${
                isSelected ? 'ring-2 ring-white/30' : 'ring-1 ring-slate-200 dark:ring-slate-700'
              }`}
              style={{ background: RAINBOW_GRADIENT_135 }}
            />
          ) : null}

          <div className="flex-1 min-w-0">
            {/* Name */}
            <h4 className={`text-sm font-bold leading-tight ${
              isSelected ? 'text-white' : 'text-slate-900 dark:text-white'
            }`}>
              {name}
            </h4>

            {/* Description (truncated) - Requirements: 7.1 */}
            {showDescription && description && (
              <p className={`text-[10px] leading-tight mt-0.5 line-clamp-2 ${
                isSelected ? 'text-white/70' : 'text-slate-500 dark:text-slate-400'
              }`}>
                {truncateText(description, 60)}
              </p>
            )}
          </div>
        </div>

        {/* Bottom: Price + Nutrition */}
        <div className="flex items-center justify-between mt-2">
          {/* Nutrition Badge - Requirements: 7.1 */}
          <NutritionBadgeWrapper
            nutrition={nutrition}
            config={nutritionConfig}
            size="sm"
            language={language}
            className={isSelected ? 'opacity-80' : ''}
          />

          {/* Price */}
          {price > 0 ? (
            <div className={`text-xs font-bold flex items-center gap-1 ${
              isSelected ? 'text-white' : colors.price
            }`}>
              <span>+{price}</span>
              <span className="text-[10px] opacity-80">ج.م</span>
            </div>
          ) : nutrition.calories ? (
            <span className={`text-[10px] font-medium flex items-center gap-1 ${
              isSelected ? 'text-white/70' : 'text-slate-500 dark:text-slate-400'
            }`}>
              <span>🔥</span>
              <span>{nutrition.calories}</span>
              <span className="opacity-70">سعرة</span>
            </span>
          ) : null}
        </div>
      </div>
    </motion.button>
  )
}


// ================================================================
// Grid Style Renderer
// ================================================================

/**
 * Grid Style - Compact grid layout
 * Requirements: 7.2
 * Shows: image, title, price only
 */
function GridStyleRenderer({
  option,
  uiConfig,
  isSelected,
  canSelect,
  onSelect,
  language = 'ar',
  accentColor = 'pink'
}: Omit<OptionRendererProps, 'style'>) {
  const colors = ACCENT_COLORS[accentColor]
  const name = getOptionName(option, language)
  const price = getOptionPrice(option)
  
  const materialColor = option.color || getMaterialColor(name)
  const isRainbow = isRainbowColor(materialColor)
  const showImage = uiConfig.show_images !== false

  return (
    <motion.button
      onClick={onSelect}
      disabled={!canSelect && !isSelected}
      whileHover={canSelect || isSelected ? { scale: 1.03 } : {}}
      whileTap={{ scale: canSelect || isSelected ? 0.97 : 1 }}
      className={`
        relative w-full rounded-xl text-center transition-all duration-200 overflow-hidden
        p-2.5 min-h-[80px]
        ${isSelected
          ? `bg-gradient-to-br ${colors.gradient} text-white shadow-lg ${colors.shadow} border-2 ${colors.border}`
          : canSelect
            ? `bg-white dark:bg-slate-800/80 border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:shadow-md ${colors.hoverBorder}`
            : 'bg-slate-50/50 dark:bg-slate-800/30 border-2 border-dashed border-slate-200/50 dark:border-slate-700/30 text-slate-400 cursor-not-allowed opacity-50'
        }
      `}
    >
      {/* Selection Check */}
      <AnimatePresence>
        {isSelected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="absolute top-1.5 right-1.5 w-5 h-5 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center"
          >
            <Check className="w-3 h-3 text-white" strokeWidth={3} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="flex flex-col items-center gap-2">
        {/* Image */}
        {showImage && option.image ? (
          <div className={`rounded-lg overflow-hidden ${
            isSelected ? 'ring-2 ring-white/30' : 'ring-1 ring-slate-200 dark:ring-slate-700'
          }`}>
            <Image
              src={option.image}
              alt={name}
              width={48}
              height={48}
              className="w-12 h-12 object-cover"
            />
          </div>
        ) : materialColor && !isRainbow ? (
          <div 
            className={`w-10 h-10 rounded-lg ${
              isSelected ? 'ring-2 ring-white/30' : 'ring-1 ring-slate-200 dark:ring-slate-700'
            }`}
            style={{ backgroundColor: materialColor }}
          />
        ) : isRainbow ? (
          <div 
            className={`w-10 h-10 rounded-lg ${
              isSelected ? 'ring-2 ring-white/30' : 'ring-1 ring-slate-200 dark:ring-slate-700'
            }`}
            style={{ background: RAINBOW_GRADIENT_135 }}
          />
        ) : null}

        {/* Title */}
        <h4 className={`text-xs font-bold leading-tight line-clamp-2 ${
          isSelected ? 'text-white' : 'text-slate-900 dark:text-white'
        }`}>
          {name}
        </h4>

        {/* Price */}
        {price > 0 && (
          <span className={`text-[10px] font-bold ${
            isSelected ? 'text-white/90' : colors.price
          }`}>
            +{price} ج.م
          </span>
        )}
      </div>
    </motion.button>
  )
}

// ================================================================
// Pills Style Renderer
// ================================================================

/**
 * Pills Style - Compact pill button styling
 * Requirements: 7.3
 * Shows: title, price modifier only
 */
function PillsStyleRenderer({
  option,
  isSelected,
  canSelect,
  onSelect,
  language = 'ar',
  accentColor = 'pink'
}: Omit<OptionRendererProps, 'style' | 'uiConfig'>) {
  const colors = ACCENT_COLORS[accentColor]
  const name = getOptionName(option, language)
  const price = getOptionPrice(option)

  return (
    <motion.button
      onClick={onSelect}
      disabled={!canSelect && !isSelected}
      whileHover={canSelect || isSelected ? { scale: 1.05 } : {}}
      whileTap={{ scale: canSelect || isSelected ? 0.95 : 1 }}
      className={`
        px-3 py-1.5 rounded-full text-sm font-medium transition-all border-2
        ${isSelected
          ? `${colors.bg} border-transparent text-white shadow-md`
          : canSelect
            ? `bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300`
            : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200/50 dark:border-slate-700/50 text-slate-400 cursor-not-allowed opacity-50'
        }
      `}
    >
      {name}
      {/* Price modifier - Requirements: 7.3 */}
      {price > 0 && (
        <span className={`mr-1 text-xs ${isSelected ? 'opacity-80' : 'opacity-60'}`}>
          +{price}
        </span>
      )}
    </motion.button>
  )
}


// ================================================================
// List Style Renderer
// ================================================================

/**
 * List Style - Horizontal layout with icon
 * Requirements: 7.4
 * Shows: icon, title, description, price in horizontal layout
 */
function ListStyleRenderer({
  option,
  uiConfig,
  isSelected,
  canSelect,
  onSelect,
  language = 'ar',
  accentColor = 'pink'
}: Omit<OptionRendererProps, 'style'>) {
  const colors = ACCENT_COLORS[accentColor]
  const name = getOptionName(option, language)
  const description = getOptionDescription(option, language)
  const price = getOptionPrice(option)
  
  const materialColor = option.color || getMaterialColor(name)
  const iconConfig = uiConfig.icon

  return (
    <motion.button
      onClick={onSelect}
      disabled={!canSelect && !isSelected}
      whileHover={canSelect || isSelected ? { x: 3 } : {}}
      whileTap={{ scale: canSelect || isSelected ? 0.99 : 1 }}
      className={`
        w-full flex items-center justify-between p-3 rounded-xl transition-all border
        ${isSelected
          ? `bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600 shadow-sm`
          : canSelect
            ? `bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-slate-300 hover:bg-slate-50/50`
            : 'bg-slate-50/50 dark:bg-slate-800/30 border-slate-200/50 dark:border-slate-700/30 text-slate-400 cursor-not-allowed opacity-50'
        }
      `}
    >
      <div className="flex items-center gap-3">
        {/* Selection Indicator / Icon - Requirements: 7.4 */}
        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
          isSelected
            ? `${colors.bg} border-transparent`
            : 'border-slate-300 dark:border-slate-600'
        }`}>
          {isSelected ? (
            <Check className="w-3 h-3 text-white" strokeWidth={3} />
          ) : iconConfig ? (
            <DynamicIcon config={iconConfig} size={12} color={accentColor} />
          ) : materialColor ? (
            <div 
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: materialColor }}
            />
          ) : (
            <Circle className="w-2.5 h-2.5 text-slate-400" />
          )}
        </div>

        {/* Title + Description */}
        <div className="flex-1 text-right">
          <span className={`text-sm font-medium ${
            isSelected ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'
          }`}>
            {name}
          </span>
          {/* Description - Requirements: 7.4 */}
          {description && (
            <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
              {truncateText(description, 50)}
            </p>
          )}
        </div>
      </div>

      {/* Price - Requirements: 7.4 */}
      {price > 0 && (
        <span className={`text-xs font-medium ${
          isSelected ? colors.price : 'text-slate-500'
        }`}>
          +{price} ج.م
        </span>
      )}
    </motion.button>
  )
}

// ================================================================
// Checkbox Style Renderer
// ================================================================

/**
 * Checkbox Style - Compact format for multi-select groups
 * Requirements: 7.5
 * Shows: checkbox, title, price in compact format
 */
function CheckboxStyleRenderer({
  option,
  isSelected,
  canSelect,
  onSelect,
  language = 'ar',
  accentColor = 'pink',
  isRadio = false
}: Omit<OptionRendererProps, 'style' | 'uiConfig'> & { isRadio?: boolean }) {
  const colors = ACCENT_COLORS[accentColor]
  const name = getOptionName(option, language)
  const price = getOptionPrice(option)

  return (
    <label
      className={`
        flex items-center gap-3 cursor-pointer p-2 rounded-lg transition-colors
        ${canSelect || isSelected
          ? 'hover:bg-slate-50 dark:hover:bg-slate-800'
          : 'opacity-50 cursor-not-allowed'
        }
      `}
    >
      <input
        type={isRadio ? 'radio' : 'checkbox'}
        checked={isSelected}
        onChange={onSelect}
        disabled={!canSelect && !isSelected}
        className="sr-only"
      />
      
      {/* Checkbox/Radio Visual - Requirements: 7.5 */}
      <div className={`w-5 h-5 ${isRadio ? 'rounded-full' : 'rounded'} border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
        isSelected
          ? `${colors.bg} border-transparent`
          : 'border-slate-300 dark:border-slate-600'
      }`}>
        {isSelected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
          >
            <Check className="w-3 h-3 text-white" strokeWidth={3} />
          </motion.div>
        )}
      </div>
      
      {/* Title - Requirements: 7.5 */}
      <span className={`text-sm flex-1 ${
        isSelected ? 'text-slate-900 dark:text-white font-medium' : 'text-slate-700 dark:text-slate-300'
      }`}>
        {name}
      </span>
      
      {/* Price - Requirements: 7.5 */}
      {price > 0 && (
        <span className={`text-xs ${
          isSelected ? colors.price : 'text-slate-500'
        }`}>
          +{price} ج.م
        </span>
      )}
    </label>
  )
}


// ================================================================
// Main OptionRenderer Component
// ================================================================

/**
 * OptionRenderer - Unified Option Rendering Component
 * 
 * Renders individual options based on fallback_style from UIConfig.
 * Each style has defined content boundaries per Requirements 7.1-7.5.
 * 
 * @example
 * ```tsx
 * <OptionRenderer
 *   option={option}
 *   style="cards"
 *   uiConfig={uiConfig}
 *   isSelected={isSelected}
 *   canSelect={canSelect}
 *   onSelect={() => handleSelect(option.id)}
 * />
 * ```
 */
export default function OptionRenderer({
  option,
  style,
  uiConfig,
  isSelected,
  canSelect,
  onSelect,
  selectionOrder,
  language = 'ar',
  accentColor = 'pink'
}: OptionRendererProps) {
  // Common props for all renderers
  const commonProps = {
    option,
    uiConfig,
    isSelected,
    canSelect,
    onSelect,
    selectionOrder,
    language,
    accentColor
  }

  // Render based on style - Requirements: 7.1, 7.2, 7.3, 7.4, 7.5
  switch (style) {
    case 'cards':
      return <CardsStyleRenderer {...commonProps} />
    
    case 'grid':
      return <GridStyleRenderer {...commonProps} />
    
    case 'pills':
      return <PillsStyleRenderer {...commonProps} />
    
    case 'list':
      return <ListStyleRenderer {...commonProps} />
    
    case 'checkbox':
      return <CheckboxStyleRenderer {...commonProps} />
    
    default:
      // Default to cards style
      return <CardsStyleRenderer {...commonProps} />
  }
}

// ================================================================
// Exports
// ================================================================

export {
  CardsStyleRenderer,
  GridStyleRenderer,
  PillsStyleRenderer,
  ListStyleRenderer,
  CheckboxStyleRenderer,
  getOptionName,
  getOptionDescription,
  getOptionPrice,
  getNutritionValues,
  truncateText,
  ACCENT_COLORS
}
