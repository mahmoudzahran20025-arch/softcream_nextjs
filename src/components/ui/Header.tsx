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



  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-40 min-h-[70px]">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-2 max-w-7xl mx-auto">

          {/* Menu Button - Toggle Sidebar */}
          <button
            onClick={onOpenSidebar}
            className="p-3 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-lg border border-pink-100 dark:border-gray-700 hover:border-pink-300 group"
            aria-label={isSidebarOpen ? "Close menu" : "Open menu"}
          >
            <Menu className="w-6 h-6 text-[#FF4979] dark:text-[#FF6B9D] group-hover:scale-110 transition-transform" />
          </button>

          {/* 🎨 BRAND LOGO - Professional Design */}
          <div className="flex-1 flex justify-center items-center">
            <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>

              {/* Logo Image - Enhanced Glow */}
              <div className="h-14 w-14 flex-shrink-0 relative group">
                <div className="absolute inset-0 bg-pink-500/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                <img
                  src="/asset/softcreamlogo.jpg"
                  alt="Soft Cream"
                  className="relative h-full w-full object-contain rounded-full shadow-lg ring-2 ring-white/50 dark:ring-white/10 md:transition-transform md:duration-500 md:group-hover:scale-110 md:group-hover:rotate-6"
                />
              </div>

              {/* Brand Text - Typographic Logo (Iteration V) */}
              <div className="hidden min-[380px]:flex flex-col items-start justify-center select-none" dir="ltr">
                <div className="leading-none flex items-center gap-0.5">
                  <span className="text-2xl md:text-3xl font-bold tracking-tighter text-slate-900 dark:text-white">
                    SOFT
                  </span>
                  <span className="text-2xl md:text-3xl font-black tracking-tighter text-[#FF4979]">
                    CREAM
                  </span>
                  {/* Modern Accent Dot */}
                  <div className="w-1.5 h-1.5 rounded-full bg-[#FF4979] mb-1 ml-0.5 animate-pulse"></div>
                </div>
                <span className="text-[10px] mobile-s:text-[8px] font-semibold tracking-[0.35em] text-slate-400 dark:text-slate-500 uppercase mt-0.5 ml-0.5">
                  Ice Cream & Dessert
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="p-3 bg-white dark:bg-gray-800 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-lg border border-pink-100 dark:border-gray-700 hover:border-pink-300 flex items-center gap-1 group"
              aria-label="Toggle language"
              title={language === 'ar' ? 'English' : 'العربية'}
            >
              <Globe className="w-5 h-5 text-[#FF4979] dark:text-[#FF6B9D] group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-gray-700 dark:text-gray-200 group-hover:text-[#FF4979] transition-colors">{language === 'ar' ? 'EN' : 'AR'}</span>
            </button>

            {/* Theme Toggle - Hidden on small screens */}
            <button
              onClick={toggleTheme}
              className="hidden sm:flex p-3 bg-white dark:bg-gray-800 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-lg border border-pink-100 dark:border-gray-700 hover:border-pink-300 group"
              aria-label="Toggle theme"
              title={isDark ? 'Light Mode' : 'Dark Mode'}
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-amber-500 group-hover:scale-110 transition-transform" />
              ) : (
                <Moon className="w-5 h-5 text-[#FF4979] group-hover:scale-110 transition-transform" />
              )}
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

