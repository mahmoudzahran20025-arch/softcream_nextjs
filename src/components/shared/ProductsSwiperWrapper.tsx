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
  layout_mode?: 'complex' | 'medium' | 'simple' | 'builder' | 'composer' | 'selector' | 'standard'
}

interface ProductsSwiperWrapperProps {
  products: Product[]
  category: string
}

export default function ProductsSwiperWrapper({ products, category }: ProductsSwiperWrapperProps) {
  // Determine slide width based on complexity of the first product
  // Complex products (BYO) need more space
  const isComplex = products[0]?.layout_mode === 'complex' || products[0]?.layout_mode === 'builder'
  const slideWidthClass = isComplex ? '!w-[220px] md:!w-[260px]' : '!w-[160px] md:!w-[200px]'

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
          className={slideWidthClass}
        >
          <ProductCard product={product} />
        </SwiperSlide>
      ))}
    </Swiper>
  )
}

