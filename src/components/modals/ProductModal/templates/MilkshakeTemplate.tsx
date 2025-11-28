'use client'

import { motion } from 'framer-motion'
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
  const totalAddons = Object.values(selections).flat().length

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-5"
    >
      {/* Milkshake Header - Vibrant Design */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative overflow-hidden bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 p-5 rounded-2xl shadow-lg"
      >
        {/* Animated Background */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
        />
        
        {/* Floating Bubbles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white/20 rounded-full"
              style={{ left: `${20 + i * 15}%`, bottom: 0 }}
              animate={{ 
                y: [0, -60, 0],
                opacity: [0, 1, 0]
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 2 + i * 0.3,
                delay: i * 0.4
              }}
            />
          ))}
        </div>

        <div className="relative flex items-center gap-4">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0], y: [0, -3, 0] }}
            transition={{ repeat: Infinity, duration: 2.5 }}
            className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center"
          >
            <span className="text-3xl">🥤</span>
          </motion.div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white">ميلك شيك طازج</h3>
            <p className="text-xs text-white/80 mt-0.5">اختر الحجم وأضف إضافاتك المفضلة</p>
          </div>
          {totalAddons > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="bg-white text-amber-600 px-3 py-1.5 rounded-full text-sm font-bold shadow-md"
            >
              {totalAddons} إضافة
            </motion.div>
          )}
        </div>
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

      {/* Add-ons Section - Cards */}
      {customizationRules.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-5"
        >
          {/* Section Header */}
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">إضافات مميزة</h3>
            <div className="flex-1 h-px bg-gradient-to-r from-amber-200 to-transparent dark:from-amber-800" />
          </div>

          {customizationRules.map((group) => (
            <OptionsGrid
              key={group.groupId}
              group={group}
              selections={selections[group.groupId] || []}
              onSelectionChange={(ids) => onSelectionChange(group.groupId, ids)}
              columns={3}
              cardSize="sm"
              accentColor="amber"
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
