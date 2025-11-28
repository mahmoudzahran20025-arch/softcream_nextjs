'use client'

import { motion } from 'framer-motion'
import { Check, Plus } from 'lucide-react'
import SizeSelector from '../SizeSelector'

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

interface MilkshakeTemplateProps {
  product: any
  sizes: any[]
  selectedSize: any
  onSizeSelect: (size: any) => void
  customizationRules: CustomizationGroup[]
  selections: Record<string, string[]>
  onSelectionChange: (groupId: string, ids: string[]) => void
}

export default function MilkshakeTemplate({
  product,
  sizes,
  selectedSize,
  onSizeSelect,
  customizationRules,
  selections,
  onSelectionChange
}: MilkshakeTemplateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5"
    >
      {/* Header */}
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-400 p-4 rounded-2xl shadow-lg"
      >
        <div className="flex items-center gap-3">
          <motion.span
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="text-3xl"
          >
            🥤
          </motion.span>
          <div>
            <h3 className="text-lg font-bold text-white">ميلك شيك</h3>
            <p className="text-xs text-white/80">اختر الحجم وأضف إضافاتك المفضلة</p>
          </div>
        </div>
      </motion.div>

      {/* Size Selection */}
      {sizes.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>📏</span> اختر الحجم
          </h3>
          <SizeSelector
            sizes={sizes}
            selectedSize={selectedSize}
            onSelect={onSizeSelect}
            basePrice={product.price}
          />
        </div>
      )}

      {/* Add-ons */}
      {customizationRules.map(group => (
        <AddonsGroup
          key={group.groupId}
          group={group}
          selections={selections[group.groupId] || []}
          onSelectionChange={(ids) => onSelectionChange(group.groupId, ids)}
        />
      ))}
    </motion.div>
  )
}

// Add-ons Group Component
function AddonsGroup({
  group,
  selections,
  onSelectionChange
}: {
  group: CustomizationGroup
  selections: string[]
  onSelectionChange: (ids: string[]) => void
}) {
  const handleToggle = (optionId: string) => {
    const isSelected = selections.includes(optionId)
    if (isSelected) {
      onSelectionChange(selections.filter(id => id !== optionId))
    } else if (selections.length < group.maxSelections) {
      onSelectionChange([...selections, optionId])
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {group.groupIcon && <span className="text-lg">{group.groupIcon}</span>}
          <h4 className="font-semibold text-slate-800 dark:text-white">{group.groupName}</h4>
          {group.isRequired && (
            <span className="text-xs text-pink-600 bg-pink-50 dark:bg-pink-950/30 px-2 py-0.5 rounded-full">
              إجباري
            </span>
          )}
        </div>
        <span className="text-xs text-slate-500">
          {selections.length}/{group.maxSelections}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {group.options.map((option) => {
          const isSelected = selections.includes(option.id)
          const canSelect = !isSelected && selections.length < group.maxSelections

          return (
            <motion.button
              key={option.id}
              onClick={() => handleToggle(option.id)}
              disabled={!canSelect && !isSelected}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`
                flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all
                ${isSelected
                  ? 'bg-amber-500 text-white shadow-md'
                  : canSelect
                    ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 hover:bg-amber-100'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                }
              `}
            >
              {isSelected ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              <span>{option.name_ar}</span>
              {option.price > 0 && (
                <span className={isSelected ? 'text-white/80' : 'text-amber-600'}>
                  +{option.price}
                </span>
              )}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
