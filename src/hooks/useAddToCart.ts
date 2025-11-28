/**
 * useAddToCart Hook
 * 
 * Unified add-to-cart logic for all product types:
 * - BYO products (containers + sizes + customizations)
 * - Preset products (sizes only)
 * - Legacy products (simple addons)
 * 
 * Used by: ProductModal, RichProductPage, ProductPageClient
 */

import { useCallback } from 'react'
import { useCart } from '@/providers/CartProvider'
import { useToast } from '@/providers/ToastProvider'
import { debug } from '@/lib/debug'
import type { Product } from '@/lib/api'

// Types for the different configuration states
interface ProductConfigState {
  hasContainers: boolean
  hasSizes: boolean
  hasCustomization: boolean
  selectedContainer: string | null
  selectedSize: string | null
  containerObj: { name: string; priceModifier: number } | null
  sizeObj: { name: string; priceModifier: number } | null
  selections: Record<string, string[]>
  totalPrice: number
  validationResult: { isValid: boolean; errors: string[] }
}

interface CustomizationState {
  isCustomizable: boolean
  selections: Record<string, string[]>
  selectedOptions: Array<{ id: string; groupId: string }>
  totalPrice: number
  validationResult: { isValid: boolean; errors: string[] }
}

interface LegacyState {
  selectedAddons: string[]
  totalPrice: number
}

interface UseAddToCartParams {
  product: Product | null
  quantity: number
  productConfig?: ProductConfigState | null
  customization?: CustomizationState | null
  legacy?: LegacyState | null
  onSuccess?: () => void
}

interface UseAddToCartReturn {
  handleAddToCart: () => boolean
  canAdd: boolean
  validationErrors: string[]
}

export function useAddToCart({
  product,
  quantity,
  productConfig,
  customization,
  legacy,
  onSuccess
}: UseAddToCartParams): UseAddToCartReturn {
  const { addToCart } = useCart()
  const { showToast } = useToast()

  // Determine which flow to use and validation state
  const getFlowInfo = useCallback(() => {
    // Flow 1: BYO / Products with containers or sizes
    if (productConfig?.hasContainers || productConfig?.hasSizes) {
      return {
        flow: 'config' as const,
        isValid: !productConfig.hasCustomization || productConfig.validationResult.isValid,
        errors: productConfig.validationResult.errors
      }
    }

    // Flow 2: Customizable products (without containers/sizes)
    if (customization?.isCustomizable) {
      return {
        flow: 'customization' as const,
        isValid: customization.validationResult.isValid,
        errors: customization.validationResult.errors
      }
    }

    // Flow 3: Legacy products
    return {
      flow: 'legacy' as const,
      isValid: true,
      errors: []
    }
  }, [productConfig, customization])

  const flowInfo = getFlowInfo()

  const handleAddToCart = useCallback((): boolean => {
    if (!product) {
      debug.cart('No product to add')
      return false
    }

    debug.cart('Adding to cart', {
      productId: product.id,
      productName: product.name,
      flow: flowInfo.flow,
      quantity
    })

    // Validate before adding
    if (!flowInfo.isValid) {
      const errorMessage = flowInfo.errors[0] || 'يرجى إكمال الاختيارات المطلوبة'
      showToast({
        type: 'error',
        title: 'تنبيه',
        message: errorMessage
      })
      debug.cart('Validation failed', flowInfo.errors)
      return false
    }

    // Build cart item based on flow
    switch (flowInfo.flow) {
      case 'config': {
        // BYO / Config-based products
        const selectionsWithConfig: Record<string, string[]> = {
          ...productConfig!.selections
        }

        // Add container info
        if (productConfig!.selectedContainer && productConfig!.containerObj) {
          selectionsWithConfig['_container'] = [
            productConfig!.selectedContainer,
            productConfig!.containerObj.name,
            String(productConfig!.containerObj.priceModifier || 0)
          ]
        }

        // Add size info
        if (productConfig!.selectedSize && productConfig!.sizeObj) {
          selectionsWithConfig['_size'] = [
            productConfig!.selectedSize,
            productConfig!.sizeObj.name,
            String(productConfig!.sizeObj.priceModifier || 0)
          ]
        }

        // Store calculated price
        selectionsWithConfig['_calculatedPrice'] = [String(productConfig!.totalPrice)]

        debug.cart('Config flow - selections', selectionsWithConfig)
        addToCart(product, quantity, undefined, selectionsWithConfig)
        break
      }

      case 'customization': {
        // Customizable products (convert selectedOptions to selections format)
        const selections: Record<string, string[]> = {}
        customization!.selectedOptions.forEach(option => {
          if (!selections[option.groupId]) {
            selections[option.groupId] = []
          }
          selections[option.groupId].push(option.id)
        })

        debug.cart('Customization flow - selections', selections)
        addToCart(product, quantity, undefined, selections)
        break
      }

      case 'legacy': {
        // Legacy products with simple addons
        const addonsToSend = legacy?.selectedAddons?.length ? legacy.selectedAddons : undefined
        debug.cart('Legacy flow - addons', addonsToSend)
        addToCart(product, quantity, addonsToSend)
        break
      }
    }

    // Success feedback
    showToast({
      type: 'success',
      title: 'تم الإضافة',
      message: `تم إضافة ${product.name} للسلة`
    })

    // Call success callback
    onSuccess?.()

    return true
  }, [product, quantity, flowInfo, productConfig, customization, legacy, addToCart, showToast, onSuccess])

  return {
    handleAddToCart,
    canAdd: !!product && flowInfo.isValid,
    validationErrors: flowInfo.errors
  }
}

export default useAddToCart
