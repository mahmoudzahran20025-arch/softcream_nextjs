'use client'

import { useEffect } from 'react'
import { ShoppingBag } from 'lucide-react'
import { useOrdersStore } from '@/stores/ordersStore'

interface OrdersBadgeProps {
  onClick?: () => void
  className?: string
}

/**
 * OrdersBadge Component - REFACTORED with OrdersStore
 * Displays active orders count badge as a floating button
 * Uses Zustand store instead of custom events
 */
export default function OrdersBadge({ onClick, className = '' }: OrdersBadgeProps) {
  const { orders, loadOrders } = useOrdersStore()
  const activeOrdersCount = orders.length

  useEffect(() => {
    // Initial load
    loadOrders()
  }, [loadOrders])

  const handleClick = () => {
    if (onClick) {
      onClick()
    }
    // Note: onClick now uses ModalStore in PageContentClient
    // No need for custom events anymore
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