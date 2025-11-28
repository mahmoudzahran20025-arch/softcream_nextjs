'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import NutritionIcon from '@/components/ui/common/NutritionIcon'

interface Product {
  calories?: number
  protein?: number
  carbs?: number
  sugar?: number
  fat?: number
  fiber?: number
}

interface CustomizationNutrition {
  calories: number
  protein: number
  carbs: number
  sugar: number
  fat: number
  fiber: number
}

interface NutritionInfoProps {
  product: Product
  ingredients: string[]
  allergens: string[]
  customizationNutrition?: CustomizationNutrition
  energyType?: string
  energyScore?: number
}

export default function NutritionInfo({ product, ingredients, allergens, customizationNutrition }: NutritionInfoProps) {
  const [showNutrition, setShowNutrition] = useState(false)

  // ✅ Calculate total nutrition (base product + customization)
  const totalNutrition = {
    calories: (product.calories || 0) + (customizationNutrition?.calories || 0),
    protein: (product.protein || 0) + (customizationNutrition?.protein || 0),
    carbs: (product.carbs || 0) + (customizationNutrition?.carbs || 0),
    sugar: (product.sugar || 0) + (customizationNutrition?.sugar || 0),
    fat: (product.fat || 0) + (customizationNutrition?.fat || 0),
    fiber: (product.fiber || 0) + (customizationNutrition?.fiber || 0)
  }

  // 🐛 Debug log
  console.log('🍎 NutritionInfo Render:', {
    baseProduct: { calories: product.calories, protein: product.protein },
    customization: customizationNutrition,
    total: totalNutrition
  })

  // ✅ IMPROVED: Show nutrition summary if ANY nutrition data exists
  const hasQuickStats = totalNutrition.calories > 0 || totalNutrition.protein > 0 || totalNutrition.carbs > 0 || totalNutrition.sugar > 0
  const hasDetailedInfo = totalNutrition.fat > 0 || totalNutrition.fiber > 0 || ingredients.length > 0 || allergens.length > 0

  return (
    <>
      {/* Quick Nutrition Stats */}
      {hasQuickStats && (
        <div className="grid grid-cols-4 gap-1.5 transition-opacity duration-150">
          {totalNutrition.calories > 0 && (
            <div key={`calories-${totalNutrition.calories}`} className="transform transition-transform duration-150 hover:scale-105">
              <NutritionIcon
                type="calories"
                value={totalNutrition.calories}
                size="sm"
                variant="colored"
              />
            </div>
          )}
          {totalNutrition.protein > 0 && (
            <div key={`protein-${totalNutrition.protein}`} className="transform transition-transform duration-150 hover:scale-105">
              <NutritionIcon
                type="protein"
                value={totalNutrition.protein}
                size="sm"
                variant="colored"
              />
            </div>
          )}
          {totalNutrition.carbs > 0 && (
            <div key={`carbs-${totalNutrition.carbs}`} className="transform transition-transform duration-150 hover:scale-105">
              <NutritionIcon
                type="carbs"
                value={totalNutrition.carbs}
                size="sm"
                variant="colored"
              />
            </div>
          )}
          {totalNutrition.sugar > 0 && (
            <div key={`sugar-${totalNutrition.sugar}`} className="transform transition-transform duration-150 hover:scale-105">
              <NutritionIcon
                type="sugar"
                value={totalNutrition.sugar}
                size="sm"
                variant="colored"
              />
            </div>
          )}
        </div>
      )}

      {/* Detailed Nutrition (Collapsible) */}
      {hasDetailedInfo && (
        <div className="border-t border-slate-200 dark:border-slate-700 pt-3 mt-3 transition-opacity duration-150">
          <button
            onClick={() => setShowNutrition(!showNutrition)}
            className="w-full flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors group"
          >
            <span className="text-sm font-bold text-slate-900 dark:text-white">القيم الغذائية التفصيلية</span>
            <div className="w-7 h-7 rounded-full bg-[#FF6B9D] flex items-center justify-center group-hover:scale-110 transition-transform duration-150">
              {showNutrition ? (
                <ChevronUp className="w-3.5 h-3.5 text-white" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-white" />
              )}
            </div>
          </button>

          <AnimatePresence>
            {showNutrition && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.15 }}
                className="mt-3 space-y-3 overflow-hidden"
              >
                {totalNutrition.fat > 0 && (
                  <div className="flex justify-between items-center py-3 px-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">الدهون</span>
                    <span className="font-bold text-slate-900 dark:text-white">{totalNutrition.fat.toFixed(1)}g</span>
                  </div>
                )}
                {totalNutrition.fiber > 0 && (
                  <div className="flex justify-between items-center py-3 px-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">الألياف</span>
                    <span className="font-bold text-slate-900 dark:text-white">{totalNutrition.fiber.toFixed(1)}g</span>
                  </div>
                )}
                {ingredients.length > 0 && (
                  <div className="py-4 px-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <span className="text-slate-700 dark:text-slate-300 font-bold block mb-2">المكونات:</span>
                    <span className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{ingredients.join('، ')}</span>
                  </div>
                )}
                {allergens.length > 0 && (
                  <div className="py-4 px-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30 rounded-xl border-2 border-yellow-300 dark:border-yellow-800/50">
                    <div className="flex items-start gap-2">
                      <span className="text-2xl">⚠️</span>
                      <div>
                        <span className="text-yellow-800 dark:text-yellow-300 font-bold block mb-1">تحذير الحساسية</span>
                        <span className="text-sm text-yellow-700 dark:text-yellow-400">{allergens.join('، ')}</span>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </>
  )
}
