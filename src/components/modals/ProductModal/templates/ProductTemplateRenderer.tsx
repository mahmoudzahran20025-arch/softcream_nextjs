'use client'

import { motion } from 'framer-motion'
import { Product } from '@/lib/api'
import { useProductConfiguration } from '@/hooks/useProductConfiguration'
import BYOTemplate from './BYOTemplate'
import DessertTemplate from './DessertTemplate'
import MilkshakeTemplate from './MilkshakeTemplate'
import PresetTemplate from './PresetTemplate'
import StandardTemplate from './StandardTemplate'
import CustomizationSummary from '../CustomizationSummary'

interface ProductTemplateRendererProps {
  product: Product
  productConfig: ReturnType<typeof useProductConfiguration>
}

export default function ProductTemplateRenderer({
  product,
  productConfig
}: ProductTemplateRendererProps) {
  const {
    productType,
    isLoading,
    hasContainers,
    containers,
    selectedContainer,
    setSelectedContainer,
    sizes,
    selectedSize,
    setSelectedSize,
    hasCustomization,
    customizationRules,
    selections,
    updateGroupSelections,
    selectedOptions,
    customizationTotal
  } = productConfig

  // Loading state
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-12 space-y-4"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
          className="w-12 h-12 border-4 border-pink-200 dark:border-pink-800 border-t-pink-500 dark:border-t-pink-400 rounded-full"
        />
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
          جاري تحميل الخيارات...
        </p>
      </motion.div>
    )
  }

  // Determine which template to render
  const isBYO = productType === 'byo_ice_cream' || (hasContainers && hasCustomization)
  const isDessert = productType === 'dessert'
  const isMilkshake = productType === 'milkshake'
  const isPreset = productType === 'preset_ice_cream'

  // Render appropriate template
  const renderTemplate = () => {
    if (isBYO) {
      return (
        <BYOTemplate
          product={product}
          containers={containers}
          selectedContainer={selectedContainer}
          onContainerSelect={setSelectedContainer}
          sizes={sizes}
          selectedSize={selectedSize}
          onSizeSelect={setSelectedSize}
          customizationRules={customizationRules}
          selections={selections}
          onSelectionChange={updateGroupSelections}
        />
      )
    }

    if (isDessert) {
      return (
        <DessertTemplate
          product={product}
          sizes={sizes}
          selectedSize={selectedSize}
          onSizeSelect={setSelectedSize}
          customizationRules={customizationRules}
          selections={selections}
          onSelectionChange={updateGroupSelections}
        />
      )
    }

    if (isMilkshake) {
      return (
        <MilkshakeTemplate
          product={product}
          sizes={sizes}
          selectedSize={selectedSize}
          onSizeSelect={setSelectedSize}
          customizationRules={customizationRules}
          selections={selections}
          onSelectionChange={updateGroupSelections}
        />
      )
    }

    if (isPreset) {
      return (
        <PresetTemplate
          product={product}
          sizes={sizes}
          selectedSize={selectedSize}
          onSizeSelect={setSelectedSize}
          customizationRules={customizationRules}
          selections={selections}
          onSelectionChange={updateGroupSelections}
        />
      )
    }

    // Default: Standard template
    return (
      <StandardTemplate
        product={product}
        sizes={sizes}
        selectedSize={selectedSize}
        onSizeSelect={setSelectedSize}
        customizationRules={customizationRules}
        selections={selections}
        onSelectionChange={updateGroupSelections}
      />
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="space-y-4"
    >
      {/* Render the appropriate template */}
      {renderTemplate()}

      {/* Selection Summary - Shared across all templates */}
      {selectedOptions.length > 0 && (
        <CustomizationSummary
          selections={selectedOptions}
          customizationTotal={customizationTotal}
          onRemove={(optionId) => {
            const group = customizationRules.find((g: any) =>
              g.options.some((opt: any) => opt.id === optionId)
            )
            if (group) {
              const currentSelections = selections[group.groupId] || []
              updateGroupSelections(
                group.groupId,
                currentSelections.filter((id: string) => id !== optionId)
              )
            }
          }}
        />
      )}
    </motion.div>
  )
}
