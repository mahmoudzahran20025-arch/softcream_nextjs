// ================================================================
// useCheckoutLogic - Main Checkout Orchestrator Hook
// Uses modular hooks for GPS, Coupon, Branches, Prices, and Order Submission
// ================================================================

'use client'

import { useState, useEffect, useRef } from 'react'
import { useCart } from '@/providers/CartProvider'
import { useProductsData } from '@/providers/ProductsProvider'
import { useToast } from '@/providers/ToastProvider'
import { useLanguage } from '@/providers/LanguageProvider'
import { storage } from '@/lib/storage.client'
import { validateCheckoutForm } from './validation'

// ✅ Import modular hooks
import { useGPS } from './hooks/useGPS'
import { useCoupon } from './hooks/useCoupon'
import { useBranches } from './hooks/useBranches'
import { usePriceCalculation } from './hooks/usePriceCalculation'
import { useOrderSubmission } from './hooks/useOrderSubmission'

interface UseCheckoutLogicProps {
  isOpen: boolean
  onClose: () => void
  onCheckoutSuccess?: (orderId: string, orderData?: any) => void
}

export const useCheckoutLogic = ({ isOpen, onClose, onCheckoutSuccess }: UseCheckoutLogicProps) => {
  const { cart } = useCart()
  const { productsMap } = useProductsData()
  const { language } = useLanguage()
  const { showToast } = useToast()

  // ===================================
  // MODULAR HOOKS
  // ===================================
  const gpsHook = useGPS()
  const couponHook = useCoupon()
  const branchesHook = useBranches()
  const pricesHook = usePriceCalculation()
  const orderHook = useOrderSubmission({ onClose, onCheckoutSuccess })

  // ===================================
  // LOCAL STATE
  // ===================================
  const [deliveryMethod, setDeliveryMethod] = useState<'pickup' | 'delivery' | null>(null)
  const [formData, setFormData] = useState({
    name: '', phone: '', address: '', notes: '', couponCode: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [rememberMe, setRememberMe] = useState(true)
  const [profileLoaded, setProfileLoaded] = useState(false)

  // Refs
  const hasShownWelcomeToast = useRef(false)
  const formRef = useRef<HTMLDivElement>(null)
  const lastPriceKey = useRef<string | null>(null)

  // ===================================
  // LOAD BRANCHES & PROFILE ON OPEN
  // ===================================
  useEffect(() => {
    if (isOpen && cart.length > 0) {
      console.log('📄 CheckoutModal opened, loading data...')
      
      // Reset state but preserve profile loading
      setDeliveryMethod(null)
      setErrors({})
      setRememberMe(true)
      lastPriceKey.current = null
      gpsHook.resetGPS()
      couponHook.resetCoupon()
      branchesHook.resetBranches()
      pricesHook.resetPrices()
      
      // Load branches
      branchesHook.loadBranches()
      
      // Load saved profile (only if not already loaded)
      if (!hasShownWelcomeToast.current) {
        const savedProfile = storage.getCustomerProfile()
        
        if (savedProfile) {
          console.log('👋 Welcome back! Loading saved profile:', savedProfile.name)
          
          setFormData({
            name: savedProfile.name || '',
            phone: savedProfile.phone || '',
            address: savedProfile.address || '',
            notes: '',
            couponCode: ''
          })
          
          setProfileLoaded(true)
          hasShownWelcomeToast.current = true
          
          showToast({
            type: 'success',
            title: language === 'ar' ? 'مرحباً بعودتك!' : 'Welcome back!',
            message: language === 'ar' 
              ? `تم تعبئة بياناتك تلقائياً، ${savedProfile.name} 👋` 
              : `Your details have been auto-filled, ${savedProfile.name} 👋`
          })
        } else {
          // No saved profile - reset form data
          setFormData({ name: '', phone: '', address: '', notes: '', couponCode: '' })
          setProfileLoaded(false)
        }
      }
    }
  }, [isOpen])

  // ===================================
  // PRICE CALCULATION EFFECT
  // ===================================
  useEffect(() => {
    if (!isOpen || !deliveryMethod || cart.length === 0) return

    const locationKey = gpsHook.userLocation 
      ? `${gpsHook.userLocation.lat.toFixed(6)},${gpsHook.userLocation.lng.toFixed(6)}`
      : 'no-location'
    
    const priceKey = `${deliveryMethod}-${locationKey}-${branchesHook.selectedBranch || 'no-branch'}-${couponHook.couponStatus || 'no-coupon'}`
    
    if (lastPriceKey.current === priceKey) return
    lastPriceKey.current = priceKey

    // Calculate prices
    const addressInputType = getAddressInputType()
    pricesHook.calculatePrices({
      cart,
      productsMap,
      deliveryMethod,
      userLocation: gpsHook.userLocation,
      couponCode: couponHook.couponStatus === 'valid' ? formData.couponCode : null,
      phone: formData.phone,
      addressInputType
    })
  }, [isOpen, deliveryMethod, branchesHook.selectedBranch, gpsHook.userLocation, couponHook.couponStatus, cart.length])

  // ===================================
  // HELPER FUNCTIONS
  // ===================================
  const getAddressInputType = () => {
    if (deliveryMethod !== 'delivery') return null
    if (gpsHook.userLocation?.lat && gpsHook.userLocation?.lng) return 'gps'
    if (formData.address.trim()) return 'manual'
    return null
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
    lastPriceKey.current = null
    
    if (method === 'pickup') {
      gpsHook.resetGPS()
    } else {
      branchesHook.setSelectedBranch(null)
    }
    
    if (errors.deliveryMethod) {
      setErrors(prev => ({ ...prev, deliveryMethod: '' }))
    }
  }

  const handleBranchSelect = (branchId: string) => {
    branchesHook.handleBranchSelect(branchId)
    if (errors.branch) {
      setErrors(prev => ({ ...prev, branch: '' }))
    }
    
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 300)
  }

  // ===================================
  // GPS HANDLERS (Wrapper)
  // ===================================
  const handleRequestLocation = () => {
    gpsHook.handleRequestLocation()
  }

  const handleToggleAddressMode = (mode: boolean) => {
    gpsHook.handleToggleAddressMode(mode)
    if (!mode) {
      handleInputChange('address', '')
    }
    lastPriceKey.current = null
  }

  // ===================================
  // COUPON HANDLERS (Wrapper)
  // ===================================
  const handleApplyCoupon = async () => {
    const subtotal = pricesHook.prices?.subtotal || 0
    await couponHook.handleApplyCoupon(
      formData.couponCode,
      formData.phone,
      subtotal,
      deliveryMethod
    )
  }

  const handleRemoveCoupon = () => {
    handleInputChange('couponCode', '')
    couponHook.handleRemoveCoupon()
  }

  // ===================================
  // ORDER SUBMISSION
  // ===================================
  const handleSubmitOrder = async () => {
    const validation = validateCheckoutForm({
      formData,
      deliveryMethod,
      selectedBranch: branchesHook.selectedBranch
    })

    if (!validation.valid) {
      setErrors(validation.errors)
      return
    }

    await orderHook.handleSubmitOrder({
      formData,
      deliveryMethod,
      selectedBranch: branchesHook.selectedBranch,
      userLocation: gpsHook.userLocation,
      couponStatus: couponHook.couponStatus,
      prices: pricesHook.prices,
      branches: branchesHook.branches,
      rememberMe
    })
  }

  // ===================================
  // RETURN ALL STATE AND HANDLERS
  // ===================================
  return {
    // Cart
    cart,
    
    // Delivery
    deliveryMethod,
    selectedBranch: branchesHook.selectedBranch,
    branches: branchesHook.branches,
    branchesLoading: branchesHook.branchesLoading,
    branchesError: branchesHook.branchesError,
    
    // Form
    formData,
    errors,
    rememberMe,
    profileLoaded,
    formRef,
    
    // GPS
    useGPS: gpsHook.useGPS,
    userLocation: gpsHook.userLocation,
    locationLoading: gpsHook.locationLoading,
    locationError: gpsHook.locationError,
    gpsRetryCount: gpsHook.gpsRetryCount,
    MAX_GPS_RETRIES: gpsHook.MAX_GPS_RETRIES,
    
    // Coupon
    couponStatus: couponHook.couponStatus,
    couponData: couponHook.couponData,
    couponLoading: couponHook.couponLoading,
    
    // Prices
    prices: pricesHook.prices,
    pricesLoading: pricesHook.pricesLoading,
    pricesError: pricesHook.pricesError,
    
    // Submission
    isSubmitting: orderHook.isSubmitting,
    submitError: orderHook.submitError,
    
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
