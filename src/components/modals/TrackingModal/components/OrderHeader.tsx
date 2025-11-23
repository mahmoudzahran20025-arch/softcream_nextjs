// ✅ OrderHeader.tsx - Order ID & Edit Timer

'use client'

import { Clock } from 'lucide-react'
import type { Order } from '../useOrderTracking'
import { useState, useEffect } from 'react'

interface OrderHeaderProps {
  order: Order
}

export default function OrderHeader({ order }: OrderHeaderProps) {
  const [timeLeft, setTimeLeft] = useState<string>('')
  const [canEdit, setCanEdit] = useState(false)

  useEffect(() => {
    if (!order.canCancelUntil) return

    const updateTimer = () => {
      const now = new Date().getTime()
      const deadline = new Date(order.canCancelUntil!).getTime()
      const diff = deadline - now

      if (diff <= 0) {
        setTimeLeft('00:00')
        setCanEdit(false)
        return
      }

      const minutes = Math.floor(diff / 60000)
      const seconds = Math.floor((diff % 60000) / 1000)
      setTimeLeft(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`)
      setCanEdit(['pending', 'جديد'].includes(order.status))
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [order.canCancelUntil, order.status])

  return (
    <>
      {/* Order ID Card */}
      <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-5 border border-purple-200 dark:border-purple-800">
        <p className="text-xs font-medium text-purple-600 dark:text-purple-400 mb-1">رقم الطلب</p>
        <p className="text-2xl font-bold text-purple-700 dark:text-purple-300 font-mono break-all">#{order.id}</p>
      </div>

      {/* Edit Timer - Only if can edit */}
      {canEdit && timeLeft && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-4 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">وقت التعديل المتبقي</p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">يمكنك تعديل الطلب خلال هذا الوقت</p>
              </div>
            </div>
            <div className="text-center">
              <p className="text-3xl font-black text-blue-600 dark:text-blue-400 font-mono">{timeLeft}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">دقيقة</p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
