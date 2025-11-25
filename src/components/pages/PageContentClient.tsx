// ================================================================
// PageContentClient.tsx - REFACTORED with ModalStore
// ================================================================
// BEFORE: 300+ lines with 15+ useState hooks
// AFTER: ~180 lines with single Zustand store
// Benefits: Better performance, easier debugging, modal history

'use client'

import { type ReactNode } from 'react'
import dynamic from 'next/dynamic'
import { useProductsData } from '@/providers/ProductsProvider'
import { useModalStore } from '@/stores/modalStore'
import { useWindowEvent } from '@/hooks/useWindowEvent'
import Header from '@/components/ui/Header'
import FilterBar from '@/components/pages/Home/FilterBar'
import TrustBanner from '@/components/ui/TrustBanner'
import ToastContainer from '@/components/ui/ToastContainer'

// ✅ Lazy load heavy components - only load when needed
const ProductModal = dynamic(() => import('@/components/modals/ProductModal'), {
  ssr: false,
  loading: () => null,
})

const CartModal = dynamic(() => import('@/components/modals/CartModal'), {
  ssr: false,
  loading: () => null,
})

const CheckoutModal = dynamic(() => import('@/components/modals/CheckoutModal'), {
  ssr: false,
  loading: () => null,
})

const TrackingModal = dynamic(() => import('@/components/modals/TrackingModal'), {
  ssr: false,
  loading: () => null,
})

const NutritionSummary = dynamic(() => import('@/components/ui/NutritionSummary'), {
  ssr: false,
  loading: () => null,
})

const Sidebar = dynamic(() => import('@/components/pages/Sidebar'), {
  ssr: false,
  loading: () => null,
})

const MyOrdersModal = dynamic(() => import('@/components/modals/MyOrdersModal'), {
  ssr: false,
  loading: () => null,
})

const EditOrderModal = dynamic(() => import('@/components/modals/EditOrderModal'), {
  ssr: false,
  loading: () => null,
})

const OrdersBadge = dynamic(() => import('@/components/ui/OrdersBadge'), {
  ssr: false,
  loading: () => null,
})

const OrderSuccessModal = dynamic(() => import('@/components/modals/OrderSuccessModal'), {
  ssr: false,
  loading: () => null,
})

const MarqueeSwiper = dynamic(() => import('@/components/ui/MarqueeSwiper'), {
  ssr: false,
  loading: () => <div className="h-16 bg-slate-100 dark:bg-slate-800 animate-pulse" />,
})

interface PageContentClientProps {
  children?: ReactNode
}

export default function PageContentClient({ children }: PageContentClientProps) {
  const { products, selectedProduct, closeProduct } = useProductsData()
  
  // ✅ SIMPLIFIED: Single store instead of 15+ useState hooks
  const { current, data, open, close } = useModalStore()

  // ✅ Listen for open-my-orders-modal event (backward compatibility)
  useWindowEvent('open-my-orders-modal', () => {
    open('myOrders')
  }, [open])

  // ✅ Listen for openTrackingModal event
  useWindowEvent<{ order: any }>('openTrackingModal', (event) => {
    const { order } = event.detail || {}
    if (order) {
      console.log('📍 Opening TrackingModal for order:', order.id)
      open('tracking', order)
    }
  }, [open])

  // ✅ Listen for order status updates
  useWindowEvent<{ orderId: string; status: string }>('orderStatusUpdate', async (event) => {
    const { orderId, status } = event.detail || {}
    if (!orderId || !status) return

    console.log('🔄 Order status update received:', { orderId, status })

    const { storage } = await import('@/lib/storage.client')
    storage.updateOrderStatus(orderId, status)

    window.dispatchEvent(new CustomEvent('ordersUpdated', {
      detail: { orderId, status, source: 'backend' }
    }))
  }, [])

  return (
    <>
      <Header
        onOpenSidebar={() => open('sidebar')}
        isSidebarOpen={current === 'sidebar'}
        onOpenCart={() => open('cart')}
      />

      {children}

      <MarqueeSwiper />
      <TrustBanner />
      <FilterBar />

      {/* Product Modal */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          isOpen={!!selectedProduct}
          onClose={closeProduct}
          allProducts={products}
        />
      )}

      {/* Cart Modal */}
      {current === 'cart' && (
        <CartModal
          isOpen={true}
          onClose={close}
          onCheckout={() => open('checkout')}
          allProducts={products}
        />
      )}

      {/* Checkout Modal */}
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

      {/* Order Success Modal */}
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

      {/* Tracking Modal */}
      {current === 'tracking' && data && (
        <TrackingModal
          isOpen={true}
          onClose={close}
          order={data}
          onEditOrder={(order) => open('editOrder', order)}
        />
      )}

      {/* Nutrition Summary */}
      {current === 'nutrition' && (
        <NutritionSummary
          isOpen={true}
          onClose={close}
          onCheckout={() => open('checkout')}
        />
      )}

      {/* Sidebar */}
      {current === 'sidebar' && (
        <Sidebar
          isOpen={true}
          onClose={close}
          onOpenCart={() => open('cart')}
          onOpenMyOrders={() => open('myOrders')}
        />
      )}

      {/* My Orders Modal */}
      {current === 'myOrders' && (
        <MyOrdersModal
          isOpen={true}
          onClose={close}
          onEditOrder={(order) => open('editOrder', order)}
        />
      )}

      {/* Edit Order Modal */}
      {current === 'editOrder' && data && (
        <EditOrderModal
          isOpen={true}
          onClose={close}
          order={data}
          onSuccess={() => {
            close()
            // Reload orders
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
    </>
  )
}

console.log('✅ PageContentClient refactored with ModalStore')
