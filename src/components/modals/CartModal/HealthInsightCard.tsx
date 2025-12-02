'use client'

import { useState, lazy, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles } from 'lucide-react'
import type { HealthInsight } from '@/lib/health/insights'

interface HealthInsightCardProps {
  insight: HealthInsight
  onDismiss?: () => void
  delay?: number // Animation delay in seconds
}

/**
 * HealthInsightCard Component
 * 
 * Displays a health insight card with:
 * - Gradient background (green-50 to blue-50)
 * - Fade-in and slide-up animation
 * - Dismiss button
 * - Emoji icon matching the insight category
 * - Max 3 lines of Arabic text
 */
export default function HealthInsightCard({ 
  insight, 
  onDismiss,
  delay = 0.5 
}: HealthInsightCardProps) {
  const [isDismissed, setIsDismissed] = useState(false)

  const handleDismiss = () => {
    setIsDismissed(true)
    onDismiss?.()
  }

  if (isDismissed) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ 
          duration: 0.4, 
          delay,
          ease: 'easeOut' 
        }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 p-4 shadow-sm border border-green-100/50 dark:border-green-800/30"
      >
        {/* Background decoration */}
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-green-400 rounded-full blur-2xl" />
          <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-blue-400 rounded-full blur-2xl" />
        </div>

        {/* Content */}
        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl" role="img" aria-label={insight.id}>
                {insight.message.emoji}
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1">
                  {insight.message.title}
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                </h3>
              </div>
            </div>
            
            {/* Dismiss button */}
            <button
              onClick={handleDismiss}
              className="w-6 h-6 rounded-full bg-white/60 dark:bg-slate-700/60 hover:bg-white dark:hover:bg-slate-600 flex items-center justify-center transition-colors"
              aria-label="إغلاق"
            >
              <X className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            </button>
          </div>

          {/* Message lines (max 3) */}
          <div className="space-y-1.5">
            {insight.message.lines.slice(0, 3).map((line, index) => (
              <motion.p
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ 
                  duration: 0.3, 
                  delay: delay + 0.1 + (index * 0.1) 
                }}
                className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed"
              >
                {line}
              </motion.p>
            ))}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

/**
 * Lazy-loaded version for performance optimization
 */
export const LazyHealthInsightCard = lazy(() => 
  Promise.resolve({ default: HealthInsightCard })
)

/**
 * Wrapper with Suspense for lazy loading
 */
export function HealthInsightCardWithSuspense(props: HealthInsightCardProps) {
  return (
    <Suspense fallback={<HealthInsightCardSkeleton />}>
      <LazyHealthInsightCard {...props} />
    </Suspense>
  )
}

/**
 * Skeleton loader for the card
 */
function HealthInsightCardSkeleton() {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 p-4 animate-pulse">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-full" />
        <div className="w-24 h-4 bg-slate-200 dark:bg-slate-700 rounded" />
      </div>
      <div className="space-y-2">
        <div className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded" />
        <div className="w-3/4 h-3 bg-slate-200 dark:bg-slate-700 rounded" />
        <div className="w-1/2 h-3 bg-slate-200 dark:bg-slate-700 rounded" />
      </div>
    </div>
  )
}
