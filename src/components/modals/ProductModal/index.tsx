'use client'

import { useState, useEffect } from 'react'
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
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={handleBackdropClick}
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            initial={{ y: 100, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 100, opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative bg-white dark:bg-slate-900 w-full max-w-5xl rounded-t-[2rem] md:rounded-3xl max-h-[92vh] overflow-hidden shadow-2xl flex flex-col md:flex-row"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 md:left-4 md:right-auto z-20 w-11 h-11 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-full shadow-xl flex items-center justify-center hover:bg-white dark:hover:bg-slate-700 transition-all hover:scale-110 active:scale-95"
              aria-label="إغلاق"
            >
              <X className="w-5 h-5 text-slate-700 dark:text-slate-200" />
            </button>

            {/* Left Column (Desktop) / Top (Mobile) - Product Image */}
            <ProductImage product={displayProduct} />

            {/* Right Column (Desktop) / Bottom (Mobile) - Content */}
            <div className="flex-1 flex flex-col md:w-1/2 overflow-hidden relative z-10 -mt-16 md:mt-0 rounded-t-[2.5rem] md:rounded-none bg-white dark:bg-slate-900 shadow-2xl md:shadow-none">
              {/* Mobile Handle Bar */}
              <div className="w-full flex justify-center pt-3 pb-2 md:hidden">
                <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full" />
              </div>

              {/* Scrollable Content Area */}
              <div className="flex-1 overflow-y-auto px-6 md:px-8 pt-2 md:pt-8 pb-24 space-y-4 scrollbar-thin scrollbar-thumb-pink-300 dark:scrollbar-thumb-pink-700 scrollbar-track-transparent">
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

                {/* Product Template System - Dynamic based on product type */}
                {(product?.is_customizable === 1 || displayProduct?.is_customizable === 1 || productConfig.hasContainers || productConfig.hasSizes) ? (
                  <ProductTemplateRenderer
                    product={displayProduct}
                    productConfig={productConfig}
                  />
                ) : (
                  /* Legacy Addons (for non-customizable products) */
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

              {/* Sticky Action Footer */}
              <ActionFooter
                quantity={quantity}
                onIncrease={() => setQuantity(quantity + 1)}
                onDecrease={() => setQuantity(Math.max(1, quantity - 1))}
                onAddToCart={handleAddToCart}
                totalPrice={
                  // Use productConfig if it has containers OR sizes
                  (productConfig.hasContainers || productConfig.hasSizes)
                    ? productConfig.totalPrice * quantity 
                    : (customization.isCustomizable ? customization.totalPrice * quantity : totalPrice)
                }
                basePrice={
                  // For BYO products, base price is 0 and size contains the price
                  (productConfig.hasContainers || productConfig.hasSizes)
                    ? (productConfig.config?.product.basePrice || displayProduct.price)
                    : displayProduct.price
                }
                addonsPrice={
                  (productConfig.hasContainers || productConfig.hasSizes)
                    ? (productConfig.containerObj?.priceModifier || 0) + (productConfig.sizeObj?.priceModifier || 0) + productConfig.customizationTotal
                    : (customization.isCustomizable ? customization.customizationTotal : addonsTotal)
                }
                selectedAddonsCount={
                  (productConfig.hasContainers || productConfig.hasSizes)
                    ? productConfig.selectedOptions.length + (productConfig.selectedContainer ? 1 : 0) + (productConfig.selectedSize ? 1 : 0)
                    : (customization.isCustomizable ? customization.selectedOptions.length : selectedAddons.length)
                }
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
