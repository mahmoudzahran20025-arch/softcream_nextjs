'use client'

import { ChevronDown } from 'lucide-react'
import { motion } from 'framer-motion'

interface ScrollDownSectionProps {
  title?: string
  subtitle?: string
  variant?: 'default' | 'gradient' | 'minimal'
}

export default function ScrollDownSection({ 
  title = 'اكتشف المزيد',
  subtitle = 'تصفح منتجاتنا المميزة',
  variant = 'gradient'
}: ScrollDownSectionProps) {
  
  const handleScrollDown = () => {
    const nextSection = document.querySelector('[data-scroll-target]')
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else {
      // Fallback: scroll by viewport height
      window.scrollBy({ top: window.innerHeight * 0.8, behavior: 'smooth' })
    }
  }

  if (variant === 'minimal') {
    return (
      <div className="bg-white dark:bg-slate-950 py-8 flex justify-center">
        <motion.button
          onClick={handleScrollDown}
          className="flex flex-col items-center gap-2 group cursor-pointer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="text-xs md:text-sm font-bold bg-gradient-to-r from-[#FF6B9D] to-[#FF5A8E] bg-clip-text text-transparent">
            {title}
          </span>
          <motion.div 
            className="w-10 h-10 rounded-full bg-gradient-to-r from-[#FF6B9D] to-[#FF5A8E] flex items-center justify-center shadow-lg shadow-pink-500/30"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ChevronDown className="w-5 h-5 text-white" strokeWidth={3} />
          </motion.div>
        </motion.button>
      </div>
    )
  }

  if (variant === 'gradient') {
    return (
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-pink-50/30 to-white dark:from-slate-950 dark:via-pink-950/10 dark:to-slate-950 py-8 md:py-12">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Animated Circles */}
          <motion.div
            className="absolute top-1/2 left-1/4 w-48 h-48 bg-pink-200/20 dark:bg-pink-500/5 rounded-full blur-3xl"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute top-1/2 right-1/4 w-48 h-48 bg-rose-200/20 dark:bg-rose-500/5 rounded-full blur-3xl"
            animate={{ 
              scale: [1.2, 1, 1.2],
              opacity: [0.5, 0.3, 0.5]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            {/* Title */}
            <h3 className="text-lg md:text-xl font-bold bg-gradient-to-r from-[#FF6B9D] to-[#FF5A8E] bg-clip-text text-transparent mb-2">
              {title}
            </h3>
            
            {/* Subtitle - Hidden on mobile */}
            <p className="hidden md:block text-xs md:text-sm text-slate-600 dark:text-slate-400 mb-4 max-w-md mx-auto">
              {subtitle}
            </p>

            {/* Animated Scroll Button */}
            <motion.button
              onClick={handleScrollDown}
              className="group relative inline-flex flex-col items-center gap-2 mt-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Pulsing Ring */}
              <motion.div
                className="absolute w-12 h-12 rounded-full bg-gradient-to-r from-[#FF6B9D] to-[#FF5A8E] opacity-20"
                animate={{ 
                  scale: [1, 1.5, 1],
                  opacity: [0.2, 0, 0.2]
                }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
              />
              
              {/* Main Button */}
              <motion.div
                className="relative w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-r from-[#FF6B9D] to-[#FF5A8E] flex items-center justify-center shadow-lg shadow-pink-500/30 group-hover:shadow-xl group-hover:shadow-pink-500/40 transition-shadow"
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <ChevronDown className="w-5 h-5 md:w-6 md:h-6 text-white" strokeWidth={3} />
              </motion.div>

              {/* Decorative Lines */}
              <div className="flex flex-col gap-0.5">
                <motion.div 
                  className="w-0.5 h-3 bg-gradient-to-b from-[#FF6B9D] to-transparent rounded-full"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.div 
                  className="w-0.5 h-2 bg-gradient-to-b from-[#FF6B9D] to-transparent rounded-full"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
                />
              </div>
            </motion.button>

            {/* Decorative Divider - Smaller */}
            <div className="mt-6 flex items-center justify-center gap-2">
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-pink-300 dark:to-pink-700"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-[#FF6B9D] to-[#FF5A8E]"></div>
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-pink-300 dark:to-pink-700"></div>
            </div>
          </motion.div>
        </div>
      </section>
    )
  }

  // Default variant
  return (
    <div className="bg-white dark:bg-slate-950 py-12 flex justify-center">
      <motion.button
        onClick={handleScrollDown}
        className="flex flex-col items-center gap-3 group"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <span className="text-sm md:text-base font-bold text-slate-900 dark:text-white">
          {title}
        </span>
        <motion.div 
          className="w-12 h-12 rounded-full bg-gradient-to-r from-[#FF6B9D] to-[#FF5A8E] flex items-center justify-center shadow-lg shadow-pink-500/30 group-hover:shadow-xl group-hover:shadow-pink-500/40 transition-shadow"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronDown className="w-6 h-6 text-white" strokeWidth={3} />
        </motion.div>
      </motion.button>
    </div>
  )
}
