'use client'

import { motion } from 'framer-motion'
import type { IconConfig } from '@/lib/uiConfig'
import * as LucideIcons from 'lucide-react'

/**
 * Icon name mapping for common invalid/legacy icon names
 * Maps invalid icon names to valid Lucide icon names
 * This handles data that was entered before icon validation was added
 */
const ICON_NAME_MAPPING: Record<string, string> = {
    // Common invalid icons → valid alternatives
    'Cup': 'Coffee',           // Cup doesn't exist, use Coffee
    'Dessert': 'Cake',         // Dessert doesn't exist, use Cake
    'Food': 'UtensilsCrossed', // Food doesn't exist
    'Drink': 'GlassWater',     // Drink doesn't exist
    'Bowl': 'Soup',            // Bowl doesn't exist
    'Glass': 'Wine',           // Glass doesn't exist
    'Mug': 'Coffee',           // Mug doesn't exist
    'Plate': 'UtensilsCrossed',// Plate doesn't exist
    'Spoon': 'Utensils',       // Spoon doesn't exist
    'Fork': 'Utensils',        // Fork doesn't exist
};

/**
 * Normalize icon name - applies mapping for invalid icons
 */
function normalizeIconName(iconName: string): string {
    return ICON_NAME_MAPPING[iconName] || iconName;
}

interface DynamicIconProps {
    config: IconConfig
    size?: number
    className?: string
    color?: string // 'pink' | 'amber' | 'purple' | 'cyan' | 'emerald'
}

/**
 * Check if a Lucide icon name is valid
 * Requirements: 2.4, 2.5
 * Note: Lucide icons can be either functions (in some bundler configs) or objects (React.forwardRef components)
 */
export function isValidLucideIcon(iconName: string): boolean {
    const icon = (LucideIcons as any)[iconName];
    // Check if it's a valid React component (function or object with $$typeof)
    return icon != null && (typeof icon === 'function' || (typeof icon === 'object' && icon.$$typeof != null));
}

/**
 * Get Lucide icon component with fallback chain
 * Requirements: 2.4, 2.5
 * 
 * Fallback order:
 * 1. Normalized primary icon (config.value with mapping applied)
 * 2. Normalized fallback icon (config.fallback with mapping applied)
 * 3. Circle (ultimate fallback)
 */
export function getLucideIconComponent(config: IconConfig): LucideIcons.LucideIcon {
    // Normalize icon names (apply mapping for invalid icons)
    const normalizedValue = normalizeIconName(config.value);
    const normalizedFallback = config.fallback ? normalizeIconName(config.fallback) : undefined;
    
    // Try normalized primary icon
    if (isValidLucideIcon(normalizedValue)) {
        return (LucideIcons as any)[normalizedValue];
    }
    
    // Log warning for invalid primary icon (only if mapping didn't help)
    if (normalizedValue === config.value) {
        console.warn(`Invalid Lucide icon: "${config.value}", attempting fallback`);
    }
    
    // Try normalized fallback icon
    if (normalizedFallback && isValidLucideIcon(normalizedFallback)) {
        return (LucideIcons as any)[normalizedFallback];
    }
    
    // Log warning if fallback also invalid
    if (config.fallback && normalizedFallback === config.fallback) {
        console.warn(`Fallback icon "${config.fallback}" also invalid, using Circle`);
    }
    
    // Ultimate fallback to Circle
    return LucideIcons.Circle;
}

/**
 * DynamicIcon Component
 * Renders icons based on configuration from backend
 * Supports: emojis, Lucide icons, custom SVG/images
 * 
 * Requirements: 2.3, 2.4, 2.5
 * - Renders Lucide icon by name
 * - Falls back to fallback icon if primary invalid
 * - Falls back to Circle if all else fails
 * - Logs warning for invalid icons
 */
export default function DynamicIcon({
    config,
    size = 20,
    className = '',
    color = 'pink'
}: DynamicIconProps) {
    // Get animation variants
    const getAnimation = () => {
        switch (config.animation) {
            case 'pulse':
                return {
                    scale: [1, 1.2, 1],
                    transition: { repeat: Infinity, duration: 2 }
                }
            case 'bounce':
                return {
                    y: [0, -10, 0],
                    transition: { repeat: Infinity, duration: 1.5 }
                }
            case 'spin':
                return {
                    rotate: 360,
                    transition: { repeat: Infinity, duration: 3, ease: 'linear' as const }
                }
            default:
                return undefined
        }
    }

    // Map color names to Tailwind classes
    const colorMap: Record<string, { gradient: string, text: string }> = {
        pink: { gradient: 'from-pink-500 to-rose-500', text: 'text-pink-500' },
        amber: { gradient: 'from-amber-500 to-orange-500', text: 'text-amber-500' },
        purple: { gradient: 'from-purple-500 to-violet-500', text: 'text-purple-500' },
        cyan: { gradient: 'from-cyan-500 to-blue-500', text: 'text-cyan-500' },
        emerald: { gradient: 'from-emerald-500 to-green-500', text: 'text-emerald-500' },
        // Fallback
        default: { gradient: 'from-slate-500 to-slate-700', text: 'text-slate-700' }
    }

    const activeColor = colorMap[color] || colorMap['default']

    // Get style classes
    const getStyleClasses = () => {
        const baseClasses = 'inline-flex items-center justify-center'

        switch (config.style) {
            case 'gradient':
                return `${baseClasses} bg-gradient-to-br ${activeColor.gradient} bg-clip-text text-transparent`
            case 'solid':
                return `${baseClasses} ${activeColor.text}`
            case 'glow':
                return `${baseClasses} drop-shadow-lg ${activeColor.text}`
            default:
                return baseClasses
        }
    }

    // Emoji Icons
    if (config.type === 'emoji') {
        return (
            <motion.span
                animate={getAnimation()}
                className={`${getStyleClasses()} ${className}`}
                style={{ fontSize: size }}
            >
                {config.value}
            </motion.span>
        )
    }

    // Lucide Icons - with fallback chain (Requirements: 2.3, 2.4, 2.5)
    if (config.type === 'lucide') {
        const IconComponent = getLucideIconComponent(config);

        return (
            <motion.div animate={getAnimation()} className={className}>
                <IconComponent size={size} className={getStyleClasses()} />
            </motion.div>
        )
    }

    // Custom SVG/Image
    if (config.type === 'custom') {
        return (
            <motion.img
                src={config.value}
                alt="icon"
                animate={getAnimation()}
                className={`${getStyleClasses()} ${className}`}
                style={{ width: size, height: size }}
            />
        )
    }

    // Fallback
    return <span className={className}>🍦</span>
}
