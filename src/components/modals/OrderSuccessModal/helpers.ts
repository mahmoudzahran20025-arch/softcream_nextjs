// ================================================================
// OrderSuccessModal Helper Functions
// ================================================================

import confetti from 'canvas-confetti'
import type { SavedOrder } from './types'

export const getFirstName = (fullName: string): string => {
  if (!fullName) return ''
  const trimmed = fullName.trim()
  const firstSpace = trimmed.indexOf(' ')
  return firstSpace > 0 ? trimmed.substring(0, firstSpace) : trimmed
}

export const getBranchPhone = (order: SavedOrder): string => {
  if (order.branchPhone) return order.branchPhone
  if (typeof order.branch === 'object' && order.branch?.phone) return order.branch.phone
  return ''
}

export const getBranchWhatsApp = (order: SavedOrder): string => {
  if (order.branchWhatsApp) return order.branchWhatsApp
  if (typeof order.branch === 'object' && order.branch?.whatsapp) return order.branch.whatsapp
  return getBranchPhone(order)
}

export const getBranchName = (order: SavedOrder): string => {
  if (order.branchName) return order.branchName
  if (typeof order.branch === 'object' && order.branch?.name) return order.branch.name
  if (typeof order.branch === 'string') return order.branch
  return ''
}

export const getBranchLocation = (order: SavedOrder): { lat: number; lng: number } | null => {
  if (order.branchLocation) return order.branchLocation
  if (typeof order.branch === 'object' && order.branch?.location) return order.branch.location
  return null
}

export const getBranchGoogleMapsUrl = (order: SavedOrder): string | null => {
  if (order.branchGoogleMapsUrl) return order.branchGoogleMapsUrl
  if (typeof order.branch === 'object' && order.branch?.googleMapsUrl) return order.branch.googleMapsUrl

  const location = getBranchLocation(order)
  if (location) {
    return `https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}`
  }

  const branchName = getBranchName(order)
  if (branchName) {
    return `https://www.google.com/maps/search/?api=1&query=Soft+Cream+${encodeURIComponent(branchName)}`
  }

  return null
}

export const generateWhatsAppInquiry = (order: SavedOrder): string => {
  const branchName = getBranchName(order)
  return `مرحباً 👋
أريد الاستعلام عن طلبي

📦 رقم الطلب: #${order.id}
👤 الاسم: ${order.customer.name}
📱 الهاتف: ${order.customer.phone}
${order.deliveryMethod === 'pickup' ? `🏪 استلام من فرع: ${branchName}` : '🚚 توصيل للمنزل'}

شكراً لكم 🍦`
}

export const triggerConfetti = () => {
  const duration = 2500
  const animationEnd = Date.now() + duration
  const defaults = {
    startVelocity: 30,
    spread: 360,
    ticks: 60,
    zIndex: 10000,
    colors: ['#ec4899', '#a855f7', '#f472b6', '#c084fc', '#fbbf24', '#34d399']
  }

  const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min

  const interval = window.setInterval(() => {
    const timeLeft = animationEnd - Date.now()
    if (timeLeft <= 0) return clearInterval(interval)
    const particleCount = 40 * (timeLeft / duration)
    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } })
    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } })
  }, 200)
}
