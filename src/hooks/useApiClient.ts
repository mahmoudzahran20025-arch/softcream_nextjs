'use client'

// ================================================================
// useApiClient.ts - Client-Side API Extensions
// ================================================================
// Contains API functions that depend on window/browser APIs
// (analytics, device detection, etc.)

import { storage } from '@/lib/storage.client'

/**
 * Client-side API utilities that require browser APIs
 */
export const useApiClient = () => {
  
  /**
   * Track analytics event (client-side only)
   */
  const trackEvent = async (event: {
    name?: string
    eventName?: string
    [key: string]: any
  }) => {
    if (typeof window === 'undefined') return { success: false }
    
    try {
      console.log('📊 Tracking event:', event)
      
      const enrichedEvent = {
        eventName: event.name || event.eventName,
        eventData: {
          ...event,
          timestamp: Date.now(),
          sessionId: storage.getSessionId(),
          userAgent: navigator.userAgent,
          url: window.location.href
        }
      }
      
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://softcream-api.mahmoud-zahran20025.workers.dev'
      const url = `${API_URL}?path=${encodeURIComponent('/analytics/event')}`
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Origin': window.location.origin 
        },
        body: JSON.stringify(enrichedEvent),
        keepalive: true,
        mode: 'cors',
        credentials: 'omit'
      })
      
      if (!response.ok) {
        console.warn(`⚠️ Analytics returned ${response.status} (non-critical)`)
        return { success: false }
      }
      
      console.log('✅ Event tracked successfully')
      return { success: true }
    } catch (error) {
      console.warn('⚠️ Analytics tracking failed (non-critical):', error)
      return { success: false, error: (error as Error).message }
    }
  }

  /**
   * Get device information (client-side only)
   */
  const getDeviceInfo = () => {
    if (typeof window === 'undefined') return null
    
    return {
      deviceId: storage.getDeviceId(),
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      screen: {
        width: screen.width,
        height: screen.height,
        colorDepth: screen.colorDepth
      },
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    }
  }

  /**
   * Detect base URL based on current location (client-side only)
   */
  const detectBaseURL = () => {
    if (typeof window === 'undefined') {
      return process.env.NEXT_PUBLIC_API_URL || 'https://softcream-api.mahmoud-zahran20025.workers.dev'
    }
    
    const hostname = window.location.hostname
    if (hostname.includes('netlify.app')) {
      return 'https://softcream-api.mahmoud-zahran20025.workers.dev'
    }
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:8787'
    }
    return 'https://softcream-api.mahmoud-zahran20025.workers.dev'
  }

  /**
   * Get error message with localization (client-side only)
   */
  const getErrorMessage = (error: any, lang: 'ar' | 'en' = 'ar') => {
    if (error.name === 'AbortError') {
      return lang === 'ar' ? 'تم إلغاء الطلب' : 'Request cancelled'
    }
    if (error.message?.includes('Rate limit') || error.message?.includes('Too many')) {
      return lang === 'ar' ? 'عدد كبير من المحاولات. يرجى الانتظار قليلاً' : 'Too many attempts. Please wait a moment'
    }
    if (error.message?.includes('timeout')) {
      return lang === 'ar' ? 'انتهت مهلة الاتصال. تحقق من الإنترنت' : 'Connection timeout. Check your internet'
    }
    if (error.message?.includes('Network') || error.message?.includes('Failed to fetch')) {
      return lang === 'ar' ? 'مشكلة في الاتصال. تحقق من الإنترنت' : 'Connection problem. Check your internet'
    }
    if (error.data?.error) return error.data.error
    if (error.status >= 400 && error.status < 500) {
      if (error.status === 404) return lang === 'ar' ? 'المورد غير موجود' : 'Resource not found'
      if (error.status === 400) return lang === 'ar' ? 'بيانات غير صحيحة' : 'Invalid data'
      return error.message
    }
    if (error.status >= 500) {
      return lang === 'ar' ? 'خطأ في الخادم. حاول مرة أخرى' : 'Server error. Try again'
    }
    return error.message || (lang === 'ar' ? 'حدث خطأ. حاول مرة أخرى' : 'An error occurred. Try again')
  }

  return {
    trackEvent,
    getDeviceInfo,
    detectBaseURL,
    getErrorMessage
  }
}

export default useApiClient
