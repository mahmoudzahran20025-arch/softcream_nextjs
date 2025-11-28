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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5"
    >
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
      {addonsGroups.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>✨</span> إضافات اختيارية
          </h3>
          
          {addonsGroups.map(group => (
            <AddonsGroup
              key={group.groupId}
              group={group}
              selections={selections[group.groupId] || []}
              onSelectionChange={(ids) => onSelectionChange(group.groupId, ids)}
            />
          ))}
        </div>
      )}

      {/* No customization message */}
      {sizes.length === 0 && addonsGroups.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-6 text-slate-500 dark:text-slate-400"
        >
          <span className="text-3xl mb-2 block">🍨</span>
          <p>هذا المنتج جاهز للطلب!</p>
        </motion.div>
      )}
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
          <h4 className="font-medium text-slate-700 dark:text-slate-300 text-sm">{group.groupName}</h4>
        </div>
        <span className="text-xs text-slate-400">
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
                flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all
                ${isSelected
                  ? 'bg-cyan-500 text-white'
                  : canSelect
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-cyan-50 dark:hover:bg-cyan-900/20'
                    : 'bg-slate-50 dark:bg-slate-800/50 text-slate-400 cursor-not-allowed'
                }
              `}
            >
              {isSelected ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              <span>{option.name_ar}</span>
              {option.price > 0 && (
                <span className={isSelected ? 'text-white/80' : 'text-cyan-600 dark:text-cyan-400'}>
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
