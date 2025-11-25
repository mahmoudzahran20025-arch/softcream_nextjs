// ✅ REFACTORED: TrackingModal - Clean Orchestrator
// All business logic extracted to useOrderTracking.ts
// Smart switching between PickupView and DeliveryView

'use client'

import { X, Package, Edit } from 'lucide-react'
import { useOrderTracking, type Order } from './useOrderTracking'
import OrderHeader from './components/OrderHeader'
import StatusTimeline from './components/StatusTimeline'
import OrderSummary from './components/OrderSummary'
import PickupView from './views/PickupView'
import DeliveryView from './views/DeliveryView'
import { useToast } from '@/providers/ToastProvider'

interface TrackingModalProps {
  isOpen: boolean
  onClose: () => void
  order?: Order | null
  onEditOrder?: (order: Order) => void
}

export default function TrackingModal({ isOpen, onClose, order, onEditOrder }: TrackingModalProps) {
  const { showToast } = useToast()
  
  // ✅ ALL LOGIC IN CUSTOM HOOK
  const {
    currentOrder,
    isRefreshing,
    getStatusLabel,
    formatUpdatedBy,
    handleManualRefresh,
    canEditOrder,
    getBranchPhone,
    getBranchName,
    getBranchAddress,
    getBranchLocation,
    handleCallBranch,
    handleWhatsApp
  } = useOrderTracking({ isOpen, order })

  const handleEditOrder = () => {
    if (!currentOrder || !onEditOrder) return
    if (!canEditOrder(currentOrder)) {
      showToast({
        type: 'warning',
        title: 'انتهت الفترة',
        message: 'انتهت فترة التعديل المسموحة (5 دقائق)',
        duration: 3000
      })
      return
    }
    onEditOrder(currentOrder)
  }

  if (!isOpen || !currentOrder) return null

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-slate-900 rounded-3xl max-w-[580px] w-full max-h-[92vh] overflow-y-auto shadow-2xl animate-in zoom-in duration-300 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ✅ زر الإغلاق X في الأعلى */}
        <button 
          onClick={onClose} 
          className="absolute top-4 left-4 z-50 w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-red-500 hover:text-white dark:hover:bg-red-500 flex items-center justify-center transition-all shadow-lg"
          aria-label="إغلاق"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 🎨 Header مبسط */}
        <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-6 rounded-t-3xl">
          <div className="flex items-center gap-4 text-white">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <Package className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-1">تتبع الطلب</h2>
              <div className="text-white/90 text-sm flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                يتم التحديث تلقائياً
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Order Header (ID + Timer) */}
          <OrderHeader order={currentOrder} />

          {/* Status Timeline (Progress Bar + Stages) */}
          <StatusTimeline
            order={currentOrder}
            isRefreshing={isRefreshing}
            getStatusLabel={getStatusLabel}
            formatUpdatedBy={formatUpdatedBy}
            onRefresh={handleManualRefresh}
          />

          {/* 🎯 SMART SWITCHING: Pickup vs Delivery View */}
          {currentOrder.deliveryMethod === 'pickup' ? (
            <PickupView
              order={currentOrder}
              branchName={getBranchName()}
              branchAddress={getBranchAddress()}
              branchLocation={getBranchLocation()}
              branchPhone={getBranchPhone()}
              onCallBranch={handleCallBranch}
              onWhatsApp={handleWhatsApp}
            />
          ) : (
            <DeliveryView
              order={currentOrder}
              branchName={getBranchName()}
              branchAddress={getBranchAddress()}
              branchPhone={getBranchPhone()}
              onCallBranch={handleCallBranch}
              onWhatsApp={handleWhatsApp}
            />
          )}

          {/* Order Summary (Customer Info + Items + Totals) */}
          <OrderSummary order={currentOrder} />

          {/* Action Buttons */}
          {canEditOrder(currentOrder) && onEditOrder && (
            <button
              onClick={handleEditOrder}
              className="w-full py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-[0.98]"
            >
              <Edit className="w-5 h-5" />
              ✏️ تعديل الطلب
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
