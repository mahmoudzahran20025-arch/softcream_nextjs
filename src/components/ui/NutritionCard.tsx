'use client'

import { Flame } from 'lucide-react'
import NutritionIcon from './common/NutritionIcon'

interface NutritionData {
  totalCalories: number
  totalProtein: number
  totalCarbs: number
  totalFat: number
}

interface NutritionCardProps {
  nutritionData: NutritionData
}

export default function NutritionCard({ nutritionData }: NutritionCardProps) {
  return (
    <div className="mt-6 p-4 bg-gradient-to-br from-orange-50 to-pink-50 dark:from-slate-700 dark:to-slate-600 border border-orange-100 dark:border-slate-600 rounded-3xl">
      <h3 className="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
        <Flame className="w-5 h-5 text-orange-500" />
        ملخص التغذية
      </h3>
      
      {/* Macros Grid */}
      <div className="grid grid-cols-4 gap-2">
        <NutritionIcon
          type="calories"
          value={nutritionData.totalCalories || 0}
          size="md"
          variant="colored"
        />
        <NutritionIcon
          type="protein"
          value={parseFloat((nutritionData.totalProtein || 0).toFixed(1))}
          size="md"
          variant="colored"
        />
        <NutritionIcon
          type="carbs"
          value={parseFloat((nutritionData.totalCarbs || 0).toFixed(1))}
          size="md"
          variant="colored"
        />
        <NutritionIcon
          type="fat"
          value={parseFloat((nutritionData.totalFat || 0).toFixed(1))}
          size="md"
          variant="colored"
        />
      </div>
    </div>
  )
}
