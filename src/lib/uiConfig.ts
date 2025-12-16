// src/lib/uiConfig.ts - UI Configuration Parser
// ================================================================
// Extended for Advanced Options UI System
// Requirements: 4.1, 5.1, 8.1, 8.3, 8.4, 8.5

// ================================================================
// Type Definitions
// ================================================================

/**
 * Display Mode - Primary rendering mode for option groups
 * Requirements: 4.1
 */
export type DisplayMode = 'default' | 'hero_flavor' | 'smart_meter' | 'brand_accent';

/**
 * Fallback Style - Secondary rendering style when primary mode cannot render
 * Requirements: 5.1
 */
export type FallbackStyle = 'cards' | 'grid' | 'list' | 'pills' | 'checkbox';

/**
 * Icon Configuration with Lucide support and fallback
 * Requirements: 2.2, 2.4, 2.5
 */
export interface IconConfig {
  type: 'emoji' | 'lucide' | 'custom';
  value: string;
  fallback?: string; // Fallback icon if primary fails
  style?: 'solid' | 'gradient' | 'glow';
  animation?: 'none' | 'pulse' | 'bounce' | 'spin';
}

/**
 * Layout Configuration
 */
export interface LayoutConfig {
  spacing?: 'compact' | 'normal' | 'loose';
  alignment?: 'left' | 'center' | 'right';
}

/**
 * Nutrition Display Configuration
 * Requirements: 3.1, 3.2, 3.3
 */
export interface NutritionDisplayConfig {
  show: boolean;
  format: 'compact' | 'detailed' | 'badges';
  fields: ('calories' | 'protein' | 'carbs' | 'fat')[];
}

/**
 * Extended UI Configuration Interface
 * Requirements: 4.1, 5.1, 8.1
 */
export interface UIConfig {
  // Display Mode (Primary) - Requirements: 4.1
  display_mode: DisplayMode;
  
  // Fallback Style (When primary mode can't render) - Requirements: 5.1
  fallback_style: FallbackStyle;
  
  // Legacy field for backward compatibility
  display_style?: FallbackStyle;
  section_type?: 'default' | 'hero_selection' | 'compact_addons' | 'interactive_meter';
  
  // Layout - Requirements: 6.4
  columns?: 1 | 2 | 3 | 4 | 'auto';
  card_size?: 'sm' | 'md' | 'lg';
  spacing?: 'compact' | 'normal' | 'loose';
  
  // Content Display
  show_images?: boolean;
  show_prices?: boolean;
  show_descriptions?: boolean;      // وصف الخيار الفردي
  show_group_description?: boolean; // وصف المجموعة (تحت العنوان) - Requirements: 7.1, 7.2, 7.3
  show_macros?: boolean; // Legacy field
  
  // Nutrition - Requirements: 3.1, 3.2
  nutrition?: NutritionDisplayConfig;
  
  // Icon - Requirements: 2.2
  icon?: IconConfig;
  
  // Layout (legacy)
  layout?: LayoutConfig;
  
  // Styling
  accent_color?: string;
  badge?: string;
  badge_color?: string;
  theme?: string;
}


// ================================================================
// Default Configuration
// ================================================================

/**
 * Default UI Configuration with sensible defaults
 * Requirements: 8.4
 */
export const DEFAULT_UI_CONFIG: UIConfig = {
  display_mode: 'default',
  fallback_style: 'cards',
  display_style: 'grid', // Legacy compatibility
  section_type: 'default',
  columns: 'auto',
  card_size: 'md',
  spacing: 'normal',
  show_images: true,
  show_prices: true,
  show_descriptions: false,
  show_group_description: true, // Default: show group description - Requirements: 7.3
  show_macros: false,
  nutrition: {
    show: false,
    format: 'compact',
    fields: ['calories']
  },
  icon: {
    type: 'lucide',
    value: 'Package',
    fallback: 'Circle',
    style: 'solid',
    animation: 'none'
  },
  layout: {
    spacing: 'normal',
    alignment: 'center'
  },
  accent_color: 'pink'
};

// ================================================================
// Deep Merge Utility
// ================================================================

/**
 * Deep merge two objects, with source values taking precedence
 * Handles nested objects properly
 */
function deepMerge<T extends Record<string, any>>(target: T, source: Partial<T>): T {
  const result = { ...target };
  
  for (const key in source) {
    if (source[key] !== undefined && source[key] !== null) {
      if (
        typeof source[key] === 'object' &&
        !Array.isArray(source[key]) &&
        source[key] !== null &&
        typeof target[key] === 'object' &&
        !Array.isArray(target[key]) &&
        target[key] !== null
      ) {
        // Recursively merge nested objects
        result[key] = deepMerge(target[key], source[key] as any);
      } else {
        // Direct assignment for primitives and arrays
        result[key] = source[key] as any;
      }
    }
  }
  
  return result;
}

// ================================================================
// Parser Functions
// ================================================================

/**
 * Parse UI Config JSON string with defaults merging
 * Requirements: 8.3, 8.4, 8.5
 * 
 * @param uiConfigJSON - JSON string or object from database
 * @returns Parsed UIConfig with defaults for missing fields
 */
export function parseUIConfig(uiConfigJSON?: string | object | null): UIConfig {
  // Handle empty/null/undefined input - return defaults
  if (!uiConfigJSON || uiConfigJSON === '{}') {
    return { ...DEFAULT_UI_CONFIG };
  }

  try {
    // Parse JSON string if needed
    const parsed = typeof uiConfigJSON === 'string' 
      ? JSON.parse(uiConfigJSON) 
      : uiConfigJSON;
    
    // Handle non-object parsed values
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      console.warn('UI Config is not an object, using defaults');
      return { ...DEFAULT_UI_CONFIG };
    }

    // Map legacy fields to new fields
    const normalized = normalizeLegacyConfig(parsed);
    
    // Deep merge with defaults
    return deepMerge(DEFAULT_UI_CONFIG, normalized);
  } catch (error) {
    console.error('Failed to parse UI config:', error);
    return { ...DEFAULT_UI_CONFIG };
  }
}

/**
 * Legacy field mapping table
 * Maps old section_type values to new display_mode values
 */
const SECTION_TYPE_TO_DISPLAY_MODE: Record<string, DisplayMode> = {
  'default': 'default',
  'hero_selection': 'hero_flavor',
  'compact_addons': 'default',
  'interactive_meter': 'smart_meter'
};

/**
 * Log deprecation warning in development mode
 */
function logDeprecationWarning(field: string, newField: string): void {
  if (process.env.NODE_ENV === 'development') {
    console.warn(`[UIConfig] Deprecated field "${field}" detected. Use "${newField}" instead.`);
  }
}

/**
 * Normalize legacy config fields to new structure
 * Handles backward compatibility with older config formats
 * Requirements: 2.1, 2.2, 2.4 - Legacy field mapping with deprecation warnings
 */
function normalizeLegacyConfig(config: Record<string, any>): Partial<UIConfig> {
  const normalized: Partial<UIConfig> = { ...config };
  
  // Map legacy displayMode to display_mode
  if (config.displayMode && !config.display_mode) {
    // Map old displayMode values to new display_mode
    const modeMap: Record<string, DisplayMode> = {
      'grid': 'default',
      'list': 'default',
      'pills': 'default',
      'cards': 'default',
      'hero_selection': 'hero_flavor',
      'compact_addons': 'default',
      'interactive_meter': 'smart_meter'
    };
    normalized.display_mode = modeMap[config.displayMode] || 'default';
  }
  
  // Map legacy display_style to fallback_style if not set
  if (config.display_style && !config.fallback_style) {
    normalized.fallback_style = config.display_style as FallbackStyle;
  }
  
  // Requirements 2.1: Map legacy section_type to display_mode
  if (config.section_type && !config.display_mode) {
    logDeprecationWarning('section_type', 'display_mode');
    normalized.display_mode = SECTION_TYPE_TO_DISPLAY_MODE[config.section_type] || 'default';
  }
  
  // Requirements 2.2: Map legacy show_macros to nutrition.show
  if (config.show_macros !== undefined && !config.nutrition?.show) {
    logDeprecationWarning('show_macros', 'nutrition.show');
    normalized.nutrition = {
      show: config.show_macros,
      format: config.nutrition?.format || 'compact',
      fields: config.nutrition?.fields || ['calories']
    };
  }
  
  // Map camelCase to snake_case for common fields
  if (config.cardSize !== undefined) normalized.card_size = config.cardSize;
  if (config.showImages !== undefined) normalized.show_images = config.showImages;
  if (config.showPrices !== undefined) normalized.show_prices = config.showPrices;
  if (config.showMacros !== undefined) {
    logDeprecationWarning('showMacros', 'nutrition.show');
    if (!normalized.nutrition) {
      normalized.nutrition = {
        show: config.showMacros,
        format: 'compact',
        fields: ['calories']
      };
    }
  }
  if (config.accentColor !== undefined) normalized.accent_color = config.accentColor;
  if (config.showDescriptions !== undefined) normalized.show_descriptions = config.showDescriptions;
  
  // Ensure icon has fallback
  if (normalized.icon && !normalized.icon.fallback) {
    normalized.icon = {
      ...normalized.icon,
      fallback: 'Circle'
    };
  }
  
  // Ensure nutrition has required fields
  if (normalized.nutrition) {
    normalized.nutrition = {
      show: normalized.nutrition.show ?? false,
      format: normalized.nutrition.format || 'compact',
      fields: normalized.nutrition.fields || ['calories']
    };
  }
  
  return normalized;
}

/**
 * Merge partial config updates with existing config
 * Requirements: 9.4
 * 
 * @param existing - Current UIConfig
 * @param updates - Partial updates to apply
 * @returns Merged UIConfig with updates applied
 */
export function mergeUIConfig(existing: UIConfig, updates: Partial<UIConfig>): UIConfig {
  return deepMerge(existing, updates);
}

/**
 * Clean legacy fields from config before saving
 * Requirements: 2.3 - Saved config uses new fields only
 * 
 * @param config - UIConfig object (may contain legacy fields)
 * @returns Clean UIConfig without legacy fields
 */
export function cleanLegacyFields(config: UIConfig): UIConfig {
  const cleaned = { ...config };
  
  // Remove legacy fields
  delete (cleaned as any).section_type;
  delete (cleaned as any).show_macros;
  delete (cleaned as any).displayMode;
  delete (cleaned as any).showMacros;
  delete (cleaned as any).cardSize;
  delete (cleaned as any).showImages;
  delete (cleaned as any).showPrices;
  delete (cleaned as any).showDescriptions;
  delete (cleaned as any).accentColor;
  
  return cleaned;
}

/**
 * Stringify UIConfig for database storage
 * Automatically cleans legacy fields before stringifying
 * Requirements: 2.3 - Saved config uses new fields only
 * 
 * @param config - UIConfig object
 * @returns JSON string without legacy fields
 */
export function stringifyUIConfig(config: UIConfig): string {
  const cleaned = cleanLegacyFields(config);
  return JSON.stringify(cleaned);
}

/**
 * Get template configuration from template object
 */
export function parseTemplateConfig(templateConfig?: any) {
  if (!templateConfig) return null;

  try {
    return {
      cardPreview: JSON.parse(templateConfig.card_preview_config || '{}'),
      defaultUI: JSON.parse(templateConfig.default_ui_config || '{}')
    };
  } catch (error) {
    console.error('Failed to parse template config:', error);
    return null;
  }
}

/**
 * Get effective icon from option group
 * Requirements: 3.2 - Icon priority: ui_config.icon > group.icon > default
 * 
 * @param uiConfig - Parsed UIConfig object
 * @param legacyIcon - Legacy icon field from option_groups table
 * @returns IconConfig with proper priority applied
 */
export function getEffectiveIcon(uiConfig: UIConfig, legacyIcon?: string): IconConfig {
  // Priority 1: ui_config.icon
  if (uiConfig.icon) {
    return uiConfig.icon;
  }
  
  // Priority 2: Legacy icon field (convert to IconConfig format)
  if (legacyIcon) {
    return {
      type: 'emoji',
      value: legacyIcon,
      fallback: 'Circle'
    };
  }
  
  // Priority 3: Default icon
  return DEFAULT_UI_CONFIG.icon!;
}
