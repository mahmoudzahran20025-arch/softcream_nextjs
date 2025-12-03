'use client'

import { motion } from 'framer-motion'
import { HealthKeyword } from '@/lib/health/keywords'
import {
    Heart,
    Leaf,
    Zap,
    Dumbbell,
    Flame,
    Brain,
    Target,
    Activity,
    Scale,
    Sparkles,
    Droplets,
    Wheat,
    Milk,
    Fish,
    Apple,
    Gem,
    CircleOff,
    Stethoscope,
    Smile,
    PartyPopper,
    LucideIcon,
} from 'lucide-react'

interface HealthBadgesProps {
    keywords: Array<{ id: HealthKeyword; weight: number }>
    maxBadges?: number
    size?: 'xs' | 'sm' | 'md'
    variant?: 'default' | 'overlay'
    className?: string
}

// Badge configuration with Lucide icons, labels, and colors
const BADGE_CONFIG: Record<string, { 
    icon: LucideIcon
    label: string
    color: string
    bgClass: string
    textClass: string
    iconClass: string
}> = {
    // Nutritional Benefits (Green tones)
    'high-protein': {
        icon: Dumbbell,
        label: 'عالي البروتين',
        color: 'emerald',
        bgClass: 'bg-emerald-100 dark:bg-emerald-900/30',
        textClass: 'text-emerald-700 dark:text-emerald-300',
        iconClass: 'text-emerald-600 dark:text-emerald-400'
    },
    'low-sugar': {
        icon: Leaf,
        label: 'منخفض السكر',
        color: 'green',
        bgClass: 'bg-green-100 dark:bg-green-900/30',
        textClass: 'text-green-700 dark:text-green-300',
        iconClass: 'text-green-600 dark:text-green-400'
    },
    'sugar-free': {
        icon: CircleOff,
        label: 'خالي من السكر',
        color: 'green',
        bgClass: 'bg-green-100 dark:bg-green-900/30',
        textClass: 'text-green-700 dark:text-green-300',
        iconClass: 'text-green-600 dark:text-green-400'
    },
    'low-calorie': {
        icon: Flame,
        label: 'منخفض السعرات',
        color: 'lime',
        bgClass: 'bg-lime-100 dark:bg-lime-900/30',
        textClass: 'text-lime-700 dark:text-lime-300',
        iconClass: 'text-lime-600 dark:text-lime-400'
    },
    'fiber-rich': {
        icon: Wheat,
        label: 'غني بالألياف',
        color: 'amber',
        bgClass: 'bg-amber-100 dark:bg-amber-900/30',
        textClass: 'text-amber-700 dark:text-amber-300',
        iconClass: 'text-amber-600 dark:text-amber-400'
    },
    'calcium': {
        icon: Milk,
        label: 'غني بالكالسيوم',
        color: 'blue',
        bgClass: 'bg-blue-100 dark:bg-blue-900/30',
        textClass: 'text-blue-700 dark:text-blue-300',
        iconClass: 'text-blue-600 dark:text-blue-400'
    },

    // Energy & Performance (Amber/Orange tones)
    'energy-boost': {
        icon: Zap,
        label: 'طاقة',
        color: 'amber',
        bgClass: 'bg-amber-100 dark:bg-amber-900/30',
        textClass: 'text-amber-700 dark:text-amber-300',
        iconClass: 'text-amber-500'
    },
    'focus': {
        icon: Target,
        label: 'تركيز',
        color: 'orange',
        bgClass: 'bg-orange-100 dark:bg-orange-900/30',
        textClass: 'text-orange-700 dark:text-orange-300',
        iconClass: 'text-orange-500'
    },
    'brain-food': {
        icon: Brain,
        label: 'غذاء للعقل',
        color: 'purple',
        bgClass: 'bg-purple-100 dark:bg-purple-900/30',
        textClass: 'text-purple-700 dark:text-purple-300',
        iconClass: 'text-purple-500'
    },
    'pre-workout': {
        icon: Activity,
        label: 'قبل التمرين',
        color: 'orange',
        bgClass: 'bg-orange-100 dark:bg-orange-900/30',
        textClass: 'text-orange-700 dark:text-orange-300',
        iconClass: 'text-orange-500'
    },
    'post-workout': {
        icon: Dumbbell,
        label: 'بعد التمرين',
        color: 'emerald',
        bgClass: 'bg-emerald-100 dark:bg-emerald-900/30',
        textClass: 'text-emerald-700 dark:text-emerald-300',
        iconClass: 'text-emerald-500'
    },

    // Health Categories (Purple/Pink tones)
    'antioxidant': {
        icon: Sparkles,
        label: 'مضادات أكسدة',
        color: 'purple',
        bgClass: 'bg-purple-100 dark:bg-purple-900/30',
        textClass: 'text-purple-700 dark:text-purple-300',
        iconClass: 'text-purple-500'
    },
    'probiotic': {
        icon: Heart,
        label: 'بروبيوتيك',
        color: 'pink',
        bgClass: 'bg-pink-100 dark:bg-pink-900/30',
        textClass: 'text-pink-700 dark:text-pink-300',
        iconClass: 'text-pink-500'
    },
    'omega-3': {
        icon: Fish,
        label: 'أوميغا 3',
        color: 'cyan',
        bgClass: 'bg-cyan-100 dark:bg-cyan-900/30',
        textClass: 'text-cyan-700 dark:text-cyan-300',
        iconClass: 'text-cyan-500'
    },
    'vitamin-rich': {
        icon: Apple,
        label: 'غني بالفيتامينات',
        color: 'orange',
        bgClass: 'bg-orange-100 dark:bg-orange-900/30',
        textClass: 'text-orange-700 dark:text-orange-300',
        iconClass: 'text-orange-500'
    },
    'mineral-rich': {
        icon: Gem,
        label: 'غني بالمعادن',
        color: 'slate',
        bgClass: 'bg-slate-100 dark:bg-slate-800',
        textClass: 'text-slate-700 dark:text-slate-300',
        iconClass: 'text-slate-500'
    },

    // Lifestyle (Mixed tones)
    'balanced': {
        icon: Scale,
        label: 'متوازن',
        color: 'teal',
        bgClass: 'bg-teal-100 dark:bg-teal-900/30',
        textClass: 'text-teal-700 dark:text-teal-300',
        iconClass: 'text-teal-500'
    },
    'moderate': {
        icon: Scale,
        label: 'معتدل',
        color: 'slate',
        bgClass: 'bg-slate-100 dark:bg-slate-800',
        textClass: 'text-slate-700 dark:text-slate-300',
        iconClass: 'text-slate-500'
    },
    'healthy': {
        icon: Heart,
        label: 'صحي',
        color: 'green',
        bgClass: 'bg-green-100 dark:bg-green-900/30',
        textClass: 'text-green-700 dark:text-green-300',
        iconClass: 'text-green-500'
    },
    'indulgent': {
        icon: PartyPopper,
        label: 'للاستمتاع',
        color: 'pink',
        bgClass: 'bg-pink-100 dark:bg-pink-900/30',
        textClass: 'text-pink-700 dark:text-pink-300',
        iconClass: 'text-pink-500'
    },
    'guilt-free': {
        icon: Smile,
        label: 'بدون ذنب',
        color: 'green',
        bgClass: 'bg-green-100 dark:bg-green-900/30',
        textClass: 'text-green-700 dark:text-green-300',
        iconClass: 'text-green-500'
    },
    'refreshing': {
        icon: Droplets,
        label: 'منعش',
        color: 'cyan',
        bgClass: 'bg-cyan-100 dark:bg-cyan-900/30',
        textClass: 'text-cyan-700 dark:text-cyan-300',
        iconClass: 'text-cyan-500'
    },

    // Special Diets (Various tones)
    'keto-friendly': {
        icon: Leaf,
        label: 'كيتو',
        color: 'green',
        bgClass: 'bg-green-100 dark:bg-green-900/30',
        textClass: 'text-green-700 dark:text-green-300',
        iconClass: 'text-green-600'
    },
    'diabetic-friendly': {
        icon: Stethoscope,
        label: 'مناسب للسكري',
        color: 'blue',
        bgClass: 'bg-blue-100 dark:bg-blue-900/30',
        textClass: 'text-blue-700 dark:text-blue-300',
        iconClass: 'text-blue-500'
    },
    'gluten-free': {
        icon: Wheat,
        label: 'خالي من الجلوتين',
        color: 'amber',
        bgClass: 'bg-amber-100 dark:bg-amber-900/30',
        textClass: 'text-amber-700 dark:text-amber-300',
        iconClass: 'text-amber-600'
    },
    'lactose-free': {
        icon: Milk,
        label: 'خالي من اللاكتوز',
        color: 'blue',
        bgClass: 'bg-blue-100 dark:bg-blue-900/30',
        textClass: 'text-blue-700 dark:text-blue-300',
        iconClass: 'text-blue-500'
    },
    'vegan': {
        icon: Leaf,
        label: 'نباتي',
        color: 'green',
        bgClass: 'bg-green-100 dark:bg-green-900/30',
        textClass: 'text-green-700 dark:text-green-300',
        iconClass: 'text-green-600'
    }
}

/**
 * HealthBadges - عرض شارات صحية مع أيقونات Lucide
 * 
 * Requirements: 5.1, 5.2, 5.3, 5.4
 * - 5.1: Calories badge → Lucide Flame icon with orange color
 * - 5.2: Protein info → Lucide Dumbbell icon with blue color
 * - 5.3: Energy info → Lucide Zap icon with amber color
 * - 5.4: Health benefits → Lucide Heart or Leaf icons with green color
 */
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

    // Size classes for text and padding
    const sizeClasses = {
        xs: 'text-[10px] px-2 py-0.5 gap-0.5',
        sm: 'text-xs px-2.5 py-1 gap-1',
        md: 'text-sm px-3 py-1.5 gap-1.5'
    }

    // Icon size classes
    const iconSizeClasses = {
        xs: 'w-3 h-3',
        sm: 'w-3.5 h-3.5',
        md: 'w-4 h-4'
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

                // Fallback for unknown keywords - use Heart icon as default
                if (!config) {
                    return (
                        <span
                            key={keyword.id}
                            className={`inline-flex items-center rounded-full font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 ${sizeClasses[size]}`}
                        >
                            <Heart className={`${iconSizeClasses[size]} text-slate-500`} />
                            <span>{keyword.id}</span>
                        </span>
                    )
                }

                const Icon = config.icon

                return (
                    <motion.span
                        key={keyword.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className={`inline-flex items-center rounded-full font-medium ${config.bgClass} ${config.textClass} ${sizeClasses[size]} ${variantClasses[variant]}`}
                        title={config.label}
                    >
                        <Icon className={`flex-shrink-0 ${iconSizeClasses[size]} ${config.iconClass}`} />
                        <span>{config.label}</span>
                    </motion.span>
                )
            })}
        </div>
    )
}
