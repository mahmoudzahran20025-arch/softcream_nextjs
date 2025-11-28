'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles } from 'lucide-react'
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

interface DessertTemplateProps {
  product: any
  sizes: any[]
  selectedSize: any
  onSizeSelect: (size: any) => void
  customizationRules: CustomizationGroup[]
  selections: Record<string, string[]>
  onSelectionChange: (groupId: string, ids: string[]) => void
}

export default function DessertTemplate({
  product,
  sizes,
  selectedSize,
  onSizeSelect,
  customizationRules,
  selections,
  onSelectionChange
}: DessertTemplateProps) {
  // Separate ice cream from other add-ons
  const iceCreamGroup = customizationRules.find(g => 
    g.groupId === 'flavors' || g.groupId === 'ice_cream_flavors'
  )
  const saucesGroup = customizationRules.find(g => g.groupId === 'sauces')
  const toppingsGroup = customizationRules.find(g => g.groupId === 'toppings')
  const otherGroups = customizationRules.filter(g => 
    !['flavors', 'ice_cream_flavors', 'sauces', 'toppings'].includes(g.groupId)
  )

  const hasAnySelection = Object.values(selections).some(arr => arr.length > 0)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-5"
    >
      {/* Dessert Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400"
      >
        <span className="text-lg">🍰</span>
        <span>خصص حلوياتك بإضافات لذيذة</span>
      </motion.div>

      {/* Size Selection */}
      {sizes.length > 0 && (
        <SizeSelector
          sizes={sizes}
          selectedSize={selectedSize}
          onSelect={onSizeSelect}
          basePrice={product.price}
          showHeader={true}
        />
      )}

      {/* Ice Cream Add-on - Cards Grid */}
      {iceCreamGroup && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-950/20 dark:to-purple-950/20 rounded-2xl p-4 border border-pink-200 dark:border-pink-800/50"
        >
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-pink-500" />
            <h4 className="font-bold text-slate-800 dark:text-white">أضف آيس كريم</h4>
            <span className="text-xs text-slate-500">(اختياري)</span>
          </div>
          <OptionsGrid
            group={iceCreamGroup}
            selections={selections[iceCreamGroup.groupId] || []}
            onSelectionChange={(ids) => onSelectionChange(iceCreamGroup.groupId, ids)}
            columns={3}
            cardSize="sm"
            accentColor="pink"
            showImages={true}
            showDescriptions={false}
            showNutrition={true}
          />
        </motion.div>
      )}

      {/* Sauces Section - Cards */}
      {saucesGroup && (
        <OptionsGrid
          group={saucesGroup}
          selections={selections[saucesGroup.groupId] || []}
          onSelectionChange={(ids) => onSelectionChange(saucesGroup.groupId, ids)}
          columns={3}
          cardSize="sm"
          accentColor="amber"
          showImages={true}
          showDescriptions={false}
          showNutrition={true}
        />
      )}

      {/* Toppings Section - Cards */}
      {toppingsGroup && (
        <OptionsGrid
          group={toppingsGroup}
          selections={selections[toppingsGroup.groupId] || []}
          onSelectionChange={(ids) => onSelectionChange(toppingsGroup.groupId, ids)}
          columns={3}
          cardSize="sm"
          accentColor="purple"
          showImages={true}
          showDescriptions={false}
          showNutrition={true}
        />
      )}

      {/* Other Groups - Cards */}
      {otherGroups.map(group => (
        <OptionsGrid
          key={group.groupId}
          group={group}
          selections={selections[group.groupId] || []}
          onSelectionChange={(ids) => onSelectionChange(group.groupId, ids)}
          columns={3}
          cardSize="sm"
          accentColor="pink"
          showImages={true}
          showDescriptions={false}
          showNutrition={true}
        />
      ))}

      {/* Empty State Hint */}
      <AnimatePresence>
        {!hasAnySelection && selectedSize && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-center py-4 text-slate-400 dark:text-slate-500 text-sm"
          >
            <span className="text-2xl block mb-2">✨</span>
            أضف إضافات لتجربة ألذ!
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
