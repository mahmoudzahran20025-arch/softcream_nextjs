'use client'

import { useState, useEffect } from 'react'
import { X, Package, Truck, CheckCircle2, Clock, MapPin, Phone } from 'lucide-react'

interface Order {
  id: string
  status: 'pending' | 'confirmed' | 'preparing' | 'on_the_way' | 'delivered'
  createdAt: string
  eta?: string
  items: Array<{
    productId: string
    name: string
    quantity: number
    price: number
  }>
  totals: {
    subtotal: number
    deliveryFee: number
    discount: number
    total: number
  }
  customer: {
    name: string
    phone: string
    address?: string
  }
  deliveryMethod: 'pickup' | 'delivery'
}

interface TrackingModalProps {
  isOpen: boolean
  onClose: () => void
  order?: Order | null
}

const statusSteps = [
  { key: 'pending', label: 'قيد الانتظار', icon: Clock, color: 'text-yellow-500' },
  { key: 'confirmed', label: 'تم التأكيد', icon: CheckCircle2, color: 'text-blue-500' },
  { key: 'preparing', label: 'قيد التحضير', icon: Package, color: 'text-purple-500' },
  { key: 'on_the_way', label: 'في الطريق', icon: Truck, color: 'text-orange-500' },
  { key: 'delivered', label: 'تم التسليم', icon: CheckCircle2, color: 'text-green-500' },
]

export default function TrackingModal({ isOpen, onClose, order }: TrackingModalProps) {
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    if (order) {
      const stepIndex = statusSteps.findIndex(step => step.key === order.status)
      setCurrentStep(stepIndex >= 0 ? stepIndex : 0)
    }
  }, [order])

  if (!isOpen || !order) return null

  const getStatusColor = (index: number) => {
    if (index < currentStep) return 'bg-green-500'
    if (index === currentStep) return 'bg-blue-500'
    return 'bg-slate-300 dark:bg-slate-600'
  }

  const getStatusTextColor = (index: number) => {
    if (index <= currentStep) return 'text-slate-900 dark:text-white'
    return 'text-slate-500 dark:text-slate-400'
  }

  return (
    <div
      className="fixed inset-0 bg-black/75 backdrop-blur-md z-[9999] flex items-end md:items-center justify-center md:p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-t-3xl md:rounded-3xl max-w-[500px] w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800 z-10">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            تتبع الطلب
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-red-500 hover:text-white flex items-center justify-center transition-colors"
            aria-label="إغلاق"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Order ID */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-4">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">رقم الطلب</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{order.id}</p>
          </div>

          {/* Timeline */}
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white">حالة الطلب</h3>
            <div className="space-y-3">
              {statusSteps.map((step, index) => {
                const Icon = step.icon
                const isCompleted = index < currentStep
                const isCurrent = index === currentStep

                return (
                  <div key={step.key} className="flex items-center gap-4">
                    {/* Circle */}
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${getStatusColor(index)}`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>

                    {/* Text */}
                    <div className="flex-1">
                      <p className={`font-semibold transition-colors ${getStatusTextColor(index)}`}>
                        {step.label}
                      </p>
                      {isCurrent && (
                        <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                          الحالة الحالية
                        </p>
                      )}
                      {isCompleted && (
                        <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                          تم إكماله
                        </p>
                      )}
                    </div>

                    {/* Connector Line */}
                    {index < statusSteps.length - 1 && (
                      <div className={`absolute right-[23px] w-1 h-8 -bottom-8 transition-colors ${
                        index < currentStep ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-600'
                      }`} />
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* ETA */}
          {order.eta && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <p className="font-semibold text-blue-900 dark:text-blue-100">الوقت المتوقع</p>
              </div>
              <p className="text-blue-800 dark:text-blue-200">{order.eta}</p>
            </div>
          )}

          {/* Delivery Info */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 dark:text-white">معلومات التسليم</h3>

            {/* Customer */}
            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {order.customer.name.charAt(0)}
                </span>
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">العميل</p>
                <p className="font-semibold text-slate-900 dark:text-white">{order.customer.name}</p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
              <Phone className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">رقم الهاتف</p>
                <p className="font-semibold text-slate-900 dark:text-white">{order.customer.phone}</p>
              </div>
            </div>

            {/* Address */}
            {order.customer.address && order.deliveryMethod === 'delivery' && (
              <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                <MapPin className="w-5 h-5 text-slate-600 dark:text-slate-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">عنوان التسليم</p>
                  <p className="font-semibold text-slate-900 dark:text-white">{order.customer.address}</p>
                </div>
              </div>
            )}
          </div>

          {/* Order Items */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 dark:text-white">المنتجات</h3>
            <div className="space-y-2">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">{item.name}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">الكمية: {item.quantity}</p>
                  </div>
                  <p className="font-bold text-slate-900 dark:text-white">{item.price * item.quantity} ج.م</p>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-slate-600 dark:text-slate-400">الإجمالي:</span>
              <span className="font-bold text-lg text-slate-900 dark:text-white">
                {order.totals.total} ج.م
              </span>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-bold transition-all"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  )
}
