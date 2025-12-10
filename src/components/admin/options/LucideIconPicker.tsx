/**
 * LucideIconPicker Component - Icon Picker with Search and Categories
 * Requirements: 2.1
 * 
 * Provides a visual interface for selecting Lucide icons with:
 * - Curated FOOD_ICONS and GENERAL_ICONS lists
 * - Search/filter functionality
 * - Category tabs (Food, General, All)
 */

'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { Search, X, ChevronDown } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

// ===========================
// Types
// ===========================

export interface LucideIconPickerProps {
  value: string;
  onChange: (iconName: string) => void;
  category?: 'food' | 'general' | 'all';
  onClose?: () => void;
}

export type IconCategory = 'food' | 'general' | 'all';

// ===========================
// Curated Icon Lists
// ===========================

/**
 * Food-related icons for ice cream/dessert context
 * Note: Only includes icons that are verified to exist in lucide-react
 * Verified icons from node_modules/lucide-react/dist/esm/icons/index.js
 */
export const FOOD_ICONS = [
  'IceCreamCone', 'IceCreamBowl', 'Cookie', 'Cake', 'CakeSlice', 'Coffee', 'Milk',
  'Cherry', 'Apple', 'Banana', 'Grape', 'Citrus', 'Candy', 'CandyCane',
  'Croissant', 'Pizza', 'Sandwich', 'Salad',
  'UtensilsCrossed', 'Utensils', 'ChefHat', 'Flame', 'Snowflake', 'Droplet',
  'Wine', 'Beer', 'GlassWater',
  'Egg', 'Fish', 'Drumstick', 'Carrot', 'Wheat', 'Cloud'
] as const;

/**
 * General purpose icons
 */
export const GENERAL_ICONS = [
  'Plus', 'Minus', 'Check', 'X', 'Star', 'StarHalf',
  'Heart', 'HeartHandshake', 'Sparkles', 'Zap', 'Award', 'Gift',
  'Package', 'Box', 'Layers', 'Grid3X3', 'List', 'LayoutGrid',
  'Circle', 'Square', 'Triangle', 'Hexagon', 'Pentagon', 'Octagon',
  'Tag', 'Tags', 'Bookmark', 'Flag', 'Bell', 'Clock',
  'Settings', 'Sliders', 'Filter', 'Search', 'Eye', 'EyeOff'
] as const;

/**
 * All available icons (combined)
 */
export const ALL_ICONS = [...FOOD_ICONS, ...GENERAL_ICONS] as const;

// ===========================
// Helper Functions
// ===========================

/**
 * Get icons by category
 */
export function getIconsByCategory(category: IconCategory): readonly string[] {
  switch (category) {
    case 'food':
      return FOOD_ICONS;
    case 'general':
      return GENERAL_ICONS;
    case 'all':
    default:
      return ALL_ICONS;
  }
}

/**
 * Check if an icon name is valid in Lucide
 */
export function isValidLucideIcon(iconName: string): boolean {
  return iconName in LucideIcons && typeof (LucideIcons as any)[iconName] === 'function';
}

/**
 * Render a Lucide icon by name with fallback
 * Requirements: 2.3, 2.4, 2.5
 */
export function renderLucideIcon(
  iconName: string,
  fallbackIcon?: string,
  props?: { size?: number; className?: string }
): React.ReactNode {
  const { size = 20, className = '' } = props || {};
  
  // Try primary icon
  if (isValidLucideIcon(iconName)) {
    const IconComponent = (LucideIcons as any)[iconName];
    return <IconComponent size={size} className={className} />;
  }
  
  // Log warning for invalid icon
  console.warn(`Invalid Lucide icon: "${iconName}", attempting fallback`);
  
  // Try fallback icon
  if (fallbackIcon && isValidLucideIcon(fallbackIcon)) {
    const FallbackComponent = (LucideIcons as any)[fallbackIcon];
    return <FallbackComponent size={size} className={className} />;
  }
  
  // Ultimate fallback to Circle
  console.warn(`Fallback icon "${fallbackIcon}" also invalid, using Circle`);
  return <LucideIcons.Circle size={size} className={className} />;
}

// ===========================
// Category Tabs
// ===========================

const CATEGORY_TABS: { value: IconCategory; label: string; labelAr: string }[] = [
  { value: 'all', label: 'All', labelAr: 'الكل' },
  { value: 'food', label: 'Food', labelAr: 'طعام' },
  { value: 'general', label: 'General', labelAr: 'عام' },
];

// ===========================
// Component
// ===========================

const LucideIconPicker: React.FC<LucideIconPickerProps> = ({
  value,
  onChange,
  category: initialCategory = 'all',
  onClose,
}) => {
  // ===========================
  // State
  // ===========================
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<IconCategory>(initialCategory);
  const [isExpanded, setIsExpanded] = useState(false);

  // ===========================
  // Filtered Icons
  // ===========================
  const filteredIcons = useMemo(() => {
    const categoryIcons = getIconsByCategory(activeCategory);
    
    if (!searchQuery.trim()) {
      return categoryIcons;
    }
    
    const query = searchQuery.toLowerCase();
    return categoryIcons.filter(iconName => 
      iconName.toLowerCase().includes(query)
    );
  }, [activeCategory, searchQuery]);

  // ===========================
  // Handlers
  // ===========================
  const handleIconSelect = useCallback((iconName: string) => {
    onChange(iconName);
    setIsExpanded(false);
    onClose?.();
  }, [onChange, onClose]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  const handleCategoryChange = useCallback((category: IconCategory) => {
    setActiveCategory(category);
    setSearchQuery(''); // Clear search when changing category
  }, []);

  const toggleExpanded = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  // ===========================
  // Render
  // ===========================
  return (
    <div className="w-full">
      {/* Selected Icon Preview / Toggle Button */}
      <button
        type="button"
        onClick={toggleExpanded}
        className="w-full p-3 border border-gray-200 rounded-lg flex items-center justify-between hover:border-pink-300 transition-colors bg-white"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-pink-50 rounded-lg flex items-center justify-center">
            {renderLucideIcon(value, 'Circle', { size: 24, className: 'text-pink-500' })}
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-gray-700">{value || 'اختر أيقونة'}</p>
            <p className="text-xs text-gray-500">Lucide Icon</p>
          </div>
        </div>
        <ChevronDown 
          size={20} 
          className={`text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
        />
      </button>

      {/* Expanded Picker */}
      {isExpanded && (
        <div className="mt-2 border border-gray-200 rounded-lg bg-white shadow-lg overflow-hidden">
          {/* Search Bar */}
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="ابحث عن أيقونة..."
                className="w-full pr-10 pl-8 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex border-b border-gray-100">
            {CATEGORY_TABS.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => handleCategoryChange(tab.value)}
                className={`flex-1 py-2 px-3 text-sm font-medium transition-colors ${
                  activeCategory === tab.value
                    ? 'text-pink-600 border-b-2 border-pink-500 bg-pink-50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                {tab.labelAr}
              </button>
            ))}
          </div>

          {/* Icons Grid */}
          <div className="p-3 max-h-64 overflow-y-auto">
            {filteredIcons.length > 0 ? (
              <div className="grid grid-cols-6 sm:grid-cols-8 gap-1">
                {filteredIcons.map((iconName) => (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => handleIconSelect(iconName)}
                    title={iconName}
                    className={`p-2 rounded-lg transition-all flex flex-col items-center gap-1 ${
                      value === iconName
                        ? 'bg-pink-100 text-pink-600 ring-2 ring-pink-500'
                        : 'hover:bg-gray-100 text-gray-600'
                    }`}
                  >
                    {renderLucideIcon(iconName, 'Circle', { size: 20 })}
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Search size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">لا توجد أيقونات مطابقة</p>
              </div>
            )}
          </div>

          {/* Footer with count */}
          <div className="px-3 py-2 bg-gray-50 border-t border-gray-100 text-xs text-gray-500 text-center">
            {filteredIcons.length} أيقونة متاحة
          </div>
        </div>
      )}
    </div>
  );
};

export default LucideIconPicker;
