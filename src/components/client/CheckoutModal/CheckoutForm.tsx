'use client'

//import React from 'react'
import { User, Phone, MapPin, MessageSquare, Tag, Navigation, CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react'

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
  onInputChange: (field: string, value: string) => void
  onRequestLocation: () => void
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
  onInputChange,
  onRequestLocation,
  onApplyCoupon,
  onRemoveCoupon
}: CheckoutFormProps) => {
  return (
    <div className="space-y-4 mb-6">
      {/* Name Input */}
      <div>
        <label className="flex items-center gap-2 text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">
          <User className="w-4 h-4 text-purple-600" />
          <span>Full Name *</span>
        </label>
        <input
          type="text"
          className={`w-full px-4 py-3 border-2 rounded-xl transition-all ${
            errors.name 
              ? 'border-red-500 bg-red-50' 
              : 'border-gray-300 focus:border-purple-600'
          }`}
          placeholder="Enter your name"
          value={formData.name}
          onChange={(e) => onInputChange('name', e.target.value)}
        />
        {errors.name && (
          <div className="text-red-500 text-sm mt-1 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{errors.name}</span>
          </div>
        )}
      </div>

      {/* Phone Input */}
      <div>
        <label className="flex items-center gap-2 text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">
          <Phone className="w-4 h-4 text-purple-600" />
          <span>Phone Number *</span>
        </label>
        <input
          type="tel"
          className={`w-full px-4 py-3 border-2 rounded-xl transition-all ${
            errors.phone 
              ? 'border-red-500 bg-red-50' 
              : 'border-gray-300 focus:border-purple-600'
          }`}
          placeholder="01234567890"
          dir="ltr"
          value={formData.phone}
          onChange={(e) => onInputChange('phone', e.target.value.replace(/\D/g, '').substring(0, 11))}
        />
        {errors.phone && (
          <div className="text-red-500 text-sm mt-1 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{errors.phone}</span>
          </div>
        )}
      </div>

      {/* Address + GPS (Delivery Only) */}
      {deliveryMethod === 'delivery' && (
        <div>
          <label className="flex items-center gap-2 text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">
            <MapPin className="w-4 h-4 text-purple-600" />
            <span>Detailed Address *</span>
          </label>
          
          {/* GPS Button */}
          <button
            type="button"
            className={`w-full mb-3 px-4 py-3 border-2 rounded-xl flex items-center justify-center gap-2 font-bold transition-all ${
              userLocation 
                ? 'border-green-500 bg-green-50 text-green-700' 
                : 'border-purple-600 bg-purple-50 text-purple-600 hover:bg-purple-100'
            }`}
            onClick={onRequestLocation}
            disabled={locationLoading}
          >
            {locationLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : userLocation ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <Navigation className="w-5 h-5" />
            )}
            <span>
              {locationLoading 
                ? 'Getting location...' 
                : userLocation 
                ? 'Location Set ✓'
                : 'Use Current Location'
              }
            </span>
          </button>

          {/* Location Error */}
          {locationError && (
            <div className="mb-3 p-3 bg-red-50 border-2 border-red-500 rounded-xl text-red-600 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{locationError}</span>
            </div>
          )}

          {/* Address Textarea */}
          <textarea
            className={`w-full px-4 py-3 border-2 rounded-xl min-h-[80px] transition-all ${
              errors.address 
                ? 'border-red-500 bg-red-50' 
                : 'border-gray-300 focus:border-purple-600'
            }`}
            placeholder="Street, Area..."
            value={formData.address}
            onChange={(e) => onInputChange('address', e.target.value)}
          />
          {errors.address && (
            <div className="text-red-500 text-sm mt-1 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{errors.address}</span>
            </div>
          )}
        </div>
      )}

      {/* Notes Input */}
      <div>
        <label className="flex items-center gap-2 text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">
          <MessageSquare className="w-4 h-4 text-purple-600" />
          <span>Additional Notes</span>
        </label>
        <textarea
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl min-h-[60px] focus:border-purple-600 transition-all"
          placeholder="Any special requests (optional)"
          value={formData.notes}
          onChange={(e) => onInputChange('notes', e.target.value.substring(0, 300))}
        />
        <div className="text-xs text-gray-500 mt-1 text-right">
          {formData.notes.length}/300
        </div>
      </div>

      {/* Coupon Code */}
      <div>
        <label className="flex items-center gap-2 text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">
          <Tag className="w-4 h-4 text-purple-600" />
          <span>Coupon Code</span>
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl uppercase focus:border-purple-600 transition-all disabled:bg-gray-100"
            placeholder="Enter code"
            value={formData.couponCode}
            onChange={(e) => onInputChange('couponCode', e.target.value.toUpperCase())}
            disabled={couponStatus === 'valid'}
          />
          {couponStatus !== 'valid' ? (
            <button
              type="button"
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50"
              onClick={onApplyCoupon}
              disabled={couponLoading || !formData.couponCode.trim()}
            >
              {couponLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                'Apply'
              )}
            </button>
          ) : (
            <button
              type="button"
              className="px-6 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-all"
              onClick={onRemoveCoupon}
            >
              <XCircle className="w-5 h-5" />
            </button>
          )}
        </div>
        
        {/* Coupon Success Message */}
        {couponStatus === 'valid' && couponData && (
          <div className="mt-2 p-3 bg-green-50 border-2 border-green-500 rounded-xl text-green-700 text-sm flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span className="font-bold">
              {couponData.messageAr || couponData.message || 'Coupon applied successfully'}
            </span>
          </div>
        )}
        
        {/* Coupon Error Message */}
        {couponStatus === 'error' && couponData?.error && (
          <div className="mt-2 p-3 bg-red-50 border-2 border-red-500 rounded-xl text-red-600 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{couponData.error}</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default CheckoutForm
