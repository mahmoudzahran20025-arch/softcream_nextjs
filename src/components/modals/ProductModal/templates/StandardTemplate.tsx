'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, ShoppingBag } from 'lucide-react'
import SizeSelector from '../SizeSelector'
import { OptionsGrid } from './shared'

interface Option {
  id: string
  name_ar: string
  name_en: string
  price: number
  image?: string
}

interface CustomizationGroup {
  groupId: string
  groupName: string
  groupDescription?: string
  groupIcon?: string
  isRequired: boolean
  minSelections: number
  maxSelections: number
  options: Option[]
}

interface StandardTemplateProps {
  product: any
  sizes: any[]
  selectedSize: any
  onSizeSelect: (size: any) => void
  customizationRules: CustomizationGroup[]
  selections: Record<string, string[]>
  onSelectionChange: (groupId: string, ids: string[]) => void
}

export default function StandardTemplate({
  product,
  sizes,
  selectedSize,
  onSizeSelect,
  customizationRules,
  selections,
  onSelectionChange
}: StandardTemplateProps) {
  const hasCustomization = customizationRules.length > 0
  const hasSizes = sizes.length > 0

  // Check if all required groups are satisfied
  const requiredGroups = customizationRules.filter(g => g.isRequired)
  const allRequiredMet = requiredGroups.every(g => 
    (selections[g.groupId]?.length || 0) >= g.minSelections
  )

  const totalSelections = Object.values(selections).flat().length

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-5"
    >
      {/* Size Selection */}
      {hasSizes && (
        <SizeSelector
          sizes={sizes}
          selectedSize={selectedSize}
          onSelect={onSizeSelect}
          basePrice={product.price}
          showHeader={true}
        />
      )}

      {/* Customization Groups - Cards */}
      {hasCustomization && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-5"
        >
          {/* Section Header with Counter */}
          {totalSelections > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500 dark:text-slate-400">خصص طلبك</span>
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">
                {totalSelections} مختارة
              </span>
            </div>
          )}

          {customizationRules.map(group => (
            <OptionsGrid
              key={group.groupId}
              group={group}
              selections={selections[group.groupId] || []}
              onSelectionChange={(ids) => onSelectionChange(group.groupId, ids)}
              columns={3}
              cardSize="md"
              accentColor="pink"
              showImages={true}
              showDescriptions={true}
            />
          ))}
        </motion.div>
      )}

      {/* Ready State - No customization needed */}
      <AnimatePresence>
        {!hasSizes && !hasCustomization && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="text-center py-10"
          >
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-2xl flex items-center justify-center"
            >
              <ShoppingBag className="w-8 h-8 text-slate-400" />
            </motion.div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-1">جاهز للطلب!</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              أضفه للسلة مباشرة
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Validation Warning */}
      <AnimatePresence>
        {hasCustomization && !allRequiredMet && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-4 py-3 rounded-xl border border-amber-200 dark:border-amber-800/50"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">أكمل الاختيارات الإجبارية للمتابعة</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
