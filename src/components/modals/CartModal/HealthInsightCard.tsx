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
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
        transition={{
          type: 'spring',
          damping: 25,
          stiffness: 300,
          delay
        }}
        className="relative overflow-hidden rounded-2xl p-[1px] group"
      >
        {/* Animated Gradient Border using CSS */}
        <div className="absolute inset-0 bg-gradient-to-r from-green-300 via-emerald-200 to-green-300 opacity-30 group-hover:opacity-60 transition-opacity duration-1000 animate-gradient-xy" />

        <div className="relative bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-2xl p-4 h-full border border-white/50 dark:border-white/5 shadow-sm">
          {/* Decorative Orb */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-green-200/20 dark:bg-green-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex gap-4">
            {/* Emoji Container */}
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 flex items-center justify-center text-2xl shadow-inner border border-green-100 dark:border-green-800/50 flex-shrink-0">
              {insight.message.emoji}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-1">
                  {insight.message.title}
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                </h3>
                <button
                  onClick={handleDismiss}
                  className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-700/50 hover:bg-red-50 hover:text-red-500 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                  aria-label="إغلاق"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>

              <div className="space-y-1">
                {insight.message.lines.slice(0, 3).map((line, index) => (
                  <motion.p
                    key={index}
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: delay + 0.2 + (index * 0.1) }}
                    className="text-xs font-medium text-slate-600 dark:text-slate-300 leading-tight"
                  >
                    {line}
                  </motion.p>
                ))}
              </div>
            </div>
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
