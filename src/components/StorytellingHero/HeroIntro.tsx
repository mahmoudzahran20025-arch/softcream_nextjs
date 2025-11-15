'use client'

import { Zap, ChevronsDown } from 'lucide-react'
import { useHydrated } from '@/hooks/useHydrated'

const HERO_VIDEO = {
  src: 'https://res.cloudinary.com/djefdgy41/video/upload/v1762897127/mixkit-lightning-strike-and-thunders-47948-hd-ready_1_ajfuc1.mp4',
  poster:
    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080"%3E%3Crect fill="%230f172a" width="1920" height="1080"/%3E%3C/svg%3E',
}

export default function HeroIntro() {
  const isHydrated = useHydrated()

  return (
    <section className="relative isolate flex h-[70vh] w-full flex-col items-center justify-center overflow-hidden bg-slate-950 text-white sm:h-[75vh] md:h-[80vh] lg:h-[70vh]">
      <div className="absolute inset-0 opacity-40">
        <video
          className="h-full w-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          poster={HERO_VIDEO.poster}
        >
          <source src={HERO_VIDEO.src} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-slate-950/70 to-slate-950/90" />
      </div>

      <div className="absolute inset-0 opacity-10">
        <div className="grid-overlay" />
      </div>

      {/* Delay gradient animation until hydration to reduce CLS */}
      <div className={`absolute inset-0 opacity-30 ${isHydrated ? 'animate-gradient-shift' : ''}`} />

      <div className="relative z-10 px-4 text-center sm:px-6 md:px-8">
        <div className="mb-4 sm:mb-6">
          <Zap className="mx-auto h-16 w-16 text-primary drop-shadow-[0_0_30px_rgba(163,22,77,1)] sm:h-20 sm:w-20" aria-hidden />
        </div>
        <h1 className="text-3xl font-black leading-tight tracking-tight sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl">
          الطاقة لها طعم
          <br />
          <span className="bg-gradient-to-r from-primary via-purple-500 to-orange-400 bg-clip-text text-transparent drop-shadow-[0_2px_10px_rgba(163,22,77,0.5)]">
            SOFT & ENERGY
          </span>
        </h1>
        <p className="mx-auto mt-4 max-w-3xl text-sm font-light text-gray-200 drop-shadow-lg sm:text-base md:mt-6 md:text-lg lg:text-xl">
          اكتشف كيف نحول المكونات النقية إلى لحظات تغير مزاجك وتطلق طاقتك
        </p>
        <div className="mt-6 flex flex-col items-center justify-center gap-2 text-white/90">
          <span className="text-sm font-medium sm:text-base">اكتشف رحلة الطاقة</span>
          <ChevronsDown className={`h-6 w-6 text-primary drop-shadow-[0_0_8px_rgba(163,22,77,0.7)] ${isHydrated ? 'animate-bounce' : ''}`} aria-hidden />
        </div>
      </div>

      <style jsx>{`
        .grid-overlay {
          width: 100%;
          height: 100%;
          background-image: linear-gradient(to right, #4f4f4f2e 1px, transparent 1px),
            linear-gradient(to bottom, #4f4f4f2e 1px, transparent 1px);
          background-size: 54px 54px;
          mask-image: radial-gradient(ellipse 60% 50% at 50% 0%, #000 70%, transparent 100%);
        }
        @keyframes gradient-shift {
          0% {
            background: radial-gradient(circle at 20% 50%, rgba(163, 22, 77, 0.35) 0%, transparent 50%);
          }
          33% {
            background: radial-gradient(circle at 80% 50%, rgba(139, 92, 246, 0.35) 0%, transparent 50%);
          }
          66% {
            background: radial-gradient(circle at 50% 80%, rgba(16, 185, 129, 0.35) 0%, transparent 50%);
          }
          100% {
            background: radial-gradient(circle at 20% 50%, rgba(163, 22, 77, 0.35) 0%, transparent 50%);
          }
        }
        .animate-gradient-shift {
          animation: gradient-shift 12s linear infinite;
        }
      `}</style>
    </section>
  )
}
