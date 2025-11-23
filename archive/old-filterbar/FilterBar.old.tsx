'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { Search, Filter, X, Brain, Activity, Zap, IceCream, Apple, Star, Crown, Heart, Grid, ChevronLeft, ChevronRight } from 'lucide-react'
import { useProductsData } from '@/providers/ProductsProvider'
import { motion, AnimatePresence } from 'framer-motion'

const CATEGORIES = [
  { value: null, label: 'الكل', icon: Grid, color: '#FF6B9D' },
  { value: 'كلاسيك', label: 'كلاسيك', icon: IceCream, color: '#FF6B9D' },
  { value: 'فواكه', label: 'فواكه', icon: Apple, color: '#10b981' },
  { value: 'مميز', label: 'مميز', icon: Star, color: '#fbbf24' },
  { value: 'فاخر', label: 'فاخر', icon: Crown, color: '#7C3AED' },
  { value: 'صحي', label: 'صحي', icon: Heart, color: '#ef4444' }
]

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
  const { applyFilters } = useProductsData()
  const [searchQuery, setSearchQuery] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [isCompact, setIsCompact] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [localFilters, setLocalFilters] = useState({
    category: null,
    energyType: null,
    calorieRange: null
  })
  
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const categoryTabsRef = useRef<HTMLDivElement>(null)
  const lastScrollY = useRef(0)

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Scroll behavior for compact mode
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
      // Compact when scrolling down past 150px
      if (currentScrollY > 150 && currentScrollY > lastScrollY.current) {
        setIsCompact(true)
        setShowAdvanced(false) // Close advanced panel when scrolling
      }
      
      // Expand when scrolling up or near top
      if (currentScrollY < 100 || currentScrollY < lastScrollY.current - 50) {
        setIsCompact(false)
      }
      
      lastScrollY.current = currentScrollY
    }
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Count active advanced filters (exclude category)
  const activeAdvancedCount = [
    localFilters.energyType,
    localFilters.calorieRange
  ].filter(Boolean).length

  // Total active filters
  const totalActiveCount = [
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

    // Scroll category tab to center when category changes
    if (filterType === 'category') {
      scrollTabToCenter(value)
    }
  }

  // Scroll category tab to center
  const scrollTabToCenter = (categoryValue: string | null) => {
    if (!categoryTabsRef.current) return
    
    const container = categoryTabsRef.current
    const tabElement = container.querySelector(`[data-category="${categoryValue}"]`) as HTMLElement
    
    if (!tabElement) return
    
    const tabCenter = tabElement.offsetLeft + (tabElement.offsetWidth / 2)
    const containerCenter = container.offsetWidth / 2
    
    container.scrollTo({
      left: tabCenter - containerCenter,
      behavior: 'smooth'
    })
  }

  // Clear advanced filters only
  const clearAdvancedFilters = () => {
    const newFilters = {
      ...localFilters,
      energyType: null,
      calorieRange: null
    }
    setLocalFilters(newFilters)
    applyAllFilters(newFilters)
  }

  // Clear all filters
  const clearAllFilters = () => {
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

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [])

  // Scroll indicators for category tabs
  const [showLeftScroll, setShowLeftScroll] = useState(false)
  const [showRightScroll, setShowRightScroll] = useState(false)

  useEffect(() => {
    const container = categoryTabsRef.current
    if (!container) return

    const updateScrollIndicators = () => {
      const { scrollLeft, scrollWidth, clientWidth } = container
      setShowLeftScroll(scrollLeft > 10)
      setShowRightScroll(scrollLeft < scrollWidth - clientWidth - 10)
    }

    updateScrollIndicators()
    container.addEventListener('scroll', updateScrollIndicators)
    window.addEventListener('resize', updateScrollIndicators)

    return () => {
      container.removeEventListener('scroll', updateScrollIndicators)
      window.removeEventListener('resize', updateScrollIndicators)
    }
  }, [])

  const scrollTabs = (direction: 'left' | 'right') => {
    if (!categoryTabsRef.current) return
    const scrollAmount = 200
    categoryTabsRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    })
  }

  return (
    <>
      {/* Main Filter Bar */}
      <motion.div 
        className="bg-gradient-to-b from-white to-gray-50 dark:from-slate-900 dark:to-slate-800 border-b border-gray-200 dark:border-slate-700 sticky top-[72px] z-30 shadow-md"
        animate={{
          height: isCompact ? '52px' : 'auto'
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        <div className="container mx-auto px-4">
          {/* Compact Mode (After Scroll) */}
          {isCompact ? (
            <div className="flex items-center gap-2 py-2 min-h-[52px]">
              {/* Compact Search */}
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="ابحث..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pr-8 pl-3 py-2 text-sm border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 focus:border-[#FF6B9D] focus:ring-1 focus:ring-[#FF6B9D]/20 focus:outline-none transition-all"
                />
              </div>

              {/* Advanced Toggle */}
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="relative px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:border-[#FF6B9D] transition-all"
              >
                <Filter className="w-4 h-4 text-gray-600 dark:text-slate-300" />
                {activeAdvancedCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-[#FF6B9D] text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {activeAdvancedCount}
                  </span>
                )}
              </button>

              {/* Compact Category Tabs */}
              <div className="flex-1 flex items-center gap-2 overflow-x-auto hide-scrollbar">
                {CATEGORIES.slice(0, 4).map(cat => {
                  const Icon = cat.icon
                  const isActive = localFilters.category === cat.value
                  return (
                    <button
                      key={cat.value || 'all'}
                      onClick={() => handleFilterChange('category', cat.value)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                        isActive
                          ? 'text-white'
                          : 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300'
                      }`}
                      style={{
                        backgroundColor: isActive ? cat.color : undefined
                      }}
                    >
                      <Icon className="w-3 h-3" />
                      {cat.label}
                    </button>
                  )
                })}
              </div>
            </div>
          ) : (
            /* Normal Mode */
            <div className="py-4">
              {/* Row 1: Search + Advanced Toggle */}
              <div className="flex gap-3 mb-4">
                {/* Search Input */}
                <div className="relative flex-1">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="ابحث عن منتجك المفضل... 🔍"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full pr-11 pl-4 py-3 border-2 border-gray-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800 focus:border-[#FF6B9D] focus:ring-2 focus:ring-[#FF6B9D]/20 focus:outline-none transition-all duration-300 text-base placeholder:text-gray-400 dark:placeholder:text-slate-500 text-slate-900 dark:text-white"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => handleSearch('')}
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Advanced Filter Toggle */}
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className={`relative px-5 py-3 rounded-2xl border-2 transition-all duration-300 font-medium ${
                    showAdvanced 
                      ? 'bg-[#FF6B9D] text-white border-[#FF6B9D] shadow-lg shadow-[#FF6B9D]/30' 
                      : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 border-gray-200 dark:border-slate-700 hover:border-[#FF6B9D] hover:bg-[#FF6B9D]/5'
                  }`}
                >
                  <Filter className="w-5 h-5" />
                  {activeAdvancedCount > 0 && (
                    <span className="absolute -top-2 -right-2 min-w-6 h-6 px-1.5 bg-gradient-to-br from-yellow-400 to-orange-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg">
                      {activeAdvancedCount}
                    </span>
                  )}
                </button>
              </div>

              {/* Row 2: Category Tabs (Always Visible) */}
              <div className="relative">
                {/* Scroll Indicators */}
                {showLeftScroll && (
                  <button
                    onClick={() => scrollTabs('left')}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white dark:bg-slate-800 shadow-lg flex items-center justify-center hover:bg-gray-50 dark:hover:bg-slate-700 transition-all"
                    aria-label="Scroll right"
                  >
                    <ChevronRight className="w-4 h-4 text-gray-600 dark:text-slate-300" />
                  </button>
                )}
                {showRightScroll && (
                  <button
                    onClick={() => scrollTabs('right')}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white dark:bg-slate-800 shadow-lg flex items-center justify-center hover:bg-gray-50 dark:hover:bg-slate-700 transition-all"
                    aria-label="Scroll left"
                  >
                    <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-slate-300" />
                  </button>
                )}

                {/* Category Tabs Container */}
                <div 
                  ref={categoryTabsRef}
                  className="flex gap-2 overflow-x-auto hide-scrollbar scroll-smooth pb-1"
                  style={{ scrollSnapType: 'x mandatory' }}
                >
                  {CATEGORIES.map(cat => {
                    const Icon = cat.icon
                    const isActive = localFilters.category === cat.value
                    return (
                      <button
                        key={cat.value || 'all'}
                        data-category={cat.value}
                        onClick={() => handleFilterChange('category', cat.value)}
                        className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-300 whitespace-nowrap ${
                          isActive
                            ? 'text-white shadow-lg scale-105'
                            : 'bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:border-[#FF6B9D] hover:bg-[#FF6B9D]/5 hover:scale-102'
                        }`}
                        style={{
                          backgroundColor: isActive ? cat.color : undefined,
                          boxShadow: isActive ? `0 4px 15px ${cat.color}40` : undefined,
                          scrollSnapAlign: 'center'
                        }}
                      >
                        <Icon className="w-4 h-4" />
                        {cat.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Advanced Filters Panel (Desktop) */}
              <AnimatePresence>
                {showAdvanced && !isMobile && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-4 pt-4 pb-2 border-t border-gray-200 dark:border-slate-700 mt-4">
                      {/* Energy Type Filter */}
                      <div>
                        <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-slate-300 mb-3">
                          <Zap className="w-4 h-4 text-[#FF6B9D]" />
                          نوع الطاقة
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {ENERGY_TYPES.map(type => {
                            const Icon = type.icon
                            const isActive = localFilters.energyType === type.value
                            return (
                              <button
                                key={type.value || 'all'}
                                onClick={() => handleFilterChange('energyType', type.value)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                                  isActive
                                    ? 'text-white shadow-lg'
                                    : 'bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:border-[#FF6B9D] hover:bg-[#FF6B9D]/5'
                                }`}
                                style={{
                                  backgroundColor: isActive ? type.color : undefined,
                                  boxShadow: isActive ? `0 4px 15px ${type.color}40` : undefined
                                }}
                              >
                                {Icon && <Icon className="w-4 h-4" />}
                                {type.label}
                              </button>
                            )
                          })}
                        </div>
                      </div>

                      {/* Calorie Range Filter */}
                      <div>
                        <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-slate-300 mb-3">
                          <Activity className="w-4 h-4 text-[#FF6B9D]" />
                          السعرات الحرارية
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {CALORIE_RANGES.map(range => {
                            const isActive = localFilters.calorieRange === range.value
                            return (
                              <button
                                key={range.value || 'all'}
                                onClick={() => handleFilterChange('calorieRange', range.value)}
                                className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                                  isActive
                                    ? 'bg-[#FF6B9D] text-white shadow-lg shadow-[#FF6B9D]/40'
                                    : 'bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:border-[#FF6B9D] hover:bg-[#FF6B9D]/5'
                                }`}
                              >
                                {range.label}
                              </button>
                            )
                          })}
                        </div>
                      </div>

                      {/* Clear Advanced Filters Button */}
                      {activeAdvancedCount > 0 && (
                        <button
                          onClick={clearAdvancedFilters}
                          className="w-full py-3 px-4 text-sm font-bold text-red-600 hover:text-white bg-red-50 dark:bg-red-900/20 hover:bg-gradient-to-r hover:from-red-500 hover:to-pink-600 rounded-xl transition-all duration-300 border-2 border-red-200 dark:border-red-800 hover:border-transparent"
                        >
                          🗑️ مسح الفلاتر المتقدمة ({activeAdvancedCount})
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </motion.div>

      {/* Mobile: Bottom Drawer for Advanced Filters */}
      <AnimatePresence>
        {showAdvanced && isMobile && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setShowAdvanced(false)}
            />

            {/* Drawer */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-x-0 bottom-0 z-50 bg-white dark:bg-slate-900 rounded-t-3xl shadow-2xl max-h-[60vh] overflow-y-auto"
            >
              {/* Drag Handle */}
              <div className="flex justify-center pt-4 pb-2">
                <div className="w-12 h-1.5 bg-gray-300 dark:bg-slate-700 rounded-full" />
              </div>

              {/* Drawer Content */}
              <div className="px-6 pb-safe">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Filter className="w-5 h-5 text-[#FF6B9D]" />
                  الفلاتر المتقدمة
                </h3>

                <div className="space-y-5">
                  {/* Energy Type Filter */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-slate-300 mb-3">
                      <Zap className="w-4 h-4 text-[#FF6B9D]" />
                      نوع الطاقة
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {ENERGY_TYPES.map(type => {
                        const Icon = type.icon
                        const isActive = localFilters.energyType === type.value
                        return (
                          <button
                            key={type.value || 'all'}
                            onClick={() => handleFilterChange('energyType', type.value)}
                            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                              isActive
                                ? 'text-white shadow-lg'
                                : 'bg-gray-50 dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300'
                            }`}
                            style={{
                              backgroundColor: isActive ? type.color : undefined
                            }}
                          >
                            {Icon && <Icon className="w-4 h-4" />}
                            {type.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Calorie Range Filter */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-slate-300 mb-3">
                      <Activity className="w-4 h-4 text-[#FF6B9D]" />
                      السعرات الحرارية
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {CALORIE_RANGES.map(range => {
                        const isActive = localFilters.calorieRange === range.value
                        return (
                          <button
                            key={range.value || 'all'}
                            onClick={() => handleFilterChange('calorieRange', range.value)}
                            className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                              isActive
                                ? 'bg-[#FF6B9D] text-white shadow-lg'
                                : 'bg-gray-50 dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300'
                            }`}
                          >
                            {range.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-2 pb-4">
                    <button
                      onClick={() => {
                        setShowAdvanced(false)
                      }}
                      className="flex-1 py-3 px-4 bg-[#FF6B9D] text-white font-bold rounded-xl hover:bg-[#FF5589] transition-all"
                    >
                      ✅ تطبيق
                    </button>
                    {activeAdvancedCount > 0 && (
                      <button
                        onClick={() => {
                          clearAdvancedFilters()
                          setShowAdvanced(false)
                        }}
                        className="flex-1 py-3 px-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-bold rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-all border-2 border-red-200 dark:border-red-800"
                      >
                        🗑️ مسح
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Hide Scrollbar Style */}
      <style jsx>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </>
  )
}