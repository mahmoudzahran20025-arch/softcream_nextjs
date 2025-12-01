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
            // ✅ COMPACT BRANCH CARDS - Professional Design
            <div className="space-y-2">
              {branches.map((branch) => {
                // Extract location name (e.g., "المعادي" from "سوفت كريم - المعادي")
                const locationName = branch.name?.includes('-') 
                  ? branch.name.split('-').pop()?.trim() 
                  : branch.name?.replace(/سوفت كريم|Soft Cream/gi, '').trim() || branch.name
                
                return (
                  <div
                    key={branch.id}
                    onClick={() => onBranchSelect(branch.id)}
                    className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-all ${
                      selectedBranch === branch.id 
                        ? 'bg-primary-50 dark:bg-primary-900/30 border-primary-500 shadow-md ring-2 ring-primary-200 dark:ring-primary-800' 
                        : 'border-gray-200 dark:border-gray-600 hover:border-primary-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    {/* Selection Indicator */}
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                      selectedBranch === branch.id 
                        ? 'border-primary-500 bg-primary-500' 
                        : 'border-gray-300 dark:border-gray-500'
                    }`}>
                      {selectedBranch === branch.id && (
                        <CheckCircle className="w-3 h-3 text-white" />
                      )}
                    </div>
                    
                    {/* Branch Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-primary-600 dark:text-primary-400 font-bold text-sm">🍦 سوفت كريم</span>
                        <span className="text-gray-400 dark:text-gray-500">•</span>
                        <span className="font-bold text-gray-800 dark:text-gray-100 text-sm truncate">
                          {locationName}
                        </span>
                      </div>
                      {branch.address && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                          📍 {branch.address}
                        </div>
                      )}
                    </div>
                    
                    {/* Map Button */}
                    {branch.location_lat && branch.location_lng && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          openBranchDirections(branch.location_lat, branch.location_lng)
                        }}
                        className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-500 hover:bg-blue-600 flex items-center justify-center text-white transition-all hover:scale-105 active:scale-95 shadow-sm"
                        title="فتح الاتجاهات"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )
              })}
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
