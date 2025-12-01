// ================================================================
// Name Input Field Component
// ================================================================

'use client'

import { User, AlertCircle } from 'lucide-react'
import { useLanguage } from '@/providers/LanguageProvider'

interface NameInputProps {
  value: string
  error?: string
  onChange: (value: string) => void
}

const NameInput = ({ value, error, onChange }: NameInputProps) => {
  const { language } = useLanguage()
  const isArabic = language === 'ar'

  return (
    <div>
      <label className="flex items-center gap-2 text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">
        <User className="w-4 h-4 text-primary-600" />
        <span>{isArabic ? 'الاسم الكامل' : 'Full Name'} *</span>
      </label>
      <input
        type="text"
        className={`w-full px-4 py-3 border rounded-2xl transition-all dark:bg-gray-700 dark:text-white shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
          error
            ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
            : 'border-gray-300 dark:border-gray-600'
        }`}
        placeholder={isArabic ? 'أدخل اسمك الكامل' : 'Enter your full name'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={50}
      />
      {error && (
        <div className="text-red-500 text-sm mt-1 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}

export default NameInput
