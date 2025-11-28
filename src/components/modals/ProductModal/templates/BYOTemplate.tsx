'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Check, IceCream, AlertCircle } from 'lucide-react'
import ContainerSelector from '../ContainerSelector'
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

interface BYOTemplateProps {
  product: any
  containers: any[]
  selectedContainer: any
  onContainerSelect: (container: any) => void
  sizes: any[]
  selectedSize: any
  onSizeSelect: (size: any) => void
  customizationRules: CustomizationGroup[]
  selections: Record<string, string[]>
  onSelectionChange: (groupId: string, ids: string[]) => void
}

export default function BYOTemplate({
  product,
  containers,
  selectedContainer,
  onContainerSelect,
  sizes,
  selectedSize,
  onSizeSelect,
  customizationRules,
  selections,
  onSelectionChange
}: BYOTemplateProps) {
  // Separate flavors from other groups
  const flavorsGroup = customizationRules.find(g => 
    g.groupId === 'flavors' || g.groupId === 'ice_cream_flavors'
  )
  const addonsGroups = customizationRules.filter(g => 
    g.groupId !== 'flavors' && g.groupId !== 'ice_cream_flavors'
  )

  const selectedFlavors = flavorsGroup ? (selections[flavorsGroup.groupId] || []) : []
  const hasSelectedFlavors = selectedFlavors.length > 0
  const minFlavorsRequired = flavorsGroup?.minSelections || 1

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5"
    >
      {/* Step 1: Container */}
      {containers.length > 0 && (
        <StepSection step={1} title="اختر الحاوية" icon="🥤">
          <ContainerSelector
            containers={containers}
            selectedContainer={selectedContainer}
            onSelect={onContainerSelect}
          />
        </StepSection>
      )}

      {/* Step 2: Size */}
      {sizes.length > 0 && (
        <StepSection step={2} title="اختر المقاس" icon="📏">
          <SizeSelector
            sizes={sizes}
            selectedSize={selectedSize}
            onSelect={onSizeSelect}
            basePrice={product.price}
            showPriceAsTotal={true}
          />
        </StepSection>
      )}

      {/* Step 3: Flavors - Main Selection */}
      {flavorsGroup && (
        <StepSection 
          step={3} 
          title="اختر النكهات" 
          icon="🍦"
          badge={`${selectedFlavors.length}/${flavorsGroup.maxSelections}`}
          isComplete={hasSelectedFlavors}
        >
          <FlavorSelector
            group={flavorsGroup}
            selections={selectedFlavors}
            onSelectionChange={(ids) => onSelectionChange(flavorsGroup.groupId, ids)}
          />
          
          {/* Hint if no flavors selected */}
          <AnimatePresence>
            {!hasSelectedFlavors && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-2 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-3 py-2 rounded-xl text-sm mt-3"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>اختر {minFlavorsRequired} نكهة على الأقل لإكمال طلبك</span>
              </motion.div>
            )}
          </AnimatePresence>
        </StepSection>
      )}

      {/* Step 4: Add-ons (Optional) */}
      {addonsGroups.length > 0 && (
        <StepSection 
          step={4} 
          title="إضافات اختيارية" 
          icon="✨"
          optional
        >
          <div className="space-y-4">
            {addonsGroups.map(group => (
              <AddonsGroup
                key={group.groupId}
                group={group}
                selections={selections[group.groupId] || []}
                onSelectionChange={(ids) => onSelectionChange(group.groupId, ids)}
              />
            ))}
          </div>
        </StepSection>
      )}
    </motion.div>
  )
}

// Step Section Component
function StepSection({ 
  step, 
  title, 
  icon, 
  badge,
  isComplete,
  optional,
  children 
}: { 
  step: number
  title: string
  icon: string
  badge?: string
  isComplete?: boolean
  optional?: boolean
  children: React.ReactNode 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: step * 0.1 }}
      className="space-y-3"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${
            isComplete 
              ? 'bg-emerald-500 text-white' 
              : 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400'
          }`}>
            {isComplete ? <Check className="w-4 h-4" /> : step}
          </div>
          <span className="text-lg">{icon}</span>
          <h3 className="font-bold text-slate-900 dark:text-white">{title}</h3>
          {optional && (
            <span className="text-xs text-slate-400 dark:text-slate-500">(اختياري)</span>
          )}
        </div>
        {badge && (
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
            isComplete 
              ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
          }`}>
            {badge}
          </span>
        )}
      </div>
      {children}
    </motion.div>
  )
}

// Flavor Selector - Clean design without "مجاناً"
function FlavorSelector({
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

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
      {group.options.map((option) => {
        const isSelected = selections.includes(option.id)
        const canSelect = !isSelected && selections.length < group.maxSelections

        return (
          <motion.button
            key={option.id}
            onClick={() => handleToggle(option.id)}
            disabled={!canSelect && !isSelected}
            whileHover={canSelect || isSelected ? { scale: 1.02 } : {}}
            whileTap={{ scale: 0.98 }}
            className={`
              relative p-3 rounded-xl text-right transition-all duration-200
              ${isSelected
                ? 'bg-gradient-to-br from-pink-500 to-purple-600 text-white shadow-lg shadow-pink-500/30'
                : canSelect
                  ? 'bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-pink-300 dark:hover:border-pink-600'
                  : 'bg-slate-50 dark:bg-slate-800/50 border-2 border-dashed border-slate-200 dark:border-slate-700 opacity-50 cursor-not-allowed'
              }
            `}
          >
            {/* Selection indicator */}
            {isSelected && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-2 left-2 w-5 h-5 bg-white/20 rounded-full flex items-center justify-center"
              >
                <Check className="w-3 h-3 text-white" strokeWidth={3} />
              </motion.div>
            )}

            <div className="flex items-center gap-2">
              <IceCream className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-pink-500'}`} />
              <span className={`font-semibold text-sm ${isSelected ? 'text-white' : 'text-slate-800 dark:text-white'}`}>
                {option.name_ar}
              </span>
            </div>
          </motion.button>
        )
      })}
    </div>
  )
}

// Add-ons Group - Shows prices for paid items
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
      <div className="flex items-center gap-2">
        {group.groupIcon && <span className="text-lg">{group.groupIcon}</span>}
        <h4 className="font-semibold text-slate-800 dark:text-white text-sm">{group.groupName}</h4>
        <span className="text-xs text-slate-400">({selections.length}/{group.maxSelections})</span>
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
                px-3 py-2 rounded-xl text-sm font-medium transition-all
                ${isSelected
                  ? 'bg-pink-500 text-white'
                  : canSelect
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-pink-100 dark:hover:bg-pink-900/30'
                    : 'bg-slate-50 dark:bg-slate-800/50 text-slate-400 cursor-not-allowed'
                }
              `}
            >
              <span>{option.name_ar}</span>
              {option.price > 0 && (
                <span className={`mr-1 ${isSelected ? 'text-white/80' : 'text-pink-600 dark:text-pink-400'}`}>
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
