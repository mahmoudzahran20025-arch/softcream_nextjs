'use client'

import { motion } from 'framer-motion'
import { Product } from '@/lib/api'
import { useProductConfiguration } from '@/hooks/useProductConfiguration'
import ComplexTemplate from './builders/ComplexTemplate'
import MediumTemplate from './composers/MediumTemplate'
import SimpleTemplate from './selectors/SimpleTemplate'
import CustomizationSummary from '../CustomizationSummary'
import LifestyleWizard from './specialized/LifestyleWizard'

/**
 * Layout mode type for template rendering
 * Maps to internal template rendering modes
 */
export type LayoutMode = 'simple' | 'medium' | 'complex' | 'lifestyle'

/**
 * Product type for getEffectiveLayoutMode function
 * Minimal interface for template mapping
 * 
 * ✅ Purified: Only template_id is used (no layout_mode fallback)
 * Requirements: 9.5
 */
export interface TemplateProduct {
  template_id?: string
}

/**
 * Determine which template to render
 * ✅ Purified System: Uses template_id ONLY
 * 
 * Template ID Mapping:
 * - template_1 → simple (SimpleTemplate)
 * - template_2 → medium (MediumTemplate)
 * - template_3 → complex (ComplexTemplate)
 * 
 * This ensures consistency with ProductCard.tsx card selection logic
 * 
 * Requirements: 9.5
 */
export function getEffectiveLayoutMode(product: TemplateProduct): LayoutMode {
  // ✅ template_id is the ONLY source of truth (no layout_mode fallback)
  if (!product.template_id) {
    console.warn(`Product lacks template_id, using default simple template`)
    return 'simple' // Safe fallback per design doc
  }

  switch (product.template_id) {
    // Standard template IDs
    case 'template_1':
      return 'simple'

    case 'template_2':
      return 'medium'

    case 'template_3':
      return 'complex'

    case 'template_lifestyle':
      return 'lifestyle'

    default:
      console.warn(`Unknown template_id: ${product.template_id}, using default simple template`)
      return 'simple'
  }
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

  // Render appropriate template based on template_id
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



      case 'lifestyle':
        return (
          <LifestyleWizard
            product={product}
            productConfig={productConfig}
            onComplete={() => console.log('Lifestyle wizard complete')}
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
              (g.options || []).some((opt: any) => opt.id === optionId)
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
