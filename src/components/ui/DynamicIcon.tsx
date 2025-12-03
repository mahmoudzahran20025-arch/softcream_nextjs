'use client'

import { motion } from 'framer-motion'
import type { IconConfig } from '@/lib/uiConfig'
import * as LucideIcons from 'lucide-react'

interface DynamicIconProps {
    config: IconConfig
    size?: number
    className?: string
}

/**
 * DynamicIcon Component
 * Renders icons based on configuration from backend
 * Supports: emojis, Lucide icons, custom SVG/images
 */
export default function DynamicIcon({
    config,
    size = 20,
    className = ''
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
                    transition: { repeat: Infinity, duration: 3, ease: 'linear' }
                }
            default:
                return {}
        }
    }

    // Get style classes
    const getStyleClasses = () => {
        const baseClasses = 'inline-flex items-center justify-center'

        switch (config.style) {
            case 'gradient':
                return `${baseClasses} bg-gradient-to-br from-pink-500 to-rose-500 bg-clip-text text-transparent`
            case 'glow':
                return `${baseClasses} drop-shadow-lg`
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

    // Lucide Icons
    if (config.type === 'lucide') {
        const IconComponent = (LucideIcons as any)[config.value]

        if (!IconComponent) {
            console.warn(`Lucide icon "${config.value}" not found`)
            return <span className={className}>🍦</span>
        }

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
