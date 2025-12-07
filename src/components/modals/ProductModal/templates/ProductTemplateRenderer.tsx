'use client'

// ================================================================
// ProductTemplateRenderer.tsx - Unified Product Rendering
// ================================================================
// UNIFIED PRODUCT MODEL: All rendering now uses UnifiedProductRenderer
// Legacy templates archived to templates/_archived/
// ================================================================

import { motion } from 'framer-motion'
import { Product } from '@/lib/api'
import { useProductConfiguration } from '@/hooks/useProductConfiguration'
import UnifiedProductRenderer from '../UnifiedProductRenderer'

// ================================================================
// TYPES
// ================================================================

/**
 * Layout mode type for template rendering
 * Maps to internal template rendering modes
 */
export type LayoutMode = 'simple' | 'medium' | 'complex' | 'lifestyle'

/**
 * Product type for getEffectiveLayoutMode function
 * Minimal interface for template mapping
 */
export interface TemplateProduct {
  template_id?: string
}

/**
 * Determine which template to render based on template_id
 * @deprecated - Now handled by UnifiedProductRenderer via templateId
 */
export function getEffectiveLayoutMode(product: TemplateProduct): LayoutMode {
  if (!product.template_id) {
    return 'simple'
  }

  switch (product.template_id) {
    case 'template_1':
      return 'simple'
    case 'template_2':
      return 'medium'
    case 'template_3':
      return 'complex'
    case 'template_lifestyle':
      return 'lifestyle'
    default:
      return 'simple'
  }
}

// ================================================================
// PROPS
// ================================================================

interface ProductTemplateRendererProps {
  product: Product
  productConfig: ReturnType<typeof useProductConfiguration>
}

// ================================================================
// MAIN COMPONENT
// ================================================================

export default function ProductTemplateRenderer({
  product,
  productConfig
}: ProductTemplateRendererProps) {
  const { isLoading } = productConfig

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

  // ================================================================
  // UNIFIED RENDERER - Data-Driven UI
  // Adapts productConfig to ProductEngineReturn interface
  // ================================================================

  const engineAdapter = {
    isLoading,
    error: null,
    config: productConfig.config,
    uiConfig: {
      display_style: 'cards' as const,
      columns: 2 as const,
      card_size: 'medium' as const,
      show_images: true,
      show_prices: true,
      show_macros: productConfig.templateId === 'template_lifestyle'
    },
    templateId: productConfig.templateId,
    hasContainers: productConfig.hasContainers,
    containers: productConfig.containers,
    selectedContainer: productConfig.selectedContainer,
    containerObj: productConfig.containerObj,
    hasSizes: productConfig.hasSizes,
    sizes: productConfig.sizes,
    selectedSize: productConfig.selectedSize,
    sizeObj: productConfig.sizeObj,
    hasCustomization: productConfig.hasCustomization,
    optionGroups: productConfig.customizationRules,
    selections: productConfig.selections,
    selectedOptions: productConfig.selectedOptions,
    basePrice: productConfig.config?.product?.basePrice ?? 0,
    customizationTotal: productConfig.customizationTotal,
    currentPrice: productConfig.totalPrice,
    nutrition: productConfig.totalNutrition,
    energyType: productConfig.energyType,
    energyScore: productConfig.energyScore,
    validationResult: productConfig.validationResult,
    isValid: productConfig.validationResult.isValid,
    actions: {
      select: (groupId: string, optionId: string) => {
        const current = productConfig.selections[groupId] || []
        productConfig.updateGroupSelections(groupId, [...current, optionId])
      },
      remove: (groupId: string, optionId: string) => {
        const current = productConfig.selections[groupId] || []
        productConfig.updateGroupSelections(groupId, current.filter(id => id !== optionId))
      },
      toggle: (groupId: string, optionId: string) => {
        const current = productConfig.selections[groupId] || []
        if (current.includes(optionId)) {
          productConfig.updateGroupSelections(groupId, current.filter(id => id !== optionId))
        } else {
          productConfig.updateGroupSelections(groupId, [...current, optionId])
        }
      },
      setContainer: productConfig.setSelectedContainer,
      setSize: productConfig.setSelectedSize,
      reset: () => {
        productConfig.setSelectedContainer(null)
        productConfig.setSelectedSize(null)
      }
    }
  }

  return <UnifiedProductRenderer product={product} engine={engineAdapter as any} />
}
