/**
 * ProductCard Template Mapping Tests
 * ===================================
 * Tests for getCardTypeFromProduct function
 * 
 * ✅ Unified System: Uses template_id as SINGLE source of truth
 * ❌ NO fallback to layout_mode (removed)
 * ❌ NO fallback to product_type (removed)
 * 
 * Requirements: 9.1, 9.2, 9.3
 * - template_1 → simple (SimpleCard)
 * - template_2 → medium (StandardProductCard)
 * - template_3 → complex (BYOProductCard/WizardCard)
 */

import { describe, it, expect } from 'vitest'
import { getCardTypeFromProduct } from './ProductCard'
import { parseUIConfig } from '@/lib/uiConfig'
import type { Product } from '@/lib/api'

describe('getCardTypeFromProduct', () => {
  // Helper to create minimal product
  const createProduct = (overrides: Partial<Product> = {}): Product => ({
    id: 'test-product',
    name: 'Test Product',
    price: 10,
    ...overrides
  })

  describe('Template ID Mapping (Requirements 9.1, 9.2, 9.3)', () => {
    it('should return "simple" for template_1 (Requirement 9.1)', () => {
      const product = createProduct({ template_id: 'template_1' })
      expect(getCardTypeFromProduct(product)).toBe('simple')
    })

    it('should return "medium" for template_2 (Requirement 9.2)', () => {
      const product = createProduct({ template_id: 'template_2' })
      expect(getCardTypeFromProduct(product)).toBe('medium')
    })

    it('should return "complex" for template_3 (Requirement 9.3)', () => {
      const product = createProduct({ template_id: 'template_3' })
      expect(getCardTypeFromProduct(product)).toBe('complex')
    })
  })

  describe('Default Fallback (No template_id)', () => {
    it('should return "medium" when template_id is missing', () => {
      const product = createProduct({})
      expect(getCardTypeFromProduct(product)).toBe('medium')
    })

    it('should return "medium" when template_id is undefined', () => {
      const product = createProduct({ template_id: undefined })
      expect(getCardTypeFromProduct(product)).toBe('medium')
    })

    it('should return "medium" for unknown template_id', () => {
      const product = createProduct({ template_id: 'unknown_template' })
      expect(getCardTypeFromProduct(product)).toBe('medium')
    })
  })
})

describe('parseUIConfig', () => {
  it('should parse valid JSON ui_config', () => {
    const uiConfigStr = JSON.stringify({
      display_style: 'cards',
      columns: 3,
      badge: 'جديد',
      badge_color: '#FF0000'
    })
    
    const result = parseUIConfig(uiConfigStr)
    
    expect(result.display_style).toBe('cards')
    expect(result.columns).toBe(3)
    expect(result.badge).toBe('جديد')
    expect(result.badge_color).toBe('#FF0000')
  })

  it('should return default config for undefined ui_config', () => {
    const result = parseUIConfig(undefined)
    // parseUIConfig returns DEFAULT_UI_CONFIG for undefined input
    expect(result.display_mode).toBe('default')
    expect(result.fallback_style).toBe('cards')
  })

  it('should return default config for empty string', () => {
    const result = parseUIConfig('')
    // parseUIConfig returns DEFAULT_UI_CONFIG for empty string
    expect(result.display_mode).toBe('default')
    expect(result.fallback_style).toBe('cards')
  })

  it('should return default config for invalid JSON', () => {
    const result = parseUIConfig('invalid json {')
    // parseUIConfig returns DEFAULT_UI_CONFIG for invalid JSON
    expect(result.display_mode).toBe('default')
    expect(result.fallback_style).toBe('cards')
  })

  it('should parse icon configuration', () => {
    const uiConfigStr = JSON.stringify({
      icon: {
        type: 'emoji',
        value: '🍦',
        animation: 'bounce',
        style: 'gradient'
      }
    })
    
    const result = parseUIConfig(uiConfigStr)
    
    expect(result.icon?.type).toBe('emoji')
    expect(result.icon?.value).toBe('🍦')
    expect(result.icon?.animation).toBe('bounce')
    expect(result.icon?.style).toBe('gradient')
  })
})
