'use client'

/**
 * DisplayModeRenderer - Display Mode Rendering System
 * ====================================================
 * Renders option groups based on display_mode from UIConfig
 * 
 * Requirements:
 * - 4.2: Default mode - standard grid/cards layout
 * - 4.3: Hero Flavor mode - large circular images prominently displayed
 * - 4.4: Smart Meter mode - gauge/slider interface for quantity selection
 * - 4.5: Brand Accent mode - brand colors and styling applied to cards
 * - 5.2: Fallback to fallback_style when mode cannot render
 */

import { motion } from 'framer-motion'
import { Check, Sparkles } from 'lucide-react'
import Image from 'next/image'
import type { DisplayMode, FallbackStyle, UIConfig } from '@/lib/uiConfig'
import { calculateLayout } from '@/lib/layoutCalculator'
import OptionRenderer, { type OptionData, ACCENT_COLORS } from './OptionRenderer'
import { NutritionBadgeWrapper, type NutritionValues } from './NutritionBadge'
import { getMaterialColor, isRainbowColor, RAINBOW_GRADIENT_135 } from '@/components/modals/ProductModal/templates/shared/materialColors'

// ================================================================
// Types
// ================================================================

export interface DisplayModeRendererProps {
  /** Options to render */
  options: OptionData[]
  /** UI configuration from group */
  uiConfig: UIConfig
  /** Currently selected option IDs */
  selectedIds: string[]
  /** Maximum number of selections allowed */
  maxSelections: number
  /** Callback when selection changes */
  onSelectionChange: (ids: string[]) => void
  /** Language for display */
  language?: 'ar' | 'en'
  /** Accent color for styling */
  accentColor?: 'pink' | 'amber' | 'purple' | 'cyan' | 'emerald'
}

// ================================================================
// Mode Capability Check - Requirements: 5.2
// ================================================================

/**
 * Check if a display mode can render with the given options
 * Requirements: 5.2 - Fall back when mode cannot render
 * 
 * @param mode - Display mode to check
 * @param options - Options to render
 * @returns Whether the mode can render
 */
export function canRenderMode(mode: DisplayMode, options: OptionData[]): boolean {
  switch (mode) {
    case 'hero_flavor':
      // Hero flavor needs at least one option with an image
      return options.some(o => o.image)
    
    case 'smart_meter':
      // Smart meter needs at least 2 options for the gauge
      return options.length >= 2
    
    case 'brand_accent':
      // Brand accent can always render
      return true
    
    case 'default':
    default:
      // Default can always render
      return true
  }
}

/**
 * Get the effective display mode, falling back if needed
 * Requirements: 5.2
 */
export function getEffectiveMode(
  mode: DisplayMode,
  _fallbackStyle: FallbackStyle,
  options: OptionData[]
): { mode: DisplayMode; useFallback: boolean } {
  if (canRenderMode(mode, options)) {
    return { mode, useFallback: false }
  }
  // Fall back to 'default' mode which uses fallback_style from uiConfig
  return { mode: 'default', useFallback: true }
}

// ================================================================
// Helper Functions
// ================================================================

/** Get option name based on language */
function getOptionName(option: OptionData, language: 'ar' | 'en'): string {
  return language === 'ar' ? option.name_ar : (option.name_en || option.name_ar)
}

/** Get option price */
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

// ================================================================
// Default Mode Renderer - Requirements: 4.2
// ================================================================

/**
 * Default Mode - Standard grid/cards layout
 * Uses fallback_style for actual rendering with adaptive layout
 * Requirements: 4.2
 */
function DefaultModeRenderer({
  options,
  uiConfig,
  selectedIds,
  maxSelections,
  onSelectionChange,
  language = 'ar',
  accentColor = 'pink'
}: DisplayModeRendererProps) {
  // Get fallback style from config
  const fallbackStyle = uiConfig.fallback_style || 'cards'
  
  // Calculate adaptive layout - Requirements: 6.1, 6.2, 6.3, 6.4
  const layout = calculateLayout(options.length, uiConfig.columns)
  
  const handleToggle = (optionId: string) => {
    const isSelected = selectedIds.includes(optionId)
    if (isSelected) {
      onSelectionChange(selectedIds.filter(id => id !== optionId))
    } else if (selectedIds.length < maxSelections) {
      onSelectionChange([...selectedIds, optionId])
    } else if (maxSelections === 1) {
      onSelectionChange([optionId])
    }
  }

  // Get selection order for multi-select
  const getSelectionOrder = (optionId: string): number | undefined => {
    if (maxSelections <= 1) return undefined
    const index = selectedIds.indexOf(optionId)
    return index >= 0 ? index + 1 : undefined
  }

  return (
    <div className={layout.containerClass}>
      {options.map((option) => {
        const isSelected = selectedIds.includes(option.id)
        const canSelect = !isSelected && selectedIds.length < maxSelections
        
        return (
          <OptionRenderer
            key={option.id}
            option={option}
            style={fallbackStyle}
            uiConfig={uiConfig}
            isSelected={isSelected}
            canSelect={canSelect || maxSelections === 1}
            onSelect={() => handleToggle(option.id)}
            selectionOrder={getSelectionOrder(option.id)}
            language={language}
            accentColor={accentColor}
          />
        )
      })}
    </div>
  )
}


// ================================================================
// Hero Flavor Mode Renderer - Requirements: 4.3
// ================================================================

/**
 * Hero Flavor Mode - Large circular images prominently displayed
 * Requirements: 4.3
 */
function HeroFlavorModeRenderer({
  options,
  uiConfig,
  selectedIds,
  maxSelections,
  onSelectionChange,
  language = 'ar',
  accentColor = 'pink'
}: DisplayModeRendererProps) {
  const colors = ACCENT_COLORS[accentColor]
  const nutritionConfig = uiConfig.nutrition
  
  const handleToggle = (optionId: string) => {
    const isSelected = selectedIds.includes(optionId)
    if (isSelected) {
      onSelectionChange(selectedIds.filter(id => id !== optionId))
    } else if (selectedIds.length < maxSelections) {
      onSelectionChange([...selectedIds, optionId])
    } else if (maxSelections === 1) {
      onSelectionChange([optionId])
    }
  }

  // Filter options with images for hero display
  const heroOptions = options.filter(o => o.image)
  const nonHeroOptions = options.filter(o => !o.image)

  return (
    <div className="space-y-4">
      {/* Hero Options with Images */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {heroOptions.map((option) => {
          const isSelected = selectedIds.includes(option.id)
          const canSelect = !isSelected && selectedIds.length < maxSelections
          const name = getOptionName(option, language)
          const price = getOptionPrice(option)
          const nutrition = getNutritionValues(option)

          return (
            <motion.button
              key={option.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{
                opacity: 1,
                scale: isSelected ? 1.05 : 1
              }}
              whileHover={canSelect || isSelected || maxSelections === 1 ? { scale: 1.02, y: -5 } : {}}
              whileTap={{ scale: canSelect || isSelected || maxSelections === 1 ? 0.95 : 1 }}
              onClick={() => handleToggle(option.id)}
              disabled={!canSelect && !isSelected && maxSelections !== 1}
              className={`
                relative overflow-hidden group
                flex flex-col items-center justify-center
                p-4 sm:p-6 rounded-3xl
                bg-white/40 dark:bg-slate-800/40 
                backdrop-blur-md border border-white/20 dark:border-white/10
                shadow-xl hover:shadow-2xl transition-all duration-300
                ${isSelected ? `ring-2 ring-offset-2 ${colors.ring}` : ''}
                ${!canSelect && !isSelected && maxSelections !== 1 ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {/* Background Gradient on Hover */}
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 bg-gradient-to-br ${colors.gradient} transition-opacity duration-500`} />

              {/* Hero Image - Large Circular */}
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 mb-3 sm:mb-4">
                <div className={`absolute inset-0 rounded-full bg-gradient-to-tr ${colors.gradient} opacity-20 blur-xl group-hover:opacity-40 transition-opacity`} />
                <Image
                  src={option.image!}
                  alt={name}
                  width={96}
                  height={96}
                  className="w-full h-full object-cover rounded-full shadow-lg border-4 border-white dark:border-slate-700"
                />

                {/* Selection Check */}
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={`absolute -right-2 -bottom-2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r ${colors.gradient} flex items-center justify-center text-white shadow-lg`}
                  >
                    <Check size={14} strokeWidth={3} />
                  </motion.div>
                )}
              </div>

              {/* Text Content */}
              <div className="text-center relative z-10">
                <h3 className="font-bold text-slate-800 dark:text-white text-base sm:text-lg mb-1">
                  {name}
                </h3>
                
                {/* Nutrition Badge */}
                <NutritionBadgeWrapper
                  nutrition={nutrition}
                  config={nutritionConfig}
                  size="sm"
                  language={language}
                  className="justify-center mb-1"
                />
                
                {/* Price */}
                {price > 0 && (
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${colors.bgLight} ${colors.price}`}>
                    +{price} ج.م
                  </span>
                )}
              </div>
            </motion.button>
          )
        })}
      </div>

      {/* Non-Hero Options (fallback to pills) */}
      {nonHeroOptions.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
          {nonHeroOptions.map((option) => {
            const isSelected = selectedIds.includes(option.id)
            const canSelect = !isSelected && selectedIds.length < maxSelections
            const name = getOptionName(option, language)
            const price = getOptionPrice(option)

            return (
              <motion.button
                key={option.id}
                onClick={() => handleToggle(option.id)}
                disabled={!canSelect && !isSelected && maxSelections !== 1}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`
                  px-3 py-1.5 rounded-full text-sm font-medium transition-all border-2
                  ${isSelected
                    ? `${colors.bg} border-transparent text-white shadow-md`
                    : canSelect || maxSelections === 1
                      ? `bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300`
                      : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200/50 text-slate-400 cursor-not-allowed opacity-50'
                  }
                `}
              >
                {name}
                {price > 0 && (
                  <span className={`mr-1 text-xs ${isSelected ? 'opacity-80' : 'opacity-60'}`}>
                    +{price}
                  </span>
                )}
              </motion.button>
            )
          })}
        </div>
      )}
    </div>
  )
}


// ================================================================
// Smart Meter Mode Renderer - Requirements: 4.4
// ================================================================

/**
 * Smart Meter Mode - Gauge/slider interface for quantity selection
 * Requirements: 4.4
 */
function SmartMeterModeRenderer({
  options,
  uiConfig,
  selectedIds,
  onSelectionChange,
  language = 'ar',
  accentColor = 'pink'
}: DisplayModeRendererProps) {
  const colors = ACCENT_COLORS[accentColor]
  const nutritionConfig = uiConfig.nutrition
  
  // Determine active index
  const activeIndex = options.findIndex(opt => selectedIds.includes(opt.id))
  const safeIndex = activeIndex === -1 ? 0 : activeIndex
  const activeOption = options[safeIndex]
  
  const handleIncrement = () => {
    if (safeIndex < options.length - 1) {
      onSelectionChange([options[safeIndex + 1].id])
    }
  }

  const handleDecrement = () => {
    if (safeIndex > 0) {
      onSelectionChange([options[safeIndex - 1].id])
    }
  }

  const handleDotClick = (index: number) => {
    onSelectionChange([options[index].id])
  }

  const name = activeOption ? getOptionName(activeOption, language) : ''
  const price = activeOption ? getOptionPrice(activeOption) : 0
  const nutrition = activeOption ? getNutritionValues(activeOption) : {}
  const materialColor = activeOption?.color || getMaterialColor(name)
  const isRainbow = isRainbowColor(materialColor)

  return (
    <div className="w-full bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
      {/* Active Option Display */}
      <div className="flex items-center justify-center gap-4 mb-4">
        {/* Option Image/Color */}
        {activeOption?.image ? (
          <div className={`w-16 h-16 rounded-xl overflow-hidden ring-2 ${colors.ring}`}>
            <Image
              src={activeOption.image}
              alt={name}
              width={64}
              height={64}
              className="w-full h-full object-cover"
            />
          </div>
        ) : materialColor && !isRainbow ? (
          <div 
            className={`w-14 h-14 rounded-xl ring-2 ${colors.ring}`}
            style={{ backgroundColor: materialColor }}
          />
        ) : isRainbow ? (
          <div 
            className={`w-14 h-14 rounded-xl ring-2 ${colors.ring}`}
            style={{ background: RAINBOW_GRADIENT_135 }}
          />
        ) : null}

        {/* Option Info */}
        <div className="text-center flex-1">
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-1">
            {name}
          </h3>
          
          {/* Nutrition */}
          <NutritionBadgeWrapper
            nutrition={nutrition as NutritionValues}
            config={nutritionConfig}
            size="sm"
            language={language}
            className="justify-center"
          />
          
          {/* Price */}
          {price > 0 && (
            <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-bold ${colors.bgLight} ${colors.price}`}>
              +{price} ج.م
            </span>
          )}
        </div>
      </div>

      {/* Meter Controls */}
      <div className="flex items-center justify-between gap-4">
        {/* Decrement Button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleDecrement}
          disabled={safeIndex === 0}
          className={`
            p-3 rounded-full bg-white dark:bg-slate-800 shadow-md border border-slate-200 dark:border-slate-600 
            disabled:opacity-40 disabled:cursor-not-allowed
            ${safeIndex > 0 ? 'hover:bg-slate-50 dark:hover:bg-slate-700 hover:shadow-lg' : ''}
            transition-all
          `}
        >
          <svg className="w-5 h-5 text-slate-600 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </motion.button>

        {/* Gauge Display */}
        <div className="flex-1 flex flex-col items-center gap-3">
          {/* Visual Gauge Bar */}
          <div className="w-full h-4 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden relative shadow-inner">
            {/* Background segments */}
            <div className="absolute inset-0 flex">
              {options.map((_, i) => (
                <div 
                  key={i} 
                  className="flex-1 border-r border-white/30 dark:border-slate-800/30 last:border-0" 
                />
              ))}
            </div>

            {/* Fill Bar */}
            <motion.div
              initial={false}
              animate={{
                width: `${((safeIndex + 1) / options.length) * 100}%`
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className={`h-full bg-gradient-to-r ${colors.gradient} relative`}
            >
              <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/40 rounded-r-full" />
            </motion.div>
          </div>

          {/* Step Dots */}
          <div className="flex justify-between w-full px-1">
            {options.map((opt, i) => {
              const optName = getOptionName(opt, language)
              return (
                <button
                  key={opt.id}
                  onClick={() => handleDotClick(i)}
                  className="flex flex-col items-center gap-1 group"
                >
                  <div 
                    className={`
                      w-3 h-3 rounded-full transition-all duration-200
                      ${i <= safeIndex 
                        ? `${colors.bg} shadow-md` 
                        : 'bg-slate-300 dark:bg-slate-600'
                      }
                      ${i === safeIndex ? 'ring-2 ring-offset-2 ' + colors.ring : ''}
                      group-hover:scale-125
                    `}
                  />
                  <span className={`text-[10px] font-medium transition-colors ${
                    i === safeIndex 
                      ? 'text-slate-800 dark:text-white' 
                      : 'text-slate-400 dark:text-slate-500'
                  }`}>
                    {optName.length > 8 ? optName.slice(0, 8) + '...' : optName}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Increment Button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleIncrement}
          disabled={safeIndex === options.length - 1}
          className={`
            p-3 rounded-full bg-white dark:bg-slate-800 shadow-md border border-slate-200 dark:border-slate-600 
            disabled:opacity-40 disabled:cursor-not-allowed
            ${safeIndex < options.length - 1 ? 'hover:bg-slate-50 dark:hover:bg-slate-700 hover:shadow-lg' : ''}
            transition-all
          `}
        >
          <svg className="w-5 h-5 text-slate-600 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </motion.button>
      </div>
    </div>
  )
}


// ================================================================
// Brand Accent Mode Renderer - Requirements: 4.5
// ================================================================

/**
 * Brand Accent Mode - Apply brand colors and styling to cards
 * Requirements: 4.5
 */
function BrandAccentModeRenderer({
  options,
  uiConfig,
  selectedIds,
  maxSelections,
  onSelectionChange,
  language = 'ar',
  accentColor = 'pink'
}: DisplayModeRendererProps) {
  // Use accent_color from ui_config if available
  const brandColor = uiConfig.accent_color || accentColor
  const effectiveAccent = (brandColor in ACCENT_COLORS ? brandColor : accentColor) as keyof typeof ACCENT_COLORS
  const colors = ACCENT_COLORS[effectiveAccent]
  const nutritionConfig = uiConfig.nutrition
  
  // Calculate adaptive layout
  const layout = calculateLayout(options.length, uiConfig.columns)
  
  const handleToggle = (optionId: string) => {
    const isSelected = selectedIds.includes(optionId)
    if (isSelected) {
      onSelectionChange(selectedIds.filter(id => id !== optionId))
    } else if (selectedIds.length < maxSelections) {
      onSelectionChange([...selectedIds, optionId])
    } else if (maxSelections === 1) {
      onSelectionChange([optionId])
    }
  }

  // Get selection order for multi-select
  const getSelectionOrder = (optionId: string): number | undefined => {
    if (maxSelections <= 1) return undefined
    const index = selectedIds.indexOf(optionId)
    return index >= 0 ? index + 1 : undefined
  }

  return (
    <div className={layout.containerClass}>
      {options.map((option) => {
        const isSelected = selectedIds.includes(option.id)
        const canSelect = !isSelected && selectedIds.length < maxSelections
        const name = getOptionName(option, language)
        const description = language === 'ar' ? option.description_ar : (option.description_en || option.description_ar)
        const price = getOptionPrice(option)
        const nutrition = getNutritionValues(option)
        const materialColor = option.color || getMaterialColor(name)
        const isRainbow = isRainbowColor(materialColor)
        const selectionOrder = getSelectionOrder(option.id)
        const showImage = uiConfig.show_images !== false
        const showDescription = uiConfig.show_descriptions !== false

        return (
          <motion.button
            key={option.id}
            onClick={() => handleToggle(option.id)}
            disabled={!canSelect && !isSelected && maxSelections !== 1}
            whileHover={canSelect || isSelected || maxSelections === 1 ? { scale: 1.02, y: -2 } : {}}
            whileTap={{ scale: canSelect || isSelected || maxSelections === 1 ? 0.98 : 1 }}
            className={`
              relative w-full rounded-2xl text-right transition-all duration-200 overflow-hidden
              p-3.5 min-h-[100px]
              ${isSelected
                ? `bg-gradient-to-br ${colors.gradient} text-white shadow-xl ${colors.shadow} border-2 ${colors.border}`
                : canSelect || maxSelections === 1
                  ? `bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:shadow-lg ${colors.hoverBorder}`
                  : 'bg-slate-50/50 dark:bg-slate-800/30 border-2 border-dashed border-slate-200/50 dark:border-slate-700/30 text-slate-400 cursor-not-allowed opacity-50'
              }
            `}
          >
            {/* Brand Accent Border - Left side */}
            {!isSelected && (
              <div 
                className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-full bg-gradient-to-b ${colors.gradient}`}
              />
            )}

            {/* Sparkle Icon for Brand */}
            {!isSelected && (
              <div className={`absolute top-2 left-2 ${colors.price} opacity-40`}>
                <Sparkles className="w-4 h-4" />
              </div>
            )}

            {/* Selection Order Badge */}
            {isSelected && selectionOrder && (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                className="absolute -top-1 -right-1 w-6 h-6 bg-white text-pink-600 rounded-full flex items-center justify-center text-xs font-bold shadow-lg z-10"
              >
                {selectionOrder}
              </motion.div>
            )}

            {/* Selection Check */}
            {isSelected && !selectionOrder && (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                className="absolute top-2 left-2 w-6 h-6 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center"
              >
                <Check className="w-4 h-4 text-white" strokeWidth={3} />
              </motion.div>
            )}

            {/* Content */}
            <div className="flex flex-col h-full justify-between pr-2 pl-3">
              {/* Top: Image + Name + Description */}
              <div className="flex items-start gap-2">
                {/* Option Image or Color Circle */}
                {showImage && option.image ? (
                  <div className={`flex-shrink-0 rounded-xl overflow-hidden ${
                    isSelected ? 'ring-2 ring-white/30' : `ring-2 ${colors.ring}/30`
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
                      isSelected ? 'ring-2 ring-white/30' : `ring-2 ${colors.ring}/30`
                    }`}
                    style={{ backgroundColor: materialColor }}
                  />
                ) : isRainbow ? (
                  <div 
                    className={`flex-shrink-0 w-10 h-10 rounded-xl ${
                      isSelected ? 'ring-2 ring-white/30' : `ring-2 ${colors.ring}/30`
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

                  {/* Description */}
                  {showDescription && description && (
                    <p className={`text-[10px] leading-tight mt-0.5 line-clamp-2 ${
                      isSelected ? 'text-white/70' : 'text-slate-500 dark:text-slate-400'
                    }`}>
                      {description.length > 60 ? description.slice(0, 60) + '...' : description}
                    </p>
                  )}
                </div>
              </div>

              {/* Bottom: Price + Nutrition */}
              <div className="flex items-center justify-between mt-2">
                {/* Nutrition Badge */}
                <NutritionBadgeWrapper
                  nutrition={nutrition}
                  config={nutritionConfig}
                  size="sm"
                  language={language}
                  className={isSelected ? 'opacity-80' : ''}
                />

                {/* Price */}
                {price > 0 && (
                  <div className={`text-xs font-bold flex items-center gap-1 ${
                    isSelected ? 'text-white' : colors.price
                  }`}>
                    <span>+{price}</span>
                    <span className="text-[10px] opacity-80">ج.م</span>
                  </div>
                )}
              </div>
            </div>
          </motion.button>
        )
      })}
    </div>
  )
}


// ================================================================
// Main DisplayModeRenderer Component
// ================================================================

/**
 * DisplayModeRenderer - Main Component
 * 
 * Renders option groups based on display_mode from UIConfig.
 * Automatically falls back to fallback_style when mode cannot render.
 * 
 * Requirements:
 * - 4.2: Default mode - standard grid/cards layout
 * - 4.3: Hero Flavor mode - large circular images
 * - 4.4: Smart Meter mode - gauge/slider interface
 * - 4.5: Brand Accent mode - brand colors applied
 * - 5.2: Fallback to fallback_style when mode cannot render
 * 
 * @example
 * ```tsx
 * <DisplayModeRenderer
 *   options={options}
 *   uiConfig={uiConfig}
 *   selectedIds={selectedIds}
 *   maxSelections={3}
 *   onSelectionChange={setSelectedIds}
 * />
 * ```
 */
export default function DisplayModeRenderer({
  options,
  uiConfig,
  selectedIds,
  maxSelections,
  onSelectionChange,
  language = 'ar',
  accentColor = 'pink'
}: DisplayModeRendererProps) {
  // Get effective mode with fallback check - Requirements: 5.2
  const { mode } = getEffectiveMode(
    uiConfig.display_mode || 'default',
    uiConfig.fallback_style || 'cards',
    options
  )

  // Common props for all renderers
  const commonProps = {
    options,
    uiConfig,
    selectedIds,
    maxSelections,
    onSelectionChange,
    language,
    accentColor
  }

  // Render based on effective mode
  switch (mode) {
    case 'hero_flavor':
      return <HeroFlavorModeRenderer {...commonProps} />
    
    case 'smart_meter':
      return <SmartMeterModeRenderer {...commonProps} />
    
    case 'brand_accent':
      return <BrandAccentModeRenderer {...commonProps} />
    
    case 'default':
    default:
      return <DefaultModeRenderer {...commonProps} />
  }
}

// ================================================================
// Exports
// ================================================================

export {
  DefaultModeRenderer,
  HeroFlavorModeRenderer,
  SmartMeterModeRenderer,
  BrandAccentModeRenderer
}
