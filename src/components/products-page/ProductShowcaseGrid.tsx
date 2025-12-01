'use client'

import { motion } from 'framer-motion'
import ProductStoryCard from './ProductStoryCard'
import { storyCards } from './data/productsContent'

export default function ProductShowcaseGrid() {
    return (
        <section className="py-24 bg-warm-50 relative overflow-hidden">
            {/* Aurora Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary-50/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary-50/40 rounded-full blur-3xl translate-y-1/4 -translate-x-1/4" />
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="mb-16 text-center max-w-3xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="inline-block mb-4 px-4 py-1.5 rounded-full bg-white/50 backdrop-blur-sm border border-primary-100 text-primary-600 font-medium text-sm"
                    >
                        ✨ اكتشف الجودة
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-6xl font-black text-slate-900 mb-6 leading-tight"
                    >
                        لماذا تختار <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-primary-600">Soft Cream</span>؟
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-slate-600 text-xl leading-relaxed"
                    >
                        مزيج مثالي من الطعم الرائع والقيمة الغذائية العالية.
                        نقدم لك تجربة لا تُنسى مع كل قضمة.
                    </motion.p>
                </div>

                {/* Desktop Grid - Asymmetric Bento Style */}
                <div className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-8 auto-rows-[420px]">
                    {storyCards.map((story, index) => (
                        <ProductStoryCard
                            key={story.id}
                            story={story}
                            className={
                                index === 0 ? "md:col-span-2 md:row-span-1" :
                                    index === 3 ? "md:col-span-2 md:row-span-1" :
                                        "md:col-span-1 md:row-span-1"
                            }
                        />
                    ))}
                </div>

                {/* Mobile Carousel - Snap Scroll */}
                <div className="md:hidden flex overflow-x-auto snap-x snap-mandatory gap-4 pb-8 -mx-4 px-4 scrollbar-hide">
                    {storyCards.map((story) => (
                        <div key={story.id} className="snap-center shrink-0 w-[85vw]">
                            <ProductStoryCard
                                story={story}
                                className="h-[450px]"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
