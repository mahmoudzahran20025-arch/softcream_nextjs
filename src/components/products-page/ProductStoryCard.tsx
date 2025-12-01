'use client'

import { motion } from 'framer-motion'
import {
    Leaf,
    Candy,
    Dumbbell,
    Sparkles,
    TrendingDown,
    Award,
    Zap,
    Wheat,
    Pill,
    ArrowRight
} from 'lucide-react'
import type { StoryCardData } from './data/productsContent'

interface ProductStoryCardProps {
    story: StoryCardData
    className?: string
}

// Icon mapping
const iconMap: Record<string, any> = {
    Leaf,
    Candy,
    Dumbbell,
    Sparkles,
    TrendingDown,
    Award,
    Zap,
    Wheat,
    Pill
}

export default function ProductStoryCard({
    story,
    className = ''
}: ProductStoryCardProps) {
    const IconComponent = iconMap[story.iconName] || Sparkles

    return (
        <motion.div
            whileHover={{ y: -8, rotate: 0.5 }}
            className={`
                group relative overflow-hidden rounded-[2rem] p-8 md:p-10
                bg-white/60 backdrop-blur-xl
                border border-white/40
                shadow-[0_4px_20px_rgba(0,0,0,0.02)]
                hover:shadow-[0_20px_40px_rgba(255,90,142,0.15)]
                hover:border-primary-200/50
                transition-all duration-500 ease-out
                flex flex-col justify-between
                ${className}
            `}
        >
            {/* Inner Glow on Hover */}
            <div className="absolute inset-0 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500 ring-1 ring-primary-500/20 pointer-events-none" />

            {/* Background Gradient Blob */}
            <div className={`
absolute -right-20 -top-20 w-64 h-64 rounded-full blur-3xl opacity-10
bg-gradient-to-br ${story.gradientClass}
group-hover:opacity-20 transition-opacity duration-500
    `} />

            {/* Header */}
            <div className="relative z-10 flex items-start justify-between mb-6">
                <div className={`
w-14 h-14 rounded-2xl flex items-center justify-center
bg-white shadow-sm border border-slate-100
group-hover:scale-110 transition-transform duration-300
    `}>
                    <IconComponent className={`w-7 h-7 ${story.iconColor} `} />
                </div>

                <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                    <div className="bg-primary-50 rounded-full p-2.5 text-primary-500">
                        <span className="text-xl leading-none">↗</span>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="relative z-10">
                <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-primary-600 transition-colors duration-300">
                    {story.title}
                </h3>
                <p className="text-slate-600 leading-relaxed mb-6">
                    {story.description}
                </p>
                
                {/* CTA */}
                <div className="flex items-center text-primary-500 font-medium group-hover:text-primary-600 transition-colors duration-300">
                    <span className="mr-2">Learn More</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                </div>
            </div>

            {/* Decorative Large Icon */}
            <div className="absolute -bottom-8 -right-8 opacity-[0.03] group-hover:opacity-[0.08] rotate-12 group-hover:rotate-0 group-hover:scale-110 transition-all duration-700">
                <IconComponent className="w-56 h-56 text-slate-900" />
            </div>
        </motion.div>
    )
}
