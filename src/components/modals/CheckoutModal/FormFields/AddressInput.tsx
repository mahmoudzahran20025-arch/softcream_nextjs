// ================================================================
// Address Input Field Component - GPS & Manual Mode
// ================================================================

'use client'

import { MapPin, Navigation, CheckCircle, Loader2, AlertCircle, Edit3 } from 'lucide-react'
import { useLanguage } from '@/providers/LanguageProvider'

interface AddressInputProps {
  value: string
  error?: string
  useGPS: boolean
  userLocation: { lat: number; lng: number; accuracy: number } | null
  locationLoading: boolean
  locationError: string | null
  gpsRetryCount: number
  maxGpsRetries: number
  onChange: (value: string) => void
  onRequestLocation: () => void
  onToggleAddressMode: (useGPS: boolean) => void
}

const AddressInput = ({
  value,
  error,
  useGPS,
  userLocation,
  locationLoading,
  locationError,
  gpsRetryCount,
  maxGpsRetries,
  onChange,
  onRequestLocation,
  onToggleAddressMode
}: AddressInputProps) => {
  const { language } = useLanguage()
  const isArabic = language === 'ar'

  return (
    <div>
      <label className="flex items-center gap-2 text-sm font-bold mb-3 text-gray-700 dark:text-gray-300">
        <MapPin className="w-4 h-4 text-primary-600" />
        <span>{isArabic ? 'عنوان التوصيل' : 'Delivery Address'} *</span>
      </label>
      
      {/* GPS Mode */}
      {useGPS && (
        <div className="space-y-3">
          {!userLocation ? (
            <>
              {/* GPS Button */}
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

              {/* Manual Option Link */}
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
            /* Success Card: Location Verified */
            <div className="p-4 bg-green-50/50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-2xl shadow-sm">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-400 font-bold mb-2">
                <CheckCircle className="w-5 h-5" />
                <span>{isArabic ? '✅ تم تحديد الموقع بنجاح' : '✅ Location Verified'}</span>
              </div>
              
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
                  onChange('')
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

      {/* Manual Mode */}
      {!useGPS && (
        <div className="space-y-3">
          <textarea
            className={`w-full px-4 py-3 border rounded-2xl min-h-[120px] transition-all dark:bg-gray-700 dark:text-white shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
              error 
                ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                : 'border-gray-300 dark:border-gray-600'
            }`}
            placeholder={
              isArabic 
                ? 'أدخل عنوانك الكامل\n\nمثال:\nالعمارة 5، الطابق 2\n123 شارع الرئيسي\nمدينة نصر، القاهرة\n\nعلامات مميزة: بالقرب من سيتي ستارز'
                : 'Enter your full address\n\nExample:\nBuilding 5, Floor 2\n123 Main Street\nNasr City, Cairo\n\nLandmarks: Near City Stars Mall'
            }
            value={value}
            onChange={(e) => onChange(e.target.value)}
            maxLength={200}
          />
          
          <div className="text-xs text-gray-500 dark:text-gray-400 text-right">
            {value.length}/200
          </div>
          
          {error && (
            <div className="text-red-500 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          {/* Manual Address Notice */}
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
  )
}

export default AddressInput
