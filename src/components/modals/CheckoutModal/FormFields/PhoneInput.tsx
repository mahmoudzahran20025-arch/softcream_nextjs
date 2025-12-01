// ================================================================
// Phone Input Field Component
// ================================================================

'use client'

import { Phone, CheckCircle, AlertCircle } from 'lucide-react'
import { useLanguage } from '@/providers/LanguageProvider'

interface PhoneInputProps {
  value: string
  error?: string
  onChange: (value: string) => void
}

const PhoneInput = ({ value, error, onChange }: PhoneInputProps) => {
  const { language } = useLanguage()
  const isArabic = language === 'ar'

  const formatPhoneDisplay = (phone: string) => {
    const digits = phone.replace(/\D/g, '')
    if (digits.length >= 10) {
      return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`
    }
    return phone
  }

  const isValidPhone = value.replace(/\D/g, '').length >= 10

  return (
    <div>
      <label className="flex items-center gap-2 text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">
        <Phone className="w-4 h-4 text-primary-600" />
        <span>{isArabic ? 'رقم الهاتف' : 'Phone Number'} *</span>
      </label>
      <div className="relative">
        <input
          type="tel"
          className={`w-full px-4 py-3 border rounded-2xl transition-all dark:bg-gray-700 dark:text-white shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
            error
              ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
              : 'border-gray-300 dark:border-gray-600'
          }`}
          placeholder="01234567890"
          dir="ltr"
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/\D/g, '').substring(0, 11))}
        />
        {value && !error && isValidPhone && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <CheckCircle className="w-5 h-5 text-green-500" />
          </div>
        )}
      </div>

      {error && (
        <div className="text-red-500 text-sm mt-1 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {value && !error && isValidPhone && (
        <div className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center gap-2">
          <CheckCircle className="w-3 h-3" />
          <span>{formatPhoneDisplay(value)}</span>
        </div>
      )}
    </div>
  )
}

export default PhoneInput
