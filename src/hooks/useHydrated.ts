'use client'

import { useEffect, useState } from 'react'

/**
 * Hook to detect when component has hydrated on the client.
 * Useful for deferring animations and client-only features until hydration completes.
 */
export function useHydrated() {
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  return isHydrated
}
