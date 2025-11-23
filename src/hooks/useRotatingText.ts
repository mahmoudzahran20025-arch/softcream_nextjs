import { useState, useEffect } from 'react'

/**
 * Hook for rotating text with smooth transitions
 * Perfect for product cards to show multiple features
 */
export function useRotatingText(texts: string[], interval: number = 3000) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    if (texts.length <= 1) return

    const timer = setInterval(() => {
      setIsTransitioning(true)
      
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % texts.length)
        setIsTransitioning(false)
      }, 300) // Transition duration
    }, interval)

    return () => clearInterval(timer)
  }, [texts.length, interval])

  return {
    currentText: texts[currentIndex] || texts[0],
    isTransitioning,
    currentIndex,
  }
}
