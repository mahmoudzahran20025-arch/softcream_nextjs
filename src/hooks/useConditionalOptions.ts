// ================================================================
// useConditionalOptions.ts - Conditional Options Hook
// Manages dynamic maxSelections based on conditional rules
// Requirements: 1.1, 1.2, 1.3, 1.4
// ================================================================

import { useState, useCallback, useMemo } from 'react'

// ================================================================
// Types
// ================================================================

/**
 * Conditional rule structure from backend API
 * Format: { triggerGroup: "sizes", rules: { "large": 3, "medium": 2, "small": 1 } }
 */
export interface ConditionalRule {
  triggerGroup: string
  rules: Record<string, number>
}

/**
 * Option group with conditional rules
 */
export interface OptionGroupWithRules {
  groupId: string
  groupName: string
  maxSelections: number
  conditionalRules?: ConditionalRule | null
}

/**
 * State for tracking effective max selections per group
 */
export interface EffectiveMaxSelections {
  [groupId: string]: number
}

/**
 * Result of selection limit enforcement
 */
export interface EnforcementResult {
  enforced: boolean
  removedSelections: string[]
  message?: string
}

/**
 * Hook return type
 */
export interface UseConditionalOptionsReturn {
  /** Get the current effective maxSelections for a group */
  getMaxSelections: (groupId: string) => number
  /** Apply conditional rule when trigger option is selected */
  applyConditionalRule: (triggerGroupId: string, selectedOptionId: string | null) => void
  /** Enforce selection limits and remove excess selections */
  enforceSelectionLimits: (
    groupId: string,
    currentSelections: string[]
  ) => EnforcementResult
  /** Reset all groups to their default maxSelections */
  resetToDefaults: () => void
  /** Current effective max selections state */
  effectiveMaxSelections: EffectiveMaxSelections
}

// ================================================================
// Hook Implementation
// ================================================================

/**
 * useConditionalOptions - Manages conditional option rules
 * 
 * @param optionGroups - Array of option groups with their conditional rules
 * @returns Functions to manage conditional options
 * 
 * @example
 * ```tsx
 * const { getMaxSelections, applyConditionalRule } = useConditionalOptions(customizationRules)
 * 
 * // When user selects a size
 * const handleSizeChange = (sizeId: string) => {
 *   applyConditionalRule('sizes', sizeId)
 * }
 * 
 * // Get current max for flavors group
 * const maxFlavors = getMaxSelections('flavors')
 * ```
 */
export function useConditionalOptions(
  optionGroups: OptionGroupWithRules[]
): UseConditionalOptionsReturn {
  // Build default max selections from option groups
  const defaultMaxSelections = useMemo(() => {
    const defaults: EffectiveMaxSelections = {}
    optionGroups.forEach(group => {
      defaults[group.groupId] = group.maxSelections
    })
    return defaults
  }, [optionGroups])

  // State for tracking effective max selections
  const [effectiveMaxSelections, setEffectiveMaxSelections] = 
    useState<EffectiveMaxSelections>(defaultMaxSelections)

  /**
   * Get the current effective maxSelections for a group
   * Falls back to default if not found
   * @see Requirements 1.4 - Fallback to default maxSelections
   */
  const getMaxSelections = useCallback((groupId: string): number => {
    // Check effective state first
    if (effectiveMaxSelections[groupId] !== undefined) {
      return effectiveMaxSelections[groupId]
    }
    // Fall back to default from option groups
    const group = optionGroups.find(g => g.groupId === groupId)
    return group?.maxSelections ?? 1
  }, [effectiveMaxSelections, optionGroups])

  /**
   * Apply conditional rule when a trigger option is selected
   * Updates maxSelections for all groups that have rules triggered by this group
   * @see Requirements 1.1, 1.2 - Conditional rules application
   */
  const applyConditionalRule = useCallback((
    triggerGroupId: string,
    selectedOptionId: string | null
  ): void => {
    setEffectiveMaxSelections(prev => {
      const newState = { ...prev }

      // Find all groups that have conditional rules triggered by this group
      optionGroups.forEach(group => {
        const rules = group.conditionalRules
        
        // Skip if no conditional rules or different trigger group
        if (!rules || rules.triggerGroup !== triggerGroupId) {
          return
        }

        // If no option selected, reset to default
        // @see Requirements 1.4 - Fallback when no selection
        if (!selectedOptionId) {
          newState[group.groupId] = group.maxSelections
          return
        }

        // Apply the rule if it exists for this option
        const ruleValue = rules.rules[selectedOptionId]
        if (typeof ruleValue === 'number' && ruleValue >= 0) {
          // @see Requirements 1.1, 1.2 - Apply conditional rule value
          newState[group.groupId] = ruleValue
        } else {
          // @see Requirements 1.4 - Fallback to default if no matching rule
          newState[group.groupId] = group.maxSelections
        }
      })

      return newState
    })
  }, [optionGroups])

  /**
   * Enforce selection limits when maxSelections decreases
   * Returns removed selections for notification
   * @see Requirements 1.3 - Remove excess selections when limits decrease
   */
  const enforceSelectionLimits = useCallback((
    groupId: string,
    currentSelections: string[]
  ): EnforcementResult => {
    const maxAllowed = getMaxSelections(groupId)
    
    // No enforcement needed if within limits
    if (currentSelections.length <= maxAllowed) {
      return { enforced: false, removedSelections: [] }
    }

    // Calculate excess selections to remove
    const excessCount = currentSelections.length - maxAllowed
    const removedSelections = currentSelections.slice(-excessCount)

    return {
      enforced: true,
      removedSelections,
      message: `تم إزالة ${excessCount} اختيار(ات) بسبب تغيير الحجم`
    }
  }, [getMaxSelections])

  /**
   * Reset all groups to their default maxSelections
   */
  const resetToDefaults = useCallback((): void => {
    setEffectiveMaxSelections(defaultMaxSelections)
  }, [defaultMaxSelections])

  return {
    getMaxSelections,
    applyConditionalRule,
    enforceSelectionLimits,
    resetToDefaults,
    effectiveMaxSelections
  }
}

// ================================================================
// Pure Utility Functions (for testing)
// ================================================================

/**
 * Parse conditional rules from JSON string
 * Returns null if invalid
 * @see Requirements 1.5 - Handle invalid JSON gracefully
 */
export function parseConditionalRules(jsonString: string | null | undefined): ConditionalRule | null {
  if (!jsonString || typeof jsonString !== 'string') {
    return null
  }

  try {
    const parsed = JSON.parse(jsonString)

    // Validate structure
    if (!parsed || typeof parsed !== 'object') {
      console.warn('[ConditionalOptions] Invalid object structure')
      return null
    }

    // Check for required fields (support both snake_case and camelCase)
    const triggerGroup = parsed.trigger_group || parsed.triggerGroup
    if (!triggerGroup || typeof triggerGroup !== 'string') {
      console.warn('[ConditionalOptions] Missing or invalid trigger_group')
      return null
    }

    if (!parsed.rules || typeof parsed.rules !== 'object') {
      console.warn('[ConditionalOptions] Missing or invalid rules object')
      return null
    }

    // Validate all rule values are non-negative integers
    for (const [key, value] of Object.entries(parsed.rules)) {
      if (typeof value !== 'number' || value < 0 || !Number.isInteger(value)) {
        console.warn(`[ConditionalOptions] Invalid value for rule "${key}": ${value}`)
        return null
      }
    }

    return {
      triggerGroup,
      rules: parsed.rules
    }
  } catch (error) {
    console.warn('[ConditionalOptions] JSON parse error:', error)
    return null
  }
}

/**
 * Get effective maxSelections based on conditional rules
 * Pure function for testing
 * @see Requirements 1.1, 1.2, 1.4 - Conditional rules application with fallback
 */
export function getEffectiveMaxSelections(
  conditionalRules: ConditionalRule | null,
  selectedTriggerOptionId: string | null,
  defaultMaxSelections: number
): number {
  // Ensure default is valid
  const safeDefault = typeof defaultMaxSelections === 'number' && defaultMaxSelections >= 0
    ? defaultMaxSelections
    : 1

  // No rules - use default
  if (!conditionalRules) {
    return safeDefault
  }

  // No selection - use default
  if (!selectedTriggerOptionId) {
    return safeDefault
  }

  // Check if there's a rule for this selection
  const ruleValue = conditionalRules.rules[selectedTriggerOptionId]

  if (typeof ruleValue === 'number' && ruleValue >= 0) {
    return ruleValue
  }

  // No matching rule - use default
  return safeDefault
}

/**
 * Trim selections to fit within max limit
 * Returns the trimmed array and removed items
 * @see Requirements 1.3 - Remove excess selections
 */
export function trimSelectionsToLimit(
  selections: string[],
  maxSelections: number
): { trimmed: string[]; removed: string[] } {
  if (selections.length <= maxSelections) {
    return { trimmed: selections, removed: [] }
  }

  const trimmed = selections.slice(0, maxSelections)
  const removed = selections.slice(maxSelections)

  return { trimmed, removed }
}
