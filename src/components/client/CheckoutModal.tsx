'use client'

import { useState } from 'react'
import { X, MapPin, Phone, Mail, CreditCard, Truck, CheckCircle2 } from 'lucide-react'
import { useCart } from '@/providers/CartProvider'

interface CheckoutModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: (orderId: string) => void
  total?: number
}

export default function CheckoutModal({ isOpen, onClose, onSuccess, total = 0 }: CheckoutModalProps) {
  const { cart, clearCart } = useCart()
  const [step, setStep] = useState<'info' | 'payment' | 'success'>('info')
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
  })

  if (!isOpen) return null

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmitInfo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.phone || !formData.address) {
      alert('يرجى ملء جميع الحقول المطلوبة')
      return
    }
    setStep('payment')
  }

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const orderId = `ORD-${Date.now()}`
      clearCart()
      setStep('success')
      
      setTimeout(() => {
        onSuccess?.(orderId)
        onClose()
      }, 2000)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (step === 'success') {
      onClose()
    } else {
      setStep('info')
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/75 backdrop-blur-md z-[9999] flex items-end md:items-center justify-center md:p-6"
      onClick={handleClose}
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
            {step === 'info' && 'معلومات التوصيل'}
            {step === 'payment' && 'الدفع'}
            {step === 'success' && 'تم بنجاح!'}
          </h2>
          <button
            onClick={handleClose}
            className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-red-500 hover:text-white flex items-center justify-center transition-colors"
            aria-label="إغلاق"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'info' && (
            <form onSubmit={handleSubmitInfo} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                  الاسم الكامل *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="أحمد محمد"
                  className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 rounded-lg border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                  رقم الهاتف *
                </label>
                <div className="flex items-center gap-2">
                  <Phone className="w-5 h-5 text-slate-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="01012345678"
                    className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 rounded-lg border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                  البريد الإلكتروني
                </label>
                <div className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="example@email.com"
                    className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 rounded-lg border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                  العنوان *
                </label>
                <div className="flex items-start gap-2">
                  <MapPin className="w-5 h-5 text-slate-400 mt-2 flex-shrink-0" />
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="شارع النيل، القاهرة"
                    rows={3}
                    className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 rounded-lg border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-600 resize-none"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                  ملاحظات إضافية
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="أي ملاحظات خاصة..."
                  rows={2}
                  className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 rounded-lg border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-600 resize-none"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-bold transition-all active:scale-95"
              >
                المتابعة للدفع
              </button>
            </form>
          )}

          {step === 'payment' && (
            <form onSubmit={handleSubmitPayment} className="space-y-4">
              {/* Order Summary */}
              <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 mb-6">
                <h3 className="font-bold text-slate-900 dark:text-white mb-3">ملخص الطلب</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">عدد المنتجات:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{cart.length}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t border-slate-200 dark:border-slate-600 pt-2">
                    <span className="text-slate-900 dark:text-white">الإجمالي:</span>
                    <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      {total} ج.م
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-slate-900 dark:text-white mb-3">
                  طريقة الدفع
                </label>
                <div className="space-y-2">
                  <label className="flex items-center p-3 border-2 border-purple-600 rounded-lg cursor-pointer bg-purple-50 dark:bg-purple-900/20">
                    <input type="radio" name="payment" defaultChecked className="w-4 h-4" />
                    <CreditCard className="w-5 h-5 text-purple-600 mx-2" />
                    <span className="text-slate-900 dark:text-white font-medium">بطاقة ائتمان</span>
                  </label>
                  <label className="flex items-center p-3 border-2 border-slate-200 dark:border-slate-600 rounded-lg cursor-pointer hover:border-purple-600">
                    <input type="radio" name="payment" className="w-4 h-4" />
                    <Truck className="w-5 h-5 text-slate-600 dark:text-slate-400 mx-2" />
                    <span className="text-slate-900 dark:text-white font-medium">الدفع عند الاستلام</span>
                  </label>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-bold transition-all active:scale-95 disabled:opacity-50"
              >
                {isLoading ? 'جاري المعالجة...' : 'تأكيد الطلب'}
              </button>
            </form>
          )}

          {step === 'success' && (
            <div className="text-center py-8">
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                تم الطلب بنجاح!
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                شكراً لك على طلبك. سيصل إليك قريباً!
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-500">
                سيتم إغلاق هذه النافذة تلقائياً...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
