'use client'

import { Swiper, SwiperSlide } from 'swiper/react'
import { FreeMode, Pagination } from 'swiper/modules'
import ProductCard from '@/components/ui/ProductCard'

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
  // تم الاحتفاظ بـ category للاستخدام المستقبلي - قد يُستخدم لإضافة aria-label أو data attributes
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  void category
  
  return (
    <Swiper
      modules={[FreeMode, Pagination]}
      spaceBetween={16}
      slidesPerView="auto"
      freeMode={{
        enabled: true,
        sticky: false,
        momentum: true,
        momentumRatio: 0.5
      }}
      pagination={{
        clickable: true,
        dynamicBullets: true
      }}
      dir="rtl"
      className="!pb-12"
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

