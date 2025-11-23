/**
 * ⚠️ THIS FILE IS DISABLED
 * 
 * SSE (Server-Sent Events) was replaced with smart polling
 * due to instability in Cloudflare Workers environment.
 * 
 * Keeping this file for reference only.
 * If you migrate to a different hosting provider (Node.js, Deno Deploy),
 * you can re-enable SSE by uncommenting this code.
 * 
 * For now, TrackingModal uses polling instead:
 * - First 60s: every 10s
 * - Next 60s: every 15s
 * - After 120s: every 30s
 */

/*
import { useState, useEffect, useRef } from 'react'

interface SSEOptions {
  orderId: string
  enabled: boolean
  onStatusChange?: (status: string, data: any) => void
  onError?: (error: Error) => void
}

export function useOrderStatusSSE({ orderId, enabled, onStatusChange, onError }: SSEOptions) {
  const [isConnected, setIsConnected] = useState(false)
  const [connectionError, setConnectionError] = useState<Error | null>(null)
  const eventSourceRef = useRef<EventSource | null>(null)
  const reconnectAttemptsRef = useRef(0)
  const maxReconnectAttempts = 5

  useEffect(() => {
    if (!enabled || !orderId) {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
        eventSourceRef.current = null
      }
      return
    }

    const connect = () => {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://softcream-api.mahmoud-zahran20025.workers.dev'
      const url = `${API_URL}?path=${encodeURIComponent(`/orders/${orderId}/stream`)}`
      
      console.log('📡 Connecting to SSE:', url)
      
      const eventSource = new EventSource(url)
      eventSourceRef.current = eventSource

      eventSource.onopen = () => {
        console.log('✅ SSE connected')
        setIsConnected(true)
        setConnectionError(null)
        reconnectAttemptsRef.current = 0
      }

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          console.log('📡 SSE message received:', data)
          
          if (data.event === 'status_update' && onStatusChange) {
            onStatusChange(data.status, data)
          }
        } catch (error) {
          console.error('❌ Failed to parse SSE message:', error)
        }
      }

      eventSource.onerror = (error) => {
        console.error('❌ SSE connection error:', error)
        setIsConnected(false)
        const err = new Error('SSE connection failed')
        setConnectionError(err)
        
        if (onError) {
          onError(err)
        }

        eventSource.close()

        // Exponential backoff reconnection
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000)
          reconnectAttemptsRef.current++
          
          console.log(`🔄 Reconnecting in ${delay}ms... (Attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts})`)
          
          setTimeout(() => {
            if (enabled) {
              connect()
            }
          }, delay)
        } else {
          console.error('❌ Max reconnection attempts reached. Giving up.')
        }
      }
    }

    connect()

    return () => {
      if (eventSourceRef.current) {
        console.log('🔌 Closing SSE connection')
        eventSourceRef.current.close()
        eventSourceRef.current = null
      }
    }
  }, [orderId, enabled, onStatusChange, onError])

  return {
    isConnected,
    connectionError
  }
}
*/

/**
 * ✅ REPLACEMENT: Use smart polling instead
 * 
 * Example usage in TrackingModal:
 * 
 * ```typescript
 * useEffect(() => {
 *   if (!isOpen || !order?.id) return
 * 
 *   let pollCount = 0
 * 
 *   const fetchStatus = async () => {
 *     const response = await fetch(`${API_URL}?path=/orders/status&id=${order.id}`)
 *     const data = await response.json()
 *     // Update state...
 *   }
 * 
 *   // Initial fetch
 *   fetchStatus()
 * 
 *   // Smart polling
 *   const interval = setInterval(() => {
 *     pollCount++
 *     const delay = pollCount < 6 ? 10000 : pollCount < 11 ? 15000 : 30000
 *     fetchStatus()
 *   }, delay)
 * 
 *   return () => clearInterval(interval)
 * }, [isOpen, order?.id])
 * ```
 */

export function useOrderStatusSSE() {
  console.warn('⚠️ useOrderStatusSSE is disabled. Use polling instead.')
  return {
    isConnected: false,
    connectionError: null
  }
}