/**
 * Templates API - Admin Product Templates Management
 * Requirements: 2.1 - Allow selecting template (Simple, Medium, Complex)
 */

import { apiRequest } from './apiClient';

// ===========================
// Types
// ===========================

/**
 * UI Configuration for template display
 */
export interface TemplateUIConfig {
  layout?: 'compact' | 'grid' | 'wizard';
  showImages?: boolean;
  cardHeight?: 'sm' | 'md' | 'lg';
  columns?: number;
  showProgress?: boolean;
  stepByStep?: boolean;
}

/**
 * Card preview configuration
 */
export interface CardPreviewConfig {
  showOptions?: boolean;
  showQuickAdd?: boolean;
  maxOptionsPreview?: number;
  showCustomizationCount?: boolean;
  ctaText?: string;
  style?: 'compact' | 'standard' | 'premium';
}

/**
 * Product Template from database
 * Requirements: 2.1, 2.2
 */
export interface ProductTemplate {
  id: string;
  name_ar: string;
  name_en: string;
  description_ar: string;
  description_en: string;
  complexity_level: number;
  complexity: 'simple' | 'medium' | 'complex';
  option_groups_min: number;
  option_groups_max: number;
  default_ui_config: TemplateUIConfig;
  card_preview_config: CardPreviewConfig;
  display_order: number;
  is_active: number;
}

/**
 * Response from getTemplates API
 */
export interface TemplatesResponse {
  success: boolean;
  data: ProductTemplate[];
}

/**
 * Response from getTemplateById API
 */
export interface TemplateResponse {
  success: boolean;
  data: ProductTemplate;
}

// ===========================
// Fallback Templates (used when API is unavailable)
// ✅ UNIFIED: IDs now match Backend (template_1, template_2, template_3)
// ===========================

const FALLBACK_TEMPLATES: ProductTemplate[] = [
  {
    id: 'template_1',  // ✅ Unified with Backend
    name_ar: 'البسيط',
    name_en: 'Simple',
    description_ar: 'للمنتجات ذات الخيارات المحدودة (0-2 خيارات)',
    description_en: 'For products with limited options (0-2 option groups)',
    complexity_level: 1,
    complexity: 'simple',
    option_groups_min: 0,
    option_groups_max: 2,
    default_ui_config: { layout: 'compact', showImages: false, cardHeight: 'sm' },
    card_preview_config: { showOptions: false, showQuickAdd: true, ctaText: 'أضف للسلة', style: 'compact' },
    display_order: 1,
    is_active: 1,
  },
  {
    id: 'template_2',  // ✅ Unified with Backend
    name_ar: 'المتوسط',
    name_en: 'Medium',
    description_ar: 'للمنتجات متوسطة التخصيص (3-4 خيارات)',
    description_en: 'For medium customization products (3-4 option groups)',
    complexity_level: 2,
    complexity: 'medium',
    option_groups_min: 3,
    option_groups_max: 4,
    default_ui_config: { layout: 'grid', showImages: true, columns: 3 },
    card_preview_config: { showOptions: true, maxOptionsPreview: 3, ctaText: 'اختر الخيارات', style: 'standard' },
    display_order: 2,
    is_active: 1,
  },
  {
    id: 'template_3',  // ✅ Unified with Backend
    name_ar: 'المعقد (ويزارد)',
    name_en: 'Complex (Wizard)',
    description_ar: 'للمنتجات عالية التخصيص (5+ خيارات)',
    description_en: 'For highly customizable products (5+ option groups)',
    complexity_level: 3,
    complexity: 'complex',
    option_groups_min: 5,
    option_groups_max: 20,
    default_ui_config: { layout: 'wizard', showImages: true, showProgress: true, stepByStep: true },
    card_preview_config: { showOptions: false, showCustomizationCount: true, ctaText: 'ابدأ التصميم', style: 'premium' },
    display_order: 3,
    is_active: 1,
  },
];

// ===========================
// API Functions
// ===========================

/**
 * Get all active product templates
 * Requirements: 2.1 - Allow selecting template (Simple, Medium, Complex)
 * Falls back to static templates if API is unavailable
 * 
 * @returns Promise with list of templates
 */
export async function getTemplates(): Promise<TemplatesResponse> {
  try {
    const response = await apiRequest<TemplatesResponse>('/templates');
    return response;
  } catch (error) {
    // Fallback to static templates when API is unavailable
    console.warn('Templates API unavailable, using fallback templates');
    return {
      success: true,
      data: FALLBACK_TEMPLATES,
    };
  }
}

/**
 * Get a single template by ID
 * Requirements: 2.2 - Display current template
 * 
 * @param templateId - The template ID to fetch
 * @returns Promise with template data
 */
export async function getTemplateById(templateId: string): Promise<TemplateResponse> {
  return apiRequest(`/templates/${templateId}`);
}

/**
 * Get suggested option groups for a template
 * Based on complexity level
 * Requirements: 2.5 - Suggest appropriate option groups for template
 * 
 * @param template - The template to get suggestions for
 * @returns Array of suggested group IDs
 */
export function getSuggestedGroupsForTemplate(template: ProductTemplate): string[] {
  switch (template.complexity) {
    case 'complex':
      // Complex templates suggest all customization groups
      return ['containers', 'sizes', 'flavors', 'toppings', 'sauces'];
    case 'medium':
      // Medium templates suggest sizes and flavors
      return ['sizes', 'flavors'];
    case 'simple':
    default:
      // Simple templates suggest minimal or no groups
      return [];
  }
}

/**
 * Check if a template is compatible with a given number of option groups
 * Requirements: 5.5 - Validate template compatibility
 * 
 * @param template - The template to check
 * @param optionGroupCount - Number of option groups assigned
 * @returns Object with compatibility status and message
 */
export function checkTemplateCompatibility(
  template: ProductTemplate,
  optionGroupCount: number
): { compatible: boolean; message?: string } {
  if (optionGroupCount < template.option_groups_min) {
    return {
      compatible: false,
      message: `هذا القالب يتطلب ${template.option_groups_min} مجموعات خيارات على الأقل`
    };
  }

  if (optionGroupCount > template.option_groups_max) {
    return {
      compatible: false,
      message: `هذا القالب يدعم ${template.option_groups_max} مجموعات خيارات كحد أقصى`
    };
  }

  return { compatible: true };
}
