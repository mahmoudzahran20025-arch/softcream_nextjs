/**
 * Modal Orchestrator - Centralized Modal Management
 * 
 * Handles all app modals in one place to reduce duplication
 * Used by: RichProductPage, HomePage, and any page needing modals
 */

'use client'

import dynamic from 'next/dynamic'
import { useModalStore } from '@/stores/modalStore'
import { debug } from '@/lib/debug'

// Lazy load all modals
const CartModal = dynamic(() => import('@/components/modals/CartModal'), { ssr: false })
const CheckoutModal = dynamic(() => import('@/components/modals/CheckoutModal'), { ssr: false })
const OrderSuccessModal = dynamic(() => import('@/components/modals/OrderSuccessModal'), { ssr: false })
const TrackingModal = dynamic(() => import('@/components/modals/TrackingModal'), { ssr: false })
const Sidebar = dynamic(() => import('@/components/shared/Sidebar'), { ssr: false })
const MyOrdersModal = dynamic(() => import('@/components/modals/MyOrdersModal'), { ssr: false })
const EditOrderModal = dynamic(() => import('@/components/modals/EditOrderModal'), { ssr: false })
const FavoritesModal = dynamic(() => import('@/components/modals/FavoritesModal'), { ssr: false })

interface ModalOrchestratorProps {
  allProducts?: any[]
}

export default function ModalOrchestrator({ allProducts = [] }: ModalOrchestratorProps) {
  const { current, data, open, close } = useModalStore()

  return (
    <>
      {/* Cart Modal */}
      {current === 'cart' && (
        <CartModal
          isOpen={true}
          onClose={close}
          onCheckout={() => open('checkout')}
          allProducts={allProducts}
        />
      )}

      {/* Checkout Modal */}
      {current === 'checkout' && (
        <CheckoutModal
          isOpen={true}
          onClose={close}
          onCheckoutSuccess={(orderId: string, orderData?: any) => {
            debug.checkout('Order placed successfully', orderId)
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
            debug.checkout('WhatsApp contact from success modal')
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

      {/* Sidebar */}
      {current === 'sidebar' && (
        <Sidebar
          isOpen={true}
          onClose={close}
          onOpenCart={() => open('cart')}
          onOpenMyOrders={() => open('myOrders')}
          onOpenFavorites={() => open('favorites')}
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
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('ordersUpdated', {
                detail: { orderId: data?.id, action: 'edited' }
              }))
            }
          }}
        />
      )}
      {/* Favorites Modal */}
      {current === 'favorites' && (
        <FavoritesModal
          isOpen={true}
          onClose={close}
        />
      )}

    </>
  )
}
