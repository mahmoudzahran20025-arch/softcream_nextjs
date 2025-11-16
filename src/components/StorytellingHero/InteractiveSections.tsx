'use client'

import dynamic from 'next/dynamic'

const StoryCardStack = dynamic(() => import('./StoryCardStack'), {
  ssr: false,
  loading: () => (
    <section className="bg-slate-950 py-24 text-white min-h-[600px]">
      <div className="mx-auto space-y-6 w-11/12 max-w-6xl">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-64 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-950 animate-pulse" />
        ))}
      </div>
    </section>
  ),
})

const HeroFooter = dynamic(() => import('./HeroFooter'), {
  ssr: false,
  loading: () => null,
})

export default function InteractiveSections() {
  return (
    <>
      <StoryCardStack />
      <HeroFooter />
    </>
  )
}
