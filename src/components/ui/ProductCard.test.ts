/**
 * ProductCard Template Mapping Tests
 * ===================================
 * Tests for getCardTypeFromProduct function
 * 
 * Requirements: 10.1, 11.1, 11.2, 11.3
 * - template_1 → simple (SimpleCard)
 * - template_2 → medium (StandardProductCard)
 * - template_3 → complex (BYOProductCard)
 * - Fallback to layout_mode when template_id is not set
 */

import { describe, it, expect } from 'vitest'
import { getCardTypeFromProduct, type Product } from './ProductCard'

describe('getCardTypeFromProduct', () => {
  // Helper to create minimal product
  const createProduct = (overrides: Partial<Product> = {}): Product => ({
    id: 'test-product',
    name: 'Test Product',
    price: 10,
    ...overrides
  })

  describe('Template ID Mapping (Primary)', () => {
    it('should return "simple" for template_1', () => {
      const product = createProduct({ template_id: 'template_1' })
      expect(getCardTypeFromProduct(product)).toBe('simple')
    })

    it('should return "medium" for template_2', () => {
      const product = createProduct({ template_id: 'template_2' })
      expect(getCardTypeFromProduct(product)).toBe('medium')
    })

    it('should return "complex" for template_3', () => {
      const product = createProduct({ template_id: 'template_3' })
      expect(getCardTypeFromProduct(product)).toBe('complex')
    })

    // Legacy aliases
    it('should return "simple" for template_simple (legacy)', () => {
      const product = createProduct({ template_id: 'template_simple' })
      expect(getCardTypeFromProduct(product)).toBe('simple')
    })

    it('should return "medium" for template_medium (legacy)', () => {
      const product = createProduct({ template_id: 'template_medium' })
      expect(getCardTypeFromProduct(product)).toBe('medium')
    })

    it('should return "complex" for template_complex (legacy)', () => {
      const product = createProduct({ template_id: 'template_complex' })
      expect(getCardTypeFromProduct(product)).toBe('complex')
    })
  })

  describe('Layout Mode Fallback', () => {
    it('should fallback to "simple" for layout_mode="simple"', () => {
      const product = createProduct({ layout_mode: 'simple' })
      expect(getCardTypeFromProduct(product)).toBe('simple')
    })

    it('should fallback to "medium" for layout_mode="medium"', () => {
      const product = createProduct({ layout_mode: 'medium' })
      expect(getCardTypeFromProduct(product)).toBe('medium')
    })

    it('should fallback to "complex" for layout_mode="complex"', () => {
      const product = createProduct({ layout_mode: 'complex' })
      expect(getCardTypeFromProduct(product)).toBe('complex')
    })

    // Legacy layout_mode aliases
    it('should fallback to "simple" for layout_mode="selector" (legacy)', () => {
      const product = createProduct({ layout_mode: 'selector' })
      expect(getCardTypeFromProduct(product)).toBe('simple')
    })

    it('should fallback to "medium" for layout_mode="composer" (legacy)', () => {
      const product = createProduct({ layout_mode: 'composer' })
      expect(getCardTypeFromProduct(product)).toBe('medium')
    })

    it('should fallback to "medium" for layout_mode="standard" (legacy)', () => {
      const product = createProduct({ layout_mode: 'standard' })
      expect(getCardTypeFromProduct(product)).toBe('medium')
    })

    it('should fallback to "complex" for layout_mode="builder" (legacy)', () => {
      const product = createProduct({ layout_mode: 'builder' })
      expect(getCardTypeFromProduct(product)).toBe('complex')
    })
  })

  describe('Priority: template_id over layout_mode', () => {
    it('should use template_id when both template_id and layout_mode are set', () => {
      const product = createProduct({
        template_id: 'template_1',  // simple
        layout_mode: 'complex'       // would be complex if used
      })
      expect(getCardTypeFromProduct(product)).toBe('simple')
    })

    it('should use template_id=template_3 over layout_mode=simple', () => {
      const product = createProduct({
        template_id: 'template_3',  // complex
        layout_mode: 'simple'        // would be simple if used
      })
      expect(getCardTypeFromProduct(product)).toBe('complex')
    })
  })

  describe('Product Type Fallback', () => {
    it('should return "complex" for product_type="byo_ice_cream"', () => {
      const product = createProduct({ product_type: 'byo_ice_cream' })
      expect(getCardTypeFromProduct(product)).toBe('complex')
    })

    it('should return "complex" for products with id starting with "byo_"', () => {
      const product = createProduct({ id: 'byo_custom_product' })
      expect(getCardTypeFromProduct(product)).toBe('complex')
    })

    it('should return "featured" for product_type="dessert"', () => {
      const product = createProduct({ product_type: 'dessert' })
      expect(getCardTypeFromProduct(product)).toBe('featured')
    })
  })

  describe('Default Fallback', () => {
    it('should return "medium" when no template_id, layout_mode, or product_type', () => {
      const product = createProduct({})
      expect(getCardTypeFromProduct(product)).toBe('medium')
    })

    it('should return "medium" for unknown template_id', () => {
      const product = createProduct({ template_id: 'unknown_template' })
      expect(getCardTypeFromProduct(product)).toBe('medium')
    })
  })
})
