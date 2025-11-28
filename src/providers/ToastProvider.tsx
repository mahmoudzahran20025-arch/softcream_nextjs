// ================================================================
// ToastProvider.tsx - Toast Notifications Management
// ================================================================
// Created: November 24, 2025
// Purpose: Separate toast concerns from ThemeProvider (SRP)
// Responsibilities: Toast notifications only

'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

interface Toast {
  id: number
  type: 'info' | 'success' | 'warning' | 'error'
  title?: string
  message: string
  duration?: number
}

interface ToastContextType {
  toasts: Toast[]
  showToast: (options: Omit<Toast, 'id'>) => number
  removeToast: (id: number) => void
  clearToasts: () => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  
  const showToast = useCallback((options: Omit<Toast, 'id'>) => {
    const {
      type = 'info',
      title,
      message,
      duration = 5000
    } = options

    const id = Date.now() + Math.random()
    const newToast: Toast = {
      id,
      type,
      title,
      message,
      duration
    }

    setToasts(prev => [...prev, newToast])
    
    // Toast shown

    return id
  }, [])

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const clearToasts = useCallback(() => {
    setToasts([])
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast, clearToasts }}>
      {children}
    </ToastContext.Provider>
  )
}

// ToastProvider initialized
