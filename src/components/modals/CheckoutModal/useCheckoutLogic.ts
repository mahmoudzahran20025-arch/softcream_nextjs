// ✅ EXTRACTED LOGIC: useCheckoutLogic.ts
// All business logic, state management, and API calls extracted from index.tsx

'use client'

import { useState, useEffect, useRef } from 'react'
import { useCart } from '@/providers/CartProvider'
import { useProductsData } from '@/providers/ProductsProvider'
import { useToast } from '@/providers/ToastProvider'
import { useLanguage } from '@/providers/LanguageProvider'
import { calculateOrderPrices, validateCoupon, getBranches, submitOrder } from '@/lib/api'
import { validateCheckoutForm } from './validation'
import { storage } from '@/lib/storage.client'

interface UseCheckoutLogicProps {
  isOpen: boolean
  onClose: () => void
  onCheckoutSuccess?: (orderId: string, orderData?: any) => void
}

export const useCheckoutLogic = ({ isOpen, onClose, onCheckoutSuccess }: UseCheckoutLogicProps) => {
  const { cart, clearCart } = useCart()
  const { productsMap } = useProductsData()
  const { language } = useLanguage()
  const { showToast } = useToast()
  
  // ===================================
  // STATE MANAGEMENT
  // ===================================
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

  // Refs for optimization
  const lastLocationRef = useRef<string | null>(null)
  const calculationTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isCalculatingRef = useRef(false)
  const hasShownWelcomeToast = useRef(false)
  const formRef = useRef<HTMLDivElement>(null)

  // ===================================
  // LOAD SAVED PROFILE
  // ===================================
  useEffect(() => {
    if (isOpen && !profileLoaded && !hasShownWelcomeToast.current) {
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
        hasShownWelcomeToast.current = true
        
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
  
  // ===================================
  // LOAD INITIAL DATA
  // ===================================
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

  // ===================================
  // PRICE CALCULATION EFFECT
  // ===================================
  useEffect(() => {
    if (!isOpen || !deliveryMethod || cart.length === 0) {
      return
    }

    const locationKey = userLocation 
      ? `${userLocation.lat.toFixed(6)},${userLocation.lng.toFixed(6)}`
      : 'no-location'
    
    const stateKey = `${deliveryMethod}-${locationKey}-${selectedBranch || 'no-branch'}-${couponStatus || 'no-coupon'}`
    
    if (lastLocationRef.current === stateKey) {
      console.log('⏭️ Skipping duplicate calculation:', stateKey)
      return
    }

    if (isCalculatingRef.current) {
      console.log('⏭️ Calculation already in progress, skipping...')
      return
    }

    const recalculatePrices = async () => {
      console.log('📊 Recalculating prices for delivery method:', deliveryMethod)
      
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

    if (calculationTimeoutRef.current) {
      clearTimeout(calculationTimeoutRef.current)
    }

    calculationTimeoutRef.current = setTimeout(recalculatePrices, 500)
    
    return () => {
      if (calculationTimeoutRef.current) {
        clearTimeout(calculationTimeoutRef.current)
      }
    }
  }, [isOpen, deliveryMethod, selectedBranch, userLocation, couponStatus, cart.length, formData.couponCode])

  // ===================================
  // HELPER FUNCTIONS
  // ===================================
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

  // ===================================
  // FORM HANDLERS
  // ===================================
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
      lastLocationRef.current = null
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
    
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 300)
  }

  // ===================================
  // GPS HANDLERS
  // ===================================
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
        
        setUserLocation(location)
        setGpsRetryCount(0)
        
        const coords = `${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`
        const accuracy = Math.round(position.coords.accuracy)
        const addressText = language === 'ar' 
          ? `الموقع الحالي (${coords}) - الدقة: ${accuracy}م` 
          : `Current location (${coords}) - Accuracy: ${accuracy}m`
        
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
      lastLocationRef.current = null
    } else {
      setUserLocation(null)
      handleInputChange('address', '')
      lastLocationRef.current = null
    }
  }

  // ===================================
  // COUPON HANDLERS
  // ===================================
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

  // ===================================
  // ORDER SUBMISSION
  // ===================================
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
    hasShownWelcomeToast.current = false
    lastLocationRef.current = null
    isCalculatingRef.current = false
  }

  // ===================================
  // RETURN ALL STATE AND HANDLERS
  // ===================================
  return {
    // State
    cart,
    deliveryMethod,
    selectedBranch,
    branches,
    branchesLoading,
    branchesError,
    formData,
    errors,
    couponStatus,
    couponData,
    couponLoading,
    rememberMe,
    useGPS,
    userLocation,
    locationLoading,
    locationError,
    gpsRetryCount,
    MAX_GPS_RETRIES,
    prices,
    pricesLoading,
    pricesError,
    isSubmitting,
    submitError,
    formRef,
    
    // Handlers
    handleInputChange,
    handleDeliveryMethodChange,
    handleBranchSelect,
    handleRequestLocation,
    handleToggleAddressMode,
    handleApplyCoupon,
    handleRemoveCoupon,
    handleSubmitOrder,
    setRememberMe
  }
}
