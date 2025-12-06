'use client'

import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { Search, Filter, X, Brain, Activity, Zap, Grid } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useProductsData } from '@/providers/ProductsProvider'
import { useCategoryTracking } from '@/providers/CategoryTrackingProvider'
import { getCategoryIcon, getCategoryColor } from '@/config/categoryIcons'

const ENERGY_TYPES = [
  { value: null, label: 'الكل', color: '#94a3b8' },
  { value: 'mental', label: 'ذهنية 🧠', icon: Brain, color: '#7C3AED' },
  { value: 'physical', label: 'بدنية 💪', icon: Activity, color: '#f97316' },
  { value: 'balanced', label: 'متوازنة ⚡', icon: Zap, color: '#10b981' }
]

const CALORIE_RANGES = [
  { value: null, label: 'كل السعرات', min: null, max: null },
  { value: 'low', label: '< 200 🟢', min: 0, max: 200 },
  { value: 'medium', label: '200-300 🟡', min: 200, max: 300 },
  { value: 'high', label: '> 300 🔴', min: 300, max: 9999 }
]

interface FilterBarProps {
  onFiltersChange?: (filters: any) => void
  onClearFilters?: () => void
}

export default function FilterBar({ onFiltersChange, onClearFilters }: FilterBarProps) {
  const { applyFilters, filteredProducts } = useProductsData()
  const { activeCategory, scrollToCategory, isUserInteracting } = useCategoryTracking()
  const [searchQuery, setSearchQuery] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [localFilters, setLocalFilters] = useState({
    category: null,
    energyType: null,
    calorieRange: null
  })
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const categoryScrollRef = useRef<HTMLDivElement>(null)

  // ✅ Dynamic Categories: Extract from products and sort by count
  const CATEGORIES = useMemo(() => {
    const products = filteredProducts || []

    // Group products by category
    const categoryGroups = products.reduce((acc, product) => {
      const cat = product.category || 'أخرى'
      if (!acc[cat]) {
        acc[cat] = []
      }
      acc[cat].push(product)
      return acc
    }, {} as Record<string, any[]>)

    // Sort by product count (most products first)
    const sortedCategories = Object.entries(categoryGroups)
      .sort(([, a], [, b]) => b.length - a.length)
      .map(([name, products]) => ({
        value: name,
        label: name,
        icon: getCategoryIcon(name),
        color: getCategoryColor(name),
        count: products.length
      }))

    // Add "All" at the beginning
    return [
      {
        value: 'all',
        label: 'الكل',
        icon: Grid,
        color: '#FF6B9D',
        count: products.length
      },
      ...sortedCategories
    ]
  }, [filteredProducts])

  // ✅ Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleSearch(e.target.value)
  }

  // ✅ Handle clear filters
  const handleClearFilters = () => {
    clearFilters()
  }

  // ✅ Auto-scroll active category tab to center (Mobile-First)
  useEffect(() => {
    // Only auto-scroll when:
    // 1. There IS an active category (not null/undefined)
    // 2. User is NOT interacting (prevents fighting with manual clicks)
    // 3. Container exists
    if (!activeCategory || isUserInteracting || !categoryScrollRef.current) {
      return
    }

    const container = categoryScrollRef.current
    const activeTab = container.querySelector(`[data-category="${activeCategory}"]`) as HTMLElement

    if (activeTab) {
      // ✅ INCREASED delay to prevent jitter and flickering
      const timeoutId = setTimeout(() => {
        // Calculate center position
        const containerWidth = container.offsetWidth
        const tabLeft = activeTab.offsetLeft
        const tabWidth = activeTab.offsetWidth
        const centerPos = tabLeft - (containerWidth / 2) + (tabWidth / 2)

        // Smooth scroll to center
        container.scrollTo({
          left: centerPos,
          behavior: 'smooth'
        })
      }, 300) // ✅ Increased from 100ms to 300ms to reduce flickering

      return () => clearTimeout(timeoutId)
    }
  }, [activeCategory, isUserInteracting])

  // Count active filters
  const activeFilterCount = [
    localFilters.category,
    localFilters.energyType,
    localFilters.calorieRange
  ].filter(Boolean).length

  // Get calorie range values
  const getCalorieRange = (rangeValue: string | null) => {
    const range = CALORIE_RANGES.find(r => r.value === rangeValue)
    return { min: range?.min, max: range?.max }
  }

  // Apply filters to parent component
  const applyAllFilters = useCallback((filters: any) => {
    const calorieRange = getCalorieRange(filters.calorieRange)
    const finalFilters = {
      category: filters.category,
      energyType: filters.energyType,
      minCalories: calorieRange.min ?? null,
      maxCalories: calorieRange.max ?? null,
      searchQuery: filters.searchQuery || searchQuery
    }

    applyFilters(finalFilters)

    if (onFiltersChange) {
      onFiltersChange(finalFilters)
    }
  }, [onFiltersChange, searchQuery, applyFilters])

  // Handle search with debounce
  const handleSearch = (query: string) => {
    setSearchQuery(query)

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    searchTimeoutRef.current = setTimeout(() => {
      applyAllFilters({ ...localFilters, searchQuery: query })
    }, 300)
  }

  // Handle filter change
  const handleFilterChange = (filterType: string, value: any) => {
    const newFilters = {
      ...localFilters,
      [filterType]: value
    }
    setLocalFilters(newFilters)
    applyAllFilters(newFilters)
  }

  // Clear all filters
  const clearFilters = () => {
    const resetFilters = {
      category: null,
      energyType: null,
      calorieRange: null
    }
    setLocalFilters(resetFilters)
    setSearchQuery('')
    applyAllFilters({ ...resetFilters, searchQuery: '' })

    if (onClearFilters) {
      onClearFilters()
    }
  }

  // Track scroll position for smooth sticky behavior
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      // Check if scrolled past the initial position (e.g., 100px)
      setIsScrolled(window.scrollY > 100)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [])

  return (
    <>
      {/* ✅ Category Navigation Tabs - Smooth Sticky Behavior */}
      <div
        className={`sticky top-[72px] z-40 bg-gradient-to-r from-pink-50/95 via-purple-50/95 to-pink-50/95 dark:from-slate-900/95 dark:via-slate-800/95 dark:to-slate-900/95 backdrop-blur-sm border-b border-pink-200/50 dark:border-slate-700/50 transition-all duration-300 ${isScrolled ? 'shadow-md' : 'shadow-sm'
          }`}
        style={{ willChange: 'transform, box-shadow' }}
      >
        <div className="container mx-auto px-4 py-2.5">
          <div className="flex items-center gap-2">
            {/* Category Pills - Scrollable - ✅ Smaller & Brand Colors */}
            <div
              ref={categoryScrollRef}
              className="flex-1 flex gap-1.5 overflow-x-auto scrollbar-hide"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
            >
              {CATEGORIES.map((category) => {
                const categoryId = category.value
                const isActive = activeCategory === categoryId
                const Icon = category.icon

                return (
                  <button
                    key={categoryId}
                    data-category={categoryId}
                    onClick={() => scrollToCategory(categoryId)}
                    className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold transition-all duration-300 whitespace-nowrap text-xs ${isActive
                        ? 'bg-gradient-to-r from-[#FF6B9D] to-[#FF5A8E] text-white shadow-lg shadow-pink-500/40 scale-105'
                        : 'bg-white/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 hover:bg-pink-50 dark:hover:bg-slate-700 border border-pink-200/50 dark:border-slate-600 hover:border-[#FF6B9D]/50 hover:scale-[1.02]'
                      }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{category.label}</span>
                  </button>
                )
              })}
            </div>

            {/* Filter Toggle Button - ✅ Smaller & Brand Colors */}
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`flex-shrink-0 flex items-center justify-center gap-1.5 min-w-[36px] h-[36px] px-3 rounded-full font-bold transition-all duration-300 shadow-md relative ${showAdvanced
                  ? 'bg-gradient-to-r from-[#FF6B9D] to-[#A3164D] text-white shadow-lg shadow-pink-500/40 scale-105'
                  : 'bg-white/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50 dark:hover:from-slate-700 dark:hover:to-slate-600 border border-pink-200/50 dark:border-slate-600 hover:border-[#FF6B9D]/50'
                }`}
            >
              <Filter className="w-4 h-4" />
              {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-gradient-to-r from-[#FF6B9D] to-[#A3164D] text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ✅ Desktop: Advanced Filters Panel - Slides Down */}
      <AnimatePresence>
        {showAdvanced && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="hidden lg:block sticky top-[140px] z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 shadow-lg overflow-hidden"
          >
            <div className="container mx-auto px-4 py-6">
              {/* Search Bar - Prominent */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-slate-900 dark:text-slate-100 mb-3">
                  🔍 البحث
                </label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="ابحث عن منتجك المفضل..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="w-full pl-12 pr-12 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-pink-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all text-right text-base font-medium"
                    dir="rtl"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => handleSearchChange({ target: { value: '' } } as any)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-all"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Filters Grid */}
              <div className="grid grid-cols-2 gap-6">
                {/* Energy Type Filter */}
                <div>
                  <label className="block text-sm font-bold text-slate-900 dark:text-slate-100 mb-3">
                    ⚡ نوع الطاقة
                  </label>
                  <select
                    value={localFilters.energyType || ''}
                    onChange={(e) => handleFilterChange('energyType', e.target.value || null)}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-right font-medium"
                    dir="rtl"
                  >
                    <option value="">جميع الأنواع</option>
                    {ENERGY_TYPES.map(type => (
                      <option key={type.value || 'all'} value={type.value || ''}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Calorie Range Filter */}
                <div>
                  <label className="block text-sm font-bold text-slate-900 dark:text-slate-100 mb-3">
                    🔥 السعرات الحرارية
                  </label>
                  <select
                    value={localFilters.calorieRange || ''}
                    onChange={(e) => handleFilterChange('calorieRange', e.target.value || null)}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-right font-medium"
                    dir="rtl"
                  >
                    <option value="">جميع النطاقات</option>
                    {CALORIE_RANGES.map(range => (
                      <option key={range.value || 'all'} value={range.value || ''}>
                        {range.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={handleClearFilters}
                  className="px-6 py-2.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 font-bold transition-colors"
                >
                  مسح الفلاتر
                </button>
                <button
                  onClick={() => setShowAdvanced(false)}
                  className="px-6 py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-bold hover:from-pink-600 hover:to-purple-700 transition-all shadow-lg"
                >
                  تطبيق
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ✅ Mobile: Bottom Drawer for Advanced Filters */}
      <AnimatePresence>
        {showAdvanced && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAdvanced(false)}
              className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />

            {/* Drawer */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="lg:hidden fixed inset-x-0 bottom-0 z-50 bg-white dark:bg-slate-900 rounded-t-3xl shadow-2xl max-h-[85vh] overflow-y-auto"
            >
              {/* Handle Bar */}
              <div className="flex justify-center pt-4 pb-2">
                <div className="w-16 h-1.5 bg-slate-300 dark:bg-slate-600 rounded-full" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b-2 border-slate-200 dark:border-slate-700">
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Filter className="w-6 h-6 text-pink-500" />
                  فلاتر البحث
                </h3>
                <button
                  onClick={() => setShowAdvanced(false)}
                  className="p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-6 h-6 text-slate-500" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Search Bar - Prominent */}
                <div>
                  <label className="block text-base font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                    <Search className="w-5 h-5 text-pink-500" />
                    البحث
                  </label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="ابحث عن منتجك المفضل..."
                      value={searchQuery}
                      onChange={handleSearchChange}
                      className="w-full pl-12 pr-12 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-pink-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all text-right text-base font-medium"
                      dir="rtl"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => handleSearchChange({ target: { value: '' } } as any)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-all"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Energy Type Filter */}
                <div>
                  <label className="block text-base font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-purple-500" />
                    نوع الطاقة
                  </label>
                  <select
                    value={localFilters.energyType || ''}
                    onChange={(e) => handleFilterChange('energyType', e.target.value || null)}
                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-right font-medium text-base"
                    dir="rtl"
                  >
                    <option value="">جميع الأنواع</option>
                    {ENERGY_TYPES.map(type => (
                      <option key={type.value || 'all'} value={type.value || ''}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Calorie Range Filter */}
                <div>
                  <label className="block text-base font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-orange-500" />
                    السعرات الحرارية
                  </label>
                  <select
                    value={localFilters.calorieRange || ''}
                    onChange={(e) => handleFilterChange('calorieRange', e.target.value || null)}
                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-right font-medium text-base"
                    dir="rtl"
                  >
                    <option value="">جميع النطاقات</option>
                    {CALORIE_RANGES.map(range => (
                      <option key={range.value || 'all'} value={range.value || ''}>
                        {range.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleClearFilters}
                    className="flex-1 py-4 px-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all text-base"
                  >
                    مسح الفلاتر
                  </button>
                  <button
                    onClick={() => setShowAdvanced(false)}
                    className="flex-1 py-4 px-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-2xl font-bold hover:from-pink-600 hover:to-purple-700 transition-all shadow-lg text-base"
                  >
                    تطبيق
                  </button>
                </div>
              </div>

              {/* Safe area for iOS */}
              <div className="h-8" />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
