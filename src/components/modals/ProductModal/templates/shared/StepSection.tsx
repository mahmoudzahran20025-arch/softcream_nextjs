'use client'

import { motion } from 'framer-motion'
import { Check, ChevronRight, Lightbulb } from 'lucide-react'
import type { ReactNode, ComponentType } from 'react'

interface StepSectionProps {
  /** Step number (1, 2, 3...) */
  step: number
  /** Section title */
  title: string
  /** Icon component to display */
  IconComponent: ComponentType<{ className?: string }>
  /** Badge text (e.g., "2/3") */
  badge?: string
  /** Whether this step is complete */
  isComplete?: boolean
  /** Whether this step is currently active */
  isActive?: boolean
  /** Whether to highlight this section */
  highlight?: boolean
  /** Hint message to show when active */
  hint?: string
  /** Children content */
  children: ReactNode
}

/**
 * StepSection - مكون خطوة في عملية التخصيص
 * 
 * يُستخدم في BYOTemplate لعرض خطوات اختيار الحاوية والحجم والنكهات
 * 
 * @example
 * ```tsx
 * <StepSection
 *   step={1}
 *   title="اختر النكهات"
 *   IconComponent={IceCream}
 *   badge="2/3"
 *   isComplete={false}
 *   isActive={true}
 *   highlight
 *   hint="اختر نكهتين على الأقل"
 * >
 *   <OptionsGrid ... />
 * </StepSection>
 * ```
 */
export default function StepSection({
  step,
  title,
  IconComponent,
  badge,
  isComplete,
  isActive,
  highlight,
  hint,
  children
}: StepSectionProps) {
  return (
    <motion.div
   
   initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: step * 0.08 }}
      className={`space-y-3 p-4 rounded-2xl transition-all duration-300 ${
        highlight && isActive
          ? 'bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-950/20 dark:to-purple-950/20 border border-pink-200 dark:border-pink-800/50'
          : isActive
            ? 'bg-slate-50 dark:bg-slate-800/50'
            : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {/* Step Number/Check */}
          <motion.div 
            animate={isComplete ? { scale: [1, 1.2, 1] } : {}}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
              isComplete 
                ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-lg shadow-emerald-500/30' 
                : isActive
                  ? 'bg-gradient-to-br from-pink-500 to-purple-600 text-white shadow-lg shadow-pink-500/30'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
            }`}
          >
            {isComplete ? <Check className="w-4 h-4" strokeWidth={3} /> : step}
          </motion.div>
          
          {/* Icon */}
          <div className={`transition-colors ${
            isComplete
              ? 'text-emerald-600 dark:text-emerald-400'
              : isActive
                ? 'text-pink-600 dark:text-pink-400'
                : 'text-slate-400 dark:text-slate-500'
          }`}>
            <IconComponent className="w-5 h-5" />
          </div>
          
          {/* Title */}
          <h3 className="font-bold text-slate-900 dark:text-white">{title}</h3>
          
          {/* Active Indicator */}
          {isActive && !isComplete && (
            <motion.div
              animate={{ x: [0, 4, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <ChevronRight className="w-4 h-4 text-pink-500" />
            </motion.div>
          )}
        </div>
        
        {/* Badge */}
        {badge && (
          <motion.span 
            animate={isComplete ? { scale: [1, 1.1, 1] } : {}}
            className={`text-xs font-bold px-2.5 py-1 rounded-full transition-all ${
              isComplete 
                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            {badge}
          </motion.span>
        )}
      </div>
      
      {/* Hint Message */}
      {hint && isActive && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-sm text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/20 px-3 py-2 rounded-xl border border-pink-200 dark:border-pink-800/50"
        >
          <Lightbulb className="w-4 h-4" />
          <span>{hint}</span>
        </motion.div>
      )}
      
      {children}
    </motion.div>
  )
}
