'use client'

import { Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import PriceDisplay from '@/components/ui/common/PriceDisplay'

interface Product {
  id: string
  name: string
  nameEn?: string
  price: number
  description?: string
  energy_score?: number
}

interface ProductHeaderProps {
  product: Product
}

export default function ProductHeader({ product }: ProductHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="space-y-2"
    >
      {/* Title and Price Row */}
      <div className="flex items-start justify-between gap-4 w-full mb-2">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white font-cairo leading-tight">
            {product.name}
          </h2>
          {product.nameEn && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
              {product.nameEn}
            </p>
          )}
        </div>
        <div className="flex-shrink-0 whitespace-nowrap pt-1 pl-2 md:pl-4">
          <PriceDisplay price={product.price} size="lg" />
        </div>
      </div>
      
      {/* Description with Energy Badge Inline */}
      <div className="flex items-start gap-2 flex-wrap">
        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed flex-1">
          {product.description}
        </p>
        {product.energy_score && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-full text-xs font-bold shadow-sm whitespace-nowrap">
            <Sparkles className="w-3 h-3" />
            {product.energy_score}% طاقة
          </span>
        )}
      </div>
    </motion.div>
  )
}
