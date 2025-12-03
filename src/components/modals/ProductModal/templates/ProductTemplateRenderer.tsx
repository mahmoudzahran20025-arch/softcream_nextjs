'use client'

import { motion } from 'framer-motion'
import { Product } from '@/lib/api'
import { useProductConfiguration } from '@/hooks/useProductConfiguration'
import ComplexTemplate from './builders/ComplexTemplate'
import MediumTemplate from './composers/MediumTemplate'
import SimpleTemplate from './selectors/SimpleTemplate'
import CustomizationSummary from '../CustomizationSummary'

/**
 * Layout mode type for template rendering
 */
export type LayoutMode = 'simple' | 'medium' | 'complex'

/**
 * Product type for getEffectiveLayoutMode function
 * Minimal interface for template mapping
 */
export interface TemplateProduct {
  template_id?: string
  layout_mode?: string
}

/**
 * Determine which template to render
 * Priority: template_id → layout_mode → default (simple)
 * 
 * Template ID Mapping (Primary - from Backend):
 * - template_1 → simple (SimpleTemplate)
 * - template_2 → medium (MediumTemplate)
 * - template_3 → complex (ComplexTemplate)
 * 
 * This ensures consistency with ProductCard.tsx card selection logic
 * 
 * Requirements: 10.2, 11.1, 11.2, 11.3
 */
export function getEffectiveLayoutMode(product: TemplateProduct): LayoutMode {
  // Priority 1: template_id (from Template System)
  if (product.template_id) {
    switch (product.template_id) {
      // Primary IDs (from Backend)
      case 'template_1':
      case 'template_simple':  // Legacy alias
        return 'simple'
      case 'template_2':
      case 'template_medium':  // Legacy alias
        return 'medium'
      case 'template_3':
      case 'template_complex':  // Legacy alias
        return 'complex'
    }
  }
  
  // Priority 2: layout_mode (fallback)
  if (product.layout_mode) {
    // Normalize layout_mode to LayoutMode
    switch (product.layout_mode) {
      case 'simple':
      case 'selector':  // Legacy alias
        return 'simple'
      case 'medium':
      case 'composer':  // Legacy alias
      case 'standard':  // Legacy alias
        return 'medium'
      case 'complex':
      case 'builder':  // Legacy alias
        return 'complex'
      default:
        return product.layout_mode as LayoutMode
    }
  }
  
  // Default
  return 'simple'
}

interface ProductTemplateRendererProps {
  product: Product
  productConfig: ReturnType<typeof useProductConfiguration>
}

export default function ProductTemplateRenderer({
  product,
  productConfig
}: ProductTemplateRendererProps) {
  const {
    isLoading,
    containers,
    selectedContainer,
    setSelectedContainer,
    sizes,
    selectedSize,
    setSelectedSize,
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

  // Use the exported getEffectiveLayoutMode function
  const layoutMode = getEffectiveLayoutMode(product)

  // Render appropriate template
  // Note: Legacy aliases (builder, composer, selector) are already normalized
  // by getEffectiveLayoutMode to (complex, medium, simple)
  const renderTemplate = () => {
    switch (layoutMode) {
      case 'complex':
        return (
          <ComplexTemplate
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

      case 'medium':
        return (
          <MediumTemplate
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

      case 'simple':
      default:
        return (
          <SimpleTemplate
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
