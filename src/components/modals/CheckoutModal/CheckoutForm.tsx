// ✅ ENHANCED: CheckoutForm.tsx with Better Error Display & UX

'use client'

import { User, Phone, MapPin, MessageSquare, Tag, Navigation, CheckCircle, XCircle, Loader2, AlertCircle, Map, HelpCircle } from 'lucide-react'
import { useTheme } from '@/providers/ThemeProvider'

interface CheckoutFormProps {
  formData: any
  deliveryMethod: 'pickup' | 'delivery' | null
  errors: Record<string, string>
  userLocation: any
  locationLoading: boolean
  locationError: string | null
  couponStatus: 'valid' | 'error' | null
  couponData: any
  couponLoading: boolean
  useGPS: boolean
  gpsRetryCount: number
  maxGpsRetries: number
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
  onInputChange,
  onRequestLocation,
  onToggleAddressMode,
  onApplyCoupon,
  onRemoveCoupon
}: CheckoutFormProps) => {
  const { language } = useTheme()
  const isArabic = language === 'ar'

  // ✅ Helper: Format phone number display
  const formatPhoneDisplay = (phone: string) => {
    const digits = phone.replace(/\D/g, '')
    if (digits.length >= 10) {
      return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`
    }
    return phone
  }

  // ✅ Helper: Get coupon error message
  const getCouponErrorMessage = () => {
    if (!couponData?.error) return null
    
    // Map common backend errors to user-friendly messages
    const errorMap: Record<string, { ar: string; en: string }> = {
      'لقد استخدمت هذا الكوبون من قبل': {
        ar: '⚠️ لقد استخدمت هذا الكوبون من قبل',
        en: '⚠️ You have already used this coupon'
      },
      'الحد الأدنى للطلب': {
        ar: '📊 لم تصل لقيمة الحد الأدنى المطلوب',
        en: '📊 Order minimum not reached'
      },
      'كود الخصم غير صالح': {
        ar: '❌ كود الخصم غير صالح أو منتهي',
        en: '❌ Invalid or expired coupon code'
      },
      'تم استنفاد عدد مرات استخدام الكوبون': {
        ar: '🔒 تم استنفاد عدد مرات الاستخدام',
        en: '🔒 Coupon usage limit reached'
      }
    }

    // Check if error matches any mapped error
    for (const [key, value] of Object.entries(errorMap)) {
      if (couponData.error.includes(key)) {
        return isArabic ? value.ar : value.en
      }
    }

    // Return original error if no match
    return couponData.error
  }

  return (
    <div className="space-y-4 mb-6">
      {/* ===================================== */}
      {/* Name Input */}
      {/* ===================================== */}
      <div>
        <label className="flex items-center gap-2 text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">
          <User className="w-4 h-4 text-purple-600" />
          <span>{isArabic ? 'الاسم الكامل' : 'Full Name'} *</span>
        </label>
        <input
          type="text"
          className={`w-full px-4 py-3 border-2 rounded-xl transition-all dark:bg-gray-700 dark:text-white ${
            errors.name 
              ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
              : 'border-gray-300 dark:border-gray-600 focus:border-purple-600'
          }`}
          placeholder={isArabic ? 'أدخل اسمك الكامل' : 'Enter your full name'}
          value={formData.name}
          onChange={(e) => onInputChange('name', e.target.value)}
          maxLength={50}
        />
        {errors.name && (
          <div className="text-red-500 text-sm mt-1 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{errors.name}</span>
          </div>
        )}
      </div>

      {/* ===================================== */}
      {/* Phone Input - Enhanced */}
      {/* ===================================== */}
      <div>
        <label className="flex items-center gap-2 text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">
          <Phone className="w-4 h-4 text-purple-600" />
          <span>{isArabic ? 'رقم الهاتف' : 'Phone Number'} *</span>
        </label>
        <div className="relative">
          <input
            type="tel"
            className={`w-full px-4 py-3 border-2 rounded-xl transition-all dark:bg-gray-700 dark:text-white ${
              errors.phone 
                ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                : 'border-gray-300 dark:border-gray-600 focus:border-purple-600'
            }`}
            placeholder="01234567890"
            dir="ltr"
            value={formData.phone}
            onChange={(e) => onInputChange('phone', e.target.value.replace(/\D/g, '').substring(0, 11))}
          />
          
          {/* ✅ Phone validation indicator */}
          {formData.phone && !errors.phone && formData.phone.replace(/\D/g, '').length >= 10 && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
          )}
        </div>
        
        {errors.phone && (
          <div className="text-red-500 text-sm mt-1 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{errors.phone}</span>
          </div>
        )}
        
        {/* ✅ Phone format helper */}
        {formData.phone && !errors.phone && formData.phone.replace(/\D/g, '').length >= 10 && (
          <div className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center gap-2">
            <CheckCircle className="w-3 h-3" />
            <span>{formatPhoneDisplay(formData.phone)}</span>
          </div>
        )}
      </div>

      {/* ===================================== */}
      {/* Address Section with GPS/Manual Toggle */}
      {/* ===================================== */}
      {deliveryMethod === 'delivery' && (
        <div>
          <label className="flex items-center gap-2 text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">
            <MapPin className="w-4 h-4 text-purple-600" />
            <span>{isArabic ? 'عنوان التوصيل' : 'Delivery Address'} *</span>
          </label>
          
          {/* GPS/Manual Toggle Buttons */}
          <div className="flex gap-2 mb-3">
            <button
              type="button"
              onClick={() => onToggleAddressMode(true)}
              className={`flex-1 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                useGPS
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              <Navigation className="w-4 h-4" />
              <span>{isArabic ? 'استخدام GPS' : 'Use GPS'}</span>
            </button>
            <button
              type="button"
              onClick={() => onToggleAddressMode(false)}
              className={`flex-1 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                !useGPS
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              <Map className="w-4 h-4" />
              <span>{isArabic ? 'إدخال يدوي' : 'Manual Entry'}</span>
            </button>
          </div>

          {/* ===================================== */}
          {/* GPS Mode */}
          {/* ===================================== */}
          {useGPS && (
            <div className="space-y-3">
              {!userLocation ? (
                <button
                  type="button"
                  className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                    locationLoading
                      ? 'bg-gray-200 dark:bg-gray-700 cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-xl'
                  }`}
                  onClick={onRequestLocation}
                  disabled={locationLoading}
                >
                  {locationLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>{isArabic ? 'جاري تحديد الموقع...' : 'Getting location...'}</span>
                      {gpsRetryCount > 0 && (
                        <span className="text-xs opacity-80">
                          ({isArabic ? 'محاولة' : 'Attempt'} {gpsRetryCount}/{maxGpsRetries})
                        </span>
                      )}
                    </>
                  ) : (
                    <>
                      <Navigation className="w-5 h-5" />
                      <span>{isArabic ? '📍 الحصول على الموقع الحالي' : '📍 Get Current Location'}</span>
                    </>
                  )}
                </button>
              ) : (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border-2 border-green-500 rounded-xl">
                  <div className="flex items-center gap-2 text-green-700 dark:text-green-400 font-bold mb-2">
                    <CheckCircle className="w-5 h-5" />
                    <span>{isArabic ? '✅ تم تحديد الموقع بنجاح' : '✅ Location Set Successfully'}</span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <div>📍 Lat: {userLocation.lat.toFixed(6)}</div>
                    <div>📍 Lng: {userLocation.lng.toFixed(6)}</div>
                    <div>🎯 {isArabic ? 'الدقة' : 'Accuracy'}: ±{Math.round(userLocation.accuracy)}m</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onInputChange('address', '')
                      onRequestLocation()
                    }}
                    className="mt-3 text-purple-600 dark:text-purple-400 text-sm font-bold hover:underline flex items-center gap-1"
                  >
                    <Navigation className="w-4 h-4" />
                    <span>{isArabic ? 'تغيير الموقع' : 'Change Location'}</span>
                  </button>
                </div>
              )}

              {/* GPS Error Message with Help */}
              {locationError && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-500 rounded-xl">
                  <div className="flex items-center gap-2 text-red-700 dark:text-red-400 font-bold mb-2">
                    <AlertCircle className="w-5 h-5" />
                    <span>{isArabic ? 'خطأ في الموقع' : 'Location Error'}</span>
                  </div>
                  <div className="text-sm text-red-600 dark:text-red-400 mb-3">
                    {locationError}
                  </div>
                  
                  {/* Help Instructions */}
                  <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1 bg-white dark:bg-gray-800 p-3 rounded-lg">
                    <div className="font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1">
                      <HelpCircle className="w-4 h-4" />
                      <span>{isArabic ? '💡 حلول مقترحة:' : '💡 Troubleshooting:'}</span>
                    </div>
                    <div>• {isArabic ? 'السماح بالوصول للموقع في إعدادات المتصفح' : 'Allow location access in browser settings'}</div>
                    <div>• {isArabic ? 'تأكد من تفعيل GPS على الجهاز' : 'Make sure GPS is enabled on your device'}</div>
                    <div>• {isArabic ? 'تحقق من اتصال HTTPS' : 'Check if site has HTTPS connection'}</div>
                    <div>• {isArabic ? 'جرب الإدخال اليدوي أعلاه' : 'Try Manual Entry mode above'}</div>
                  </div>

                  {/* Retry Button */}
                  {gpsRetryCount < maxGpsRetries && (
                    <button
                      type="button"
                      onClick={onRequestLocation}
                      className="mt-3 w-full py-2 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition-all text-sm flex items-center justify-center gap-2"
                    >
                      <Navigation className="w-4 h-4" />
                      <span>
                        {isArabic ? '🔄 المحاولة مرة أخرى' : '🔄 Try Again'} 
                        ({maxGpsRetries - gpsRetryCount} {isArabic ? 'محاولات متبقية' : 'attempts left'})
                      </span>
                    </button>
                  )}
                </div>
              )}

              {/* GPS Address Display */}
              {userLocation && formData.address && (
                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-xl text-sm text-gray-600 dark:text-gray-400">
                  <div className="font-bold text-purple-700 dark:text-purple-300 mb-1 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{isArabic ? '📌 إحداثيات GPS' : '📌 GPS Coordinates'}</span>
                  </div>
                  <div className="text-xs break-all">
                    {formData.address}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ===================================== */}
          {/* Manual Mode */}
          {/* ===================================== */}
          {!useGPS && (
            <div className="space-y-3">
              <textarea
                className={`w-full px-4 py-3 border-2 rounded-xl min-h-[120px] transition-all dark:bg-gray-700 dark:text-white ${
                  errors.address 
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                    : 'border-gray-300 dark:border-gray-600 focus:border-purple-600'
                }`}
                placeholder={
                  isArabic 
                    ? 'أدخل عنوانك الكامل\n\nمثال:\nالعمارة 5، الطابق 2\n123 شارع الرئيسي\nمدينة نصر، القاهرة\n\nعلامات مميزة: بالقرب من سيتي ستارز'
                    : 'Enter your full address\n\nExample:\nBuilding 5, Floor 2\n123 Main Street\nNasr City, Cairo\n\nLandmarks: Near City Stars Mall'
                }
                value={formData.address}
                onChange={(e) => onInputChange('address', e.target.value)}
                maxLength={200}
              />
              
              {/* Character counter */}
              <div className="text-xs text-gray-500 dark:text-gray-400 text-right">
                {formData.address.length}/200
              </div>
              
              {errors.address && (
                <div className="text-red-500 text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.address}</span>
                </div>
              )}

              {/* Manual Address Notice */}
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded-lg">
                <div className="flex items-start gap-2 text-blue-700 dark:text-blue-400 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="font-bold">
                    {isArabic 
                      ? 'ℹ️ العنوان اليدوي قد يتطلب تأكيد هاتفي لضمان دقة التوصيل'
                      : 'ℹ️ Manual address may require phone verification for accurate delivery'
                    }
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===================================== */}
      {/* Notes Input */}
      {/* ===================================== */}
      <div>
        <label className="flex items-center gap-2 text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">
          <MessageSquare className="w-4 h-4 text-purple-600" />
          <span>{isArabic ? 'ملاحظات إضافية' : 'Additional Notes'}</span>
        </label>
        <textarea
          className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl min-h-[60px] focus:border-purple-600 transition-all"
          placeholder={isArabic ? 'أي طلبات خاصة (اختياري)' : 'Any special requests (optional)'}
          value={formData.notes}
          onChange={(e) => onInputChange('notes', e.target.value.substring(0, 300))}
        />
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
          {formData.notes.length}/300
        </div>
      </div>

      {/* ===================================== */}
      {/* Coupon Code - Enhanced */}
      {/* ===================================== */}
      <div>
        <label className="flex items-center gap-2 text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">
          <Tag className="w-4 h-4 text-purple-600" />
          <span>{isArabic ? 'كود الخصم' : 'Coupon Code'}</span>
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 px-4 py-3 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl uppercase focus:border-purple-600 transition-all disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
            placeholder={isArabic ? 'أدخل الكود' : 'Enter code'}
            value={formData.couponCode}
            onChange={(e) => onInputChange('couponCode', e.target.value.toUpperCase())}
            disabled={couponStatus === 'valid'}
            maxLength={20}
          />
          {couponStatus !== 'valid' ? (
            <button
              type="button"
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={onApplyCoupon}
              disabled={couponLoading || !formData.couponCode.trim()}
            >
              {couponLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <span>{isArabic ? 'تطبيق' : 'Apply'}</span>
              )}
            </button>
          ) : (
            <button
              type="button"
              className="px-6 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-all"
              onClick={onRemoveCoupon}
              title={isArabic ? 'إزالة الكوبون' : 'Remove coupon'}
            >
              <XCircle className="w-5 h-5" />
            </button>
          )}
        </div>
        
        {/* ✅ Coupon Success Message */}
        {couponStatus === 'valid' && couponData && (
          <div className="mt-2 p-3 bg-green-50 dark:bg-green-900/20 border-2 border-green-500 rounded-xl text-green-700 dark:text-green-400 text-sm">
            <div className="flex items-center gap-2 font-bold mb-1">
              <CheckCircle className="w-4 h-4" />
              <span>{isArabic ? '✅ تم تطبيق الكوبون بنجاح' : '✅ Coupon Applied Successfully'}</span>
            </div>
            <div className="text-xs">
              {couponData.messageAr || couponData.message || (isArabic ? 'تم تطبيق الخصم' : 'Discount applied')}
            </div>
          </div>
        )}
        
        {/* ✅ Coupon Error Message - Enhanced */}
        {couponStatus === 'error' && couponData?.error && (
          <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 border-2 border-red-500 rounded-xl text-red-600 dark:text-red-400 text-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="font-medium">{getCouponErrorMessage()}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CheckoutForm