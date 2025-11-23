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
  selectedAddons?: string[] // Array of addon IDs
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
  addToCart: (product: Product, quantity?: number, selectedAddons?: string[]) => void
  removeFromCart: (productId: string, selectedAddons?: string[]) => void
  updateCartQuantity: (productId: string, quantity: number, selectedAddons?: string[]) => void
  clearCart: () => void
  getCartCount: () => number
  getCartTotal: (productsMap: Record<string, Product>, addonsMap?: Record<string, Addon>) => number
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

  const addToCart = useCallback((product: Product, quantity = 1, selectedAddons?: string[]) => {
    console.log('➕ Adding to cart:', {
      productId: product.id,
      productName: product.name || product.nameEn,
      quantity,
      selectedAddons: selectedAddons || []
    })
    
    setCart(prevCart => {
      console.log('📦 Current cart before add:', prevCart)
      
      // Find existing item with same product AND same addons
      const existing = prevCart.find(item => 
        item.productId === product.id && 
        areAddonsEqual(item.selectedAddons, selectedAddons)
      )
      
      console.log('🔎 Found existing item:', existing)
      
      if (existing) {
        if (existing.quantity + quantity > LIMITS.MAX_CART_QUANTITY) {
          alert(`Maximum ${LIMITS.MAX_CART_QUANTITY} items allowed`)
          return prevCart
        }
        console.log('✅ Updating existing item quantity')
        return prevCart.map(item =>
          item.productId === product.id && areAddonsEqual(item.selectedAddons, selectedAddons)
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      }
      
      // Add as new item (different addons = different item)
      console.log('✅ Adding as new item')
      return [...prevCart, { 
        productId: product.id, 
        quantity,
        selectedAddons: selectedAddons || []
      }]
    })
    
    const addonsText = selectedAddons && selectedAddons.length > 0 
      ? ` with ${selectedAddons.length} addon(s)` 
      : ''
    console.log('🛒 Product added to cart:', product.name || product.nameEn, addonsText)
  }, [])

  const removeFromCart = useCallback((productId: string, selectedAddons?: string[]) => {
    setCart(prevCart => prevCart.filter(item => 
      !(item.productId === productId && areAddonsEqual(item.selectedAddons, selectedAddons))
    ))
    console.log('🗑️ Product removed from cart:', productId)
  }, [])

  const updateCartQuantity = useCallback((productId: string, quantity: number, selectedAddons?: string[]) => {
    if (quantity <= 0) {
      removeFromCart(productId, selectedAddons)
      return
    }
    
    if (quantity > LIMITS.MAX_CART_QUANTITY) {
      alert(`Maximum ${LIMITS.MAX_CART_QUANTITY} items allowed`)
      return
    }
    
    setCart(prevCart =>
      prevCart.map(item =>
        item.productId === productId && areAddonsEqual(item.selectedAddons, selectedAddons)
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

  const getCartTotal = useCallback((productsMap: Record<string, Product>, addonsMap?: Record<string, Addon>) => {
    return cart.reduce((total, item) => {
      const product = productsMap[item.productId]
      if (!product) return total
      
      let itemPrice = product.price
      
      // Add addon prices if provided
      if (addonsMap && item.selectedAddons && item.selectedAddons.length > 0) {
        const addonsTotal = item.selectedAddons.reduce((sum, addonId) => {
          const addon = addonsMap[addonId]
          return sum + (addon?.price || 0)
        }, 0)
        itemPrice += addonsTotal
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