// ✅ StatusTimeline.tsx - Progress Bar & Stage Icons

'use client'

import { Loader2, RefreshCw, TrendingUp, Clock, MapPin } from 'lucide-react'
import { FINAL_STATUSES, PICKUP_STAGES, DELIVERY_STAGES } from '@/lib/orderTracking'
import type { Order } from '../useOrderTracking'

interface StatusTimelineProps {
  order: Order
  isRefreshing: boolean
  getStatusLabel: (status: string) => string
  formatUpdatedBy: (updatedBy: string) => string
  onRefresh: () => void
}

export default function StatusTimeline({ 
  order, 
  isRefreshing, 
  getStatusLabel, 
  formatUpdatedBy,
  onRefresh 
}: StatusTimelineProps) {
  const isFinal = FINAL_STATUSES.includes(order.status)
  const isPickup = order.deliveryMethod === 'pickup'

  const etaLabel = (() => {
    if ((order as any).eta) return (order as any).eta as string
    if (order.estimatedMinutes && order.createdAt) {
      const created = new Date(order.createdAt)
      const eta = new Date(created.getTime() + order.estimatedMinutes * 60 * 1000)
      return eta.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    }
    return null
  })()

  const destinationLabel = (() => {
    if (isPickup) {
      const branch = (order as any).branch
      if (!branch) return 'استلام من الفرع'
      if (typeof branch === 'string') return `استلام من: ${branch}`
      return `استلام من: ${branch.name || 'الفرع'}`
    }

    const addr = order.customer?.address
    if (addr) {
      return `توصيل إلى: ${addr.length > 40 ? addr.slice(0, 40) + '…' : addr}`
    }

    return 'توصيل للعنوان المحدد'
  })()

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 md:p-5 border border-slate-200/80 dark:border-slate-700 shadow-sm space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-3">
          <div className={`mt-1 w-3 h-3 rounded-full shadow-sm ${
            (order.status === 'pending' || order.status === 'جديد') ? 'bg-amber-400 animate-pulse' :
            (order.status === 'confirmed' || order.status === 'مؤكد') ? 'bg-emerald-500' :
            (order.status === 'cancelled' || order.status === 'ملغي') ? 'bg-red-500' : 'bg-pink-500'
          }`} />
          <div className="space-y-1">
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">حالة الطلب</p>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-lg md:text-xl font-bold text-slate-900 dark:text-slate-50">
                {getStatusLabel(order.status)}
              </p>
              <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold bg-pink-50 text-pink-700 dark:bg-pink-900/40 dark:text-pink-200">
                {isPickup ? '🏃 Pickup' : '🚚 Delivery'}
              </span>
              {isFinal && (
                <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                  مكتمل
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2 text-[11px] md:text-xs text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-pink-500 dark:text-pink-400" />
                {destinationLabel}
              </span>
              {etaLabel && (
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-pink-500 dark:text-pink-400" />
                  توقّع التسليم: {etaLabel}
                </span>
              )}
            </div>
          </div>
        </div>
        <button 
          onClick={onRefresh} 
          disabled={isRefreshing} 
          className="self-start md:self-center p-2.5 rounded-xl bg-pink-50 dark:bg-pink-900/30 text-pink-600 dark:text-pink-300 hover:bg-pink-100 dark:hover:bg-pink-900/50 disabled:opacity-50 transition-all shadow-sm"
          aria-label="تحديث يدوي"
        >
          {isRefreshing ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <RefreshCw className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Smart Progress Bar (Pickup = 4 stages, Delivery = 5 stages) */}
      {!isFinal && (
        <div className="space-y-4">
          {/* Progress Percentage */}
          {order.progress !== null && order.progress !== undefined && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                <span className="text-sm font-medium text-slate-800 dark:text-slate-200">نسبة الإنجاز</span>
              </div>
              <span className="text-2xl font-bold text-pink-600 dark:text-pink-300">{order.progress}%</span>
            </div>
          )}
          
          {/* Progress Bar */}
          <div className="relative w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-pink-500 via-rose-500 to-amber-400 h-full rounded-full transition-all duration-700 ease-out relative"
              style={{ width: `${order.progress || 0}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer"></div>
            </div>
          </div>
          
          {/* Stage Timeline (Pickup vs Delivery) */}
          <div className="pt-3">
            <div className="flex justify-between items-start gap-2">
              {(order.deliveryMethod === 'pickup' ? PICKUP_STAGES : DELIVERY_STAGES).map((stage) => {
                const progress = order.progress || 0
                const isCompleted = progress >= stage.progress
                const isCurrent = Math.abs(progress - stage.progress) < 20
                
                return (
                  <div key={stage.id} className="flex flex-col items-center flex-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold transition-all mb-2 ${
                      isCompleted 
                        ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg scale-110' 
                        : isCurrent 
                          ? 'bg-gradient-to-br from-pink-500 to-rose-600 text-white animate-pulse shadow-lg' 
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                    }`}>
                      {isCompleted ? '✓' : stage.icon}
                    </div>
                    <span className={`text-xs text-center leading-tight ${
                      isCurrent ? 'font-bold text-pink-600 dark:text-pink-300' : 'text-slate-600 dark:text-slate-400'
                    }`}>
                      {stage.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Last Updated By */}
      {order.last_updated_by && (
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-pink-500 dark:text-pink-400" />
              <span className="text-xs text-slate-500 dark:text-slate-400">آخر تحديث بواسطة</span>
            </div>
            <p className={`text-sm font-semibold ${
              order.last_updated_by === 'system' ? 'text-blue-600 dark:text-blue-400' :
              order.last_updated_by === 'auto-time-progress' ? 'text-purple-600 dark:text-purple-400' :
              order.last_updated_by.startsWith('admin:') ? 'text-orange-600 dark:text-orange-400' :
              'text-slate-700 dark:text-slate-300'
            }`}>
              {formatUpdatedBy(order.last_updated_by)}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
