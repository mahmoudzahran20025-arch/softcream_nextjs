'use client'

import { useEffect } from 'react'

/**
 * Custom hook for handling window events with automatic cleanup
 * 
 * @param eventName - Name of the window event to listen to
 * @param handler - Event handler function
 * @param deps - Dependencies array for the effect
 * 
 * @example
 * ```typescript
 * useWindowEvent('ordersUpdated', (event) => {
 *   console.log('Orders updated:', event.detail)
 * }, [])
 * ```
 */
export function useWindowEvent<T = any>(
  eventName: string,
  handler: (event: CustomEvent<T>) => void,
  deps: any[] = []
) {
  useEffect(() => {
    if (typeof window === 'undefined') return

    const wrappedHandler = (event: Event) => {
      handler(event as CustomEvent<T>)
    }

    window.addEventListener(eventName, wrappedHandler)
    return () => window.removeEventListener(eventName, wrappedHandler)
  }, [eventName, handler, ...deps])
}

export default useWindowEvent
