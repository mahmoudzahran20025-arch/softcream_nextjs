'use client'

import { useRef, useEffect } from 'react'
import { Store, Truck, CheckCircle, MapPin, Loader2, AlertCircle, Navigation } from 'lucide-react'
import { openBranchDirections } from '@/lib/utils'

interface DeliveryOptionsProps {
  deliveryMethod: 'pickup' | 'delivery' | null
  selectedBranch: string | null
  branches: any[]
  branchesLoading: boolean
  branchesError?: string | null
  errors: Record<string, string>
  onDeliveryMethodChange: (method: 'pickup' | 'delivery') => void
  onBranchSelect: (branchId: string) => void
}

const DeliveryOptions = ({
  deliveryMethod,
  selectedBranch,
  branches,
  branchesLoading,
  branchesError,
  errors,
  onDeliveryMethodChange,
  onBranchSelect
}: DeliveryOptionsProps) => {
  // ✅ Ref for auto-scroll target
  const scrollTargetRef = useRef<HTMLDivElement>(null)

  // ✅ Auto-scroll when branch is selected
  useEffect(() => {
    if (selectedBranch && scrollTargetRef.current) {
      setTimeout(() => {
        window.scrollBy({ top: 200, behavior: 'smooth' })
      }, 300)
    }
  }, [selectedBranch])

  // ✅ Auto-scroll when delivery method changes
  useEffect(() => {
    if (deliveryMethod && scrollTargetRef.current) {
      setTimeout(() => {
        window.scrollBy({ top: 150, behavior: 'smooth' })
      }, 200)
    }
  }, [deliveryMethod])

  return (
    <div className="mb-6 space-y-3">
      {/* Error Message */}
      {errors.deliveryMethod && (
        <div className="p-3 bg-red-50 border border-red-500 rounded-2xl text-red-600 text-sm flex items-center gap-2 shadow-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{errors.deliveryMethod}</span>
        </div>
      )}

      {/* Pickup Option */}
      <div
        className={`flex items-center gap-4 p-4 border rounded-2xl cursor-pointer transition-all ${
          deliveryMethod === 'pickup' 
            ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-500 shadow-md' 
            : 'border-gray-300 dark:border-gray-600 hover:border-primary-400 hover:shadow-sm'
        }`}
        onClick={() => onDeliveryMethodChange('pickup')}
      >
        <Store className={`w-6 h-6 ${deliveryMethod === 'pickup' ? 'text-primary-600' : 'text-gray-500'}`} />
        <div className="flex-1">
          <div className="font-bold text-gray-800 dark:text-gray-100">Pickup from Branch</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Free - 15 min</div>
        </div>
        <CheckCircle className={`w-6 h-6 ${deliveryMethod === 'pickup' ? 'text-primary-600' : 'text-gray-300'}`} />
      </div>

      {/* Branch Selection (Pickup Mode) - ✅ GRID LAYOUT */}
      {deliveryMethod === 'pickup' && (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-5 border border-gray-200 dark:border-gray-600 shadow-sm">
          <label className="flex items-center gap-2 font-bold mb-4 text-gray-800 dark:text-gray-100">
            <MapPin className="w-5 h-5 text-primary-600" />
            <span>Select Branch:</span>
          </label>
          
          {branchesLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
              <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Loading...</span>
            </div>
          ) : branchesError ? (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-500 rounded-2xl text-yellow-700 dark:text-yellow-300 text-sm flex items-center gap-2 shadow-sm">
              <AlertCircle className="w-4 h-4" />
              <span>{branchesError}</span>
            </div>
          ) : branches.length === 0 ? (
            <div className="text-center py-4 text-gray-500 dark:text-gray-400">
              No branches available. You can still proceed with delivery option.
            </div>
          ) : (
            // ✅ GRID LAYOUT: Compact cards
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {branches.map((branch) => (
                <div
                  key={branch.id}
                  onClick={() => onBranchSelect(branch.id)}
                  className={`p-3 border rounded-2xl cursor-pointer transition-all ${
                    selectedBranch === branch.id 
                      ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-500 shadow-md' 
                      : 'border-gray-300 dark:border-gray-600 hover:border-primary-400 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      {/* Branch Name */}
                      <div className="font-bold text-sm text-gray-800 dark:text-gray-100 truncate">
                        {branch.name}
                      </div>
                      
                      {/* Address */}
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                        {branch.address}
                      </div>
                      
                      {/* Phone */}
                      {branch.phone && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 flex items-center gap-1">
                          <span>📞</span>
                          <span className="truncate">{branch.phone}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Map Icon Button */}
                    {branch.location_lat && branch.location_lng && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          openBranchDirections(branch.location_lat, branch.location_lng)
                        }}
                        className="flex-shrink-0 w-9 h-9 rounded-xl bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 flex items-center justify-center text-white transition-all hover:scale-110 active:scale-95 shadow-md"
                        title="فتح الاتجاهات في الخريطة"
                        aria-label="Open directions in map"
                      >
                        <Navigation className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {errors.branch && (
            <div className="text-red-500 text-sm mt-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{errors.branch}</span>
            </div>
          )}
        </div>
      )}

      {/* Delivery Option */}
      <div
        className={`flex items-center gap-4 p-4 border rounded-2xl cursor-pointer transition-all ${
          deliveryMethod === 'delivery' 
            ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-500 shadow-md' 
            : 'border-gray-300 dark:border-gray-600 hover:border-primary-400 hover:shadow-sm'
        }`}
        onClick={() => onDeliveryMethodChange('delivery')}
      >
        <Truck className={`w-6 h-6 ${deliveryMethod === 'delivery' ? 'text-primary-600' : 'text-gray-500'}`} />
        <div className="flex-1">
          <div className="font-bold text-gray-800 dark:text-gray-100">Delivery</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">By location - 30 min</div>
        </div>
        <CheckCircle className={`w-6 h-6 ${deliveryMethod === 'delivery' ? 'text-primary-600' : 'text-gray-300'}`} />
      </div>

      {/* ✅ Scroll Target Ref */}
      <div ref={scrollTargetRef} className="h-0" />
    </div>
  )
}

export default DeliveryOptions
