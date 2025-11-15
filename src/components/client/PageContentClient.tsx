'use client'

import { useState, useEffect, type ReactNode } from 'react'
import dynamic from 'next/dynamic'
import { useProductsData } from '@/providers/ProductsProvider'
import Header from '@/components/client/Header'
import FilterBar from '@/components/client/FilterBar'
import TrustBanner from '@/components/client/TrustBanner'
import ToastContainer from '@/components/client/ToastContainer'

// ✅ Lazy load heavy components - only load when needed
// Modals are loaded on-demand to reduce initial bundle size
const ProductModal = dynamic(() => import('@/components/client/ProductModal'), {
  ssr: false,
  loading: () => null, // Don't show loading state for modals
})

const CartModal = dynamic(() => import('@/components/client/CartModal'), {
  ssr: false,
  loading: () => null,
})

const CheckoutModal = dynamic(() => import('@/components/client/CheckoutModal'), {
  ssr: false,
  loading: () => null,
})

const TrackingModal = dynamic(() => import('@/components/client/TrackingModal'), {
  ssr: false,
  loading: () => null,
})

const NutritionSummary = dynamic(() => import('@/components/client/NutritionSummary'), {
  ssr: false,
  loading: () => null,
})

const Sidebar = dynamic(() => import('@/components/client/Sidebar'), {
  ssr: false,
  loading: () => null,
})

const MyOrdersModal = dynamic(() => import('@/components/client/MyOrdersModal'), {
  ssr: false,
  loading: () => null,
})

const EditOrderModal = dynamic(() => import('@/components/client/EditOrderModal'), {
  ssr: false,
  loading: () => null,
})

const OrdersBadge = dynamic(() => import('@/components/client/OrdersBadge'), {
  ssr: false,
  loading: () => null,
})

const OrderSuccessModal = dynamic(() => import('@/components/client/OrderSuccessModal'), {
  ssr: false,
  loading: () => null,
})

// ✅ Lazy load Swiper component (heavy library ~50KB) - deferred until client hydration
const MarqueeSwiper = dynamic(() => import('@/components/client/MarqueeSwiper'), {
  ssr: false,
  loading: () => <div className="h-16 bg-slate-100 dark:bg-slate-800 animate-pulse" />,
})

interface PageContentClientProps {
  children?: ReactNode
}

export default function PageContentClient({ children }: PageContentClientProps) {
  const { products, selectedProduct, closeProduct } = useProductsData()
  const [showCartModal, setShowCartModal] = useState(false)
  const [showCheckout, setShowCheckout] = useState(false)
  const [showTracking, setShowTracking] = useState(false)
  const [showNutrition, setShowNutrition] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showMyOrders, setShowMyOrders] = useState(false)
  const [showEditOrder, setShowEditOrder] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [orderToEdit, setOrderToEdit] = useState<any>(null)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successOrder, setSuccessOrder] = useState<any>(null)

  // Listen for open-my-orders-modal event
  useEffect(() => {
    const handleOpenMyOrders = () => {
      setShowMyOrders(true)
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('open-my-orders-modal', handleOpenMyOrders)
      return () => {
        window.removeEventListener('open-my-orders-modal', handleOpenMyOrders)
      }
    }
  }, [])

  // ✅ Listen for order status updates from backend (via polling or webhook)
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleOrderStatusUpdate = async (event: any) => {
      const { orderId, status } = event.detail || {}
      if (!orderId || !status) return

      console.log('🔄 Order status update received:', { orderId, status })

      // Update local storage
      const { storage } = await import('@/lib/storage.client')
      storage.updateOrderStatus(orderId, status)

      // Trigger ordersUpdated event to update UI
      window.dispatchEvent(new CustomEvent('ordersUpdated', {
        detail: { orderId, status, source: 'backend' }
      }))
    }

    window.addEventListener('orderStatusUpdate', handleOrderStatusUpdate as EventListener)
    return () => {
      window.removeEventListener('orderStatusUpdate', handleOrderStatusUpdate as EventListener)
    }
  }, [])

  const handleCloseProductModal = () => {
    closeProduct()
  }

  const handleCheckout = () => {
    setShowCartModal(false)
    setShowCheckout(true)
  }

  return (
    <>
      <Header
        onOpenSidebar={() => setSidebarOpen(true)}
        isSidebarOpen={sidebarOpen}
        onOpenCart={() => setShowCartModal(true)}
      />

      {children}

      {/* Marquee Swiper */}
      <MarqueeSwiper />

      {/* Trust Banner */}
      <TrustBanner />

      {/* Filter Bar */}
      <FilterBar />

      {/* Product Modal - Lazy loaded */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          isOpen={!!selectedProduct}
          onClose={handleCloseProductModal}
          allProducts={products}
        />
      )}

      {/* Cart Modal - Lazy loaded */}
      {showCartModal && (
        <CartModal
          isOpen={showCartModal}
          onClose={() => setShowCartModal(false)}
          onCheckout={handleCheckout}
          allProducts={products}
        />
      )}

      {/* Checkout Modal - Lazy loaded */}
      {showCheckout && (
        <CheckoutModal
          isOpen={showCheckout}
          onClose={() => setShowCheckout(false)}
          onCheckoutSuccess={(orderId: string, orderData?: any) => {
            console.log('🎉 Order placed successfully:', orderId, orderData)
            setShowCheckout(false)
            // Show success modal with order data
            if (orderData) {
              console.log('✅ Setting success order data:', orderData)
              setSuccessOrder(orderData)
              setShowSuccessModal(true)
            }
          }}
          onOpenTracking={(order) => {
            setSelectedOrder(order)
            setShowTracking(true)
          }}
        />
      )}

      {/* Order Success Modal - Managed independently in PageContentClient */}
      {successOrder && (
        <OrderSuccessModal
          isOpen={showSuccessModal}
          onClose={() => {
            console.log('🚪 Closing success modal')
            setShowSuccessModal(false)
            setSuccessOrder(null)
          }}
          order={successOrder}
          onTrackOrder={() => {
            console.log('📍 Opening tracking modal from success modal')
            setShowSuccessModal(false)
            setSelectedOrder(successOrder)
            setSuccessOrder(null)
            setShowTracking(true)
          }}
          onContactWhatsApp={() => {
            console.log('📱 WhatsApp contact from success modal')
          }}
        />
      )}

      {/* Tracking Modal - Lazy loaded */}
      {showTracking && (
        <TrackingModal
          isOpen={showTracking}
          onClose={() => setShowTracking(false)}
          order={selectedOrder}
          onEditOrder={(order) => {
            setOrderToEdit(order)
            setShowEditOrder(true)
          }}
        />
      )}

      {/* Nutrition Summary - Lazy loaded */}
      {showNutrition && (
        <NutritionSummary
          isOpen={showNutrition}
          onClose={() => setShowNutrition(false)}
          onCheckout={() => {
            setShowNutrition(false)
            setShowCheckout(true)
          }}
        />
      )}

      {/* Sidebar - Lazy loaded */}
      {sidebarOpen && (
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onOpenCart={() => {
            setSidebarOpen(false)
            setShowCartModal(true)
          }}
          onOpenMyOrders={() => {
            setSidebarOpen(false)
            setShowMyOrders(true)
          }}
        />
      )}

      {/* My Orders Modal - Lazy loaded */}
      {showMyOrders && (
        <MyOrdersModal
          isOpen={showMyOrders}
          onClose={() => setShowMyOrders(false)}
          onEditOrder={(order) => {
            setOrderToEdit(order)
            setShowEditOrder(true)
          }}
        />
      )}

      {/* Edit Order Modal - Lazy loaded */}
      {showEditOrder && orderToEdit && (
        <EditOrderModal
          isOpen={showEditOrder}
          onClose={() => {
            setShowEditOrder(false)
            setOrderToEdit(null)
          }}
          order={orderToEdit}
          onSuccess={() => {
            setShowEditOrder(false)
            setOrderToEdit(null)
            // Reload orders in MyOrdersModal
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('ordersUpdated', {
                detail: { orderId: orderToEdit?.id, action: 'edited' }
              }))
            }
          }}
        />
      )}

      {/* Toast Container */}
      <ToastContainer />

      {/* Orders Badge - Floating Button */}
      <OrdersBadge onClick={() => setShowMyOrders(true)} />
    </>
  )
}
