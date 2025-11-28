'use client'

import { useState, useRef } from 'react'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import ProductHeader from '@/components/modals/ProductModal/ProductHeader'
import NutritionInfo from '@/components/modals/ProductModal/NutritionInfo'
import AddonsList from '@/components/modals/ProductModal/AddonsList'
import ActionFooter from '@/components/modals/ProductModal/ActionFooter'
import { useCustomization } from '@/components/modals/ProductModal/useCustomization'
import { useProductConfiguration } from '@/hooks/useProductConfiguration'
import { useAddToCart } from '@/hooks/useAddToCart'
import { ProductTemplateRenderer } from '@/components/modals/ProductModal/templates'
import { debug } from '@/lib/debug'

import { useProductLogic } from '@/components/modals/ProductModal/useProductLogic'
import ProductsProvider from '@/providers/ProductsProvider'
import { CategoryTrackingProvider } from '@/providers/CategoryTrackingProvider'
import { useModalStore } from '@/stores/modalStore'
import Header from '@/components/ui/Header'
import FilterBar from '@/components/pages/Home/FilterBar'
import ProductsGrid from '@/components/pages/ProductsGrid'
import Footer from '@/components/server/Footer'
import ToastContainer from '@/components/ui/ToastContainer'
import ScrollProgressButton from '@/components/ui/ScrollProgressButton'
import ScrollDownSection from '@/components/ui/ScrollDownSection'
import ModalOrchestrator from '@/components/modals/ModalOrchestrator'

// Lazy load remaining components
const OrdersBadge = dynamic(() => import('@/components/ui/OrdersBadge'), { ssr: false })

interface Props {
  product: any
  allProducts: any[]
  language?: 'ar' | 'en'
}

function RichProductPageContent({ product, allProducts }: Props) {
  debug.product('RichProductPage Render', { productId: product?.id })

  const { open } = useModalStore()
  const [showHeader] = useState(true)
  const [showFilterBar] = useState(true)
  const productHeroRef = useRef<HTMLDivElement>(null)

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
  } = useProductLogic({ product, isOpen: true })

  // Initialize Customization Hook
  const customization = useCustomization({
    productId: displayProduct?.id || product?.id || null,
    isOpen: true,
    basePrice: displayProduct?.price || product?.price || 0
  })

  // Use product configuration hook for sizes & containers
  const productConfig = useProductConfiguration({
    productId: displayProduct?.id || product?.id || null,
    isOpen: true
  })

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
    }
  })

  if (!displayProduct) return null

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Header */}
      <Header
        onOpenCart={() => open('cart')}
        onOpenSidebar={() => open('sidebar')}
      />

      {/* Product Hero Section */}
      <section
        ref={productHeroRef}
        className="relative bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 pt-10"
      >

        {/* Product Content */}
        <div className="container mx-auto px-4 pt-8 md:pt-12 pb-0">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-[45%_55%] gap-6 md:gap-8 items-start">
              {/* Product Image ... */}
              <div className="relative h-[600px] md:aspect-[3/4] lg:aspect-[4/5] md:h-auto rounded-2xl overflow-hidden bg-gradient-to-br from-pink-50 to-rose-50 dark:from-slate-800 dark:to-slate-700 group md:sticky md:top-24">
                {displayProduct.image ? (
                  <img
                    src={displayProduct.image}
                    alt={displayProduct.name}
                    className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 dark:text-slate-600 text-6xl">
                    🍦
                  </div>
                )}

                {/* Energy Type Badge */}
                {displayProduct.energy_type && (
                  <div className="absolute top-4 left-4 bg-gradient-to-r from-amber-400 to-orange-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1.5">
                    <span className="text-sm">⚡</span>
                    <span>{displayProduct.energy_type}</span>
                  </div>
                )}

                {/* Badge */}
                {displayProduct.badge && (
                  <div className="absolute top-4 right-4 bg-gradient-to-r from-[#FF6B9D] to-[#FF5A8E] text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
                    {displayProduct.badge}
                  </div>
                )}
              </div>

              {/* Product Details */}
              <div className="space-y-4 md:space-y-6">
                <ProductHeader
                  product={displayProduct}
                  displayPrice={
                    (productConfig.hasContainers || productConfig.hasSizes)
                      ? productConfig.totalPrice
                      : ((displayProduct?.is_customizable === 1) ? customization.totalPrice : undefined)
                  }
                />

                {/* ✅ NOW WITH DYNAMIC NUTRITION! */}
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
                {(displayProduct?.is_customizable === 1 || productConfig.hasContainers || productConfig.hasSizes) ? (
                  <ProductTemplateRenderer
                    product={displayProduct}
                    productConfig={productConfig}
                  />
                ) : (
                  <AddonsList
                    addons={addons}
                    tags={tags}
                    selectedAddons={selectedAddons}
                    onToggleAddon={toggleAddon}
                    isLoading={isFetchingAddons}
                  />
                )}

                {/* Action Footer */}
                <div className="sticky bottom-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 p-4 md:p-6 rounded-t-2xl shadow-2xl -mx-4 md:-mx-6 z-30">
                  <div className="max-w-md mx-auto">
                    <ActionFooter
                      quantity={quantity}
                      onIncrease={() => setQuantity(quantity + 1)}
                      onDecrease={() => setQuantity(Math.max(1, quantity - 1))}
                      onAddToCart={handleAddToCart}
                      totalPrice={
                        (productConfig.hasContainers || productConfig.hasSizes)
                          ? productConfig.totalPrice * quantity
                          : ((displayProduct?.is_customizable === 1) ? customization.totalPrice * quantity : totalPrice)
                      }
                      basePrice={
                        (productConfig.hasContainers || productConfig.hasSizes)
                          ? (productConfig.config?.product.basePrice || displayProduct.price)
                          : displayProduct.price
                      }
                      addonsPrice={
                        (productConfig.hasContainers || productConfig.hasSizes)
                          ? (productConfig.containerObj?.priceModifier || 0) + (productConfig.sizeObj?.priceModifier || 0) + productConfig.customizationTotal
                          : ((displayProduct?.is_customizable === 1) ? customization.customizationTotal : addonsTotal)
                      }
                      selectedAddonsCount={
                        (productConfig.hasContainers || productConfig.hasSizes)
                          ? productConfig.selectedOptions.length + (productConfig.selectedContainer ? 1 : 0) + (productConfig.selectedSize ? 1 : 0)
                          : ((displayProduct?.is_customizable === 1) ? customization.selectedOptions.length : selectedAddons.length)
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* Scroll Down Section - Professional Design */}
      <ScrollDownSection
        title="اكتشف المزيد"
        subtitle="تصفح منتجاتنا المميزة واختر ما يناسبك"
        variant="gradient"
      />

      {/* Filter Bar - Sticky with hide/show animation */}
      <div data-scroll-target></div>
      <AnimatePresence>
        {showFilterBar && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`sticky z-40 ${showHeader ? 'top-[72px]' : 'top-0'}`}
            style={{ transition: 'top 0.3s ease' }}
          >
            <FilterBar />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Products Grid - Related Products */}
      <section className="container mx-auto px-4 pt-8 md:pt-12 pb-0">
        <div className="text-center mb-8 md:mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-3">
              منتجات مشابهة
            </h2>
            <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              اكتشف المزيد من المنتجات التي قد تعجبك
            </p>
            <div className="mt-4 flex justify-center">
              <div className="w-20 h-1 bg-gradient-to-r from-[#FF6B9D] to-[#FF5A8E] rounded-full"></div>
            </div>
          </motion.div>
        </div>

        <ProductsGrid />
      </section>

      {/* Footer */}
      <Footer />

      {/* Modals - Using centralized orchestrator */}
      <ModalOrchestrator allProducts={allProducts} />

      <ToastContainer />
      <OrdersBadge onClick={() => open('myOrders')} />
      <ScrollProgressButton />
    </div>
  )
}

export default function RichProductPage(props: Props) {
  const { allProducts } = props

  return (
    <ProductsProvider initialProducts={allProducts}>
      <CategoryTrackingProvider>
        <RichProductPageContent {...props} allProducts={allProducts} />
      </CategoryTrackingProvider>
    </ProductsProvider>
  )
}


