// ================================================================
// Coupon Input Field Component
// ================================================================

'use client'

import { Tag, CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react'
import { useLanguage } from '@/providers/LanguageProvider'
import type { CouponData } from '../types'

interface CouponInputProps {
  value: string
  status: 'valid' | 'error' | null
  data: CouponData | null
  loading: boolean
  onChange: (value: string) => void
  onApply: () => void
  onRemove: () => void
}

const CouponInput = ({ value, status, data, loading, onChange, onApply, onRemove }: CouponInputProps) => {
  const { language } = useLanguage()
  const isArabic = language === 'ar'

  const getCouponErrorMessage = () => {
    if (!data?.error) return null

    const errorMap: Record<string, { ar: string; en: string }> = {
      'لقد استخدمت هذا الكوبون من قبل': {
        ar: '⚠️ لقد استخدمت هذا الكوبون من قبل',
        en: '⚠️ You have already used this coupon'
      },
      'الحد الأدنى للطلب': {
        ar: '📊 لم تصل لقيمة الحد الأدنى المطلوب',
        en: '📊 Order minimum not reached'
      },
      'هذا الكوبون مخصص لأول طلب فقط': {
        ar: '🎯 هذا الكوبون للعملاء الجدد فقط!',
        en: '🎯 This coupon is for new customers only!'
      },
      'هذا الكوبون مخصص للعملاء المسجلين': {
        ar: '🔐 هذا الكوبون للعملاء المتكررين!',
        en: '🔐 This coupon is for returning customers!'
      },
      'كوبون التوصيل المجاني متاح فقط للتوصيل': {
        ar: '🚚 كوبون التوصيل المجاني للتوصيل للمنزل فقط!',
        en: '🚚 Free delivery coupon is for home delivery only!'
      }
    }

    for (const [key, val] of Object.entries(errorMap)) {
      if (data.error.includes(key)) return isArabic ? val.ar : val.en
    }
    return data.error
  }

  return (
    <div>
      <label className="flex items-center gap-2 text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">
        <Tag className="w-4 h-4 text-primary-600" />
        <span>{isArabic ? 'كود الخصم' : 'Coupon Code'}</span>
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-2xl uppercase transition-all shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
          placeholder={isArabic ? 'أدخل الكود' : 'Enter code'}
          value={value}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          disabled={status === 'valid'}
          maxLength={20}
        />
        {status !== 'valid' ? (
          <button
            type="button"
            className="px-6 py-3 bg-primary-600 text-white rounded-2xl font-bold hover:bg-primary-700 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            onClick={onApply}
            disabled={loading || !value.trim()}
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>{isArabic ? 'تطبيق' : 'Apply'}</span>}
          </button>
        ) : (
          <button
            type="button"
            className="px-6 py-3 bg-red-500 text-white rounded-2xl font-bold hover:bg-red-600 transition-all shadow-sm"
            onClick={onRemove}
          >
            <XCircle className="w-5 h-5" />
          </button>
        )}
      </div>

      {status === 'valid' && data && (
        <div className={`mt-2 p-3 border rounded-2xl text-sm shadow-sm ${
          data.isFreeDelivery
            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-700 dark:text-blue-400'
            : 'bg-green-50 dark:bg-green-900/20 border-green-500 text-green-700 dark:text-green-400'
        }`}>
          <div className="flex items-center gap-2 font-bold mb-1">
            <CheckCircle className="w-4 h-4" />
            <span>{data.isFreeDelivery ? (isArabic ? '🚚 توصيل مجاني!' : '🚚 Free Delivery!') : (isArabic ? '✅ تم تطبيق الكوبون' : '✅ Coupon Applied')}</span>
          </div>
          {data.discountAmount && data.discountAmount > 0 && (
            <div className="text-xs font-bold mt-1">{isArabic ? 'الخصم:' : 'Discount:'} {data.discountAmount.toFixed(2)} {isArabic ? 'ج.م' : 'EGP'}</div>
          )}
        </div>
      )}

      {status === 'error' && data?.error && (
        <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-500 rounded-2xl text-red-600 dark:text-red-400 text-sm shadow-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="font-medium">{getCouponErrorMessage()}</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default CouponInput
