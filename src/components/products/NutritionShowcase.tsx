'use client'

import { motion } from 'framer-motion'
import { Dumbbell, Zap, Wheat, Pill } from 'lucide-react'
import { nutritionHighlights } from './data/productsContent'

const iconMap: Record<string, any> = {
    Dumbbell,
    Zap,
    Wheat,
    Pill
}

// Circular Progress Component
function CircularProgress({
    value,
    maxValue,
    color
}: {
    value: number
    maxValue: number
    color: string
}) {
    const percentage = (value / maxValue) * 100
    const circumference = 2 * Math.PI * 45 // radius = 45
    const strokeDashoffset = circumference - (percentage / 100) * circumference

    return (
        <svg className="w-32 h-32 -rotate-90" viewBox="0 0 100 100">
            {/* Background Circle */}
            <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-slate-200 dark:text-slate-800"
            />
            {/* Progress Circle */}
            <motion.circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                strokeWidth="8"
                strokeLinecap="round"
                className={`bg-gradient-to-r ${color}`}
                style={{
                    strokeDasharray: circumference,
                    strokeDashoffset: circumference
                }}
                animate={{
                    strokeDashoffset: [circumference, strokeDashoffset]
                }}
                transition={{
                    duration: 1.5,
                    ease: "easeOut",
                    delay: 0.2
                }}
                stroke="url(#gradient)"
            />
            <defs>
                <linearGradient id="gradient" gradientTransform="rotate(90)">
                    <stop offset="0%" stopColor="currentColor" className={`text-pink-500`} />
                    <stop offset="100%" stopColor="currentColor" className={`text-purple-500`} />
                </linearGradient>
            </defs>
        </svg>
    )
}

export default function NutritionShowcase() {
    return (
        <section className="py-20 px-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950">
            <div className="container mx-auto max-w-6xl">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-5xl font-black text-slate-900 dark:text-white mb-4">
                        القيم الغذائية المميزة
                    </h2>
                    <p className="text-xl text-slate-600 dark:text-slate-400">
                        غذاء متوازن وصحي في كل منتج
                    </p>
                </motion.div>

                {/* Nutrition Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {nutritionHighlights.map((item, index) => {
                        const IconComponent = iconMap[item.icon] || Zap

                        return (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ y: -10, scale: 1.05 }}
                                className="group"
                            >
                                <div className="
                  relative bg-white dark:bg-slate-800 
                  rounded-3xl p-8 
                  shadow-xl hover:shadow-2xl 
                  transition-all duration-300
                  border border-slate-200 dark:border-slate-700
                  overflow-hidden
                ">
                                    {/* Background Gradient Glow */}
                                    <div className={`
                    absolute inset-0 opacity-0 group-hover:opacity-10 
                    bg-gradient-to-br ${item.color} 
                    transition-opacity duration-300
                  `} />

                                    {/* Content */}
                                    <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                                        {/* Icon */}
                                        <motion.div
                                            whileHover={{ rotate: 360 }}
                                            transition={{ duration: 0.6 }}
                                            className={`
                        w-14 h-14 rounded-2xl 
                        bg-gradient-to-br ${item.color} 
                        flex items-center justify-center
                        shadow-lg
                      `}
                                        >
                                            <IconComponent className="w-7 h-7 text-white" strokeWidth={2} />
                                        </motion.div>

                                        {/* Title */}
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                            {item.title}
                                        </h3>

                                        {/* Circular Progress */}
                                        <div className="relative">
                                            <CircularProgress
                                                value={item.value}
                                                maxValue={item.maxValue}
                                                color={item.color}
                                            />

                                            {/* Value in Center */}
                                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                <motion.span
                                                    initial={{ scale: 0 }}
                                                    whileInView={{ scale: 1 }}
                                                    transition={{ delay: 0.5 + index * 0.1, type: "spring" }}
                                                    className="text-3xl font-black text-slate-900 dark:text-white"
                                                >
                                                    {item.value}
                                                </motion.span>
                                                <span className="text-sm text-slate-500 dark:text-slate-400">
                                                    {item.unit}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Description */}
                                        <p className="text-sm text-slate-600 dark:text-slate-400">
                                            {item.description}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
