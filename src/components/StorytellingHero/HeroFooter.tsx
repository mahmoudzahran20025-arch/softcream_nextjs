'use client'

import { motion } from '@/lib/motion-shared'
import { Zap } from 'lucide-react'

export default function HeroFooter() {
  return (
    <footer className="group relative overflow-hidden bg-slate-950 pt-12 text-white sm:pt-16 md:pt-20">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-black" />
        <LightningColumns />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8b5cf615_1px,transparent_1px),linear-gradient(to_bottom,#8b5cf615_1px,transparent_1px)] [background-size:50px_50px] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_50%,#000_30%,transparent_100%)]" />
      </div>

      <motion.h2
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9 }}
        viewport={{ once: true }}
        className="relative z-10 translate-y-12 text-center text-[18vw] font-black uppercase text-transparent drop-shadow-[0_0_40px_rgba(163,22,77,0.6)] sm:text-[16vw] md:translate-y-16 md:text-[14vw]"
        style={{ backgroundImage: 'linear-gradient(to right,#e5e7eb,#a0aec0,#6b7280)', WebkitBackgroundClip: 'text' }}
      >
        Soft Energy
      </motion.h2>

      <section className="relative z-10 mx-auto grid place-content-center rounded-t-[50px] border-t border-white/10 bg-black/60 px-4 py-12 text-center backdrop-blur-md sm:rounded-t-[80px] sm:px-6 sm:py-14 md:h-56 md:rounded-t-full md:px-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}>
          <h3 className="text-xl font-bold text-white drop-shadow-xl sm:text-2xl md:text-3xl">
            جاهز لتجربتك؟
          </h3>
          <p className="mt-3 text-base font-light text-gray-200 drop-shadow-lg sm:text-lg md:mt-4 md:text-xl">
            اطلب الآن واستمتع بالطاقة الحقيقية.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary via-purple-600 to-orange-500 px-8 py-3 text-sm font-bold shadow-[0_0_30px_rgba(163,22,77,0.7)] transition-all duration-300 sm:text-base"
            aria-label="ابدأ الآن"
          >
            <Zap className="h-5 w-5 animate-pulse" />
            ابدأ الآن
          </motion.button>
        </motion.div>
      </section>

      <style jsx>{`
        @keyframes lightningFlash {
          0%, 12%, 100% { opacity: 0; transform: scaleY(0); }
          6% { opacity: 1; transform: scaleY(1); }
        }
        @keyframes lightningGlow {
          0%, 12%, 100% { opacity: 0; }
          6% { opacity: 0.8; }
        }
        .lightning-column {
          animation: lightningFlash 8s infinite;
        }
        .lightning-glow {
          animation: lightningGlow 8s infinite;
        }
      `}</style>
    </footer>
  )
}

function LightningColumns() {
  return (
    <div className="absolute inset-0">
      {[20, 45, 65].map((pos, idx) => (
        <span
          key={pos}
          className="lightning-column absolute top-0 w-px bg-gradient-to-b from-transparent via-white/70 to-transparent"
          style={{ left: `${pos}%`, animationDelay: `${idx * 2}s` }}
        />
      ))}
      {[20, 45, 65].map((pos, idx) => (
        <span
          key={`glow-${pos}`}
          className="lightning-glow absolute top-0 h-full w-32 -translate-x-1/2 rounded-full bg-gradient-to-b from-transparent via-primary/20 to-transparent blur-3xl"
          style={{ left: `${pos}%`, animationDelay: `${idx * 2}s` }}
        />
      ))}
    </div>
  )
}
