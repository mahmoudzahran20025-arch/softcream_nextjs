'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { Search, Filter, X, Brain, Activity, Zap, IceCream, Apple, Star, Crown, Heart, Grid } from 'lucide-react'
import { useProductsData } from '@/providers/ProductsProvider'

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
  const [localFilters, setLocalFilters] = useState({
    category: null,
    energyType: null,
    calorieRange: null
  })
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

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

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [])

  return (
    <div className="bg-gradient-to-b from-white to-gray-50 dark:from-slate-900 dark:to-slate-800 border-b border-gray-200 dark:border-slate-700 sticky top-[72px] z-30 shadow-md min-h-[80px]">
      <div className="container mx-auto px-4 py-4">
        {/* Search Bar Row */}
        <div className="flex gap-3 mb-4 min-h-[48px]">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="ابحث عن منتجك المفضل... 🔍"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="
                w-full pr-11 pl-4 py-3 
                border-2 border-gray-200 dark:border-slate-700 rounded-2xl
                bg-white dark:bg-slate-800
                focus:border-[#FF6B9D] focus:ring-2 focus:ring-[#FF6B9D]/20 focus:outline-none
                transition-all duration-300
                text-base placeholder:text-gray-400 dark:placeholder:text-slate-500
                text-slate-900 dark:text-white
              "
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
            className={`
              relative px-5 py-3 rounded-2xl border-2 transition-all duration-300 font-medium
              ${showAdvanced 
                ? 'bg-[#FF6B9D] text-white border-[#FF6B9D] shadow-lg shadow-[#FF6B9D]/30' 
                : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 border-gray-200 dark:border-slate-700 hover:border-[#FF6B9D] hover:bg-[#FF6B9D]/5'
              }
            `}
          >
            <Filter className="w-5 h-5" />
            {activeFilterCount > 0 && (
              <span className="absolute -top-2 -right-2 min-w-6 h-6 px-1.5 bg-gradient-to-br from-yellow-400 to-orange-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Advanced Filters Panel */}
        {showAdvanced && (
          <div className="space-y-5 pt-2 pb-3">
            {/* Category Filter */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-slate-300 mb-3">
                <IceCream className="w-4 h-4 text-[#FF6B9D]" />
                الفئة
              </label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(cat => {
                  const Icon = cat.icon
                  const isActive = localFilters.category === cat.value
                  return (
                    <button
                      key={cat.value || 'all'}
                      onClick={() => handleFilterChange('category', cat.value)}
                      className={`
                        flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
                        transition-all duration-300
                        ${isActive
                          ? 'text-white shadow-lg'
                          : 'bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:border-[#FF6B9D] hover:bg-[#FF6B9D]/5'
                        }
                      `}
                      style={{
                        backgroundColor: isActive ? cat.color : undefined,
                        boxShadow: isActive ? `0 4px 15px ${cat.color}40` : undefined
                      }}
                    >
                      <Icon className="w-4 h-4" />
                      {cat.label}
                    </button>
                  )
                })}
              </div>
            </div>

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
                      className={`
                        flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
                        transition-all duration-300
                        ${isActive
                          ? 'text-white shadow-lg'
                          : 'bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:border-[#FF6B9D] hover:bg-[#FF6B9D]/5'
                        }
                      `}
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
                      className={`
                        px-4 py-2.5 rounded-xl text-sm font-semibold
                        transition-all duration-300
                        ${isActive
                          ? 'bg-[#FF6B9D] text-white shadow-lg shadow-[#FF6B9D]/40'
                          : 'bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:border-[#FF6B9D] hover:bg-[#FF6B9D]/5'
                        }
                      `}
                    >
                      {range.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Clear Filters Button */}
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="
                  w-full py-3 px-4 
                  text-sm font-bold 
                  text-red-600 hover:text-white 
                  bg-red-50 dark:bg-red-900/20 hover:bg-gradient-to-r hover:from-red-500 hover:to-pink-600 
                  rounded-xl 
                  transition-all duration-300
                  border-2 border-red-200 dark:border-red-800 hover:border-transparent
                "
              >
                🗑️ مسح جميع الفلاتر ({activeFilterCount})
              </button>
            )}
          </div>
        )}

        {/* Active Filters Summary (when collapsed) */}
        {!showAdvanced && activeFilterCount > 0 && (
          <div className="flex items-center gap-2 flex-wrap mt-3">
            <span className="text-xs font-semibold text-gray-500 dark:text-slate-400">الفلاتر النشطة:</span>
            {localFilters.category && (
              <span className="px-3 py-1 bg-[#FF6B9D]/10 text-[#FF6B9D] rounded-full text-xs font-bold border border-[#FF6B9D]/20">
                {CATEGORIES.find(c => c.value === localFilters.category)?.label}
              </span>
            )}
            {localFilters.energyType && (
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-full text-xs font-bold border border-purple-200 dark:border-purple-800">
                {ENERGY_TYPES.find(t => t.value === localFilters.energyType)?.label}
              </span>
            )}
            {localFilters.calorieRange && (
              <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 rounded-full text-xs font-bold border border-orange-200 dark:border-orange-800">
                {CALORIE_RANGES.find(r => r.value === localFilters.calorieRange)?.label}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
