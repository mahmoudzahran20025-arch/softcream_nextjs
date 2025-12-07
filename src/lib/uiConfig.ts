// src/lib/uiConfig.ts - UI Configuration Parser
// ================================================================

export interface IconConfig {
    type: 'emoji' | 'lucide' | 'custom'
    value: string
    style?: 'solid' | 'gradient' | 'glow'
    animation?: 'none' | 'pulse' | 'bounce' | 'spin'
}

export interface LayoutConfig {
    spacing?: 'compact' | 'normal' | 'loose'
    alignment?: 'left' | 'center' | 'right'
}

export interface UIConfig {
    display_style: 'grid' | 'list' | 'pills' | 'cards' | 'checkbox'
    section_type?: 'default' | 'hero_selection' | 'compact_addons' | 'interactive_meter'
    columns?: 1 | 2 | 3 | 4
    card_size?: 'sm' | 'md' | 'lg'
    show_images?: boolean
    show_prices?: boolean
    show_macros?: boolean
    accent_color?: string
    icon?: IconConfig
    layout?: LayoutConfig
    badge?: string
    badge_color?: string
    theme?: string
}

const DEFAULT_UI_CONFIG: UIConfig = {
    display_style: 'grid',
    section_type: 'default',
    columns: 3,
    card_size: 'md',
    show_images: true,
    show_prices: true,
    show_macros: false,
    accent_color: 'pink',
    icon: {
        type: 'emoji',
        value: '🍦',
        style: 'solid',
        animation: 'none'
    },
    layout: {
        spacing: 'normal',
        alignment: 'center'
    }
}

/**
 * Parse UI Config JSON string
 * @param uiConfigJSON - JSON string from database
 * @returns Parsed UIConfig with defaults
 */
export function parseUIConfig(uiConfigJSON?: string | object): UIConfig {
    if (!uiConfigJSON || uiConfigJSON === '{}') {
        return DEFAULT_UI_CONFIG
    }

    try {
        const config = typeof uiConfigJSON === 'string' ? JSON.parse(uiConfigJSON) : uiConfigJSON
        return {
            display_style: config.display_style || config.displayMode || DEFAULT_UI_CONFIG.display_style,
            section_type: config.section_type || DEFAULT_UI_CONFIG.section_type,
            columns: config.columns || DEFAULT_UI_CONFIG.columns,
            card_size: config.card_size || config.cardSize || DEFAULT_UI_CONFIG.card_size,
            show_images: config.show_images ?? config.showImages ?? DEFAULT_UI_CONFIG.show_images,
            show_prices: config.show_prices ?? config.showPrices ?? DEFAULT_UI_CONFIG.show_prices,
            show_macros: config.show_macros ?? config.showMacros ?? DEFAULT_UI_CONFIG.show_macros,
            accent_color: config.accent_color || config.accentColor || DEFAULT_UI_CONFIG.accent_color,
            icon: {
                type: config.icon?.type || DEFAULT_UI_CONFIG.icon!.type,
                value: config.icon?.value || DEFAULT_UI_CONFIG.icon!.value,
                style: config.icon?.style || DEFAULT_UI_CONFIG.icon!.style,
                animation: config.icon?.animation || DEFAULT_UI_CONFIG.icon!.animation
            },
            layout: {
                spacing: config.layout?.spacing || DEFAULT_UI_CONFIG.layout!.spacing,
                alignment: config.layout?.alignment || DEFAULT_UI_CONFIG.layout!.alignment
            },
            badge: config.badge,
            badge_color: config.badge_color,
            theme: config.theme
        }
    } catch (error) {
        console.error('Failed to parse UI config:', error)
        return DEFAULT_UI_CONFIG
    }
}

/**
 * Get template configuration from template object
 */
export function parseTemplateConfig(templateConfig?: any) {
    if (!templateConfig) return null

    try {
        return {
            cardPreview: JSON.parse(templateConfig.card_preview_config || '{}'),
            defaultUI: JSON.parse(templateConfig.default_ui_config || '{}')
        }
    } catch (error) {
        console.error('Failed to parse template config:', error)
        return null
    }
}
