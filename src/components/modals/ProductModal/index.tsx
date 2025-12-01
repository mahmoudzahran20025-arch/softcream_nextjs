'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { FreeMode } from 'swiper/modules'
import ProductCard from '@/components/ui/ProductCard'
import { Product } from '@/lib/api'
import { motion, AnimatePresence } from 'framer-motion'
import ProductImage from './ProductImage'
import ProductHeader from './ProductHeader'
import NutritionInfo from './NutritionInfo'
import AddonsList from './AddonsList'
import ActionFooter from './ActionFooter'
import StickyMiniHeader from './StickyMiniHeader'
import { useProductLogic } from './useProductLogic'
import { useCustomization } from './useCustomization'
import { useProductConfiguration } from '@/hooks/useProductConfiguration'
import { useAddToCart } from '@/hooks/useAddToCart'
import { ProductTemplateRenderer } from './templates'
import { debug } from '@/lib/debug'
import { X } from 'lucide-react'

import 'swiper/css'
import 'swiper/css/free-mode'

interface ProductModalProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
  allProducts?: Product[]
}

export default function ProductModal({ product, isOpen, onClose, allProducts = [] }: ProductModalProps) {
  const [recommendations, setRecommendations] = useState<Product[]>([])
  const [showMiniHeader, setShowMiniHeader] = useState(false)
  const [showFooter, setShowFooter] = useState(false)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  // Handle scroll to show/hide mini header and footer
  const handleScroll = useCallback(() => {
    if (contentRef.current) {
      const scrollTop = contentRef.current.scrollTop
      const scrollHeight = contentRef.current.scrollHeight
      const clientHeight = contentRef.current.clientHeight
      const scrollProgress = scrollTop / (scrollHeight - clientHeight)
      
      setShowMiniHeader(scrollTop > 100)
      // Show footer after scrolling 15% of the content
      setShowFooter(scrollProgress > 0.15 || scrollTop > 150)
    }
  }, [])

  // Use optimized product logic hook
  const {
    displayProduct,
    isFetchingAddons,
    quantity,
    setQuantity,
    selectedAddons,
    toggleAddon,
    addons,
    addonsTotal,
    totalPrice,
    tags,
    ingredients,
    allergens,
  } = useProductLogic({ product, isOpen })

  // Use customization hook for BYO products
  const customization = useCustomization({
    productId: product?.id || displayProduct?.id || null,
    isOpen,
    basePrice: product?.price || displayProduct?.price || 0
  })

  // Use product configuration hook for sizes & containers
  const productConfig = useProductConfiguration({
    productId: product?.id || displayProduct?.id || null,
    isOpen
  })

  // Debug logging (only in development)
  debug.product('ProductModal state', {
    productId: product?.id,
    hasContainers: productConfig.hasContainers,
    hasSizes: productConfig.hasSizes,
    isCustomizable: customization.isCustomizable
  })

  // Generate recommendations
  useEffect(() => {
    if (product && allProducts.length > 0) {
      const filtered = allProducts.filter(p => p.id !== product.id)
      const shuffled = filtered.sort(() => Math.random() - 0.5).slice(0, 5)
      setRecommendations(shuffled)
    }
  }, [product, allProducts])

  // Handle close modal
  const handleClose = () => {
    window.history.pushState({}, '', '/')
    onClose()
  }

  // Use unified add to cart hook
  const { handleAddToCart } = useAddToCart({
    product: displayProduct || null,
    quantity,
    productConfig: (productConfig.hasContainers || productConfig.hasSizes) ? {
      hasContainers: productConfig.hasContainers,
      hasSizes: productConfig.hasSizes,
      hasCustomization: productConfig.hasCustomization,
      selectedContainer: productConfig.selectedContainer,
      selectedSize: productConfig.selectedSize,
      containerObj: productConfig.containerObj,
      sizeObj: productConfig.sizeObj,
      selections: productConfig.selections,
      totalPrice: productConfig.totalPrice,
      validationResult: productConfig.validationResult
    } : null,
    customization: customization.isCustomizable ? {
      isCustomizable: true,
      selections: customization.selections,
      selectedOptions: customization.selectedOptions,
      totalPrice: customization.totalPrice,
      validationResult: customization.validationResult
    } : null,
    legacy: {
      selectedAddons,
      totalPrice
    },
    onSuccess: handleClose
  })

  if (!isOpen || !product || !displayProduct) return null

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-end lg:items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={handleBackdropClick}
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            initial={{ y: 100, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 100, opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative bg-white dark:bg-slate-900 w-full max-w-5xl rounded-t-[2rem] lg:rounded-3xl max-h-[92vh] overflow-hidden shadow-2xl flex flex-col lg:flex-row"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 lg:left-4 lg:right-auto z-20 w-11 h-11 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-full shadow-xl flex items-center justify-center hover:bg-white dark:hover:bg-slate-700 transition-all hover:scale-110 active:scale-95"
              aria-label="إغلاق"
            >
              <X className="w-5 h-5 text-slate-700 dark:text-slate-200" />
            </button>

            {/* Side Action Buttons (Share & Wishlist) */}
            <div className="absolute top-20 right-4 lg:left-4 lg:right-auto z-20 flex flex-col gap-2">
              {/* Share Button */}
              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: displayProduct?.name || 'منتج من سوفت كريم',
                      text: displayProduct?.description || 'جرب هذا المنتج اللذيذ!',
                      url: window.location.href
                    })
                  } else {
                    navigator.clipboard.writeText(window.location.href)
                    // Could add toast notification here
                  }
                }}
                className="w-10 h-10 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:bg-white dark:hover:bg-slate-700 transition-all hover:scale-110 active:scale-95 group"
                aria-label="مشاركة"
              >
                <svg className="w-4.5 h-4.5 text-slate-600 dark:text-slate-300 group-hover:text-pink-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </motion.button>

              {/* Wishlist Button (placeholder for future) */}
              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                onClick={() => setIsWishlisted(!isWishlisted)}
                className={`w-10 h-10 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95 ${
                  isWishlisted 
                    ? 'bg-pink-500 text-white' 
                    : 'bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700'
                }`}
                aria-label="إضافة للمفضلة"
              >
                <svg className={`w-4.5 h-4.5 transition-colors ${isWishlisted ? 'text-white fill-white' : 'text-slate-600 dark:text-slate-300'}`} fill={isWishlisted ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </motion.button>
            </div>

            {/* Left Column (Desktop) / Top (Mobile) - Product Image */}
            <ProductImage 
              product={displayProduct}
              isWishlisted={isWishlisted}
              onWishlistToggle={() => setIsWishlisted(!isWishlisted)}
            />

            {/* Right Column (Desktop) / Bottom (Mobile) - Content */}
            <div className="flex-1 flex flex-col lg:w-1/2 overflow-hidden relative z-10 -mt-12 lg:mt-0 rounded-t-[2.5rem] lg:rounded-none bg-white dark:bg-slate-900 shadow-2xl lg:shadow-none">
              {/* Sticky Mini Header (appears on scroll) */}
              <StickyMiniHeader
                productName={displayProduct.name}
                totalPrice={
                  (productConfig.hasContainers || productConfig.hasSizes || productConfig.hasCustomization)
                    ? productConfig.totalPrice * quantity
                    : (customization.isCustomizable ? customization.totalPrice * quantity : totalPrice)
                }
                isVisible={showMiniHeader}
              />

              {/* Mobile Handle Bar */}
              <div className="w-full flex justify-center pt-3 pb-2 lg:hidden">
                <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full" />
              </div>

              {/* Scrollable Content Area */}
              <div 
                ref={contentRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto px-5 lg:px-8 pt-2 lg:pt-8 pb-28 space-y-5 scrollbar-thin scrollbar-thumb-pink-300 dark:scrollbar-thumb-pink-700 scrollbar-track-transparent min-h-[50vh]"
              >
                {/* Product Header (Title, Price, Description) */}
                <ProductHeader product={displayProduct} />

                {/* Nutrition Info - ✅ Now with dynamic customization nutrition! */}
                <NutritionInfo
                  product={displayProduct}
                  ingredients={ingredients}
                  allergens={allergens}
                  customizationNutrition={
                    // Use productConfig nutrition if it has sizes OR containers OR customization
                    (productConfig.hasSizes || productConfig.hasContainers || productConfig.hasCustomization)
                      ? productConfig.totalNutrition
                      : customization.customizationNutrition
                  }
                />

                {/* Product Template System - Dynamic based on configuration */}
                {(productConfig.hasContainers || productConfig.hasSizes || productConfig.hasCustomization) ? (
                  <ProductTemplateRenderer
                    product={displayProduct}
                    productConfig={productConfig}
                  />
                ) : (
                  /* Standard products without customization */
                  <AddonsList
                    addons={addons}
                    tags={tags}
                    selectedAddons={selectedAddons}
                    onToggleAddon={toggleAddon}
                    isLoading={isFetchingAddons}
                  />
                )}

                {/* Recommendations */}
                {recommendations.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="pb-2"
                  >
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">قد يعجبك أيضاً</h3>
                    <Swiper
                      modules={[FreeMode]}
                      spaceBetween={10}
                      slidesPerView="auto"
                      freeMode
                      dir="rtl"
                    >
                      {recommendations.map(rec => (
                        <SwiperSlide key={rec.id} className="!w-[130px]">
                          <ProductCard product={rec} />
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  </motion.div>
                )}
              </div>

              {/* Sticky Action Footer - Appears after scrolling */}
              <AnimatePresence>
                {showFooter && (
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                  >
                    <ActionFooter
                quantity={quantity}
                onIncrease={() => setQuantity(quantity + 1)}
                onDecrease={() => setQuantity(Math.max(1, quantity - 1))}
                onAddToCart={handleAddToCart}
                totalPrice={
                  // Use productConfig if it has containers OR sizes OR customization
                  (productConfig.hasContainers || productConfig.hasSizes || productConfig.hasCustomization)
                    ? productConfig.totalPrice * quantity
                    : (customization.isCustomizable ? customization.totalPrice * quantity : totalPrice)
                }
                basePrice={
                  // For BYO products, base price is 0 and size contains the price
                  (productConfig.hasContainers || productConfig.hasSizes || productConfig.hasCustomization)
                    ? (productConfig.config?.product.basePrice || displayProduct.price)
                    : displayProduct.price
                }
                addonsPrice={
                  (productConfig.hasContainers || productConfig.hasSizes || productConfig.hasCustomization)
                    ? (productConfig.containerObj?.priceModifier || 0) + (productConfig.sizeObj?.priceModifier || 0) + productConfig.customizationTotal
                    : (customization.isCustomizable ? customization.customizationTotal : addonsTotal)
                }
                selectedAddonsCount={
                  (productConfig.hasContainers || productConfig.hasSizes || productConfig.hasCustomization)
                    ? productConfig.selectedOptions.length + (productConfig.selectedContainer ? 1 : 0) + (productConfig.selectedSize ? 1 : 0)
                    : (customization.isCustomizable ? customization.selectedOptions.length : selectedAddons.length)
                }
                selectedOptions={
                  (productConfig.hasContainers || productConfig.hasSizes || productConfig.hasCustomization)
                    ? productConfig.selectedOptions
                    : customization.selectedOptions
                }
                containerName={productConfig.containerObj?.name}
                sizeName={productConfig.sizeObj?.name}
                isValid={
                  (productConfig.hasContainers || productConfig.hasSizes || productConfig.hasCustomization)
                    ? productConfig.validationResult.isValid
                    : (customization.isCustomizable ? customization.validationResult.isValid : true)
                }
                validationMessage={
                  (productConfig.hasContainers || productConfig.hasSizes || productConfig.hasCustomization)
                    ? productConfig.validationResult.errors[0]
                    : (customization.isCustomizable ? customization.validationResult.errors[0] : undefined)
                }
              />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Scroll Hint - Shows when footer is hidden */}
              <AnimatePresence>
                {!showFooter && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-slate-400 dark:text-slate-500"
                  >
                    <motion.div
                      animate={{ y: [0, 5, 0] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="text-xs"
                    >
                      اسحب للأسفل لرؤية الخيارات
                    </motion.div>
                    <motion.div
                      animate={{ y: [0, 3, 0] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
