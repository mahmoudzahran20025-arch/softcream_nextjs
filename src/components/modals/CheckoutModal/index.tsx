// ✅ REFACTORED: CheckoutModal - Clean Orchestrator (< 200 lines)
// All business logic extracted to useCheckoutLogic.ts

'use client'

import { X, ShoppingCart, Loader2 } from 'lucide-react'
import { useLanguage } from '@/providers/LanguageProvider'
import { useProductsData } from '@/providers/ProductsProvider'
import DeliveryOptions from './DeliveryOptions'
import CheckoutForm from './CheckoutForm'
import OrderSummary from './OrderSummary'
import { useCheckoutLogic } from './useCheckoutLogic'

interface CheckoutModalProps {
  isOpen: boolean
  onClose: () => void
  onCheckoutSuccess?: (orderId: string, orderData?: any) => void
  onSuccess?: (orderId: string) => void
  onOpenTracking?: (order: any) => void
}

const CheckoutModal = ({ isOpen, onClose, onCheckoutSuccess, onOpenTracking }: CheckoutModalProps) => {
  const { language } = useLanguage()
  const { productsMap } = useProductsData()
  
  void onOpenTracking
  
  // ✅ ALL LOGIC EXTRACTED TO CUSTOM HOOK
  const {
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
  } = useCheckoutLogic({ isOpen, onClose, onCheckoutSuccess })

  if (!isOpen) return null

  return (
    <>
      {isOpen && (
      <div
        className="fixed inset-0 bg-gray-900/80 backdrop-blur-md z-[9100] flex items-center justify-center p-5 overflow-y-auto"
        onClick={() => !isSubmitting && onClose()}
      >
      <div
        className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-[650px] w-full max-h-[90vh] overflow-y-auto shadow-2xl relative
        [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-track]:rounded-full
        [&::-webkit-scrollbar-thumb]:bg-primary-500 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-primary-600"
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
          <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white shadow-lg">
            <ShoppingCart className="w-8 h-8" />
          </div>
          <h3 className="text-[26px] font-black text-gray-800 dark:text-gray-100 mb-2">
            {language === 'ar' ? 'تأكيد الطلب' : 'Confirm Order'}
          </h3>
          <p className="text-base text-gray-600 dark:text-gray-400">
            {language === 'ar' ? 'اختر طريقة التوصيل واكمل تفاصيلك' : 'Select delivery method and complete your details'}
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
        <div ref={formRef}>
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
        </div>

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

        {/* Remember Me Checkbox */}
        {deliveryMethod && (
          <div className="mt-4 mb-2">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-5 h-5 rounded border-2 border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-2 focus:ring-primary-500 cursor-pointer"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
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

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <button
            className="py-4 px-6 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-2xl font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
            onClick={onClose}
            disabled={isSubmitting}
          >
            {language === 'ar' ? 'إلغاء' : 'Cancel'}
          </button>
          <button
            className="flex-1 py-4 px-6 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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

        {/* Submit Error */}
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
