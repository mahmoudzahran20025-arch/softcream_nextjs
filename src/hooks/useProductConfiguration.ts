import { useState, useEffect, useMemo, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  getProductConfiguration,
  ProductConfiguration
} from '@/lib/api'

interface UseProductConfigurationProps {
  productId: string | null
  isOpen: boolean
}

interface NutritionTotals {
  calories: number
  protein: number
  carbs: number
  sugar: number
  fat: number
  fiber: number
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
      console.log(`🎯 Fetching configuration for product ${productId}...`)
      const result = await getProductConfiguration(productId, 'ar')
      console.log(`✅ Configuration loaded:`, result)
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
  }, [isOpen])

  // Set defaults when config loads
  useEffect(() => {
    if (config) {
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
  }, [config])


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

  // Update group selections
  const updateGroupSelections = useCallback((groupId: string, selectedIds: string[]) => {
    setSelections(prev => ({
      ...prev,
      [groupId]: selectedIds
    }))
  }, [])

  // Calculate customization total and selected options
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
      nutrition?: NutritionTotals
    }> = []
    const nutrition = createEmptyNutrition()

    config.customizationRules.forEach(group => {
      const groupSelections = selections[group.groupId] || []
      
      groupSelections.forEach(optionId => {
        const option = group.options.find((opt: any) => opt.id === optionId)
        if (option) {
          total += option.price || 0
          selectedOptions.push({
            id: option.id,
            name: option.name_ar || option.name,
            price: option.price || 0,
            groupId: group.groupId,
            groupIcon: group.groupIcon,
            nutrition: option.nutrition
          })
          
          // Add nutrition
          if (option.nutrition) {
            nutrition.calories += option.nutrition.calories || 0
            nutrition.protein += option.nutrition.protein || 0
            nutrition.carbs += option.nutrition.carbs || 0
            nutrition.sugar += option.nutrition.sugar || 0
            nutrition.fat += option.nutrition.fat || 0
            nutrition.fiber += option.nutrition.fiber || 0
          }
        }
      })
    })

    return { total, selectedOptions, nutrition }
  }, [config, selections])

  // Calculate total nutrition (container + customizations × size multiplier)
  const totalNutrition = useMemo(() => {
    const nutrition = createEmptyNutrition()
    const multiplier = sizeObj?.nutritionMultiplier || 1

    // Add container nutrition
    if (containerObj?.nutrition) {
      nutrition.calories += containerObj.nutrition.calories || 0
      nutrition.protein += containerObj.nutrition.protein || 0
      nutrition.carbs += containerObj.nutrition.carbs || 0
      nutrition.sugar += containerObj.nutrition.sugar || 0
      nutrition.fat += containerObj.nutrition.fat || 0
      nutrition.fiber += containerObj.nutrition.fiber || 0
    }

    // Add customization nutrition × size multiplier
    nutrition.calories += Math.round(customizationData.nutrition.calories * multiplier)
    nutrition.protein += Math.round(customizationData.nutrition.protein * multiplier * 10) / 10
    nutrition.carbs += Math.round(customizationData.nutrition.carbs * multiplier)
    nutrition.sugar += Math.round(customizationData.nutrition.sugar * multiplier)
    nutrition.fat += Math.round(customizationData.nutrition.fat * multiplier * 10) / 10
    nutrition.fiber += Math.round(customizationData.nutrition.fiber * multiplier * 10) / 10

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

  // Validation
  const validationResult = useMemo(() => {
    if (!config?.hasCustomization || !config.customizationRules) {
      return { isValid: true, errors: [] }
    }

    const errors: string[] = []

    config.customizationRules.forEach((group: any) => {
      const groupSelections = selections[group.groupId] || []

      if (group.isRequired && groupSelections.length === 0) {
        errors.push(`يجب اختيار ${group.groupName}`)
      }

      if (groupSelections.length < group.minSelections) {
        errors.push(`يجب اختيار ${group.minSelections} على الأقل من ${group.groupName}`)
      }

      if (groupSelections.length > group.maxSelections) {
        errors.push(`يمكنك اختيار ${group.maxSelections} كحد أقصى من ${group.groupName}`)
      }
    })

    return { isValid: errors.length === 0, errors }
  }, [config, selections])

  return {
    // Config
    config,
    isLoading,
    error,
    productType: config?.product.productType || 'standard',
    
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
    
    // Totals
    totalPrice,
    totalNutrition,
    validationResult
  }
}

function createEmptyNutrition(): NutritionTotals {
  return { calories: 0, protein: 0, carbs: 0, sugar: 0, fat: 0, fiber: 0 }
}
