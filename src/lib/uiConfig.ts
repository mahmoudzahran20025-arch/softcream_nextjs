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
    displayMode: 'grid' | 'list' | 'pills' | 'cards'
    columns?: number
    cardSize?: 'sm' | 'md' | 'lg'
    showImages?: boolean
    showPrices?: boolean
    accentColor?: string
    icon?: IconConfig
    layout?: LayoutConfig
    // Badge settings (Requirements 4.1, 4.2)
    badge?: string
    badge_color?: string
    // Display style for option groups (Requirement 4.3)
    display_style?: 'cards' | 'pills' | 'list' | 'checkbox'
}

const DEFAULT_UI_CONFIG: UIConfig = {
    displayMode: 'grid',
    columns: 3,
    cardSize: 'md',
    showImages: true,
    showPrices: true,
    accentColor: 'pink',
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
export function parseUIConfig(uiConfigJSON?: string): UIConfig {
    if (!uiConfigJSON || uiConfigJSON === '{}') {
        return DEFAULT_UI_CONFIG
    }

    try {
        const config = JSON.parse(uiConfigJSON)
        return {
            displayMode: config.displayMode || config.display_style || DEFAULT_UI_CONFIG.displayMode,
            columns: config.columns || DEFAULT_UI_CONFIG.columns,
            cardSize: config.cardSize || DEFAULT_UI_CONFIG.cardSize,
            showImages: config.showImages ?? DEFAULT_UI_CONFIG.showImages,
            showPrices: config.showPrices ?? DEFAULT_UI_CONFIG.showPrices,
            accentColor: config.accentColor || DEFAULT_UI_CONFIG.accentColor,
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
            // Badge settings (Requirements 4.1, 4.2)
            badge: config.badge,
            badge_color: config.badge_color,
            // Display style for option groups (Requirement 4.3)
            display_style: config.display_style
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
