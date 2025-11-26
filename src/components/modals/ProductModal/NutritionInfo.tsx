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

interface NutritionInfoProps {
  product: Product
  ingredients: string[]
  allergens: string[]
}

export default function NutritionInfo({ product, ingredients, allergens }: NutritionInfoProps) {
  const [showNutrition, setShowNutrition] = useState(false)
  
  const hasQuickStats = product.calories || product.protein || product.carbs || product.sugar
  const hasDetailedInfo = product.fat || product.fiber || ingredients.length > 0 || allergens.length > 0

  return (
    <>
      {/* Compact Nutrition Stats */}
      {hasQuickStats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-4 gap-1.5"
        >
          {product.calories && (
            <NutritionIcon
              type="calories"
              value={product.calories}
              size="sm"
              variant="colored"
            />
          )}
          {product.protein && (
            <NutritionIcon
              type="protein"
              value={product.protein}
              size="sm"
              variant="colored"
            />
          )}
          {product.carbs && (
            <NutritionIcon
              type="carbs"
              value={product.carbs}
              size="sm"
              variant="colored"
            />
          )}
          {product.sugar && (
            <NutritionIcon
              type="sugar"
              value={product.sugar}
              size="sm"
              variant="colored"
            />
          )}
        </motion.div>
      )}

      {/* Detailed Nutrition (Collapsible) */}
      {hasDetailedInfo && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="border-t border-slate-200 dark:border-slate-700 pt-3"
        >
          <button
            onClick={() => setShowNutrition(!showNutrition)}
            className="w-full flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors group"
          >
            <span className="text-sm font-bold text-slate-900 dark:text-white">القيم الغذائية التفصيلية</span>
            <div className="w-7 h-7 rounded-full bg-[#FF6B9D] flex items-center justify-center group-hover:scale-110 transition-transform">
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
                className="mt-3 space-y-3 overflow-hidden"
              >
                {product.fat && (
                  <div className="flex justify-between items-center py-3 px-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">الدهون</span>
                    <span className="font-bold text-slate-900 dark:text-white">{product.fat}g</span>
                  </div>
                )}
                {product.fiber && (
                  <div className="flex justify-between items-center py-3 px-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">الألياف</span>
                    <span className="font-bold text-slate-900 dark:text-white">{product.fiber}g</span>
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
        </motion.div>
      )}
    </>
  )
}
