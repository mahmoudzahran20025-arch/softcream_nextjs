// ✅ StatusTimeline.tsx - Progress Bar & Stage Icons

'use client'

import { Loader2, RefreshCw, TrendingUp, Clock } from 'lucide-react'
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
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${
            (order.status === 'pending' || order.status === 'جديد') ? 'bg-yellow-500 animate-pulse' :
            (order.status === 'confirmed' || order.status === 'مؤكد') ? 'bg-green-500' :
            (order.status === 'cancelled' || order.status === 'ملغي') ? 'bg-red-500' : 'bg-blue-500'
          }`} />
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">حالة الطلب</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
              {getStatusLabel(order.status)}
            </p>
          </div>
        </div>
        <button 
          onClick={onRefresh} 
          disabled={isRefreshing} 
          className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 disabled:opacity-50 transition-all"
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
      {!FINAL_STATUSES.includes(order.status) && (
        <div className="space-y-4">
          {/* Progress Percentage */}
          {order.progress !== null && order.progress !== undefined && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">نسبة الإنجاز</span>
              </div>
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{order.progress}%</span>
            </div>
          )}
          
          {/* Progress Bar */}
          <div className="relative w-full bg-slate-100 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 h-full rounded-full transition-all duration-700 ease-out relative"
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
                        ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg scale-110' 
                        : isCurrent 
                          ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white animate-pulse shadow-lg' 
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
                    }`}>
                      {isCompleted ? '✓' : stage.icon}
                    </div>
                    <span className={`text-xs text-center leading-tight ${
                      isCurrent ? 'font-bold text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400'
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
              <Clock className="w-4 h-4 text-slate-400" />
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
