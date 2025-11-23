'use client'

import { useEffect, useState, useRef } from 'react'  // ✅ NEW: أضف useRef
import { ShoppingBag } from 'lucide-react'
import { storage } from '@/lib/storage.client'

interface OrdersBadgeProps {
  onClick?: () => void
  className?: string
}

/**
 * OrdersBadge Component
 * Displays active orders count badge as a floating button
 * Listens to 'ordersUpdated' event for real-time updates
 */
export default function OrdersBadge({ onClick, className = '' }: OrdersBadgeProps) {
  const [activeOrdersCount, setActiveOrdersCount] = useState(0)
  const countRef = useRef(0)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const updateCount = () => {
      // ✅ Show ALL orders, not just active ones
      const allOrders = storage.getOrders()
      const count = allOrders.length
      if (count !== countRef.current) {
        countRef.current = count
        setActiveOrdersCount(count)
        console.log('🎯 OrdersBadge: Updated count:', count)
      }
    }

    // Initial load
    updateCount()

    // Debounced update handler - prevents rapid re-renders
    const handleOrdersUpdated = () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
      debounceTimerRef.current = setTimeout(() => {
        updateCount()
      }, 300)
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('ordersUpdated', handleOrdersUpdated as EventListener)
      return () => {
        window.removeEventListener('ordersUpdated', handleOrdersUpdated as EventListener)
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current)
        }
      }
    }
  }, [])

  const handleClick = () => {
    if (onClick) {
      onClick()
    } else {
      // Dispatch custom event to open MyOrdersModal
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('open-my-orders-modal'))
      }
    }
  }

  const isVisible = activeOrdersCount > 0

  return (
    <button
      onClick={handleClick}
      className={`fixed bottom-6 right-6 z-[9000] bg-gradient-to-br from-purple-600 via-pink-600 to-red-500 text-white rounded-full p-4 shadow-2xl hover:shadow-purple-500/50 transition-all hover:scale-110 active:scale-95 group ${className} ${
        isVisible 
          ? 'opacity-100 translate-y-0 pointer-events-auto' 
          : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
      aria-label={`${activeOrdersCount} active orders`}
      aria-hidden={!isVisible}
      style={{ 
        zIndex: 9000,
        willChange: 'transform, opacity'
      }}
    >
      <div className="relative">
        <ShoppingBag className="w-6 h-6 group-hover:rotate-12 transition-transform" />
        {activeOrdersCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-black rounded-full w-6 h-6 flex items-center justify-center animate-pulse shadow-lg border-2 border-white">
            {activeOrdersCount > 9 ? '9+' : activeOrdersCount}
          </span>
        )}
      </div>
    </button>
  )
}