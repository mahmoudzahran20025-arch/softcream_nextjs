// ================================================================
// ThemeProvider.tsx - REFACTORED (Theme Management Only)
// ================================================================
// BEFORE: 300+ lines with 4 responsibilities (SRP violation)
// AFTER: ~100 lines with single responsibility (Theme only)
// Benefits: Better separation of concerns, easier to maintain

'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { storage } from '@/lib/storage.client'

interface ThemeContextType {
  theme: 'light' | 'dark'
  setTheme: (theme: 'light' | 'dark') => void
  toggleTheme: () => void
  isDark: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}

// ✅ For backward compatibility with old code
export const useGlobal = () => {
  console.warn('⚠️ useGlobal is deprecated. Use useTheme, useLanguage, and useToast instead.')
  const theme = useTheme()
  // Import other providers dynamically
  const { useLanguage } = require('./LanguageProvider')
  const { useToast } = require('./ToastProvider')
  const language = useLanguage()
  const toast = useToast()
  
  return {
    ...theme,
    ...language,
    ...toast
  }
}

interface ThemeProviderProps {
  children: ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<'light' | 'dark'>('light')
  
  // Hydrate from storage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = storage.getTheme() as 'light' | 'dark'
      if (saved && saved !== theme) {
        setThemeState(saved)
      }
    }
  }, [])
  
  // Apply theme to DOM
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
  
  const setTheme = useCallback((newTheme: 'light' | 'dark') => {
    if (newTheme !== 'light' && newTheme !== 'dark') {
      console.error('Invalid theme:', newTheme)
      return
    }

    setThemeState(newTheme)
    storage.setTheme(newTheme)
    
    // Theme changed
  }, [])

  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
  }, [theme, setTheme])

  return (
    <ThemeContext.Provider value={{
      theme,
      setTheme,
      toggleTheme,
      isDark: theme === 'dark'
    }}>
      {children}
    </ThemeContext.Provider>
  )
}

export default ThemeProvider

// ThemeProvider initialized

