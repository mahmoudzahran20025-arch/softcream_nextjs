// ✅ CategoryTrackingProvider - Scoped State for Menu/Home View Only
// DO NOT add to global Providers.tsx - this is page-specific state

'use client'

import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from 'react'
import { TIMEOUTS } from '@/config/constants'

interface CategoryTrackingContextType {
  activeCategory: string | null
  setActiveCategory: (category: string | null) => void
  isUserInteracting: boolean
  setIsUserInteracting: (interacting: boolean) => void
  scrollToCategory: (categoryId: string) => void
  isCompactMode: boolean
  setIsCompactMode: (compact: boolean) => void
}

const CategoryTrackingContext = createContext<CategoryTrackingContextType | undefined>(undefined)

interface CategoryTrackingProviderProps {
  children: ReactNode
}

export function CategoryTrackingProvider({ children }: CategoryTrackingProviderProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [isUserInteracting, setIsUserInteracting] = useState(false)
  const [isCompactMode, setIsCompactMode] = useState(false)
  const interactionTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Scroll to category with smooth behavior and RTL support
  const scrollToCategory = useCallback((categoryId: string) => {
    // Set interaction lock to prevent auto-highlight during scroll
    setIsUserInteracting(true)
    
    // Clear any existing timeout
    if (interactionTimeoutRef.current) {
      clearTimeout(interactionTimeoutRef.current)
    }

    // Find the category section
    const element = document.getElementById(`category-${categoryId}`)
    if (element) {
      // ✅ Calculate offset for sticky elements:
      // Header: 72px + Category Tabs: 60px + Search Bar: 60px = 192px
      const headerOffset = 200 // Add 8px padding
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })

      // Update active category immediately
      setActiveCategory(categoryId)
    }

    // Release interaction lock after scroll completes
    interactionTimeoutRef.current = setTimeout(() => {
      setIsUserInteracting(false)
    }, TIMEOUTS.INTERACTION_LOCK) // Allow smooth scroll to complete
  }, [])

  const value: CategoryTrackingContextType = {
    activeCategory,
    setActiveCategory,
    isUserInteracting,
    setIsUserInteracting,
    scrollToCategory,
    isCompactMode,
    setIsCompactMode
  }

  return (
    <CategoryTrackingContext.Provider value={value}>
      {children}
    </CategoryTrackingContext.Provider>
  )
}

// Custom hook to use the category tracking context
export function useCategoryTracking() {
  const context = useContext(CategoryTrackingContext)
  if (context === undefined) {
    throw new Error('useCategoryTracking must be used within CategoryTrackingProvider')
  }
  return context
}
