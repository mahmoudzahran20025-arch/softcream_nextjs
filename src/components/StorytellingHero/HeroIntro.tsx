'use client'

import { motion } from 'framer-motion'
import { ArrowDown, Sparkles, Heart } from 'lucide-react'

export default function HeroIntro() {
  const scrollToStories = () => {
    const storiesSection = document.getElementById('stories-anchor')
    if (storiesSection) {
      storiesSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section className="relative h-[85vh] w-full overflow-hidden bg-white flex flex-col items-center justify-center">

      {/* 1. Soft Pastel Mesh Gradient Background */}
      <div className="absolute inset-0 w-full h-full opacity-60">
        <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle_farthest-corner_at_50%_50%,_#fff1f2_0%,_transparent_50%),_radial-gradient(circle_farthest-corner_at_0%_0%,_#fdf2f8_0%,_transparent_50%),_radial-gradient(circle_farthest-corner_at_100%_0%,_#f0f9ff_0%,_transparent_50%),_radial-gradient(circle_farthest-corner_at_100%_100%,_#fff7ed_0%,_transparent_50%),_radial-gradient(circle_farthest-corner_at_0%_100%,_#fdf4ff_0%,_transparent_50%)] animate-gradient-slow" />
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.02] mix-blend-multiply" />

        {/* Floating Soft Orbs */}
        <motion.div
          animate={{ y: [0, -20, 0], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-pink-200/40 rounded-full blur-[100px]"
        />
        <motion.div
          animate={{ y: [0, 30, 0], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] bg-blue-100/40 rounded-full blur-[120px]"
        />
      </div>

      {/* 2. Content Layer */}
      <div className="relative z-10 container px-4 flex flex-col items-center text-center">

        {/* Friendly Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-8 inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-pink-100 bg-white/40 backdrop-blur-md shadow-sm hover:shadow-md transition-all cursor-default"
        >
          <Heart className="w-4 h-4 text-pink-500 fill-pink-500 animate-pulse" />
          <span className="text-sm font-bold tracking-wide text-slate-600">
            Soft Cream Original
          </span>
        </motion.div>

        {/* Main Title - Friendly & Big */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2, type: "spring" }}
          className="relative mb-6"
        >
          <h1 className="font-black text-6xl md:text-8xl lg:text-9xl tracking-tighter text-slate-900 leading-tight">
            <span className="block text-transparent bg-clip-text bg-gradient-to-br from-slate-800 to-slate-600 drop-shadow-sm">
              حلاوة
            </span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 pb-2">
              اللحظـــة
            </span>
          </h1>
          {/* Decorative Sparkles */}
          <Sparkles className="absolute -top-8 -right-8 w-12 h-12 text-amber-400 opacity-80 animate-spin-slow" />
          <Sparkles className="absolute bottom-4 -left-12 w-8 h-8 text-pink-400 opacity-60 animate-bounce" />
        </motion.div>

        {/* Comforting Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="max-w-2xl text-lg md:text-2xl text-slate-600 font-medium leading-relaxed mb-12"
        >
          طعم يأخذك لعالم من السعادة النقية.
          <br className="hidden md:block" />
          مكونات طبيعية، وجودة تليق بك.
        </motion.p>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, 10, 0] }}
          transition={{ duration: 2, delay: 1, repeat: Infinity }}
          className="cursor-pointer"
          onClick={scrollToStories}
        >
          <div className="flex flex-col items-center gap-2 text-slate-400">
            <span className="text-sm font-medium">اكتشف القصة</span>
            <ArrowDown className="w-5 h-5 animate-bounce" />
          </div>
        </motion.div>
      </div>

      <style jsx global>{`
        @keyframes gradient-slow {
          0% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(-2%, 2%) rotate(1deg); }
          100% { transform: translate(0, 0) rotate(0deg); }
        }
        .animate-gradient-slow {
          animation: gradient-slow 25s ease-in-out infinite;
        }
        .animate-spin-slow {
            animation: spin 8s linear infinite;
        }
        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
      `}</style>
    </section>
  )
}
