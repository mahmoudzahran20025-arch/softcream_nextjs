'use client'

import { motion } from 'framer-motion'
import { Coffee, Ruler, IceCream, Droplet, ArrowRight, Star } from 'lucide-react'
import Link from 'next/link'
import { byoShowcase } from './data/productsContent'

const iconMap: Record<string, any> = {
    Coffee,
    Ruler,
    IceCream,
    Droplet
}

export default function BYOShowcase() {
    return (
        <section className="relative py-32 px-4 overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 dark:from-pink-950/20 dark:via-purple-950/20 dark:to-blue-950/20" />

            {/* Animated Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: 'radial-gradient(circle, rgba(236, 72, 153, 0.3) 1px, transparent 1px)',
                        backgroundSize: '40px 40px'
                    }}
                />
            </div>

            <div className="relative container mx-auto max-w-6xl">
                <div className="grid lg:grid-cols-2 gap-12 items-center">

                    {/* Left Side - Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="space-y-8"
                    >
                        {/* Badge */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="inline-flex items-center gap-2 bg-pink-100 dark:bg-pink-900/30 rounded-full px-4 py-2 border border-pink-300 dark:border-pink-700"
                        >
                            <Star className="w-4 h-4 text-pink-600 dark:text-pink-400" fill="currentColor" />
                            <span className="text-pink-600 dark:text-pink-400 font-semibold text-sm">
                                نظام فريد من نوعه
                            </span>
                        </motion.div>

                        {/* Title */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <h2 className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white mb-4">
                                {byoShowcase.title}
                            </h2>
                            <p className="text-xl text-pink-600 dark:text-pink-400 font-bold">
                                {byoShowcase.subtitle}
                            </p>
                        </motion.div>

                        {/* Description */}
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed"
                        >
                            {byoShowcase.description}
                        </motion.p>

                        {/* Features List */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="grid grid-cols-2 gap-4"
                        >
                            {byoShowcase.features.map((feature, index) => {
                                const IconComponent = iconMap[feature.icon] || Coffee

                                return (
                                    <motion.div
                                        key={feature.title}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.6 + index * 0.1 }}
                                        whileHover={{ scale: 1.05 }}
                                        className="
                      flex items-start gap-3 p-4 
                      bg-white dark:bg-slate-800 
                      rounded-2xl border border-slate-200 dark:border-slate-700
                      shadow-sm hover:shadow-md transition-all
                    "
                                    >
                                        <div className="bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl p-2">
                                            <IconComponent className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                                                {feature.title}
                                            </h4>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                {feature.description}
                                            </p>
                                        </div>
                                    </motion.div>
                                )
                            })}
                        </motion.div>

                        {/* Stats */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8 }}
                            className="flex gap-8"
                        >
                            <div>
                                <div className="text-3xl font-black bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                                    {byoShowcase.stats.flavors}
                                </div>
                                <div className="text-sm text-slate-600 dark:text-slate-400">نكهة</div>
                            </div>
                            <div>
                                <div className="text-3xl font-black bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                                    {byoShowcase.stats.combinations}
                                </div>
                                <div className="text-sm text-slate-600 dark:text-slate-400">تشكيلة</div>
                            </div>
                            <div>
                                <div className="text-3xl font-black bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                                    {byoShowcase.stats.avgRating}
                                </div>
                                <div className="text-sm text-slate-600 dark:text-slate-400">تقييم</div>
                            </div>
                        </motion.div>

                        {/* CTA Button with Brand Color */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.9 }}
                        >
                            <Link href={byoShowcase.ctaLink}>
                                <motion.button
                                    whileHover={{ scale: 1.05, x: 5 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="
                    group inline-flex items-center gap-3 
                    px-8 py-5 
                    bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500
                    hover:from-pink-600 hover:via-purple-600 hover:to-pink-600
                    rounded-full 
                    text-white font-bold text-lg
                    shadow-2xl shadow-pink-500/50
                    transition-all duration-300
                  "
                                >
                                    <span>{byoShowcase.ctaText}</span>
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </motion.button>
                            </Link>
                        </motion.div>
                    </motion.div>

                    {/* Right Side - Visual Showcase */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="relative"
                    >
                        {/* Main Card */}
                        <div className="relative">
                            {/* Floating Elements */}
                            <motion.div
                                animate={{
                                    y: [0, -20, 0],
                                    rotate: [0, 5, 0]
                                }}
                                transition={{
                                    duration: 4,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                                className="
                  relative bg-white dark:bg-slate-800 
                  rounded-3xl p-10 
                  shadow-2xl 
                  border-4 border-pink-200 dark:border-pink-800
                "
                            >
                                {/* Steps Visual */}
                                <div className="space-y-6">
                                    {byoShowcase.features.map((feature, index) => {
                                        const IconComponent = iconMap[feature.icon] || Coffee

                                        return (
                                            <motion.div
                                                key={feature.title}
                                                initial={{ opacity: 0, x: 50 }}
                                                whileInView={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 1 + index * 0.15 }}
                                                className="flex items-center gap-4"
                                            >
                                                <div className="
                          flex items-center justify-center
                          w-12 h-12 
                          bg-gradient-to-br from-pink-500 to-purple-600
                          rounded-2xl shadow-lg
                        ">
                                                    <IconComponent className="w-6 h-6 text-white" />
                                                </div>
                                                <div className="flex-1 h-2 bg-gradient-to-r from-pink-200 to-purple-200 dark:from-pink-800 dark:to-purple-800 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        whileInView={{ width: `${(index + 1) * 25}%` }}
                                                        transition={{ delay: 1.2 + index * 0.15, duration: 0.8 }}
                                                        className="h-full bg-gradient-to-r from-pink-500 to-purple-600"
                                                    />
                                                </div>
                                            </motion.div>
                                        )
                                    })}
                                </div>

                                {/* Final Product Icon */}
                                <motion.div
                                    initial={{ scale: 0 }}
                                    whileInView={{ scale: 1 }}
                                    transition={{ delay: 2, type: "spring" }}
                                    className="mt-8 flex justify-center"
                                >
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-pink-500/30 blur-3xl rounded-full" />
                                        <IceCream className="relative w-24 h-24 text-pink-500" strokeWidth={1.5} />
                                    </div>
                                </motion.div>
                            </motion.div>

                            {/* Decorative Elements */}
                            <motion.div
                                animate={{
                                    scale: [1, 1.2, 1],
                                    opacity: [0.5, 0.8, 0.5]
                                }}
                                transition={{
                                    duration: 3,
                                    repeat: Infinity
                                }}
                                className="absolute -top-10 -right-10 w-40 h-40 bg-pink-500/20 rounded-full blur-3xl"
                            />
                            <motion.div
                                animate={{
                                    scale: [1, 1.2, 1],
                                    opacity: [0.5, 0.8, 0.5]
                                }}
                                transition={{
                                    duration: 3,
                                    repeat: Infinity,
                                    delay: 1.5
                                }}
                                className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl"
                            />
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
