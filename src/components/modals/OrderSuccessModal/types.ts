// ================================================================
// OrderSuccessModal Types
// ================================================================

export interface OrderItem {
  productId: string
  name: string
  quantity: number
  price: number
  total: number
}

export interface OrderTotals {
  subtotal: number
  deliveryFee: number
  discount: number
  total: number
}

export interface OrderCustomer {
  name: string
  phone: string
  address?: string | null
}

export interface BranchInfo {
  id?: string
  name: string
  address?: string
  phone?: string
  whatsapp?: string
  location?: { lat: number; lng: number }
  googleMapsUrl?: string
}

export interface SavedOrder {
  id: string
  status: string
  createdAt: string
  items: OrderItem[]
  totals: OrderTotals
  deliveryMethod: 'pickup' | 'delivery'
  branch?: string | BranchInfo | null
  branchName?: string
  branchPhone?: string
  branchWhatsApp?: string
  branchAddress?: string
  branchLocation?: { lat: number; lng: number }
  branchGoogleMapsUrl?: string
  customer: OrderCustomer
  eta?: string
  estimatedMinutes?: number
  couponCode?: string
}

export interface OrderSuccessModalProps {
  isOpen: boolean
  onClose: () => void
  order: SavedOrder
  onTrackOrder?: () => void
  onContactWhatsApp?: () => void
}
