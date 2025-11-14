'use client'

import { ShieldCheck, Truck, Clock, Users } from 'lucide-react'

const trustItems = [
  {
    icon: ShieldCheck,
    title: 'دفع آمن 100%',
    description: 'تشفير عالي الجودة',
  },
  {
    icon: Truck,
    title: 'توصيل سريع',
    description: 'في أقل من ساعة',
  },
  {
    icon: Clock,
    title: 'خدمة 24/7',
    description: 'نحن هنا لك دائماً',
  },
  {
    icon: Users,
    title: '+10K عميل سعيد',
    description: 'تقييم 4.9/5 نجوم',
  },
]

export default function TrustBanner() {
  return (
    <section className="py-12 md:py-16 bg-white dark:bg-slate-950 border-y border-slate-200 dark:border-slate-800">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {trustItems.map((item, index) => {
            const Icon = item.icon
            return (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-full flex items-center justify-center shadow-lg">
                    <Icon className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-1 text-sm md:text-base">
                  {item.title}
                </h3>
                <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400">
                  {item.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
