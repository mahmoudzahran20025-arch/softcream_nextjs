// ================================================================
// Options System Types
// Everything-as-Option Architecture
// ================================================================

export interface Option {
    id: string
    group_id: string
    name: string
    name_ar: string
    name_en: string
    base_price: number
    calories?: number
    protein?: number
    carbs?: number
    sugar?: number
    fat?: number
    fiber?: number
    available: number
    display_order: number
    description_ar?: string
    description_en?: string
    image?: string
}

export interface OptionGroup {
    id: string
    name_ar: string
    name_en: string
    description_ar?: string
    description_en?: string
    display_style: 'cards' | 'pills' | 'list' | 'checkbox'
    display_order: number
    icon?: string
    is_required: number
    min_selections: number
    max_selections: number
    options: Option[]
    // ❌ REMOVED: group_order (Migration 0025 - redundant with display_order)
}
