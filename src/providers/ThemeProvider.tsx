'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { storage } from '@/lib/storage.client'

/**
 * ThemeProvider - i18n, Theme & Toast Management for Next.js
 * 
 * ✅ Replaces: GlobalProvider.jsx from React SPA
 * ✅ Features: Language switching (AR/EN), Theme switching (Light/Dark), Translation function, Toast notifications
 * ✅ Uses storage.client.ts for persistence
 */

// ✅ Lazy load translation data to reduce initial bundle size
// Translations are loaded on-demand when first accessed
let translationsCache: any = null

async function loadTranslations() {
  if (translationsCache) return translationsCache
  
  const [translationsData, translationsDataAdditions] = await Promise.all([
    import('@/data/translations-data'),
    import('@/data/translations-data-additions')
  ])
  
  translationsCache = {
    ar: { ...translationsData.translationsData.ar, ...translationsDataAdditions.translationsDataAdditions.ar },
    en: { ...translationsData.translationsData.en, ...translationsDataAdditions.translationsDataAdditions.en }
  }
  
  return translationsCache
}

interface Toast {
  id: number
  type: 'info' | 'success' | 'warning' | 'error'
  title?: string
  message: string
  duration?: number
}

interface ThemeContextType {
  // Language
  language: 'ar' | 'en'
  setLanguage: (lang: 'ar' | 'en') => void
  toggleLanguage: () => void
  isRTL: boolean
  
  // Theme
  theme: 'light' | 'dark'
  setTheme: (theme: 'light' | 'dark') => void
  toggleTheme: () => void
  isDark: boolean
  
  // Translation
  t: (key: string, params?: Record<string, any>) => string
  
  // Toast
  toasts: Toast[]
  showToast: (options: Omit<Toast, 'id'>) => number
  removeToast: (id: number) => void
  clearToasts: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}

// For backward compatibility
export const useGlobal = useTheme

interface ThemeProviderProps {
  children: ReactNode
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  // ========================================
  // State
  // ========================================
  
  // Language State - Default to 'en' during SSR/Hydration
  const [language, setLanguageState] = useState<'ar' | 'en'>('en')
  // تم الاحتفاظ بهذه الحالة للاستخدام المستقبلي - قد تُستخدم للتحقق من حالة hydration
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isLanguageHydrated, setIsLanguageHydrated] = useState(false)

  // Theme State - Default to 'light' during SSR/Hydration
  const [theme, setThemeState] = useState<'light' | 'dark'>('light')
  // تم الاحتفاظ بهذه الحالة للاستخدام المستقبلي - قد تُستخدم للتحقق من حالة hydration
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isThemeHydrated, setIsThemeHydrated] = useState(false)
  
  // استخدام void لإخماد تحذير TypeScript
  void isLanguageHydrated
  void isThemeHydrated

  // Toast State
  const [toasts, setToasts] = useState<Toast[]>([])

  // ========================================
  // Language Management
  // ========================================
  
  const setLanguage = useCallback((newLang: 'ar' | 'en') => {
    if (newLang !== 'ar' && newLang !== 'en') {
      console.error('Invalid language:', newLang)
      return
    }

    setLanguageState(newLang)
    
    // Save to storage
    if (typeof window !== 'undefined') {
      storage.setLang(newLang)
      
      // Update HTML attributes
      document.documentElement.lang = newLang
      document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr'
      
      // Dispatch event for backward compatibility
      window.dispatchEvent(new CustomEvent('language-changed', {
        detail: { language: newLang }
      }))
      
      console.log('✅ Language changed to:', newLang)
    }
  }, [])

  const toggleLanguage = useCallback(() => {
    const newLang = language === 'ar' ? 'en' : 'ar'
    setLanguage(newLang)
  }, [language, setLanguage])

  // ========================================
  // Theme Management
  // ========================================
  
  const setTheme = useCallback((newTheme: 'light' | 'dark') => {
    if (newTheme !== 'light' && newTheme !== 'dark') {
      console.error('Invalid theme:', newTheme)
      return
    }

    setThemeState(newTheme)
    
    // Save to storage
    if (typeof window !== 'undefined') {
      storage.setTheme(newTheme)
      
      // Update html and body class for Tailwind dark mode
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark')
        document.body.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
        document.body.classList.remove('dark')
      }
      
      // Dispatch event for backward compatibility
      window.dispatchEvent(new CustomEvent('theme-changed', {
        detail: { theme: newTheme }
      }))
      
      console.log('✅ Theme changed to:', newTheme)
    }
  }, [])

  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
  }, [theme, setTheme])

  // ========================================
  // Toast Management
  // ========================================
  
  const showToast = useCallback((options: Omit<Toast, 'id'>) => {
    const {
      type = 'info',
      title,
      message,
      duration = 5000
    } = options

    const id = Date.now() + Math.random()
    const newToast: Toast = {
      id,
      type,
      title,
      message,
      duration
    }

    setToasts(prev => [...prev, newToast])

    return id
  }, [])

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const clearToasts = useCallback(() => {
    setToasts([])
  }, [])

  // ========================================
  // Translation Function - with lazy loading
  // ========================================
  
  const [translations, setTranslations] = useState<any>(null)
  
  // Load translations on mount
  useEffect(() => {
    loadTranslations().then(setTranslations)
  }, [])
  
  const t = useCallback((key: string, params: Record<string, any> = {}) => {
    // Fallback to key if translations not loaded yet
    if (!translations) {
      return key
    }
    
    const translation = (translations[language] as any)?.[key]
    
    if (!translation) {
      console.warn(`Translation missing for key: ${key} (${language})`)
      return key
    }
    
    // Replace parameters in translation
    let result = translation
    Object.keys(params).forEach(param => {
      result = result.replace(`{{${param}}}`, params[param])
    })
    
    return result
  }, [language, translations])

  // ========================================
  // Effects
  // ========================================
  
  // Hydrate language from localStorage after client-side mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLang = (storage.getLang() as 'ar' | 'en') || 'en'
      if (savedLang !== language) {
        setLanguageState(savedLang)
      }
      setIsLanguageHydrated(true)
    }
  }, [])
  
  // Hydrate theme from localStorage after client-side mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = (storage.getTheme() as 'light' | 'dark') || 'light'
      if (savedTheme !== theme) {
        setThemeState(savedTheme)
      }
      setIsThemeHydrated(true)
    }
  }, [])
  
  // Apply language on mount and change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.lang = language
      document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr'
    }
  }, [language])

  // Apply theme on mount and change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark')
        document.body.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
        document.body.classList.remove('dark')
      }
    }
  }, [theme])

  // ========================================
  // Context Value
  // ========================================
  
  const value: ThemeContextType = {
    language,
    setLanguage,
    toggleLanguage,
    theme,
    setTheme,
    toggleTheme,
    t,
    isRTL: language === 'ar',
    isDark: theme === 'dark',
    // Toast
    toasts,
    showToast,
    removeToast,
    clearToasts
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export default ThemeProvider
