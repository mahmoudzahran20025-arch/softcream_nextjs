'use client'

import { useState, useEffect, useRef } from 'react'
import { Flame, Dumbbell, Zap } from 'lucide-react'

interface NutritionSwiperProps {
  calories?: number
  protein?: number
  energyScore?: number
  interval?: number // default: 3000ms
  className?: string
}

interface NutritionItem {
  type: 'calories' | 'protein' | 'energy'
  value: number
  label: string
  icon: typeof Flame
  colorClass: string
}

/**
 * NutritionSwiper - عرض دوار للقيم الغذائية
 * يعرض السعرات والبروتين والطاقة بشكل متناوب مع تأثير fade
 * 
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6
 */
export default function NutritionSwiper({
  calories,
  protein,
  energyScore,
  interval = 3000,
  className = '',
}: NutritionSwiperProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const rafRef = useRef<number | null>(null)

  // Build nutrition items array based on available values
  const nutritionItems: NutritionItem[] = []

  if (calories !== undefined && calories > 0) {
    nutritionItems.push({
      type: 'calories',
      value: calories,
      label: 'سعرة',
      icon: Flame,
      colorClass: 'text-orange-500',
    })
  }

  if (protein !== undefined && protein > 0) {
    nutritionItems.push({
      type: 'protein',
      value: protein,
      label: 'بروتين',
      icon: Dumbbell,
      colorClass: 'text-blue-500',
    })
  }

  if (energyScore !== undefined && energyScore > 0) {
    nutritionItems.push({
      type: 'energy',
      value: energyScore,
      label: 'طاقة',
      icon: Zap,
      colorClass: 'text-amber-500',
    })
  }

  // Rotation effect - only if multiple items
  useEffect(() => {
    if (nutritionItems.length <= 1) return

    const rotate = () => {
      rafRef.current = requestAnimationFrame(() => {
        setIsTransitioning(true)

        // Fade out then change (300ms transition as per requirement 6.2)
        setTimeout(() => {
          setCurrentIndex((prev) => (prev + 1) % nutritionItems.length)
          setIsTransitioning(false)
        }, 150) // Half of 300ms for fade out
      })
    }

    timerRef.current = setInterval(rotate, interval)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [nutritionItems.length, interval])

  // Don't render if no nutrition data
  if (nutritionItems.length === 0) {
    return null
  }

  const currentItem = nutritionItems[currentIndex] || nutritionItems[0]
  const Icon = currentItem.icon

  // Format display text based on type
  const getDisplayText = (item: NutritionItem): string => {
    switch (item.type) {
      case 'calories':
        return `${item.value} ${item.label}` // "120 سعرة"
      case 'protein':
        return `${item.value}g ${item.label}` // "8g بروتين"
      case 'energy':
        return `${item.label} ${item.value}` // "طاقة 85"
      default:
        return `${item.value} ${item.label}`
    }
  }

  return (
    <div
      className={`flex items-center gap-1.5 text-xs font-medium ${className}`}
      role="status"
      aria-live="polite"
      aria-label="معلومات التغذية"
    >
      <div
        className={`flex items-center gap-1 transition-opacity duration-300 ${
          isTransitioning ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <Icon className={`w-3.5 h-3.5 ${currentItem.colorClass}`} />
        <span className="text-slate-700 dark:text-slate-300">
          {getDisplayText(currentItem)}
        </span>
      </div>

      {/* Dots indicator for multiple items */}
      {nutritionItems.length > 1 && (
        <div className="flex gap-0.5 mr-1">
          {nutritionItems.map((_, idx) => (
            <span
              key={idx}
              className={`w-1 h-1 rounded-full transition-colors duration-300 ${
                idx === currentIndex
                  ? 'bg-pink-500'
                  : 'bg-slate-300 dark:bg-slate-600'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
