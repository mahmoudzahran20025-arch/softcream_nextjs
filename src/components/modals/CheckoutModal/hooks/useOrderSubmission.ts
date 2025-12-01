// ================================================================
// useOrderSubmission Hook - Order Submission Logic
// ================================================================

'use client'

import { useState, useCallback } from 'react'
import { useCart } from '@/providers/CartProvider'
import { useProductsData } from '@/providers/ProductsProvider'
import { useToast } from '@/providers/ToastProvider'
import { useLanguage } from '@/providers/LanguageProvider'
import { submitOrder } from '@/lib/api'
import { storage } from '@/lib/storage.client'

interface OrderSubmissionProps {
  onClose: () => void
  onCheckoutSuccess?: (orderId: string, orderData?: any) => void
}

interface SubmitOrderParams {
  formData: {
    name: string
    phone: string
    address: string
    notes: string
    couponCode: string
  }
  deliveryMethod: 'pickup' | 'delivery' | null
  selectedBranch: string | null
  userLocation: { lat: number; lng: number; accuracy: number } | null
  couponStatus: 'valid' | 'error' | null
  prices: any
  branches: any[]
  rememberMe: boolean
}

export const useOrderSubmission = ({ onClose, onCheckoutSuccess }: OrderSubmissionProps) => {
  const { cart, clearCart } = useCart()
  const { productsMap } = useProductsData()
  const { showToast } = useToast()
  const { language } = useLanguage()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const getAddressInputType = (
    deliveryMethod: 'pickup' | 'delivery' | null,
    userLocation: any,
    address: string
  ) => {
    if (deliveryMethod !== 'delivery') return null
    if (userLocation?.lat && userLocation?.lng) return 'gps'
    if (address.trim()) return 'manual'
    return null
  }

  const handleSubmitOrder = useCallback(async (params: SubmitOrderParams) => {
    const {
      formData,
      deliveryMethod,
      selectedBranch,
      userLocation,
      couponStatus,
      prices,
      branches,
      rememberMe
    } = params

    if (!deliveryMethod) return

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const addressInputType = getAddressInputType(deliveryMethod, userLocation, formData.address)

      const orderData = {
        items: cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          selectedAddons: item.selectedAddons,
          selections: item.selections
        })),
        customer: {
          name: formData.name.trim(),
          phone: formData.phone.replace(/\D/g, ''),
          ...(deliveryMethod === 'delivery' && { address: formData.address.trim() }),
          ...(formData.notes && { notes: formData.notes.trim() })
        },
        customerPhone: formData.phone.replace(/\D/g, ''),
        deliveryMethod,
        ...(deliveryMethod === 'pickup' && { branch: selectedBranch }),
        ...(userLocation && { location: userLocation }),
        ...(addressInputType && { addressInputType }),
        ...(formData.address.trim() && deliveryMethod === 'delivery' && { 
          deliveryAddress: formData.address.trim() 
        }),
        ...(formData.couponCode && couponStatus === 'valid' && { 
          couponCode: formData.couponCode.trim() 
        })
      }

      console.log('📤 Submitting order:', orderData)
      
      const result = await submitOrder(orderData as any)
      
      console.log('✅ Order submitted successfully:', result)
      
      const serverOrderData = result.data || result
      const serverPrices = serverOrderData.calculatedPrices || prices
      const orderId = serverOrderData.orderId || serverOrderData.id || result.orderId || result.id
      const serverStatus = serverOrderData.status || 'pending'
      const eta = serverOrderData.eta || serverOrderData.etaAr || (language === 'ar' ? '30-45 دقيقة' : '30-45 minutes')
      
      const selectedBranchData = branches.find((b: any) => b.id === selectedBranch || b.name === selectedBranch)
      const branchPhone = selectedBranchData?.phone || selectedBranchData?.whatsapp || null
      const branchName = selectedBranchData?.name || selectedBranch || null
      const branchAddress = selectedBranchData?.address || null
      const branchLocation = selectedBranchData?.location || 
        (selectedBranchData?.location_lat && selectedBranchData?.location_lng 
          ? { lat: selectedBranchData.location_lat, lng: selectedBranchData.location_lng }
          : null)
      const branchGoogleMapsUrl = selectedBranchData?.googleMapsUrl || null
      const branchWhatsApp = selectedBranchData?.whatsapp || selectedBranchData?.phone || null
      
      const deliveryBranch = serverOrderData.deliveryInfo?.branchName || 
                            serverPrices?.deliveryInfo?.branchName || 
                            (deliveryMethod === 'delivery' ? branchName : null)

      const orderToSave = {
        id: orderId,
        status: serverStatus,
        createdAt: new Date().toISOString(),
        canCancelUntil: serverOrderData.canCancelUntil || result.canCancelUntil || new Date(Date.now() + 5 * 60 * 1000).toISOString(),
        estimatedMinutes: serverOrderData.estimatedMinutes || result.estimatedMinutes || (deliveryMethod === 'pickup' ? 12 : 30),
        items: (serverOrderData.items || serverPrices?.items || cart).map((item: any) => {
          const product = productsMap[item.productId || item.id]
          return {
            productId: item.productId || item.id,
            name: item.name || (product ? (language === 'ar' ? product.name : product.nameEn) : `Product ${item.productId}`),
            quantity: item.quantity,
            price: item.price || product?.price || 0,
            total: item.total || item.subtotal || ((item.price || product?.price || 0) * item.quantity)
          }
        }),
        totals: {
          subtotal: serverOrderData.subtotal || serverPrices?.subtotal || prices?.subtotal || 0,
          deliveryFee: serverOrderData.deliveryFee || serverPrices?.deliveryFee || prices?.deliveryFee || 0,
          discount: serverOrderData.discount || serverPrices?.discount || prices?.discount || 0,
          total: serverOrderData.total || serverPrices?.total || prices?.total || 0
        },
        deliveryMethod,
        branch: selectedBranchData || selectedBranch || deliveryBranch,
        branchName: branchName || deliveryBranch,
        branchPhone,
        branchWhatsApp,
        branchAddress,
        branchLocation,
        branchGoogleMapsUrl,
        customer: {
          name: formData.name.trim(),
          phone: formData.phone.replace(/\D/g, ''),
          address: formData.address.trim() || null
        },
        eta,
        couponCode: formData.couponCode || null,
        deliveryInfo: serverPrices?.deliveryInfo || prices?.deliveryInfo || {}
      }
      
      // Save order locally
      const saveSuccess = storage.addOrder(orderToSave)
      if (saveSuccess) {
        console.log('✅ Order saved locally:', orderId)
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('ordersUpdated', { 
            detail: { orderId, action: 'added' } 
          }))
        }
      }
      
      // Save customer profile
      if (rememberMe) {
        storage.saveCustomerProfile({
          name: formData.name.trim(),
          phone: formData.phone.replace(/\D/g, ''),
          address: formData.address.trim()
        })
        console.log('💾 Customer profile saved')
      }
      
      clearCart()
      onClose()
      
      showToast({
        type: 'success',
        title: language === 'ar' ? 'تم تقديم الطلب' : 'Order Submitted',
        message: language === 'ar' ? 'تم تقديم طلبك بنجاح!' : 'Your order has been submitted successfully!'
      })
      
      if (onCheckoutSuccess) {
        onCheckoutSuccess(orderId, orderToSave)
      }
      
      return { success: true, orderId, orderData: orderToSave }
    } catch (error: any) {
      console.error('❌ Order submission failed:', error)
      const errorMsg = error.message || (language === 'ar' ? 'فشل في تقديم الطلب' : 'Failed to submit order')
      setSubmitError(errorMsg)
      showToast({
        type: 'error',
        title: language === 'ar' ? 'فشل الطلب' : 'Order Failed',
        message: errorMsg
      })
      return { success: false, error: errorMsg }
    } finally {
      setIsSubmitting(false)
    }
  }, [cart, clearCart, productsMap, showToast, language, onClose, onCheckoutSuccess])

  const resetSubmitError = useCallback(() => {
    setSubmitError(null)
  }, [])

  return {
    isSubmitting,
    submitError,
    handleSubmitOrder,
    resetSubmitError
  }
}
