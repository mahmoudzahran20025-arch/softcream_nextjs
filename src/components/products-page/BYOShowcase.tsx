'use client'

import { motion } from 'framer-motion'
import { Cookie, IceCream, Sparkles, ArrowRight, Star, Crown, Palette } from 'lucide-react'
import Link from 'next/link'
import { byoShowcase } from './data/productsContent'

const iconMap: Record<string, any> = {
    Cookie,
    IceCream,
    Sparkles,
    Crown,
    Palette
}

export default function BYOShowcase() {
    return (
        <section className="relative py-20 md:py-32 px-4 overflow-hidden">
            {/* Visionary Aurora Background - Softer & Warmer */}
            <div className="absolute inset-0 bg-warm-50 dark:bg-slate-950 transition-colors duration-500" />
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-1/2 left-1/2 w-[600px] md:w-[1000px] h-[600px] md:h-[1000px] bg-gradient-to-r from-primary-100/30 via-secondary-100/30 to-primary-100/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 opacity-60" />
            </div>

            <div className="relative container mx-auto max-w-7xl">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

                    {/* Left Side - Narrative Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="space-y-8 md:space-y-10 text-center lg:text-right"
                    >
                        {/* Premium Badge */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-md rounded-full px-5 py-2.5 border border-primary-100 shadow-sm mx-auto lg:mx-0"
                        >
                            <Crown className="w-4 h-4 text-primary-500" fill="currentColor" />
                            <span className="text-primary-600 font-bold text-sm tracking-wide">
                                تجربة ملكية
                            </span>
                        </motion.div>

                        {/* Title & Description */}
                        <div className="space-y-6">
                            <motion.h2
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="text-4xl md:text-6xl lg:text-7xl font-black text-slate-900 leading-[1.1]"
                            >
                                {byoShowcase.title}
                            </motion.h2>
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="text-lg md:text-2xl text-slate-600 font-medium leading-relaxed max-w-xl mx-auto lg:mx-0"
                            >
                                {byoShowcase.description}
                            </motion.p>
                        </div>

                        {/* Interactive Steps List - Vertical on Desktop, Stacked on Mobile */}
                        <div className="space-y-4 text-right">
                            {byoShowcase.features.map((feature, index) => {
                                const IconComponent = iconMap[feature.icon] || Cookie
                                return (
                                    <motion.div
                                        key={feature.title}
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.5 + index * 0.1 }}
                                        className="group flex items-center gap-5 p-4 rounded-2xl bg-white/40 hover:bg-white/80 border border-transparent hover:border-primary-100 transition-all duration-300"
                                    >
                                        <div className="
                                            shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center
                                            bg-white shadow-sm border border-slate-100
                                            group-hover:scale-110 group-hover:border-primary-200 group-hover:shadow-primary-100/50
                                            transition-all duration-300
                                        ">
                                            <IconComponent className="w-6 h-6 text-slate-400 group-hover:text-primary-500 transition-colors" />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-bold text-slate-900 group-hover:text-primary-600 transition-colors">
                                                {feature.title}
                                            </h4>
                                            <p className="text-sm md:text-base text-slate-500">
                                                {feature.description}
                                            </p>
                                        </div>
                                    </motion.div>
                                )
                            })}
                        </div>

                        {/* CTA Button */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.9 }}
                            className="pt-4 flex justify-center lg:justify-start"
                        >
                            <Link href={byoShowcase.ctaLink} className="w-full sm:w-auto">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="
                                        w-full sm:w-auto
                                        group relative inline-flex items-center justify-center gap-4 
                                        px-10 py-6 
                                        bg-slate-900 text-white
                                        rounded-full 
                                        font-bold text-xl
                                        shadow-xl shadow-slate-900/20
                                        hover:shadow-2xl hover:shadow-primary-500/30
                                        transition-all duration-300
                                        overflow-hidden
                                    "
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-secondary-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    <span className="relative z-10">{byoShowcase.ctaText}</span>
                                    <ArrowRight className="relative z-10 w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                                </motion.button>
                            </Link>
                        </motion.div>
                    </motion.div>

                    {/* Right Side - Symmetrical Visual Showcase (The "Altar") */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="relative h-[500px] md:h-[600px] flex items-center justify-center mt-12 lg:mt-0"
                    >
                        {/* Central Composition */}
                        <div className="relative w-full max-w-md aspect-square flex items-center justify-center">

                            {/* Rotating Rings (Symmetry) */}
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0 border border-dashed border-primary-200/50 rounded-full"
                            />
                            <motion.div
                                animate={{ rotate: -360 }}
                                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-4 md:inset-8 border border-dashed border-secondary-200/50 rounded-full"
                            />

                            {/* Center Glass Pedestal */}
                            <div className="
                                relative z-10
                                w-48 h-48 md:w-64 md:h-64
                                bg-white/40 backdrop-blur-2xl 
                                border border-white/60
                                rounded-full
                                shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)]
                                flex flex-col items-center justify-center
                                text-center p-6
                            ">
                                <motion.div
                                    animate={{
                                        y: [0, -10, 0],
                                    }}
                                    transition={{
                                        duration: 4,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                    className="relative mb-4"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-tr from-primary-500 to-secondary-500 blur-2xl opacity-40 rounded-full" />
                                    <Palette className="relative w-20 h-20 md:w-24 md:h-24 text-slate-900 drop-shadow-xl" strokeWidth={1} />
                                </motion.div>

                                <div className="space-y-1">
                                    <h3 className="text-2xl md:text-3xl font-black text-slate-900">
                                        فن المذاق
                                    </h3>
                                    <p className="text-sm text-slate-500 font-medium">
                                        أنت الفنان
                                    </p>
                                </div>
                            </div>

                            {/* Orbiting Elements (Symmetrical) */}
                            {[0, 1, 2].map((i) => (
                                <motion.div
                                    key={i}
                                    className="absolute w-16 h-16 md:w-20 md:h-20 bg-white shadow-lg rounded-2xl flex items-center justify-center border border-white/50 backdrop-blur-sm z-20"
                                    style={{
                                        top: '50%',
                                        left: '50%',
                                        marginLeft: '-2.5rem', // Half of width
                                        marginTop: '-2.5rem', // Half of height
                                    }}
                                    animate={{
                                        rotate: [0, 360],
                                        translateX: [0, 140, 0], // Orbit radius
                                        translateY: [0, 0, 0],
                                    }}
                                    transition={{
                                        rotate: { duration: 10, repeat: Infinity, ease: "linear", delay: i * -3.33 },
                                        translateX: { duration: 10, repeat: Infinity, ease: "linear", delay: i * -3.33, times: [0, 0.5, 1] } // Simplified orbit logic for visual effect
                                    }}
                                >
                                    {/* This is a simplified orbit. For a true circular orbit, we'd use more complex transforms. 
                                        Let's stick to a static symmetrical layout for stability if orbit is tricky without custom CSS */}
                                </motion.div>
                            ))}

                            {/* Static Symmetrical Satellites instead of complex orbit for reliability */}
                            <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 3, repeat: Infinity, delay: 0 }}
                                className="absolute -top-4 md:-top-10 left-1/2 -translate-x-1/2 bg-white p-4 rounded-2xl shadow-xl border border-white/50 backdrop-blur-sm z-20"
                            >
                                <div className="text-center">
                                    <div className="text-xl md:text-2xl font-black text-primary-500">∞</div>
                                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Possibilities</div>
                                </div>
                            </motion.div>

                            <motion.div
                                animate={{ y: [0, 10, 0] }}
                                transition={{ duration: 3.5, repeat: Infinity, delay: 0.5 }}
                                className="absolute -bottom-4 md:-bottom-10 left-1/2 -translate-x-1/2 bg-white p-4 rounded-2xl shadow-xl border border-white/50 backdrop-blur-sm z-20"
                            >
                                <div className="text-center">
                                    <div className="text-xl md:text-2xl font-black text-secondary-500">20+</div>
                                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Flavors</div>
                                </div>
                            </motion.div>

                            <motion.div
                                animate={{ x: [0, 10, 0] }}
                                transition={{ duration: 4, repeat: Infinity, delay: 1 }}
                                className="absolute top-1/2 -right-4 md:-right-12 -translate-y-1/2 bg-white p-3 rounded-full shadow-lg border border-white/50 backdrop-blur-sm z-20"
                            >
                                <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                            </motion.div>

                            <motion.div
                                animate={{ x: [0, -10, 0] }}
                                transition={{ duration: 4.5, repeat: Infinity, delay: 1.5 }}
                                className="absolute top-1/2 -left-4 md:-left-12 -translate-y-1/2 bg-white p-3 rounded-full shadow-lg border border-white/50 backdrop-blur-sm z-20"
                            >
                                <Sparkles className="w-6 h-6 text-primary-400" />
                            </motion.div>

                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
