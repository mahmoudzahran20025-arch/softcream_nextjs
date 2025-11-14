'use client'

import { useState } from 'react'
import Header from '@/components/client/Header'
import ProductModal from '@/components/client/ProductModal'
import CartModal from '@/components/client/CartModal'
import FilterBar from '@/components/client/FilterBar'
import MarqueeSwiper from '@/components/client/MarqueeSwiper'
import TrustBanner from '@/components/client/TrustBanner'
import CheckoutModal from '@/components/client/CheckoutModal'
import TrackingModal from '@/components/client/TrackingModal'
import Sidebar from '@/components/client/Sidebar'
import NutritionSummary from '@/components/client/NutritionSummary'

interface Product {
  id: string
  name: string
  nameEn?: string
  price: number
  image?: string
  category?: string
  description?: string
  tags?: string
  ingredients?: string
  allergens?: string
  calories?: number
  protein?: number
  carbs?: number
  sugar?: number
  fat?: number
  fiber?: number
  energy_type?: string
  energy_score?: number
  badge?: string
}

interface PageContentClientProps {
  initialProducts: Product[]
}

export default function PageContentClient({ initialProducts }: PageContentClientProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showProductModal, setShowProductModal] = useState(false)
  const [showCartModal, setShowCartModal] = useState(false)
  const [showCheckout, setShowCheckout] = useState(false)
  const [showTracking, setShowTracking] = useState(false)
  const [showNutrition, setShowNutrition] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [cartTotal] = useState(0)
  const [selectedOrder] = useState<any>(null)

  const handleCloseProductModal = () => {
    setShowProductModal(false)
    setSelectedProduct(null)
  }

  const handleCheckout = () => {
    setShowCartModal(false)
    setShowCheckout(true)
  }

  return (
    <>
      <Header />

      {/* Marquee Swiper */}
      <MarqueeSwiper />

      {/* Trust Banner */}
      <TrustBanner />

      {/* Filter Bar */}
      <FilterBar />

      {/* Product Modal */}
      <ProductModal
        product={selectedProduct}
        isOpen={showProductModal}
        onClose={handleCloseProductModal}
        allProducts={initialProducts}
      />

      {/* Cart Modal */}
      <CartModal
        isOpen={showCartModal}
        onClose={() => setShowCartModal(false)}
        onCheckout={handleCheckout}
        allProducts={initialProducts}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        onSuccess={(orderId: string) => {
          console.log('Order placed:', orderId)
          setShowCheckout(false)
        }}
        total={cartTotal}
      />

      {/* Tracking Modal */}
      <TrackingModal
        isOpen={showTracking}
        onClose={() => setShowTracking(false)}
        order={selectedOrder}
      />

      {/* Nutrition Summary */}
      <NutritionSummary
        isOpen={showNutrition}
        onClose={() => setShowNutrition(false)}
        onCheckout={() => {
          setShowNutrition(false)
          setShowCheckout(true)
        }}
      />

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
    </>
  )
}
