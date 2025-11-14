'use client'

import { useState, useEffect } from 'react'
import { useCart } from '@/providers/CartProvider'
import { useTheme } from '@/providers/ThemeProvider'
import { storage } from '@/lib/storage.client'
import {
  X, ShoppingCart, Package, Moon, Sun, Globe, Phone, Clock, Sparkles, 
  ShoppingBag, User, ChevronRight, Utensils, Heart
} from 'lucide-react'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { getCartCount } = useCart()
  const { language, toggleLanguage, theme, toggleTheme, t } = useTheme()
  
  const [userData, setUserData] = useState<any>(null)
  const [activeOrdersCount, setActiveOrdersCount] = useState(0)
  
  const cartCount = getCartCount()

  // Load user data and orders count
  useEffect(() => {
    updateUserData()
    updateOrdersCount()
  }, [])

  useEffect(() => {
    const handleOrdersUpdated = () => updateOrdersCount()
    const handleUserDataUpdated = () => updateUserData()

    if (typeof window !== 'undefined') {
      window.addEventListener('ordersUpdated', handleOrdersUpdated)
      window.addEventListener('userDataUpdated', handleUserDataUpdated)
      
      return () => {
        window.removeEventListener('ordersUpdated', handleOrdersUpdated)
        window.removeEventListener('userDataUpdated', handleUserDataUpdated)
      }
    }
  }, [])

  const updateUserData = () => {
    if (typeof window !== 'undefined') {
      const data = storage.getUserData()
      setUserData(data)
    }
  }

  const updateOrdersCount = () => {
    if (typeof window !== 'undefined') {
      const count = storage.getActiveOrdersCount()
      setActiveOrdersCount(count)
    }
  }

  const handleCartClick = () => {
    onClose()
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('open-react-cart'))
      }
    }, 300)
  }

  const handleOrdersClick = () => {
    onClose()
    
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        const allOrders = storage.getOrders()
        
        if (allOrders.length === 0) {
          const toastEvent = new CustomEvent('show-toast', {
            detail: {
              message: language === 'ar' ? 'لا توجد طلبات سابقة' : 'No previous orders',
              type: 'info'
            }
          })
          window.dispatchEvent(toastEvent)
        } else {
          window.dispatchEvent(new Event('open-my-orders-modal'))
        }
      }
    }, 300)
  }

  // Lock scroll when sidebar is open
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen && typeof window !== 'undefined') {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      if (typeof window !== 'undefined') {
        document.removeEventListener('keydown', handleEscape)
        document.body.style.overflow = ''
      }
    }
  }, [isOpen, onClose])

  const handleNavClick = (sectionId: string) => {
    onClose()
    
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        const element = document.getElementById(sectionId)
        if (element) {
          element.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          })
        }
      }
    }, 300)
  }

  const isRTL = language === 'ar'

  const navItems = [
    { 
      icon: Package, 
      label: t('navMenu') || 'المنيو', 
      id: 'menu', 
      onClick: () => handleNavClick('menu') 
    },
    { 
      icon: ShoppingCart, 
      label: t('navCart') || 'السلة', 
      id: 'cart', 
      badge: cartCount, 
      onClick: handleCartClick 
    },
    { 
      icon: ShoppingBag, 
      label: language === 'ar' ? 'طلباتي' : 'My Orders', 
      id: 'orders', 
      badge: activeOrdersCount, 
      badgeColor: 'bg-green-500', 
      onClick: handleOrdersClick 
    },
    { 
      icon: Utensils, 
      label: language === 'ar' ? 'خدمة الكاتيرينج' : 'Catering Service', 
      id: 'catering', 
      highlight: true, 
      onClick: () => handleNavClick('catering') 
    },
    { 
      icon: Clock, 
      label: t('footerNavHours') || 'ساعات العمل', 
      id: 'footer-hours', 
      onClick: () => handleNavClick('footer-hours') 
    },
    { 
      icon: Sparkles, 
      label: t('footerNavHealthy') || 'معلومات صحية', 
      id: 'footer-health-info', 
      onClick: () => handleNavClick('footer-health-info') 
    },
    { 
      icon: Phone, 
      label: t('footerNavContact') || 'تواصل معنا', 
      id: 'footer-contact', 
      onClick: () => handleNavClick('footer-contact') 
    }
  ]

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/40 z-40 transition-opacity duration-200"
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside
        className={`fixed top-0 ${isRTL ? 'right-0' : 'left-0'} h-full w-72 bg-white dark:bg-gray-900 shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : isRTL ? 'translate-x-full' : '-translate-x-full'
        }`}
        style={{ fontFamily: 'Cairo, sans-serif' }}
        role="dialog"
        aria-modal="true"
      >
        
        {/* Header */}
        <div className="flex-shrink-0 p-5 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center transition-colors"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>

            {/* Logo */}
            <div className="flex items-center gap-2">
              <img
                src="https://i.ibb.co/GfqnJKpV/softcreamlogo.png"
                alt="Logo"
                className="w-10 h-10 object-contain"
              />
              <div className={isRTL ? 'text-right' : 'text-left'}>
                <h2 className="text-base font-black bg-gradient-to-r from-[#A3164D] to-purple-600 bg-clip-text text-transparent">
                  SOFTCREAM
                </h2>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold">
                  {language === 'ar' ? 'أطيب آيس كريم' : 'Best Ice Cream'}
                </p>
              </div>
            </div>
          </div>

          {/* Welcome Section */}
          <div className="rounded-2xl bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 dark:from-pink-900/20 dark:via-purple-900/20 dark:to-blue-900/20 p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#A3164D] to-purple-600 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                {userData?.name ? (
                  <User className="w-6 h-6 text-white" />
                ) : (
                  <Heart className="w-6 h-6 text-white" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                {userData?.name ? (
                  <>
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                      {language === 'ar' ? 'مرحباً،' : 'Welcome,'}
                    </p>
                    <p className="text-sm font-black text-gray-900 dark:text-white truncate">
                      {userData.name}
                    </p>
                  </>
                ) : (
                  <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">
                    {language === 'ar' ? '👋 أهلاً بك في SOFTCREAM' : '👋 Welcome to SOFTCREAM'}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={item.onClick}
              className={`w-full flex items-center gap-3 p-3.5 rounded-2xl transition-colors duration-150 group relative ${
                item.highlight
                  ? 'bg-gradient-to-r from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 border border-orange-200 dark:border-orange-700'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors flex-shrink-0 ${
                item.highlight
                  ? 'bg-gradient-to-br from-orange-400 to-amber-500 shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-800 group-hover:bg-gradient-to-br group-hover:from-[#A3164D] group-hover:to-purple-600'
              }`}>
                <item.icon className={`w-5 h-5 transition-colors ${
                  item.highlight
                    ? 'text-white'
                    : 'text-gray-600 dark:text-gray-400 group-hover:text-white'
                }`} />
              </div>
              
              <span className={`text-sm font-bold flex-1 ${isRTL ? 'text-right' : 'text-left'} ${
                item.highlight
                  ? 'text-orange-900 dark:text-orange-200'
                  : 'text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white'
              }`}>
                {item.label}
              </span>
              
              {item.badge && item.badge > 0 && (
                <span className={`${item.badgeColor || 'bg-[#A3164D]'} text-white text-xs font-bold rounded-full min-w-[22px] h-5 px-2 flex items-center justify-center shadow-sm`}>
                  {item.badge}
                </span>
              )}
              
              <ChevronRight className={`w-4 h-4 text-gray-400 transition-all flex-shrink-0 ${
                isRTL ? 'rotate-180' : ''
              } group-hover:text-[#A3164D] ${isRTL ? 'group-hover:-translate-x-1' : 'group-hover:translate-x-1'}`} />
            </button>
          ))}
        </nav>

        {/* Footer - Settings */}
        <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div className="flex gap-2">
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 hover:from-blue-200 hover:to-cyan-200 dark:hover:from-blue-800/40 dark:hover:to-cyan-800/40 transition-colors shadow-sm"
            >
              <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-bold text-blue-900 dark:text-blue-200">
                {language === 'ar' ? 'EN' : 'AR'}
              </span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 hover:from-purple-200 hover:to-pink-200 dark:hover:from-purple-800/40 dark:hover:to-pink-800/40 transition-colors shadow-sm"
            >
              {theme === 'light' ? (
                <Moon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              ) : (
                <Sun className="w-4 h-4 text-yellow-500" />
              )}
              <span className="text-sm font-bold text-purple-900 dark:text-purple-200">
                {theme === 'light' ? (language === 'ar' ? 'داكن' : 'Dark') : (language === 'ar' ? 'فاتح' : 'Light')}
              </span>
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
