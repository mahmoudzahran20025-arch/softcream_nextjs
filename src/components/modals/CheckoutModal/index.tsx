// ✅ UPDATED: CheckoutModal.tsx مع GPS محسّن


'use client'

import { useState, useEffect, useRef } from 'react'
import { useCart } from '@/providers/CartProvider'
import { useProductsData } from '@/providers/ProductsProvider'
import { useTheme } from '@/providers/ThemeProvider'
import { X, ShoppingCart, Loader2 } from 'lucide-react'
import DeliveryOptions from './DeliveryOptions'
import CheckoutForm from './CheckoutForm'
import OrderSummary from './OrderSummary'
import { calculateOrderPrices, validateCoupon, getBranches, submitOrder } from '@/lib/api'
import { validateCheckoutForm } from './validation'
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
  const { showToast, language } = useTheme()
  
  void onOpenTracking
  
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
  
  // ✅ NEW: Remember Me checkbox state
  const [rememberMe, setRememberMe] = useState(true)
  const [profileLoaded, setProfileLoaded] = useState(false)
  
  // GPS State
  const [useGPS, setUseGPS] = useState(true)
  const [userLocation, setUserLocation] = useState<any>(null)
  const [locationLoading, setLocationLoading] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [gpsRetryCount, setGpsRetryCount] = useState(0)
  const MAX_GPS_RETRIES = 3
  
  const [prices, setPrices] = useState<any>(null)
  const [pricesLoading, setPricesLoading] = useState(false)
  const [pricesError, setPricesError] = useState<string | null>(null)
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // ✅ NEW: Refs to prevent duplicate calculations
  const lastLocationRef = useRef<string | null>(null)
  const calculationTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isCalculatingRef = useRef(false)

  // ✅ NEW: Load saved customer profile on mount
  useEffect(() => {
    if (isOpen && !profileLoaded) {
      const savedProfile = storage.getCustomerProfile()
      
      if (savedProfile) {
        console.log('👋 Welcome back! Loading saved profile:', savedProfile.name)
        
        setFormData(prev => ({
          ...prev,
          name: savedProfile.name,
          phone: savedProfile.phone,
          address: savedProfile.address || ''
        }))
        
        setProfileLoaded(true)
        
        // Show welcome toast
        showToast({
          type: 'success',
          title: language === 'ar' ? 'مرحباً بعودتك!' : 'Welcome back!',
          message: language === 'ar' 
            ? `تم تعبئة بياناتك تلقائياً، ${savedProfile.name} 👋` 
            : `Your details have been auto-filled, ${savedProfile.name} 👋`
        })
      }
    }
  }, [isOpen, profileLoaded, language, showToast])
  
  // Load Initial Data
  useEffect(() => {
    if (isOpen && cart.length > 0) {
      console.log('📄 CheckoutModal opened, loading initial data...')
      loadInitialData()
    }
  }, [isOpen, cart])

  const loadInitialData = async () => {
    console.log('📋 Resetting form state...')
    setDeliveryMethod(null)
    setSelectedBranch(null)
    setUserLocation(null)
    setUseGPS(true)
    setGpsRetryCount(0)
    setPrices(null)
    setCouponStatus(null)
    setCouponData(null)
    setErrors({})
    setSubmitError(null)
    setBranchesError(null)
    
    // Reset refs
    lastLocationRef.current = null
    isCalculatingRef.current = false
    
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
      setBranches([])
      console.log('ℹ️ Continuing without branches - user can still place orders')
    } finally {
      setBranchesLoading(false)
    }
  }

  // ✅ FIXED: Price Calculation Effect - منع التكرار
  useEffect(() => {
    if (!isOpen || !deliveryMethod || cart.length === 0) {
      return
    }

    // ✅ NEW: Create unique key for current state
    const locationKey = userLocation 
      ? `${userLocation.lat.toFixed(6)},${userLocation.lng.toFixed(6)}`
      : 'no-location'
    
    const stateKey = `${deliveryMethod}-${locationKey}-${selectedBranch || 'no-branch'}-${couponStatus || 'no-coupon'}`
    
    // ✅ NEW: Skip if same as last calculation
    if (lastLocationRef.current === stateKey) {
      console.log('⏭️ Skipping duplicate calculation:', stateKey)
      return
    }

    // ✅ NEW: Skip if already calculating
    if (isCalculatingRef.current) {
      console.log('⏭️ Calculation already in progress, skipping...')
      return
    }

    const recalculatePrices = async () => {
      console.log('📊 Recalculating prices for delivery method:', deliveryMethod)
      
      // Mark as calculating
      isCalculatingRef.current = true
      lastLocationRef.current = stateKey
      
      setPricesLoading(true)
      setPricesError(null)

      try {
        const addressInputType = getAddressInputType()
        console.log('📍 Address input type:', addressInputType, 'Location:', userLocation)
        
        const phoneForCalc = formData.phone.replace(/\D/g, '') || undefined
        
        const pricesData = await calculateOrderPrices(
          cart.map(item => ({
            productId: item.productId,
            quantity: item.quantity
          })),
          (couponStatus === 'valid' && formData.couponCode) ? formData.couponCode.trim() : null,
          deliveryMethod,
          phoneForCalc,
          userLocation,
          addressInputType || undefined
        )

        setPrices(pricesData)
        console.log('✅ Prices calculated successfully:', pricesData)
      } catch (error: any) {
        console.warn('⚠️ Price calculation failed, using fallback prices:', error)
        const errorMessage = error?.message || 'Failed to calculate prices. Using estimated prices.'
        setPricesError(errorMessage)
        
        const fallbackPrices = calculateFallbackPrices()
        console.log('💰 Using fallback prices:', fallbackPrices)
        setPrices(fallbackPrices)
        
        if (error?.isTimeout || error?.isNetworkError || error?.message?.includes('timeout') || error?.message?.includes('Failed to fetch')) {
          if (!prices) {
            showToast({
              type: 'warning',
              title: language === 'ar' ? 'مشكلة في الاتصال' : 'Connection Issue',
              message: language === 'ar' ? 'غير قادر على الاتصال بالخادم. استخدام الأسعار التقريبية.' : 'Unable to connect to server. Using estimated prices.'
            })
          }
        }
      } finally {
        setPricesLoading(false)
        isCalculatingRef.current = false
      }
    }

    // Clear any existing timeout
    if (calculationTimeoutRef.current) {
      clearTimeout(calculationTimeoutRef.current)
    }

    // Debounce calculations
    calculationTimeoutRef.current = setTimeout(recalculatePrices, 500)
    
    return () => {
      if (calculationTimeoutRef.current) {
        clearTimeout(calculationTimeoutRef.current)
      }
    }
  }, [isOpen, deliveryMethod, selectedBranch, userLocation, couponStatus, cart.length, formData.couponCode])

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
      setUseGPS(true)
      lastLocationRef.current = null // Reset
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

  // ✅ FIXED: GPS Handler - منع التكرار
  const handleRequestLocation = () => {
    if (!navigator.geolocation) {
      const msg = language === 'ar' 
        ? 'المتصفح لا يدعم تحديد الموقع' 
        : 'Geolocation not supported by this browser'
      setLocationError(msg)
      showToast({
        type: 'error',
        title: language === 'ar' ? 'خطأ GPS' : 'GPS Error',
        message: msg
      })
      setUseGPS(false)
      return
    }

    if (typeof window !== 'undefined') {
      const isSecure = window.location.protocol === 'https:' || 
                      window.location.hostname === 'localhost' ||
                      window.location.hostname === '127.0.0.1'
      
      if (!isSecure) {
        const msg = language === 'ar'
          ? 'تحديد الموقع يتطلب اتصال آمن (HTTPS)'
          : 'Geolocation requires secure connection (HTTPS)'
        setLocationError(msg)
        showToast({
          type: 'error',
          title: language === 'ar' ? 'خطأ أمني' : 'Security Error',
          message: msg
        })
        return
      }
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
        
        // ✅ FIXED: Set location ONCE only
        setUserLocation(location)
        setGpsRetryCount(0)
        
        const coords = `${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`
        const accuracy = Math.round(position.coords.accuracy)
        const addressText = language === 'ar' 
          ? `الموقع الحالي (${coords}) - الدقة: ${accuracy}م` 
          : `Current location (${coords}) - Accuracy: ${accuracy}m`
        
        // Update address WITHOUT triggering recalc
        setFormData(prev => ({ ...prev, address: addressText }))
        
        setLocationLoading(false)
        
        showToast({
          type: 'success',
          title: language === 'ar' ? 'تم تحديد الموقع' : 'Location Set',
          message: language === 'ar' ? 'تم الحصول على موقعك بنجاح' : 'Location obtained successfully'
        })
      },
      (error: GeolocationPositionError | any) => {
        console.error('❌ GPS error:', {
          code: error?.code,
          message: error?.message,
          type: error?.constructor?.name,
          full: error
        })

        const errorMessages: Record<number, { ar: string; en: string }> = {
          1: {
            ar: 'تم رفض إذن الموقع. يرجى السماح بالوصول إلى الموقع من إعدادات المتصفح',
            en: 'Location permission denied. Please allow location access in browser settings'
          },
          2: {
            ar: 'الموقع غير متاح حالياً. تأكد من تفعيل GPS',
            en: 'Location unavailable. Make sure GPS is enabled'
          },
          3: {
            ar: 'انتهت مهلة الحصول على الموقع. حاول مرة أخرى',
            en: 'Location request timed out. Please try again'
          }
        }

        const errorCode = error?.code || 0
        const errorMsg = errorMessages[errorCode] || {
          ar: `خطأ في تحديد الموقع: ${error?.message || 'غير معروف'}`,
          en: `Location error: ${error?.message || 'Unknown error'}`
        }

        const displayMsg = language === 'ar' ? errorMsg.ar : errorMsg.en
        
        setLocationError(displayMsg)
        setLocationLoading(false)
        
        showToast({
          type: 'error',
          title: language === 'ar' ? 'خطأ في الموقع' : 'Location Error',
          message: displayMsg
        })

        // Auto-retry on timeout
        if (errorCode === 3 && gpsRetryCount < MAX_GPS_RETRIES) {
          console.log(`🔄 Retrying GPS (${gpsRetryCount + 1}/${MAX_GPS_RETRIES})...`)
          setGpsRetryCount(prev => prev + 1)
          setTimeout(() => {
            handleRequestLocation()
          }, 2000)
        } else if (errorCode === 1) {
          setUseGPS(false)
        }

        if (errorCode === 1) {
          console.log('💡 Help: Check browser settings -> Privacy -> Location')
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 300000
      }
    )
  }

  const handleToggleAddressMode = (mode: boolean) => {
    setUseGPS(mode)
    if (mode) {
      setLocationError(null)
      lastLocationRef.current = null // Reset on toggle
    } else {
      setUserLocation(null)
      handleInputChange('address', '')
      lastLocationRef.current = null // Reset on toggle
    }
  }

  // Coupon Handlers
  const handleApplyCoupon = async () => {
    const code = formData.couponCode.trim().toUpperCase()
    if (!code) return

    setCouponLoading(true)
    setCouponStatus(null)

    try {
      const subtotalForCoupon = prices?.subtotal || calculateFallbackPrices().subtotal
      const phoneForCoupon = formData.phone.replace(/\D/g, '') || '0000000000'

      const result = await validateCoupon(code, phoneForCoupon, subtotalForCoupon)

      if (result.valid) {
        setCouponStatus('valid')
        setCouponData(result.coupon)
        console.log('✅ Coupon valid:', result.coupon)
      } else {
        setCouponStatus('error')
        setCouponData({ error: result.message || (language === 'ar' ? 'كوبون غير صالح' : 'Invalid coupon') })
        showToast({
          type: 'error',
          title: language === 'ar' ? 'كوبون غير صالح' : 'Invalid Coupon',
          message: result.message || (language === 'ar' ? 'الكود غير صحيح أو منتهي الصلاحية' : 'Code is invalid or expired')
        })
      }
    } catch (error: any) {
      console.error('❌ Coupon validation failed:', error)
      setCouponStatus('error')
      setCouponData({ error: error.message || (language === 'ar' ? 'خطأ في التحقق من الكوبون' : 'Coupon validation error') })
      showToast({
        type: 'error',
        title: language === 'ar' ? 'خطأ في الكوبون' : 'Coupon Error',
        message: error.message || (language === 'ar' ? 'فشل في التحقق من الكوبون' : 'Failed to validate coupon')
      })
    } finally {
      setCouponLoading(false)
    }
  }

  const handleRemoveCoupon = () => {
    handleInputChange('couponCode', '')
    setCouponStatus(null)
    setCouponData(null)
  }

  // Order Submission (unchanged)
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
      if (!prices || pricesLoading) {
        console.log('📊 Final price calc before submit')
        await new Promise(resolve => setTimeout(resolve, 500))
      }

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
      
      const serverOrderData = result.data || result
      const serverPrices = serverOrderData.calculatedPrices || prices
      const orderId = serverOrderData.orderId || serverOrderData.id || result.orderId || result.id
      const serverStatus = serverOrderData.status || 'pending'
      const eta = serverOrderData.eta || serverOrderData.etaAr || (language === 'ar' ? '30-45 دقيقة' : '30-45 minutes')
      
      console.log('📦 Order data from server:', { orderId, status: serverStatus, eta })
      
      const selectedBranchData = branches.find((b: any) => b.id === selectedBranch || b.name === selectedBranch)
      const branchPhone = selectedBranchData?.phone || selectedBranchData?.whatsapp || null
      const branchName = selectedBranchData?.name || selectedBranch || null
      const branchAddress = selectedBranchData?.address || null
      
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
      
      // ✅ NEW: Save customer profile if "Remember Me" is checked
      if (rememberMe) {
        const profileSaved = storage.saveCustomerProfile({
          name: formData.name.trim(),
          phone: formData.phone.replace(/\D/g, ''),
          address: formData.address.trim()
        })
        
        if (profileSaved) {
          console.log('💾 Customer profile saved for next time')
        }
      }
      
      clearCart()
      onClose()
      
      showToast({
        type: 'success',
        title: language === 'ar' ? 'تم تقديم الطلب' : 'Order Submitted',
        message: language === 'ar' ? 'تم تقديم طلبك بنجاح!' : 'Your order has been submitted successfully!'
      })
      
      if (onCheckoutSuccess) {
        console.log('📤 Calling onCheckoutSuccess with order data')
        onCheckoutSuccess(orderId, orderToSave)
      }
      
      resetForm()
    } catch (error: any) {
      console.error('❌ Order submission failed:', error)
      setSubmitError(error.message || (language === 'ar' ? 'فشل في تقديم الطلب' : 'Failed to submit order'))
      showToast({
        type: 'error',
        title: language === 'ar' ? 'فشل الطلب' : 'Order Failed',
        message: error.message || (language === 'ar' ? 'حدث خطأ' : 'An error occurred')
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
    setUseGPS(true)
    setGpsRetryCount(0)
    setPrices(null)
    setErrors({})
    setCouponStatus(null)
    setCouponData(null)
    setRememberMe(true)
    setProfileLoaded(false)
    lastLocationRef.current = null
    isCalculatingRef.current = false
  }


  if (!isOpen) return null

  return (
    <>
      {isOpen && (
      <div
        className="fixed inset-0 bg-gray-900/80 backdrop-blur-md z-[9100] flex items-center justify-center p-5 overflow-y-auto"
        onClick={() => !isSubmitting && onClose()}
      >
      <div
        className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-[650px] w-full max-h-[90vh] overflow-y-auto shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-4 right-4 bg-gray-100 dark:bg-gray-700 w-10 h-10 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
          onClick={onClose}
          disabled={isSubmitting}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-7">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white shadow-lg">
            <ShoppingCart className="w-8 h-8" />
          </div>
          <h3 className="text-[26px] font-black text-gray-800 dark:text-gray-100 mb-2">
            {language === 'ar' ? 'تأكيد الطلب' : 'Confirm Order'}
          </h3>
          <p className="text-base text-gray-600 dark:text-gray-400">
            {language === 'ar' ? 'اختر طريقة التوصيل واكمل تفاصيلك' : 'Select delivery method and complete your details'}
          </p>
        </div>

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
          useGPS={useGPS}
          gpsRetryCount={gpsRetryCount}
          maxGpsRetries={MAX_GPS_RETRIES}
          onInputChange={handleInputChange}
          onRequestLocation={handleRequestLocation}
          onToggleAddressMode={handleToggleAddressMode}
          onApplyCoupon={handleApplyCoupon}
          onRemoveCoupon={handleRemoveCoupon}
        />

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

        {/* ✅ NEW: Remember Me Checkbox */}
        {deliveryMethod && (
          <div className="mt-4 mb-2">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-5 h-5 rounded border-2 border-gray-300 dark:border-gray-600 text-purple-600 focus:ring-2 focus:ring-purple-500 cursor-pointer"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                {language === 'ar' ? '💾 حفظ بياناتي للطلب القادم' : '💾 Save my details for next time'}
              </span>
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mr-8">
              {language === 'ar' 
                ? 'سنقوم بتعبئة بياناتك تلقائياً في المرة القادمة' 
                : "We'll auto-fill your details next time"}
            </p>
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <button
            className="py-4 px-6 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-2xl font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
            onClick={onClose}
            disabled={isSubmitting}
          >
            {language === 'ar' ? 'إلغاء' : 'Cancel'}
          </button>
          <button
            className="flex-1 py-4 px-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleSubmitOrder}
            disabled={isSubmitting || !deliveryMethod || (deliveryMethod === 'pickup' && !selectedBranch)}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>{language === 'ar' ? 'جاري التقديم...' : 'Submitting...'}</span>
              </> 
            ) : (
              <span>{language === 'ar' ? 'تأكيد الطلب' : 'Confirm Order'}</span>
            )}
          </button>
        </div>

        {submitError && (
          <div className="mt-4 p-4 bg-red-50 border-2 border-red-500 rounded-xl text-red-600 text-sm">
            <div className="font-bold mb-1">
              {language === 'ar' ? 'فشل الطلب' : 'Order Failed'}
            </div>
            <div>{submitError}</div>
          </div>
        )}
      </div>
      </div>
      )}
    </>
  )
}

export default CheckoutModal