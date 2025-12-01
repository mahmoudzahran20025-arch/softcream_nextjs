// ================================================================
// Notes Input Field Component
// ================================================================

'use client'

import { MessageSquare } from 'lucide-react'
import { useLanguage } from '@/providers/LanguageProvider'

interface NotesInputProps {
  value: string
  onChange: (value: string) => void
  maxLength?: number
}

const NotesInput = ({ value, onChange, maxLength = 300 }: NotesInputProps) => {
  const { language } = useLanguage()
  const isArabic = language === 'ar'

  return (
    <div>
      <label className="flex items-center gap-2 text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">
        <MessageSquare className="w-4 h-4 text-primary-600" />
        <span>{isArabic ? 'ملاحظات إضافية' : 'Additional Notes'}</span>
      </label>
      <textarea
        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-2xl min-h-[60px] transition-all shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        placeholder={isArabic ? 'أي طلبات خاصة (اختياري)' : 'Any special requests (optional)'}
        value={value}
        onChange={(e) => onChange(e.target.value.substring(0, maxLength))}
      />
      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
        {value.length}/{maxLength}
      </div>
    </div>
  )
}

export default NotesInput
