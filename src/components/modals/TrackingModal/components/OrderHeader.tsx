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

  const isPickup = order.deliveryMethod === 'pickup'

  const getDestinationLabel = () => {
    if (isPickup) {
      if (!order.branch) return 'استلام من الفرع'
      if (typeof order.branch === 'string') return `استلام من: ${order.branch}`
      return `استلام من: ${order.branch.name || 'الفرع'}`
    }

    if (order.customer?.address) {
      const addr = order.customer.address
      return `توصيل إلى: ${addr.length > 40 ? addr.slice(0, 40) + '…' : addr}`
    }

    return 'توصيل للعنوان المحدد'
  }

  const getEtaLabel = () => {
    if (order.eta) return order.eta
    if (order.estimatedMinutes && order.createdAt) {
      const created = new Date(order.createdAt)
      const eta = new Date(created.getTime() + order.estimatedMinutes * 60 * 1000)
      return eta.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    }
    return null
  }

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
      {/* Order ID + Type + Destination + ETA */}
      <div className="rounded-2xl p-4 md:p-5 border border-pink-100 dark:border-pink-900/40 bg-gradient-to-br from-pink-50 via-rose-50 to-white dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-900/80 shadow-sm flex flex-col gap-3 md:gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-pink-600 dark:text-pink-400">رقم الطلب</span>
            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300">
              {isPickup ? '🏃 استلام من الفرع' : '🚚 طلب توصيل'}
            </span>
          </div>
          <p className="text-2xl md:text-3xl font-black text-slate-900 dark:text-slate-50 font-mono break-all tracking-tight">
            #{order.id}
          </p>
          <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400">
            {getDestinationLabel()}
          </p>
        </div>

        <div className="flex items-end justify-between md:flex-col md:items-end md:justify-center gap-3 md:gap-2">
          <div className="flex flex-col items-end">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-pink-500 dark:text-pink-400" />
              الوقت التقديري
            </span>
            <span className="text-lg md:text-xl font-bold text-pink-600 dark:text-pink-300">
              {getEtaLabel() ? getEtaLabel() : order.estimatedMinutes ? `${order.estimatedMinutes} دقيقة` : '—'}
            </span>
          </div>
        </div>
      </div>

      {/* Edit Timer - Only if can edit */}
      {canEdit && timeLeft && (
        <div className="bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 rounded-2xl p-4 border border-pink-200 dark:border-pink-900/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-pink-600 dark:text-pink-400" />
              <div>
                <p className="text-xs text-pink-600 dark:text-pink-400 font-medium">وقت التعديل المتبقي</p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">يمكنك تعديل الطلب خلال هذا الوقت</p>
              </div>
            </div>
            <div className="text-center">
              <p className="text-3xl font-black text-pink-600 dark:text-pink-400 font-mono">{timeLeft}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">دقيقة</p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
