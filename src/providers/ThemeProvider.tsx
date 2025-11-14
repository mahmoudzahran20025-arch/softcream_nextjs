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

// Import translation data
import { translationsData } from '@/data/translations-data'
import { translationsDataAdditions } from '@/data/translations-data-additions'

// Merge translation data
const translations = {
  ar: { ...translationsData.ar, ...translationsDataAdditions.ar },
  en: { ...translationsData.en, ...translationsDataAdditions.en }
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
  
  // Language State
  const [language, setLanguageState] = useState<'ar' | 'en'>(() => {
    if (typeof window !== 'undefined') {
      return (storage.getLang() as 'ar' | 'en') || 'ar'
    }
    return 'ar'
  })

  // Theme State
  const [theme, setThemeState] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      return (storage.getTheme() as 'light' | 'dark') || 'light'
    }
    return 'light'
  })

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
  // Translation Function
  // ========================================
  
  const t = useCallback((key: string, params: Record<string, any> = {}) => {
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
  }, [language])

  // ========================================
  // Effects
  // ========================================
  
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
