'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import ProductImage from '@/components/modals/ProductModal/ProductImage'
import ProductHeader from '@/components/modals/ProductModal/ProductHeader'
import NutritionInfo from '@/components/modals/ProductModal/NutritionInfo'
import AddonsList from '@/components/modals/ProductModal/AddonsList'
import ActionFooter from '@/components/modals/ProductModal/ActionFooter'
import { useProductLogic } from '@/components/modals/ProductModal/useProductLogic'
import { useCart } from '@/providers/CartProvider'

interface Props {
  product: any
  allProducts: any[]
  language?: 'ar' | 'en'
  onClose?: () => void
}

export default function ProductPageClient({ product, onClose }: Props) {
  const { addToCart } = useCart()

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

  // Prevent body scroll and save scroll position
  useEffect(() => {
    // Save current scroll position
    const scrollY = window.scrollY
    sessionStorage.setItem('scrollPosition', scrollY.toString())
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden'
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px`
    document.body.style.width = '100%'
    
    return () => {
      // Restore body scroll
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      
      // Restore scroll position instantly
      const savedScrollY = sessionStorage.getItem('scrollPosition')
      if (savedScrollY) {
        window.scrollTo(0, parseInt(savedScrollY))
        sessionStorage.removeItem('scrollPosition')
      }
    }
  }, [])

  const handleAddToCart = () => {
    const addonsToSend = selectedAddons.length > 0 ? selectedAddons : undefined
    addToCart(product, quantity, addonsToSend)
    
    // Show success feedback with brand colors
    const successDiv = document.createElement('div')
    successDiv.className = 'fixed top-4 left-1/2 -translate-x-1/2 z-[60] bg-gradient-to-r from-[#ff6b9d] to-[#ff5a8e] text-white px-6 py-3 rounded-full shadow-2xl font-semibold animate-bounce'
    successDiv.textContent = '✓ تم الإضافة للسلة'
    document.body.appendChild(successDiv)
    
    setTimeout(() => {
      successDiv.remove()
      if (onClose) {
        onClose()
      }
    }, 800)
  }

  if (!displayProduct) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/40 backdrop-blur-sm"
      >
        <motion.div
          initial={{ y: 100, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 100, opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative bg-white dark:bg-slate-900 w-full max-w-5xl rounded-t-[2rem] md:rounded-3xl max-h-[92vh] overflow-hidden shadow-2xl flex flex-col md:flex-row"
        >
          {onClose ? (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 md:left-4 md:right-auto z-20 w-11 h-11 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-full shadow-xl flex items-center justify-center hover:bg-white dark:hover:bg-slate-700 transition-all hover:scale-110 active:scale-95"
            >
              <X className="w-5 h-5 text-slate-700 dark:text-slate-200" />
            </button>
          ) : (
            <Link
              href="/"
              scroll={false}
              replace
              className="absolute top-4 right-4 md:left-4 md:right-auto z-20 w-11 h-11 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-full shadow-xl flex items-center justify-center hover:bg-white dark:hover:bg-slate-700 transition-all hover:scale-110 active:scale-95"
            >
              <X className="w-5 h-5 text-slate-700 dark:text-slate-200" />
            </Link>
          )}

          <ProductImage product={displayProduct} />

          <div className="flex-1 flex flex-col md:w-1/2 overflow-hidden relative z-10 -mt-16 md:mt-0 rounded-t-[2.5rem] md:rounded-none bg-white dark:bg-slate-900 shadow-2xl md:shadow-none">
            <div className="w-full flex justify-center pt-3 pb-2 md:hidden">
              <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full" />
            </div>
            
            <div className="flex-1 overflow-y-auto px-6 md:px-8 pt-2 md:pt-8 pb-24 space-y-4 scrollbar-thin scrollbar-thumb-pink-300 dark:scrollbar-thumb-pink-700 scrollbar-track-transparent">
              <ProductHeader product={displayProduct} />
              <NutritionInfo product={displayProduct} ingredients={ingredients} allergens={allergens} />
              <AddonsList addons={addons} tags={tags} selectedAddons={selectedAddons} onToggleAddon={toggleAddon} isLoading={isFetchingAddons} />
            </div>

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
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
