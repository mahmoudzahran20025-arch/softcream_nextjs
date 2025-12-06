/**
 * Template Configuration
 * 
 * Defines available product templates with descriptions and features.
 * Used in ProductDetailsSection for template selection.
 */

export interface TemplateInfo {
    id: string
    name: string
    nameEn: string
    description: string
    icon: string
    preview: string
    usage: string
    features: string[]
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
        ]
    },
    {
        id: 'template_2',
        name: 'بطاقة متوسطة',
        nameEn: 'Medium Card',
        description: 'للمنتجات مع خيارات محدودة',
        icon: '🎯',
        preview: 'معاينة سريعة للخيارات',
        usage: 'مثالي للآيس كريم، الحلويات، المشروبات مع خيارات (نكهات، إضافات، أحجام)',
        features: [
            'عرض خيارات في product modal',
            'اختيار سريع ومباشر',
            'معاينة فورية للاختيارات والسعر'
        ]
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
        ]
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
