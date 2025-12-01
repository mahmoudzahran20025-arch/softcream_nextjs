// ================================================================
// CheckoutForm - Uses Modular FormFields Components
// Same UI/UX as before, just refactored for maintainability
// ================================================================

'use client'

import { CheckCircle } from 'lucide-react'
import { useLanguage } from '@/providers/LanguageProvider'

// ✅ Import modular FormFields
import { NameInput, PhoneInput, AddressInput, NotesInput, CouponInput } from './FormFields'

interface CheckoutFormProps {
  formData: {
    name: string
    phone: string
    address: string
    notes: string
    couponCode: string
  }
  deliveryMethod: 'pickup' | 'delivery' | null
  errors: Record<string, string>
  userLocation: { lat: number; lng: number; accuracy: number } | null
  locationLoading: boolean
  locationError: string | null
  couponStatus: 'valid' | 'error' | null
  couponData: any
  couponLoading: boolean
  useGPS: boolean
  gpsRetryCount: number
  maxGpsRetries: number
  profileLoaded?: boolean
  onInputChange: (field: string, value: string) => void
  onRequestLocation: () => void
  onToggleAddressMode: (useGPS: boolean) => void
  onApplyCoupon: () => void
  onRemoveCoupon: () => void
}

const CheckoutForm = ({
  formData,
  deliveryMethod,
  errors,
  userLocation,
  locationLoading,
  locationError,
  couponStatus,
  couponData,
  couponLoading,
  useGPS,
  gpsRetryCount,
  maxGpsRetries,
  profileLoaded,
  onInputChange,
  onRequestLocation,
  onToggleAddressMode,
  onApplyCoupon,
  onRemoveCoupon
}: CheckoutFormProps) => {
  const { language } = useLanguage()
  const isArabic = language === 'ar'

  // Get first name for personalized message
  const getFirstName = (fullName: string): string => {
    if (!fullName) return ''
    const trimmed = fullName.trim()
    const firstSpace = trimmed.indexOf(' ')
    return firstSpace > 0 ? trimmed.substring(0, firstSpace) : trimmed
  }

  return (
    <div className="space-y-4 mb-6">
      {/* ===================================== */}
      {/* 🎯 Auto-Fill Welcome Message */}
      {/* ===================================== */}
      {profileLoaded && formData.name && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-700 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-green-700 dark:text-green-400">
              {isArabic ? `مرحباً بعودتك، ${getFirstName(formData.name)}! 👋` : `Welcome back, ${getFirstName(formData.name)}! 👋`}
            </p>
            <p className="text-sm text-green-600 dark:text-green-500">
              {isArabic ? 'تم تعبئة بياناتك تلقائياً' : 'Your details have been auto-filled'}
            </p>
          </div>
        </div>
      )}

      {/* ===================================== */}
      {/* Name Input */}
      {/* ===================================== */}
      <NameInput
        value={formData.name}
        error={errors.name}
        onChange={(value) => onInputChange('name', value)}
      />

      {/* ===================================== */}
      {/* Phone Input */}
      {/* ===================================== */}
      <PhoneInput
        value={formData.phone}
        error={errors.phone}
        onChange={(value) => onInputChange('phone', value)}
      />

      {/* ===================================== */}
      {/* Address Input (Only for Delivery) */}
      {/* ===================================== */}
      {deliveryMethod === 'delivery' && (
        <AddressInput
          value={formData.address}
          error={errors.address}
          useGPS={useGPS}
          userLocation={userLocation}
          locationLoading={locationLoading}
          locationError={locationError}
          gpsRetryCount={gpsRetryCount}
          maxGpsRetries={maxGpsRetries}
          onChange={(value) => onInputChange('address', value)}
          onRequestLocation={onRequestLocation}
          onToggleAddressMode={onToggleAddressMode}
        />
      )}

      {/* ===================================== */}
      {/* Notes Input */}
      {/* ===================================== */}
      <NotesInput
        value={formData.notes}
        onChange={(value) => onInputChange('notes', value)}
        maxLength={300}
      />

      {/* ===================================== */}
      {/* Coupon Input */}
      {/* ===================================== */}
      <CouponInput
        value={formData.couponCode}
        status={couponStatus}
        data={couponData}
        loading={couponLoading}
        onChange={(value) => onInputChange('couponCode', value)}
        onApply={onApplyCoupon}
        onRemove={onRemoveCoupon}
      />
    </div>
  )
}

export default CheckoutForm
