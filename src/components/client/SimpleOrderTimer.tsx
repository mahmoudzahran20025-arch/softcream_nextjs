'use client'

import { useState, useEffect } from 'react'
import { Clock, AlertTriangle, CheckCircle } from 'lucide-react'

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
      
      // حساب الوقت المتبقي للإلغاء (5 دقائق)
      const cancelRemaining = cancelDeadline.getTime() - now.getTime()
      const canStillCancel = cancelRemaining > 0
      
      // حساب الوقت المتبقي للتسليم
      const deliveryRemaining = completionTime.getTime() - now.getTime()
      const isDelivered = deliveryRemaining <= 0
      
      // إشعار عند انتهاء فترة الإلغاء
      if (!canStillCancel && onCanCancelExpired && cancelRemaining > -1000) {
        onCanCancelExpired()
      }
      
      // عرض الوقت المناسب
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

  // إذا تم التسليم
  if (isDelivered) {
    return (
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 border-2 border-green-300">
        <div className="flex items-center gap-3">
          <CheckCircle className="w-6 h-6 text-green-600 animate-pulse" />
          <div>
            <p className="font-bold text-green-800 dark:text-green-400">
              الوقت المتوقع انتهى! 🎉
            </p>
            <p className="text-sm text-green-700 dark:text-green-500 mt-1">
              من المفترض أن يصلك الطلب الآن
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* ⏱️ العداد التنازلي */}
      <div className={`rounded-xl p-4 border-2 transition-all ${
        canStillCancel 
          ? 'bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-orange-300'
          : 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200'
      }`}>
        <div className="flex items-center gap-2 mb-3">
          <Clock className={`w-5 h-5 ${canStillCancel ? 'text-orange-600 animate-pulse' : 'text-blue-600'}`} />
          <p className="font-bold text-gray-800 dark:text-gray-100">
            {canStillCancel ? '⚠️ يمكنك الإلغاء خلال' : '⏱️ الوقت المتوقع للوصول'}
          </p>
        </div>
        
        <div className="text-center">
          <div className={`text-5xl font-black tabular-nums ${
            canStillCancel 
              ? 'text-orange-600 dark:text-orange-400' 
              : 'text-blue-600 dark:text-blue-400'
          }`}>
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            {canStillCancel 
              ? 'دقيقة متبقية للإلغاء المجاني' 
              : 'دقيقة متبقية تقريباً'}
          </p>
        </div>

        {/* Progress bar */}
        {!canStillCancel && (
          <div className="mt-4">
            <div className="relative w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-400 to-purple-600 transition-all duration-1000 ease-linear"
                style={{ 
                  width: `${Math.min(100, ((estimatedMinutes * 60 - (minutes * 60 + seconds)) / (estimatedMinutes * 60)) * 100)}%` 
                }}
              />
            </div>
            <div className="text-xs text-center text-gray-500 dark:text-gray-400 mt-2">
              {Math.min(100, Math.round(((estimatedMinutes * 60 - (minutes * 60 + seconds)) / (estimatedMinutes * 60)) * 100))}% مكتمل
            </div>
          </div>
        )}
      </div>

      {/* ⚠️ تحذير بعد انتهاء فترة الإلغاء */}
      {!canStillCancel && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4 border-2 border-yellow-300">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-bold text-yellow-800 dark:text-yellow-400 mb-1">
                لم يعد بإمكانك الإلغاء تلقائياً
              </p>
              <p className="text-yellow-700 dark:text-yellow-500">
                للإلغاء الآن، يرجى الاتصال بنا مباشرة على الأرقام أدناه
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}