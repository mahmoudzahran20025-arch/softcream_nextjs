'use client'

import { ShoppingCart, Menu, Sun, Moon, Globe } from 'lucide-react'
import { useTheme } from '@/providers/ThemeProvider'
import { useLanguage } from '@/providers/LanguageProvider'
import { useCart } from '@/providers/CartProvider'
import { useState, useEffect } from 'react'

interface HeaderProps {
  onOpenSidebar?: () => void
  isSidebarOpen?: boolean
  onOpenCart?: () => void
}

export default function Header({ onOpenSidebar, isSidebarOpen, onOpenCart }: HeaderProps) {
  const { toggleTheme, isDark } = useTheme()
  const { language, toggleLanguage, isRTL } = useLanguage()
  const { getCartCount } = useCart()
  
  // Fix hydration error: only show count on client side
  const [displayCount, setDisplayCount] = useState(0)
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
    setDisplayCount(getCartCount())
  }, [getCartCount])

  const brandText = "SOFTCREAM"

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-40 min-h-[70px]">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-2 max-w-7xl mx-auto">
          
          {/* Menu Button - Toggle Sidebar */}
          <button
            onClick={onOpenSidebar}
            className="p-3 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors shadow-lg"
            aria-label={isSidebarOpen ? "Close menu" : "Open menu"}
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* 🎨 BRAND LOGO - Professional Design */}
          <div className="flex-1 flex justify-center items-center">
            <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
              
              {/* Logo Image - Enhanced Glow */}
              <div className="h-12 w-auto flex-shrink-0">
                <img 
                  src="https://i.ibb.co/GfqnJKpV/softcreamlogo.png"
                  alt="Soft Cream" 
                  className="h-full w-auto object-contain animate-pulse-glow transition-transform hover:scale-110 drop-shadow-2xl" 
                  style={{
                    filter: 'drop-shadow(0 4px 20px rgba(255, 107, 157, 0.6))'
                  }}
                />
              </div>

              {/* Brand Text - Animated Letters */}
              <div className="flex items-center gap-0.5" dir="ltr">
                {Array.from(brandText).map((letter, i) => (
                  <span
                    key={i}
                    className="font-bold text-xl md:text-2xl animate-text-wave-fast uppercase tracking-tight transition-all hover:scale-125 cursor-default"
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
          
          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="p-3 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors shadow-lg flex items-center gap-1"
              aria-label="Toggle language"
              title={language === 'ar' ? 'English' : 'العربية'}
            >
              <Globe className="w-5 h-5" />
              <span className="text-xs font-bold">{language === 'ar' ? 'EN' : 'AR'}</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-3 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors shadow-lg"
              aria-label="Toggle theme"
              title={isDark ? 'Light Mode' : 'Dark Mode'}
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Cart Button - Brand Pink */}
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
      </div>
    </header>
  )
}

