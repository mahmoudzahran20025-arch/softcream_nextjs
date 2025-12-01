// ================================================================
// useGPS Hook - GPS Location Management
// ================================================================

'use client'

import { useState, useCallback } from 'react'
import { useToast } from '@/providers/ToastProvider'
import { useLanguage } from '@/providers/LanguageProvider'
import type { UserLocation } from '../types'

const MAX_GPS_RETRIES = 3

export const useGPS = () => {
  const { language } = useLanguage()
  const { showToast } = useToast()

  const [useGPS, setUseGPS] = useState(true)
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null)
  const [locationLoading, setLocationLoading] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [gpsRetryCount, setGpsRetryCount] = useState(0)

  const handleRequestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      const msg = language === 'ar'
        ? 'المتصفح لا يدعم تحديد الموقع'
        : 'Geolocation not supported by this browser'
      setLocationError(msg)
      showToast({ type: 'error', title: language === 'ar' ? 'خطأ GPS' : 'GPS Error', message: msg })
      setUseGPS(false)
      return
    }

    if (typeof window !== 'undefined') {
      const isSecure = window.location.protocol === 'https:' ||
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1'

      if (!isSecure) {
        const msg = language === 'ar'
          ? 'تحديد الموقع يتطلب اتصال آمن (HTTPS)'
          : 'Geolocation requires secure connection (HTTPS)'
        setLocationError(msg)
        showToast({ type: 'error', title: language === 'ar' ? 'خطأ أمني' : 'Security Error', message: msg })
        return
      }
    }

    setLocationLoading(true)
    setLocationError(null)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location: UserLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        }

        console.log('✅ GPS Location obtained:', location)
        setUserLocation(location)
        setGpsRetryCount(0)
        setLocationLoading(false)

        showToast({
          type: 'success',
          title: language === 'ar' ? 'تم تحديد الموقع' : 'Location Set',
          message: language === 'ar' ? 'تم الحصول على موقعك بنجاح' : 'Location obtained successfully'
        })
      },
      (error: GeolocationPositionError) => {
        console.error('❌ GPS error:', error)

        const errorMessages: Record<number, { ar: string; en: string }> = {
          1: {
            ar: 'تم رفض إذن الموقع. يرجى السماح بالوصول إلى الموقع من إعدادات المتصفح',
            en: 'Location permission denied. Please allow location access in browser settings'
          },
          2: {
            ar: 'الموقع غير متاح حالياً. تأكد من تفعيل GPS',
            en: 'Location unavailable. Make sure GPS is enabled'
          },
          3: {
            ar: 'انتهت مهلة الحصول على الموقع. حاول مرة أخرى',
            en: 'Location request timed out. Please try again'
          }
        }

        const errorMsg = errorMessages[error.code] || {
          ar: `خطأ في تحديد الموقع: ${error.message || 'غير معروف'}`,
          en: `Location error: ${error.message || 'Unknown error'}`
        }

        const displayMsg = language === 'ar' ? errorMsg.ar : errorMsg.en
        setLocationError(displayMsg)
        setLocationLoading(false)

        showToast({
          type: 'error',
          title: language === 'ar' ? 'خطأ في الموقع' : 'Location Error',
          message: displayMsg
        })

        if (error.code === 3 && gpsRetryCount < MAX_GPS_RETRIES) {
          setGpsRetryCount(prev => prev + 1)
          setTimeout(() => handleRequestLocation(), 2000)
        } else if (error.code === 1) {
          setUseGPS(false)
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 300000 }
    )
  }, [language, showToast, gpsRetryCount])

  const handleToggleAddressMode = useCallback((mode: boolean) => {
    setUseGPS(mode)
    if (mode) {
      setLocationError(null)
    } else {
      setUserLocation(null)
    }
  }, [])

  const resetGPS = useCallback(() => {
    setUserLocation(null)
    setUseGPS(true)
    setGpsRetryCount(0)
    setLocationError(null)
  }, [])

  return {
    useGPS,
    userLocation,
    locationLoading,
    locationError,
    gpsRetryCount,
    MAX_GPS_RETRIES,
    setUserLocation,
    handleRequestLocation,
    handleToggleAddressMode,
    resetGPS
  }
}
