'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from '@/lib/motion-shared'
import type { MotionValue } from '@/lib/motion-shared'
import { useHydrated } from '@/hooks/useHydrated'
import IconComponent from './IconComponent'
import type { StoryData } from './data/stories'

interface StoryCardProps {
  index: number
  story: StoryData
  progress: MotionValue<number>
  targetScale: number
}

export default function StoryCard({ index, story, progress, targetScale }: StoryCardProps) {
  const isHydrated = useHydrated()
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'start start'],
  })

  const imageScale = useTransform(scrollYProgress, [0, 1], [1.5, 1])
  const scale = useTransform(progress, [index * 0.2, 1], [1, targetScale])

  // Only render motion animations after hydration to prevent CLS
  if (!isHydrated) {
    return (
      <div ref={containerRef} className="h-screen flex items-center justify-center sticky top-0 px-4 sm:px-6 md:px-8">
        <div className={`flex flex-col relative -top-[10%] sm:-top-[15%] md:-top-[25%] h-auto min-h-[520px] min-[560px]:min-h-[450px] min-[560px]:h-[450px] lg:h-[450px] w-full sm:w-[92%] md:w-[85%] lg:w-[75%] xl:w-[70%] rounded-xl sm:rounded-2xl lg:rounded-3xl p-4 sm:p-5 md:p-6 lg:p-10 origin-top ${story.gradientClass} ${story.glowColor} hover:scale-[1.02] transition-all duration-300`}>
          {/* Static content during SSR */}
        </div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="h-screen flex items-center justify-center sticky top-0 px-4 sm:px-6 md:px-8">
      <motion.div
        style={{
          scale,
          top: `calc(-5vh + ${index * 25}px)`,
        }}
        className={`flex flex-col relative -top-[10%] sm:-top-[15%] md:-top-[25%] h-auto min-h-[520px] min-[560px]:min-h-[450px] min-[560px]:h-[450px] lg:h-[450px] w-full sm:w-[92%] md:w-[85%] lg:w-[75%] xl:w-[70%] rounded-xl sm:rounded-2xl lg:rounded-3xl p-4 sm:p-5 md:p-6 lg:p-10 origin-top ${story.gradientClass} ${story.glowColor} hover:scale-[1.02] transition-all duration-300`}
      >
        <div className="flex items-center justify-center gap-2 sm:gap-2.5 md:gap-3 mb-4 sm:mb-4 md:mb-5">
          <div className="bg-white/10 backdrop-blur-sm rounded-full p-2 sm:p-2.5">
            <IconComponent name={story.icon} iconColor={story.iconColor} className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 drop-shadow-lg flex-shrink-0" />
          </div>
          <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl text-white text-center font-black leading-tight">
            {story.title}
          </h2>
        </div>

        <div className="flex flex-col min-[560px]:flex-row h-full gap-4 min-[560px]:gap-6 lg:gap-10">
          <div className="relative w-full min-[560px]:w-[58%] h-[70%] min-[560px]:h-full rounded-lg sm:rounded-xl overflow-hidden shadow-2xl order-1 min-[560px]:order-2">
            <motion.div className="w-full h-full" style={{ scale: imageScale }}>
              <img
                src={story.src}
                alt={story.alt}
                width={600}
                height={450}
                loading={index === 0 ? 'eager' : 'lazy'}
                className="w-full h-full object-cover"
              />
            </motion.div>
          </div>

          <div className="w-full min-[560px]:w-[42%] h-[30%] min-[560px]:h-full flex flex-col justify-center order-2 min-[560px]:order-1">
            <p className="text-xs sm:text-sm min-[560px]:text-base lg:text-lg text-white/90 leading-snug sm:leading-relaxed mb-2 sm:mb-3 min-[560px]:mb-4">
              {story.description}
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 md:py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full text-white font-bold text-xs sm:text-sm md:text-base group w-fit transition-all duration-300 border border-white/30"
              aria-label="اعرف المزيد"
            >
              <span>اعرف المزيد</span>
              <span className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 group-hover:-translate-x-1 transition-transform">←</span>
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
