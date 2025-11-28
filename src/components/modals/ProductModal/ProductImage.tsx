'use client'

import { Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'

interface Product {
  id: string
  name: string
  image?: string
  energy_type?: string
  badge?: string
}

interface ProductImageProps {
  product: Product
}

export default function ProductImage({ product }: ProductImageProps) {
  return (
    <div className="relative h-[35vh] min-h-[280px] lg:h-full lg:w-1/2 bg-gray-100 dark:bg-slate-800 overflow-hidden group">
      {product.image ? (
        <motion.img
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6 }}
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover object-center transition-transform duration-700 lg:group-hover:scale-105"
          width={600}
          height={600}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <span className="text-9xl opacity-20">🍦</span>
        </div>
      )}

      {/* Subtle Bottom Fade for Mobile */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white dark:from-slate-900 to-transparent lg:hidden pointer-events-none" />

      {/* Energy Badge */}
      {product.energy_type && (
        <motion.div
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.3, type: 'spring' }}
          className="absolute top-6 left-6 lg:top-8 lg:left-8 bg-gradient-to-r from-amber-400 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>{product.energy_type}</span>
        </motion.div>
      )}

      {/* Badge */}
      {product.badge && (
        <motion.div
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.3, type: 'spring' }}
          className="absolute top-6 right-6 lg:top-8 lg:right-8 bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg"
        >
          {product.badge}
        </motion.div>
      )}
    </div>
  )
}
