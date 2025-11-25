// ================================================================
// Providers.tsx - REFACTORED with Separated Providers
// ================================================================
// BEFORE: ThemeProvider with 4 responsibilities
// AFTER: Separated into ThemeProvider, LanguageProvider, ToastProvider
// Benefits: Better SRP, easier to maintain and test

'use client'

import { ReactNode } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/queryClient'
import { ThemeProvider } from './ThemeProvider'
import { LanguageProvider } from './LanguageProvider'
import { ToastProvider } from './ToastProvider'
import { CategoryTrackingProvider } from './CategoryTrackingProvider'
import CartProvider from './CartProvider'

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          <ToastProvider>
            <CategoryTrackingProvider>
              <CartProvider>
                {children}
              </CartProvider>
            </CategoryTrackingProvider>
          </ToastProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

console.log('✅ Providers initialized (refactored with SRP)')

