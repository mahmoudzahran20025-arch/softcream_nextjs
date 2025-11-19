'use client'

import { useState, useEffect } from 'react'
import { Clock, CheckCircle, Sparkles } from 'lucide-react'

interface SimpleOrderTimerProps {
  createdAt: string
  estimatedMinutes: number
  canCancelUntil: string
  onCanCancelExpired?: () => void
}

export default function SimpleOrderTimer({ 
  createdAt, 
  estimatedMinutes,
  canCancelUntil,
  onCanCancelExpired
}: SimpleOrderTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    minutes: 0,
    seconds: 0,
    canStillCancel: true,
    isDelivered: false
  })

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date()
      const cancelDeadline = new Date(canCancelUntil)
      const completionTime = new Date(new Date(createdAt).getTime() + estimatedMinutes * 60000)
      
      const cancelRemaining = cancelDeadline.getTime() - now.getTime()
      const canStillCancel = cancelRemaining > 0
      
      const deliveryRemaining = completionTime.getTime() - now.getTime()
      const isDelivered = deliveryRemaining <= 0
      
      if (!canStillCancel && onCanCancelExpired && cancelRemaining > -1000) {
        onCanCancelExpired()
      }
      
      const remaining = canStillCancel ? cancelRemaining : deliveryRemaining
      const minutes = Math.max(0, Math.floor(remaining / 60000))
      const seconds = Math.max(0, Math.floor((remaining % 60000) / 1000))
      
      setTimeLeft({ minutes, seconds, canStillCancel, isDelivered })
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    
    return () => clearInterval(interval)
  }, [createdAt, estimatedMinutes, canCancelUntil, onCanCancelExpired])

  const { minutes, seconds, canStillCancel, isDelivered } = timeLeft

  if (isDelivered) {
    return (
      <div className="bg-gradient-to-r from-green-50 via-emerald-50 to-green-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-5 border border-green-300 dark:border-green-800 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center animate-bounce">
            <CheckCircle className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-lg text-green-800 dark:text-green-300 mb-1">
              الوقت المتوقع انتهى! 🎉
            </p>
            <p className="text-sm text-green-700 dark:text-green-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              من المفترض أن يصلك الطلب الآن
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`rounded-2xl p-5 border-2 transition-all shadow-sm ${
      canStillCancel 
        ? 'bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-300 dark:border-amber-800'
        : 'bg-gradient-to-r from-blue-50 via-purple-50 to-blue-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-800'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            canStillCancel 
              ? 'bg-amber-500 dark:bg-amber-600' 
              : 'bg-blue-500 dark:bg-blue-600'
          }`}>
            <Clock className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="font-bold text-lg text-slate-900 dark:text-white mb-1">
              {canStillCancel ? 'وقت التعديل المتبقي' : 'الوقت المتوقع للوصول'}
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
              {canStillCancel ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                  يمكنك تعديل الطلب خلال هذا الوقت
                </>
              ) : (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                  الوقت التقريبي لوصول طلبك
                </>
              )}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-4xl font-black tabular-nums leading-none ${
            canStillCancel 
              ? 'text-amber-600 dark:text-amber-400' 
              : 'text-blue-600 dark:text-blue-400'
          }`}>
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>
          <p className={`text-xs font-medium mt-2 ${
            canStillCancel 
              ? 'text-amber-600 dark:text-amber-400' 
              : 'text-blue-600 dark:text-blue-400'
          }`}>
            دقيقة
          </p>
        </div>
      </div>
    </div>
  )
}