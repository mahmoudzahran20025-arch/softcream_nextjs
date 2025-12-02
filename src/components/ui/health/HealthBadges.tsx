'use client'

import { motion } from 'framer-motion'
import { HealthKeyword } from '@/lib/health/keywords'

interface HealthBadgesProps {
    keywords: Array<{ id: HealthKeyword; weight: number }>
    maxBadges?: number
    size?: 'xs' | 'sm' | 'md'
    variant?: 'default' | 'overlay'
    className?: string
}

// Badge configuration with icons, labels, and colors
const BADGE_CONFIG: Record<string, { icon: string; label: string; color: string; bgClass: string; textClass: string }> = {
    // Nutritional Benefits (Green tones)
    'high-protein': {
        icon: '💪',
        label: 'عالي البروتين',
        color: 'emerald',
        bgClass: 'bg-emerald-100 dark:bg-emerald-900/30',
        textClass: 'text-emerald-700 dark:text-emerald-300'
    },
    'low-sugar': {
        icon: '🌱',
        label: 'منخفض السكر',
        color: 'green',
        bgClass: 'bg-green-100 dark:bg-green-900/30',
        textClass: 'text-green-700 dark:text-green-300'
    },
    'sugar-free': {
        icon: '🚫',
        label: 'خالي من السكر',
        color: 'green',
        bgClass: 'bg-green-100 dark:bg-green-900/30',
        textClass: 'text-green-700 dark:text-green-300'
    },
    'low-calorie': {
        icon: '🪶',
        label: 'منخفض السعرات',
        color: 'lime',
        bgClass: 'bg-lime-100 dark:bg-lime-900/30',
        textClass: 'text-lime-700 dark:text-lime-300'
    },
    'fiber-rich': {
        icon: '🌾',
        label: 'غني بالألياف',
        color: 'amber',
        bgClass: 'bg-amber-100 dark:bg-amber-900/30',
        textClass: 'text-amber-700 dark:text-amber-300'
    },
    'calcium': {
        icon: '🥛',
        label: 'غني بالكالسيوم',
        color: 'blue',
        bgClass: 'bg-blue-100 dark:bg-blue-900/30',
        textClass: 'text-blue-700 dark:text-blue-300'
    },

    // Energy & Performance (Amber/Orange tones)
    'energy-boost': {
        icon: '⚡',
        label: 'طاقة',
        color: 'amber',
        bgClass: 'bg-amber-100 dark:bg-amber-900/30',
        textClass: 'text-amber-700 dark:text-amber-300'
    },
    'focus': {
        icon: '🎯',
        label: 'تركيز',
        color: 'orange',
        bgClass: 'bg-orange-100 dark:bg-orange-900/30',
        textClass: 'text-orange-700 dark:text-orange-300'
    },
    'brain-food': {
        icon: '🧠',
        label: 'غذاء للعقل',
        color: 'purple',
        bgClass: 'bg-purple-100 dark:bg-purple-900/30',
        textClass: 'text-purple-700 dark:text-purple-300'
    },
    'pre-workout': {
        icon: '🏃',
        label: 'قبل التمرين',
        color: 'orange',
        bgClass: 'bg-orange-100 dark:bg-orange-900/30',
        textClass: 'text-orange-700 dark:text-orange-300'
    },
    'post-workout': {
        icon: '💪',
        label: 'بعد التمرين',
        color: 'emerald',
        bgClass: 'bg-emerald-100 dark:bg-emerald-900/30',
        textClass: 'text-emerald-700 dark:text-emerald-300'
    },

    // Health Categories (Purple/Pink tones)
    'antioxidant': {
        icon: '🍓',
        label: 'مضادات أكسدة',
        color: 'purple',
        bgClass: 'bg-purple-100 dark:bg-purple-900/30',
        textClass: 'text-purple-700 dark:text-purple-300'
    },
    'probiotic': {
        icon: '🦠',
        label: 'بروبيوتيك',
        color: 'pink',
        bgClass: 'bg-pink-100 dark:bg-pink-900/30',
        textClass: 'text-pink-700 dark:text-pink-300'
    },
    'omega-3': {
        icon: '🐟',
        label: 'أوميغا 3',
        color: 'cyan',
        bgClass: 'bg-cyan-100 dark:bg-cyan-900/30',
        textClass: 'text-cyan-700 dark:text-cyan-300'
    },
    'vitamin-rich': {
        icon: '🍊',
        label: 'غني بالفيتامينات',
        color: 'orange',
        bgClass: 'bg-orange-100 dark:bg-orange-900/30',
        textClass: 'text-orange-700 dark:text-orange-300'
    },
    'mineral-rich': {
        icon: '💎',
        label: 'غني بالمعادن',
        color: 'slate',
        bgClass: 'bg-slate-100 dark:bg-slate-800',
        textClass: 'text-slate-700 dark:text-slate-300'
    },

    // Lifestyle (Mixed tones)
    'balanced': {
        icon: '⚖️',
        label: 'متوازن',
        color: 'teal',
        bgClass: 'bg-teal-100 dark:bg-teal-900/30',
        textClass: 'text-teal-700 dark:text-teal-300'
    },
    'moderate': {
        icon: '👌',
        label: 'معتدل',
        color: 'slate',
        bgClass: 'bg-slate-100 dark:bg-slate-800',
        textClass: 'text-slate-700 dark:text-slate-300'
    },
    'healthy': {
        icon: '💚',
        label: 'صحي',
        color: 'green',
        bgClass: 'bg-green-100 dark:bg-green-900/30',
        textClass: 'text-green-700 dark:text-green-300'
    },
    'indulgent': {
        icon: '🎉',
        label: 'للاستمتاع',
        color: 'pink',
        bgClass: 'bg-pink-100 dark:bg-pink-900/30',
        textClass: 'text-pink-700 dark:text-pink-300'
    },
    'guilt-free': {
        icon: '😊',
        label: 'بدون ذنب',
        color: 'green',
        bgClass: 'bg-green-100 dark:bg-green-900/30',
        textClass: 'text-green-700 dark:text-green-300'
    },
    'refreshing': {
        icon: '🌊',
        label: 'منعش',
        color: 'cyan',
        bgClass: 'bg-cyan-100 dark:bg-cyan-900/30',
        textClass: 'text-cyan-700 dark:text-cyan-300'
    },

    // Special Diets (Various tones)
    'keto-friendly': {
        icon: '🥑',
        label: 'كيتو',
        color: 'green',
        bgClass: 'bg-green-100 dark:bg-green-900/30',
        textClass: 'text-green-700 dark:text-green-300'
    },
    'diabetic-friendly': {
        icon: '🩺',
        label: 'مناسب للسكري',
        color: 'blue',
        bgClass: 'bg-blue-100 dark:bg-blue-900/30',
        textClass: 'text-blue-700 dark:text-blue-300'
    },
    'gluten-free': {
        icon: '🌾',
        label: 'خالي من الجلوتين',
        color: 'amber',
        bgClass: 'bg-amber-100 dark:bg-amber-900/30',
        textClass: 'text-amber-700 dark:text-amber-300'
    },
    'lactose-free': {
        icon: '🥛',
        label: 'خالي من اللاكتوز',
        color: 'blue',
        bgClass: 'bg-blue-100 dark:bg-blue-900/30',
        textClass: 'text-blue-700 dark:text-blue-300'
    },
    'vegan': {
        icon: '🌱',
        label: 'نباتي',
        color: 'green',
        bgClass: 'bg-green-100 dark:bg-green-900/30',
        textClass: 'text-green-700 dark:text-green-300'
    }
}

export default function HealthBadges({
    keywords,
    maxBadges = 3,
    size = 'sm',
    variant = 'default',
    className = ''
}: HealthBadgesProps) {
    // Sort by weight (descending) and take top N
    const topKeywords = keywords
        .sort((a, b) => b.weight - a.weight)
        .slice(0, maxBadges)

    if (topKeywords.length === 0) return null

    // Size classes
    const sizeClasses = {
        xs: 'text-[10px] px-2 py-0.5 gap-0.5',
        sm: 'text-xs px-2.5 py-1 gap-1',
        md: 'text-sm px-3 py-1.5 gap-1.5'
    }

    // Variant classes
    const variantClasses = {
        default: '',
        overlay: 'backdrop-blur-sm bg-opacity-90 dark:bg-opacity-90'
    }

    return (
        <div className={`flex flex-wrap gap-1.5 ${className}`}>
            {topKeywords.map((keyword, index) => {
                const config = BADGE_CONFIG[keyword.id]

                // Fallback for unknown keywords
                if (!config) {
                    return (
                        <span
                            key={keyword.id}
                            className={`inline-flex items-center rounded-full font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 ${sizeClasses[size]}`}
                        >
                            <span>{keyword.id}</span>
                        </span>
                    )
                }

                return (
                    <motion.span
                        key={keyword.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className={`inline-flex items-center rounded-full font-medium ${config.bgClass} ${config.textClass} ${sizeClasses[size]} ${variantClasses[variant]}`}
                        title={config.label}
                    >
                        <span className="flex-shrink-0">{config.icon}</span>
                        <span>{config.label}</span>
                    </motion.span>
                )
            })}
        </div>
    )
}
