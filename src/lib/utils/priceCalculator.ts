/**
 * Price Calculator Utility
 * 
 * Single source of truth for all price calculations
 * Used by: ProductModal, RichProductPage, CartProvider, CheckoutModal
 */

export interface PriceComponents {
  basePrice: number
  containerPrice?: number
  sizePrice?: number
  customizationTotal?: number
  quantity?: number
}

export interface CartItemSelections {
  _container?: [string, string, string] // [id, name, price]
  _size?: [string, string, string]       // [id, name, price]
  _calculatedPrice?: [string]            // [totalPrice]
  [groupId: string]: string[] | undefined
}

/**
 * Calculate total price for a product with customizations
 */
export function calculateProductPrice(components: PriceComponents): number {
  const {
    basePrice,
    containerPrice = 0,
    sizePrice = 0,
    customizationTotal = 0,
    quantity = 1
  } = components

  return (basePrice + containerPrice + sizePrice + customizationTotal) * quantity
}

/**
 * Calculate price from cart item selections
 * Handles both BYO products (with _calculatedPrice) and legacy products
 */
export function calculateCartItemPrice(
  productPrice: number,
  selections?: CartItemSelections,
  selectedAddons?: string[],
  addonsMap?: Record<string, { price: number }>,
  optionsMap?: Record<string, { price: number }>,
  quantity: number = 1
): number {
  // Check for pre-calculated price (BYO products)
  if (selections?._calculatedPrice) {
    const calculatedPrice = parseFloat(selections._calculatedPrice[0]) || 0
    if (calculatedPrice > 0) {
      return calculatedPrice * quantity
    }
  }

  let itemPrice = productPrice

  // Add container price
  if (selections?._container?.[2]) {
    itemPrice += parseFloat(selections._container[2]) || 0
  }

  // Add size price
  if (selections?._size?.[2]) {
    itemPrice += parseFloat(selections._size[2]) || 0
  }

  // Add legacy addon prices
  if (addonsMap && selectedAddons?.length) {
    const addonsTotal = selectedAddons.reduce((sum, addonId) => {
      return sum + (addonsMap[addonId]?.price || 0)
    }, 0)
    itemPrice += addonsTotal
  }

  // Add BYO customization prices
  if (optionsMap && selections) {
    const customizationSelections = Object.entries(selections)
      .filter(([key]) => !key.startsWith('_'))
      .flatMap(([, values]) => values || [])

    const customizationTotal = customizationSelections.reduce((sum, optionId) => {
      return sum + (optionsMap[optionId]?.price || 0)
    }, 0)
    itemPrice += customizationTotal
  }

  return itemPrice * quantity
}

/**
 * Calculate cart total from all items
 */
export function calculateCartTotal(
  items: Array<{
    productId: string
    quantity: number
    selectedAddons?: string[]
    selections?: CartItemSelections
  }>,
  productsMap: Record<string, { price: number }>,
  addonsMap?: Record<string, { price: number }>,
  optionsMap?: Record<string, { price: number }>
): number {
  return items.reduce((total, item) => {
    const product = productsMap[item.productId]
    if (!product) return total

    return total + calculateCartItemPrice(
      product.price,
      item.selections,
      item.selectedAddons,
      addonsMap,
      optionsMap,
      item.quantity
    )
  }, 0)
}

/**
 * Format price for display (Arabic)
 */
export function formatPrice(price: number, currency: string = 'ج.م'): string {
  return `${price} ${currency}`
}

/**
 * Calculate discount
 */
export function calculateDiscount(
  subtotal: number,
  discountType: 'percentage' | 'fixed',
  discountValue: number
): number {
  if (discountType === 'percentage') {
    return Math.round(subtotal * (discountValue / 100))
  }
  return Math.min(discountValue, subtotal)
}
