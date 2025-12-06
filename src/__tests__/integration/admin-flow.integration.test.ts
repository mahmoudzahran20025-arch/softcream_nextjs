// ================================================================
// admin-flow.integration.test.ts - Integration Test for Admin Flow
// Test: Create product → Set template → Add conditional rules → Verify in frontend
// **Validates: Requirements 12.3**
// ================================================================

import { describe, it, expect } from 'vitest'
import {
  parseConditionalRules,
  getEffectiveMaxSelections,
  type ConditionalRule,
} from '@/hooks/useConditionalOptions'
import {
  checkTemplateCompatibility,
  getSuggestedGroupsForTemplate,
  type ProductTemplate,
} from '@/lib/admin/templates.api'
import {
  validateProduct,
  safeJsonParse,
} from '@/lib/dataValidator'

// ================================================================
// Test Data - Simulating Admin Operations
// ================================================================

/**
 * Mock templates as returned by the API
 */
const mockTemplates: ProductTemplate[] = [
  {
    id: 'template_1',
    name_ar: 'البسيط',
    name_en: 'Simple',
    description_ar: 'للمنتجات ذات الخيارات المحدودة',
    description_en: 'For products with limited options',
    complexity_level: 1,
    complexity: 'simple',
    option_groups_min: 0,
    option_groups_max: 2,
    default_ui_config: { layout: 'compact', showImages: false },
    card_preview_config: { showOptions: false, showQuickAdd: true },
    display_order: 1,
    is_active: 1,
  },
  {
    id: 'template_2',
    name_ar: 'المتوسط',
    name_en: 'Medium',
    description_ar: 'للمنتجات متوسطة التخصيص',
    description_en: 'For medium customization products',
    complexity_level: 2,
    complexity: 'medium',
    option_groups_min: 3,
    option_groups_max: 4,
    default_ui_config: { layout: 'grid', showImages: true },
    card_preview_config: { showOptions: true, maxOptionsPreview: 3 },
    display_order: 2,
    is_active: 1,
  },
  {
    id: 'template_3',
    name_ar: 'المعقد',
    name_en: 'Complex',
    description_ar: 'للمنتجات عالية التخصيص',
    description_en: 'For highly customizable products',
    complexity_level: 3,
    complexity: 'complex',
    option_groups_min: 5,
    option_groups_max: 20,
    default_ui_config: { layout: 'wizard', showProgress: true },
    card_preview_config: { showCustomizationCount: true },
    display_order: 3,
    is_active: 1,
  },
]

/**
 * Mock option groups for conditional rules
 */
const mockOptionGroups = [
  {
    id: 'sizes',
    name_ar: 'الأحجام',
    name_en: 'Sizes',
    options: [
      { id: 'small', name_ar: 'صغير', name_en: 'Small', group_id: 'sizes' },
      { id: 'medium', name_ar: 'وسط', name_en: 'Medium', group_id: 'sizes' },
      { id: 'large', name_ar: 'كبير', name_en: 'Large', group_id: 'sizes' },
    ],
  },
  {
    id: 'flavors',
    name_ar: 'النكهات',
    name_en: 'Flavors',
    options: [
      { id: 'vanilla', name_ar: 'فانيلا', name_en: 'Vanilla', group_id: 'flavors' },
      { id: 'chocolate', name_ar: 'شوكولاتة', name_en: 'Chocolate', group_id: 'flavors' },
      { id: 'strawberry', name_ar: 'فراولة', name_en: 'Strawberry', group_id: 'flavors' },
    ],
  },
  {
    id: 'sauces',
    name_ar: 'الصوصات',
    name_en: 'Sauces',
    options: [
      { id: 'nutella', name_ar: 'نوتيلا', name_en: 'Nutella', group_id: 'sauces' },
      { id: 'caramel', name_ar: 'كراميل', name_en: 'Caramel', group_id: 'sauces' },
    ],
  },
]

// ================================================================
// Helper Functions for Admin Operations
// ================================================================

/**
 * Simulates creating a conditional rule in admin panel
 */
function createConditionalRule(
  triggerGroupId: string,
  rules: Record<string, number>
): string {
  const rule = {
    trigger_group: triggerGroupId,
    rules,
  }
  return JSON.stringify(rule)
}

/**
 * Simulates validating a conditional rule before saving
 */
function validateConditionalRule(
  ruleJson: string,
  availableGroups: typeof mockOptionGroups
): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  const parsed = parseConditionalRules(ruleJson)
  if (!parsed) {
    errors.push('Invalid JSON format')
    return { valid: false, errors }
  }
  
  // Check if trigger group exists
  const triggerGroup = availableGroups.find(g => g.id === parsed.triggerGroup)
  if (!triggerGroup) {
    errors.push(`Trigger group "${parsed.triggerGroup}" not found`)
    return { valid: false, errors }
  }
  
  // Check if all rule options exist in trigger group
  for (const optionId of Object.keys(parsed.rules)) {
    const optionExists = triggerGroup.options?.some(o => o.id === optionId)
    if (!optionExists) {
      errors.push(`Option "${optionId}" not found in trigger group`)
    }
  }
  
  // Check if values are valid
  for (const [optionId, value] of Object.entries(parsed.rules)) {
    if (typeof value !== 'number' || value < 0) {
      errors.push(`Invalid value for option "${optionId}": ${value}`)
    }
  }
  
  return { valid: errors.length === 0, errors }
}

/**
 * Simulates creating a product in admin panel
 */
function createProduct(data: {
  name: string
  price: number
  templateId: string
  optionGroups: string[]
}): Record<string, unknown> {
  return {
    id: `product-${Date.now()}`,
    name: data.name,
    name_ar: data.name,
    name_en: data.name,
    price: data.price,
    template_id: data.templateId,
    is_customizable: data.optionGroups.length > 0,
    option_groups: data.optionGroups,
  }
}

// ================================================================
// Integration Test: Admin Flow
// ================================================================

describe('Integration: Admin Flow', () => {
  describe('Step 1: Template Selection', () => {
    it('lists available templates', () => {
      expect(mockTemplates.length).toBe(3)
      expect(mockTemplates[0].id).toBe('template_1')
      expect(mockTemplates[1].id).toBe('template_2')
      expect(mockTemplates[2].id).toBe('template_3')
    })

    it('checks template compatibility with option groups', () => {
      const simpleTemplate = mockTemplates[0] // 0-2 groups
      const mediumTemplate = mockTemplates[1] // 3-4 groups
      const complexTemplate = mockTemplates[2] // 5+ groups
      
      // Simple template with 1 group - compatible
      expect(checkTemplateCompatibility(simpleTemplate, 1).compatible).toBe(true)
      
      // Simple template with 5 groups - not compatible
      expect(checkTemplateCompatibility(simpleTemplate, 5).compatible).toBe(false)
      
      // Medium template with 3 groups - compatible
      expect(checkTemplateCompatibility(mediumTemplate, 3).compatible).toBe(true)
      
      // Medium template with 2 groups - not compatible
      expect(checkTemplateCompatibility(mediumTemplate, 2).compatible).toBe(false)
      
      // Complex template with 6 groups - compatible
      expect(checkTemplateCompatibility(complexTemplate, 6).compatible).toBe(true)
    })

    it('suggests option groups based on template complexity', () => {
      const simpleTemplate = mockTemplates[0]
      const mediumTemplate = mockTemplates[1]
      const complexTemplate = mockTemplates[2]
      
      // Simple template suggests no groups
      const simpleSuggestions = getSuggestedGroupsForTemplate(simpleTemplate)
      expect(simpleSuggestions.length).toBe(0)
      
      // Medium template suggests sizes and flavors
      const mediumSuggestions = getSuggestedGroupsForTemplate(mediumTemplate)
      expect(mediumSuggestions).toContain('sizes')
      expect(mediumSuggestions).toContain('flavors')
      
      // Complex template suggests all groups
      const complexSuggestions = getSuggestedGroupsForTemplate(complexTemplate)
      expect(complexSuggestions.length).toBeGreaterThan(2)
    })
  })

  describe('Step 2: Conditional Rules Creation', () => {
    it('creates valid conditional rule JSON', () => {
      const ruleJson = createConditionalRule('sizes', {
        small: 1,
        medium: 2,
        large: 3,
      })
      
      const parsed = parseConditionalRules(ruleJson)
      expect(parsed).not.toBeNull()
      expect(parsed?.triggerGroup).toBe('sizes')
      expect(parsed?.rules.small).toBe(1)
      expect(parsed?.rules.medium).toBe(2)
      expect(parsed?.rules.large).toBe(3)
    })

    it('validates conditional rules against available options', () => {
      // Valid rule
      const validRule = createConditionalRule('sizes', {
        small: 1,
        medium: 2,
        large: 3,
      })
      const validResult = validateConditionalRule(validRule, mockOptionGroups)
      expect(validResult.valid).toBe(true)
      expect(validResult.errors.length).toBe(0)
      
      // Invalid rule - non-existent option
      const invalidRule = createConditionalRule('sizes', {
        small: 1,
        extra_large: 4, // doesn't exist
      })
      const invalidResult = validateConditionalRule(invalidRule, mockOptionGroups)
      expect(invalidResult.valid).toBe(false)
      expect(invalidResult.errors.some(e => e.includes('extra_large'))).toBe(true)
    })

    it('validates conditional rules against non-existent trigger group', () => {
      const invalidRule = createConditionalRule('containers', { // doesn't exist
        cup: 1,
        cone: 2,
      })
      const result = validateConditionalRule(invalidRule, mockOptionGroups)
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.includes('containers'))).toBe(true)
    })

    it('rejects negative maxSelections values', () => {
      const invalidRule = createConditionalRule('sizes', {
        small: -1, // invalid
        medium: 2,
      })
      const result = validateConditionalRule(invalidRule, mockOptionGroups)
      expect(result.valid).toBe(false)
    })
  })

  describe('Step 3: Product Creation with Template', () => {
    it('creates product with template and option groups', () => {
      const product = createProduct({
        name: 'آيس كريم سوفت',
        price: 50,
        templateId: 'template_2',
        optionGroups: ['sizes', 'flavors', 'sauces'],
      })
      
      expect(product.name).toBe('آيس كريم سوفت')
      expect(product.price).toBe(50)
      expect(product.template_id).toBe('template_2')
      expect(product.is_customizable).toBe(true)
      expect((product.option_groups as string[]).length).toBe(3)
    })

    it('validates created product', () => {
      const product = createProduct({
        name: 'آيس كريم سوفت',
        price: 50,
        templateId: 'template_2',
        optionGroups: ['sizes', 'flavors'],
      })
      
      const result = validateProduct(product)
      expect(result.valid).toBe(true)
    })

    it('creates simple product without customization', () => {
      const product = createProduct({
        name: 'مياه معدنية',
        price: 10,
        templateId: 'template_1',
        optionGroups: [],
      })
      
      expect(product.is_customizable).toBe(false)
      expect((product.option_groups as string[]).length).toBe(0)
    })
  })

  describe('Step 4: Frontend Verification', () => {
    it('applies conditional rules in frontend', () => {
      // Admin creates rule
      const ruleJson = createConditionalRule('sizes', {
        small: 1,
        medium: 2,
        large: 3,
      })
      
      // Frontend parses rule
      const parsed = parseConditionalRules(ruleJson)
      expect(parsed).not.toBeNull()
      
      // Frontend applies rule when size is selected
      const defaultMax = 1
      
      const smallMax = getEffectiveMaxSelections(parsed, 'small', defaultMax)
      expect(smallMax).toBe(1)
      
      const mediumMax = getEffectiveMaxSelections(parsed, 'medium', defaultMax)
      expect(mediumMax).toBe(2)
      
      const largeMax = getEffectiveMaxSelections(parsed, 'large', defaultMax)
      expect(largeMax).toBe(3)
    })

    it('falls back to default when rule not found', () => {
      const ruleJson = createConditionalRule('sizes', {
        small: 1,
        medium: 2,
        // large is missing
      })
      
      const parsed = parseConditionalRules(ruleJson)
      const defaultMax = 5
      
      // large is not in rules, should fall back to default
      const largeMax = getEffectiveMaxSelections(parsed, 'large', defaultMax)
      expect(largeMax).toBe(defaultMax)
    })

    it('handles invalid rule JSON gracefully', () => {
      const invalidJson = 'not valid json'
      const parsed = parseConditionalRules(invalidJson)
      expect(parsed).toBeNull()
      
      // Frontend should use default when parsing fails
      const defaultMax = 3
      const effectiveMax = getEffectiveMaxSelections(null, 'large', defaultMax)
      expect(effectiveMax).toBe(defaultMax)
    })
  })

  describe('Step 5: Complete Admin Flow Simulation', () => {
    it('simulates complete admin workflow', () => {
      // Step 1: Admin selects template
      const selectedTemplate = mockTemplates[1] // Medium template
      expect(selectedTemplate.complexity).toBe('medium')
      
      // Step 2: Admin checks compatibility
      const optionGroupCount = 3
      const compatibility = checkTemplateCompatibility(selectedTemplate, optionGroupCount)
      expect(compatibility.compatible).toBe(true)
      
      // Step 3: Admin creates product
      const product = createProduct({
        name: 'آيس كريم مخصص',
        price: 60,
        templateId: selectedTemplate.id,
        optionGroups: ['sizes', 'flavors', 'sauces'],
      })
      
      // Step 4: Admin creates conditional rule for flavors
      const conditionalRule = createConditionalRule('sizes', {
        small: 1,
        medium: 2,
        large: 3,
      })
      
      // Step 5: Admin validates rule
      const ruleValidation = validateConditionalRule(conditionalRule, mockOptionGroups)
      expect(ruleValidation.valid).toBe(true)
      
      // Step 6: Simulate saving to database
      const savedProduct = {
        ...product,
        option_groups_config: [
          {
            groupId: 'flavors',
            maxSelections: 1,
            conditional_max_selections: conditionalRule,
          },
        ],
      }
      
      // Step 7: Frontend loads product and applies rules
      const parsedRule = parseConditionalRules(conditionalRule)
      expect(parsedRule).not.toBeNull()
      
      // Step 8: Customer selects large size
      const maxFlavors = getEffectiveMaxSelections(parsedRule, 'large', 1)
      expect(maxFlavors).toBe(3)
      
      // Verify complete flow
      expect((savedProduct as Record<string, unknown>).template_id).toBe('template_2')
      expect(savedProduct.option_groups_config[0].conditional_max_selections).toBe(conditionalRule)
    })

    it('handles template change with incompatible option groups', () => {
      // Start with complex template and many groups
      let selectedTemplate = mockTemplates[2] // Complex
      const optionGroupCount = 6
      
      let compatibility = checkTemplateCompatibility(selectedTemplate, optionGroupCount)
      expect(compatibility.compatible).toBe(true)
      
      // Admin tries to change to simple template
      selectedTemplate = mockTemplates[0] // Simple (max 2 groups)
      compatibility = checkTemplateCompatibility(selectedTemplate, optionGroupCount)
      expect(compatibility.compatible).toBe(false)
      expect(compatibility.message).toBeDefined()
    })
  })
})

// ================================================================
// Integration Test: UI Config Handling
// ================================================================

describe('Integration: UI Config Handling', () => {
  it('parses ui_config from database', () => {
    const uiConfigJson = '{"badge": "جديد", "badge_color": "#FF6B9D"}'
    const parsed = safeJsonParse<Record<string, unknown>>(uiConfigJson, {})
    
    expect(parsed.badge).toBe('جديد')
    expect(parsed.badge_color).toBe('#FF6B9D')
  })

  it('handles invalid ui_config gracefully', () => {
    const invalidJson = 'not valid json'
    const parsed = safeJsonParse<Record<string, unknown>>(invalidJson, { default: true })
    
    expect(parsed.default).toBe(true)
  })

  it('applies template ui_config to product', () => {
    const template = mockTemplates[1] // Medium template
    const productUiConfig = {
      ...template.default_ui_config,
      badge: 'الأكثر مبيعاً',
    }
    
    expect(productUiConfig.layout).toBe('grid')
    expect(productUiConfig.showImages).toBe(true)
    expect(productUiConfig.badge).toBe('الأكثر مبيعاً')
  })
})

// ================================================================
// Integration Test: Data Persistence Simulation
// ================================================================

describe('Integration: Data Persistence', () => {
  it('simulates saving and loading conditional rules', () => {
    // Admin creates rule
    const originalRule: ConditionalRule = {
      triggerGroup: 'sizes',
      rules: { small: 1, medium: 2, large: 3 },
    }
    
    // Convert to database format (snake_case)
    const dbFormat = {
      trigger_group: originalRule.triggerGroup,
      rules: originalRule.rules,
    }
    const savedJson = JSON.stringify(dbFormat)
    
    // Load from database
    const loadedRule = parseConditionalRules(savedJson)
    
    // Verify round-trip
    expect(loadedRule).not.toBeNull()
    expect(loadedRule?.triggerGroup).toBe(originalRule.triggerGroup)
    expect(loadedRule?.rules).toEqual(originalRule.rules)
  })

  it('handles empty conditional rules', () => {
    const emptyRule = parseConditionalRules(null)
    expect(emptyRule).toBeNull()
    
    const emptyStringRule = parseConditionalRules('')
    expect(emptyStringRule).toBeNull()
  })
})
