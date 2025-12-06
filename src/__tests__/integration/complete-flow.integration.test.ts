// ================================================================
// complete-flow.integration.test.ts - Integration Test for Complete Customer Flow
// Test: Select product → Choose size → Options update → Price calculates → Add to cart
// **Validates: Requirements 12.1, 12.2**
// ================================================================

import { describe, it, expect, beforeEach } from 'vitest'
import {
  getEffectiveMaxSelections,
  trimSelectionsToLimit,
  parseConditionalRules,
  type ConditionalRule,
  type OptionGroupWithRules,
} from '@/hooks/useConditionalOptions'
import {
  calculatePriceBreakdown,
  getEffectivePrice,
  type SelectedOption,
  type SelectedSize,
} from '@/hooks/usePriceCalculator'
import {
  formatFooterSummary,
  getCompactBadges,
  type FooterSelectedOption,
} from '@/components/modals/ProductModal/SmartFooter'
import {
  validateProduct,
  validateProductConfiguration,
  safeNumber,
  safeString,
} from '@/lib/dataValidator'

// ================================================================
// Test Data - Simulating Real Product Configuration
// ================================================================

/**
 * Mock product data as it would come from the API
 */
const mockProduct = {
  id: 'product-1',
  name: 'آيس كريم سوفت',
  name_ar: 'آيس كريم سوفت',
  name_en: 'Soft Ice Cream',
  price: 50,
  template_id: 'template_2',
  is_customizable: true,
  category_id: 'cat-1',
  description: 'آيس كريم سوفت لذيذ',
}

/**
 * Mock sizes with price modifiers
 */
const mockSizes: SelectedSize[] = [
  { id: 'small', name: 'صغير', priceModifier: 0 },
  { id: 'medium', name: 'وسط', priceModifier: 10 },
  { id: 'large', name: 'كبير', priceModifier: 20 },
]

/**
 * Mock option groups with conditional rules
 */
const mockOptionGroups: OptionGroupWithRules[] = [
  {
    groupId: 'flavors',
    groupName: 'النكهات',
    maxSelections: 1,
    conditionalRules: {
      triggerGroup: 'sizes',
      rules: {
        small: 1,
        medium: 2,
        large: 3,
      },
    },
  },
  {
    groupId: 'sauces',
    groupName: 'الصوصات',
    maxSelections: 2,
    conditionalRules: null,
  },
  {
    groupId: 'toppings',
    groupName: 'الإضافات',
    maxSelections: 3,
    conditionalRules: null,
  },
]

/**
 * Mock options for selection
 */
const mockOptions: FooterSelectedOption[] = [
  { id: 'flavor-1', name: 'فانيلا', price: 0, groupId: 'flavors' },
  { id: 'flavor-2', name: 'شوكولاتة', price: 0, groupId: 'flavors' },
  { id: 'flavor-3', name: 'فراولة', price: 0, groupId: 'flavors' },
  { id: 'sauce-1', name: 'صوص نوتيلا', price: 5, groupId: 'sauces' },
  { id: 'sauce-2', name: 'صوص كراميل', price: 5, groupId: 'sauces' },
  { id: 'topping-1', name: 'فراولة طازجة', price: 3, groupId: 'toppings' },
  { id: 'topping-2', name: 'موز', price: 3, groupId: 'toppings' },
]

/**
 * Mock product configuration as returned by API
 */
const mockProductConfiguration = {
  product: {
    id: 'product-1',
    name: 'آيس كريم سوفت',
    nameAr: 'آيس كريم سوفت',
    nameEn: 'Soft Ice Cream',
    basePrice: 50,
    templateId: 'template_2',
    isCustomizable: true,
    baseNutrition: {
      calories: 200,
      protein: 4,
      carbs: 30,
      fat: 8,
      sugar: 20,
      fiber: 0,
    },
  },
  hasContainers: false,
  containers: [],
  hasSizes: true,
  sizes: mockSizes,
  hasCustomization: true,
  customizationRules: mockOptionGroups.map(g => ({
    ...g,
    isRequired: g.groupId === 'flavors',
    minSelections: g.groupId === 'flavors' ? 1 : 0,
    displayOrder: 1,
    uiConfig: { display_style: 'cards' },
    options: mockOptions.filter(o => o.groupId === g.groupId).map(o => ({
      id: o.id,
      name: o.name,
      basePrice: o.price,
      priceOverride: null,
    })),
  })),
}

// ================================================================
// Integration Test: Complete Customer Flow
// ================================================================

describe('Integration: Complete Customer Flow', () => {
  describe('Step 1: Product Selection & Validation', () => {
    it('validates product data from API', () => {
      const result = validateProduct(mockProduct)
      
      expect(result.valid).toBe(true)
      expect(result.data).not.toBeNull()
      expect(result.data?.id).toBe('product-1')
      expect(result.data?.name).toBe('آيس كريم سوفت')
      expect(result.data?.price).toBe(50)
    })

    it('validates product configuration from API', () => {
      const result = validateProductConfiguration(mockProductConfiguration)
      
      expect(result.valid).toBe(true)
      expect(result.data.product.id).toBe('product-1')
      expect(result.data.hasSizes).toBe(true)
      expect(result.data.hasCustomization).toBe(true)
      expect(result.data.customizationRules.length).toBe(3)
    })

    it('handles invalid product data gracefully', () => {
      const invalidProduct = { id: null, name: '', price: -10 }
      const result = validateProduct(invalidProduct)
      
      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })
  })

  describe('Step 2: Size Selection & Conditional Rules', () => {
    it('applies conditional rules when size is selected', () => {
      const flavorsGroup = mockOptionGroups.find(g => g.groupId === 'flavors')!
      
      // Select small size - should allow 1 flavor
      const smallMax = getEffectiveMaxSelections(
        flavorsGroup.conditionalRules,
        'small',
        flavorsGroup.maxSelections
      )
      expect(smallMax).toBe(1)
      
      // Select medium size - should allow 2 flavors
      const mediumMax = getEffectiveMaxSelections(
        flavorsGroup.conditionalRules,
        'medium',
        flavorsGroup.maxSelections
      )
      expect(mediumMax).toBe(2)
      
      // Select large size - should allow 3 flavors
      const largeMax = getEffectiveMaxSelections(
        flavorsGroup.conditionalRules,
        'large',
        flavorsGroup.maxSelections
      )
      expect(largeMax).toBe(3)
    })

    it('falls back to default when no conditional rules exist', () => {
      const saucesGroup = mockOptionGroups.find(g => g.groupId === 'sauces')!
      
      // Sauces group has no conditional rules
      const maxSelections = getEffectiveMaxSelections(
        saucesGroup.conditionalRules,
        'large',
        saucesGroup.maxSelections
      )
      expect(maxSelections).toBe(2) // Default value
    })

    it('parses conditional rules from JSON string', () => {
      const jsonString = '{"trigger_group": "sizes", "rules": {"small": 1, "medium": 2, "large": 3}}'
      const parsed = parseConditionalRules(jsonString)
      
      expect(parsed).not.toBeNull()
      expect(parsed?.triggerGroup).toBe('sizes')
      expect(parsed?.rules.small).toBe(1)
      expect(parsed?.rules.medium).toBe(2)
      expect(parsed?.rules.large).toBe(3)
    })
  })

  describe('Step 3: Options Selection & Limit Enforcement', () => {
    it('enforces selection limits when size changes', () => {
      // User has 3 flavors selected with large size
      const selectedFlavors = ['flavor-1', 'flavor-2', 'flavor-3']
      
      // User downgrades to small size (max 1 flavor)
      const { trimmed, removed } = trimSelectionsToLimit(selectedFlavors, 1)
      
      expect(trimmed.length).toBe(1)
      expect(trimmed[0]).toBe('flavor-1') // First selection kept
      expect(removed.length).toBe(2)
      expect(removed).toContain('flavor-2')
      expect(removed).toContain('flavor-3')
    })

    it('preserves selections when within limits', () => {
      const selectedFlavors = ['flavor-1', 'flavor-2']
      
      // Large size allows 3 flavors
      const { trimmed, removed } = trimSelectionsToLimit(selectedFlavors, 3)
      
      expect(trimmed).toEqual(selectedFlavors)
      expect(removed.length).toBe(0)
    })
  })

  describe('Step 4: Price Calculation', () => {
    it('calculates total price correctly', () => {
      const basePrice = 50
      const selectedSize = mockSizes[2] // Large: +20
      const selectedOptions: SelectedOption[] = [
        { id: 'sauce-1', name: 'صوص نوتيلا', basePrice: 5, priceOverride: null },
        { id: 'topping-1', name: 'فراولة طازجة', basePrice: 3, priceOverride: null },
      ]
      const quantity = 1
      
      const breakdown = calculatePriceBreakdown(
        basePrice,
        selectedSize.priceModifier,
        selectedOptions,
        quantity
      )
      
      // 50 (base) + 20 (size) + 5 (sauce) + 3 (topping) = 78
      expect(breakdown.basePrice).toBe(50)
      expect(breakdown.sizeModifier).toBe(20)
      expect(breakdown.optionsTotal).toBe(8)
      expect(breakdown.subtotal).toBe(78)
      expect(breakdown.total).toBe(78)
    })

    it('applies quantity multiplication', () => {
      const basePrice = 50
      const sizeModifier = 20
      const options: SelectedOption[] = [
        { id: 'sauce-1', name: 'صوص نوتيلا', basePrice: 5, priceOverride: null },
      ]
      const quantity = 3
      
      const breakdown = calculatePriceBreakdown(basePrice, sizeModifier, options, quantity)
      
      // (50 + 20 + 5) × 3 = 225
      expect(breakdown.subtotal).toBe(75)
      expect(breakdown.quantity).toBe(3)
      expect(breakdown.total).toBe(225)
    })

    it('uses price override when available', () => {
      const options: SelectedOption[] = [
        { id: 'sauce-1', name: 'صوص نوتيلا', basePrice: 5, priceOverride: 3 },
      ]
      
      const effectivePrice = getEffectivePrice(options[0].basePrice, options[0].priceOverride)
      expect(effectivePrice).toBe(3) // Override takes priority
      
      const breakdown = calculatePriceBreakdown(50, 0, options, 1)
      expect(breakdown.optionsTotal).toBe(3)
    })
  })

  describe('Step 5: Footer Summary Display', () => {
    it('formats footer summary with size and options', () => {
      const sizeName = 'حجم كبير'
      const options = [
        { name: 'صوص نوتيلا' },
        { name: 'فراولة طازجة' },
      ]
      
      const summary = formatFooterSummary(sizeName, options)
      
      expect(summary).toContain('حجم كبير')
      expect(summary).toContain('صوص نوتيلا')
      expect(summary).toContain('فراولة طازجة')
      expect(summary).toContain('•') // Separator
    })

    it('collapses options when exceeding max visible', () => {
      const sizeName = 'حجم كبير'
      const options = [
        { name: 'نكهة 1' },
        { name: 'نكهة 2' },
        { name: 'نكهة 3' },
        { name: 'نكهة 4' },
        { name: 'نكهة 5' },
      ]
      
      const summary = formatFooterSummary(sizeName, options, 3)
      
      expect(summary).toContain('حجم كبير')
      expect(summary).toContain('+5 إضافات')
    })

    it('generates compact badges for options', () => {
      const options: FooterSelectedOption[] = [
        { id: '1', name: 'صوص نوتيلا', price: 5, groupId: 'sauces' },
        { id: '2', name: 'فراولة', price: 3, groupId: 'fruits' },
      ]
      
      const badges = getCompactBadges(options, 5)
      
      expect(badges.length).toBeGreaterThan(0)
      // Should have badges for the options
      const badgeTexts = badges.map(b => b.text)
      expect(badgeTexts.some(t => t.includes('صوص') || t.includes('نوتيلا') || t.includes('صوصات'))).toBe(true)
    })
  })

  describe('Step 6: Complete Flow Simulation', () => {
    it('simulates complete customer journey', () => {
      // Step 1: Validate product
      const productValidation = validateProduct(mockProduct)
      expect(productValidation.valid).toBe(true)
      
      // Step 2: Validate configuration
      const configValidation = validateProductConfiguration(mockProductConfiguration)
      expect(configValidation.valid).toBe(true)
      
      // Step 3: Select size (large)
      const selectedSize = mockSizes[2] // Large
      const flavorsGroup = mockOptionGroups.find(g => g.groupId === 'flavors')!
      const maxFlavors = getEffectiveMaxSelections(
        flavorsGroup.conditionalRules,
        selectedSize.id,
        flavorsGroup.maxSelections
      )
      expect(maxFlavors).toBe(3) // Large allows 3 flavors
      
      // Step 4: Select options within limits
      const selectedFlavors = ['flavor-1', 'flavor-2', 'flavor-3']
      const { trimmed: validFlavors } = trimSelectionsToLimit(selectedFlavors, maxFlavors)
      expect(validFlavors.length).toBe(3)
      
      // Step 5: Add sauce and topping
      const selectedOptions: SelectedOption[] = [
        { id: 'sauce-1', name: 'صوص نوتيلا', basePrice: 5, priceOverride: null },
        { id: 'topping-1', name: 'فراولة طازجة', basePrice: 3, priceOverride: null },
      ]
      
      // Step 6: Calculate final price
      const quantity = 2
      const breakdown = calculatePriceBreakdown(
        mockProduct.price,
        selectedSize.priceModifier,
        selectedOptions,
        quantity
      )
      
      // 50 (base) + 20 (large) + 5 (sauce) + 3 (topping) = 78 per unit
      // 78 × 2 = 156 total
      expect(breakdown.subtotal).toBe(78)
      expect(breakdown.total).toBe(156)
      
      // Step 7: Generate footer summary
      const footerOptions = selectedOptions.map(o => ({
        id: o.id,
        name: o.name,
        price: o.basePrice,
        groupId: 'sauces',
      }))
      const summary = formatFooterSummary(selectedSize.name, footerOptions)
      expect(summary).toContain(selectedSize.name)
      
      // Step 8: Prepare cart item (simulated)
      const cartItem = {
        productId: mockProduct.id,
        productName: mockProduct.name,
        quantity,
        size: selectedSize,
        options: selectedOptions,
        totalPrice: breakdown.total,
      }
      
      expect(cartItem.productId).toBe('product-1')
      expect(cartItem.quantity).toBe(2)
      expect(cartItem.totalPrice).toBe(156)
    })

    it('handles size downgrade with excess selections', () => {
      // User starts with large size and 3 flavors
      let selectedSize = mockSizes[2] // Large
      let selectedFlavors = ['flavor-1', 'flavor-2', 'flavor-3']
      const flavorsGroup = mockOptionGroups.find(g => g.groupId === 'flavors')!
      
      // Verify initial state
      let maxFlavors = getEffectiveMaxSelections(
        flavorsGroup.conditionalRules,
        selectedSize.id,
        flavorsGroup.maxSelections
      )
      expect(maxFlavors).toBe(3)
      expect(selectedFlavors.length).toBeLessThanOrEqual(maxFlavors)
      
      // User downgrades to small size
      selectedSize = mockSizes[0] // Small
      maxFlavors = getEffectiveMaxSelections(
        flavorsGroup.conditionalRules,
        selectedSize.id,
        flavorsGroup.maxSelections
      )
      expect(maxFlavors).toBe(1)
      
      // Enforce new limits
      const { trimmed, removed } = trimSelectionsToLimit(selectedFlavors, maxFlavors)
      selectedFlavors = trimmed
      
      expect(selectedFlavors.length).toBe(1)
      expect(removed.length).toBe(2)
      
      // Price should reflect new selections
      const breakdown = calculatePriceBreakdown(
        mockProduct.price,
        selectedSize.priceModifier, // 0 for small
        [], // No additional options
        1
      )
      
      expect(breakdown.total).toBe(50) // Just base price
    })
  })
})

// ================================================================
// Integration Test: Data Flow Consistency
// ================================================================

describe('Integration: Data Flow Consistency', () => {
  it('maintains data integrity through the flow', () => {
    // Simulate API response parsing
    const apiResponse = {
      product: mockProduct,
      configuration: mockProductConfiguration,
    }
    
    // Validate product
    const productResult = validateProduct(apiResponse.product)
    expect(productResult.valid).toBe(true)
    
    // Validate configuration
    const configResult = validateProductConfiguration(apiResponse.configuration)
    expect(configResult.valid).toBe(true)
    
    // Extract safe values
    const basePrice = safeNumber(productResult.data?.price, 0)
    const productName = safeString(productResult.data?.name, '')
    
    expect(basePrice).toBe(50)
    expect(productName).toBe('آيس كريم سوفت')
    
    // Verify configuration data
    expect(configResult.data.hasSizes).toBe(true)
    expect(configResult.data.sizes.length).toBe(3)
    expect(configResult.data.customizationRules.length).toBe(3)
  })

  it('handles missing optional data gracefully', () => {
    const minimalProduct = {
      id: 'minimal-1',
      name: 'منتج بسيط',
      price: 25,
    }
    
    const result = validateProduct(minimalProduct)
    expect(result.valid).toBe(true)
    
    // template_id is optional
    expect(result.data?.template_id).toBeUndefined()
  })
})
