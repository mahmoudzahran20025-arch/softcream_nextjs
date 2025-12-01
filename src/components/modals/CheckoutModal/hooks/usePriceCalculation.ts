// ================================================================
// usePriceCalculation Hook - Order Price Calculation
// ================================================================

'use client'

import { useState, useRef, useCallback } from 'react'
import { useToast } from '@/providers/ToastProvider'
import { useLanguage } from '@/providers/LanguageProvider'
import { calculateOrderPrices } from '@/lib/api'
import type { PriceCalculation, UserLocation } from '../types'

interface CalculatePricesParams {
  cart: any[]
  productsMap: Record<string, any>
  deliveryMethod: 'pickup' | 'delivery' | null
  userLocation: UserLocation | null
  couponCode: string | null
  phone: string
  addressInputType: 'gps' | 'manual' | null
}

export const usePriceCalculation = () => {
  const { language } = useLanguage()
  const { showToast } = useToast()

  const [prices, setPrices] = useState<PriceCalculation | null>(null)
  const [pricesLoading, setPricesLoading] = useState(false)
  const [pricesError, setPricesError] = useState<string | null>(null)

  const calculationTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isCalculatingRef = useRef(false)

  const calculateFallbackPrices = useCallback((
    cart: any[],
    productsMap: Record<string, any>,
    deliveryMethod: 'pickup' | 'delivery' | null,
    discount: number = 0
  ): PriceCalculation => {
    const subtotal = cart.reduce((sum, item) => {
      const product = productsMap[item.productId]
      return sum + ((product?.price || 0) * item.quantity)
    }, 0)

    const deliveryFee = deliveryMethod === 'delivery' ? 20 : 0

    return {
      subtotal,
      deliveryFee,
      discount,
      total: subtotal + deliveryFee - discount,
      isOffline: true,
      deliveryInfo: { isEstimated: true }
    }
  }, [])

  const calculatePrices = useCallback(async (params: CalculatePricesParams) => {
    const { cart, productsMap, deliveryMethod, userLocation, couponCode, phone, addressInputType } = params

    if (!deliveryMethod || cart.length === 0) return

    if (isCalculatingRef.current) {
      console.log('⏭️ Calculation already in progress, skipping...')
      return
    }

    // Clear any pending calculation
    if (calculationTimeoutRef.current) {
      clearTimeout(calculationTimeoutRef.current)
    }

    // Debounce the calculation
    calculationTimeoutRef.current = setTimeout(async () => {
      isCalculatingRef.current = true
      setPricesLoading(true)
      setPricesError(null)

      try {
        const phoneForCalc = phone.replace(/\D/g, '') || undefined

        console.log('📊 Calculating prices...')
        const pricesData = await calculateOrderPrices(
          cart.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            selectedAddons: item.selectedAddons,
            selections: item.selections
          })),
          couponCode?.trim() || null,
          deliveryMethod,
          phoneForCalc,
          userLocation || undefined,
          addressInputType || undefined
        )

        setPrices({
          subtotal: pricesData.subtotal || 0,
          deliveryFee: pricesData.deliveryFee || 0,
          discount: pricesData.discount || 0,
          total: pricesData.total || 0,
          deliveryInfo: pricesData.deliveryInfo,
          items: pricesData.items
        })
        console.log('✅ Prices calculated:', pricesData)
      } catch (error: any) {
        console.warn('⚠️ Price calculation failed:', error)
        setPricesError(error?.message || 'Failed to calculate prices')
        setPrices(calculateFallbackPrices(cart, productsMap, deliveryMethod))

        if (error?.isTimeout || error?.message?.includes('timeout')) {
          showToast({
            type: 'warning',
            title: language === 'ar' ? 'مشكلة في الاتصال' : 'Connection Issue',
            message: language === 'ar' ? 'استخدام الأسعار التقريبية' : 'Using estimated prices'
          })
        }
      } finally {
        setPricesLoading(false)
        isCalculatingRef.current = false
      }
    }, 500)
  }, [language, showToast, calculateFallbackPrices])

  const resetPrices = useCallback(() => {
    setPrices(null)
    setPricesError(null)
    setPricesLoading(false)
    isCalculatingRef.current = false
    if (calculationTimeoutRef.current) {
      clearTimeout(calculationTimeoutRef.current)
    }
  }, [])

  return {
    prices,
    pricesLoading,
    pricesError,
    calculatePrices,
    resetPrices
  }
}
