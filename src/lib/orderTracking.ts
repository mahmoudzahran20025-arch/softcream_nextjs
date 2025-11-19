// Unified Order Tracking System
// Handles time-based status transitions, customer edit windows, and admin controls

export interface OrderStatus {
  id: string
  status: 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'ready' | 'delivered' | 'cancelled'
  createdAt: string
  canCancelUntil?: string
  canEditUntil?: string
  estimatedMinutes?: number
  deliveryMethod: 'pickup' | 'delivery'
  processedBy?: string
  processedDate?: string
  customerLocation?: {
    lat: number
    lng: number
    address: string
  }
}

// Allow Order interface to be used interchangeably
export interface Order {
  id: string
  status: string
  items: any[]
  total: number
  totals?: {
    subtotal: number
    deliveryFee: number
    discount: number
    total: number
  }
  deliveryMethod?: 'pickup' | 'delivery'
  canCancelUntil?: string
  createdAt?: string
  estimatedMinutes?: number
  customer?: {
    name?: string
    phone?: string
    address?: string
  }
}

export interface StatusTransition {
  from: string
  to: string
  autoTransition: boolean
  delayMinutes: number
  requiresAction: 'admin' | 'telegram' | 'auto' | 'customer'
  conditions?: {
    maxWaitTime?: number
    deliveryMethod?: string
  }
}

// Status transition rules
export const STATUS_TRANSITIONS: StatusTransition[] = [
  {
    from: 'pending',
    to: 'confirmed',
    autoTransition: false,
    delayMinutes: 0,
    requiresAction: 'admin'
  },
  {
    from: 'confirmed',
    to: 'preparing',
    autoTransition: true,
    delayMinutes: 5,
    requiresAction: 'auto'
  },
  {
    from: 'preparing',
    to: 'ready',
    autoTransition: true,
    delayMinutes: 15,
    requiresAction: 'auto',
    conditions: {
      deliveryMethod: 'pickup'
    }
  },
  {
    from: 'preparing',
    to: 'out_for_delivery',
    autoTransition: true,
    delayMinutes: 20,
    requiresAction: 'auto',
    conditions: {
      deliveryMethod: 'delivery'
    }
  },
  {
    from: 'ready',
    to: 'delivered',
    autoTransition: false,
    delayMinutes: 0,
    requiresAction: 'customer'
  },
  {
    from: 'out_for_delivery',
    to: 'delivered',
    autoTransition: false,
    delayMinutes: 0,
    requiresAction: 'telegram'
  }
]

// Status configurations
export const STATUS_CONFIG = {
  pending: {
    label: 'قيد الانتظار',
    labelEn: 'Pending',
    color: 'bg-yellow-100 text-yellow-800',
    icon: '⏳',
    description: 'Order received, awaiting confirmation'
  },
  confirmed: {
    label: 'مؤكد',
    labelEn: 'Confirmed',
    color: 'bg-blue-100 text-blue-800',
    icon: '✅',
    description: 'Order confirmed, preparation will start soon'
  },
  preparing: {
    label: 'قيد التحضير',
    labelEn: 'Preparing',
    color: 'bg-purple-100 text-purple-800',
    icon: '👨‍🍳',
    description: 'Your order is being prepared'
  },
  ready: {
    label: 'جاهز للاستلام',
    labelEn: 'Ready for Pickup',
    color: 'bg-green-100 text-green-800',
    icon: '🏪',
    description: 'Order is ready for pickup from branch'
  },
  out_for_delivery: {
    label: 'في الطريق',
    labelEn: 'Out for Delivery',
    color: 'bg-orange-100 text-orange-800',
    icon: '🚚',
    description: 'Order is on the way to your location'
  },
  delivered: {
    label: 'تم التسليم',
    labelEn: 'Delivered',
    color: 'bg-green-100 text-green-800',
    icon: '🎉',
    description: 'Order has been delivered successfully'
  },
  cancelled: {
    label: 'ملغي',
    labelEn: 'Cancelled',
    color: 'bg-red-100 text-red-800',
    icon: '❌',
    description: 'Order has been cancelled'
  }
}

// Time-based utilities
export class TimeManager {
  static getEditWindowRemaining(order: OrderStatus | Order | any): number {
    if (!order.canCancelUntil) return 0
    
    const now = new Date()
    const deadline = new Date(order.canCancelUntil)
    const diffMs = deadline.getTime() - now.getTime()
    
    return Math.max(0, Math.floor(diffMs / 1000))
  }

  static canEditOrder(order: OrderStatus | Order | any): boolean {
    // Check if order is in editable status
    if (!order.status || !['pending', 'جديد'].includes(order.status)) {
      return false
    }
    
    // Check if within edit window
    return this.getEditWindowRemaining(order) > 0
  }

  static canCancelOrder(order: OrderStatus | Order | any): boolean {
    // Check if order is in cancellable status
    if (!order.status || !['pending', 'جديد', 'confirmed', 'مؤكد'].includes(order.status)) {
      return false
    }
    
    // Check if within cancel window
    return this.getEditWindowRemaining(order) > 0
  }

  static formatTimeRemaining(seconds: number, language: 'en' | 'ar' = 'en'): string {
    if (seconds <= 0) {
      return language === 'ar' ? 'انتهت' : 'Expired'
    }
    
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    
    if (minutes > 0) {
      return language === 'ar' 
        ? `${minutes}:${secs.toString().padStart(2, '0')} دقيقة`
        : `${minutes}:${secs.toString().padStart(2, '0')} min`
    }
    
    return language === 'ar' 
      ? `${secs} ثانية`
      : `${secs} sec`
  }

  static getEstimatedDeliveryTime(order: OrderStatus | Order | any, language: 'en' | 'ar' = 'en'): string {
    if (!order.estimatedMinutes) {
      return language === 'ar' ? 'غير محدد' : 'Not specified'
    }
    
    const now = new Date()
    const eta = new Date(now.getTime() + (order.estimatedMinutes * 60 * 1000))
    
    return eta.toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  static getOrderAge(order: OrderStatus | Order | any): number {
    if (!order.createdAt) return 0
    
    const now = new Date()
    const created = new Date(order.createdAt)
    const diffMs = now.getTime() - created.getTime()
    
    return Math.floor(diffMs / 1000) // Return age in seconds
  }

  static isOrderLate(order: OrderStatus | Order | any): boolean {
    if (!order.estimatedMinutes || !order.createdAt) return false
    
    const ageSeconds = this.getOrderAge(order)
    const estimatedSeconds = order.estimatedMinutes * 60
    
    return ageSeconds > estimatedSeconds
  }

  static getLateTime(order: OrderStatus | Order | any, language: 'en' | 'ar' = 'en'): string {
    if (!this.isOrderLate(order)) return ''
    
    const ageSeconds = this.getOrderAge(order)
    const estimatedSeconds = (order.estimatedMinutes || 0) * 60
    const lateSeconds = ageSeconds - estimatedSeconds
    
    const minutes = Math.floor(lateSeconds / 60)
    
    return language === 'ar' 
      ? `متأخر ${minutes} دقيقة`
      : `${minutes} min late`
  }

  static getNextAutoTransition(order: OrderStatus): StatusTransition | null {
    const transitions = STATUS_TRANSITIONS.filter(t => 
      t.from === order.status && 
      t.autoTransition &&
      (!t.conditions || this.meetsConditions(order, t.conditions))
    )
    
    if (transitions.length === 0) return null
    
    // Return the transition that should happen next
    return transitions[0]
  }

  static getAutoTransitionTime(order: OrderStatus): Date | null {
    const transition = this.getNextAutoTransition(order)
    if (!transition) return null
    
    const orderTime = new Date(order.createdAt).getTime()
    const transitionTime = orderTime + (transition.delayMinutes * 60 * 1000)
    return new Date(transitionTime)
  }

  private static meetsConditions(order: OrderStatus, conditions: any): boolean {
    if (conditions.deliveryMethod && order.deliveryMethod !== conditions.deliveryMethod) {
      return false
    }
    if (conditions.maxWaitTime) {
      const waitTime = (Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60)
      if (waitTime < conditions.maxWaitTime) return false
    }
    return true
  }
}

// Status update utilities
export class StatusManager {
  static canTransitionTo(currentStatus: string, newStatus: string, userRole: 'admin' | 'customer' | 'telegram'): boolean {
    const transition = STATUS_TRANSITIONS.find(t => 
      t.from === currentStatus && 
      t.to === newStatus
    )
    
    if (!transition) return false
    
    // Auto transitions are handled by system
    if (transition.autoTransition) return false
    
    // Check if user role is allowed
    switch (userRole) {
      case 'admin':
        return true // Admin can do any manual transition
      case 'customer':
        return newStatus === 'cancelled' && TimeManager.canCancelOrder({} as OrderStatus)
      case 'telegram':
        return transition.requiresAction === 'telegram'
      default:
        return false
    }
  }

  static getAvailableTransitions(currentStatus: string, userRole: 'admin' | 'customer' | 'telegram'): string[] {
    return STATUS_TRANSITIONS
      .filter(t => t.from === currentStatus)
      .filter(t => !t.autoTransition)
      .filter(t => this.canTransitionTo(currentStatus, t.to, userRole))
      .map(t => t.to)
  }

  static validateStatusUpdate(order: OrderStatus, newStatus: string, userRole: 'admin' | 'customer' | 'telegram'): {
    allowed: boolean
    reason?: string
  } {
    if (!this.canTransitionTo(order.status, newStatus, userRole)) {
      return {
        allowed: false,
        reason: `Cannot transition from ${order.status} to ${newStatus} for ${userRole}`
      }
    }

    if (newStatus === 'cancelled' && !TimeManager.canCancelOrder(order)) {
      return {
        allowed: false,
        reason: 'Order can no longer be cancelled'
      }
    }

    return { allowed: true }
  }
}

// Telegram integration utilities
export class TelegramManager {
  static formatOrderForDelivery(order: OrderStatus & { items: any[], customer: any }): string {
    const items = order.items.map((item: any) => 
      `• ${item.name} x${item.quantity} = ${item.total} ج.م`
    ).join('\n')

    return `
📦 *طلب جديد للتوصيل*

🆔 *رقم الطلب:* ${order.id}
👤 *العميل:* ${order.customer.name}
📱 *الهاتف:* ${order.customer.phone}
📍 *العنوان:* ${order.customerLocation?.address || 'غير محدد'}

🛒 *المنتجات:*
${items}

💰 *الإجمالي:* ${order.items.reduce((sum: number, item: any) => sum + item.total, 0)} ج.م
🚚 *طريقة التوصيل:* ${order.deliveryMethod === 'delivery' ? 'توصيل' : 'استلام من الفرع'}

⏱️ *وقت الطلب:* ${new Date(order.createdAt).toLocaleString('ar-EG')}
    `.trim()
  }

  static formatStatusUpdateForTelegram(order: OrderStatus): string {
    const config = STATUS_CONFIG[order.status]
    return `
📋 *تحديث حالة الطلب*

🆔 *رقم الطلب:* ${order.id}
📊 *الحالة الجديدة:* ${config.icon} ${config.label}
⏱️ *وقت التحديث:* ${new Date().toLocaleString('ar-EG')}
👤 *تم بواسطة:* ${order.processedBy || 'النظام'}
    `.trim()
  }

  static getDeliveryAgentButtons(order: OrderStatus): Array<{ text: string; callback_data: string }> {
    const buttons = []
    
    if (order.status === 'confirmed') {
      buttons.push({ text: '👨‍🍳 بدء التحضير', callback_data: `start_preparing_${order.id}` })
    }
    
    if (order.status === 'preparing' && order.deliveryMethod === 'delivery') {
      buttons.push({ text: '🚚 بدء التوصيل', callback_data: `start_delivery_${order.id}` })
    }
    
    if (order.status === 'out_for_delivery') {
      buttons.push({ text: '✅ تم التوصيل', callback_data: `complete_delivery_${order.id}` })
    }
    
    buttons.push({ text: '📍 عرض الموقع', callback_data: `show_location_${order.id}` })
    buttons.push({ text: '📞 اتصل بالعميل', callback_data: `call_customer_${order.id}` })
    
    return buttons
  }
}

// Polling configuration for different statuses
export const POLLING_CONFIG = {
  // English statuses
  'pending': 20000,        // 20s - New order
  'confirmed': 20000,      // 20s - Confirmed
  'preparing': 30000,      // 30s - Preparing
  'out_for_delivery': 15000,  // 15s - Out for delivery
  'ready': 30000,          // 30s - Ready for pickup
  'delivered': 0,          // Stop polling
  'cancelled': 0,          // Stop polling
  
  // Arabic statuses (same intervals)
  'جديد': 20000,           // 20s - New order
  'مؤكد': 20000,           // 20s - Confirmed
  'قيد التحضير': 30000,    // 30s - Preparing
  'في الطريق': 15000,      // 15s - Out for delivery
  'جاهز': 30000,           // 30s - Ready for pickup
  'تم التوصيل': 0,         // Stop polling
  'ملغي': 0,               // Stop polling
  
  'default': 20000         // 20s - Default
}

export const FINAL_STATUSES = ['delivered', 'cancelled', 'تم التوصيل', 'ملغي', 'مكتمل', 'completed']

// Pickup-specific stages (4 stages only, no "في الطريق")
export const PICKUP_STAGES = [
  {
    id: 'pending',
    label: 'جديد',
    labelEn: 'New',
    icon: '⏳',
    progress: 0
  },
  {
    id: 'confirmed',
    label: 'مؤكد',
    labelEn: 'Confirmed',
    icon: '✅',
    progress: 33
  },
  {
    id: 'preparing',
    label: 'قيد التحضير',
    labelEn: 'Preparing',
    icon: '👨‍🍳',
    progress: 66
  },
  {
    id: 'ready',
    label: 'جاهز للاستلام',
    labelEn: 'Ready for Pickup',
    icon: '🏪',
    progress: 100
  }
]

// Delivery-specific stages (5 stages including "في الطريق")
export const DELIVERY_STAGES = [
  {
    id: 'pending',
    label: 'جديد',
    labelEn: 'New',
    icon: '⏳',
    progress: 0
  },
  {
    id: 'confirmed',
    label: 'مؤكد',
    labelEn: 'Confirmed',
    icon: '✅',
    progress: 25
  },
  {
    id: 'preparing',
    label: 'قيد التحضير',
    labelEn: 'Preparing',
    icon: '👨‍🍳',
    progress: 50
  },
  {
    id: 'out_for_delivery',
    label: 'في الطريق',
    labelEn: 'Out for Delivery',
    icon: '🚚',
    progress: 75
  },
  {
    id: 'delivered',
    label: 'تم التسليم',
    labelEn: 'Delivered',
    icon: '🎉',
    progress: 100
  }
]
