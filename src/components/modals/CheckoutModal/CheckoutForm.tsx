// ✅ ENHANCED: CheckoutForm.tsx with Smart Location UI

'use client'

import { User, Phone, MapPin, MessageSquare, Tag, Navigation, CheckCircle, XCircle, Loader2, AlertCircle, Edit3 } from 'lucide-react'
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

    for (const [key, value] of Object.entries(errorMap)) {
      if (couponData.error.includes(key)) {
        return isArabic ? value.ar : value.en
      }
    }

    return couponData.error
  }

  return (
    <div className="space-y-4 mb-6">
      {/* ===================================== */}
      {/* Name Input */}
      {/* ===================================== */}
      <div>
        <label className="flex items-center gap-2 text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">
          <User className="w-4 h-4 text-primary-600" />
          <span>{isArabic ? 'الاسم الكامل' : 'Full Name'} *</span>
        </label>
        <input
          type="text"
          className={`w-full px-4 py-3 border rounded-2xl transition-all dark:bg-gray-700 dark:text-white shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
            errors.name 
              ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
              : 'border-gray-300 dark:border-gray-600'
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
      {/* Phone Input */}
      {/* ===================================== */}
      <div>
        <label className="flex items-center gap-2 text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">
          <Phone className="w-4 h-4 text-primary-600" />
          <span>{isArabic ? 'رقم الهاتف' : 'Phone Number'} *</span>
        </label>
        <div className="relative">
          <input
            type="tel"
            className={`w-full px-4 py-3 border rounded-2xl transition-all dark:bg-gray-700 dark:text-white shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
              errors.phone 
                ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                : 'border-gray-300 dark:border-gray-600'
            }`}
            placeholder="01234567890"
            dir="ltr"
            value={formData.phone}
            onChange={(e) => onInputChange('phone', e.target.value.replace(/\D/g, '').substring(0, 11))}
          />
          
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
        
        {formData.phone && !errors.phone && formData.phone.replace(/\D/g, '').length >= 10 && (
          <div className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center gap-2">
            <CheckCircle className="w-3 h-3" />
            <span>{formatPhoneDisplay(formData.phone)}</span>
          </div>
        )}
      </div>

      {/* ===================================== */}
      {/* Address Section - ✅ SMART LOCATION UI */}
      {/* ===================================== */}
      {deliveryMethod === 'delivery' && (
        <div>
          <label className="flex items-center gap-2 text-sm font-bold mb-3 text-gray-700 dark:text-gray-300">
            <MapPin className="w-4 h-4 text-primary-600" />
            <span>{isArabic ? 'عنوان التوصيل' : 'Delivery Address'} *</span>
          </label>
          
          {/* ===================================== */}
          {/* DEFAULT VIEW: GPS Mode */}
          {/* ===================================== */}
          {useGPS && (
            <div className="space-y-3">
              {!userLocation ? (
                <>
                  {/* ✅ REFINED GPS BUTTON */}
                  <button
                    type="button"
                    className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-md ${
                      locationLoading
                        ? 'bg-gray-200 dark:bg-gray-700 cursor-not-allowed'
                        : 'bg-primary-600 text-white hover:bg-primary-700 hover:shadow-lg active:scale-[0.98]'
                    }`}
                    onClick={onRequestLocation}
                    disabled={locationLoading}
                  >
                    {locationLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span className="text-base">{isArabic ? 'جاري تحديد الموقع...' : 'Getting location...'}</span>
                        {gpsRetryCount > 0 && (
                          <span className="text-sm opacity-80">
                            ({isArabic ? 'محاولة' : 'Attempt'} {gpsRetryCount}/{maxGpsRetries})
                          </span>
                        )}
                      </>
                    ) : (
                      <>
                        <Navigation className="w-5 h-5" />
                        <span className="text-base">{isArabic ? '📍 تحديد موقعي الحالي' : '📍 Detect My Location'}</span>
                      </>
                    )}
                  </button>

                  {/* ✅ MANUAL OPTION LINK */}
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => onToggleAddressMode(false)}
                      className="text-sm text-primary-600 dark:text-primary-400 hover:underline font-medium flex items-center justify-center gap-2 mx-auto"
                    >
                      <Edit3 className="w-4 h-4" />
                      <span>{isArabic ? 'أو إدخال العنوان يدوياً' : 'Or enter address details manually'}</span>
                    </button>
                  </div>
                </>
              ) : (
                // ✅ SUCCESS CARD: Location Verified (Cleaner)
                <div className="p-4 bg-green-50/50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-2xl shadow-sm">
                  <div className="flex items-center gap-2 text-green-700 dark:text-green-400 font-bold mb-2">
                    <CheckCircle className="w-5 h-5" />
                    <span>{isArabic ? '✅ تم تحديد الموقع بنجاح' : '✅ Location Verified'}</span>
                  </div>
                  
                  {/* ✅ HIDE RAW LAT/LNG - Show friendly message */}
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-green-600" />
                      <span>{isArabic ? 'موقعك الحالي محدد بدقة' : 'Your current location is set'}</span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {isArabic ? 'الدقة' : 'Accuracy'}: ±{Math.round(userLocation.accuracy)}m
                    </div>
                  </div>
                  
                  {/* Change Button */}
                  <button
                    type="button"
                    onClick={() => {
                      onInputChange('address', '')
                      onRequestLocation()
                    }}
                    className="text-primary-600 dark:text-primary-400 text-sm font-bold hover:underline flex items-center gap-1"
                  >
                    <Navigation className="w-4 h-4" />
                    <span>{isArabic ? 'تغيير الموقع' : 'Change Location'}</span>
                  </button>
                </div>
              )}

              {/* GPS Error Message */}
              {locationError && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-500 rounded-2xl shadow-sm">
                  <div className="flex items-center gap-2 text-red-700 dark:text-red-400 font-bold mb-2">
                    <AlertCircle className="w-5 h-5" />
                    <span>{isArabic ? 'خطأ في الموقع' : 'Location Error'}</span>
                  </div>
                  <div className="text-sm text-red-600 dark:text-red-400 mb-3">
                    {locationError}
                  </div>

                  {/* Retry Button */}
                  {gpsRetryCount < maxGpsRetries && (
                    <button
                      type="button"
                      onClick={onRequestLocation}
                      className="w-full py-2 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all text-sm flex items-center justify-center gap-2 shadow-sm"
                    >
                      <Navigation className="w-4 h-4" />
                      <span>
                        {isArabic ? '🔄 المحاولة مرة أخرى' : '🔄 Try Again'} 
                        ({maxGpsRetries - gpsRetryCount} {isArabic ? 'محاولات متبقية' : 'attempts left'})
                      </span>
                    </button>
                  )}
                  
                  {/* Switch to Manual */}
                  <button
                    type="button"
                    onClick={() => onToggleAddressMode(false)}
                    className="w-full mt-2 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all text-sm"
                  >
                    {isArabic ? 'التبديل للإدخال اليدوي' : 'Switch to Manual Entry'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ===================================== */}
          {/* MANUAL MODE */}
          {/* ===================================== */}
          {!useGPS && (
            <div className="space-y-3">
              <textarea
                className={`w-full px-4 py-3 border rounded-2xl min-h-[120px] transition-all dark:bg-gray-700 dark:text-white shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                  errors.address 
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                    : 'border-gray-300 dark:border-gray-600'
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
              
              <div className="text-xs text-gray-500 dark:text-gray-400 text-right">
                {formData.address.length}/200
              </div>
              
              {errors.address && (
                <div className="text-red-500 text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.address}</span>
                </div>
              )}

              {/* ✅ MANDATORY: Manual Address Notice */}
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded-xl shadow-sm">
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

              {/* Switch to GPS */}
              <button
                type="button"
                onClick={() => onToggleAddressMode(true)}
                className="text-sm text-primary-600 dark:text-primary-400 hover:underline font-medium flex items-center gap-2"
              >
                <Navigation className="w-4 h-4" />
                <span>{isArabic ? 'أو استخدام GPS للتحديد التلقائي' : 'Or use GPS for automatic detection'}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ===================================== */}
      {/* Notes Input */}
      {/* ===================================== */}
      <div>
        <label className="flex items-center gap-2 text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">
          <MessageSquare className="w-4 h-4 text-primary-600" />
          <span>{isArabic ? 'ملاحظات إضافية' : 'Additional Notes'}</span>
        </label>
        <textarea
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-2xl min-h-[60px] transition-all shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          placeholder={isArabic ? 'أي طلبات خاصة (اختياري)' : 'Any special requests (optional)'}
          value={formData.notes}
          onChange={(e) => onInputChange('notes', e.target.value.substring(0, 300))}
        />
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
          {formData.notes.length}/300
        </div>
      </div>

      {/* ===================================== */}
      {/* Coupon Code */}
      {/* ===================================== */}
      <div>
        <label className="flex items-center gap-2 text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">
          <Tag className="w-4 h-4 text-primary-600" />
          <span>{isArabic ? 'كود الخصم' : 'Coupon Code'}</span>
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-2xl uppercase transition-all shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
            placeholder={isArabic ? 'أدخل الكود' : 'Enter code'}
            value={formData.couponCode}
            onChange={(e) => onInputChange('couponCode', e.target.value.toUpperCase())}
            disabled={couponStatus === 'valid'}
            maxLength={20}
          />
          {couponStatus !== 'valid' ? (
            <button
              type="button"
              className="px-6 py-3 bg-primary-600 text-white rounded-2xl font-bold hover:bg-primary-700 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
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
              className="px-6 py-3 bg-red-500 text-white rounded-2xl font-bold hover:bg-red-600 transition-all shadow-sm"
              onClick={onRemoveCoupon}
              title={isArabic ? 'إزالة الكوبون' : 'Remove coupon'}
            >
              <XCircle className="w-5 h-5" />
            </button>
          )}
        </div>
        
        {couponStatus === 'valid' && couponData && (
          <div className="mt-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-500 rounded-2xl text-green-700 dark:text-green-400 text-sm shadow-sm">
            <div className="flex items-center gap-2 font-bold mb-1">
              <CheckCircle className="w-4 h-4" />
              <span>{isArabic ? '✅ تم تطبيق الكوبون بنجاح' : '✅ Coupon Applied Successfully'}</span>
            </div>
            <div className="text-xs">
              {couponData.messageAr || couponData.message || (isArabic ? 'تم تطبيق الخصم' : 'Discount applied')}
            </div>
          </div>
        )}
        
        {couponStatus === 'error' && couponData?.error && (
          <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-500 rounded-2xl text-red-600 dark:text-red-400 text-sm shadow-sm">
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
