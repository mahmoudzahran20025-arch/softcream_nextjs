'use client'

import { Tag } from 'lucide-react'

interface DiscountBadgeProps {
  /** Discount percentage (e.g., 20 for 20%) */
  discountPercentage: number
  /** Size variant */
  size?: 'sm' | 'md' | 'lg'
  /** Custom class name */
  className?: string
}

/**
 * DiscountBadge - Badge showing discount percentage
 * =================================================
 * Displays discount badge with Tag icon
 * 
 * Requirements: 4.2
 * - Display discount badge with Tag icon
 */
export default function DiscountBadge({ 
  discountPercentage,
  size = 'sm',
  className = '' 
}: DiscountBadgeProps) {
  if (!discountPercentage || discountPercentage <= 0) return null

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm'
  }

  const iconSizes = {
    sm: 10,
    md: 12,
    lg: 14
  }

  return (
    <div 
      className={`
        bg-red-500 dark:bg-red-600 text-white rounded-full 
        font-bold shadow-lg flex items-center gap-1
        ${sizeClasses[size]}
        ${className}
      `}
    >
      <Tag size={iconSizes[size]} className="flex-shrink-0" />
      <span>-{discountPercentage}%</span>
    </div>
  )
}
