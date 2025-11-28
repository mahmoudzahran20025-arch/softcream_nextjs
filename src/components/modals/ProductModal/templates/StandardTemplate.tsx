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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5"
    >
      {/* Size Selection */}
      {hasSizes && (
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

      {/* Customization Groups */}
      {hasCustomization && (
        <div className="space-y-4">
          {customizationRules.map(group => (
            <CustomizationGroup
              key={group.groupId}
              group={group}
              selections={selections[group.groupId] || []}
              onSelectionChange={(ids) => onSelectionChange(group.groupId, ids)}
            />
          ))}
        </div>
      )}

      {/* No customization message */}
      {!hasSizes && !hasCustomization && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-8 text-slate-500 dark:text-slate-400"
        >
          <span className="text-4xl mb-3 block">🍽️</span>
          <p className="font-medium">هذا المنتج جاهز للطلب!</p>
          <p className="text-sm mt-1">أضفه للسلة مباشرة</p>
        </motion.div>
      )}
    </motion.div>
  )
}

// Customization Group Component
function CustomizationGroup({
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
    } else if (group.maxSelections === 1) {
      onSelectionChange([optionId])
    }
  }

  const requirementMet = selections.length >= group.minSelections

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {group.groupIcon && <span className="text-lg">{group.groupIcon}</span>}
          <h4 className="font-semibold text-slate-800 dark:text-white">{group.groupName}</h4>
          {group.isRequired && (
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              requirementMet 
                ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400'
                : 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400'
            }`}>
              {requirementMet ? '✓' : 'إجباري'}
            </span>
          )}
        </div>
        <span className="text-xs text-slate-500">
          {selections.length}/{group.maxSelections}
        </span>
      </div>

      {group.groupDescription && (
        <p className="text-xs text-slate-500 dark:text-slate-400">{group.groupDescription}</p>
      )}

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
                  ? 'bg-slate-800 dark:bg-white text-white dark:text-slate-800 shadow-md'
                  : canSelect
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    : 'bg-slate-50 dark:bg-slate-800/50 text-slate-400 cursor-not-allowed'
                }
              `}
            >
              {isSelected ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              <span>{option.name_ar}</span>
              {option.price > 0 && (
                <span className={isSelected ? 'opacity-80' : 'text-pink-600 dark:text-pink-400'}>
                  +{option.price}
                </span>
              )}
            </motion.button>
          )
        })}
      </div>

      {/* Validation hint */}
      {group.isRequired && !requirementMet && (
        <p className="text-xs text-amber-600 dark:text-amber-400">
          اختر {group.minSelections} على الأقل
        </p>
      )}
    </div>
  )
}
