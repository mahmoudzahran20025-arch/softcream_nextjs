// ✅ PickupView.tsx - NEW: Specialized UX for Branch Pickup Orders

'use client'

import { Store, MapPin, Phone, MessageCircle, Navigation } from 'lucide-react'
import { openBranchDirections } from '@/lib/utils'
import type { Order } from '../useOrderTracking'

interface PickupViewProps {
  order: Order
  branchName: string
  branchAddress: string | null
  branchLocation: { lat: number; lng: number } | null
  branchPhone: string | null
  onCallBranch: () => void
  onWhatsApp: () => void
}

export default function PickupView({
  order,
  branchName,
  branchAddress,
  branchLocation,
  branchPhone,
  onCallBranch,
  onWhatsApp
}: PickupViewProps) {
  return (
    <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 rounded-2xl p-6 border-2 border-blue-200 dark:border-blue-800 shadow-lg">
      {/* Branch Header */}
      <div className="flex items-start gap-4 mb-5">
        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
          <Store className="w-7 h-7 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-xs text-blue-600 dark:text-blue-400 font-bold mb-1.5 uppercase tracking-wide">
            🏪 استلام من الفرع
          </p>
          <p className="font-black text-xl text-blue-700 dark:text-blue-300 mb-2">
            {branchName}
          </p>
          {branchAddress && (
            <div className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
              <MapPin className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <p className="leading-relaxed">{branchAddress}</p>
            </div>
          )}
        </div>
      </div>
      
      {/* 🗺️ BIG NAVIGATION BUTTON - Primary Action */}
      {branchLocation && (
        <button
          onClick={() => openBranchDirections(branchLocation.lat, branchLocation.lng)}
          className="w-full py-4 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 hover:from-blue-600 hover:via-indigo-600 hover:to-purple-700 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl active:scale-[0.98] mb-4"
        >
          <Navigation className="w-6 h-6" />
          <span className="text-lg">🗺️ فتح الاتجاهات في الخريطة</span>
        </button>
      )}
      
      {/* Contact Buttons */}
      {branchPhone && (
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onCallBranch}
            className="flex items-center justify-center gap-2 py-3.5 bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 border-2 border-blue-300 dark:border-blue-700 rounded-xl font-bold text-blue-600 dark:text-blue-400 transition-all active:scale-95 shadow-sm"
          >
            <Phone className="w-5 h-5" />
            <span>اتصال</span>
          </button>
          <button
            onClick={onWhatsApp}
            className="flex items-center justify-center gap-2 py-3.5 bg-white dark:bg-slate-800 hover:bg-green-50 dark:hover:bg-slate-700 border-2 border-green-300 dark:border-green-700 rounded-xl font-bold text-green-600 dark:text-green-400 transition-all active:scale-95 shadow-sm"
          >
            <MessageCircle className="w-5 h-5" />
            <span>واتساب</span>
          </button>
        </div>
      )}

      {/* Status-Specific Messages */}
      <div className="mt-4 p-4 bg-white/60 dark:bg-slate-800/60 rounded-xl border border-blue-200 dark:border-blue-700">
        {(order.status === 'pending' || order.status === 'جديد') && (
          <div className="text-center">
            <p className="text-sm font-bold text-blue-700 dark:text-blue-300 mb-1">
              ⏳ جاري مراجعة طلبك
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              سيتم إعلامك فور تأكيد الطلب
            </p>
          </div>
        )}
        
        {(order.status === 'confirmed' || order.status === 'مؤكد' || order.status === 'preparing' || order.status === 'قيد التحضير') && (
          <div className="text-center">
            <p className="text-sm font-bold text-blue-700 dark:text-blue-300 mb-1">
              👨‍🍳 جاري تحضير طلبك
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              سيكون جاهزاً للاستلام قريباً
            </p>
          </div>
        )}
        
        {(order.status === 'ready' || order.status === 'جاهز') && (
          <div className="text-center">
            <p className="text-sm font-bold text-green-700 dark:text-green-300 mb-1">
              ✅ طلبك جاهز للاستلام!
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              توجه إلى الفرع لاستلام طلبك
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
