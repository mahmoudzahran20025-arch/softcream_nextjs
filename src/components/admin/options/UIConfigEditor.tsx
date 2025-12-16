/**
 * UIConfigEditor Component - Visual Editor for Option Group UI Configuration
 * 
 * Requirements:
 * - 4.1: Display Mode selector (Default, Hero Flavor, Smart Meter, Brand Accent)
 * - 5.1: Fallback Style selector (Cards, Grid, List, Pills, Checkbox)
 * - 3.2: Nutrition toggle and config
 * - 6.4: Columns and Layout config
 * - 9.2, 9.3: Live preview
 * - 9.4: Config merge on save
 * - 9.5: Reset to defaults
 */

'use client';

import React, { useState, useCallback, useMemo } from 'react';
import {
  LayoutGrid,
  List,
  Circle,
  Palette,
  Image as ImageIcon,
  Smile,
  ChevronDown,
  Eye,
  RotateCcw,
  Sparkles,
  Gauge,
  Grid3X3,
  CheckSquare,
  Columns,
  Maximize2,
  Minimize2,
  AlignCenter,
  Flame,
  Apple,
  Beef,
  Droplet,
  FileText // For Content section
} from 'lucide-react';
import type { UIConfig, IconConfig, DisplayMode, FallbackStyle, NutritionDisplayConfig } from '@/lib/uiConfig';
import { DEFAULT_UI_CONFIG, mergeUIConfig } from '@/lib/uiConfig';
import DynamicIcon from '@/components/ui/DynamicIcon';
import OptionGroupRenderer from '@/components/shared/OptionGroupRenderer';
import type { OptionData } from '@/components/shared/OptionRenderer';

// ===========================
// Types
// ===========================

export interface UIConfigEditorProps {
  value: UIConfig;
  onChange: (config: UIConfig) => void;
  /** Sample options for live preview */
  sampleOptions?: OptionData[];
  /** Show live preview section */
  showPreview?: boolean;
}


// ===========================
// Constants - Display Modes (Requirement 4.1)
// ===========================

const DISPLAY_MODE_OPTIONS: {
  value: DisplayMode;
  label: string;
  labelEn: string;
  description: string;
  icon: React.ElementType;
}[] = [
  {
    value: 'default',
    label: 'افتراضي',
    labelEn: 'Default',
    description: 'عرض شبكي/بطاقات قياسي',
    icon: LayoutGrid
  },
  {
    value: 'hero_flavor',
    label: 'نكهة بارزة',
    labelEn: 'Hero Flavor',
    description: 'صور دائرية كبيرة بارزة',
    icon: Sparkles
  },
  {
    value: 'smart_meter',
    label: 'مقياس ذكي',
    labelEn: 'Smart Meter',
    description: 'واجهة مقياس/شريط تمرير',
    icon: Gauge
  },
  {
    value: 'brand_accent',
    label: 'لون العلامة',
    labelEn: 'Brand Accent',
    description: 'ألوان وتصميم العلامة التجارية',
    icon: Palette
  }
];

// ===========================
// Constants - Fallback Styles (Requirement 5.1)
// ===========================

const FALLBACK_STYLE_OPTIONS: {
  value: FallbackStyle;
  label: string;
  labelEn: string;
  description: string;
  icon: React.ElementType;
}[] = [
  {
    value: 'cards',
    label: 'بطاقات',
    labelEn: 'Cards',
    description: 'صورة، عنوان، وصف، سعر، تغذية',
    icon: LayoutGrid
  },
  {
    value: 'grid',
    label: 'شبكة',
    labelEn: 'Grid',
    description: 'صورة، عنوان، سعر فقط',
    icon: Grid3X3
  },
  {
    value: 'list',
    label: 'قائمة',
    labelEn: 'List',
    description: 'أيقونة، عنوان، وصف، سعر أفقي',
    icon: List
  },
  {
    value: 'pills',
    label: 'أزرار',
    labelEn: 'Pills',
    description: 'عنوان وسعر فقط - مضغوط',
    icon: Circle
  },
  {
    value: 'checkbox',
    label: 'اختيار متعدد',
    labelEn: 'Checkbox',
    description: 'مربع اختيار، عنوان، سعر',
    icon: CheckSquare
  }
];

// ===========================
// Constants - Icon Options
// ===========================

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

// ===========================
// Constants - Colors
// ===========================

const ACCENT_COLOR_OPTIONS = [
  { value: 'pink', label: 'وردي', color: '#ec4899' },
  { value: 'purple', label: 'بنفسجي', color: '#a855f7' },
  { value: 'blue', label: 'أزرق', color: '#3b82f6' },
  { value: 'green', label: 'أخضر', color: '#22c55e' },
  { value: 'orange', label: 'برتقالي', color: '#f97316' },
  { value: 'red', label: 'أحمر', color: '#ef4444' },
  { value: 'amber', label: 'عنبري', color: '#f59e0b' },
  { value: 'cyan', label: 'سماوي', color: '#06b6d4' },
  { value: 'emerald', label: 'زمردي', color: '#10b981' },
];

// ===========================
// Constants - Nutrition Fields (Requirement 3.2)
// ===========================

const NUTRITION_FIELD_OPTIONS: {
  value: 'calories' | 'protein' | 'carbs' | 'fat';
  label: string;
  icon: React.ElementType;
}[] = [
  { value: 'calories', label: 'سعرات', icon: Flame },
  { value: 'protein', label: 'بروتين', icon: Beef },
  { value: 'carbs', label: 'كربوهيدرات', icon: Apple },
  { value: 'fat', label: 'دهون', icon: Droplet },
];

const NUTRITION_FORMAT_OPTIONS: {
  value: 'compact' | 'detailed' | 'badges';
  label: string;
  description: string;
}[] = [
  { value: 'compact', label: 'مضغوط', description: '120 cal • 5g protein' },
  { value: 'detailed', label: 'مفصل', description: 'عرض كامل في tooltip' },
  { value: 'badges', label: 'شارات', description: 'شارات منفصلة لكل عنصر' },
];

// ===========================
// Constants - Layout (Requirement 6.4)
// ===========================

const COLUMN_OPTIONS: { value: 1 | 2 | 3 | 4 | 'auto'; label: string }[] = [
  { value: 'auto', label: 'تلقائي' },
  { value: 1, label: '1 عمود' },
  { value: 2, label: '2 أعمدة' },
  { value: 3, label: '3 أعمدة' },
  { value: 4, label: '4 أعمدة' },
];

const CARD_SIZE_OPTIONS: { value: 'sm' | 'md' | 'lg'; label: string; icon: React.ElementType }[] = [
  { value: 'sm', label: 'صغير', icon: Minimize2 },
  { value: 'md', label: 'متوسط', icon: AlignCenter },
  { value: 'lg', label: 'كبير', icon: Maximize2 },
];

const SPACING_OPTIONS: { value: 'compact' | 'normal' | 'loose'; label: string }[] = [
  { value: 'compact', label: 'مضغوط' },
  { value: 'normal', label: 'عادي' },
  { value: 'loose', label: 'واسع' },
];

// ===========================
// Sample Options for Preview
// ===========================

const DEFAULT_SAMPLE_OPTIONS: OptionData[] = [
  {
    id: 'sample-1',
    name_ar: 'فانيليا كلاسيك',
    name_en: 'Classic Vanilla',
    description_ar: 'نكهة الفانيليا الأصلية',
    base_price: 5,
    calories: 120,
    protein: 3,
    carbs: 15,
    fat: 5,
  },
  {
    id: 'sample-2',
    name_ar: 'شوكولاتة غامقة',
    name_en: 'Dark Chocolate',
    description_ar: 'شوكولاتة بلجيكية فاخرة',
    base_price: 7,
    calories: 150,
    protein: 4,
    carbs: 18,
    fat: 7,
  },
  {
    id: 'sample-3',
    name_ar: 'فراولة طازجة',
    name_en: 'Fresh Strawberry',
    description_ar: 'فراولة طبيعية 100%',
    base_price: 6,
    calories: 100,
    protein: 2,
    carbs: 12,
    fat: 3,
  },
];


// ===========================
// Component
// ===========================

const UIConfigEditor: React.FC<UIConfigEditorProps> = ({
  value,
  onChange,
  sampleOptions = DEFAULT_SAMPLE_OPTIONS,
  showPreview = true
}) => {
  // Merge with defaults
  const config: UIConfig = useMemo(() => mergeUIConfig(DEFAULT_UI_CONFIG, value || {}), [value]);

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showLucidePicker, setShowLucidePicker] = useState(false);
  const [customIconUrl, setCustomIconUrl] = useState(
    config.icon?.type === 'custom' ? config.icon.value : ''
  );
  const [expandedSections, setExpandedSections] = useState({
    displayMode: true,
    fallbackStyle: true,
    nutrition: false,
    layout: false,
    content: false, // Requirement 5.1: Separate Content section
    icon: false,
    colors: false,
    preview: true,
  });
  const [previewSelectedIds, setPreviewSelectedIds] = useState<string[]>([]);

  // ===========================
  // Handlers
  // ===========================

  const updateConfig = useCallback((updates: Partial<UIConfig>) => {
    // Requirement 9.4: Merge changes with existing config
    const newConfig = mergeUIConfig(config, updates);
    onChange(newConfig);
  }, [config, onChange]);

  const updateIcon = useCallback((updates: Partial<IconConfig>) => {
    const newIcon = { ...config.icon!, ...updates };
    updateConfig({ icon: newIcon });
  }, [config.icon, updateConfig]);

  const updateNutrition = useCallback((updates: Partial<NutritionDisplayConfig>) => {
    const newNutrition = { ...config.nutrition!, ...updates };
    updateConfig({ nutrition: newNutrition });
  }, [config.nutrition, updateConfig]);

  // Requirement 9.5, 5.5: Reset to defaults - restores ALL fields to DEFAULT_UI_CONFIG values
  const handleResetToDefaults = useCallback(() => {
    // Create a fresh copy of DEFAULT_UI_CONFIG to ensure all fields are reset
    const resetConfig: UIConfig = {
      display_mode: DEFAULT_UI_CONFIG.display_mode,
      fallback_style: DEFAULT_UI_CONFIG.fallback_style,
      columns: DEFAULT_UI_CONFIG.columns,
      card_size: DEFAULT_UI_CONFIG.card_size,
      spacing: DEFAULT_UI_CONFIG.spacing,
      show_images: DEFAULT_UI_CONFIG.show_images,
      show_prices: DEFAULT_UI_CONFIG.show_prices,
      show_descriptions: DEFAULT_UI_CONFIG.show_descriptions,
      show_group_description: DEFAULT_UI_CONFIG.show_group_description,
      nutrition: { ...DEFAULT_UI_CONFIG.nutrition! },
      icon: { ...DEFAULT_UI_CONFIG.icon! },
      accent_color: DEFAULT_UI_CONFIG.accent_color,
    };
    onChange(resetConfig);
  }, [onChange]);

  const handleDisplayModeChange = (mode: DisplayMode) => {
    updateConfig({ display_mode: mode });
  };

  const handleFallbackStyleChange = (style: FallbackStyle) => {
    updateConfig({ fallback_style: style });
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

  const handleNutritionFieldToggle = (field: 'calories' | 'protein' | 'carbs' | 'fat') => {
    const currentFields = config.nutrition?.fields || ['calories'];
    const newFields = currentFields.includes(field)
      ? currentFields.filter(f => f !== field)
      : [...currentFields, field];
    updateNutrition({ fields: newFields.length > 0 ? newFields : ['calories'] });
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
    icon: React.ReactNode,
    badge?: string
  ) => (
    <button
      type="button"
      onClick={() => toggleSection(section)}
      className="w-full flex items-center justify-between p-2.5 sm:p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
    >
      <div className="flex items-center gap-2">
        {icon}
        <span className="font-semibold text-gray-700 text-sm sm:text-base">{title}</span>
        {badge && (
          <span className="px-2 py-0.5 bg-pink-100 text-pink-600 text-xs rounded-full">
            {badge}
          </span>
        )}
      </div>
      <ChevronDown
        size={16}
        className={`text-gray-400 transition-transform sm:w-[18px] sm:h-[18px] ${
          expandedSections[section] ? 'rotate-180' : ''
        }`}
      />
    </button>
  );


  // ===========================
  // Render
  // ===========================

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Reset Button - Requirement 9.5 */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleResetToDefaults}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-colors"
        >
          <RotateCcw size={14} />
          <span>إعادة للافتراضي</span>
        </button>
      </div>

      {/* Display Mode Section - Requirement 4.1 */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        {renderSectionHeader(
          'نمط العرض الرئيسي',
          'displayMode',
          <Sparkles size={16} className="text-pink-500 sm:w-[18px] sm:h-[18px]" />,
          config.display_mode
        )}

        {expandedSections.displayMode && (
          <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
            <p className="text-xs text-gray-500 mb-2">
              اختر نمط العرض الرئيسي للخيارات. إذا لم يتمكن النمط من العرض، سيتم استخدام النمط الاحتياطي.
            </p>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              {DISPLAY_MODE_OPTIONS.map((option) => {
                const Icon = option.icon;
                const isSelected = config.display_mode === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleDisplayModeChange(option.value)}
                    className={`p-3 sm:p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 text-center ${
                      isSelected
                        ? 'border-pink-500 bg-pink-50 text-pink-700 shadow-md'
                        : 'border-gray-200 hover:border-pink-300 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon size={24} className={isSelected ? 'text-pink-500' : 'text-gray-400'} />
                    <div>
                      <span className="text-sm font-bold block">{option.label}</span>
                      <span className="text-[10px] text-gray-500 block mt-0.5">{option.description}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Fallback Style Section - Requirement 5.1, 5.2: Conditional rendering */}
      {/* Show fallback options only when display_mode is not 'default' */}
      {config.display_mode !== 'default' && (
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          {renderSectionHeader(
            'النمط الاحتياطي',
            'fallbackStyle',
            <LayoutGrid size={16} className="text-purple-500 sm:w-[18px] sm:h-[18px]" />,
            config.fallback_style
          )}

          {expandedSections.fallbackStyle && (
            <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
              <p className="text-xs text-gray-500 mb-2">
                يُستخدم عندما لا يتمكن النمط الرئيسي من العرض (مثلاً: Hero Flavor بدون صور)
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {FALLBACK_STYLE_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  const isSelected = config.fallback_style === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleFallbackStyleChange(option.value)}
                      className={`p-2.5 sm:p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-1.5 ${
                        isSelected
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
                          : 'border-gray-200 hover:border-purple-300 text-gray-600'
                      }`}
                    >
                      <Icon size={18} className={isSelected ? 'text-purple-500' : 'text-gray-400'} />
                      <span className="text-xs font-medium">{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Nutrition Section - Requirement 3.2 */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        {renderSectionHeader(
          'العناصر الغذائية',
          'nutrition',
          <Flame size={16} className="text-orange-500 sm:w-[18px] sm:h-[18px]" />,
          config.nutrition?.show ? 'مفعّل' : 'معطّل'
        )}

        {expandedSections.nutrition && (
          <div className="p-3 sm:p-4 space-y-4">
            {/* Show Nutrition Toggle */}
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm font-medium text-gray-700">عرض العناصر الغذائية</span>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={config.nutrition?.show ?? false}
                  onChange={(e) => updateNutrition({ show: e.target.checked })}
                  className="sr-only"
                />
                <div className={`w-11 h-6 rounded-full transition-colors ${
                  config.nutrition?.show ? 'bg-pink-500' : 'bg-gray-300'
                }`}>
                  <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    config.nutrition?.show ? 'translate-x-5' : 'translate-x-0.5'
                  }`} />
                </div>
              </div>
            </label>

            {config.nutrition?.show && (
              <>
                {/* Nutrition Format */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-2">
                    تنسيق العرض
                  </label>
                  <div className="flex gap-2">
                    {NUTRITION_FORMAT_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => updateNutrition({ format: option.value })}
                        className={`flex-1 py-2 px-2 rounded-lg border-2 text-xs font-medium transition-all ${
                          config.nutrition?.format === option.value
                            ? 'border-orange-500 bg-orange-50 text-orange-700'
                            : 'border-gray-200 hover:border-orange-300 text-gray-600'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Nutrition Fields */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-2">
                    الحقول المعروضة
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {NUTRITION_FIELD_OPTIONS.map((field) => {
                      const Icon = field.icon;
                      const isSelected = config.nutrition?.fields?.includes(field.value);
                      return (
                        <button
                          key={field.value}
                          type="button"
                          onClick={() => handleNutritionFieldToggle(field.value)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 text-xs font-medium transition-all ${
                            isSelected
                              ? 'border-orange-500 bg-orange-50 text-orange-700'
                              : 'border-gray-200 hover:border-orange-300 text-gray-600'
                          }`}
                        >
                          <Icon size={14} />
                          {field.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>


      {/* Layout Section - Requirement 6.4 */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        {renderSectionHeader(
          'التخطيط والأعمدة',
          'layout',
          <Columns size={16} className="text-blue-500 sm:w-[18px] sm:h-[18px]" />
        )}

        {expandedSections.layout && (
          <div className="p-3 sm:p-4 space-y-4">
            {/* Columns */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-2">
                عدد الأعمدة
              </label>
              <div className="flex gap-1.5 sm:gap-2">
                {COLUMN_OPTIONS.map((option) => (
                  <button
                    key={String(option.value)}
                    type="button"
                    onClick={() => updateConfig({ columns: option.value })}
                    className={`flex-1 py-2 rounded-lg border-2 text-xs sm:text-sm font-medium transition-all ${
                      config.columns === option.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-blue-300 text-gray-600'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-gray-500 mt-1">
                &quot;تلقائي&quot; يحسب الأعمدة بناءً على عدد الخيارات
              </p>
            </div>

            {/* Card Size */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-2">
                حجم البطاقة
              </label>
              <div className="flex gap-2">
                {CARD_SIZE_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => updateConfig({ card_size: option.value })}
                      className={`flex-1 py-2 px-3 rounded-lg border-2 text-xs sm:text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${
                        config.card_size === option.value
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-blue-300 text-gray-600'
                      }`}
                    >
                      <Icon size={14} />
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Spacing */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-2">
                المسافات
              </label>
              <div className="flex gap-2">
                {SPACING_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => updateConfig({ spacing: option.value })}
                    className={`flex-1 py-2 rounded-lg border-2 text-xs sm:text-sm font-medium transition-all ${
                      config.spacing === option.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-blue-300 text-gray-600'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Content Section - Requirement 5.1: Separate Content section */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        {renderSectionHeader(
          'المحتوى المعروض',
          'content',
          <FileText size={16} className="text-teal-500 sm:w-[18px] sm:h-[18px]" />
        )}

        {expandedSections.content && (
          <div className="p-3 sm:p-4 space-y-4">
            <p className="text-xs text-gray-500 mb-2">
              تحكم في العناصر التي تظهر في كل خيار
            </p>
            
            {/* Content Toggles */}
            <div className="space-y-3">
              <label className="flex items-center justify-between cursor-pointer p-2 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-2">
                  <ImageIcon size={16} className="text-gray-400" />
                  <span className="text-sm text-gray-700">عرض الصور</span>
                </div>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={config.show_images ?? true}
                    onChange={(e) => updateConfig({ show_images: e.target.checked })}
                    className="sr-only"
                  />
                  <div className={`w-11 h-6 rounded-full transition-colors ${
                    config.show_images ?? true ? 'bg-teal-500' : 'bg-gray-300'
                  }`}>
                    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      config.show_images ?? true ? 'translate-x-5' : 'translate-x-0.5'
                    }`} />
                  </div>
                </div>
              </label>

              <label className="flex items-center justify-between cursor-pointer p-2 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-sm font-bold">﷼</span>
                  <span className="text-sm text-gray-700">عرض الأسعار</span>
                </div>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={config.show_prices ?? true}
                    onChange={(e) => updateConfig({ show_prices: e.target.checked })}
                    className="sr-only"
                  />
                  <div className={`w-11 h-6 rounded-full transition-colors ${
                    config.show_prices ?? true ? 'bg-teal-500' : 'bg-gray-300'
                  }`}>
                    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      config.show_prices ?? true ? 'translate-x-5' : 'translate-x-0.5'
                    }`} />
                  </div>
                </div>
              </label>

              <label className="flex items-center justify-between cursor-pointer p-2 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-2">
                  <FileText size={16} className="text-gray-400" />
                  <span className="text-sm text-gray-700">عرض وصف الخيار</span>
                </div>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={config.show_descriptions ?? false}
                    onChange={(e) => updateConfig({ show_descriptions: e.target.checked })}
                    className="sr-only"
                  />
                  <div className={`w-11 h-6 rounded-full transition-colors ${
                    config.show_descriptions ? 'bg-teal-500' : 'bg-gray-300'
                  }`}>
                    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      config.show_descriptions ? 'translate-x-5' : 'translate-x-0.5'
                    }`} />
                  </div>
                </div>
              </label>

              {/* Requirements 5.6, 7.1, 7.2, 7.3: Toggle for group description visibility */}
              <label className="flex items-center justify-between cursor-pointer p-2 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-2">
                  <List size={16} className="text-gray-400" />
                  <span className="text-sm text-gray-700">عرض وصف المجموعة</span>
                </div>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={config.show_group_description ?? true}
                    onChange={(e) => updateConfig({ show_group_description: e.target.checked })}
                    className="sr-only"
                  />
                  <div className={`w-11 h-6 rounded-full transition-colors ${
                    config.show_group_description ?? true ? 'bg-teal-500' : 'bg-gray-300'
                  }`}>
                    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      config.show_group_description ?? true ? 'translate-x-5' : 'translate-x-0.5'
                    }`} />
                  </div>
                </div>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Icon Section */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        {renderSectionHeader(
          'الأيقونة',
          'icon',
          <Smile size={16} className="text-pink-500 sm:w-[18px] sm:h-[18px]" />
        )}

        {expandedSections.icon && (
          <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
            {/* Icon Type */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-2">
                نوع الأيقونة
              </label>
              <div className="flex gap-1.5 sm:gap-2">
                {ICON_TYPE_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  const isSelected = config.icon?.type === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleIconTypeChange(option.value as IconConfig['type'])}
                      className={`flex-1 p-1.5 sm:p-2 rounded-lg border-2 transition-all flex items-center justify-center gap-1 sm:gap-2 ${
                        isSelected
                          ? 'border-pink-500 bg-pink-50 text-pink-700'
                          : 'border-gray-200 hover:border-pink-300 text-gray-600'
                      }`}
                    >
                      <Icon size={14} className="sm:w-4 sm:h-4" />
                      <span className="text-xs sm:text-sm font-medium">{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Emoji Picker */}
            {config.icon?.type === 'emoji' && (
              <div className="relative">
                <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-2">
                  اختر إيموجي
                </label>
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="w-full p-2.5 sm:p-3 border border-gray-200 rounded-lg flex items-center justify-between hover:border-pink-300 transition-colors"
                >
                  <span className="text-xl sm:text-2xl">{config.icon.value}</span>
                  <span className="text-xs sm:text-sm text-gray-500">اضغط للاختيار</span>
                </button>

                {showEmojiPicker && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-2 sm:p-3 z-10 max-h-40 sm:max-h-48 overflow-y-auto">
                    <div className="grid grid-cols-6 sm:grid-cols-8 gap-1 sm:gap-2">
                      {EMOJI_OPTIONS.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => handleEmojiSelect(emoji)}
                          className={`p-1.5 sm:p-2 text-lg sm:text-xl rounded-lg hover:bg-pink-100 transition-colors ${
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
                <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-2">
                  اختر أيقونة
                </label>
                <button
                  type="button"
                  onClick={() => setShowLucidePicker(!showLucidePicker)}
                  className="w-full p-2.5 sm:p-3 border border-gray-200 rounded-lg flex items-center justify-between hover:border-pink-300 transition-colors"
                >
                  <DynamicIcon config={config.icon} size={20} className="sm:w-6 sm:h-6" />
                  <span className="text-xs sm:text-sm text-gray-500">{config.icon.value}</span>
                </button>

                {showLucidePicker && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-2 sm:p-3 z-10 max-h-40 sm:max-h-48 overflow-y-auto">
                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-1 sm:gap-2">
                      {LUCIDE_ICON_OPTIONS.map((iconName) => (
                        <button
                          key={iconName}
                          type="button"
                          onClick={() => handleLucideSelect(iconName)}
                          className={`p-1.5 sm:p-2 rounded-lg hover:bg-pink-100 transition-colors flex flex-col items-center gap-0.5 sm:gap-1 ${
                            config.icon?.value === iconName ? 'bg-pink-200' : ''
                          }`}
                        >
                          <DynamicIcon
                            config={{ type: 'lucide', value: iconName }}
                            size={16}
                            className="sm:w-5 sm:h-5"
                          />
                          <span className="text-[9px] sm:text-xs text-gray-500 truncate w-full text-center">
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
                <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-2">
                  رابط الصورة
                </label>
                <input
                  type="url"
                  value={customIconUrl}
                  onChange={(e) => handleCustomUrlChange(e.target.value)}
                  placeholder="https://example.com/icon.png"
                  className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
                {customIconUrl && (
                  <div className="mt-2 p-2 bg-gray-50 rounded-lg flex items-center justify-center">
                    <DynamicIcon config={config.icon} size={28} className="sm:w-8 sm:h-8" />
                  </div>
                )}
              </div>
            )}

            {/* Icon Preview */}
            <div className="p-3 sm:p-4 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <p className="text-[10px] sm:text-xs text-gray-500 mb-1.5 sm:mb-2">معاينة الأيقونة</p>
                <DynamicIcon config={config.icon!} size={36} className="sm:w-12 sm:h-12" />
              </div>
            </div>
          </div>
        )}
      </div>


      {/* Colors Section */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        {renderSectionHeader(
          'الألوان',
          'colors',
          <Palette size={16} className="text-pink-500 sm:w-[18px] sm:h-[18px]" />
        )}

        {expandedSections.colors && (
          <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-2">
                اللون الرئيسي
              </label>
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                {ACCENT_COLOR_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => updateConfig({ accent_color: option.value })}
                    className={`p-1.5 sm:p-2 rounded-lg border-2 transition-all flex items-center gap-1.5 sm:gap-2 ${
                      config.accent_color === option.value
                        ? 'border-gray-800 bg-gray-50'
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <span
                      className="w-4 h-4 sm:w-5 sm:h-5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: option.color }}
                    />
                    <span className="text-[10px] sm:text-xs text-gray-600">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Live Preview Section - Requirements 4.1, 4.2, 4.3 */}
      {showPreview && (
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          {renderSectionHeader(
            'معاينة مباشرة',
            'preview',
            <Eye size={16} className="text-emerald-500 sm:w-[18px] sm:h-[18px]" />
          )}

          {expandedSections.preview && (
            <div className="p-3 sm:p-4">
              <p className="text-xs text-gray-500 mb-3">
                معاينة كيف ستظهر الخيارات بالإعدادات الحالية (مع header وأيقونة ووصف)
              </p>
              
              {/* Preview Container - Task 5.1, 5.2, 5.3 */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 min-h-[200px]">
                {/* 
                  Task 5.1: Use OptionGroupRenderer instead of OptionRenderer
                  Task 5.2: canRenderMode fallback logic is handled internally by OptionGroupRenderer
                  Task 5.3: Header with icon and description is shown by OptionGroupRenderer
                */}
                <OptionGroupRenderer
                  group={{
                    // Mock group object for preview
                    id: 'preview-group',
                    groupName: 'معاينة المجموعة',
                    name_ar: 'معاينة المجموعة',
                    name_en: 'Preview Group',
                    description_ar: 'هذه معاينة لكيفية ظهور الخيارات للعملاء',
                    description_en: 'This is a preview of how options will appear to customers',
                    groupIcon: config.icon?.value,
                    icon: config.icon?.value,
                    ui_config: config,
                    options: sampleOptions,
                    maxSelections: 3,
                    minSelections: 0,
                    max_selections: 3,
                    min_selections: 0,
                  }}
                  selections={previewSelectedIds}
                  onSelectionChange={setPreviewSelectedIds}
                  language="ar"
                />
              </div>

              {/* Preview Info */}
              <div className="mt-3 flex flex-wrap gap-2 text-[10px] text-gray-500">
                <span className="px-2 py-1 bg-gray-100 rounded">
                  النمط: {DISPLAY_MODE_OPTIONS.find(m => m.value === config.display_mode)?.label}
                </span>
                <span className="px-2 py-1 bg-gray-100 rounded">
                  الاحتياطي: {FALLBACK_STYLE_OPTIONS.find(s => s.value === config.fallback_style)?.label}
                </span>
                <span className="px-2 py-1 bg-gray-100 rounded">
                  الأعمدة: {config.columns === 'auto' ? 'تلقائي' : config.columns}
                </span>
                {config.nutrition?.show && (
                  <span className="px-2 py-1 bg-orange-100 text-orange-600 rounded">
                    التغذية: مفعّل
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UIConfigEditor;
