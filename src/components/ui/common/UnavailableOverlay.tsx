'use client'

import { XCircle } from 'lucide-react'

interface UnavailableOverlayProps {
  /** Variant style for different card types */
  variant?: 'default' | 'rounded' | 'premium'
  /** Custom class name */
  className?: string
}

/**
 * UnavailableOverlay - Overlay for unavailable products
 * =====================================================
 * Displays "غير متاح" overlay with XCircle icon and disables interactions
 * 
 * Requirements: 4.3
 * - Display "غير متاح" overlay with XCircle icon
 * - Disable interactions
 */
export default function UnavailableOverlay({ 
  variant = 'default',
  className = '' 
}: UnavailableOverlayProps) {
  const variantClasses = {
    default: 'rounded-xl',
    rounded: 'rounded-3xl',
    premium: 'rounded-3xl'
  }

  return (
    <div 
      className={`
        absolute inset-0 bg-black/50 dark:bg-black/60 backdrop-blur-sm 
        flex items-center justify-center z-10
        ${variantClasses[variant]}
        ${className}
      `}
    >
      <div className="bg-red-500/90 dark:bg-red-600/90 text-white px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
        <XCircle size={16} className="flex-shrink-0" />
        <span className="font-bold text-sm">غير متاح</span>
      </div>
    </div>
  )
}
