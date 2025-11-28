'use client'

import { motion } from 'framer-motion'
import { Check, Plus, IceCream } from 'lucide-react'
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

      {/* Ice Cream Add-on - Special Section */}
      {iceCreamGroup && (
        <IceCreamSection
          group={iceCreamGroup}
          selections={selections[iceCreamGroup.groupId] || []}
          onSelectionChange={(ids) => onSelectionChange(iceCreamGroup.groupId, ids)}
        />
      )}

      {/* Sauces */}
      {saucesGroup && (
        <AddonsSection
          group={saucesGroup}
          selections={selections[saucesGroup.groupId] || []}
          onSelectionChange={(ids) => onSelectionChange(saucesGroup.groupId, ids)}
          color="amber"
        />
      )}

      {/* Toppings */}
      {toppingsGroup && (
        <AddonsSection
          group={toppingsGroup}
          selections={selections[toppingsGroup.groupId] || []}
          onSelectionChange={(ids) => onSelectionChange(toppingsGroup.groupId, ids)}
          color="purple"
        />
      )}

      {/* Other Groups */}
      {otherGroups.map(group => (
        <AddonsSection
          key={group.groupId}
          group={group}
          selections={selections[group.groupId] || []}
          onSelectionChange={(ids) => onSelectionChange(group.groupId, ids)}
        />
      ))}
    </motion.div>
  )
}

// Ice Cream Section - Highlighted for desserts
function IceCreamSection({
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
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-950/20 dark:to-purple-950/20 rounded-2xl p-4 border border-pink-200 dark:border-pink-800/50"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <IceCream className="w-5 h-5 text-pink-500" />
          <h4 className="font-bold text-slate-800 dark:text-white">أضف آيس كريم</h4>
          <span className="text-xs text-slate-500 dark:text-slate-400">(اختياري)</span>
        </div>
        <span className="text-xs font-semibold text-pink-600 dark:text-pink-400 bg-pink-100 dark:bg-pink-900/30 px-2 py-1 rounded-full">
          {selections.length}/{group.maxSelections}
        </span>
      </div>

      <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
        {group.options.map((option) => {
          const isSelected = selections.includes(option.id)
          const canSelect = !isSelected && selections.length < group.maxSelections

          return (
            <motion.button
              key={option.id}
              onClick={() => handleToggle(option.id)}
              disabled={!canSelect && !isSelected}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={`
                relative p-2.5 rounded-xl text-center transition-all
                ${isSelected
                  ? 'bg-pink-500 text-white shadow-md'
                  : canSelect
                    ? 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-pink-300'
                    : 'bg-slate-100 dark:bg-slate-800/50 opacity-50 cursor-not-allowed'
                }
              `}
            >
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center"
                >
                  <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                </motion.div>
              )}
              <span className={`text-xs font-semibold ${isSelected ? 'text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                {option.name_ar}
              </span>
              {option.price > 0 && (
                <div className={`text-[10px] mt-0.5 ${isSelected ? 'text-white/80' : 'text-pink-600 dark:text-pink-400'}`}>
                  +{option.price} ج.م
                </div>
              )}
            </motion.button>
          )
        })}
      </div>
    </motion.div>
  )
}

// Generic Add-ons Section
function AddonsSection({
  group,
  selections,
  onSelectionChange,
  color = 'slate'
}: {
  group: CustomizationGroup
  selections: string[]
  onSelectionChange: (ids: string[]) => void
  color?: 'slate' | 'amber' | 'purple' | 'pink'
}) {
  const handleToggle = (optionId: string) => {
    const isSelected = selections.includes(optionId)
    if (isSelected) {
      onSelectionChange(selections.filter(id => id !== optionId))
    } else if (selections.length < group.maxSelections) {
      onSelectionChange([...selections, optionId])
    }
  }

  const colorClasses = {
    slate: 'text-slate-600 dark:text-slate-400',
    amber: 'text-amber-600 dark:text-amber-400',
    purple: 'text-purple-600 dark:text-purple-400',
    pink: 'text-pink-600 dark:text-pink-400'
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {group.groupIcon && <span className="text-lg">{group.groupIcon}</span>}
          <h4 className="font-semibold text-slate-800 dark:text-white text-sm">{group.groupName}</h4>
          {!group.isRequired && (
            <span className="text-xs text-slate-400">(اختياري)</span>
          )}
        </div>
        <span className={`text-xs font-medium ${colorClasses[color]}`}>
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
                  ? 'bg-pink-500 text-white'
                  : canSelect
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-pink-50 dark:hover:bg-pink-900/20'
                    : 'bg-slate-50 dark:bg-slate-800/50 text-slate-400 cursor-not-allowed'
                }
              `}
            >
              {isSelected ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <Plus className="w-3.5 h-3.5" />
              )}
              <span>{option.name_ar}</span>
              {option.price > 0 && (
                <span className={isSelected ? 'text-white/80' : 'text-pink-600 dark:text-pink-400'}>
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
