// ================================================================
// modalStore.ts - Centralized Modal Management with Zustand
// ================================================================
// Created: November 24, 2025
// Purpose: Replace 15+ useState hooks with single store
// Benefits: Better performance, easier debugging, modal history

import { create } from 'zustand'

export type ModalType = 
  | 'cart' 
  | 'checkout' 
  | 'tracking' 
  | 'myOrders' 
  | 'editOrder' 
  | 'success' 
  | 'product'
  | 'nutrition'
  | 'sidebar'
  | null

interface ModalState {
  current: ModalType
  data: any
  history: ModalType[]
  
  // Actions
  open: (type: ModalType, data?: any) => void
  close: () => void
  back: () => void
  replace: (type: ModalType, data?: any) => void
  clearHistory: () => void
}

export const useModalStore = create<ModalState>((set, get) => ({
  current: null,
  data: null,
  history: [],
  
  open: (type, data) => {
    console.log('🔓 Opening modal:', type, data ? 'with data' : '')
    set((state) => ({
      current: type,
      data,
      history: [...state.history, type]
    }))
  },
  
  close: () => {
    console.log('🔒 Closing modal:', get().current)
    set({
      current: null,
      data: null
    })
  },
  
  back: () => {
    const state = get()
    const history = [...state.history]
    history.pop() // Remove current
    const previous = history[history.length - 1] || null
    
    console.log('⬅️ Going back to:', previous)
    
    set({
      current: previous,
      history
    })
  },
  
  replace: (type, data) => {
    console.log('🔄 Replacing modal:', get().current, '→', type)
    set({
      current: type,
      data
    })
  },
  
  clearHistory: () => {
    set({ history: [] })
  }
}))

console.log('✅ ModalStore initialized')
