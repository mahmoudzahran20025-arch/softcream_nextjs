'use client'

import { useState, useCallback } from 'react'
import { Sparkles, Heart, Share2, ChevronLeft, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination, Zoom } from 'swiper/modules'
import type { Swiper as SwiperType } from 'swiper'

import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/zoom'

interface Product {
  id: string
  name: string
  image?: string
  images?: string[] // Support multiple images
  energy_type?: string
  badge?: string
  category?: string
}

interface ProductImageProps {
  product: Product
  onWishlistToggle?: () => void
  isWishlisted?: boolean
  onShare?: () => void
}

export default function ProductImage({ 
  product, 
  onWishlistToggle,
  isWishlisted = false,
  onShare 
}: ProductImageProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [swiperRef, setSwiperRef] = useState<SwiperType | null>(null)
  
  // Combine single image with images array
  const images = product.images?.length 
    ? product.images 
    : product.image 
      ? [product.image] 
      : []

  const hasMultipleImages = images.length > 1

  const handlePrev = useCallback(() => {
    swiperRef?.slidePrev()
  }, [swiperRef])

  const handleNext = useCallback(() => {
    swiperRef?.slideNext()
  }, [swiperRef])

  // Share handler
  const handleShare = async () => {
    if (onShare) {
      onShare()
      return
    }
    
    const shareData = {
      title: product.name,
      url: `${window.location.origin}/products/${product.id}`,
    }
    
    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        await navigator.clipboard.writeText(shareData.url)
      }
    } catch (err) {
      console.log('Share failed:', err)
    }
  }

  return (
    <div className="relative h-[280px] min-h-[240px] max-h-[320px] lg:h-full lg:min-h-0 lg:max-h-none lg:w-1/2 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 overflow-hidden">
      
      {/* Image Gallery */}
      {images.length > 0 ? (
        <Swiper
          modules={[Pagination, Zoom]}
          onSwiper={setSwiperRef}
          onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
          pagination={{
            clickable: true,
            dynamicBullets: true,
            bulletClass: 'swiper-pagination-bullet !bg-white/50 !w-2 !h-2',
            bulletActiveClass: '!bg-white !w-3',
          }}
          zoom={{ maxRatio: 2 }}
          className="w-full h-full product-gallery"
          dir="ltr"
        >
          {images.map((img, index) => (
            <SwiperSlide key={index}>
              <div className="swiper-zoom-container w-full h-full">
                <motion.img
                  initial={{ scale: 1.05, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  src={img}
                  alt={`${product.name} - ${index + 1}`}
                  className="w-full h-full object-cover object-center"
                  loading={index === 0 ? 'eager' : 'lazy'}
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      ) : (
        // Placeholder
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-50 to-rose-100 dark:from-slate-800 dark:to-slate-900">
          <motion.span 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.3 }}
            className="text-8xl"
          >
            🍦
          </motion.span>
        </div>
      )}

      {/* Navigation Arrows (Desktop only, multiple images) */}
      {hasMultipleImages && (
        <>
          <button
            onClick={handlePrev}
            className="hidden lg:flex absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-full items-center justify-center shadow-lg hover:bg-white dark:hover:bg-slate-700 transition-all hover:scale-110"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-5 h-5 text-slate-700 dark:text-slate-200" />
          </button>
          <button
            onClick={handleNext}
            className="hidden lg:flex absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-full items-center justify-center shadow-lg hover:bg-white dark:hover:bg-slate-700 transition-all hover:scale-110"
            aria-label="Next image"
          >
            <ChevronRight className="w-5 h-5 text-slate-700 dark:text-slate-200" />
          </button>
        </>
      )}

      {/* Image Counter (multiple images) */}
      {hasMultipleImages && (
        <div className="absolute bottom-4 left-4 z-10 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
          {activeIndex + 1} / {images.length}
        </div>
      )}

      {/* Subtle Bottom Fade for Mobile */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white dark:from-slate-900 to-transparent lg:hidden pointer-events-none" />

      {/* Top Actions Row */}
      <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between">
        {/* Left: Energy Badge */}
        {product.energy_type && (
          <motion.div
            initial={{ scale: 0, x: -20 }}
            animate={{ scale: 1, x: 0 }}
            transition={{ delay: 0.3, type: 'spring' }}
            className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{product.energy_type}</span>
          </motion.div>
        )}

        {/* Right: Action Buttons */}
        <div className="flex items-center gap-2 mr-auto">
          {/* Share Button */}
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4 }}
            onClick={handleShare}
            className="w-10 h-10 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:bg-white dark:hover:bg-slate-700 transition-all hover:scale-110 active:scale-95"
            aria-label="مشاركة"
          >
            <Share2 className="w-4.5 h-4.5 text-slate-600 dark:text-slate-300" />
          </motion.button>

          {/* Wishlist Button */}
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5 }}
            onClick={onWishlistToggle}
            className="w-10 h-10 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:bg-white dark:hover:bg-slate-700 transition-all hover:scale-110 active:scale-95"
            aria-label={isWishlisted ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
          >
            <motion.div
              animate={isWishlisted ? { scale: [1, 1.3, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              <Heart 
                className={`w-4.5 h-4.5 transition-colors ${
                  isWishlisted 
                    ? 'fill-red-500 text-red-500' 
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              />
            </motion.div>
          </motion.button>
        </div>
      </div>

      {/* Badge (e.g., "جديد", "الأكثر مبيعاً") */}
      {product.badge && (
        <motion.div
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.3, type: 'spring' }}
          className="absolute top-4 right-4 lg:top-6 lg:right-6 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg z-10"
        >
          {product.badge}
        </motion.div>
      )}

      {/* Category Badge (Bottom Left) */}
      {product.category && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="absolute bottom-4 right-4 z-10 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-medium text-slate-700 dark:text-slate-300 shadow-sm hidden lg:block"
        >
          {product.category}
        </motion.div>
      )}

      {/* Wishlist Toast */}
      <AnimatePresence>
        {isWishlisted && (
          <motion.div
            initial={{ opacity: 0, y: 10, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -10, x: '-50%' }}
            className="absolute bottom-20 left-1/2 z-20 bg-slate-900/90 dark:bg-white/90 text-white dark:text-slate-900 text-xs px-3 py-2 rounded-lg shadow-lg whitespace-nowrap"
          >
            ♡ تمت الإضافة للمفضلة
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
