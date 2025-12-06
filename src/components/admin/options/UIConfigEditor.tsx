/**
 * UIConfigEditor Component - Visual Editor for Option Group UI Configuration
 * 
 * Restored from archive for admin flexibility.
 * 
 * Provides a visual interface for configuring how option groups are displayed:
 * - display_style: cards, pills, list, grid
 * - icon: emoji, lucide icon name, or image URL
 * - colors: primary, secondary, background
 */

'use client';

import React, { useState, useCallback } from 'react';
import { 
  LayoutGrid, 
  List, 
  Circle,
  Palette,
  Image as ImageIcon,
  Smile,
  ChevronDown
} from 'lucide-react';
import type { UIConfig, IconConfig } from '@/lib/uiConfig';
import DynamicIcon from '@/components/ui/DynamicIcon';

// ===========================
// Types
// ===========================

export interface UIConfigEditorProps {
  value: UIConfig;
  onChange: (config: UIConfig) => void;
}

// ===========================
// Constants
// ===========================

const DISPLAY_STYLE_OPTIONS = [
  { value: 'cards', label: 'بطاقات', icon: LayoutGrid },
  { value: 'pills', label: 'أزرار', icon: Circle },
  { value: 'list', label: 'قائمة', icon: List },
  { value: 'grid', label: 'شبكة', icon: LayoutGrid },
] as const;

const ICON_TYPE_OPTIONS = [
  { value: 'emoji', label: 'إيموجي', icon: Smile },
  { value: 'lucide', label: 'أيقونة', icon: Circle },
  { value: 'custom', label: 'صورة', icon: ImageIcon },
] as const;

const EMOJI_OPTIONS = [
  '🍦', '🍨', '🥤', '🧁', '🍰', '🍫', '🍓', '🍌',
  '🥜', '🍪', '🍩', '🧇', '🍯', '🥛', '☕', '🍵',
  '📦', '⭐', '✨', '💎', '🎁', '🏷️', '🔖', '📋',
  '🍒', '🫐', '🥝', '🍑', '🥥', '🍇', '🍋', '🍊',
];

const LUCIDE_ICON_OPTIONS = [
  'IceCream', 'Coffee', 'Cookie', 'Cake', 'Cherry',
  'Apple', 'Banana', 'Grape', 'Citrus', 'Milk',
  'Cup', 'Package', 'Star', 'Heart', 'Sparkles',
];

const ACCENT_COLOR_OPTIONS = [
  { value: 'pink', label: 'وردي', color: '#ec4899' },
  { value: 'purple', label: 'بنفسجي', color: '#a855f7' },
  { value: 'blue', label: 'أزرق', color: '#3b82f6' },
  { value: 'green', label: 'أخضر', color: '#22c55e' },
  { value: 'orange', label: 'برتقالي', color: '#f97316' },
  { value: 'red', label: 'أحمر', color: '#ef4444' },
];

// ===========================
// Default Config
// ===========================

const DEFAULT_UI_CONFIG: UIConfig = {
  displayMode: 'grid',
  columns: 3,
  cardSize: 'md',
  showImages: true,
  showPrices: true,
  accentColor: 'pink',
  icon: {
    type: 'emoji',
    value: '🍦',
    style: 'solid',
    animation: 'none',
  },
};

// ===========================
// Component
// ===========================

const UIConfigEditor: React.FC<UIConfigEditorProps> = ({ value, onChange }) => {
  // Merge with defaults
  const config: UIConfig = React.useMemo(() => ({
    ...DEFAULT_UI_CONFIG,
    ...value,
    icon: {
      ...DEFAULT_UI_CONFIG.icon!,
      ...value?.icon,
    },
  }), [value]);

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showLucidePicker, setShowLucidePicker] = useState(false);
  const [customIconUrl, setCustomIconUrl] = useState(
    config.icon?.type === 'custom' ? config.icon.value : ''
  );
  const [expandedSections, setExpandedSections] = useState({
    display: true,
    icon: true,
    colors: false,
  });

  // ===========================
  // Handlers
  // ===========================

  const updateConfig = useCallback((updates: Partial<UIConfig>) => {
    const newConfig = { ...config, ...updates };
    onChange(newConfig);
  }, [config, onChange]);

  const updateIcon = useCallback((updates: Partial<IconConfig>) => {
    const newIcon = { ...config.icon!, ...updates };
    updateConfig({ icon: newIcon });
  }, [config.icon, updateConfig]);

  const handleDisplayModeChange = (mode: UIConfig['displayMode']) => {
    updateConfig({ displayMode: mode });
  };

  const handleIconTypeChange = (type: IconConfig['type']) => {
    let defaultValue = '🍦';
    if (type === 'lucide') defaultValue = 'IceCream';
    if (type === 'custom') defaultValue = '';
    
    updateIcon({ type, value: defaultValue });
    setShowEmojiPicker(false);
    setShowLucidePicker(false);
  };

  const handleEmojiSelect = (emoji: string) => {
    updateIcon({ value: emoji });
    setShowEmojiPicker(false);
  };

  const handleLucideSelect = (iconName: string) => {
    updateIcon({ value: iconName });
    setShowLucidePicker(false);
  };

  const handleCustomUrlChange = (url: string) => {
    setCustomIconUrl(url);
    updateIcon({ value: url });
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // ===========================
  // Render Helpers
  // ===========================

  const renderSectionHeader = (
    title: string,
    section: keyof typeof expandedSections,
    icon: React.ReactNode
  ) => (
    <button
      type="button"
      onClick={() => toggleSection(section)}
      className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
    >
      <div className="flex items-center gap-2">
        {icon}
        <span className="font-semibold text-gray-700">{title}</span>
      </div>
      <ChevronDown
        size={18}
        className={`text-gray-400 transition-transform ${
          expandedSections[section] ? 'rotate-180' : ''
        }`}
      />
    </button>
  );

  // ===========================
  // Render
  // ===========================

  return (
    <div className="space-y-4">
      {/* Display Style Section */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        {renderSectionHeader('نمط العرض', 'display', <LayoutGrid size={18} className="text-pink-500" />)}
        
        {expandedSections.display && (
          <div className="p-4 space-y-4">
            {/* Display Mode */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                طريقة العرض
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {DISPLAY_STYLE_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  const isSelected = config.displayMode === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleDisplayModeChange(option.value as UIConfig['displayMode'])}
                      className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-1 ${
                        isSelected
                          ? 'border-pink-500 bg-pink-50 text-pink-700'
                          : 'border-gray-200 hover:border-pink-300 text-gray-600'
                      }`}
                    >
                      <Icon size={20} />
                      <span className="text-xs font-medium">{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Columns */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                عدد الأعمدة: {config.columns}
              </label>
              <input
                type="range"
                min={1}
                max={6}
                value={config.columns || 3}
                onChange={(e) => updateConfig({ columns: parseInt(e.target.value) })}
                className="w-full accent-pink-500"
              />
            </div>

            {/* Card Size */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                حجم البطاقة
              </label>
              <div className="flex gap-2">
                {(['sm', 'md', 'lg'] as const).map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => updateConfig({ cardSize: size })}
                    className={`flex-1 py-2 px-3 rounded-lg border-2 text-sm font-medium transition-all ${
                      config.cardSize === size
                        ? 'border-pink-500 bg-pink-50 text-pink-700'
                        : 'border-gray-200 hover:border-pink-300 text-gray-600'
                    }`}
                  >
                    {size === 'sm' ? 'صغير' : size === 'md' ? 'متوسط' : 'كبير'}
                  </button>
                ))}
              </div>
            </div>

            {/* Show Images & Prices */}
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.showImages ?? true}
                  onChange={(e) => updateConfig({ showImages: e.target.checked })}
                  className="w-4 h-4 accent-pink-500 rounded"
                />
                <span className="text-sm text-gray-600">عرض الصور</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.showPrices ?? true}
                  onChange={(e) => updateConfig({ showPrices: e.target.checked })}
                  className="w-4 h-4 accent-pink-500 rounded"
                />
                <span className="text-sm text-gray-600">عرض الأسعار</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Icon Section */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        {renderSectionHeader('الأيقونة', 'icon', <Smile size={18} className="text-pink-500" />)}
        
        {expandedSections.icon && (
          <div className="p-4 space-y-4">
            {/* Icon Type */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                نوع الأيقونة
              </label>
              <div className="flex gap-2">
                {ICON_TYPE_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  const isSelected = config.icon?.type === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleIconTypeChange(option.value as IconConfig['type'])}
                      className={`flex-1 p-2 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
                        isSelected
                          ? 'border-pink-500 bg-pink-50 text-pink-700'
                          : 'border-gray-200 hover:border-pink-300 text-gray-600'
                      }`}
                    >
                      <Icon size={16} />
                      <span className="text-sm font-medium">{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Emoji Picker */}
            {config.icon?.type === 'emoji' && (
              <div className="relative">
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  اختر إيموجي
                </label>
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="w-full p-3 border border-gray-200 rounded-lg flex items-center justify-between hover:border-pink-300 transition-colors"
                >
                  <span className="text-2xl">{config.icon.value}</span>
                  <span className="text-sm text-gray-500">اضغط للاختيار</span>
                </button>
                
                {showEmojiPicker && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-10">
                    <div className="grid grid-cols-8 gap-2">
                      {EMOJI_OPTIONS.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => handleEmojiSelect(emoji)}
                          className={`p-2 text-xl rounded-lg hover:bg-pink-100 transition-colors ${
                            config.icon?.value === emoji ? 'bg-pink-200' : ''
                          }`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Lucide Picker */}
            {config.icon?.type === 'lucide' && (
              <div className="relative">
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  اختر أيقونة
                </label>
                <button
                  type="button"
                  onClick={() => setShowLucidePicker(!showLucidePicker)}
                  className="w-full p-3 border border-gray-200 rounded-lg flex items-center justify-between hover:border-pink-300 transition-colors"
                >
                  <DynamicIcon config={config.icon} size={24} />
                  <span className="text-sm text-gray-500">{config.icon.value}</span>
                </button>
                
                {showLucidePicker && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-10 max-h-48 overflow-y-auto">
                    <div className="grid grid-cols-5 gap-2">
                      {LUCIDE_ICON_OPTIONS.map((iconName) => (
                        <button
                          key={iconName}
                          type="button"
                          onClick={() => handleLucideSelect(iconName)}
                          className={`p-2 rounded-lg hover:bg-pink-100 transition-colors flex flex-col items-center gap-1 ${
                            config.icon?.value === iconName ? 'bg-pink-200' : ''
                          }`}
                        >
                          <DynamicIcon 
                            config={{ type: 'lucide', value: iconName }} 
                            size={20} 
                          />
                          <span className="text-xs text-gray-500 truncate w-full text-center">
                            {iconName}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Custom URL */}
            {config.icon?.type === 'custom' && (
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  رابط الصورة
                </label>
                <input
                  type="url"
                  value={customIconUrl}
                  onChange={(e) => handleCustomUrlChange(e.target.value)}
                  placeholder="https://example.com/icon.png"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
                {customIconUrl && (
                  <div className="mt-2 p-2 bg-gray-50 rounded-lg flex items-center justify-center">
                    <DynamicIcon config={config.icon} size={32} />
                  </div>
                )}
              </div>
            )}

            {/* Icon Preview */}
            <div className="p-4 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-2">معاينة الأيقونة</p>
                <DynamicIcon config={config.icon!} size={48} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Colors Section */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        {renderSectionHeader('الألوان', 'colors', <Palette size={18} className="text-pink-500" />)}
        
        {expandedSections.colors && (
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                اللون الرئيسي
              </label>
              <div className="grid grid-cols-3 gap-2">
                {ACCENT_COLOR_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => updateConfig({ accentColor: option.value })}
                    className={`p-2 rounded-lg border-2 transition-all flex items-center gap-2 ${
                      config.accentColor === option.value
                        ? 'border-gray-800 bg-gray-50'
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <span
                      className="w-5 h-5 rounded-full"
                      style={{ backgroundColor: option.color }}
                    />
                    <span className="text-xs text-gray-600">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UIConfigEditor;
