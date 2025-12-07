// ================================================================
// useProductEngine.ts - Single Source of Truth for Product Logic
// ================================================================
// UNIFIED PRODUCT MODEL: Core engine for price, nutrition, validation
// Pure logic hook - NO JSX returns
// ================================================================

import { useState, useMemo, useCallback, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getProductConfiguration, type ProductConfiguration } from '@/lib/api'
import type { ProductUIConfig } from '@/types/products'
import {
    createEmptyNutrition,
    addNutrition,
    multiplyNutrition,
    calculateEnergyData,
    type NutritionValues
} from '@/lib/utils/nutritionCalculator'

// ================================================================
// TYPES
// ================================================================

export type UIConfig = ProductUIConfig

export interface ProductEngineInput {
    productId: string | null
    isOpen: boolean
    initialSelections?: Record<string, string[]>
}

export interface SelectedOption {
    id: string
    name: string
    price: number
    groupId: string
    groupIcon?: string
    nutrition?: NutritionValues
}

export interface ValidationResult {
    isValid: boolean
    errors: string[]
    warnings: string[]
}

export interface ProductEngineActions {
    select: (groupId: string, optionId: string) => void
    remove: (groupId: string, optionId: string) => void
    toggle: (groupId: string, optionId: string) => void
    setContainer: (containerId: string) => void
    setSize: (sizeId: string) => void
    reset: () => void
}

// ================================================================
// DEFAULT UI CONFIG
// ================================================================

const DEFAULT_UI_CONFIG: UIConfig = {
    display_style: 'cards',
    columns: 2,
    card_size: 'md',
    show_images: true,
    show_prices: true,
    show_macros: false,
    theme: 'default'
}

// ================================================================
// HOOK IMPLEMENTATION
// ================================================================

export function useProductEngine({ productId, isOpen, initialSelections }: ProductEngineInput) {
    // ================================================================
    // STATE
    // ================================================================

    const [selectedContainer, setSelectedContainer] = useState<string | null>(null)
    const [selectedSize, setSelectedSize] = useState<string | null>(null)
    const [selections, setSelections] = useState<Record<string, string[]>>(initialSelections || {})

    // ================================================================
    // DATA FETCHING
    // ================================================================

    const { data: config, isLoading, error } = useQuery<ProductConfiguration | null>({
        queryKey: ['product-engine', productId],
        queryFn: async () => {
            if (!productId) return null
            return await getProductConfiguration(productId, 'ar')
        },
        enabled: !!productId && isOpen,
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 1
    })

    // ================================================================
    // RESET ON MODAL CLOSE / PRODUCT CHANGE
    // ================================================================

    useEffect(() => {
        if (!isOpen) {
            setSelectedContainer(null)
            setSelectedSize(null)
            setSelections(initialSelections || {})
        }
    }, [isOpen, productId, initialSelections])

    // ================================================================
    // SET DEFAULTS WHEN CONFIG LOADS
    // ================================================================

    useEffect(() => {
        if (config && !selectedContainer && !selectedSize) {
            // Default container
            if (config.hasContainers && config.containers.length > 0) {
                const defaultContainer = config.containers.find(c => c.isDefault) || config.containers[0]
                setSelectedContainer(defaultContainer.id)
            }
            // Default size
            if (config.hasSizes && config.sizes.length > 0) {
                const defaultSize = config.sizes.find(s => s.isDefault) || config.sizes[0]
                setSelectedSize(defaultSize.id)
            }
        }
    }, [config])

    // ================================================================
    // DERIVED: UI CONFIG
    // ================================================================

    const uiConfig: UIConfig = useMemo(() => {
        if (!config?.product?.uiConfig) return DEFAULT_UI_CONFIG

        // Backend now returns merged config (Template Default + Product Override)
        // Ensure defaults for missing keys
        return {
            ...DEFAULT_UI_CONFIG,
            ...config.product.uiConfig
        }
    }, [config])

    // ================================================================
    // DERIVED: AVAILABLE SIZES (filtered by container)
    // ================================================================

    const availableSizes = useMemo(() => {
        if (!config?.hasSizes || !config.sizes) return []

        if (!selectedContainer) {
            return config.sizes.filter(s => !s.containerId)
        }

        return config.sizes.filter(s =>
            s.containerId === selectedContainer || !s.containerId
        )
    }, [config, selectedContainer])

    // ================================================================
    // DERIVED: SELECTED OBJECTS
    // ================================================================

    const containerObj = useMemo(() => {
        if (!config?.hasContainers || !selectedContainer) return null
        return config.containers.find(c => c.id === selectedContainer) || null
    }, [config, selectedContainer])

    const sizeObj = useMemo(() => {
        if (!selectedSize) return null
        return availableSizes.find(s => s.id === selectedSize) || null
    }, [availableSizes, selectedSize])

    // ================================================================
    // DERIVED: SELECTED OPTIONS
    // ================================================================

    const selectedOptions: SelectedOption[] = useMemo(() => {
        if (!config?.hasCustomization || !config.customizationRules) return []

        const options: SelectedOption[] = []

        config.customizationRules.forEach(group => {
            const groupSelections = selections[group.groupId] || []

            groupSelections.forEach(optionId => {
                const option = group.options.find(opt => opt.id === optionId)
                if (option) {
                    options.push({
                        id: option.id,
                        name: option.name_ar,
                        price: option.price ?? option.base_price ?? 0,
                        groupId: group.groupId,
                        groupIcon: group.groupIcon,
                        nutrition: option.nutrition
                    })
                }
            })
        })

        return options
    }, [config, selections])

    // ================================================================
    // DERIVED: CUSTOMIZATION TOTAL PRICE
    // ================================================================

    const customizationTotal = useMemo(() => {
        return selectedOptions.reduce((sum, opt) => sum + opt.price, 0)
    }, [selectedOptions])

    // ================================================================
    // DERIVED: TOTAL PRICE (Base + Container + Size + Customization)
    // ================================================================

    const basePrice = config?.product?.basePrice ?? 0

    const currentPrice = useMemo(() => {
        const containerPrice = containerObj?.priceModifier ?? 0
        const sizePrice = sizeObj?.priceModifier ?? 0
        return basePrice + containerPrice + sizePrice + customizationTotal
    }, [basePrice, containerObj, sizeObj, customizationTotal])

    // ================================================================
    // DERIVED: NUTRITION (Container + Options × Size Multiplier)
    // ================================================================

    const nutrition: NutritionValues = useMemo(() => {
        const multiplier = sizeObj?.nutritionMultiplier ?? 1
        let total = createEmptyNutrition()

        // Add container nutrition (not scaled by size)
        if (containerObj?.nutrition) {
            total = addNutrition(total, containerObj.nutrition)
        }

        // Add options nutrition × size multiplier
        selectedOptions.forEach(opt => {
            if (opt.nutrition) {
                total = addNutrition(total, multiplyNutrition(opt.nutrition, multiplier))
            }
        })

        return total
    }, [containerObj, selectedOptions, sizeObj])

    // ================================================================
    // DERIVED: ENERGY DATA
    // ================================================================

    const energyData = useMemo(() => {
        return calculateEnergyData(nutrition)
    }, [nutrition])

    // ================================================================
    // DERIVED: VALIDATION
    // ================================================================

    const validationResult: ValidationResult = useMemo(() => {
        if (!config?.hasCustomization || !config.customizationRules) {
            return { isValid: true, errors: [], warnings: [] }
        }

        const errors: string[] = []
        const warnings: string[] = []

        config.customizationRules.forEach(group => {
            const groupSelections = selections[group.groupId] || []

            // Required check
            if (group.isRequired && groupSelections.length === 0) {
                errors.push(`يجب اختيار ${group.groupName}`)
            }

            // Min selections check
            if (groupSelections.length < group.minSelections) {
                errors.push(`اختر ${group.minSelections} على الأقل من ${group.groupName}`)
            }

            // Max selections check
            if (groupSelections.length > group.maxSelections) {
                errors.push(`الحد الأقصى ${group.maxSelections} من ${group.groupName}`)
            }
        })

        return { isValid: errors.length === 0, errors, warnings }
    }, [config, selections])

    // ================================================================
    // ACTIONS
    // ================================================================

    const select = useCallback((groupId: string, optionId: string) => {
        setSelections(prev => {
            const current = prev[groupId] || []
            if (current.includes(optionId)) return prev

            // Check max limit
            const group = config?.customizationRules?.find(g => g.groupId === groupId)
            if (group && current.length >= group.maxSelections) {
                // Replace last if at max
                return {
                    ...prev,
                    [groupId]: [...current.slice(0, -1), optionId]
                }
            }

            return {
                ...prev,
                [groupId]: [...current, optionId]
            }
        })
    }, [config])

    const remove = useCallback((groupId: string, optionId: string) => {
        setSelections(prev => ({
            ...prev,
            [groupId]: (prev[groupId] || []).filter(id => id !== optionId)
        }))
    }, [])

    const toggle = useCallback((groupId: string, optionId: string) => {
        setSelections(prev => {
            const current = prev[groupId] || []
            if (current.includes(optionId)) {
                return {
                    ...prev,
                    [groupId]: current.filter(id => id !== optionId)
                }
            }

            // Check max limit
            const group = config?.customizationRules?.find(g => g.groupId === groupId)
            if (group && current.length >= group.maxSelections) {
                return {
                    ...prev,
                    [groupId]: [...current.slice(0, -1), optionId]
                }
            }

            return {
                ...prev,
                [groupId]: [...current, optionId]
            }
        })
    }, [config])

    const reset = useCallback(() => {
        setSelectedContainer(null)
        setSelectedSize(null)
        setSelections(initialSelections || {})
    }, [initialSelections])

    // ================================================================
    // RETURN - Pure Logic Output
    // ================================================================

    return {
        // Loading state
        isLoading,
        error,

        // Configuration
        config,
        uiConfig,
        templateId: config?.product?.templateId ?? 'standard',

        // Container
        hasContainers: config?.hasContainers ?? false,
        containers: config?.containers ?? [],
        selectedContainer,
        containerObj,

        // Size
        hasSizes: config?.hasSizes ?? false,
        sizes: availableSizes,
        selectedSize,
        sizeObj,

        // Customization
        hasCustomization: config?.hasCustomization ?? false,
        optionGroups: config?.customizationRules ?? [],
        selections,
        selectedOptions,

        // Prices
        basePrice,
        customizationTotal,
        currentPrice,

        // Nutrition
        nutrition,
        energyType: energyData.energyType,
        energyScore: energyData.energyScore,

        // Validation
        validationResult,
        isValid: validationResult.isValid,

        // Actions
        actions: {
            select,
            remove,
            toggle,
            setContainer: setSelectedContainer,
            setSize: setSelectedSize,
            reset
        } as ProductEngineActions
    }
}

// ================================================================
// TYPE EXPORT for consuming components
// ================================================================

export type ProductEngineReturn = ReturnType<typeof useProductEngine>
