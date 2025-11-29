'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import {
    Leaf,
    Candy,
    Dumbbell,
    Sparkles,
    TrendingDown,
    Award,
    Zap,
    Wheat,
    Pill
} from 'lucide-react'
import type { StoryCardData } from './data/productsContent'
import { useHydrated } from '@/hooks/useHydrated'

interface ProductStoryCardProps {
    index: number
    story: StoryCardData
    totalCards: number
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
    index,
    story,
    totalCards
}: ProductStoryCardProps) {
    const isHydrated = useHydrated()
    const containerRef = useRef<HTMLDivElement>(null)

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start end', 'start start'],
    })

    // Scale effect for stacking
    const targetScale = 1 - ((totalCards - index) * 0.05)
    const scale = useTransform(
        scrollYProgress,
        [0, 1],
        [1, targetScale]
    )

    // Text slide in from side effect
    const textX = useTransform(
        scrollYProgress,
        [0, 0.5, 1],
        story.textPosition === 'left' ? [-100, 0, 0] : [100, 0, 0]
    )

    const textOpacity = useTransform(
        scrollYProgress,
        [0, 0.3, 0.7, 1],
        [0, 1, 1, 0.8]
    )

    const IconComponent = iconMap[story.iconName] || Sparkles

    // SSR fallback
    if (!isHydrated) {
        return (
            <div
                ref={containerRef}
                className="h-screen flex items-center justify-center sticky top-0 px-4 sm:px-6 md:px-8"
            >
                <div className={`w-full max-w-6xl h-[500px] rounded-3xl p-10 ${story.gradientClass} ${story.glowColor}`}>
                    {/* Static content during SSR */}
                </div>
            </div>
        )
    }

    return (
        <div
            ref={containerRef}
            className="h-screen flex items-center justify-center sticky top-0 px-4 sm:px-6 md:px-8"
        >
            <motion.div
                style={{
                    scale,
                    top: `calc(-5vh + ${index * 25}px)`,
                }}
                className={`
          relative w-full max-w-6xl h-[500px] 
          rounded-3xl p-10 
          ${story.gradientClass} ${story.glowColor}
          hover:scale-[1.02] transition-all duration-300
          overflow-hidden
        `}
            >
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                    <div className="absolute inset-0" style={{
                        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
                        backgroundSize: '30px 30px'
                    }} />
                </div>

                {/* Content */}
                <div className={`relative z-10 h-full flex items-center gap-12 ${story.textPosition === 'right' ? 'flex-row-reverse' : 'flex-row'
                    }`}>

                    {/* Text Content - Animated from side */}
                    <motion.div
                        style={{
                            x: textX,
                            opacity: textOpacity
                        }}
                        className="flex-1 space-y-6"
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 border border-white/20"
                        >
                            <IconComponent className={`w-8 h-8 ${story.iconColor}`} />
                            <h2 className="text-4xl font-black text-white">
                                {story.title}
                            </h2>
                        </motion.div>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-lg text-white/90 leading-relaxed max-w-xl"
                        >
                            {story.description}
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <motion.button
                                whileHover={{ scale: 1.05, x: story.textPosition === 'left' ? 5 : -5 }}
                                whileTap={{ scale: 0.95 }}
                                className="
                  group inline-flex items-center gap-3 
                  px-8 py-4 
                  bg-white/20 hover:bg-white/30 
                  backdrop-blur-sm rounded-full 
                  text-white font-bold text-lg
                  transition-all duration-300 
                  border-2 border-white/30 hover:border-white/50
                  shadow-xl hover:shadow-2xl
                "
                            >
                                <span>اعرف المزيد</span>
                                <span className={`
                  text-2xl group-hover:${story.textPosition === 'left' ? '-translate-x-1' : 'translate-x-1'} 
                  transition-transform
                `}>
                                    {story.textPosition === 'left' ? '←' : '→'}
                                </span>
                            </motion.button>
                        </motion.div>
                    </motion.div>

                    {/* Visual Element - Icon Display */}
                    <motion.div
                        className="flex-1 flex items-center justify-center"
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                    >
                        <motion.div
                            animate={{
                                y: [0, -20, 0],
                                rotate: [0, 5, -5, 0]
                            }}
                            transition={{
                                duration: 6,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            className="relative"
                        >
                            {/* Glow Effect */}
                            <div className="absolute inset-0 bg-white/20 blur-3xl rounded-full scale-150" />

                            {/* Main Icon */}
                            <div className="relative bg-white/10 backdrop-blur-xl rounded-full p-16 border-4 border-white/30">
                                <IconComponent className="w-32 h-32 text-white drop-shadow-2xl" strokeWidth={1.5} />
                            </div>

                            {/* Floating Particles */}
                            {[...Array(6)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    className="absolute w-3 h-3 bg-white/40 rounded-full"
                                    style={{
                                        top: `${Math.random() * 100}%`,
                                        left: `${Math.random() * 100}%`,
                                    }}
                                    animate={{
                                        y: [0, -30, 0],
                                        opacity: [0.4, 1, 0.4],
                                        scale: [1, 1.5, 1]
                                    }}
                                    transition={{
                                        duration: 3 + i,
                                        repeat: Infinity,
                                        delay: i * 0.5
                                    }}
                                />
                            ))}
                        </motion.div>
                    </motion.div>
                </div>

                {/* Card Number Indicator */}
                <div className="absolute bottom-8 right-8 bg-white/10 backdrop-blur-sm rounded-full px-5 py-2 border border-white/20">
                    <span className="text-white/60 text-sm font-bold">
                        {String(index + 1).padStart(2, '0')} / {String(totalCards).padStart(2, '0')}
                    </span>
                </div>
            </motion.div>
        </div>
    )
}
