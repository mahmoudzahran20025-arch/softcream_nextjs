'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'

export default function HeroFooter() {
  const scrollToMenu = () => {
    const productsGrid = document.getElementById('products-grid-anchor')
    if (productsGrid) {
      productsGrid.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <footer className="relative overflow-hidden bg-slate-50 py-24 text-slate-800">

      {/* Soft Background Elements */}
      <div className="absolute inset-0 select-none overflow-hidden">
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-pink-100/50 rounded-full blur-3xl opacity-60" />
        <div className="absolute -left-20 bottom-0 w-80 h-80 bg-blue-100/50 rounded-full blur-3xl opacity-60" />
      </div>

      <div className="container relative z-10 mx-auto px-4 text-center">

        {/* Decorative Icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white border border-pink-100 shadow-xl shadow-pink-100/50 rotate-3"
        >
          <Sparkles className="w-8 h-8 text-pink-500 fill-pink-500" />
        </motion.div>

        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-4xl md:text-6xl font-black mb-6 tracking-tight text-slate-900"
        >
          نكهة وجودة
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-amber-500">
            في كل كوب
          </span>
        </motion.h2>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="max-w-xl mx-auto text-lg text-slate-600 mb-10 leading-relaxed"
        >
          انضم إلينا في رحلة المذاق الأصلي. مكونات طبيعية، تحضير يومي، وتجربة لا تُنسى.
        </motion.p>

        {/* CTA Button */}
        <motion.button
          onClick={scrollToMenu}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          viewport={{ once: true }}
          className="group relative inline-flex items-center gap-3 rounded-full bg-slate-900 hover:bg-slate-800 px-8 py-4 text-lg font-bold text-white shadow-xl hover:shadow-2xl transition-all"
        >
          <span>تصفح كل المنتجات</span>
          <ArrowRight className="w-5 h-5 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
        </motion.button>
      </div>
    </footer>
  )
}
