'use client'

import { Zap } from 'lucide-react'

export default function Hero() {
  return (
    <section className="relative w-full min-h-[60vh] md:min-h-[70vh] bg-gradient-to-br from-slate-950 via-purple-900 to-slate-950 overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      {/* Grid Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] [background-size:54px_54px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4 py-16 md:py-24">
        {/* Icon */}
        <div className="mb-6 md:mb-8 animate-bounce">
          <Zap className="w-16 h-16 md:w-20 md:h-20 text-yellow-400 drop-shadow-[0_0_30px_rgba(250,204,21,0.6)]" />
        </div>

        {/* Main Heading */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] mb-4 md:mb-6">
          <span className="text-white">الطاقة</span>
          <br />
          <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent drop-shadow-[0_2px_10px_rgba(163,22,77,0.5)]">
            تبدأ هنا
          </span>
        </h1>

        {/* Subheading */}
        <p className="text-lg md:text-xl lg:text-2xl font-light text-gray-200 max-w-2xl mb-8 md:mb-12 drop-shadow-lg">
          طعم غني، طاقة نقية، تغذية ذكية
        </p>

        {/* CTA Button */}
        <button className="px-8 md:px-12 py-3 md:py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-full font-bold text-lg md:text-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 active:scale-95">
          اكتشف المنتجات
        </button>

        {/* Stats */}
        <div className="mt-12 md:mt-16 grid grid-cols-3 gap-6 md:gap-12 w-full max-w-2xl">
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-purple-400 mb-2">100%</div>
            <p className="text-sm md:text-base text-gray-300">طبيعي</p>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-pink-400 mb-2">50+</div>
            <p className="text-sm md:text-base text-gray-300">نكهة</p>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-purple-400 mb-2">⚡</div>
            <p className="text-sm md:text-base text-gray-300">طاقة</p>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
        <div className="flex flex-col items-center gap-2 animate-bounce">
          <span className="text-sm text-gray-400">اسحب للأسفل</span>
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>
    </section>
  )
}
