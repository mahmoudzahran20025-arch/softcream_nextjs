import { useState, useEffect, useMemo, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  getProductConfiguration,
  ProductConfiguration
} from '@/lib/api'
import {
  createEmptyNutrition,
  addNutrition,
  multiplyNutrition,
  calculateEnergyData,
  type NutritionValues
} from '@/lib/utils/nutritionCalculator'
import {
  useConditionalOptions,
  parseConditionalRules,
  type OptionGroupWithRules
} from './useConditionalOptions'

interface UseProductConfigurationProps {
  productId: string | null
  isOpen: boolean
}

export function useProductConfiguration({ productId, isOpen }: UseProductConfigurationProps) {
  // State
  const [selectedContainer, setSelectedContainer] = useState<string | null>(null)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [selections, setSelections] = useState<Record<string, string[]>>({})

  // Fetch configuration
  const { data: config, isLoading, error } = useQuery<ProductConfiguration | null>({
    queryKey: ['product-configuration', productId],
    queryFn: async () => {
      if (!productId) return null
      const result = await getProductConfiguration(productId, 'ar')
      return result
    },
    enabled: !!productId && isOpen,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    retry: 1
  })

  // Reset state when modal closes or product changes
  useEffect(() => {
    if (!isOpen) {
      setSelectedContainer(null)
      setSelectedSize(null)
      setSelections({})
    }
  }, [isOpen, productId])

  // Set defaults when config loads (only once)
  useEffect(() => {
    if (config && !selectedContainer && !selectedSize) {
      // Set default container
      if (config.hasContainers && config.containers.length > 0) {
        const defaultContainer = config.containers.find(c => c.isDefault) || config.containers[0]
        setSelectedContainer(defaultContainer.id)
      }
      // Set default size
      if (config.hasSizes && config.sizes.length > 0) {
        const defaultSize = config.sizes.find(s => s.isDefault) || config.sizes[0]
        setSelectedSize(defaultSize.id)
      }
    }
  }, [config]) // Only depend on config, not on selectedContainer/selectedSize


  // Get available sizes for selected container
  const availableSizes = useMemo(() => {
    if (!config?.hasSizes || !config.sizes) return []

    if (!selectedContainer) {
      // Return sizes without container restriction
      return config.sizes.filter(s => !s.containerId)
    }

    // Filter sizes for selected container
    return config.sizes.filter(s =>
      s.containerId === selectedContainer || !s.containerId
    )
  }, [config, selectedContainer])

  // Update size when container changes (if current size not available)
  useEffect(() => {
    if (selectedSize && availableSizes.length > 0) {
      const sizeStillAvailable = availableSizes.some(s => s.id === selectedSize)
      if (!sizeStillAvailable) {
        const defaultSize = availableSizes.find(s => s.isDefault) || availableSizes[0]
        setSelectedSize(defaultSize.id)
      }
    }
  }, [selectedContainer, availableSizes, selectedSize])

  // Get selected container object
  const containerObj = useMemo(() => {
    if (!config?.hasContainers || !selectedContainer) return null
    return config.containers.find(c => c.id === selectedContainer) || null
  }, [config, selectedContainer])

  // Get selected size object
  const sizeObj = useMemo(() => {
    if (!selectedSize) return null
    return availableSizes.find(s => s.id === selectedSize) || null
  }, [availableSizes, selectedSize])

  // ================================================================
  // Conditional Options Support (Requirements 1.1, 1.2, 1.3, 1.4)
  // ================================================================

  // Transform customization rules to include conditional rules
  const optionGroupsWithRules: OptionGroupWithRules[] = useMemo(() => {
    if (!config?.customizationRules) return []

    return config.customizationRules.map((group: any) => ({
      groupId: group.groupId,
      groupName: group.groupName,
      maxSelections: group.maxSelections,
      // Parse conditional rules if present (from backend API)
      conditionalRules: group.conditionalRules
        ? parseConditionalRules(
            typeof group.conditionalRules === 'string'
              ? group.conditionalRules
              : JSON.stringify(group.conditionalRules)
          )
        : null
    }))
  }, [config?.customizationRules])

  // Use conditional options hook
  const {
    getMaxSelections,
    applyConditionalRule,
    effectiveMaxSelections
  } = useConditionalOptions(optionGroupsWithRules)

  // Apply conditional rules when size changes
  // Note: We only trigger on selectedSize change, not on selections change
  // to avoid infinite loops when enforcing limits
  useEffect(() => {
    if (selectedSize && config?.hasSizes) {
      // Apply conditional rule for sizes group
      applyConditionalRule('sizes', selectedSize)
    }
  }, [selectedSize, config?.hasSizes, applyConditionalRule])

  // Enforce selection limits separately when effectiveMaxSelections changes
  // This runs after applyConditionalRule updates the max selections
  useEffect(() => {
    if (!config?.hasSizes) return

    // Use functional update to avoid depending on selections in the effect
    setSelections(prevSelections => {
      let hasChanges = false
      const newSelections = { ...prevSelections }

      Object.keys(prevSelections).forEach(groupId => {
        const currentSelections = prevSelections[groupId] || []
        const maxAllowed = effectiveMaxSelections[groupId]

        // Only enforce if we have a max limit defined
        if (maxAllowed !== undefined && currentSelections.length > maxAllowed) {
          hasChanges = true
          newSelections[groupId] = currentSelections.slice(0, maxAllowed)
          const removedCount = currentSelections.length - maxAllowed
          console.log(`[ConditionalOptions] تم إزالة ${removedCount} اختيار(ات) بسبب تغيير الحجم`)
        }
      })

      // Only return new object if there were actual changes
      return hasChanges ? newSelections : prevSelections
    })
  }, [effectiveMaxSelections, config?.hasSizes])

  // Update group selections
  const updateGroupSelections = useCallback((groupId: string, selectedIds: string[]) => {
    setSelections(prev => ({
      ...prev,
      [groupId]: selectedIds
    }))
  }, [])

  // Calculate customization total and selected options
  // ✅ Using nutritionCalculator for consistent calculations
  const customizationData = useMemo(() => {
    if (!config?.hasCustomization || !config.customizationRules) {
      return { total: 0, selectedOptions: [], nutrition: createEmptyNutrition() }
    }

    let total = 0
    const selectedOptions: Array<{
      id: string
      name: string
      price: number
      groupId: string
      groupIcon?: string
      nutrition?: NutritionValues
    }> = []
    let nutrition = createEmptyNutrition()

    config.customizationRules.forEach(group => {
      const groupSelections = selections[group.groupId] || []

      groupSelections.forEach(optionId => {
        const option = group.options.find((opt) => opt.id === optionId)
        if (option) {
          total += option.price || 0
          selectedOptions.push({
            id: option.id,
            name: option.name_ar,
            price: option.price || 0,
            groupId: group.groupId,
            groupIcon: group.groupIcon,
            nutrition: option.nutrition
          })

          // ✅ Using addNutrition from nutritionCalculator
          if (option.nutrition) {
            nutrition = addNutrition(nutrition, option.nutrition)
          }
        }
      })
    })

    return { total, selectedOptions, nutrition }
  }, [config, selections])

  // Calculate total nutrition (container + customizations × size multiplier)
  // ✅ Using nutritionCalculator for consistent calculations
  const totalNutrition = useMemo(() => {
    const multiplier = sizeObj?.nutritionMultiplier || 1

    // Start with container nutrition (not affected by size)
    let nutrition = createEmptyNutrition()
    if (containerObj?.nutrition) {
      nutrition = addNutrition(nutrition, containerObj.nutrition)
    }

    // Add customization nutrition × size multiplier
    const scaledCustomization = multiplyNutrition(customizationData.nutrition, multiplier)
    nutrition = addNutrition(nutrition, scaledCustomization)

    return nutrition
  }, [containerObj, customizationData.nutrition, sizeObj])

  // Calculate total price
  const totalPrice = useMemo(() => {
    if (!config) return 0

    const basePrice = config.product.basePrice
    const containerPrice = containerObj?.priceModifier || 0
    const sizePrice = sizeObj?.priceModifier || 0
    const customizationPrice = customizationData.total

    return basePrice + containerPrice + sizePrice + customizationPrice
  }, [config, containerObj, sizeObj, customizationData.total])

  // Validation - Uses effective max selections from conditional rules
  const validationResult = useMemo(() => {
    if (!config?.hasCustomization || !config.customizationRules) {
      return { isValid: true, errors: [] }
    }

    const errors: string[] = []

    config.customizationRules.forEach((group: any) => {
      const groupSelections = selections[group.groupId] || []
      // Use effective max selections (considers conditional rules)
      const effectiveMax = getMaxSelections(group.groupId)

      if (group.isRequired && groupSelections.length === 0) {
        errors.push(`يجب اختيار ${group.groupName}`)
      }

      if (groupSelections.length < group.minSelections) {
        errors.push(`يجب اختيار ${group.minSelections} على الأقل من ${group.groupName}`)
      }

      if (groupSelections.length > effectiveMax) {
        errors.push(`يمكنك اختيار ${effectiveMax} كحد أقصى من ${group.groupName}`)
      }
    })

    return { isValid: errors.length === 0, errors }
  }, [config, selections, getMaxSelections])

  // Calculate energy data based on total nutrition
  // ✅ Using calculateEnergyData from nutritionCalculator
  const energyData = useMemo(() => {
    return calculateEnergyData(totalNutrition)
  }, [totalNutrition])

  return {
    // Config
    config,
    isLoading,
    error,
    // ✅ Use templateId from backend (productType was removed)
    templateId: config?.product.templateId || 'standard',

    // Container
    hasContainers: config?.hasContainers || false,
    containers: config?.containers || [],
    selectedContainer,
    setSelectedContainer,
    containerObj,

    // Size
    hasSizes: config?.hasSizes || false,
    sizes: availableSizes,
    selectedSize,
    setSelectedSize,
    sizeObj,

    // Customization
    hasCustomization: config?.hasCustomization || false,
    customizationRules: config?.customizationRules || [],
    selections,
    updateGroupSelections,
    selectedOptions: customizationData.selectedOptions,
    customizationTotal: customizationData.total,

    // Conditional Options (Requirements 1.1, 1.2, 1.3, 1.4)
    getMaxSelections,
    effectiveMaxSelections,

    // Totals
    totalPrice,
    totalNutrition,
    validationResult,

    // Energy data
    energyType: energyData.energyType,
    energyScore: energyData.energyScore
  }
}

// ✅ createEmptyNutrition is now imported from nutritionCalculator
