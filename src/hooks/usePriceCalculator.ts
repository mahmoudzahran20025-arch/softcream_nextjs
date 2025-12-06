// ================================================================
// usePriceCalculator.ts - Price Calculator Hook
// Calculates total price based on selections
// Requirements: 2.1, 2.2, 2.3, 2.4, 2.5
// ================================================================

import { useState, useCallback, useMemo } from 'react'

// ================================================================
// Types
// ================================================================

/**
 * Selected size with price modifier
 */
export interface SelectedSize {
  id: string
  name: string
  priceModifier: number
}

/**
 * Selected option with price information
 */
export interface SelectedOption {
  id: string
  name: string
  basePrice: number
  /** Override price from product_options (if set) */
  priceOverride?: number | null
}

/**
 * Price breakdown for display
 */
export interface PriceBreakdown {
  basePrice: number
  sizeModifier: number
  optionsTotal: number
  subtotal: number
  quantity: number
  total: number
}

/**
 * Hook return type
 */
export interface UsePriceCalculatorReturn {
  /** Current price breakdown */
  priceBreakdown: PriceBreakdown
  /** Set the base product price */
  setBasePrice: (price: number) => void
  /** Set the selected size */
  setSelectedSize: (size: SelectedSize | null) => void
  /** Set all selected options */
  setSelectedOptions: (options: SelectedOption[]) => void
  /** Set the quantity */
  setQuantity: (quantity: number) => void
  /** Get the effective price for an option (handles override) */
  getEffectiveOptionPrice: (option: SelectedOption) => number
  /** Reset calculator to initial state */
  reset: () => void
}

// ================================================================
// Pure Utility Functions (for testing)
// ================================================================

/**
 * Get effective price for an option
 * Uses price_override if set, otherwise uses base_price
 * @see Requirements 2.5 - Price override priority
 */
export function getEffectivePrice(
  basePrice: number,
  priceOverride?: number | null
): number {
  // Validate basePrice
  const safeBasePrice = typeof basePrice === 'number' && !isNaN(basePrice) && basePrice >= 0
    ? basePrice
    : 0

  // Check if override is valid (not null, not undefined, is a number, >= 0)
  if (priceOverride !== null && priceOverride !== undefined && 
      typeof priceOverride === 'number' && !isNaN(priceOverride) && priceOverride >= 0) {
    return priceOverride
  }

  return safeBasePrice
}

/**
 * Calculate total price for selected options
 * @see Requirements 2.2 - Sum of option prices
 */
export function calculateOptionsTotal(options: SelectedOption[]): number {
  if (!Array.isArray(options)) {
    return 0
  }

  return options.reduce((total, option) => {
    const effectivePrice = getEffectivePrice(option.basePrice, option.priceOverride)
    return total + effectivePrice
  }, 0)
}

/**
 * Calculate complete price breakdown
 * Formula: basePrice + sizeModifier + Σ(options.price) × quantity
 * @see Requirements 2.1, 2.2, 2.3, 2.4
 */
export function calculatePriceBreakdown(
  basePrice: number,
  sizeModifier: number,
  options: SelectedOption[],
  quantity: number
): PriceBreakdown {
  // Validate inputs
  const safeBasePrice = typeof basePrice === 'number' && !isNaN(basePrice) && basePrice >= 0
    ? basePrice
    : 0
  
  const safeSizeModifier = typeof sizeModifier === 'number' && !isNaN(sizeModifier)
    ? sizeModifier
    : 0
  
  const safeQuantity = typeof quantity === 'number' && !isNaN(quantity) && quantity >= 1
    ? Math.floor(quantity)
    : 1

  // Calculate options total
  const optionsTotal = calculateOptionsTotal(options)

  // Calculate subtotal (before quantity)
  const subtotal = safeBasePrice + safeSizeModifier + optionsTotal

  // Calculate total (with quantity)
  const total = subtotal * safeQuantity

  return {
    basePrice: safeBasePrice,
    sizeModifier: safeSizeModifier,
    optionsTotal,
    subtotal,
    quantity: safeQuantity,
    total
  }
}

// ================================================================
// Hook Implementation
// ================================================================

/**
 * usePriceCalculator - Manages price calculation for product customization
 * 
 * @param initialBasePrice - Initial base price of the product
 * @returns Functions and state for price calculation
 * 
 * @example
 * ```tsx
 * const { priceBreakdown, setSelectedSize, setSelectedOptions, setQuantity } = usePriceCalculator(50)
 * 
 * // When user selects a size
 * setSelectedSize({ id: 'large', name: 'كبير', priceModifier: 15 })
 * 
 * // When user selects options
 * setSelectedOptions([
 *   { id: 'sauce1', name: 'نوتيلا', basePrice: 5 },
 *   { id: 'topping1', name: 'فراولة', basePrice: 3, priceOverride: 2 }
 * ])
 * 
 * // Display total
 * console.log(priceBreakdown.total) // 50 + 15 + 5 + 2 = 72
 * ```
 */
export function usePriceCalculator(
  initialBasePrice: number = 0
): UsePriceCalculatorReturn {
  // State
  const [basePrice, setBasePriceState] = useState<number>(
    typeof initialBasePrice === 'number' && initialBasePrice >= 0 ? initialBasePrice : 0
  )
  const [selectedSize, setSelectedSizeState] = useState<SelectedSize | null>(null)
  const [selectedOptions, setSelectedOptionsState] = useState<SelectedOption[]>([])
  const [quantity, setQuantityState] = useState<number>(1)

  // Calculate price breakdown
  const priceBreakdown = useMemo(() => {
    const sizeModifier = selectedSize?.priceModifier ?? 0
    return calculatePriceBreakdown(basePrice, sizeModifier, selectedOptions, quantity)
  }, [basePrice, selectedSize, selectedOptions, quantity])

  // Setters with validation
  const setBasePrice = useCallback((price: number) => {
    if (typeof price === 'number' && !isNaN(price) && price >= 0) {
      setBasePriceState(price)
    }
  }, [])

  const setSelectedSize = useCallback((size: SelectedSize | null) => {
    setSelectedSizeState(size)
  }, [])

  const setSelectedOptions = useCallback((options: SelectedOption[]) => {
    if (Array.isArray(options)) {
      setSelectedOptionsState(options)
    }
  }, [])

  const setQuantity = useCallback((qty: number) => {
    if (typeof qty === 'number' && !isNaN(qty) && qty >= 1) {
      setQuantityState(Math.floor(qty))
    }
  }, [])

  // Get effective price for a single option
  const getEffectiveOptionPrice = useCallback((option: SelectedOption): number => {
    return getEffectivePrice(option.basePrice, option.priceOverride)
  }, [])

  // Reset to initial state
  const reset = useCallback(() => {
    setBasePriceState(typeof initialBasePrice === 'number' && initialBasePrice >= 0 ? initialBasePrice : 0)
    setSelectedSizeState(null)
    setSelectedOptionsState([])
    setQuantityState(1)
  }, [initialBasePrice])

  return {
    priceBreakdown,
    setBasePrice,
    setSelectedSize,
    setSelectedOptions,
    setQuantity,
    getEffectiveOptionPrice,
    reset
  }
}
