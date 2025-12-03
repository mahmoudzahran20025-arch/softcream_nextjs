/**
 * ProductTemplateRenderer Template Mapping Tests
 * ===============================================
 * Tests for getEffectiveLayoutMode function
 * 
 * Requirements: 10.2, 11.1, 11.2, 11.3
 * - template_1 → simple (SimpleTemplate)
 * - template_2 → medium (MediumTemplate)
 * - template_3 → complex (ComplexTemplate)
 * - Fallback to layout_mode when template_id is not set
 */

import { describe, it, expect } from 'vitest'
import { getEffectiveLayoutMode, type TemplateProduct } from './ProductTemplateRenderer'

describe('getEffectiveLayoutMode', () => {
  // Helper to create minimal product
  const createProduct = (overrides: Partial<TemplateProduct> = {}): TemplateProduct => ({
    ...overrides
  })

  describe('Template ID Mapping (Primary) - Requirements 10.2, 11.1, 11.2, 11.3', () => {
    it('should return "simple" for template_1 (SimpleTemplate)', () => {
      const product = createProduct({ template_id: 'template_1' })
      expect(getEffectiveLayoutMode(product)).toBe('simple')
    })

    it('should return "medium" for template_2 (MediumTemplate)', () => {
      const product = createProduct({ template_id: 'template_2' })
      expect(getEffectiveLayoutMode(product)).toBe('medium')
    })

    it('should return "complex" for template_3 (ComplexTemplate)', () => {
      const product = createProduct({ template_id: 'template_3' })
      expect(getEffectiveLayoutMode(product)).toBe('complex')
    })

    // Legacy aliases
    it('should return "simple" for template_simple (legacy)', () => {
      const product = createProduct({ template_id: 'template_simple' })
      expect(getEffectiveLayoutMode(product)).toBe('simple')
    })

    it('should return "medium" for template_medium (legacy)', () => {
      const product = createProduct({ template_id: 'template_medium' })
      expect(getEffectiveLayoutMode(product)).toBe('medium')
    })

    it('should return "complex" for template_complex (legacy)', () => {
      const product = createProduct({ template_id: 'template_complex' })
      expect(getEffectiveLayoutMode(product)).toBe('complex')
    })
  })

  describe('Layout Mode Fallback - Requirements 10.2', () => {
    it('should fallback to "simple" for layout_mode="simple"', () => {
      const product = createProduct({ layout_mode: 'simple' })
      expect(getEffectiveLayoutMode(product)).toBe('simple')
    })

    it('should fallback to "medium" for layout_mode="medium"', () => {
      const product = createProduct({ layout_mode: 'medium' })
      expect(getEffectiveLayoutMode(product)).toBe('medium')
    })

    it('should fallback to "complex" for layout_mode="complex"', () => {
      const product = createProduct({ layout_mode: 'complex' })
      expect(getEffectiveLayoutMode(product)).toBe('complex')
    })

    // Legacy layout_mode aliases
    it('should fallback to "simple" for layout_mode="selector" (legacy)', () => {
      const product = createProduct({ layout_mode: 'selector' })
      expect(getEffectiveLayoutMode(product)).toBe('simple')
    })

    it('should fallback to "medium" for layout_mode="composer" (legacy)', () => {
      const product = createProduct({ layout_mode: 'composer' })
      expect(getEffectiveLayoutMode(product)).toBe('medium')
    })

    it('should fallback to "medium" for layout_mode="standard" (legacy)', () => {
      const product = createProduct({ layout_mode: 'standard' })
      expect(getEffectiveLayoutMode(product)).toBe('medium')
    })

    it('should fallback to "complex" for layout_mode="builder" (legacy)', () => {
      const product = createProduct({ layout_mode: 'builder' })
      expect(getEffectiveLayoutMode(product)).toBe('complex')
    })
  })

  describe('Priority: template_id over layout_mode - Requirements 10.2', () => {
    it('should use template_id when both template_id and layout_mode are set', () => {
      const product = createProduct({
        template_id: 'template_1',  // simple
        layout_mode: 'complex'       // would be complex if used
      })
      expect(getEffectiveLayoutMode(product)).toBe('simple')
    })

    it('should use template_id=template_3 over layout_mode=simple', () => {
      const product = createProduct({
        template_id: 'template_3',  // complex
        layout_mode: 'simple'        // would be simple if used
      })
      expect(getEffectiveLayoutMode(product)).toBe('complex')
    })

    it('should use template_id=template_2 over layout_mode=builder', () => {
      const product = createProduct({
        template_id: 'template_2',  // medium
        layout_mode: 'builder'       // would be complex if used
      })
      expect(getEffectiveLayoutMode(product)).toBe('medium')
    })
  })

  describe('Default Fallback - Requirements 10.2', () => {
    it('should return "simple" when no template_id or layout_mode', () => {
      const product = createProduct({})
      expect(getEffectiveLayoutMode(product)).toBe('simple')
    })

    it('should return "simple" for unknown template_id without layout_mode', () => {
      const product = createProduct({ template_id: 'unknown_template' })
      expect(getEffectiveLayoutMode(product)).toBe('simple')
    })
  })
})
