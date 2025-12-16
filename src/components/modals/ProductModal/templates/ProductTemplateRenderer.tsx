'use client'

// ================================================================
// ProductTemplateRenderer.tsx - Unified Product Rendering
// ================================================================
// UNIFIED PRODUCT MODEL: All rendering now uses UnifiedProductRenderer
// All products use the same data-driven rendering path
// 
// Requirements 6.1: Template → Card Type Mapping
// The template_id determines which card component is used:
// - template_1 → SimpleCard (simple)
// - template_2 → StandardCard (medium)
// - template_3 → BYOCard (complex)
// - template_lifestyle → LifestyleCard (medium with nutrition)
// 
// Card type mapping is handled by:
// - ProductCard.tsx: getCardTypeFromProduct() for product listing
// - UnifiedProductRenderer: templateId for modal rendering
// ================================================================

import { motion } from 'framer-motion'
import { Product } from '@/lib/api'
import { useProductConfiguration } from '@/hooks/useProductConfiguration'
import UnifiedProductRenderer from '../UnifiedProductRenderer'

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

  // ✅ FIX: Use actual ui_config from backend instead of hardcoded values
  const backendUIConfig = productConfig.config?.product?.uiConfig || {}
  
  const engineAdapter = {
    isLoading,
    error: null,
    config: productConfig.config,
    uiConfig: {
      display_style: (backendUIConfig.display_style || 'cards') as 'cards' | 'grid' | 'list' | 'pills',
      columns: (backendUIConfig.columns || 2) as 1 | 2 | 3 | 4,
      card_size: (backendUIConfig.card_size || 'medium') as 'sm' | 'md' | 'lg',
      show_images: backendUIConfig.show_images ?? true,
      show_prices: backendUIConfig.show_prices ?? true,
      show_macros: backendUIConfig.show_macros ?? (productConfig.templateId === 'template_lifestyle')
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
