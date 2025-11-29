'use client'

import { motion } from 'framer-motion'
import { 
  Check, 
  Sparkles, 
  ChevronRight,
  Package,
  Ruler,
  IceCream,
  Droplet,
  Cookie,
  Lightbulb
} from 'lucide-react'
import ContainerSelector from '../ContainerSelector'
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
  const saucesGroup = customizationRules.find(g => g.groupId === 'sauces')
  const toppingsGroup = customizationRules.find(g => g.groupId === 'toppings')
  const otherGroups = customizationRules.filter(g => 
    !['flavors', 'ice_cream_flavors', 'sauces', 'toppings'].includes(g.groupId)
  )

  const selectedFlavors = flavorsGroup ? (selections[flavorsGroup.groupId] || []) : []
  const hasSelectedFlavors = selectedFlavors.length > 0

  // Calculate progress
  const totalSteps = [
    containers.length > 0,
    sizes.length > 0,
    !!flavorsGroup
  ].filter(Boolean).length
  
  const completedSteps = [
    containers.length > 0 && selectedContainer,
    sizes.length > 0 && selectedSize,
    flavorsGroup && hasSelectedFlavors
  ].filter(Boolean).length

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Progress Indicator */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(completedSteps / totalSteps) * 100}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full"
          />
        </div>
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
          {completedSteps}/{totalSteps}
        </span>
      </div>

      {/* Step 1: Container */}
      {containers.length > 0 && (
        <StepSection 
          step={1} 
          title="اختر الحاوية" 
          IconComponent={Package}
          isComplete={!!selectedContainer}
          isActive={!selectedContainer}
        >
          <ContainerSelector
            containers={containers}
            selectedContainer={selectedContainer}
            onSelect={onContainerSelect}
          />
        </StepSection>
      )}

      {/* Step 2: Size */}
      {sizes.length > 0 && (
        <StepSection 
          step={containers.length > 0 ? 2 : 1} 
          title="اختر المقاس" 
          IconComponent={Ruler}
          isComplete={!!selectedSize}
          isActive={!!selectedContainer && !selectedSize}
        >
          <SizeSelector
            sizes={sizes}
            selectedSize={selectedSize}
            onSelect={onSizeSelect}
            basePrice={product.price}
            showPriceAsTotal={true}
          />
        </StepSection>
      )}

      {/* Step 3: Flavors - Cards Grid */}
      {flavorsGroup && (
        <StepSection 
          step={(containers.length > 0 ? 1 : 0) + (sizes.length > 0 ? 1 : 0) + 1}
          title="اختر النكهات" 
          IconComponent={IceCream}
          badge={`${selectedFlavors.length}/${flavorsGroup.maxSelections}`}
          isComplete={hasSelectedFlavors}
          isActive={!!selectedSize && !hasSelectedFlavors}
          highlight
          hint={!hasSelectedFlavors ? `اختر ${flavorsGroup.minSelections} نكهة على الأقل لإضافة المنتج للسلة` : undefined}
        >
          <OptionsGrid
            group={flavorsGroup}
            selections={selectedFlavors}
            onSelectionChange={(ids) => onSelectionChange(flavorsGroup.groupId, ids)}
            columns={3}
            cardSize="md"
            accentColor="pink"
            showSelectionOrder={true}
            showImages={true}
            showDescriptions={true}
            showNutrition={true}
          />
        </StepSection>
      )}

      {/* Optional Add-ons Section - Always visible for exploration */}
      {(saucesGroup || toppingsGroup || otherGroups.length > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-5 pt-2"
        >
          {/* Section Header with Quick Nav */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-pink-500" />
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">إضافات اختيارية</h3>
              <div className="flex-1 h-px bg-gradient-to-r from-pink-200 to-transparent dark:from-pink-800" />
              {!hasSelectedFlavors && (
                <span className="text-[10px] text-slate-400 dark:text-slate-500">
                  (اختر النكهات أولاً)
                </span>
              )}
            </div>
            
            {/* Quick Navigation Pills */}
            <div className="flex flex-wrap gap-2">
              {saucesGroup && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => document.getElementById('section-sauces')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                  className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full transition-all ${
                    (selections[saucesGroup.groupId] || []).length > 0
                      ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 ring-1 ring-amber-300 dark:ring-amber-700'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-amber-50 dark:hover:bg-amber-950/20'
                  }`}
                >
                  <Droplet className="w-3.5 h-3.5" />
                  <span>صوصات</span>
                  {(selections[saucesGroup.groupId] || []).length > 0 && (
                    <span className="font-bold">({(selections[saucesGroup.groupId] || []).length})</span>
                  )}
                </motion.button>
              )}
              {toppingsGroup && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => document.getElementById('section-toppings')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                  className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full transition-all ${
                    (selections[toppingsGroup.groupId] || []).length > 0
                      ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 ring-1 ring-purple-300 dark:ring-purple-700'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-purple-50 dark:hover:bg-purple-950/20'
                  }`}
                >
                  <Cookie className="w-3.5 h-3.5" />
                  <span>إضافات</span>
                  {(selections[toppingsGroup.groupId] || []).length > 0 && (
                    <span className="font-bold">({(selections[toppingsGroup.groupId] || []).length})</span>
                  )}
                </motion.button>
              )}
            </div>
          </div>

          {/* Sauces - Cards */}
          {saucesGroup && (
            <div id="section-sauces">
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
            </div>
          )}

          {/* Toppings - Cards */}
          {toppingsGroup && (
            <div id="section-toppings">
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
            </div>
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
        </motion.div>
      )}
    </motion.div>
  )
}

// Step Section Component
function StepSection({ 
  step, 
  title, 
  IconComponent,
  badge,
  isComplete,
  isActive,
  highlight,
  hint,
  children 
}: { 
  step: number
  title: string
  IconComponent: React.ComponentType<{ className?: string }>
  badge?: string
  isComplete?: boolean
  isActive?: boolean
  highlight?: boolean
  hint?: string
  children: React.ReactNode 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: step * 0.08 }}
      className={`space-y-3 p-4 rounded-2xl transition-all duration-300 ${
        highlight && isActive
          ? 'bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-950/20 dark:to-purple-950/20 border border-pink-200 dark:border-pink-800/50'
          : isActive
            ? 'bg-slate-50 dark:bg-slate-800/50'
            : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {/* Step Number/Check */}
          <motion.div 
            animate={isComplete ? { scale: [1, 1.2, 1] } : {}}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
              isComplete 
                ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-lg shadow-emerald-500/30' 
                : isActive
                  ? 'bg-gradient-to-br from-pink-500 to-purple-600 text-white shadow-lg shadow-pink-500/30'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
            }`}
          >
            {isComplete ? <Check className="w-4 h-4" strokeWidth={3} /> : step}
          </motion.div>
          
          {/* Icon */}
          <div className={`transition-colors ${
            isComplete
              ? 'text-emerald-600 dark:text-emerald-400'
              : isActive
                ? 'text-pink-600 dark:text-pink-400'
                : 'text-slate-400 dark:text-slate-500'
          }`}>
            <IconComponent className="w-5 h-5" />
          </div>
          
          {/* Title */}
          <h3 className="font-bold text-slate-900 dark:text-white">{title}</h3>
          
          {/* Active Indicator */}
          {isActive && !isComplete && (
            <motion.div
              animate={{ x: [0, 4, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <ChevronRight className="w-4 h-4 text-pink-500" />
            </motion.div>
          )}
        </div>
        
        {/* Badge */}
        {badge && (
          <motion.span 
            animate={isComplete ? { scale: [1, 1.1, 1] } : {}}
            className={`text-xs font-bold px-2.5 py-1 rounded-full transition-all ${
              isComplete 
                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            {badge}
          </motion.span>
        )}
      </div>
      
      {/* Hint Message */}
      {hint && isActive && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-sm text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/20 px-3 py-2 rounded-xl border border-pink-200 dark:border-pink-800/50"
        >
          <Lightbulb className="w-4 h-4" />
          <span>{hint}</span>
        </motion.div>
      )}
      
      {children}
    </motion.div>
  )
}