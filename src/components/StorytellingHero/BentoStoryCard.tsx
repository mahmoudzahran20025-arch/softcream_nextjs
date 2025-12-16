'use client'

import { motion } from 'framer-motion'
import IconComponent from './IconComponent'
import type { StoryData } from './data/stories'

interface BentoStoryCardProps {
    story: StoryData
    index: number
    className?: string
}

export default function BentoStoryCard({ story, index, className = '' }: BentoStoryCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ y: -5 }}
            className={`group relative overflow-hidden rounded-3xl p-6 md:p-8 ${className} ${story.gradientClass}`}
        >
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors duration-500 z-10" />
                <img
                    src={story.src}
                    alt={story.alt}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
                    loading="lazy"
                />
                {/* Gradient Overlay for Text Readability */}
                <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/50 to-transparent z-10" />
            </div>

            {/* Content */}
            <div className="relative z-20 h-full flex flex-col justify-end">
                <div className="mb-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform -translate-y-4 group-hover:translate-y-0">
                    <div className={`w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mb-4 border border-white/20 ${story.glowColor}`}>
                        <IconComponent name={story.icon} iconColor={story.iconColor} className="w-6 h-6" />
                    </div>
                </div>

                <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 leading-tight">
                    {story.title}
                </h3>

                <p className="text-sm md:text-base text-gray-200 line-clamp-3 group-hover:line-clamp-none transition-all duration-300">
                    {story.description}
                </p>
            </div>
        </motion.div>
    )
}
