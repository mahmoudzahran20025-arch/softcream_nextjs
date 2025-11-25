// ================================================================
// LanguageProvider.tsx - Language & Translation Management
// ================================================================
// Created: November 24, 2025
// Purpose: Separate language concerns from ThemeProvider (SRP)
// Responsibilities: Language switching (AR/EN) + Translation function

'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { storage } from '@/lib/storage.client'

interface LanguageContextType {
  language: 'ar' | 'en'
  setLanguage: (lang: 'ar' | 'en') => void
  toggleLanguage: () => void
  isRTL: boolean
  t: (key: string, params?: Record<string, any>) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return context
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<'ar' | 'en'>('ar')
  const [translations, setTranslations] = useState<any>(null)
  
  // Load translations (lazy)
  useEffect(() => {
    Promise.all([
      import('@/data/translations-data'),
      import('@/data/translations-data-additions')
    ]).then(([translationsData, translationsDataAdditions]) => {
      setTranslations({
        ar: { 
          ...translationsData.translationsData.ar, 
          ...translationsDataAdditions.translationsDataAdditions.ar 
        },
        en: { 
          ...translationsData.translationsData.en, 
          ...translationsDataAdditions.translationsDataAdditions.en 
        }
      })
    })
  }, [])
  
  // Hydrate from storage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = storage.getLang() as 'ar' | 'en'
      if (saved && saved !== language) {
        setLanguageState(saved)
      }
    }
  }, [])
  
  // Apply language to DOM
  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.lang = language
      document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr'
    }
  }, [language])
  
  const setLanguage = useCallback((newLang: 'ar' | 'en') => {
    if (newLang !== 'ar' && newLang !== 'en') {
      console.error('Invalid language:', newLang)
      return
    }
    
    setLanguageState(newLang)
    storage.setLang(newLang)
    
    console.log('✅ Language changed to:', newLang)
  }, [])
  
  const toggleLanguage = useCallback(() => {
    const newLang = language === 'ar' ? 'en' : 'ar'
    setLanguage(newLang)
  }, [language, setLanguage])
  
  const t = useCallback((key: string, params: Record<string, any> = {}) => {
    if (!translations) return key
    
    const translation = translations[language]?.[key]
    if (!translation) {
      console.warn(`Translation missing for key: ${key} (${language})`)
      return key
    }
    
    // Replace parameters
    let result = translation
    Object.keys(params).forEach(param => {
      result = result.replace(`{{${param}}}`, params[param])
    })
    
    return result
  }, [language, translations])
  
  return (
    <LanguageContext.Provider value={{
      language,
      setLanguage,
      toggleLanguage,
      isRTL: language === 'ar',
      t
    }}>
      {children}
    </LanguageContext.Provider>
  )
}

console.log('✅ LanguageProvider initialized')
