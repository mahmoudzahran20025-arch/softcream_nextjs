'use client'

import { useRef } from 'react'
import { useScroll } from '@/lib/motion-shared'
import StoryCard from './StoryCard'
import { stories } from './data/stories'

export default function StoryCardStack() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  return (
    <section ref={containerRef} className="bg-slate-950 text-white">
      {stories.map((story, index) => {
        const targetScale = 1 - (stories.length - index) * 0.05

        return (
          <StoryCard
            key={`story_${index}`}
            index={index}
            story={story}
            progress={scrollYProgress}
            targetScale={targetScale}
          />
        )
      })}
    </section>
  )
}
