// ================================================================
// swiperConfig.ts - Centralized Swiper Configuration
// ================================================================
// Created: November 22, 2025
// Purpose: Eliminate duplicate Swiper configurations across components
// Updated: December 2025 - Performance optimizations

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

/**
 * Product Swiper Config - Optimized for Performance
 * ================================================
 * - Memoized slides prevent re-renders
 * - Reduced momentum for smoother feel
 * - watchSlidesProgress: false (reduces re-renders)
 * 
 * Note: Virtual slides removed - incompatible with slidesPerView: "auto"
 */
export const productSwiperConfig = {
  modules: [FreeMode, Pagination],
  spaceBetween: 16,
  slidesPerView: "auto" as const,
  freeMode: {
    enabled: true,
    sticky: false,
    momentum: true,
    momentumRatio: 0.25, // Reduced for smoother feel
    momentumBounce: false // Disable bounce for performance
  },
  pagination: {
    clickable: true,
    dynamicBullets: true,
    dynamicMainBullets: 3
  },
  dir: "rtl" as const,
  // Performance optimizations
  watchSlidesProgress: false,
  watchOverflow: true,
  resistanceRatio: 0.85,
  touchRatio: 1
}
