'use client'

import { useState, useEffect } from 'react'
import { useCart } from '@/providers/CartProvider'
import { useProductsData } from '@/providers/ProductsProvider'
import { useTheme } from '@/providers/ThemeProvider'
import { X, ShoppingCart, Loader2 } from 'lucide-react'
import DeliveryOptions from './CheckoutModal/DeliveryOptions'
import CheckoutForm from './CheckoutModal/CheckoutForm'
import OrderSummary from './CheckoutModal/OrderSummary'
// OrderSuccessModal is now managed by PageContentClient
import { calculateOrderPrices, validateCoupon, getBranches, submitOrder } from '@/lib/api'
import { validateCheckoutForm } from './CheckoutModal/validation'
import { storage } from '@/lib/storage.client'

interface CheckoutModalProps {
  isOpen: boolean
  onClose: () => void
  onCheckoutSuccess?: (orderId: string, orderData?: any) => void
  onSuccess?: (orderId: string) => void
  onOpenTracking?: (order: any) => void
}

const CheckoutModal = ({ isOpen, onClose, onCheckoutSuccess, onOpenTracking }: CheckoutModalProps) => {
  const { cart, clearCart } = useCart()
  const { productsMap } = useProductsData()
  const { showToast } = useTheme()
  
  // onOpenTracking is passed to parent but not used directly in this component
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  void onOpenTracking
        
  const currentLang = 'en' as string;  
  // State Management
  const [deliveryMethod, setDeliveryMethod] = useState<'pickup' | 'delivery' | null>(null)
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null)
  const [branches, setBranches] = useState<any[]>([])
  const [branchesLoading, setBranchesLoading] = useState(false)
  const [branchesError, setBranchesError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    name: '', phone: '', address: '', notes: '', couponCode: ''
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [couponStatus, setCouponStatus] = useState<'valid' | 'error' | null>(null)
  const [couponData, setCouponData] = useState<any>(null)
  const [couponLoading, setCouponLoading] = useState(false)
  
  const [userLocation, setUserLocation] = useState<any>(null)
  const [locationLoading, setLocationLoading] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)
  
  const [prices, setPrices] = useState<any>(null)
  const [pricesLoading, setPricesLoading] = useState(false)
  const [pricesError, setPricesError] = useState<string | null>(null)
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Load Initial Data
  useEffect(() => {
    if (isOpen && cart.length > 0) {
      console.log('🔄 CheckoutModal opened, loading initial data...')
      loadInitialData()
    }
  }, [isOpen, cart])

  const loadInitialData = async () => {
    console.log('📋 Resetting form state...')
    setDeliveryMethod(null)
    setSelectedBranch(null)
    setUserLocation(null)
    setPrices(null)
    setCouponStatus(null)
    setCouponData(null)
    setErrors({})
    setSubmitError(null)
    setBranchesError(null)
    
    // Load branches with better error handling
    setBranchesLoading(true)
    try {
      console.log('🏢 Attempting to load branches from API...')
      const branchesData = await getBranches()
      console.log('✅ Branches loaded successfully:', branchesData?.length || 0, 'branches')
      setBranches(branchesData || [])
      setBranchesError(null)
    } catch (error: any) {
      console.warn('⚠️ Failed to load branches (non-critical):', error)
      const errorMessage = error?.message || 'Failed to load branches. You can still proceed with delivery.'
      setBranchesError(errorMessage)
      // Set empty branches array to allow user to continue with manual address
      // This is not a critical error - user can still place orders
      setBranches([])
      console.log('ℹ️ Continuing without branches - user can still place orders')
    } finally {
      setBranchesLoading(false)
    }
  }

  // Price Calculation Effect
  useEffect(() => {
    if (!isOpen || !deliveryMethod || cart.length === 0) {
      return
    }

    const recalculatePrices = async () => {
      console.log('🔄 Recalculating prices for delivery method:', deliveryMethod)
      setPricesLoading(true)
      setPricesError(null)

      try {
        const addressInputType = getAddressInputType()
        console.log('📍 Address input type:', addressInputType, 'Location:', userLocation)
        
        const pricesData = await calculateOrderPrices(
          cart.map(item => ({
            productId: item.productId,
            quantity: item.quantity
          })),
          (couponStatus === 'valid' && formData.couponCode) ? formData.couponCode.trim() : null,
          deliveryMethod,
          formData.phone.replace(/\D/g, '') || undefined,
          userLocation,
          addressInputType || undefined
        )

        setPrices(pricesData)
        console.log('✅ Prices calculated successfully:', pricesData)
      } catch (error: any) {
        console.warn('⚠️ Price calculation failed, using fallback prices:', error)
        const errorMessage = error?.message || 'Failed to calculate prices. Using estimated prices.'
        setPricesError(errorMessage)
        
        // Use fallback prices when API fails
        const fallbackPrices = calculateFallbackPrices()
        console.log('💰 Using fallback prices:', fallbackPrices)
        setPrices(fallbackPrices)
        
        // Show toast notification for connection issues (only once, not on every retry)
        if (error?.isTimeout || error?.isNetworkError || error?.message?.includes('timeout') || error?.message?.includes('Failed to fetch')) {
          // Only show toast if prices are not already set (to avoid spam)
          if (!prices) {
            showToast({
              type: 'warning',
              title: 'Connection Issue',
              message: 'Unable to connect to server. Using estimated prices.'
            })
          }
        }
      } finally {
        setPricesLoading(false)
      }
    }

    const timer = setTimeout(recalculatePrices, 300)
    return () => clearTimeout(timer)
  }, [isOpen, deliveryMethod, selectedBranch, userLocation, couponStatus, cart, formData.couponCode, formData.phone])

  // Helper Functions
  const getAddressInputType = () => {
    if (deliveryMethod !== 'delivery') return null
    if (userLocation?.lat && userLocation?.lng) return 'gps'
    if (formData.address.trim()) return 'manual'
    return null
  }

  const calculateFallbackPrices = () => {
    const subtotal = cart.reduce((sum, item) => {
      const product = productsMap[item.productId]
      return sum + ((product?.price || 0) * item.quantity)
    }, 0)
    
    const deliveryFee = deliveryMethod === 'delivery' ? 20 : 0
    const discount = couponData?.discountAmount || 0
    
    return {
      subtotal,
      deliveryFee,
      discount,
      total: subtotal + deliveryFee - discount,
      isOffline: true,
      deliveryInfo: { isEstimated: true }
    }
  }

  // Form Handlers
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleDeliveryMethodChange = (method: 'pickup' | 'delivery') => {
    setDeliveryMethod(method)
    if (method === 'pickup') {
      setUserLocation(null)
      setLocationError(null)
    } else {
      setSelectedBranch(null)
    }
    if (errors.deliveryMethod) {
      setErrors(prev => ({ ...prev, deliveryMethod: '' }))
    }
  }

  const handleBranchSelect = (branchId: string) => {
    setSelectedBranch(branchId)
    if (errors.branch) {
      setErrors(prev => ({ ...prev, branch: '' }))
    }
  }

  // Location Handler
  const handleRequestLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation not supported')
      return
    }

    setLocationLoading(true)
    setLocationError(null)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        }

        console.log('✅ GPS Location obtained:', location)
        setUserLocation(location)
        
        const coords = `${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`
        const accuracy = Math.round(position.coords.accuracy)
        handleInputChange('address', `Current location (${coords}) - Accuracy: ${accuracy}m`)
        
        setLocationLoading(false)
      },
      (error: any) => {
        console.error('❌ GPS error:', error)
        const errorMessages: Record<number, string> = {
          1: currentLang === 'ar' ? 'تم رفض إذن الموقع' : 'Permission denied',
          2: currentLang === 'ar' ? 'الموقع غير متاح' : 'Unavailable',
          3: currentLang === 'ar' ? 'انتهت المهلة' : 'Timeout'
        }
        setLocationError(errorMessages[error.code] || (currentLang === 'ar' ? 'خطأ في الموقع' : 'Location error'))
        setLocationLoading(false)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    )
  }

  // Coupon Handlers
  const handleApplyCoupon = async () => {
    const code = formData.couponCode.trim().toUpperCase()
    if (!code) return

    setCouponLoading(true)
    setCouponStatus(null)

    try {
      const result = await validateCoupon(
        code,
        formData.phone.replace(/\D/g, '') || '0000000000',
        prices?.subtotal || calculateFallbackPrices().subtotal
      )

      if (result.valid) {
        setCouponStatus('valid')
        setCouponData(result.coupon)
        console.log('✅ Coupon valid:', result.coupon)
      } else {
        setCouponStatus('error')
        setCouponData({ error: result.message || 'Invalid coupon' })
      }
    } catch (error: any) {
      console.error('❌ Coupon validation failed:', error)
      setCouponStatus('error')
      setCouponData({ error: error.message })
    } finally {
      setCouponLoading(false)
    }
  }

  const handleRemoveCoupon = () => {
    handleInputChange('couponCode', '')
    setCouponStatus(null)
    setCouponData(null)
  }

  // Order Submission
  const handleSubmitOrder = async () => {
    const validation = validateCheckoutForm({
      formData,
      deliveryMethod,
      selectedBranch
    })

    if (!validation.valid) {
      setErrors(validation.errors)
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const orderData = {
        items: cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity
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
        ...(getAddressInputType() && { addressInputType: getAddressInputType() }),
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
      
      // Extract data from result (handle both direct result and result.data)
      const serverOrderData = result.data || result
      const serverPrices = serverOrderData.calculatedPrices || prices
      const orderId = serverOrderData.orderId || serverOrderData.id || result.orderId || result.id
      const serverStatus = serverOrderData.status || 'pending' // Use status from API (usually 'جديد' in Arabic)
      const eta = serverOrderData.eta || serverOrderData.etaAr || (currentLang === 'ar' ? '30-45 دقيقة' : '30-45 minutes')
      
      console.log('📦 Order data from server:', { orderId, status: serverStatus, eta })
      
      // Get branch data (for both pickup and delivery)
      const selectedBranchData = branches.find((b: any) => b.id === selectedBranch || b.name === selectedBranch)
      const branchPhone = selectedBranchData?.phone || selectedBranchData?.whatsapp || null
      const branchName = selectedBranchData?.name || selectedBranch || null
      const branchAddress = selectedBranchData?.address || null
      
      // For delivery: get nearest branch from deliveryInfo
      const deliveryBranch = serverOrderData.deliveryInfo?.branchName || 
                            serverPrices?.deliveryInfo?.branchName || 
                            (deliveryMethod === 'delivery' ? branchName : null)

      const orderToSave = {
        id: orderId,
        status: serverStatus, // ✅ Use status from API (supports both 'جديد' and 'pending')
        createdAt: new Date().toISOString(),
        canCancelUntil: serverOrderData.canCancelUntil || result.canCancelUntil || new Date(Date.now() + 5 * 60 * 1000).toISOString(),
        estimatedMinutes: serverOrderData.estimatedMinutes || result.estimatedMinutes || (deliveryMethod === 'pickup' ? 12 : 30),
        items: (serverOrderData.items || serverPrices?.items || cart).map((item: any) => {
          const product = productsMap[item.productId || item.id]
          return {
            productId: item.productId || item.id,
            name: item.name || (product ? (currentLang === 'ar' ? product.name : product.nameEn) : `Product ${item.productId}`),
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
        deliveryMethod: deliveryMethod,
        branch: selectedBranch || deliveryBranch,
        branchName: branchName || deliveryBranch,
        branchPhone: branchPhone,
        branchAddress: branchAddress,
        customer: {
          name: formData.name.trim(),
          phone: formData.phone.replace(/\D/g, ''),
          address: formData.address.trim() || null
        },
        eta: eta,
        couponCode: formData.couponCode || null,
        deliveryInfo: serverPrices?.deliveryInfo || prices?.deliveryInfo || {}
      }
      
      const saveSuccess = storage.addOrder(orderToSave)
      if (saveSuccess) {
        console.log('✅ Order saved locally:', orderId)
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('ordersUpdated', { 
            detail: { orderId, action: 'added' } 
          }))
        }
      }
      
      clearCart()
      
      // Pass order data to parent component (PageContentClient) to show success modal
      console.log('🎉 Order submitted successfully, passing to parent:', { orderId, orderToSave })
      
      // Close checkout modal
      onClose()
      
      showToast({
        type: 'success',
        title: 'Order Submitted',
        message: 'Your order has been submitted successfully!'
      })
      
      // Pass order data to parent component to show success modal
      if (onCheckoutSuccess) {
        console.log('📤 Calling onCheckoutSuccess with order data')
        onCheckoutSuccess(orderId, orderToSave)
      }
      
      resetForm()
    } catch (error: any) {
      console.error('❌ Order submission failed:', error)
      setSubmitError(error.message || 'Failed to submit order')
      showToast({
        type: 'error',
        title: 'Order Failed',
        message: error.message || 'An error occurred'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({ name: '', phone: '', address: '', notes: '', couponCode: '' })
    setDeliveryMethod(null)
    setSelectedBranch(null)
    setUserLocation(null)
    setPrices(null)
    setErrors({})
    setCouponStatus(null)
    setCouponData(null)
  }

  if (!isOpen) return null

  return (
    <>
      {/* Checkout Modal - only show if isOpen is true */}
      {isOpen && (
      <div
        className="fixed inset-0 bg-gray-900/80 backdrop-blur-md z-[9100] flex items-center justify-center p-5 overflow-y-auto"
        onClick={() => !isSubmitting && onClose()}
      >
      <div
        className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-[650px] w-full max-h-[90vh] overflow-y-auto shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          className="absolute top-4 right-4 bg-gray-100 dark:bg-gray-700 w-10 h-10 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
          onClick={onClose}
          disabled={isSubmitting}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-7">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white shadow-lg">
            <ShoppingCart className="w-8 h-8" />
          </div>
          <h3 className="text-[26px] font-black text-gray-800 dark:text-gray-100 mb-2">
            Confirm Order
          </h3>
          <p className="text-base text-gray-600 dark:text-gray-400">
            Select delivery method and complete your details
          </p>
        </div>

        {/* Delivery Options */}
        <DeliveryOptions
          deliveryMethod={deliveryMethod}
          selectedBranch={selectedBranch}
          branches={branches}
          branchesLoading={branchesLoading}
          branchesError={branchesError}
          errors={errors}
          onDeliveryMethodChange={handleDeliveryMethodChange}
          onBranchSelect={handleBranchSelect}
        />

        {/* Checkout Form */}
        <CheckoutForm
          formData={formData}
          deliveryMethod={deliveryMethod}
          errors={errors}
          userLocation={userLocation}
          locationLoading={locationLoading}
          locationError={locationError}
          couponStatus={couponStatus}
          couponData={couponData}
          couponLoading={couponLoading}
          onInputChange={handleInputChange}
          onRequestLocation={handleRequestLocation}
          onApplyCoupon={handleApplyCoupon}
          onRemoveCoupon={handleRemoveCoupon}
        />

        {/* Order Summary */}
        {deliveryMethod && (
          <OrderSummary
            cart={cart}
            products={productsMap}
            productsLoading={false}
            prices={prices}
            pricesLoading={pricesLoading}
            pricesError={pricesError}
            deliveryMethod={deliveryMethod}
          />
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <button
            className="py-4 px-6 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-2xl font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            className="flex-1 py-4 px-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleSubmitOrder}
            disabled={isSubmitting || !deliveryMethod || (deliveryMethod === 'pickup' && !selectedBranch)}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Submitting...</span>
              </> 
            ) : (
              <span>{currentLang === 'ar' ? 'تأكيد الطلب' : 'Confirm Order'}</span>
            )}
          </button>
        </div>

        {/* Error Message */}
        {submitError && (
          <div className="mt-4 p-4 bg-red-50 border-2 border-red-500 rounded-xl text-red-600 text-sm">
            <div className="font-bold mb-1">
              Order Failed
            </div>
            <div>{submitError}</div>
          </div>
        )}
      </div>
      </div>
      )}

      {/* Order Success Modal is now managed by PageContentClient */}
    </>
  )
}

export default CheckoutModal
