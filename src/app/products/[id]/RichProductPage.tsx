'use client'

import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import ProductHeader from '@/components/modals/ProductModal/ProductHeader'
import NutritionInfo from '@/components/modals/ProductModal/NutritionInfo'
import AddonsList from '@/components/modals/ProductModal/AddonsList'
import ActionFooter from '@/components/modals/ProductModal/ActionFooter'
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
  const { addToCart } = useCart()
  const { current, data, open, close } = useModalStore()
  const [showHeader, setShowHeader] = useState(true)
  const [showFilterBar, setShowFilterBar] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
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

  // Scroll behavior: hide/show header and filter bar
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const productHeroHeight = productHeroRef.current?.offsetHeight || 800
      
      // Header behavior: hide/show based on scroll direction
      if (currentScrollY > 100) {
        if (currentScrollY > lastScrollY && currentScrollY > 200) {
          // Scrolling down - hide header
          setShowHeader(false)
        } else {
          // Scrolling up - show header
          setShowHeader(true)
        }
      } else {
        // Always show when near top
        setShowHeader(true)
      }
      
      // Filter bar behavior: hide/show after product hero
      if (currentScrollY > productHeroHeight) {
        if (currentScrollY > lastScrollY) {
          // Scrolling down - hide filter
          setShowFilterBar(false)
        } else {
          // Scrolling up - show filter
          setShowFilterBar(true)
        }
      } else {
        // Always show when in product hero area
        setShowFilterBar(true)
      }
      
      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  const handleAddToCart = () => {
    const addonsToSend = selectedAddons.length > 0 ? selectedAddons : undefined
    addToCart(product, quantity, addonsToSend)
    
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
      {/* Header with hide/show animation - Full Header (same as home page) */}
      <AnimatePresence>
        {showHeader && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-0 left-0 right-0 z-50"
          >
            <Header
              onOpenSidebar={() => open('sidebar')}
              isSidebarOpen={current === 'sidebar'}
              onOpenCart={() => open('cart')}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Product Hero Section */}
      <section 
        ref={productHeroRef}
        className="relative bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 pt-20"
      >

        {/* Product Content */}
        <div className="container mx-auto px-4 pt-8 md:pt-12 pb-0">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-[45%_55%] gap-6 md:gap-8 items-start">
              {/* Product Image with Badges - Responsive Height */}
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
                <NutritionInfo product={displayProduct} ingredients={ingredients} allergens={allergens} />
                <AddonsList 
                  addons={addons} 
                  tags={tags} 
                  selectedAddons={selectedAddons} 
                  onToggleAddon={toggleAddon} 
                  isLoading={isFetchingAddons} 
                />
                
                {/* Action Footer - Inline with proper spacing and responsive sizing */}
                <div className="sticky bottom-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 p-4 md:p-6 rounded-t-2xl shadow-2xl -mx-4 md:-mx-6">
                  <div className="max-w-md mx-auto">
                    <ActionFooter
                      quantity={quantity}
                      onIncrease={() => setQuantity(quantity + 1)}
                      onDecrease={() => setQuantity(Math.max(1, quantity - 1))}
                      onAddToCart={handleAddToCart}
                      totalPrice={totalPrice}
                      basePrice={displayProduct.price}
                      addonsPrice={addonsTotal}
                      selectedAddonsCount={selectedAddons.length}
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


