// ================================================================
// advanced-options-ui.integration.test.ts - Integration Tests for Advanced Options UI System
// Tests: Admin option group flow & Customer option display
// **Validates: Requirements 9.1, 9.4, 4.2, 5.2, 3.1**
// ================================================================

import { describe, it, expect, beforeEach } from 'vitest'
import {
  parseUIConfig,
  mergeUIConfig,
  stringifyUIConfig,
  DEFAULT_UI_CONFIG,
  type UIConfig,
  type DisplayMode,
  type FallbackStyle,
  type IconConfig,
  type NutritionDisplayConfig,
} from '@/lib/uiConfig'
import { calculateLayout, type LayoutResult } from '@/lib/layoutCalculator'
import { hasNutritionData, type NutritionValues } from '@/components/shared/NutritionBadge'
import { STYLE_CONTENT_MAP } from '@/components/shared/OptionRenderer'

// ================================================================
// Test Data - Simulating Admin Operations
// ================================================================

/**
 * Mock option group data as it would come from the API
 */
const mockOptionGroup = {
  id: 'flavors',
  name_ar: 'نكهات الآيس كريم',
  name_en: 'Ice Cream Flavors',
  description_ar: 'اختر نكهاتك المفضلة :: ميكس حتى 2 نكهة',
  description_en: 'Pick your favorites :: Mix up to 2 flavors',
  display_order: 2,
  icon: '🍦',
  display_style: 'cards',
  ui_config: JSON.stringify({
    display_mode: 'hero_flavor',
    fallback_style: 'cards',
    columns: 3,
    card_size: 'lg',
    spacing: 'normal',
    show_images: true,
    show_prices: false,
    show_descriptions: true,
    nutrition: { show: true, format: 'compact', fields: ['calories', 'protein'] },
    icon: { type: 'lucide', value: 'IceCream', fallback: 'Cake' },
    accent_color: 'pink'
  })
}

/**
 * Mock options with nutrition data
 */
const mockOptions = [
  {
    id: 'flavor_vanilla',
    name_ar: 'فانيليا',
    name_en: 'Vanilla',
    description_ar: 'فانيليا كريمية كلاسيكية',
    description_en: 'Classic creamy vanilla',
    base_price: 0,
    image: 'https://example.com/vanilla.jpg',
    calories: 100,
    protein: 2,
    carbs: 12,
    fat: 5,
    sugar: 10,
    fiber: 0,
  },
  {
    id: 'flavor_chocolate',
    name_ar: 'شوكولاتة',
    name_en: 'Chocolate',
    description_ar: 'شوكولاتة بلجيكية غنية',
    description_en: 'Rich Belgian chocolate',
    base_price: 0,
    image: 'https://example.com/chocolate.jpg',
    calories: 120,
    protein: 3,
    carbs: 14,
    fat: 6,
    sugar: 11,
    fiber: 1,
  },
  {
    id: 'flavor_mango',
    name_ar: 'مانجو',
    name_en: 'Mango',
    description_ar: 'مانجو طبيعي منعش',
    description_en: 'Refreshing natural mango',
    base_price: 0,
    // No image - for fallback testing
    calories: 95,
    protein: 1,
    carbs: 18,
    fat: 2,
    sugar: 15,
    fiber: 1,
  },
]

// ================================================================
// Integration Test: Admin Option Group Flow
// Task 20.1 - Requirements: 9.1, 9.4
// ================================================================

describe('Integration: Admin Option Group Flow', () => {
  describe('Step 1: Creating Group with UI Config Fields', () => {
    it('creates option group with all new ui_config fields', () => {
      // Admin creates a new option group with ui_config
      const newGroupConfig: UIConfig = {
        display_mode: 'brand_accent',
        fallback_style: 'cards',
        columns: 2,
        card_size: 'md',
        spacing: 'normal',
        show_images: true,
        show_prices: true,
        show_descriptions: true,
        nutrition: {
          show: true,
          format: 'compact',
          fields: ['calories', 'protein']
        },
        icon: {
          type: 'lucide',
          value: 'Droplet',
          fallback: 'Circle'
        },
        accent_color: 'amber'
      }

      // Stringify for database storage
      const jsonString = stringifyUIConfig(newGroupConfig)
      expect(jsonString).toBeTruthy()
      expect(typeof jsonString).toBe('string')

      // Parse back to verify round-trip
      const parsed = parseUIConfig(jsonString)
      expect(parsed.display_mode).toBe('brand_accent')
      expect(parsed.fallback_style).toBe('cards')
      expect(parsed.columns).toBe(2)
      expect(parsed.nutrition?.show).toBe(true)
      expect(parsed.icon?.value).toBe('Droplet')
    })

    it('validates display_mode values', () => {
      const validModes: DisplayMode[] = ['default', 'hero_flavor', 'smart_meter', 'brand_accent']
      
      validModes.forEach(mode => {
        const config = parseUIConfig({ display_mode: mode })
        expect(config.display_mode).toBe(mode)
      })
    })

    it('validates fallback_style values', () => {
      const validStyles: FallbackStyle[] = ['cards', 'grid', 'list', 'pills', 'checkbox']
      
      validStyles.forEach(style => {
        const config = parseUIConfig({ fallback_style: style })
        expect(config.fallback_style).toBe(style)
      })
    })

    it('validates icon configuration', () => {
      const iconConfigs: IconConfig[] = [
        { type: 'lucide', value: 'IceCream', fallback: 'Circle' },
        { type: 'emoji', value: '🍦' },
        { type: 'custom', value: 'https://example.com/icon.png' }
      ]

      iconConfigs.forEach(iconConfig => {
        const config = parseUIConfig({ icon: iconConfig })
        expect(config.icon?.type).toBe(iconConfig.type)
        expect(config.icon?.value).toBe(iconConfig.value)
      })
    })

    it('validates nutrition configuration', () => {
      const nutritionConfig: NutritionDisplayConfig = {
        show: true,
        format: 'badges',
        fields: ['calories', 'protein', 'carbs', 'fat']
      }

      const config = parseUIConfig({ nutrition: nutritionConfig })
      expect(config.nutrition?.show).toBe(true)
      expect(config.nutrition?.format).toBe('badges')
      expect(config.nutrition?.fields).toContain('calories')
      expect(config.nutrition?.fields).toContain('protein')
    })
  })

  describe('Step 2: Editing and Saving UI Config', () => {
    it('merges partial updates with existing config (Requirement 9.4)', () => {
      // Start with existing config
      const existingConfig = parseUIConfig(mockOptionGroup.ui_config)
      
      // Admin makes partial update - only change display_mode
      const partialUpdate: Partial<UIConfig> = {
        display_mode: 'smart_meter'
      }

      // Merge changes
      const mergedConfig = mergeUIConfig(existingConfig, partialUpdate)

      // Verify updated field
      expect(mergedConfig.display_mode).toBe('smart_meter')
      
      // Verify preserved fields
      expect(mergedConfig.fallback_style).toBe('cards')
      expect(mergedConfig.columns).toBe(3)
      expect(mergedConfig.nutrition?.show).toBe(true)
      expect(mergedConfig.icon?.value).toBe('IceCream')
      expect(mergedConfig.accent_color).toBe('pink')
    })

    it('preserves nested nutrition config on partial update', () => {
      const existingConfig = parseUIConfig(mockOptionGroup.ui_config)
      
      // Update only nutrition.show
      const partialUpdate: Partial<UIConfig> = {
        nutrition: {
          ...existingConfig.nutrition!,
          show: false
        }
      }

      const mergedConfig = mergeUIConfig(existingConfig, partialUpdate)

      // Verify nutrition.show is updated
      expect(mergedConfig.nutrition?.show).toBe(false)
      // Verify other nutrition fields preserved
      expect(mergedConfig.nutrition?.format).toBe('compact')
      expect(mergedConfig.nutrition?.fields).toContain('calories')
    })

    it('preserves nested icon config on partial update', () => {
      const existingConfig = parseUIConfig(mockOptionGroup.ui_config)
      
      // Update only icon.value
      const partialUpdate: Partial<UIConfig> = {
        icon: {
          ...existingConfig.icon!,
          value: 'Cookie'
        }
      }

      const mergedConfig = mergeUIConfig(existingConfig, partialUpdate)

      // Verify icon.value is updated
      expect(mergedConfig.icon?.value).toBe('Cookie')
      // Verify other icon fields preserved
      expect(mergedConfig.icon?.type).toBe('lucide')
      expect(mergedConfig.icon?.fallback).toBe('Cake')
    })

    it('handles reset to defaults', () => {
      // Admin resets to defaults
      const resetConfig = { ...DEFAULT_UI_CONFIG }

      expect(resetConfig.display_mode).toBe('default')
      expect(resetConfig.fallback_style).toBe('cards')
      expect(resetConfig.nutrition?.show).toBe(false)
    })
  })

  describe('Step 3: UI Config Persistence Round-Trip', () => {
    it('maintains data integrity through save/load cycle', () => {
      const originalConfig: UIConfig = {
        display_mode: 'hero_flavor',
        fallback_style: 'grid',
        columns: 3,
        card_size: 'lg',
        spacing: 'loose',
        show_images: true,
        show_prices: false,
        show_descriptions: true,
        nutrition: {
          show: true,
          format: 'detailed',
          fields: ['calories', 'protein', 'carbs', 'fat']
        },
        icon: {
          type: 'lucide',
          value: 'Cherry',
          fallback: 'Apple'
        },
        accent_color: 'purple'
      }

      // Simulate save to database
      const jsonString = stringifyUIConfig(originalConfig)
      
      // Simulate load from database
      const loadedConfig = parseUIConfig(jsonString)

      // Verify all fields match
      expect(loadedConfig.display_mode).toBe(originalConfig.display_mode)
      expect(loadedConfig.fallback_style).toBe(originalConfig.fallback_style)
      expect(loadedConfig.columns).toBe(originalConfig.columns)
      expect(loadedConfig.card_size).toBe(originalConfig.card_size)
      expect(loadedConfig.spacing).toBe(originalConfig.spacing)
      expect(loadedConfig.show_images).toBe(originalConfig.show_images)
      expect(loadedConfig.show_prices).toBe(originalConfig.show_prices)
      expect(loadedConfig.show_descriptions).toBe(originalConfig.show_descriptions)
      expect(loadedConfig.nutrition).toEqual(originalConfig.nutrition)
      // Icon may have additional default fields (style, animation) added by parseUIConfig
      expect(loadedConfig.icon?.type).toBe(originalConfig.icon?.type)
      expect(loadedConfig.icon?.value).toBe(originalConfig.icon?.value)
      expect(loadedConfig.icon?.fallback).toBe(originalConfig.icon?.fallback)
      expect(loadedConfig.accent_color).toBe(originalConfig.accent_color)
    })
  })
})

// ================================================================
// Integration Test: Customer Option Display
// Task 20.2 - Requirements: 4.2, 5.2, 3.1
// ================================================================

describe('Integration: Customer Option Display', () => {
  describe('Step 1: Display Mode Rendering (Requirement 4.2)', () => {
    it('parses display_mode from ui_config correctly', () => {
      const config = parseUIConfig(mockOptionGroup.ui_config)
      expect(config.display_mode).toBe('hero_flavor')
    })

    it('applies default display_mode when not specified', () => {
      const config = parseUIConfig({})
      expect(config.display_mode).toBe('default')
    })

    it('maps each display_mode to expected layout structure', () => {
      const modes: DisplayMode[] = ['default', 'hero_flavor', 'smart_meter', 'brand_accent']
      
      modes.forEach(mode => {
        const config = parseUIConfig({ display_mode: mode })
        expect(config.display_mode).toBe(mode)
        // Each mode should have a valid fallback_style
        expect(['cards', 'grid', 'list', 'pills', 'checkbox']).toContain(config.fallback_style)
      })
    })
  })

  describe('Step 2: Fallback Activation (Requirement 5.2)', () => {
    /**
     * Helper to check if mode can render
     * Mirrors canRenderMode from DisplayModeRenderer
     */
    function canRenderMode(mode: DisplayMode, options: typeof mockOptions): boolean {
      switch (mode) {
        case 'hero_flavor':
          return options.some(o => o.image)
        case 'smart_meter':
          return options.length >= 2
        case 'brand_accent':
        case 'default':
        default:
          return true
      }
    }

    it('hero_flavor mode requires at least one option with image', () => {
      // Options with images - can render
      expect(canRenderMode('hero_flavor', mockOptions)).toBe(true)
      
      // Options without images - cannot render
      const noImageOptions = mockOptions.map(o => ({ ...o, image: undefined }))
      expect(canRenderMode('hero_flavor', noImageOptions)).toBe(false)
    })

    it('smart_meter mode requires at least 2 options', () => {
      // 3 options - can render
      expect(canRenderMode('smart_meter', mockOptions)).toBe(true)
      
      // 1 option - cannot render
      expect(canRenderMode('smart_meter', [mockOptions[0]])).toBe(false)
      
      // 0 options - cannot render
      expect(canRenderMode('smart_meter', [])).toBe(false)
    })

    it('default and brand_accent modes always render', () => {
      expect(canRenderMode('default', [])).toBe(true)
      expect(canRenderMode('brand_accent', [])).toBe(true)
      expect(canRenderMode('default', mockOptions)).toBe(true)
      expect(canRenderMode('brand_accent', mockOptions)).toBe(true)
    })

    it('falls back to fallback_style when mode cannot render', () => {
      const config = parseUIConfig({
        display_mode: 'hero_flavor',
        fallback_style: 'pills'
      })

      // No images - hero_flavor cannot render
      const noImageOptions = mockOptions.map(o => ({ ...o, image: undefined }))
      const canRender = canRenderMode(config.display_mode, noImageOptions)
      
      expect(canRender).toBe(false)
      // Should use fallback_style
      expect(config.fallback_style).toBe('pills')
    })
  })

  describe('Step 3: Nutrition Display (Requirement 3.1)', () => {
    it('shows nutrition when ui_config.nutrition.show is true', () => {
      const config = parseUIConfig(mockOptionGroup.ui_config)
      expect(config.nutrition?.show).toBe(true)
    })

    it('hides nutrition when ui_config.nutrition.show is false', () => {
      const config = parseUIConfig({
        nutrition: { show: false, format: 'compact', fields: ['calories'] }
      })
      expect(config.nutrition?.show).toBe(false)
    })

    it('detects options with nutrition data', () => {
      const optionWithNutrition: NutritionValues = {
        calories: 100,
        protein: 5,
        carbs: 20,
        fat: 3
      }
      expect(hasNutritionData(optionWithNutrition)).toBe(true)
    })

    it('detects options without nutrition data', () => {
      const optionWithoutNutrition: NutritionValues = {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0
      }
      expect(hasNutritionData(optionWithoutNutrition)).toBe(false)
      expect(hasNutritionData(undefined)).toBe(false)
    })

    it('respects nutrition format setting', () => {
      const formats: ('compact' | 'detailed' | 'badges')[] = ['compact', 'detailed', 'badges']
      
      formats.forEach(format => {
        const config = parseUIConfig({
          nutrition: { show: true, format, fields: ['calories'] }
        })
        expect(config.nutrition?.format).toBe(format)
      })
    })

    it('respects nutrition fields setting', () => {
      const config = parseUIConfig({
        nutrition: { 
          show: true, 
          format: 'compact', 
          fields: ['calories', 'protein', 'fat'] 
        }
      })
      
      expect(config.nutrition?.fields).toContain('calories')
      expect(config.nutrition?.fields).toContain('protein')
      expect(config.nutrition?.fields).toContain('fat')
      expect(config.nutrition?.fields).not.toContain('carbs')
    })
  })

  describe('Step 4: Adaptive Layout (Requirements 6.1-6.4)', () => {
    it('calculates columns based on option count', () => {
      // 1-3 options: single row
      const layout1 = calculateLayout(1)
      const layout2 = calculateLayout(2)
      const layout3 = calculateLayout(3)
      expect(layout1.columns).toBeLessThanOrEqual(3)
      expect(layout2.columns).toBeLessThanOrEqual(3)
      expect(layout3.columns).toBeLessThanOrEqual(3)

      // 4-6 options: 2 columns
      const layout4 = calculateLayout(4)
      const layout6 = calculateLayout(6)
      expect(layout4.columns).toBe(2)
      expect(layout6.columns).toBe(2)

      // 7+ options: 3 columns
      const layout7 = calculateLayout(7)
      const layout10 = calculateLayout(10)
      expect(layout7.columns).toBe(3)
      expect(layout10.columns).toBe(3)
    })

    it('respects explicit column override', () => {
      const layout = calculateLayout(10, 4)
      expect(layout.columns).toBe(4)
    })

    it('uses auto calculation when columns is "auto"', () => {
      const layout = calculateLayout(5, 'auto')
      expect(layout.columns).toBe(2) // 4-6 options = 2 columns
    })
  })

  describe('Step 5: Content Boundaries per Style (Requirements 7.1-7.5)', () => {
    it('cards style shows: image, title, description, price, nutrition', () => {
      const cardsContent = STYLE_CONTENT_MAP['cards']
      expect(cardsContent).toContain('image')
      expect(cardsContent).toContain('title')
      expect(cardsContent).toContain('description')
      expect(cardsContent).toContain('price')
      expect(cardsContent).toContain('nutrition')
    })

    it('grid style shows: image, title, price only', () => {
      const gridContent = STYLE_CONTENT_MAP['grid']
      expect(gridContent).toContain('image')
      expect(gridContent).toContain('title')
      expect(gridContent).toContain('price')
      expect(gridContent).not.toContain('description')
      expect(gridContent).not.toContain('nutrition')
    })

    it('pills style shows: title, price_modifier only', () => {
      const pillsContent = STYLE_CONTENT_MAP['pills']
      expect(pillsContent).toContain('title')
      expect(pillsContent).toContain('price_modifier')
      expect(pillsContent).not.toContain('image')
      expect(pillsContent).not.toContain('description')
    })

    it('list style shows: icon, title, description, price', () => {
      const listContent = STYLE_CONTENT_MAP['list']
      expect(listContent).toContain('icon')
      expect(listContent).toContain('title')
      expect(listContent).toContain('description')
      expect(listContent).toContain('price')
    })

    it('checkbox style shows: checkbox, title, price', () => {
      const checkboxContent = STYLE_CONTENT_MAP['checkbox']
      expect(checkboxContent).toContain('checkbox')
      expect(checkboxContent).toContain('title')
      expect(checkboxContent).toContain('price')
    })
  })
})

// ================================================================
// Integration Test: Complete Flow Simulation
// ================================================================

describe('Integration: Complete Admin to Customer Flow', () => {
  it('simulates complete flow from admin config to customer display', () => {
    // Step 1: Admin creates option group with ui_config
    const adminConfig: UIConfig = {
      display_mode: 'hero_flavor',
      fallback_style: 'cards',
      columns: 3,
      card_size: 'lg',
      spacing: 'normal',
      show_images: true,
      show_prices: true,
      show_descriptions: true,
      nutrition: {
        show: true,
        format: 'compact',
        fields: ['calories', 'protein']
      },
      icon: {
        type: 'lucide',
        value: 'IceCream',
        fallback: 'Cake'
      },
      accent_color: 'pink'
    }

    // Step 2: Save to database (stringify)
    const savedJson = stringifyUIConfig(adminConfig)
    expect(savedJson).toBeTruthy()

    // Step 3: Customer loads product (parse)
    const loadedConfig = parseUIConfig(savedJson)
    expect(loadedConfig.display_mode).toBe('hero_flavor')

    // Step 4: Check if display mode can render
    const canRenderHero = mockOptions.some(o => o.image)
    expect(canRenderHero).toBe(true)

    // Step 5: Calculate layout
    const layout = calculateLayout(mockOptions.length, loadedConfig.columns)
    expect(layout.columns).toBe(3)

    // Step 6: Check nutrition display
    expect(loadedConfig.nutrition?.show).toBe(true)
    const hasNutrition = mockOptions.every(o => hasNutritionData({
      calories: o.calories,
      protein: o.protein,
      carbs: o.carbs,
      fat: o.fat
    }))
    expect(hasNutrition).toBe(true)

    // Step 7: Verify content boundaries for fallback style
    const contentBoundaries = STYLE_CONTENT_MAP[loadedConfig.fallback_style]
    expect(contentBoundaries).toContain('image')
    expect(contentBoundaries).toContain('title')
  })

  it('handles fallback scenario when hero mode cannot render', () => {
    // Admin config with hero_flavor mode
    const adminConfig: UIConfig = {
      display_mode: 'hero_flavor',
      fallback_style: 'pills',
      columns: 'auto',
      nutrition: { show: false, format: 'compact', fields: ['calories'] },
      icon: { type: 'lucide', value: 'IceCream', fallback: 'Circle' }
    }

    // Save and load
    const savedJson = stringifyUIConfig(adminConfig)
    const loadedConfig = parseUIConfig(savedJson)

    // Options without images - hero cannot render
    const noImageOptions = mockOptions.map(o => ({ ...o, image: undefined }))
    const canRenderHero = noImageOptions.some(o => o.image)
    expect(canRenderHero).toBe(false)

    // Should fall back to pills style
    expect(loadedConfig.fallback_style).toBe('pills')
    
    // Pills content boundaries
    const pillsContent = STYLE_CONTENT_MAP['pills']
    expect(pillsContent).toContain('title')
    expect(pillsContent).toContain('price_modifier')
  })
})

// ================================================================
// Integration Test: Legacy Config Migration
// ================================================================

describe('Integration: Legacy Config Migration', () => {
  it('migrates legacy displayMode to display_mode', () => {
    const legacyConfig = {
      displayMode: 'grid',
      showImages: true
    }

    const config = parseUIConfig(legacyConfig)
    // Legacy 'grid' maps to 'default' display_mode
    expect(config.display_mode).toBe('default')
    expect(config.show_images).toBe(true)
  })

  it('migrates legacy section_type to display_mode', () => {
    const legacyConfig = {
      section_type: 'hero_selection'
    }

    const config = parseUIConfig(legacyConfig)
    expect(config.display_mode).toBe('hero_flavor')
  })

  it('migrates legacy display_style to fallback_style', () => {
    const legacyConfig = {
      display_style: 'pills'
    }

    const config = parseUIConfig(legacyConfig)
    expect(config.fallback_style).toBe('pills')
  })

  it('handles empty or invalid JSON gracefully', () => {
    // Empty string
    const config1 = parseUIConfig('')
    expect(config1.display_mode).toBe('default')

    // Invalid JSON
    const config2 = parseUIConfig('not valid json')
    expect(config2.display_mode).toBe('default')

    // Null
    const config3 = parseUIConfig(null)
    expect(config3.display_mode).toBe('default')

    // Empty object
    const config4 = parseUIConfig({})
    expect(config4.display_mode).toBe('default')
  })
})
