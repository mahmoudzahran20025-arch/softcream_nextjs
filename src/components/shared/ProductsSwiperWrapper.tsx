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
}

interface ProductsSwiperWrapperProps {
  products: Product[]
  category: string
}

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
        <SwiperSlide
          key={product.id}
          className="!w-[160px] md:!w-[200px]"
        >
          <ProductCard product={product} />
        </SwiperSlide>
      ))}
    </Swiper>
  )
}

