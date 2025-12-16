import HeroIntro from './HeroIntro'
import InteractiveSections from './InteractiveSections'

export default function StorytellingHero() {
  return (
    <div className="bg-white dark:bg-slate-950">
      <HeroIntro />
      <InteractiveSections />
    </div>
  )
}
