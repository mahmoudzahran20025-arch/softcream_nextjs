'use client'

import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import ProductHeader from '@/components/modals/ProductModal/ProductHeader'
import NutritionInfo from '@/components/modals/ProductModal/NutritionInfo'
import AddonsList from '@/components/modals/ProductModal/AddonsList'
import ActionFooter from '@/components/modals/ProductModal/ActionFooter'
import { useCustomization } from '@/components/modals/ProductModal/useCustomization'
import { useProductConfiguration } from '@/hooks/useProductConfiguration'
import { ProductTemplateRenderer } from '@/components/modals/ProductModal/templates'

import { useProductLogic } from '@/components/modals/ProductModal/useProductLogic'
import { useCart } from '@/providers/CartProvider'
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

// Lazy load modals
const CartModal = dynamic(() => import('@/components/modals/CartModal'), { ssr: false })
const CheckoutModal = dynamic(() => import('@/components/modals/CheckoutModal'), { ssr: false })
const OrderSuccessModal = dynamic(() => import('@/components/modals/OrderSuccessModal'), { ssr: false })
const TrackingModal = dynamic(() => import('@/components/modals/TrackingModal'), { ssr: false })
const Sidebar = dynamic(() => import('@/components/pages/Sidebar'), { ssr: false })
const MyOrdersModal = dynamic(() => import('@/components/modals/MyOrdersModal'), { ssr: false })
const EditOrderModal = dynamic(() => import('@/components/modals/EditOrderModal'), { ssr: false })
const OrdersBadge = dynamic(() => import('@/components/ui/OrdersBadge'), { ssr: false })

interface Props {
  product: any
  allProducts: any[]
  language?: 'ar' | 'en'
}

function RichProductPageContent({ product, allProducts }: Props) {
  console.log('🎬 RichProductPage Render:', {
    productId: product?.id,
    isCustomizable: product?.is_customizable
  })

  const { addToCart } = useCart()
  const { current, data, open, close } = useModalStore()
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
  // ⚠️ IMPORTANT: Use displayProduct first because it has the full data including is_customizable
  const customization = useCustomization({
    productId: displayProduct?.id || product?.id || null,
    isOpen: true,
    basePrice: displayProduct?.price || product?.price || 0
  })

  // ✅ NEW: Use product configuration hook for sizes & containers
  const productConfig = useProductConfiguration({
    productId: displayProduct?.id || product?.id || null,
    isOpen: true
  })

  // Debug: Log customization state
  useEffect(() => {
    console.log('🔍 RichProductPage Customization State:', {
      productId: product?.id,
      displayProductId: displayProduct?.id,
      isCustomizable: displayProduct?.is_customizable,
      hasRules: customization.customizationRules.length > 0,
      isLoading: customization.isLoadingRules
    })
  }, [product?.id, displayProduct?.id, displayProduct?.is_customizable, customization.customizationRules, customization.isLoadingRules])

  // ... scroll behavior ...

  const handleAddToCart = () => {
    // ✅ NEW: Handle products with containers/sizes
    if (productConfig.hasContainers || productConfig.hasSizes) {
      // Validate customization if applicable
      if (productConfig.hasCustomization && !productConfig.validationResult.isValid) {
        alert(productConfig.validationResult.errors.join('\n'))
        return
      }
      
      // Build selections with container and size info
      const selectionsWithConfig: Record<string, string[]> = {
        ...productConfig.selections
      }
      
      // Add container and size as special selection groups (with prices for cart calculation)
      if (productConfig.selectedContainer) {
        selectionsWithConfig['_container'] = [
          productConfig.selectedContainer, 
          productConfig.containerObj?.name || '',
          String(productConfig.containerObj?.priceModifier || 0) // ✅ Include price
        ]
      }
      if (productConfig.selectedSize) {
        selectionsWithConfig['_size'] = [
          productConfig.selectedSize, 
          productConfig.sizeObj?.name || '',
          String(productConfig.sizeObj?.priceModifier || 0) // ✅ Include price
        ]
      }
      
      // ✅ Store total calculated price for cart display
      selectionsWithConfig['_calculatedPrice'] = [String(productConfig.totalPrice)]
      
      console.log('🛒 Adding product with config to cart:', { selectionsWithConfig, totalPrice: productConfig.totalPrice })
      addToCart(product, quantity, undefined, selectionsWithConfig)
      showSuccessFeedback()
      return
    }
    
    if (displayProduct?.is_customizable === 1) {
      // For customizable products: convert selectedOptions to selections format
      const selections: Record<string, string[]> = {}
      customization.selectedOptions.forEach(option => {
        if (!selections[option.groupId]) {
          selections[option.groupId] = []
        }
        selections[option.groupId].push(option.id)
      })
      
      console.log('🛒 Adding customizable product to cart:', { selections })
      addToCart(product, quantity, undefined, selections)
    } else {
      // For legacy products: send addon IDs
      const legacyAddons = selectedAddons.length > 0 ? selectedAddons : undefined
      console.log('🛒 Adding legacy product to cart:', { legacyAddons })
      addToCart(product, quantity, legacyAddons, undefined)
    }

    showSuccessFeedback()
  }

  const showSuccessFeedback = () => {
    // Show success feedback
    const successDiv = document.createElement('div')
    successDiv.className = 'fixed top-4 left-1/2 -translate-x-1/2 z-[60] bg-gradient-to-r from-[#ff6b9d] to-[#ff5a8e] text-white px-6 py-3 rounded-full shadow-2xl font-semibold animate-bounce'
    successDiv.textContent = '✓ تم الإضافة للسلة'
    document.body.appendChild(successDiv)

    setTimeout(() => {
      successDiv.remove()
    }, 1500)
  }

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
        className="relative bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 pt-20"
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
                <ProductHeader product={displayProduct} />
                {/* ✅ NOW WITH DYNAMIC NUTRITION! */}
                <NutritionInfo 
                  product={displayProduct} 
                  ingredients={ingredients} 
                  allergens={allergens}
                  customizationNutrition={productConfig.hasContainers ? productConfig.totalNutrition : customization.customizationNutrition}
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

      {/* Modals - Full Integration */}
      {current === 'cart' && (
        <CartModal
          isOpen={true}
          onClose={close}
          onCheckout={() => open('checkout')}
          allProducts={allProducts}
        />
      )}

      {current === 'checkout' && (
        <CheckoutModal
          isOpen={true}
          onClose={close}
          onCheckoutSuccess={(orderId: string, orderData?: any) => {
            console.log('🎉 Order placed successfully:', orderId)
            if (orderData) {
              open('success', orderData)
            }
          }}
          onOpenTracking={(order) => open('tracking', order)}
        />
      )}

      {current === 'success' && data && (
        <OrderSuccessModal
          isOpen={true}
          onClose={close}
          order={data}
          onTrackOrder={() => open('tracking', data)}
          onContactWhatsApp={() => {
            console.log('📱 WhatsApp contact from success modal')
          }}
        />
      )}

      {current === 'tracking' && data && (
        <TrackingModal
          isOpen={true}
          onClose={close}
          order={data}
          onEditOrder={(order) => open('editOrder', order)}
        />
      )}

      {current === 'sidebar' && (
        <Sidebar
          isOpen={true}
          onClose={close}
          onOpenCart={() => open('cart')}
          onOpenMyOrders={() => open('myOrders')}
        />
      )}

      {current === 'myOrders' && (
        <MyOrdersModal
          isOpen={true}
          onClose={close}
          onEditOrder={(order) => open('editOrder', order)}
        />
      )}

      {current === 'editOrder' && data && (
        <EditOrderModal
          isOpen={true}
          onClose={close}
          order={data}
          onSuccess={() => {
            close()
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('ordersUpdated', {
                detail: { orderId: data?.id, action: 'edited' }
              }))
            }
          }}
        />
      )}

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


