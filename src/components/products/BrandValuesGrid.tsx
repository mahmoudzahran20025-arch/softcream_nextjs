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
        <section className="py-20 px-4 bg-white dark:bg-slate-950">
            <div className="container mx-auto max-w-6xl">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-5xl font-black text-slate-900 dark:text-white mb-4">
                        قيم علامتنا التجارية
                    </h2>
                    <p className="text-xl text-slate-600 dark:text-slate-400">
                        ما يميزنا عن الآخرين
                    </p>
                </motion.div>

                {/* Values Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {brandValues.map((value, index) => {
                        const IconComponent = iconMap[value.icon] || Award

                        return (
                            <motion.div
                                key={value.id}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ y: -5, scale: 1.02 }}
                                className="group relative"
                            >
                                {/* Card */}
                                <div className={`
                  relative overflow-hidden rounded-3xl p-8
                  bg-gradient-to-br ${value.gradientClass}
                  shadow-2xl hover:shadow-3xl
                  transition-all duration-300
                  border border-white/20
                `}>
                                    {/* Background Pattern */}
                                    <div className="absolute inset-0 opacity-10">
                                        <div className="absolute inset-0 bg-white/20" />
                                        <div
                                            className="absolute inset-0"
                                            style={{
                                                backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)',
                                                backgroundSize: '20px 20px'
                                            }}
                                        />
                                    </div>

                                    {/* Content */}
                                    <div className="relative z-10 space-y-4">
                                        {/* Icon */}
                                        <motion.div
                                            whileHover={{ rotate: 360, scale: 1.1 }}
                                            transition={{ duration: 0.6 }}
                                            className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30"
                                        >
                                            <IconComponent className="w-8 h-8 text-white" strokeWidth={2} />
                                        </motion.div>

                                        {/* Title */}
                                        <h3 className="text-2xl font-black text-white">
                                            {value.title}
                                        </h3>

                                        {/* Description */}
                                        <p className="text-white/80 leading-relaxed">
                                            {value.description}
                                        </p>

                                        {/* Metric Badge */}
                                        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 border border-white/30">
                                            <span className="text-white font-bold text-lg">
                                                {value.metric}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Hover Glow Effect */}
                                    <motion.div
                                        className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-300 rounded-3xl"
                                        initial={false}
                                    />
                                </div>

                                {/* Floating Shadow */}
                                <div className={`
                  absolute inset-0 bg-gradient-to-br ${value.gradientClass} 
                  rounded-3xl blur-2xl opacity-50 -z-10
                  group-hover:opacity-70 transition-opacity duration-300
                `} />
                            </motion.div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
