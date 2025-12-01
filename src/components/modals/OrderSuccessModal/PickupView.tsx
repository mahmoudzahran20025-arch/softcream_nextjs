// ================================================================
// Pickup View Component - For branch pickup orders
// ================================================================

'use client'

import { Store, Navigation, Phone } from 'lucide-react'
import type { SavedOrder } from './types'

interface PickupViewProps {
  order: SavedOrder
  branchName: string
  branchPhone: string
  hasLocation: boolean
  onOpenLocation: () => void
  onCallBranch: () => void
}

const PickupView = ({
  order,
  branchName,
  branchPhone,
  hasLocation,
  onOpenLocation,
  onCallBranch
}: PickupViewProps) => (
  <div className="space-y-3">
    {/* Branch Card with Location Button */}
    <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl p-4 border-2 border-orange-200 dark:border-orange-700">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
          <Store className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-orange-600 dark:text-orange-400 font-medium mb-1">فرع الاستلام</p>
          <p className="text-lg font-black text-gray-800 dark:text-gray-100">{branchName}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            ⏱️ جاهز خلال {order.estimatedMinutes || 12} دقيقة
          </p>
        </div>
      </div>

      {/* Big Location Button */}
      {hasLocation && (
        <button
          onClick={onOpenLocation}
          className="w-full mt-4 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl font-bold text-sm shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
        >
          <Navigation className="w-5 h-5" />
          <span>🗺️ فتح موقع فرع {branchName} على الخريطة</span>
        </button>
      )}

      {/* Call Button */}
      {branchPhone && (
        <button
          onClick={onCallBranch}
          className="w-full mt-2 py-2.5 bg-white dark:bg-gray-700 border-2 border-orange-300 dark:border-orange-600 text-orange-600 dark:text-orange-400 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 hover:bg-orange-50 dark:hover:bg-orange-900/20"
        >
          <Phone className="w-4 h-4" />
          <span>اتصل بالفرع: {branchPhone}</span>
        </button>
      )}
    </div>
  </div>
)

export default PickupView
