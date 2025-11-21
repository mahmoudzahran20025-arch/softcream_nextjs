'use client'

interface PriceDisplayProps {
  price: number
  currency?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function PriceDisplay({
  price,
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
    <div className={`flex items-baseline gap-1 ${className}`}>
      <span className={`${styles.price} font-bold ${hasTextColor ? '' : 'text-[#FF6B9D]'}`}>
        {price}
      </span>
      <span className={`${styles.currency} font-medium ${hasTextColor ? 'opacity-90' : 'text-slate-500 dark:text-slate-400'}`}>
        {currency}
      </span>
    </div>
  )
}
