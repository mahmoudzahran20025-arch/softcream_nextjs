'use client'

import { ShoppingCart, Menu, ArrowRight } from 'lucide-react'
import { useCart } from '@/providers/CartProvider'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface HeaderCompactProps {
  onOpenSidebar?: () => void
  onOpenCart?: () => void
  showBackButton?: boolean
  onBack?: () => void
}

export default function HeaderCompact({
  onOpenSidebar,
  onOpenCart,
  showBackButton = false,
  onBack
}: HeaderCompactProps) {
  const { getCartCount } = useCart()
  const router = useRouter()

  // Fix hydration error: only show count on client side
  const [displayCount, setDisplayCount] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setDisplayCount(getCartCount())
  }, [getCartCount])

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      router.push('/')
    }
  }

  const brandText = "SOFTCREAM"

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md min-h-[70px]">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-2 max-w-7xl mx-auto">

          {/* Left: Menu or Back Button */}
          {showBackButton ? (
            <button
              onClick={handleBack}
              className="p-3 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors shadow-lg"
              aria-label="Back to home"
            >
              <ArrowRight className="w-6 h-6" />
            </button>
          ) : (
            <button
              onClick={onOpenSidebar}
              className="p-3 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors shadow-lg"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          )}

          {/* Center: BRAND LOGO */}
          <div className="flex-1 flex justify-center items-center">
            <div className="flex items-center gap-2">

              {/* Logo Image */}
              <div className="h-10 w-auto flex-shrink-0">
                <img
                  src="/asset/softcreamlogo.jpg"
                  alt="Soft Cream"
                  className="h-full w-auto object-contain animate-pulse-glow transition-transform hover:scale-110 drop-shadow-2xl rounded-full"
                  style={{
                    filter: 'drop-shadow(0 4px 20px rgba(255, 107, 157, 0.6))'
                  }}
                />
              </div>

              {/* Brand Text - Hidden on very small screens */}
              <div className="hidden xs:flex items-center gap-0.5" dir="ltr">
                {Array.from(brandText).map((letter, i) => (
                  <span
                    key={i}
                    className="font-bold text-lg animate-text-wave-fast uppercase tracking-tight transition-all hover:scale-125 cursor-default"
                    style={{
                      animationDelay: `${i * 0.05}s`,
                      display: 'inline-block'
                    }}
                  >
                    {letter}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Cart Button Only */}
          <button
            onClick={onOpenCart}
            className="relative p-3 bg-gradient-to-r from-[#FF6B9D] to-[#FF5A8E] text-white rounded-full hover:from-[#FF5A8E] hover:to-[#FF4979] transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
            aria-label="Open cart"
          >
            <ShoppingCart className="w-6 h-6" strokeWidth={2.5} />
            {mounted && displayCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[24px] h-6 px-1.5 flex items-center justify-center animate-pulse shadow-lg border-2 border-white">
                {displayCount > 9 ? '9+' : displayCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  )
}
