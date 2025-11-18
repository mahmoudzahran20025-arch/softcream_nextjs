'use client'

import { useState, useEffect } from 'react'
import { Clock, CheckCircle } from 'lucide-react'

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

  // ✅ Simplified: Clean timer display
  return (
    <div className={`rounded-xl p-4 border-2 transition-all ${
      canStillCancel 
        ? 'bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-300'
        : 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Clock className={`w-5 h-5 ${canStillCancel ? 'text-amber-600 animate-pulse' : 'text-blue-600'}`} />
          <div>
            <p className="font-bold text-gray-800 dark:text-gray-100">
              {canStillCancel ? 'وقت التعديل/الإلغاء المتبقي' : 'الوقت المتوقع للوصول'}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
              {canStillCancel 
                ? 'يمكنك تعديل أو إلغاء الطلب خلال هذا الوقت' 
                : 'الوقت التقريبي لوصول طلبك'}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-3xl font-black tabular-nums ${
            canStillCancel 
              ? 'text-amber-600 dark:text-amber-400' 
              : 'text-blue-600 dark:text-blue-400'
          }`}>
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            دقيقة
          </p>
        </div>
      </div>
    </div>
  )
}