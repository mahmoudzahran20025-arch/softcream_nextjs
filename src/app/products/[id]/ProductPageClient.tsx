'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import ProductImage from '@/components/modals/ProductModal/ProductImage'
import ProductHeader from '@/components/modals/ProductModal/ProductHeader'
import NutritionInfo from '@/components/modals/ProductModal/NutritionInfo'
import ActionFooter from '@/components/modals/ProductModal/ActionFooter'
import { ProductTemplateRenderer } from '@/components/modals/ProductModal/templates'
import { useProductLogic } from '@/components/modals/ProductModal/useProductLogic'
import { useProductConfiguration } from '@/hooks/useProductConfiguration'
import { useAddToCart } from '@/hooks/useAddToCart'

interface Props {
  product: any
  allProducts: any[]
  language?: 'ar' | 'en'
  onClose?: () => void
}

export default function ProductPageClient({ product, onClose }: Props) {
  const {
    displayProduct,
    quantity,
    setQuantity,
    selectedAddons,
    totalPrice,
    ingredients,
    allergens,
  } = useProductLogic({ product, isOpen: true })

  // ✅ Use unified product configuration (Unified Options System)
  const productConfig = useProductConfiguration({
    productId: product?.id || displayProduct?.id || null,
    isOpen: true
  })

  // Handle close
  const handleClose = () => {
    if (onClose) {
      onClose()
    }
  }

  // ✅ Use unified add to cart hook
  const { handleAddToCart } = useAddToCart({
    product: displayProduct || null,
    quantity,
    productConfig: {
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
    },
    customization: null,
    legacy: {
      selectedAddons,
      totalPrice
    },
    onSuccess: handleClose
  })

  // Prevent body scroll and save scroll position
  useEffect(() => {
    const scrollY = window.scrollY
    sessionStorage.setItem('scrollPosition', scrollY.toString())
    
    document.body.style.overflow = 'hidden'
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px`
    document.body.style.width = '100%'
    
    return () => {
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      
      const savedScrollY = sessionStorage.getItem('scrollPosition')
      if (savedScrollY) {
        window.scrollTo(0, parseInt(savedScrollY))
        sessionStorage.removeItem('scrollPosition')
      }
    }
  }, [])

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
              <NutritionInfo 
                product={displayProduct} 
                ingredients={ingredients} 
                allergens={allergens}
                customizationNutrition={productConfig.totalNutrition}
              />
              {/* ✅ Use unified template system */}
              <ProductTemplateRenderer
                product={displayProduct}
                productConfig={productConfig}
              />
            </div>

            <ActionFooter
              quantity={quantity}
              onIncrease={() => setQuantity(quantity + 1)}
              onDecrease={() => setQuantity(Math.max(1, quantity - 1))}
              onAddToCart={handleAddToCart}
              totalPrice={productConfig.totalPrice * quantity}
              basePrice={productConfig.config?.product.basePrice || displayProduct.price}
              addonsPrice={(productConfig.containerObj?.priceModifier || 0) + (productConfig.sizeObj?.priceModifier || 0) + productConfig.customizationTotal}
              selectedAddonsCount={productConfig.selectedOptions.length + (productConfig.selectedContainer ? 1 : 0) + (productConfig.selectedSize ? 1 : 0)}
              selectedOptions={productConfig.selectedOptions}
              containerName={productConfig.containerObj?.name}
              sizeName={productConfig.sizeObj?.name}
              isValid={productConfig.validationResult.isValid}
              validationMessage={productConfig.validationResult.errors[0]}
            />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
