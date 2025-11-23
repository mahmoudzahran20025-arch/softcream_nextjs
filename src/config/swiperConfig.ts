// ================================================================
// swiperConfig.ts - Centralized Swiper Configuration
// ================================================================
// Created: November 22, 2025
// Purpose: Eliminate duplicate Swiper configurations across components

import { FreeMode, Pagination } from 'swiper/modules'

export const defaultSwiperConfig = {
  modules: [FreeMode, Pagination],
  spaceBetween: 16,
  slidesPerView: "auto" as const,
  freeMode: {
    enabled: true,
    sticky: false,
    momentum: true,
    momentumRatio: 0.5
  },
  pagination: {
    clickable: true,
    dynamicBullets: true
  },
  dir: "rtl" as const
}

export const productSwiperConfig = {
  ...defaultSwiperConfig,
  pagination: {
    clickable: true,
    dynamicBullets: true,
    dynamicMainBullets: 3
  }
}

console.log('✅ Swiper config loaded')
