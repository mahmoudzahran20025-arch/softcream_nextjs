'use client'

import { Swiper, SwiperSlide } from 'swiper/react'
import ProductCard from '@/components/ui/ProductCard'
import { productSwiperConfig } from '@/config/swiperConfig'

import 'swiper/css'
import 'swiper/css/free-mode'
import 'swiper/css/pagination'

interface Product {
  id: string
  name: string
  nameEn?: string
  price: number
  image?: string
  category?: string
  description?: string
  tags?: string
  ingredients?: string
  allergens?: string
  calories?: number
  protein?: number
  carbs?: number
  sugar?: number
  fat?: number
  fiber?: number
  energy_type?: string
  energy_score?: number
  badge?: string
  template_id?: string
}

interface ProductsSwiperWrapperProps {
  products: Product[]
  category: string
}

/**
 * Unified slide width for all card types
 * Consistent 180px base width across all templates
 */
const SLIDE_WIDTH_CLASS = '!w-[170px] sm:!w-[180px] md:!w-[190px] lg:!w-[200px]'

export default function ProductsSwiperWrapper({ products, category }: ProductsSwiperWrapperProps) {
  return (
    <Swiper
      modules={productSwiperConfig.modules}
      spaceBetween={productSwiperConfig.spaceBetween}
      slidesPerView={productSwiperConfig.slidesPerView}
      freeMode={productSwiperConfig.freeMode}
      pagination={productSwiperConfig.pagination}
      dir={productSwiperConfig.dir}
      className="!pb-16 md:!pb-12 products-swiper"
      aria-label={`Products in ${category} category`}
    >
      {products.map(product => (
        <SwiperSlide key={product.id} className={SLIDE_WIDTH_CLASS}>
          <ProductCard product={product} />
        </SwiperSlide>
      ))}
    </Swiper>
  )
}

