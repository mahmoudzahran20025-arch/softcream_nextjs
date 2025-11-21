'use client'

import { Flame, Droplets, Wheat, Candy, Activity } from 'lucide-react'

type NutritionType = 'calories' | 'protein' | 'carbs' | 'sugar' | 'fat'

interface NutritionIconProps {
  type: NutritionType
  value: number
  unit?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'colored' | 'subtle'
}

const nutritionConfig = {
  calories: {
    icon: Flame,
    label: 'سعرة',
    color: 'orange',
    colorClasses: {
      colored: 'text-orange-500 bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800',
      subtle: 'text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
    }
  },
  protein: {
    icon: Droplets,
    label: 'بروتين',
    color: 'blue',
    colorClasses: {
      colored: 'text-blue-500 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800',
      subtle: 'text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
    }
  },
  carbs: {
    icon: Wheat,
    label: 'كربوهيدرات',
    color: 'yellow',
    colorClasses: {
      colored: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800',
      subtle: 'text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
    }
  },
  sugar: {
    icon: Candy,
    label: 'سكر',
    color: 'pink',
    colorClasses: {
      colored: 'text-pink-500 bg-pink-50 dark:bg-pink-950/30 border-pink-200 dark:border-pink-800',
      subtle: 'text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
    }
  },
  fat: {
    icon: Activity,
    label: 'دهون',
    color: 'red',
    colorClasses: {
      colored: 'text-red-500 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800',
      subtle: 'text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
    }
  }
}

export default function NutritionIcon({
  type,
  value,
  unit,
  size = 'md',
  variant = 'subtle'
}: NutritionIconProps) {
  const config = nutritionConfig[type]
  const Icon = config.icon
  const displayUnit = unit || (type === 'calories' ? '' : 'g')

  const sizeClasses = {
    sm: {
      container: 'p-2',
      icon: 'w-3 h-3',
      value: 'text-xs',
      label: 'text-[9px]'
    },
    md: {
      container: 'p-2.5',
      icon: 'w-4 h-4',
      value: 'text-sm',
      label: 'text-[10px]'
    },
    lg: {
      container: 'p-3',
      icon: 'w-5 h-5',
      value: 'text-base',
      label: 'text-xs'
    }
  }

  const styles = sizeClasses[size]
  const colorClass = config.colorClasses[variant]

  return (
    <div className={`text-center ${styles.container} ${colorClass} rounded-xl border`}>
      <Icon className={`${styles.icon} mx-auto mb-1`} />
      <div className={`${styles.value} font-bold text-slate-900 dark:text-white`}>
        {value}{displayUnit}
      </div>
      <div className={`${styles.label} text-slate-500 dark:text-slate-400 font-medium`}>
        {config.label}
      </div>
    </div>
  )
}
