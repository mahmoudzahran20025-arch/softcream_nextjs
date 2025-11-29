'use client'

import { motion } from 'framer-motion'
import { IceCream, Sparkles, ChevronDown } from 'lucide-react'
import { heroContent } from './data/productsContent'

export default function ProductsHero() {
    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900">
            {/* Animated Background Pattern */}
            <div className="absolute inset-0 opacity-20">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-blue-500/20" />
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
                        backgroundSize: '50px 50px'
                    }}
                />
            </div>

            {/* Floating Gradient Orbs */}
            <div className="absolute top-20 left-20 w-96 h-96 bg-pink-500/30 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse delay-1000" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-2000" />

            {/* Content */}
            <div className="relative z-10 container mx-auto px-4 py-20 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="space-y-8"
                >
                    {/* Icon Badge */}
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-xl rounded-full px-6 py-3 border border-white/20"
                    >
                        <IceCream className="w-6 h-6 text-pink-300" />
                        <span className="text-white/80 font-semibold">Soft Cream Products</span>
                    </motion.div>

                    {/* Main Title */}
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-6xl md:text-7xl lg:text-8xl font-black text-white"
                    >
                        {heroContent.title}
                        <motion.span
                            animate={{
                                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                            }}
                            transition={{
                                duration: 5,
                                repeat: Infinity,
                                ease: "linear"
                            }}
                            className="block bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent bg-[length:200%_auto]"
                        >
                            {heroContent.subtitle}
                        </motion.span>
                    </motion.h1>

                    {/* Description */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-xl md:text-2xl text-white/70 max-w-3xl mx-auto leading-relaxed"
                    >
                        {heroContent.description}
                    </motion.p>

                    {/* Features Grid */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="flex flex-wrap justify-center gap-4 max-w-3xl mx-auto"
                    >
                        {heroContent.features.map((feature, index) => (
                            <motion.div
                                key={feature}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.6 + index * 0.1 }}
                                whileHover={{ scale: 1.05 }}
                                className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-5 py-2 border border-white/20"
                            >
                                <Sparkles className="w-4 h-4 text-pink-300" />
                                <span className="text-white/90 text-sm font-medium">{feature}</span>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* CTA Button */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                        className="pt-8"
                    >
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="
                group relative inline-flex items-center gap-3 
                px-10 py-5 
                bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500
                hover:from-pink-600 hover:via-purple-600 hover:to-blue-600
                rounded-full 
                text-white font-bold text-lg
                transition-all duration-300 
                shadow-2xl shadow-pink-500/50
                overflow-hidden
              "
                        >
                            <span className="relative z-10">استكشف منتجاتنا</span>
                            <ChevronDown className="w-5 h-5 relative z-10 group-hover:translate-y-1 transition-transform" />

                            {/* Animated Background */}
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600"
                                animate={{
                                    opacity: [0, 0.5, 0]
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                            />
                        </motion.button>
                    </motion.div>
                </motion.div>

                {/* Floating Ice Cream Icons */}
                {[...Array(8)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute"
                        style={{
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`,
                        }}
                        animate={{
                            y: [0, -30, 0],
                            opacity: [0.2, 0.5, 0.2],
                            rotate: [0, 360]
                        }}
                        transition={{
                            duration: 5 + i,
                            repeat: Infinity,
                            delay: i * 0.5
                        }}
                    >
                        <IceCream className="w-8 h-8 text-white/20" />
                    </motion.div>
                ))}
            </div>

            {/* Scroll Indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="absolute bottom-10 left-1/2 -translate-x-1/2"
            >
                <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="flex flex-col items-center gap-2"
                >
                    <span className="text-white/50 text-sm">اكتشف المزيد</span>
                    <ChevronDown className="w-6 h-6 text-white/50" />
                </motion.div>
            </motion.div>
        </section>
    )
}
