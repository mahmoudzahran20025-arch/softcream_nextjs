// ================================================================
// utils.ts - Utility Functions
// ================================================================

/**
 * Open Google Maps directions to a branch
 * Opens in new tab with directions from user's current location
 * @param lat - Branch latitude
 * @param lng - Branch longitude
 */
export const openBranchDirections = (lat: number, lng: number): void => {
  if (!lat || !lng) {
    console.error('❌ Invalid coordinates:', { lat, lng })
    return
  }
  
  const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
  window.open(url, '_blank', 'noopener,noreferrer')
  console.log(`🗺️ Opening directions to: ${lat},${lng}`)
}

/**
 * Format phone number for calling
 * @param phone - Phone number
 * @returns Formatted phone number with country code
 */
export const formatPhoneForCall = (phone: string): string => {
  const cleanPhone = phone.replace(/\D/g, '')
  return `+2${cleanPhone}`
}

/**
 * Format phone number for WhatsApp
 * @param phone - Phone number
 * @param message - Optional message
 * @returns WhatsApp URL
 */
export const getWhatsAppUrl = (phone: string, message?: string): string => {
  const cleanPhone = phone.replace(/\D/g, '')
  const encodedMessage = message ? `?text=${encodeURIComponent(message)}` : ''
  return `https://wa.me/+2${cleanPhone}${encodedMessage}`
}

/**
 * Check if coordinates are valid
 * @param lat - Latitude
 * @param lng - Longitude
 * @returns True if valid
 */
export const isValidCoordinates = (lat: number, lng: number): boolean => {
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180 &&
    !isNaN(lat) &&
    !isNaN(lng)
  )
}

/**
 * Format date to Arabic locale
 * @param date - Date string or Date object
 * @returns Formatted date string
 */
export const formatDateArabic = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * Format currency
 * @param amount - Amount in EGP
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number): string => {
  return `${amount.toFixed(2)} ج.م`
}

/**
 * Debounce function
 * @param func - Function to debounce
 * @param wait - Wait time in ms
 * @returns Debounced function
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * Throttle function
 * @param func - Function to throttle
 * @param limit - Limit time in ms
 * @returns Throttled function
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean = false
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

console.log('✅ Utils loaded')
