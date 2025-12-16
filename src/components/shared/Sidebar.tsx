'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '@/providers/CartProvider'
import { useTheme } from '@/providers/ThemeProvider'
import { useLanguage } from '@/providers/LanguageProvider'
import { useWindowEvent } from '@/hooks/useWindowEvent'
import { storage } from '@/lib/storage.client'
import { useFavorites } from '@/hooks/useFavorites'
import {
  X, ShoppingCart, Moon, Sun, Globe, Phone, Clock, Sparkles,
  ShoppingBag, User, Heart, Home
} from 'lucide-react'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  onOpenCart?: () => void
  onOpenMyOrders?: () => void
  onOpenFavorites?: () => void
}

export default function Sidebar({ isOpen, onClose, onOpenCart, onOpenMyOrders, onOpenFavorites }: SidebarProps) {
  const { getCartCount } = useCart()
  const { theme, toggleTheme } = useTheme()
  const { language, toggleLanguage, t } = useLanguage()

  const [userData, setUserData] = useState<any>(null)
  const [activeOrdersCount, setActiveOrdersCount] = useState(0)
  const [customerProfile, setCustomerProfile] = useState<any>(null)

  // ✅ Hook for Favorites
  const { favoritesCount } = useFavorites()

  const cartCount = getCartCount()

  // Define update functions primarily to avoid 'used before declaration'
  const updateUserData = () => {
    if (typeof window !== 'undefined') setUserData(storage.getUserData())
  }

  const updateCustomerProfile = () => {
    if (typeof window !== 'undefined') setCustomerProfile(storage.getCustomerProfile())
  }

  const updateOrdersCount = () => {
    if (typeof window !== 'undefined') {
      const allOrders = storage.getOrders()
      setActiveOrdersCount(allOrders.length)
    }
  }

  // Load user data
  useEffect(() => {
    updateUserData()
    updateCustomerProfile()
    updateOrdersCount()
  }, [])

  useWindowEvent('ordersUpdated', () => {
    updateOrdersCount()
    updateCustomerProfile()
  })

  useWindowEvent('userDataUpdated', updateUserData)

  const isRTL = language === 'ar'

  // Animation variants
  const sidebarVariants: any = {
    closed: { x: isRTL ? '100%' : '-100%', opacity: 0 },
    open: {
      x: 0,
      opacity: 1,
      transition: { type: 'spring', damping: 25, stiffness: 300, staggerChildren: 0.05, delayChildren: 0.1 }
    }
  }

  const itemVariants: any = {
    closed: { x: isRTL ? 20 : -20, opacity: 0 },
    open: { x: 0, opacity: 1 }
  }

  const handleNavClick = (action: () => void) => {
    onClose()
    setTimeout(action, 300)
  }

  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
          />

          {/* Sidebar */}
          <motion.aside
            variants={sidebarVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className={`fixed top-0 ${isRTL ? 'right-0' : 'left-0'} h-full w-[300px] z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-r border-l border-white/20 shadow-2xl flex flex-col`}
            style={{ fontFamily: 'Cairo, sans-serif' }}
          >
            {/* Header Area */}
            <div className="p-6 pb-2">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-white/50 shadow-lg">
                    <img src="/asset/softcreamlogo.jpg" alt="Logo" className="object-cover w-full h-full" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-pink-500">
                      SOFTCREAM
                    </h2>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:rotate-90 transition-transform duration-300"
                >
                  <X className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                </button>
              </div>

              {/* User Greeting Card */}
              <motion.div
                variants={itemVariants}
                className="bg-gradient-to-br from-pink-500/10 to-purple-500/10 dark:from-pink-500/20 dark:to-purple-500/20 p-4 rounded-2xl flex items-center gap-4 mb-4"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
                  {(userData?.name || customerProfile?.name) ? <User className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                    {language === 'ar' ? 'مرحباً بك' : 'Welcome back'}
                  </p>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white line-clamp-1">
                    {userData?.name || customerProfile?.name || (language === 'ar' ? 'ضيفنا العزيز' : 'Guest')}
                  </h3>
                </div>
              </motion.div>
            </div>

            {/* Navigation Scroll Area */}
            <div className="flex-1 overflow-y-auto px-4 py-2 space-y-6">

              {/* Section: Discover */}
              <div className="space-y-2">
                <p className="px-3 text-xs font-bold text-slate-400 uppercase tracking-widest opacity-80">
                  {language === 'ar' ? 'اكتشف' : 'Discover'}
                </p>
                <NavItem
                  icon={Home}
                  label={language === 'ar' ? 'الرئيسية' : 'Home'}
                  href="/"
                  onClick={onClose}
                  variants={itemVariants}
                />
                <NavItem
                  icon={Sparkles}
                  label={language === 'ar' ? 'المنتجات' : 'Products'}
                  href="/products"
                  onClick={onClose}
                  active
                  variants={itemVariants}
                />
                <NavItem
                  icon={Heart}
                  label={language === 'ar' ? 'المفضلة' : 'Favorites'}
                  onClick={() => handleNavClick(() => onOpenFavorites?.())}
                  variants={itemVariants}
                  badge={favoritesCount}
                  badgeColor="bg-red-500"
                />
              </div>

              {/* Section: Personal */}
              <div className="space-y-2">
                <p className="px-3 text-xs font-bold text-slate-400 uppercase tracking-widest opacity-80">
                  {language === 'ar' ? 'حسابي' : 'Personal'}
                </p>
                <NavItem
                  icon={ShoppingCart}
                  label={t('navCart') || 'السلة'}
                  onClick={() => handleNavClick(() => onOpenCart?.())}
                  badge={cartCount}
                  variants={itemVariants}
                />
                <NavItem
                  icon={ShoppingBag}
                  label={language === 'ar' ? 'طلباتي' : 'My Orders'}
                  onClick={() => handleNavClick(() => onOpenMyOrders?.())}
                  badge={activeOrdersCount}
                  badgeColor="bg-green-500"
                  variants={itemVariants}
                />
              </div>

              {/* Section: Support */}
              <div className="space-y-2">
                <p className="px-3 text-xs font-bold text-slate-400 uppercase tracking-widest opacity-80">
                  {language === 'ar' ? 'دعم' : 'Support'}
                </p>
                <NavItem
                  icon={Phone}
                  label={t('footerNavContact') || 'تواصل معنا'}
                  onClick={() => handleNavClick(() => scrollTo('footer-contact'))}
                  variants={itemVariants}
                />
                <NavItem
                  icon={UtcClock}
                  label={t('footerNavHours') || 'ساعات العمل'}
                  onClick={() => handleNavClick(() => scrollTo('footer-hours'))}
                  variants={itemVariants}
                />
              </div>

            </div>

            {/* Footer: Settings */}
            <motion.div variants={itemVariants} className="p-4 bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-md border-t border-slate-200 dark:border-slate-800">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={toggleTheme}
                  className="flex items-center justify-center gap-2 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  {theme === 'dark' ? <Moon className="w-4 h-4 text-purple-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
                  <span className="text-xs font-bold font-sans">
                    {theme === 'dark' ? 'Dark' : 'Light'}
                  </span>
                </button>
                <button
                  onClick={toggleLanguage}
                  className="flex items-center justify-center gap-2 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  <Globe className="w-4 h-4 text-blue-500" />
                  <span className="text-xs font-bold font-sans">
                    {language === 'ar' ? 'English' : 'العربية'}
                  </span>
                </button>
              </div>
            </motion.div>

          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}

// Sub-component for clean rendering
function NavItem({ icon: Icon, label, href, onClick, badge, badgeColor, active, variants }: any) {
  const content = (
    <div className={`flex items-center gap-3 w-full p-2.5 rounded-xl transition-all duration-200 group ${active ? 'bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'}`}>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${active ? 'bg-pink-100 dark:bg-pink-900/40 text-pink-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white'}`}>
        <Icon className="w-4 h-4" />
      </div>
      <span className="flex-1 font-bold text-sm">
        {label}
      </span>
      {badge !== undefined && badge > 0 && (
        <span className={`${badgeColor || 'bg-pink-500'} text-white text-[10px] font-bold px-1.5 min-w-[18px] h-[18px] rounded-full flex items-center justify-center shadow-sm`}>
          {badge}
        </span>
      )}
    </div>
  )

  if (href) {
    return (
      <motion.div variants={variants}>
        <Link href={href} onClick={onClick} className="block">
          {content}
        </Link>
      </motion.div>
    )
  }

  return (
    <motion.button variants={variants} onClick={onClick} className="block w-full text-start">
      {content}
    </motion.button>
  )
}

const UtcClock = Clock // Alias for cleaner usage in array
