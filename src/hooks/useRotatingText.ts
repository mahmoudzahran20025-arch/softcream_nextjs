import { useState, useEffect, useRef } from 'react'

/**
 * Hook for rotating text with smooth transitions
 * Optimized to prevent scroll jitter by using RAF and proper timing
 */
export function useRotatingText(texts: string[], interval: number = 3000) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const rafRef = useRef<number>()
  const timerRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (texts.length <= 1) return

    const rotate = () => {
      // Use RAF to sync with browser paint cycle (prevents jitter)
      rafRef.current = requestAnimationFrame(() => {
        setIsTransitioning(true)
        
        // Quick fade out
        setTimeout(() => {
          setCurrentIndex((prev) => (prev + 1) % texts.length)
          setIsTransitioning(false)
        }, 200) // Faster transition
      })
    }

    timerRef.current = setInterval(rotate, interval)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [texts.length, interval])

  return {
    currentText: texts[currentIndex] || texts[0],
    isTransitioning,
    currentIndex,
  }
}
