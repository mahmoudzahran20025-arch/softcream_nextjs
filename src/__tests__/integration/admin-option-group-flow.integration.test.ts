// ================================================================
// admin-option-group-flow.integration.test.ts
// Integration Test for Admin Option Group UI Config Flow
// Test: Create group with ui_config → Edit ui_config → Save → Verify persistence
// **Validates: Requirements 9.1, 9.4**
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

// ================================================================
// Test Data - Simulating Admin Operations
// ================================================================

/**
 * Mock option group as returned by the API
 */
const mockOptionGroup = {
  id: 'group-flavors',
  name_ar: 'النكهات',
  name_en: 'Flavors',
  description_ar: 'اختر نكهاتك المفضلة',
  description_en: 'Choose your favorite flavors',
  icon: '🍦',
  display_order: 1,
  ui_config: '{}',
  is_required: 1,
  min_selections: 1,
  max_selections: 3,
}

/**
 * Mock options for the group
 */
const mockOptions = [
  {
    id: 'opt-vanilla',
    name_ar: 'فانيليا كلاسيك',
    name_en: 'Classic Vanilla',
    description_ar: 'نكهة الفانيليا الأصلية',
    base_price: 5,
    calories: 120,
    protein: 3,
    carbs: 15,
    fat: 5,
    image: '/images/vanilla.jpg',
  },
  {
    id: 'opt-chocolate',
    name_ar: 'شوكولاتة غامقة',
    name_en: 'Dark Chocolate',
    description_ar: 'شوكولاتة بلجيكية فاخرة',
    base_price: 7,
    calories: 150,
    protein: 4,
    carbs: 18,
    fat: 7,
    image: '/images/chocolate.jpg',
  },
  {
    id: 'opt-strawberry',
    name_ar: 'فراولة طازجة',
    name_en: 'Fresh Strawberry',
    description_ar: 'فراولة طبيعية 100%',
    base_price: 6,
    calories: 100,
    protein: 2,
    carbs: 12,
    fat: 3,
  },
]

// ================================================================
// Helper Functions for Admin Operations
// ================================================================

/**
 * Simulates creating a new option group with ui_config
 * Requirements: 9.1 - Display UI Config panel with visual controls
 */
function createOptionGroupWithUIConfig(
  groupData: typeof mockOptionGroup,
  uiConfig: Partial<UIConfig>
): typeof mockOptionGroup {
  const fullConfig = mergeUIConfig(DEFAULT_UI_CONFIG, uiConfig)
  return {
    ...groupData,
    ui_config: stringifyUIConfig(fullConfig),
  }
}

/**
 * Simulates updating ui_config for an existing group
 * Requirements: 9.4 - Merge changes with existing config
 */
function updateGroupUIConfig(
  group: typeof mockOptionGroup,
  updates: Partial<UIConfig>
): typeof mockOptionGroup {
  const existingConfig = parseUIConfig(group.ui_config)
  const mergedConfig = mergeUIConfig(existingConfig, updates)
  return {
    ...group,
    ui_config: stringifyUIConfig(mergedConfig),
  }
}

/**
 * Simulates loading a group and parsing its ui_config
 */
function loadGroupUIConfig(group: typeof mockOptionGroup): UIConfig {
  return parseUIConfig(group.ui_config)
}

// ================================================================
// Integration Test: Admin Option Group UI Config Flow
// ================================================================

describe('Integration: Admin Option Group UI Config Flow', () => {
  describe('Step 1: Create Group with UI Config (Requirement 9.1)', () => {
    it('creates group with default ui_config', () => {
      const group = createOptionGroupWithUIConfig(mockOptionGroup, {})
      const config = loadGroupUIConfig(group)
      
      // Should have all default values
      expect(config.display_mode).toBe('default')
      expect(config.fallback_style).toBe('cards')
      expect(config.columns).toBe('auto')
      expect(config.card_size).toBe('md')
      expect(config.spacing).toBe('normal')
      expect(config.show_images).toBe(true)
      expect(config.show_prices).toBe(true)
      expect(config.nutrition?.show).toBe(false)
    })

    it('creates group with custom display_mode', () => {
      const group = createOptionGroupWithUIConfig(mockOptionGroup, {
        display_mode: 'hero_flavor',
      })
      const config = loadGroupUIConfig(group)
      
      expect(config.display_mode).toBe('hero_flavor')
      // Other defaults should be preserved
      expect(config.fallback_style).toBe('cards')
      expect(config.columns).toBe('auto')
    })

    it('creates group with custom fallback_style', () => {
      const group = createOptionGroupWithUIConfig(mockOptionGroup, {
        fallback_style: 'pills',
      })
      const config = loadGroupUIConfig(group)
      
      expect(config.fallback_style).toBe('pills')
      expect(config.display_mode).toBe('default')
    })

    it('creates group with nutrition config enabled', () => {
      const nutritionConfig: NutritionDisplayConfig = {
        show: true,
        format: 'compact',
        fields: ['calories', 'protein'],
      }
      
      const group = createOptionGroupWithUIConfig(mockOptionGroup, {
        nutrition: nutritionConfig,
      })
      const config = loadGroupUIConfig(group)
      
      expect(config.nutrition?.show).toBe(true)
      expect(config.nutrition?.format).toBe('compact')
      expect(config.nutrition?.fields).toContain('calories')
      expect(config.nutrition?.fields).toContain('protein')
    })

    it('creates group with Lucide icon config', () => {
      const iconConfig: IconConfig = {
        type: 'lucide',
        value: 'IceCream',
        fallback: 'Circle',
      }
      
      const group = createOptionGroupWithUIConfig(mockOptionGroup, {
        icon: iconConfig,
      })
      const config = loadGroupUIConfig(group)
      
      expect(config.icon?.type).toBe('lucide')
      expect(config.icon?.value).toBe('IceCream')
      expect(config.icon?.fallback).toBe('Circle')
    })
  })

  describe('Step 2: Edit and Save UI Config (Requirement 9.4)', () => {
    let group: typeof mockOptionGroup

    beforeEach(() => {
      // Start with a group that has some custom config
      group = createOptionGroupWithUIConfig(mockOptionGroup, {
        display_mode: 'default',
        fallback_style: 'cards',
        columns: 2,
        nutrition: {
          show: false,
          format: 'compact',
          fields: ['calories'],
        },
      })
    })

    it('preserves unmodified fields when updating display_mode', () => {
      // Update only display_mode
      const updatedGroup = updateGroupUIConfig(group, {
        display_mode: 'hero_flavor',
      })
      const config = loadGroupUIConfig(updatedGroup)
      
      // Changed field
      expect(config.display_mode).toBe('hero_flavor')
      
      // Preserved fields
      expect(config.fallback_style).toBe('cards')
      expect(config.columns).toBe(2)
      expect(config.nutrition?.show).toBe(false)
    })

    it('preserves unmodified fields when updating nutrition', () => {
      // Update only nutrition
      const updatedGroup = updateGroupUIConfig(group, {
        nutrition: {
          show: true,
          format: 'badges',
          fields: ['calories', 'protein', 'carbs'],
        },
      })
      const config = loadGroupUIConfig(updatedGroup)
      
      // Changed fields
      expect(config.nutrition?.show).toBe(true)
      expect(config.nutrition?.format).toBe('badges')
      expect(config.nutrition?.fields).toEqual(['calories', 'protein', 'carbs'])
      
      // Preserved fields
      expect(config.display_mode).toBe('default')
      expect(config.fallback_style).toBe('cards')
      expect(config.columns).toBe(2)
    })

    it('preserves unmodified fields when updating layout', () => {
      // Update layout settings
      const updatedGroup = updateGroupUIConfig(group, {
        columns: 3,
        card_size: 'lg',
        spacing: 'loose',
      })
      const config = loadGroupUIConfig(updatedGroup)
      
      // Changed fields
      expect(config.columns).toBe(3)
      expect(config.card_size).toBe('lg')
      expect(config.spacing).toBe('loose')
      
      // Preserved fields
      expect(config.display_mode).toBe('default')
      expect(config.fallback_style).toBe('cards')
      expect(config.nutrition?.show).toBe(false)
    })

    it('handles multiple sequential updates correctly', () => {
      // First update: change display_mode
      let updatedGroup = updateGroupUIConfig(group, {
        display_mode: 'brand_accent',
      })
      
      // Second update: enable nutrition
      updatedGroup = updateGroupUIConfig(updatedGroup, {
        nutrition: { show: true, format: 'compact', fields: ['calories'] },
      })
      
      // Third update: change columns
      updatedGroup = updateGroupUIConfig(updatedGroup, {
        columns: 4,
      })
      
      const config = loadGroupUIConfig(updatedGroup)
      
      // All updates should be preserved
      expect(config.display_mode).toBe('brand_accent')
      expect(config.nutrition?.show).toBe(true)
      expect(config.columns).toBe(4)
      // Original fallback_style should still be there
      expect(config.fallback_style).toBe('cards')
    })
  })

  describe('Step 3: UI Config Validation', () => {
    it('handles invalid JSON gracefully', () => {
      const groupWithInvalidConfig = {
        ...mockOptionGroup,
        ui_config: 'not valid json',
      }
      
      const config = loadGroupUIConfig(groupWithInvalidConfig)
      
      // Should return defaults
      expect(config.display_mode).toBe('default')
      expect(config.fallback_style).toBe('cards')
    })

    it('handles empty ui_config', () => {
      const groupWithEmptyConfig = {
        ...mockOptionGroup,
        ui_config: '',
      }
      
      const config = loadGroupUIConfig(groupWithEmptyConfig)
      
      // Should return defaults
      expect(config.display_mode).toBe('default')
      expect(config.fallback_style).toBe('cards')
    })

    it('handles null ui_config', () => {
      const groupWithNullConfig = {
        ...mockOptionGroup,
        ui_config: null as any,
      }
      
      const config = parseUIConfig(groupWithNullConfig.ui_config)
      
      // Should return defaults
      expect(config.display_mode).toBe('default')
      expect(config.fallback_style).toBe('cards')
    })

    it('handles partial ui_config with missing fields', () => {
      const groupWithPartialConfig = {
        ...mockOptionGroup,
        ui_config: '{"display_mode": "hero_flavor"}',
      }
      
      const config = loadGroupUIConfig(groupWithPartialConfig)
      
      // Specified field
      expect(config.display_mode).toBe('hero_flavor')
      
      // Missing fields should have defaults
      expect(config.fallback_style).toBe('cards')
      expect(config.columns).toBe('auto')
      expect(config.nutrition?.show).toBe(false)
    })
  })

  describe('Step 4: Display Mode Selection (Requirement 4.1)', () => {
    it('supports all display modes', () => {
      const displayModes: DisplayMode[] = ['default', 'hero_flavor', 'smart_meter', 'brand_accent']
      
      displayModes.forEach((mode) => {
        const group = createOptionGroupWithUIConfig(mockOptionGroup, {
          display_mode: mode,
        })
        const config = loadGroupUIConfig(group)
        expect(config.display_mode).toBe(mode)
      })
    })
  })

  describe('Step 5: Fallback Style Selection (Requirement 5.1)', () => {
    it('supports all fallback styles', () => {
      const fallbackStyles: FallbackStyle[] = ['cards', 'grid', 'list', 'pills', 'checkbox']
      
      fallbackStyles.forEach((style) => {
        const group = createOptionGroupWithUIConfig(mockOptionGroup, {
          fallback_style: style,
        })
        const config = loadGroupUIConfig(group)
        expect(config.fallback_style).toBe(style)
      })
    })
  })

  describe('Step 6: Complete Admin Flow Simulation', () => {
    it('simulates complete admin workflow for creating and editing option group', () => {
      // Step 1: Admin creates new option group with initial ui_config
      let group = createOptionGroupWithUIConfig(mockOptionGroup, {
        display_mode: 'default',
        fallback_style: 'cards',
      })
      
      let config = loadGroupUIConfig(group)
      expect(config.display_mode).toBe('default')
      expect(config.fallback_style).toBe('cards')
      
      // Step 2: Admin opens UI Config editor and changes display_mode
      group = updateGroupUIConfig(group, {
        display_mode: 'hero_flavor',
      })
      
      config = loadGroupUIConfig(group)
      expect(config.display_mode).toBe('hero_flavor')
      expect(config.fallback_style).toBe('cards') // Preserved
      
      // Step 3: Admin enables nutrition display
      group = updateGroupUIConfig(group, {
        nutrition: {
          show: true,
          format: 'compact',
          fields: ['calories', 'protein'],
        },
      })
      
      config = loadGroupUIConfig(group)
      expect(config.nutrition?.show).toBe(true)
      expect(config.display_mode).toBe('hero_flavor') // Preserved
      
      // Step 4: Admin changes icon to Lucide
      group = updateGroupUIConfig(group, {
        icon: {
          type: 'lucide',
          value: 'IceCream',
          fallback: 'Circle',
        },
      })
      
      config = loadGroupUIConfig(group)
      expect(config.icon?.type).toBe('lucide')
      expect(config.icon?.value).toBe('IceCream')
      expect(config.nutrition?.show).toBe(true) // Preserved
      expect(config.display_mode).toBe('hero_flavor') // Preserved
      
      // Step 5: Admin adjusts layout
      group = updateGroupUIConfig(group, {
        columns: 3,
        card_size: 'lg',
        show_descriptions: true,
      })
      
      config = loadGroupUIConfig(group)
      expect(config.columns).toBe(3)
      expect(config.card_size).toBe('lg')
      expect(config.show_descriptions).toBe(true)
      
      // All previous settings should be preserved
      expect(config.display_mode).toBe('hero_flavor')
      expect(config.nutrition?.show).toBe(true)
      expect(config.icon?.type).toBe('lucide')
      
      // Step 6: Verify final config can be serialized and parsed correctly
      const serialized = stringifyUIConfig(config)
      const reparsed = parseUIConfig(serialized)
      
      expect(reparsed.display_mode).toBe(config.display_mode)
      expect(reparsed.fallback_style).toBe(config.fallback_style)
      expect(reparsed.nutrition?.show).toBe(config.nutrition?.show)
      expect(reparsed.icon?.type).toBe(config.icon?.type)
      expect(reparsed.columns).toBe(config.columns)
    })
  })
})
