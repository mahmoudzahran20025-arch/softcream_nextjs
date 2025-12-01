import { useState, useEffect, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'

interface Option {
    id: string
    name_ar: string
    name_en: string
    description_ar?: string
    description_en?: string
    price: number
    image?: string
    nutrition?: {
        calories: number
        protein: number
        carbs: number
        sugar: number
        fat: number
        fiber: number
    }
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

interface UseCustomizationProps {
    productId: string | null
    isOpen: boolean
    basePrice: number
}

export function useCustomization({ productId, isOpen, basePrice }: UseCustomizationProps) {
    const [selections, setSelections] = useState<Record<string, string[]>>({})

    // Fetch customization rules
    const { data: customizationRules, isLoading } = useQuery<CustomizationGroup[]>({
        queryKey: ['customization-rules', productId],
        queryFn: async () => {
            if (!productId) return []

            // Use centralized API client
            const { getCustomizationRules } = await import('@/lib/api')
            const rules = await getCustomizationRules(productId, 'ar')
            return rules || []
        },
        enabled: !!productId && isOpen,
        staleTime: 1000 * 60 * 5, // Cache for 5 minutes
        retry: 1
    })

    // Debug only on significant changes (not every render)
    useEffect(() => {
        if (customizationRules && customizationRules.length > 0) {
            console.log(`✅ Customization loaded: ${customizationRules.length} groups for ${productId}`)
        }
    }, [customizationRules?.length, productId])

    // Reset selections when modal closes
    useEffect(() => {
        if (!isOpen) {
            setSelections({})
        }
    }, [isOpen])

    // Update selections for a specific group
    const updateGroupSelections = (groupId: string, selectedIds: string[]) => {
        setSelections(prev => ({
            ...prev,
            [groupId]: selectedIds
        }))
    }

    // Validate all selections
    const validationResult = useMemo(() => {
        if (!customizationRules || customizationRules.length === 0) {
            return { isValid: true, errors: [] }
        }

        const errors: string[] = []

        customizationRules.forEach(group => {
            const groupSelections = selections[group.groupId] || []

            // Check required
            if (group.isRequired && groupSelections.length === 0) {
                errors.push(`يجب اختيار ${group.groupName}`)
            }

            // Check min
            if (groupSelections.length < group.minSelections) {
                errors.push(`يجب اختيار ${group.minSelections} على الأقل من ${group.groupName}`)
            }

            // Check max
            if (groupSelections.length > group.maxSelections) {
                errors.push(`يمكنك اختيار ${group.maxSelections} كحد أقصى من ${group.groupName}`)
            }
        })

        return {
            isValid: errors.length === 0,
            errors
        }
    }, [customizationRules, selections])

    // Calculate customization total + nutrition
    const customizationData = useMemo(() => {
        if (!customizationRules) {
            return {
                total: 0,
                selectedOptions: [],
                nutrition: { calories: 0, protein: 0, carbs: 0, sugar: 0, fat: 0, fiber: 0 }
            }
        }

        let total = 0
        const selectedOptions: Array<{
            id: string
            name: string
            price: number
            groupId: string
            groupIcon?: string
        }> = []

        // ✅ NEW: Calculate nutrition totals
        const nutrition = {
            calories: 0,
            protein: 0,
            carbs: 0,
            sugar: 0,
            fat: 0,
            fiber: 0
        }

        customizationRules.forEach(group => {
            const groupSelections = selections[group.groupId] || []

            groupSelections.forEach(optionId => {
                const option = group.options.find(opt => opt.id === optionId)
                if (option) {
                    total += option.price
                    selectedOptions.push({
                        id: option.id,
                        name: option.name_ar,
                        price: option.price,
                        groupId: group.groupId,
                        groupIcon: group.groupIcon
                    })

                    // ✅ Add nutrition values
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
    }, [customizationRules, selections])

    // ✅ NEW: Calculate Energy Level & Score
    const energyData = useMemo(() => {
        const { nutrition } = customizationData
        const totalProtein = nutrition.protein // + base product protein (passed as prop if needed, but for now just customization)
        const totalSugar = nutrition.sugar
        const totalCalories = nutrition.calories

        let energyType = 'balanced'
        let energyScore = 50 // Default score

        // Logic:
        // High Protein (> 15g) -> Physical (Muscle)
        // High Sugar (> 25g) -> Mental (Quick Energy)
        // Balanced -> Balanced

        if (totalProtein > 15) {
            energyType = 'physical'
            energyScore = Math.min(95, 60 + (totalProtein * 1.5))
        } else if (totalSugar > 25) {
            energyType = 'mental'
            energyScore = Math.min(90, 50 + (totalSugar * 1.2))
        } else {
            energyType = 'balanced'
            energyScore = Math.min(85, 40 + (totalCalories / 10))
        }

        return { energyType, energyScore: Math.round(energyScore) }
    }, [customizationData])

    // Calculate total price
    const totalPrice = useMemo(() => {
        return basePrice + customizationData.total
    }, [basePrice, customizationData.total])

    // Check if product is customizable
    const isCustomizable = customizationRules && customizationRules.length > 0

    return {
        customizationRules: customizationRules || [],
        isCustomizable,
        isLoadingRules: isLoading,
        selections,
        updateGroupSelections,
        validationResult,
        customizationTotal: customizationData.total,
        selectedOptions: customizationData.selectedOptions,
        totalPrice,
        customizationNutrition: customizationData.nutrition, // ✅ NEW: Nutrition data
        energyType: energyData.energyType,
        energyScore: energyData.energyScore
    }
}
