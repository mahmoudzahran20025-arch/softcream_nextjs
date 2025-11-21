'use client'

import { Plus, Minus } from 'lucide-react'

interface QuantitySelectorProps {
  quantity: number
  onIncrease: () => void
  onDecrease: () => void
  min?: number
  max?: number
  size?: 'sm' | 'lg'
  disabled?: boolean
}

export default function QuantitySelector({
  quantity,
  onIncrease,
  onDecrease,
  min = 1,
  max,
  size = 'sm',
  disabled = false
}: QuantitySelectorProps) {
  const isMinReached = quantity <= min
  const isMaxReached = max !== undefined && quantity >= max

  const sizeClasses = {
    sm: {
      container: 'gap-1',
      button: 'w-7 h-7 rounded-lg',
      icon: 14,
      text: 'text-sm'
    },
    lg: {
      container: 'gap-2',
      button: 'w-9 h-9 rounded-lg',
      icon: 16,
      text: 'text-base'
    }
  }

  const styles = sizeClasses[size]

  return (
    <div className={`flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1.5 ${styles.container}`}>
      <button
        onClick={onDecrease}
        disabled={disabled || isMinReached}
        className={`${styles.button} bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-all active:scale-95`}
        aria-label="تقليل الكمية"
      >
        <Minus size={styles.icon} className="text-slate-700 dark:text-slate-200" />
      </button>
      
      <span className={`min-w-[32px] text-center font-bold ${styles.text} text-slate-900 dark:text-white`}>
        {quantity}
      </span>
      
      <button
        onClick={onIncrease}
        disabled={disabled || isMaxReached}
        className={`${styles.button} bg-[#FF6B9D] hover:bg-[#FF5A8E] text-white flex items-center justify-center transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed`}
        aria-label="زيادة الكمية"
      >
        <Plus size={styles.icon} />
      </button>
    </div>
  )
}
