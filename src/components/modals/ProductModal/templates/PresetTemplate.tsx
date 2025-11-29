'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Check, Sparkles } from 'lucide-react'
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

interface PresetTemplateProps {
  product: any
  sizes: any[]
  selectedSize: any
  onSizeSelect: (size: any) => void
  customizationRules: CustomizationGroup[]
  selections: Record<string, string[]>
  onSelectionChange: (groupId: string, ids: string[]) => void
}

export default function PresetTemplate({
  product,
  sizes,
  selectedSize,
  onSizeSelect,
  customizationRules,
  selections,
  onSelectionChange
}: PresetTemplateProps) {
  // Filter out flavor groups for preset products (they come with fixed flavors)
  const addonsGroups = customizationRules.filter(g => 
    g.groupId !== 'flavors' && g.groupId !== 'ice_cream_flavors'
  )

  const totalAddons = Object.values(selections).flat().length
  const hasSizes = sizes.length > 0
  const hasAddons = addonsGroups.length > 0

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-5"
    >
      {/* Preset Badge - Optional marketing message (currently hidden)
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-950/30 dark:to-blue-950/30 rounded-xl border border-cyan-200 dark:border-cyan-800/50"
      >
        <Star className="w-4 h-4 text-cyan-500 fill-cyan-500" />
        <span className="text-sm font-medium text-cyan-700 dark:text-cyan-300">
          نكهة جاهزة - فقط اختر الحجم!
        </span>
      </motion.div>
      */}

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

      {/* Add-ons Section - Cards */}
      {hasAddons && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-5"
        >
          {/* Section Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-500" />
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">إضافات اختيارية</h3>
            </div>
            {totalAddons > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-xs font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/30 px-2 py-1 rounded-full"
              >
                {totalAddons} مختارة
              </motion.span>
            )}
          </div>
          
          {addonsGroups.map(group => (
            <OptionsGrid
              key={group.groupId}
              group={group}
              selections={selections[group.groupId] || []}
              onSelectionChange={(ids) => onSelectionChange(group.groupId, ids)}
              columns={3}
              cardSize="sm"
              accentColor="cyan"
              showImages={true}
              showDescriptions={false}
              showNutrition={true}
            />
          ))}
        </motion.div>
      )}

      {/* Ready to Order State */}
      <AnimatePresence>
        {!hasSizes && !hasAddons && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="text-center py-8"
          >
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="text-5xl mb-4"
            >
              🍨
            </motion.div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-1">جاهز للطلب!</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              أضفه للسلة مباشرة
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Size Selected Confirmation */}
      <AnimatePresence>
        {selectedSize && !hasAddons && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-4 py-3 rounded-xl"
          >
            <Check className="w-5 h-5" />
            <span className="font-medium">جاهز للإضافة للسلة!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
