'use client'

import { motion } from 'framer-motion'
import { Leaf, TrendingDown, Award } from 'lucide-react'
import { brandValues } from './data/productsContent'

const iconMap: Record<string, any> = {
    Leaf,
    TrendingDown,
    Award
}

export default function BrandValuesGrid() {
    return (
        <section className="py-16 bg-slate-50 dark:bg-slate-900/50 border-y border-slate-100 dark:border-slate-800">
            <div className="container mx-auto max-w-6xl px-4">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12">

                    {/* Header - Left Side */}
                    <div className="text-center md:text-right md:w-1/3 shrink-0">
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">
                            قيم علامتنا التجارية
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">
                            ما يميزنا عن الآخرين
                        </p>
                    </div>

                    {/* Values - Right Side (Carousel on Mobile) */}
                    <div className="
                        w-full md:w-2/3
                        flex gap-4 
                        overflow-x-auto snap-x snap-mandatory 
                        pb-4 md:pb-0 
                        scrollbar-hide
                    ">
                        {brandValues.map((value, index) => {
                            const IconComponent = iconMap[value.icon] || Award

                            return (
                                <motion.div
                                    key={value.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className="snap-center shrink-0 w-[280px] md:w-auto md:flex-1"
                                >
                                    <div className="
                                        h-full p-6 rounded-2xl
                                        bg-white dark:bg-slate-800
                                        border border-slate-100 dark:border-slate-700
                                        shadow-sm hover:shadow-md
                                        transition-all duration-300
                                        flex flex-col items-center text-center
                                    ">
                                        <div className={`
                                            w-12 h-12 rounded-xl mb-4 flex items-center justify-center
                                            bg-gradient-to-br ${value.gradientClass}
                                            text-white shadow-lg
                                        `}>
                                            <IconComponent className="w-6 h-6" strokeWidth={2} />
                                        </div>

                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                                            {value.title}
                                        </h3>

                                        <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-secondary-500 mb-2">
                                            {value.metric}
                                        </div>

                                        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                                            {value.description}
                                        </p>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </section>
    )
}
