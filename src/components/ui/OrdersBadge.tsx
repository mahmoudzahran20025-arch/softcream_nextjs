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
  const countRef = useRef(0)  // ✅ NEW: Ref للـ count الحالي، للـ check قبل update

  useEffect(() => {
    const updateCount = () => {
      const count = storage.getActiveOrdersCount()
      // ✅ NEW: Update فقط إذا تغير الـ count – منع re-renders زائدة
      if (count !== countRef.current) {
        countRef.current = count
        setActiveOrdersCount(count)
        console.log('🔄 OrdersBadge: Active orders count updated:', count)  // Log أقل
      } else {
        console.log('⏭️ OrdersBadge: Count unchanged, skipping update')  // Optional debug
      }
    }

    // Initial load
    updateCount()

    // Listen for orders updates
    const handleOrdersUpdated = (event: any) => {
      console.log('📢 OrdersBadge: Received ordersUpdated event:', event?.detail)
      updateCount()  // ✅ الآن آمن، مش هيعمل re-render كل مرة
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('ordersUpdated', handleOrdersUpdated as EventListener)
      return () => {
        window.removeEventListener('ordersUpdated', handleOrdersUpdated as EventListener)
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

  // ✅ NEW: أزل الـ console.log على كل render – مش محتاج بعد الإصلاح
  // console.log('🎯 OrdersBadge render - count:', activeOrdersCount)

  if (activeOrdersCount === 0) {
    return null
  }

  return (
    <button
      onClick={handleClick}
      className={`fixed bottom-6 right-6 z-[9000] bg-gradient-to-br from-purple-600 via-pink-600 to-red-500 text-white rounded-full p-4 shadow-2xl hover:shadow-purple-500/50 transition-all hover:scale-110 active:scale-95 group ${className}`}
      aria-label={`${activeOrdersCount} active orders`}
      style={{ zIndex: 9000 }} // ✅ Ensure z-index is applied
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