'use client'

import { createContext, useContext, useState, useCallback, useEffect, useMemo, useRef, ReactNode } from 'react'
import { storage } from '@/lib/storage.client'

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
}

interface Product {
  id: string
  name: string
  nameEn?: string
  price: number
}

interface CartContextType {
  cart: CartItem[]
  addToCart: (product: Product, quantity?: number) => void
  removeFromCart: (productId: string) => void
  updateCartQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  getCartCount: () => number
  getCartTotal: (productsMap: Record<string, Product>) => number
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
      
      // ✅ NEW: Debounce event dispatch - wait 100ms to batch multiple changes
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
      }, 100)
      
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

  const addToCart = useCallback((product: Product, quantity = 1) => {
    setCart(prevCart => {
      const existing = prevCart.find(item => item.productId === product.id)
      
      const MAX_QUANTITY = 50
      
      if (existing) {
        if (existing.quantity + quantity > MAX_QUANTITY) {
          alert(`Maximum ${MAX_QUANTITY} items allowed`)
          return prevCart
        }
        return prevCart.map(item =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      }
      
      return [...prevCart, { productId: product.id, quantity }]
    })
    
    console.log('🛒 Product added to cart:', product.name || product.nameEn)
  }, [])

  const removeFromCart = useCallback((productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.productId !== productId))
    console.log('🗑️ Product removed from cart:', productId)
  }, [])

  const updateCartQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }
    
    const MAX_QUANTITY = 50
    if (quantity > MAX_QUANTITY) {
      alert(`Maximum ${MAX_QUANTITY} items allowed`)
      return
    }
    
    setCart(prevCart =>
      prevCart.map(item =>
        item.productId === productId ? { ...item, quantity } : item
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

  const getCartTotal = useCallback((productsMap: Record<string, Product>) => {
    return cart.reduce((total, item) => {
      const product = productsMap[item.productId]
      if (!product) return total
      return total + (product.price * item.quantity)
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