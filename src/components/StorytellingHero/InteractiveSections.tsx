'use client'

import dynamic from 'next/dynamic'

const StoryCardStack = dynamic(() => import('./StoryCardStack'), {
  ssr: false,
  loading: () => (
    <section className="bg-slate-950 py-24 text-white">
      <div className="mx-auto h-40 w-11/12 max-w-6xl animate-pulse rounded-3xl bg-gradient-to-br from-slate-900 to-slate-950" />
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
