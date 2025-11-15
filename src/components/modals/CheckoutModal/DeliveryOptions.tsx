'use client'

//import React from 'react'
import { Store, Truck, CheckCircle, MapPin, Loader2, AlertCircle } from 'lucide-react'

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
  return (
    <div className="mb-6 space-y-3">
      {/* Error Message */}
      {errors.deliveryMethod && (
        <div className="p-3 bg-red-50 border-2 border-red-500 rounded-xl text-red-600 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{errors.deliveryMethod}</span>
        </div>
      )}

      {/* Pickup Option */}
      <div
        className={`flex items-center gap-4 p-4 border-2 rounded-2xl cursor-pointer transition-all ${
          deliveryMethod === 'pickup' 
            ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20' 
            : 'border-gray-300 hover:border-purple-600'
        }`}
        onClick={() => onDeliveryMethodChange('pickup')}
      >
        <Store className="w-6 h-6 text-purple-600" />
        <div className="flex-1">
          <div className="font-bold">Pickup from Branch</div>
          <div className="text-sm text-gray-600">Free - 15 min</div>
        </div>
        <CheckCircle className={`w-6 h-6 ${deliveryMethod === 'pickup' ? 'text-purple-600' : 'text-gray-300'}`} />
      </div>

      {/* Branch Selection (Pickup Mode) */}
      {deliveryMethod === 'pickup' && (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-5 border-2 border-gray-200 dark:border-gray-600">
          <label className="flex items-center gap-2 font-bold mb-4 text-gray-800 dark:text-gray-100">
            <MapPin className="w-5 h-5 text-purple-600" />
            <span>Select Branch:</span>
          </label>
          
          {branchesLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
              <span className="ml-2 text-sm text-gray-600">Loading...</span>
            </div>
          ) : branchesError ? (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-500 rounded-xl text-yellow-700 dark:text-yellow-300 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{branchesError}</span>
            </div>
          ) : branches.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              No branches available. You can still proceed with delivery option.
            </div>
          ) : (
            <div className="space-y-3">
              {branches.map((branch) => (
                <div
                  key={branch.id}
                  className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    selectedBranch === branch.id 
                      ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20' 
                      : 'border-gray-300 hover:border-purple-600'
                  }`}
                  onClick={() => onBranchSelect(branch.id)}
                >
                  <div className="font-bold text-gray-800 dark:text-gray-100">
                    {branch.name}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {branch.address}
                  </div>
                  {branch.phone && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      📞 {branch.phone}
                    </div>
                  )}
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
        className={`flex items-center gap-4 p-4 border-2 rounded-2xl cursor-pointer transition-all ${
          deliveryMethod === 'delivery' 
            ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20' 
            : 'border-gray-300 hover:border-purple-600'
        }`}
        onClick={() => onDeliveryMethodChange('delivery')}
      >
        <Truck className="w-6 h-6 text-purple-600" />
        <div className="flex-1">
          <div className="font-bold">Delivery</div>
          <div className="text-sm text-gray-600">By location - 30 min</div>
        </div>
        <CheckCircle className={`w-6 h-6 ${deliveryMethod === 'delivery' ? 'text-purple-600' : 'text-gray-300'}`} />
      </div>
    </div>
  )
}

export default DeliveryOptions
