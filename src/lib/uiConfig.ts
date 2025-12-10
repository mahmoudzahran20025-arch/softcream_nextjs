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
  show_descriptions?: boolean;
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
 * Normalize legacy config fields to new structure
 * Handles backward compatibility with older config formats
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
  
  // Map legacy section_type to display_mode if not set
  if (config.section_type && !config.display_mode) {
    const sectionMap: Record<string, DisplayMode> = {
      'default': 'default',
      'hero_selection': 'hero_flavor',
      'compact_addons': 'default',
      'interactive_meter': 'smart_meter'
    };
    normalized.display_mode = sectionMap[config.section_type] || 'default';
  }
  
  // Map camelCase to snake_case for common fields
  if (config.cardSize !== undefined) normalized.card_size = config.cardSize;
  if (config.showImages !== undefined) normalized.show_images = config.showImages;
  if (config.showPrices !== undefined) normalized.show_prices = config.showPrices;
  if (config.showMacros !== undefined) normalized.show_macros = config.showMacros;
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
 * Stringify UIConfig for database storage
 * 
 * @param config - UIConfig object
 * @returns JSON string
 */
export function stringifyUIConfig(config: UIConfig): string {
  return JSON.stringify(config);
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
