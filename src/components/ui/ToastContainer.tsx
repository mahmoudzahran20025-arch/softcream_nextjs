'use client'

import { useEffect, useState } from 'react'
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { useTheme } from '@/providers/ThemeProvider'

export default function ToastContainer() {
  const { toasts, removeToast } = useTheme()
  const [exitingToasts, setExitingToasts] = useState<Set<string>>(new Set())

  useEffect(() => {
    const timers = toasts.map((toast) => {
      if (toast.duration && toast.duration > 0) {
        return setTimeout(() => {
          // Trigger exit animation
          setExitingToasts(prev => new Set(prev).add(String(toast.id)))
          // Remove after animation completes (300ms)
          setTimeout(() => {
            removeToast(toast.id)
            setExitingToasts(prev => {
              const next = new Set(prev)
              next.delete(String(toast.id))
              return next
            })
          }, 300)
        }, toast.duration)
      }
      return null
    })

    return () => {
      timers.forEach((timer) => {
        if (timer) clearTimeout(timer)
      })
    }
  }, [toasts, removeToast])

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      case 'info':
      default:
        return <Info className="w-5 h-5 text-blue-500" />
    }
  }

  const getStyles = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
      case 'info':
      default:
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-[10000] space-y-2 max-w-sm pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-start gap-3 p-4 rounded-lg border shadow-lg pointer-events-auto transition-all duration-300 ${
            exitingToasts.has(String(toast.id))
              ? 'animate-out slide-out-to-right-full opacity-0'
              : 'animate-in slide-in-from-right-full'
          } ${getStyles(toast.type)}`}
        >
          <div className="flex-shrink-0 mt-0.5">{getIcon(toast.type)}</div>

          <div className="flex-1 min-w-0">
            {toast.title && (
              <p className="font-semibold text-slate-900 dark:text-white">{toast.title}</p>
            )}
            <p className="text-sm text-slate-700 dark:text-slate-300">{toast.message}</p>
          </div>

          <button
            onClick={() => removeToast(toast.id)}
            className="flex-shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            aria-label="إغلاق"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
