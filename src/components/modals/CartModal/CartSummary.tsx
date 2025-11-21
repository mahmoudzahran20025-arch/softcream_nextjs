'use client'

import { ArrowLeft } from 'lucide-react'
import PriceDisplay from '@/components/ui/common/PriceDisplay'

interface CartSummaryProps {
  total: number
  onCheckout: () => void
  isEmpty: boolean
}

export default function CartSummary({ total, onCheckout, isEmpty }: CartSummaryProps) {
  if (isEmpty) return null

  return (
    <div className="sticky bottom-0 z-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-pink-100 dark:border-slate-700 p-4 pb-6 md:pb-4 shadow-[0_-10px_40px_rgba(0,0,0,0.08)]">
      <div className="flex items-center gap-4 max-w-4xl mx-auto w-full">
        {/* Total Section - Left Side (35%) */}
        <div className="flex flex-col items-start min-w-[100px]">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-0.5">
            إجمالي السلة
          </span>
          <PriceDisplay 
            price={total} 
            size="lg" 
            className="font-black text-slate-900 dark:text-white" 
          />
        </div>

        {/* Checkout Button - Right Side (65%) */}
        <button
          onClick={onCheckout}
          className="flex-1 h-12 bg-gradient-to-r from-[#FF6B9D] to-[#FF5A8E] hover:from-[#FF5A8E] hover:to-[#FF4979] text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg shadow-pink-500/30 hover:shadow-xl hover:shadow-pink-500/40 transition-all active:scale-95 group relative overflow-hidden"
        >
          {/* Animated shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
          
          <span className="relative z-10">إتمام الطلب</span>
          <ArrowLeft className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  )
}
