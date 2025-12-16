// ================================================================
// uiConfig.test.ts - Property-Based Tests for UI Config Parsing
// **Feature: smart-options-template-system, Property 7: UI Config Parsing**
// **Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5**
// ================================================================

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { parseUIConfig, UIConfig } from './uiConfig'

// ================================================================
// Arbitraries for generating test data
// ================================================================

// Valid icon config arbitrary
const validIconConfigArb = fc.record({
  type: fc.constantFrom('emoji', 'lucide', 'custom'),
  value: fc.string({ minLength: 1 }),
  style: fc.constantFrom('solid', 'gradient', 'glow'),
  animation: fc.constantFrom('none', 'pulse', 'bounce', 'spin'),
})

// Valid layout config arbitrary
const validLayoutConfigArb = fc.record({
  spacing: fc.constantFrom('compact', 'normal', 'loose'),
  alignment: fc.constantFrom('left', 'center', 'right'),
})

// Hex color arbitrary (e.g., "#FF6B9D")
const hexDigit = fc.constantFrom('0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F')
const hexColorArb = fc.tuple(hexDigit, hexDigit, hexDigit, hexDigit, hexDigit, hexDigit)
  .map(digits => `#${digits.join('')}`)

// Valid UI config arbitrary (full structure)
const validUIConfigArb = fc.record({
  displayMode: fc.constantFrom('grid', 'list', 'pills', 'cards'),
  columns: fc.integer({ min: 1, max: 6 }),
  cardSize: fc.constantFrom('sm', 'md', 'lg'),
  showImages: fc.boolean(),
  showPrices: fc.boolean(),
  accentColor: fc.constantFrom('pink', 'amber', 'purple', 'cyan', 'emerald'),
  icon: validIconConfigArb,
  layout: validLayoutConfigArb,
  badge: fc.option(fc.string({ minLength: 1 }), { nil: undefined }),
  badge_color: fc.option(hexColorArb, { nil: undefined }),
  display_style: fc.option(fc.constantFrom('cards', 'pills', 'list', 'checkbox'), { nil: undefined }),
})

// Partial UI config (some fields missing)
const partialUIConfigArb = fc.record({
  badge: fc.option(fc.string({ minLength: 1 }), { nil: undefined }),
  badge_color: fc.option(fc.string({ minLength: 1 }), { nil: undefined }),
  display_style: fc.option(fc.constantFrom('cards', 'pills', 'list', 'checkbox'), { nil: undefined }),
  columns: fc.option(fc.integer({ min: 1, max: 6 }), { nil: undefined }),
})

// Invalid JSON strings
const invalidJsonArb = fc.oneof(
  fc.constant('{invalid json}'),
  fc.constant('{"unclosed": '),
  fc.constant('[1, 2, 3'),
  fc.constant('not json at all'),
  fc.string().filter(s => {
    try { JSON.parse(s); return false } catch { return true }
  }),
)

// Any value arbitrary (for robustness testing)
const anyValueArb = fc.oneof(
  fc.constant(null),
  fc.constant(undefined),
  fc.constant(''),
  fc.constant('{}'),
  fc.string(),
  fc.integer(),
  fc.double(),
  fc.boolean(),
)

describe('UI Config Parser - Property Tests', () => {
  // ================================================================
  // Property 7: UI Config Parsing
  // For any valid ui_config JSON, parsing and re-stringifying SHALL
  // produce an equivalent object. For invalid JSON, the system SHALL
  // return default config.
  // ================================================================

  describe('Property 7: UI Config Parsing', () => {
    it('parseUIConfig never throws for any input', () => {
      fc.assert(
        fc.property(anyValueArb, (input) => {
          // Should never throw
          const result = parseUIConfig(input as string | undefined)
          expect(result).toBeDefined()
          expect(typeof result).toBe('object')
        }),
        { numRuns: 100 }
      )
    })

    it('parseUIConfig returns default config for empty/null/undefined input', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(null, undefined, '', '{}'),
          (input) => {
            const result = parseUIConfig(input as string | undefined)
            // Should return default config with new field names
            expect(result.display_mode).toBe('default')
            expect(result.fallback_style).toBe('cards')
            expect(result.columns).toBe('auto')
            expect(result.card_size).toBe('md')
            expect(result.show_images).toBe(true)
            expect(result.show_prices).toBe(true)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('parseUIConfig returns default config for invalid JSON', () => {
      fc.assert(
        fc.property(invalidJsonArb, (invalidJson) => {
          const result = parseUIConfig(invalidJson)
          // Should return default config without throwing
          expect(result).toBeDefined()
          expect(result.display_mode).toBe('default')
          expect(result.columns).toBe('auto')
        }),
        { numRuns: 100 }
      )
    })

    it('parseUIConfig preserves badge and badge_color from valid JSON (Requirements 4.1, 4.2)', () => {
      fc.assert(
        fc.property(
          fc.record({
            badge: fc.string({ minLength: 1 }),
            badge_color: hexColorArb,
          }),
          (config) => {
            const jsonStr = JSON.stringify(config)
            const result = parseUIConfig(jsonStr)
            
            // Badge and badge_color should be preserved
            expect(result.badge).toBe(config.badge)
            expect(result.badge_color).toBe(config.badge_color)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('parseUIConfig preserves display_style from valid JSON (Requirement 4.3)', () => {
      fc.assert(
        fc.property(
          fc.record({
            display_style: fc.constantFrom('cards', 'pills', 'list', 'checkbox'),
          }),
          (config) => {
            const jsonStr = JSON.stringify(config)
            const result = parseUIConfig(jsonStr)
            
            // display_style should be preserved
            expect(result.display_style).toBe(config.display_style)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('parseUIConfig round-trip: parse(stringify(config)) preserves key fields', () => {
      fc.assert(
        fc.property(partialUIConfigArb, (config) => {
          // Filter out undefined values for clean JSON
          const cleanConfig = Object.fromEntries(
            Object.entries(config).filter(([, v]) => v !== undefined)
          )
          
          const jsonStr = JSON.stringify(cleanConfig)
          const result = parseUIConfig(jsonStr)
          
          // Key fields should be preserved if they were set
          if (cleanConfig.badge) {
            expect(result.badge).toBe(cleanConfig.badge)
          }
          if (cleanConfig.badge_color) {
            expect(result.badge_color).toBe(cleanConfig.badge_color)
          }
          if (cleanConfig.display_style) {
            expect(result.display_style).toBe(cleanConfig.display_style)
          }
          if (cleanConfig.columns) {
            expect(result.columns).toBe(cleanConfig.columns)
          }
        }),
        { numRuns: 100 }
      )
    })

    it('parseUIConfig applies defaults for missing fields (Requirement 4.4)', () => {
      fc.assert(
        fc.property(
          fc.record({
            badge: fc.string({ minLength: 1 }),
            // Other fields intentionally missing
          }),
          (config) => {
            const jsonStr = JSON.stringify(config)
            const result = parseUIConfig(jsonStr)
            
            // Missing fields should have defaults (new field names)
            expect(result.display_mode).toBe('default')
            expect(result.fallback_style).toBe('cards')
            expect(result.columns).toBe('auto')
            expect(result.card_size).toBe('md')
            expect(result.show_images).toBe(true)
            expect(result.show_prices).toBe(true)
            expect(result.accent_color).toBe('pink')
            
            // Badge should be preserved
            expect(result.badge).toBe(config.badge)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('parseUIConfig handles full valid config correctly', () => {
      fc.assert(
        fc.property(validUIConfigArb, (config) => {
          // Filter out undefined values
          const cleanConfig = JSON.parse(JSON.stringify(config))
          const jsonStr = JSON.stringify(cleanConfig)
          const result = parseUIConfig(jsonStr)
          
          // Core fields should be preserved (using snake_case)
          expect(result.columns).toBe(config.columns)
          expect(result.card_size).toBe(config.cardSize)
          expect(result.show_images).toBe(config.showImages)
          expect(result.show_prices).toBe(config.showPrices)
          expect(result.accent_color).toBe(config.accentColor)
          
          // Icon should be preserved
          expect(result.icon?.type).toBe(config.icon.type)
          expect(result.icon?.value).toBe(config.icon.value)
          
          // Layout should be preserved
          expect(result.layout?.spacing).toBe(config.layout.spacing)
          expect(result.layout?.alignment).toBe(config.layout.alignment)
        }),
        { numRuns: 100 }
      )
    })
  })

  // ================================================================
  // Property Tests for Options UI System Cleanup
  // Requirements: 2.1, 2.2, 2.3
  // ================================================================

  describe('Property 1: Legacy section_type mapping', () => {
    it('maps section_type to display_mode correctly', () => {
      const sectionTypeMap = {
        'default': 'default',
        'hero_selection': 'hero_flavor',
        'compact_addons': 'default',
        'interactive_meter': 'smart_meter'
      };

      fc.assert(
        fc.property(
          fc.constantFrom('default', 'hero_selection', 'compact_addons', 'interactive_meter'),
          (sectionType) => {
            const config = { section_type: sectionType };
            const result = parseUIConfig(JSON.stringify(config));
            
            // display_mode should be mapped from section_type
            expect(result.display_mode).toBe(sectionTypeMap[sectionType as keyof typeof sectionTypeMap]);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 2: Legacy show_macros mapping', () => {
    it('maps show_macros to nutrition.show correctly', () => {
      fc.assert(
        fc.property(fc.boolean(), (showMacros) => {
          const config = { show_macros: showMacros };
          const result = parseUIConfig(JSON.stringify(config));
          
          // nutrition.show should have the same boolean value
          expect(result.nutrition?.show).toBe(showMacros);
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 3: Saved config uses new fields only', () => {
    it('stringifyUIConfig removes legacy fields', async () => {
      const { stringifyUIConfig } = await import('./uiConfig');
      
      fc.assert(
        fc.property(
          fc.record({
            display_mode: fc.constantFrom('default', 'hero_flavor', 'smart_meter', 'brand_accent'),
            fallback_style: fc.constantFrom('cards', 'grid', 'list', 'pills', 'checkbox'),
            section_type: fc.constantFrom('default', 'hero_selection'), // legacy
            show_macros: fc.boolean(), // legacy
          }),
          (config) => {
            const result = stringifyUIConfig(config as any);
            const parsed = JSON.parse(result);
            
            // Legacy fields should NOT be in output
            expect(parsed.section_type).toBeUndefined();
            expect(parsed.show_macros).toBeUndefined();
            expect(parsed.displayMode).toBeUndefined();
            expect(parsed.showMacros).toBeUndefined();
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 5: Icon priority', () => {
    it('getEffectiveIcon prioritizes ui_config.icon over legacy icon', async () => {
      const { getEffectiveIcon, parseUIConfig } = await import('./uiConfig');
      
      fc.assert(
        fc.property(
          fc.record({
            icon: fc.record({
              type: fc.constantFrom('emoji', 'lucide', 'custom'),
              value: fc.string({ minLength: 1 }),
            }),
          }),
          fc.string({ minLength: 1 }), // legacy icon
          (config, legacyIcon) => {
            const uiConfig = parseUIConfig(JSON.stringify(config));
            const effectiveIcon = getEffectiveIcon(uiConfig, legacyIcon);
            
            // ui_config.icon should take priority
            expect(effectiveIcon.value).toBe(config.icon.value);
            expect(effectiveIcon.type).toBe(config.icon.type);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('getEffectiveIcon falls back to legacy icon when ui_config.icon is not set', async () => {
      const { getEffectiveIcon } = await import('./uiConfig');
      
      fc.assert(
        fc.property(
          fc.string({ minLength: 1 }), // legacy icon (emoji)
          (legacyIcon) => {
            // Create a config without icon
            const uiConfigWithoutIcon = {
              display_mode: 'default' as const,
              fallback_style: 'cards' as const,
              // No icon field
            };
            const effectiveIcon = getEffectiveIcon(uiConfigWithoutIcon as any, legacyIcon);
            
            // Should use legacy icon converted to IconConfig format
            expect(effectiveIcon.value).toBe(legacyIcon);
            expect(effectiveIcon.type).toBe('emoji');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('getEffectiveIcon returns default when no icon is provided', async () => {
      const { getEffectiveIcon, parseUIConfig, DEFAULT_UI_CONFIG } = await import('./uiConfig');
      
      const uiConfig = parseUIConfig('{}');
      // Remove icon from uiConfig to test default
      delete (uiConfig as any).icon;
      const effectiveIcon = getEffectiveIcon(uiConfig, undefined);
      
      // Should return default icon
      expect(effectiveIcon.type).toBe(DEFAULT_UI_CONFIG.icon?.type);
      expect(effectiveIcon.value).toBe(DEFAULT_UI_CONFIG.icon?.value);
    });
  });

  // ================================================================
  // Edge Cases
  // ================================================================

  describe('Edge Cases', () => {
    it('handles deeply nested invalid structures gracefully', () => {
      fc.assert(
        fc.property(
          fc.record({
            icon: fc.oneof(
              fc.constant(null),
              fc.constant('invalid'),
              fc.integer(),
              fc.record({ type: fc.integer() }) // wrong type
            ),
            layout: fc.oneof(
              fc.constant(null),
              fc.constant('invalid'),
              fc.integer(),
            ),
          }),
          (config) => {
            const jsonStr = JSON.stringify(config)
            const result = parseUIConfig(jsonStr)
            
            // Should not throw and should have valid icon/layout defaults
            expect(result).toBeDefined()
            expect(result.icon).toBeDefined()
            expect(result.layout).toBeDefined()
          }
        ),
        { numRuns: 100 }
      )
    })

    it('handles special characters in badge text', () => {
      fc.assert(
        fc.property(
          fc.record({
            badge: fc.string({ minLength: 1, maxLength: 50 }),
            badge_color: hexColorArb,
          }),
          (config) => {
            const jsonStr = JSON.stringify(config)
            const result = parseUIConfig(jsonStr)
            
            // Should preserve special characters
            expect(result.badge).toBe(config.badge)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('handles Arabic text in badge correctly', () => {
      const arabicBadges = ['جديد', 'الأكثر مبيعاً', 'عرض خاص', 'صمم بنفسك']
      
      fc.assert(
        fc.property(
          fc.record({
            badge: fc.constantFrom(...arabicBadges),
            badge_color: fc.constantFrom('#FF6B9D', '#8B5CF6', '#10B981'),
          }),
          (config) => {
            const jsonStr = JSON.stringify(config)
            const result = parseUIConfig(jsonStr)
            
            expect(result.badge).toBe(config.badge)
            expect(result.badge_color).toBe(config.badge_color)
          }
        ),
        { numRuns: 100 }
      )
    })
  })
})
