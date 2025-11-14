'use client'

import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay } from 'swiper/modules'
import { Zap, Heart, Leaf, Award } from 'lucide-react'

import 'swiper/css'
import 'swiper/css/autoplay'

const features = [
  {
    icon: Zap,
    title: '⚡ طاقة نقية',
    description: 'مكونات طبيعية 100%',
    color: 'from-yellow-400 to-orange-500',
  },
  {
    icon: Heart,
    title: '❤️ صحي ولذيذ',
    description: 'بدون إضافات ضارة',
    color: 'from-red-400 to-pink-500',
  },
  {
    icon: Leaf,
    title: '🌿 طبيعي تماماً',
    description: 'من أفضل المصادر',
    color: 'from-green-400 to-emerald-500',
  },
  {
    icon: Award,
    title: '🏆 جودة عالية',
    description: 'معايير دولية',
    color: 'from-purple-400 to-blue-500',
  },
]

export default function MarqueeSwiper() {
  return (
    <section className="py-8 md:py-12 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 overflow-hidden">
      <div className="container mx-auto px-4">
        <Swiper
          modules={[Autoplay]}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
          }}
          spaceBetween={20}
          slidesPerView="auto"
          loop
          dir="rtl"
          className="!pb-4"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <SwiperSlide key={index} className="!w-auto">
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow min-w-[280px] md:min-w-[320px]">
                  <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} mb-4 shadow-lg`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {feature.description}
                  </p>
                </div>
              </SwiperSlide>
            )
          })}
        </Swiper>
      </div>
    </section>
  )
}
