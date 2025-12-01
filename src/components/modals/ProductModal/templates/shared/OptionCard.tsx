'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Check, Plus } from 'lucide-react'
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
  color?: string // Material color from backend
}

interface OptionCardProps {
  option: Option
  isSelected: boolean
  canSelect: boolean
  onToggle: () => void
  selectionOrder?: number
  size?: 'sm' | 'md' | 'lg'
  accentColor?: 'pink' | 'amber' | 'purple' | 'cyan' | 'emerald'
  showImage?: boolean
  showDescription?: boolean
  showNutrition?: boolean // kept for API compatibility
  showMaterialColor?: boolean
  language?: 'ar' | 'en'
}

// Material color mapping based on name keywords
const getMaterialColor = (name: string): string | null => {
  const lower = name.toLowerCase()
  
  // Chocolate variants
  if (lower.includes('شوكولاته') || lower.includes('شيكولاته') || lower.includes('chocolate') || lower.includes('كاكاو') || lower.includes('cocoa') || lower.includes('براوني') || lower.includes('brownie')) {
    return '#5D4037' // Rich brown
  }
  // Pistachio
  if (lower.includes('فستق') || lower.includes('pistachio')) {
    return '#7CB342' // Pistachio green
  }
  // Strawberry
  if (lower.includes('فراولة') || lower.includes('strawberry') || lower.includes('توت') || lower.includes('berry')) {
    return '#E91E63' // Pink/red
  }
  // Vanilla
  if (lower.includes('فانيليا') || lower.includes('vanilla')) {
    return '#FFF8E1' // Cream
  }
  // Caramel
  if (lower.includes('كراميل') || lower.includes('caramel') || lower.includes('توفي') || lower.includes('toffee')) {
    return '#FF8F00' // Amber/caramel
  }
  // Mango
  if (lower.includes('مانجو') || lower.includes('mango')) {
    return '#FFB300' // Mango yellow
  }
  // Blueberry
  if (lower.includes('بلوبيري') || lower.includes('blueberry')) {
    return '#5C6BC0' // Blue
  }
  // Oreo/Cookies
  if (lower.includes('اوريو') || lower.includes('oreo') || lower.includes('كوكيز') || lower.includes('cookie')) {
    return '#37474F' // Dark gray
  }
  // Lotus/Biscoff
  if (lower.includes('لوتس') || lower.includes('lotus') || lower.includes('بسكويت') || lower.includes('biscoff')) {
    return '#D84315' // Lotus orange-brown
  }
  // Nutella/Hazelnut
  if (lower.includes('نوتيلا') || lower.includes('nutella') || lower.includes('بندق') || lower.includes('hazelnut')) {
    return '#6D4C41' // Hazelnut brown
  }
  // Mint
  if (lower.includes('نعناع') || lower.includes('mint')) {
    return '#26A69A' // Mint green
  }
  // Coffee
  if (lower.includes('قهوة') || lower.includes('coffee') || lower.includes('موكا') || lower.includes('mocha')) {
    return '#4E342E' // Coffee brown
  }
  // Lemon
  if (lower.includes('ليمون') || lower.includes('lemon')) {
    return '#FDD835' // Lemon yellow
  }
  // Coconut
  if (lower.includes('جوز هند') || lower.includes('coconut')) {
    return '#EFEBE9' // Coconut white
  }
  // Honey
  if (lower.includes('عسل') || lower.includes('honey')) {
    return '#FFA000' // Honey gold
  }
  // Sprinkles/Rainbow
  if (lower.includes('سبرنكلز') || lower.includes('sprinkles') || lower.includes('ملون')) {
    return 'rainbow' // Special case
  }
  
  return null
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
  showMaterialColor = true,
  language = 'ar'
}: OptionCardProps) {
  const sizeClasses = {
    sm: 'p-2.5 min-h-[80px]',
    md: 'p-3.5 min-h-[100px]',
    lg: 'p-4 min-h-[120px]'
  }

  const colorMap = {
    pink: {
      gradient: 'from-pink-500 via-pink-600 to-purple-600',
      shadow: 'shadow-pink-500/40',
      border: 'border-pink-400/50',
      hoverBorder: 'hover:border-pink-300 dark:hover:border-pink-700',
      price: 'text-pink-600 dark:text-pink-400',
      bg: 'bg-pink-50 dark:bg-pink-950/20'
    },
    amber: {
      gradient: 'from-amber-500 via-orange-500 to-amber-600',
      shadow: 'shadow-amber-500/40',
      border: 'border-amber-400/50',
      hoverBorder: 'hover:border-amber-300 dark:hover:border-amber-700',
      price: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/20'
    },
    purple: {
      gradient: 'from-purple-500 via-purple-600 to-indigo-600',
      shadow: 'shadow-purple-500/40',
      border: 'border-purple-400/50',
      hoverBorder: 'hover:border-purple-300 dark:hover:border-purple-700',
      price: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-50 dark:bg-purple-950/20'
    },
    cyan: {
      gradient: 'from-cyan-500 via-cyan-600 to-blue-600',
      shadow: 'shadow-cyan-500/40',
      border: 'border-cyan-400/50',
      hoverBorder: 'hover:border-cyan-300 dark:hover:border-cyan-700',
      price: 'text-cyan-600 dark:text-cyan-400',
      bg: 'bg-cyan-50 dark:bg-cyan-950/20'
    },
    emerald: {
      gradient: 'from-emerald-500 via-emerald-600 to-teal-600',
      shadow: 'shadow-emerald-500/40',
      border: 'border-emerald-400/50',
      hoverBorder: 'hover:border-emerald-300 dark:hover:border-emerald-700',
      price: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/20'
    }
  }

  const colors = colorMap[accentColor]
  const name = language === 'ar' ? option.name_ar : (option.name_en || option.name_ar)
  const description = language === 'ar' ? option.description_ar : (option.description_en || option.description_ar)
  
  // Get material color from option or derive from name
  const materialColor = option.color || (showMaterialColor ? getMaterialColor(name) : null)
  const isRainbow = materialColor === 'rainbow'

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
        relative rounded-2xl text-right transition-all duration-200 overflow-hidden w-full
        ${sizeClasses[size]}
        ${isSelected
          ? `bg-gradient-to-br ${colors.gradient} text-white shadow-xl ${colors.shadow} border-2 ${colors.border}`
          : canSelect
            ? `bg-white dark:bg-slate-800/80 border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:shadow-lg ${colors.hoverBorder}`
            : 'bg-slate-50/50 dark:bg-slate-800/30 border-2 border-dashed border-slate-200/50 dark:border-slate-700/30 text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-50'
        }
      `}
    >
      {/* Material Color Accent - Left Border/Shadow */}
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
          style={{ 
            background: 'linear-gradient(180deg, #FF6B6B, #FFE66D, #4ECDC4, #45B7D1, #96CEB4, #DDA0DD)',
          }}
        />
      )}

      {/* Material Color Glow Effect when selected */}
      {materialColor && isSelected && !isRainbow && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.3, 0.5, 0.3] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute inset-0 rounded-2xl"
          style={{ 
            boxShadow: `inset 0 0 20px ${materialColor}40`,
          }}
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
        {/* Top: Image + Name */}
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
            // Color circle as fallback when no image
            <div 
              className={`flex-shrink-0 w-10 h-10 rounded-xl ${
                isSelected ? 'ring-2 ring-white/30' : 'ring-1 ring-slate-200 dark:ring-slate-700'
              }`}
              style={{ backgroundColor: materialColor }}
            />
          ) : isRainbow ? (
            // Rainbow circle for sprinkles
            <div 
              className={`flex-shrink-0 w-10 h-10 rounded-xl ${
                isSelected ? 'ring-2 ring-white/30' : 'ring-1 ring-slate-200 dark:ring-slate-700'
              }`}
              style={{ 
                background: 'linear-gradient(135deg, #FF6B6B, #FFE66D, #4ECDC4, #45B7D1, #96CEB4, #DDA0DD)',
              }}
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
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Bottom: Price or Calories */}
        <div className="flex items-center justify-end mt-2">
          {option.price > 0 ? (
            <div className={`text-xs font-bold flex items-center gap-1 ${
              isSelected ? 'text-white' : colors.price
            }`}>
              <span>+{option.price}</span>
              <span className="text-[10px] opacity-80">ج.م</span>
            </div>
          ) : option.nutrition?.calories ? (
            // Show calories instead of "مجاناً" when price is 0
            <span className={`text-[10px] font-medium flex items-center gap-1 ${
              isSelected ? 'text-white/70' : 'text-slate-500 dark:text-slate-400'
            }`}>
              <span>🔥</span>
              <span>{option.nutrition.calories}</span>
              <span className="opacity-70">سعرة</span>
            </span>
          ) : null}
        </div>
      </div>
    </motion.button>
  )
}
