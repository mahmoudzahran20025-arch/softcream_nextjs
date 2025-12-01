// ================================================================
// CheckoutModal Types
// ================================================================

export interface CheckoutFormData {
  name: string
  phone: string
  address: string
  notes: string
  couponCode: string
}

export interface CheckoutFormProps {
  formData: CheckoutFormData
  deliveryMethod: 'pickup' | 'delivery' | null
  errors: Record<string, string>
  userLocation: UserLocation | null
  locationLoading: boolean
  locationError: string | null
  couponStatus: 'valid' | 'error' | null
  couponData: CouponData | null
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

export interface UserLocation {
  lat: number
  lng: number
  accuracy: number
}

export interface CouponData {
  code?: string
  discountType?: 'percentage' | 'fixed' | 'free_delivery'
  discountValue?: number
  discountAmount?: number
  isFreeDelivery?: boolean
  message?: string
  messageAr?: string
  successMessageAr?: string
  error?: string
}

export interface Branch {
  id: string
  name: string
  nameEn?: string
  address?: string
  addressEn?: string
  phone?: string
  whatsapp?: string
  location_lat?: number
  location_lng?: number
  location?: { lat: number; lng: number }
  googleMapsUrl?: string
  is_active?: number
  available?: number
}

export interface PriceCalculation {
  subtotal: number
  deliveryFee: number
  discount: number
  total: number
  isOffline?: boolean
  deliveryInfo?: {
    isEstimated?: boolean
    branchName?: string
    distanceKm?: number
  }
  items?: any[]
}

export interface UseCheckoutLogicProps {
  isOpen: boolean
  onClose: () => void
  onCheckoutSuccess?: (orderId: string, orderData?: any) => void
}
