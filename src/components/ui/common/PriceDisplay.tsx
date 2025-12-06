'use client'

interface PriceDisplayProps {
  price: number
  oldPrice?: number
  currency?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function PriceDisplay({
  price,
  oldPrice,
  currency = 'ج.م',
  size = 'md',
  className = ''
}: PriceDisplayProps) {
  const sizeClasses = {
    sm: {
      price: 'text-base',
      currency: 'text-xs'
    },
    md: {
      price: 'text-lg',
      currency: 'text-sm'
    },
    lg: {
      price: 'text-2xl',
      currency: 'text-base'
    }
  }

  const styles = sizeClasses[size]

  // Check if className contains text color override
  const hasTextColor = className.includes('text-')

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Current Price */}
      <div className="flex items-baseline gap-1">
        <span className={`${styles.price} font-bold ${hasTextColor ? '' : oldPrice ? 'text-green-600 dark:text-green-400' : 'text-[#FF6B9D]'}`}>
          {price}
        </span>
        <span className={`${styles.currency} font-medium ${hasTextColor ? 'opacity-90' : 'text-slate-500 dark:text-slate-400'}`}>
          {currency}
        </span>
      </div>

      {/* Old Price (Enhanced Strikethrough) */}
      {oldPrice && oldPrice > price && (
        <div className="relative inline-flex items-center">
          {/* Background badge for better visibility */}
          <div className="bg-slate-100 dark:bg-slate-800/50 px-2 py-0.5 rounded-md">
            <span className="text-sm text-slate-500 dark:text-slate-400 font-medium relative">
              {oldPrice} {currency}
              {/* Enhanced strikethrough */}
              <span className="absolute inset-x-0 top-1/2 h-[2px] bg-red-500 dark:bg-red-400 transform -translate-y-1/2" />
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
