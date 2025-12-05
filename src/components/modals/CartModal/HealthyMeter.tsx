'use client'

import { motion } from 'framer-motion'
import type { HealthScoreResult } from '@/lib/utils/healthScore'

interface HealthyMeterProps {
  result: HealthScoreResult
}

/**
 * HealthyMeter Component
 * 
 * Displays a visual health score meter with:
 * - Animated progress bar
 * - Score number
 * - Level label (Excellent, Good, Fair, Poor, Very Poor)
 * - Color-coded based on score
 */
export default function HealthyMeter({ result }: HealthyMeterProps) {
  const { score, level, color } = result

  // Arabic level labels
  const levelLabels: Record<string, string> = {
    'Excellent': 'ممتاز',
    'Good': 'جيد',
    'Fair': 'متوسط',
    'Poor': 'ضعيف',
    'Very Poor': 'ضعيف جداً'
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-slate-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
          مؤشر الصحة
        </span>
        <div className="flex items-center gap-2">
          <span 
            className="text-lg font-bold"
            style={{ color }}
          >
            {score}
          </span>
          <span 
            className="text-xs font-medium px-2 py-0.5 rounded-full"
            style={{ 
              backgroundColor: `${color}20`,
              color 
            }}
          >
            {levelLabels[level] || level}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>

      {/* Scale Labels */}
      <div className="flex justify-between mt-1.5 text-[10px] text-slate-400 dark:text-slate-500">
        <span>0</span>
        <span>50</span>
        <span>100</span>
      </div>
    </div>
  )
}
