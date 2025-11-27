'use client'

import { createContext, useContext, useState, useCallback, useEffect, useMemo, useRef, ReactNode } from 'react'
import { storage } from '@/lib/storage.client'
import { TIMEOUTS, LIMITS } from '@/config/constants'

/**
 * CartProvider - Isolated Cart State Management for Next.js
 * 
 * Separated from ProductsContext to prevent unnecessary re-renders
 * Only cart-related operations
 * Components using cart will re-render only when cart changes
 * Uses storage.client.ts for persistence
 * ✅ NEW: Added debouncing for events to prevent multiple triggers
 * ✅ NEW: Proper cleanup in useEffect to avoid memory leaks
 */

interface CartItem {
  productId: string
  quantity: number
  selectedAddons?: string[] // Array of addon IDs (legacy)
  selections?: Record<string, string[]> // BYO customization selections { groupId: [optionIds] }
}

interface Product {
  id: string
  name: string
  nameEn?: string
  price: number
}

interface Addon {
  id: string
  name: string
  name_en: string
  price: number
}

interface CartContextType {
  cart: CartItem[]
  addToCart: (product: Product, quantity?: number, selectedAddons?: string[], selections?: Record<string, string[]>) => void
  removeFromCart: (productId: string, selectedAddons?: string[], selections?: Record<string, string[]>) => void
  updateCartQuantity: (productId: string, quantity: number, selectedAddons?: string[], selections?: Record<string, string[]>) => void
  clearCart: () => void
  getCartCount: () => number
  getCartTotal: (productsMap: Record<string, Product>, addonsMap?: Record<string, Addon>, optionsMap?: Record<string, Addon>) => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within CartProvider')
  }
  return context
}

interface CartProviderProps {
  children: ReactNode
}

export const CartProvider = ({ children }: CartProviderProps) => {
  // Cart State - loaded from sessionStorage via storage manager
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window !== 'undefined') {
      return storage.getCart()
    }
    return []
  })

  // ✅ NEW: Ref for debouncing cart events
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  // Save cart to sessionStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      storage.setCart(cart)
      
      // ✅ NEW: Debounce event dispatch - wait to batch multiple changes
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
      debounceRef.current = setTimeout(() => {
        const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)
        window.dispatchEvent(new CustomEvent('react-cart-updated', {
          detail: { count: cartCount, cart }
        }))
        
        // ✅ NEW: Optional: Trigger ordersUpdated if cart is empty (order placed)
        if (cart.length === 0) {
          storage.triggerOrdersUpdate(undefined)
        }
        
        console.log('🛒 Cart saved to sessionStorage (debounced):', cart.length, 'items')
      }, TIMEOUTS.DEBOUNCE_CART)
      
    }

    // ✅ NEW: Cleanup debounce timer on unmount or cart change
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
        debounceRef.current = null
      }
    }
  }, [cart])  // ✅ Deps include cart for reactivity

  // ========================================
  // Cart Operations
  // ========================================

  // Helper function to compare addon arrays
  const areAddonsEqual = (addons1?: string[], addons2?: string[]) => {
    // Both undefined/null/empty = equal
    const arr1 = addons1 || []
    const arr2 = addons2 || []
    
    if (arr1.length === 0 && arr2.length === 0) return true
    if (arr1.length !== arr2.length) return false
    
    const sorted1 = [...arr1].sort()
    const sorted2 = [...arr2].sort()
    const isEqual = sorted1.every((addon, index) => addon === sorted2[index])
    
    console.log('🔍 Comparing addons:', { arr1, arr2, isEqual })
    return isEqual
  }

  // Helper function to compare BYO selections
  const areSelectionsEqual = (sel1?: Record<string, string[]>, sel2?: Record<string, string[]>) => {
    if (!sel1 && !sel2) return true
    if (!sel1 || !sel2) return false
    
    const keys1 = Object.keys(sel1).sort()
    const keys2 = Object.keys(sel2).sort()
    
    if (keys1.length !== keys2.length) return false
    if (!keys1.every((key, i) => key === keys2[i])) return false
    
    return keys1.every(key => areAddonsEqual(sel1[key], sel2[key]))
  }

  const addToCart = useCallback((product: Product, quantity = 1, selectedAddons?: string[], selections?: Record<string, string[]>) => {
    console.log('➕ Adding to cart:', {
      productId: product.id,
      productName: product.name || product.nameEn,
      quantity,
      selectedAddons: selectedAddons || [],
      selections: selections || {}
    })
    
    setCart(prevCart => {
      console.log('📦 Current cart before add:', prevCart)
      
      // Find existing item with same product AND same addons/selections
      const existing = prevCart.find(item => 
        item.productId === product.id && 
        areAddonsEqual(item.selectedAddons, selectedAddons) &&
        areSelectionsEqual(item.selections, selections)
      )
      
      console.log('🔎 Found existing item:', existing)
      
      if (existing) {
        if (existing.quantity + quantity > LIMITS.MAX_CART_QUANTITY) {
          alert(`Maximum ${LIMITS.MAX_CART_QUANTITY} items allowed`)
          return prevCart
        }
        console.log('✅ Updating existing item quantity')
        return prevCart.map(item =>
          item.productId === product.id && 
          areAddonsEqual(item.selectedAddons, selectedAddons) &&
          areSelectionsEqual(item.selections, selections)
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      }
      
      // Add as new item (different addons/selections = different item)
      console.log('✅ Adding as new item')
      return [...prevCart, { 
        productId: product.id, 
        quantity,
        selectedAddons: selectedAddons || [],
        selections: selections || undefined
      }]
    })
    
    const addonsText = selectedAddons && selectedAddons.length > 0 
      ? ` with ${selectedAddons.length} addon(s)` 
      : selections 
      ? ` with customizations`
      : ''
    console.log('🛒 Product added to cart:', product.name || product.nameEn, addonsText)
  }, [])

  const removeFromCart = useCallback((productId: string, selectedAddons?: string[], selections?: Record<string, string[]>) => {
    setCart(prevCart => prevCart.filter(item => 
      !(item.productId === productId && 
        areAddonsEqual(item.selectedAddons, selectedAddons) &&
        areSelectionsEqual(item.selections, selections))
    ))
    console.log('🗑️ Product removed from cart:', productId)
  }, [])

  const updateCartQuantity = useCallback((productId: string, quantity: number, selectedAddons?: string[], selections?: Record<string, string[]>) => {
    if (quantity <= 0) {
      removeFromCart(productId, selectedAddons, selections)
      return
    }
    
    if (quantity > LIMITS.MAX_CART_QUANTITY) {
      alert(`Maximum ${LIMITS.MAX_CART_QUANTITY} items allowed`)
      return
    }
    
    setCart(prevCart =>
      prevCart.map(item =>
        item.productId === productId && 
        areAddonsEqual(item.selectedAddons, selectedAddons) &&
        areSelectionsEqual(item.selections, selections)
          ? { ...item, quantity } 
          : item
      )
    )
  }, [removeFromCart])

  const clearCart = useCallback(() => {
    setCart([])
    if (typeof window !== 'undefined') {
      storage.clearCart()
      // ✅ NEW: Immediate trigger for ordersUpdated on clear (e.g., after order placement)
      storage.triggerOrdersUpdate(undefined)
    }
    console.log('🛒 Cart cleared')
  }, [])

  const getCartCount = useCallback(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0)
  }, [cart])

  const getCartTotal = useCallback((productsMap: Record<string, Product>, addonsMap?: Record<string, Addon>, optionsMap?: Record<string, Addon>) => {
    return cart.reduce((total, item) => {
      const product = productsMap[item.productId]
      if (!product) return total
      
      let itemPrice = product.price
      
      // ✅ NEW: Check for pre-calculated price (BYO products)
      if (item.selections?._calculatedPrice) {
        const calculatedPrice = parseFloat(item.selections._calculatedPrice[0]) || 0
        if (calculatedPrice > 0) {
          console.log('💰 Using pre-calculated price for', item.productId, ':', calculatedPrice)
          return total + (calculatedPrice * item.quantity)
        }
      }
      
      // ✅ NEW: Add container price if present
      if (item.selections?._container && item.selections._container[2]) {
        const containerPrice = parseFloat(item.selections._container[2]) || 0
        itemPrice += containerPrice
      }
      
      // ✅ NEW: Add size price if present
      if (item.selections?._size && item.selections._size[2]) {
        const sizePrice = parseFloat(item.selections._size[2]) || 0
        itemPrice += sizePrice
      }
      
      // Add legacy addon prices if provided
      if (addonsMap && item.selectedAddons && item.selectedAddons.length > 0) {
        const addonsTotal = item.selectedAddons.reduce((sum, addonId) => {
          const addon = addonsMap[addonId]
          return sum + (addon?.price || 0)
        }, 0)
        itemPrice += addonsTotal
      }
      
      // Add BYO customization prices if provided
      if (optionsMap && item.selections) {
        // Filter out special keys (_container, _size, _calculatedPrice)
        const customizationSelections = Object.entries(item.selections)
          .filter(([key]) => !key.startsWith('_'))
          .flatMap(([, values]) => values)
        
        const customizationTotal = customizationSelections.reduce((sum, optionId) => {
          const option = optionsMap[optionId]
          return sum + (option?.price || 0)
        }, 0)
        itemPrice += customizationTotal
        console.log('💰 Customization total for', item.productId, ':', customizationTotal)
      }
      
      return total + (itemPrice * item.quantity)
    }, 0)
  }, [cart])

  // Memoized value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    cart,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    getCartCount,
    getCartTotal
  }), [cart, addToCart, removeFromCart, updateCartQuantity, clearCart, getCartCount, getCartTotal])

  // ✅ NEW: Cleanup any global listeners on unmount (if any added)
  useEffect(() => {
    return () => {
      // Example: If there were window listeners, remove here
      // window.removeEventListener('someCartEvent', handler)
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [])

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

export default CartProvider