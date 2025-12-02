'use client'

import { motion } from 'framer-motion'
import { Info, Heart } from 'lucide-react'
import { useState } from 'react'
import { HealthScoreResult } from '@/lib/utils/healthScore'

interface HealthyMeterProps {
  result: HealthScoreResult
}

export default function HealthyMeter({ result }: HealthyMeterProps) {
  const [showTooltip, setShowTooltip] = useState(false)

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute top-0 right-0 p-4 opacity-5">
        <Heart className="w-24 h-24 text-pink-500" fill="currentColor" />
      </div>

      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-inner" style={{ backgroundColor: `${result.color}20` }}>
            <Heart className="w-6 h-6" style={{ color: result.color }} fill="currentColor" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1">
              مقياس الصحة
              <button
                onClick={() => setShowTooltip(!showTooltip)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <Info className="w-4 h-4" />
              </button>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              تقييم: <span style={{ color: result.color, fontWeight: 'bold' }}>{result.level === 'Excellent' ? 'ممتاز' : result.level === 'Good' ? 'جيد' : result.level === 'Fair' ? 'مقبول' : 'يحتاج تحسين'}</span>
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-2xl font-black" style={{ color: result.color }}>
            {result.score}
          </span>
          <span className="text-xs text-slate-400 block">/ 100</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-3 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${result.score}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ backgroundColor: result.color }}
        />
      </div>

      {/* Tooltip / Explanation */}
      {showTooltip && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 leading-relaxed"
        >
          <p className="mb-1"><strong>لماذا هذه النتيجة؟</strong></p>
          <ul className="list-disc list-inside space-y-1 opacity-80">
            <li>يعتمد التقييم على توازن السكر والبروتين والدهون.</li>
            <li>النتيجة الأعلى تعني خياراً صحياً أكثر توازناً.</li>
            <li>شعارنا: طعم لذيذ، صحة أفضل! 🍦</li>
          </ul>
        </motion.div>
      )}
    </div>
  )
}
