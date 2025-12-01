'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Palette, IceCream, ChevronLeft } from 'lucide-react'
import Image from 'next/image'
import { CategoryConfig } from '@/config/categories'

interface Product {
  id: string
  name: string
  nameEn?: string
  price: number
  image?: string
  description?: string
}

interface BYOProductCardProps {
  product: Product
  config: CategoryConfig
}

export default function BYOProductCard({ product, config: _config }: BYOProductCardProps) {
  void _config // Reserved for future use
  const [isHovered, setIsHovered] = useState(false)

  const handleClick = () => {
    window.location.href = `/products/${product.id}`
  }

  return (
    <motion.div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      whileHover={{ y: -8 }}
      whileTap={{ scale: 0.98 }}
      className="relative cursor-pointer group"
    >
      {/* Main Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#FF6B9D] via-[#FF5A8E] to-[#E91E63] shadow-xl shadow-pink-500/25 hover:shadow-2xl hover:shadow-pink-500/40 transition-all duration-500">
        
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-30">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
            className="absolute -top-1/2 -right-1/2 w-full h-full"
            style={{
              background: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }}
          />
        </div>

        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={isHovered ? { y: [-5, 5, -5], rotate: [0, 10, 0] } : {}}
            transition={{ repeat: Infinity, duration: 3 }}
            className="absolute top-4 right-4"
          >
            <Sparkles className="w-6 h-6 text-white/60" />
          </motion.div>
          <motion.div
            animate={isHovered ? { y: [5, -5, 5], rotate: [0, -10, 0] } : {}}
            transition={{ repeat: Infinity, duration: 2.5, delay: 0.5 }}
            className="absolute top-8 left-6"
          >
            <IceCream className="w-5 h-5 text-white/40" />
          </motion.div>
        </div>

        {/* Product Image */}
        <div className="relative aspect-[4/5] p-6">
          {product.image ? (
            <motion.div
              animate={isHovered ? { scale: 1.1, rotate: 3 } : { scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              className="relative w-full h-full"
            >
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-contain drop-shadow-2xl"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </motion.div>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <motion.span 
                animate={isHovered ? { scale: 1.2, rotate: 10 } : {}}
                className="text-8xl drop-shadow-lg"
              >
                🍦
              </motion.span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="relative px-5 pb-5 text-white">
          {/* Product Name */}
          <h3 className="text-xl font-bold mb-1 drop-shadow-sm">
            {product.name}
          </h3>

          {/* Description */}
          <p className="text-white/80 text-sm mb-4">
            {product.description || 'صمم آيس كريمك الخاص بنكهاتك المفضلة'}
          </p>

          {/* Features */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="text-[11px] bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-full flex items-center gap-1">
              <Palette className="w-3 h-3" />
              تخصيص كامل
            </span>
            <span className="text-[11px] bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-full flex items-center gap-1">
              <IceCream className="w-3 h-3" />
              20+ نكهة
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-white/70 text-xs block">يبدأ من</span>
              <span className="text-3xl font-bold">
                {product.price}
                <span className="text-base mr-1 opacity-80">ج.م</span>
              </span>
            </div>
          </div>

          {/* CTA Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-4 bg-white text-[#FF6B9D] rounded-2xl font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-black/10 hover:shadow-xl transition-all group"
          >
            <span className="text-lg">🎨</span>
            <span>صمم بنفسك</span>
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          </motion.button>
        </div>
      </div>

      {/* Glow Effect */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 0.6 : 0 }}
        className="absolute -inset-3 bg-gradient-to-r from-pink-500/30 to-rose-500/30 rounded-[2rem] blur-2xl -z-10"
      />
    </motion.div>
  )
}
