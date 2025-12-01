// ================================================================
// useCoupon Hook - Coupon Validation & Management
// ================================================================

'use client'

import { useState, useCallback } from 'react'
import { useToast } from '@/providers/ToastProvider'
import { useLanguage } from '@/providers/LanguageProvider'
import { validateCoupon } from '@/lib/api'
import type { CouponData } from '../types'

export const useCoupon = () => {
  const { language } = useLanguage()
  const { showToast } = useToast()

  const [couponStatus, setCouponStatus] = useState<'valid' | 'error' | null>(null)
  const [couponData, setCouponData] = useState<CouponData | null>(null)
  const [couponLoading, setCouponLoading] = useState(false)

  const handleApplyCoupon = useCallback(async (
    code: string,
    phone: string,
    subtotal: number,
    deliveryMethod: 'pickup' | 'delivery' | null
  ) => {
    const trimmedCode = code.trim().toUpperCase()
    if (!trimmedCode) return

    setCouponLoading(true)
    setCouponStatus(null)

    try {
      const phoneForCoupon = phone.replace(/\D/g, '') || '0000000000'
      const result = await validateCoupon(trimmedCode, phoneForCoupon, subtotal, deliveryMethod)

      if (result.valid) {
        setCouponStatus('valid')
        setCouponData(result.coupon)
        console.log('✅ Coupon valid:', result.coupon)
      } else {
        setCouponStatus('error')
        setCouponData({ error: result.message || (language === 'ar' ? 'كوبون غير صالح' : 'Invalid coupon') })
        showToast({
          type: 'error',
          title: language === 'ar' ? 'كوبون غير صالح' : 'Invalid Coupon',
          message: result.message || (language === 'ar' ? 'الكود غير صحيح أو منتهي الصلاحية' : 'Code is invalid or expired')
        })
      }
    } catch (error: any) {
      console.error('❌ Coupon validation failed:', error)
      setCouponStatus('error')
      setCouponData({ error: error.message || (language === 'ar' ? 'خطأ في التحقق من الكوبون' : 'Coupon validation error') })
      showToast({
        type: 'error',
        title: language === 'ar' ? 'خطأ في الكوبون' : 'Coupon Error',
        message: error.message || (language === 'ar' ? 'فشل في التحقق من الكوبون' : 'Failed to validate coupon')
      })
    } finally {
      setCouponLoading(false)
    }
  }, [language, showToast])

  const handleRemoveCoupon = useCallback(() => {
    setCouponStatus(null)
    setCouponData(null)
  }, [])

  const resetCoupon = useCallback(() => {
    setCouponStatus(null)
    setCouponData(null)
    setCouponLoading(false)
  }, [])

  return {
    couponStatus,
    couponData,
    couponLoading,
    handleApplyCoupon,
    handleRemoveCoupon,
    resetCoupon
  }
}
