/**
 * Template Configuration
 * 
 * Defines available product templates with descriptions and features.
 * Used in ProductDetailsSection for template selection.
 * 
 * Requirements 6.1: Template → Card Type Mapping
 * - template_1 → SimpleCard (simple)
 * - template_2 → StandardCard (medium)
 * - template_3 → BYOCard (complex)
 * - template_lifestyle → LifestyleCard (medium with nutrition)
 * 
 * Requirements 6.2, 6.4: Clear descriptions and visual previews
 */

/**
 * Card type that the template renders
 * Maps to actual card components in ProductCard.tsx
 */
export type CardType = 'simple' | 'medium' | 'complex'

export interface TemplateInfo {
    id: string
    name: string
    nameEn: string
    description: string
    icon: string
    preview: string
    usage: string
    features: string[]
    /** Card type this template renders (Requirements 6.1) */
    cardType: CardType
    /** Card component name for clarity */
    cardComponent: string
    /** Visual preview color theme */
    themeColor: string
}

export const TEMPLATES: TemplateInfo[] = [
    {
        id: 'template_1',
        name: 'بطاقة بسيطة',
        nameEn: 'Simple Card',
        description: 'للمنتجات الجاهزة - إضافة سريعة للسلة',
        icon: '⚡',
        preview: 'زر "أضف للسلة" مباشرة',
        usage: 'مثالي للمنتجات الثابتة (عصائر، مشروبات جاهزة، حلويات بدون تخصيص)',
        features: [
            'إضافة فورية للسلة بدون modal',
            'لا يوجد تخصيص أو خيارات',
            'سرعة قصوى في الطلب'
        ],
        cardType: 'simple',
        cardComponent: 'SimpleCard',
        themeColor: 'amber'
    },
    {
        id: 'template_2',
        name: 'بطاقة متوسطة',
        nameEn: 'Standard Card',
        description: 'للمنتجات مع خيارات محدودة',
        icon: '🎯',
        preview: 'معاينة سريعة للخيارات',
        usage: 'مثالي للآيس كريم، الحلويات، المشروبات مع خيارات (نكهات، إضافات، أحجام)',
        features: [
            'عرض خيارات في product modal',
            'اختيار سريع ومباشر',
            'معاينة فورية للاختيارات والسعر'
        ],
        cardType: 'medium',
        cardComponent: 'StandardCard',
        themeColor: 'pink'
    },
    {
        id: 'template_3',
        name: 'تخصيص كامل (BYO)',
        nameEn: 'Build Your Own',
        description: 'لمنتجات BYO مع تخصيص متقدم',
        icon: '✨',
        preview: 'واجهة خطوة بخطوة (Wizard)',
        usage: 'مثالي لـ Build Your Own - تخصيص شامل مع خطوات تدريجية',
        features: [
            'واجهة wizard متقدمة',
            'تخصيص كامل لكل التفاصيل',
            'معاينة مباشرة مع كل خطوة'
        ],
        cardType: 'complex',
        cardComponent: 'BYOCard',
        themeColor: 'purple'
    },
    {
        id: 'template_lifestyle',
        name: 'نمط حياة صحي',
        nameEn: 'Lifestyle Card',
        description: 'لمنتجات صحية تتبع توازن غذائي',
        icon: '🌿',
        preview: 'عرض القيم الغذائية + تخصيص',
        usage: 'للمنتجات الصحية (Diet, Keto, Vegan) التي تتطلب اختيار بين خطط معدة مسبقاً أو تخصيص',
        features: [
            'عرض القيم الغذائية (Fat, Carbs, Protein)',
            'خطوات مخصصة للأنظمة الغذائية',
            'تركيز على الأهداف الصحية'
        ],
        cardType: 'medium',
        cardComponent: 'LifestyleCard',
        themeColor: 'emerald'
    }
]

/**
 * Get template info by ID
 */
export function getTemplateById(templateId: string): TemplateInfo | undefined {
    return TEMPLATES.find(t => t.id === templateId)
}

/**
 * Get default template
 */
export function getDefaultTemplate(): TemplateInfo {
    return TEMPLATES[0] // template_1
}

/**
 * Get card type from template ID (Requirements 6.1)
 * Maps template_id to the card component type
 * 
 * @param templateId - The template ID
 * @returns CardType ('simple' | 'medium' | 'complex')
 */
export function getCardTypeFromTemplateId(templateId: string): CardType {
    const template = getTemplateById(templateId)
    return template?.cardType ?? 'medium' // Default to medium (StandardCard)
}

/**
 * Get card component name from template ID
 * For display purposes in admin UI
 */
export function getCardComponentName(templateId: string): string {
    const template = getTemplateById(templateId)
    return template?.cardComponent ?? 'StandardCard'
}
