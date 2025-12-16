'use client'

import dynamic from 'next/dynamic'

const StoryCarousel = dynamic(() => import('./StoryCarousel'), {
  ssr: false,
  loading: () => (
    <div className="h-[500px] w-full bg-slate-50 animate-pulse rounded-[3rem]" />
  ),
})

const HeroFooter = dynamic(() => import('./HeroFooter'), {
  ssr: false,
  loading: () => null,
})

export default function InteractiveSections() {
  return (
    <>
      <StoryCarousel />
      <HeroFooter />
    </>
  )
}
