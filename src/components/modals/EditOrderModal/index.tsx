'use client'

import { useState, useEffect } from 'react'
import { X, Plus, Minus, Trash2, ShoppingCart, Loader2, Save } from 'lucide-react'
import { useTheme } from '@/providers/ThemeProvider'
import { useProductsData } from '@/providers/ProductsProvider'
import { TimeManager } from '@/lib/orderTracking'
import { storage } from '@/lib/storage.client'
import { editOrder } from '@/lib/api'

interface OrderItem {
  productId: string
  name: string
  quantity: number
  price: number
  total: number
}

interface Order {
  id: string
  status: string
  items: OrderItem[]
  total: number
  totals?: {
    subtotal: number
    deliveryFee: number
    discount: number
    total: number
  }
  deliveryMethod?: 'pickup' | 'delivery'
  canCancelUntil?: string
  customer?: {
    name?: string
    phone?: string
    address?: string
  }
}

interface EditOrderModalProps {
  isOpen: boolean
  onClose: () => void
  order: Order | null
  onSuccess?: () => void
}

export default function EditOrderModal({ isOpen, onClose, order, onSuccess }: EditOrderModalProps) {
  const { language, showToast } = useTheme()
  const { products } = useProductsData()
  const [editedItems, setEditedItems] = useState<OrderItem[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [newTotals, setNewTotals] = useState<any>(null)
  const [, setTimeRemaining] = useState<number>(0)

  // Update time remaining every second
  useEffect(() => {
    if (!isOpen || !order) return

    const updateTime = () => {
      const remaining = TimeManager.getEditWindowRemaining(order)
      setTimeRemaining(remaining)
    }

    updateTime()
    const interval = setInterval(updateTime, 1000)

    return () => clearInterval(interval)
  }, [isOpen, order])

  useEffect(() => {
    if (isOpen && order) {
      // Initialize edited items from order
      setEditedItems([...order.items])
      setNewTotals(null)
    }
  }, [isOpen, order])

  // Calculate new totals when items change
  useEffect(() => {
    if (editedItems.length === 0) return

    const calculateTotals = async () => {
      try {
        const { calculateOrderPrices } = await import('@/lib/api')
        const itemsForCalculation = editedItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity
        }))

        const prices = await calculateOrderPrices(
          itemsForCalculation,
          null,
          order?.deliveryMethod || 'delivery',
          order?.customer?.phone
        )

        setNewTotals({
          subtotal: prices.subtotal || 0,
          deliveryFee: prices.deliveryFee || 0,
          discount: prices.discount || 0,
          total: prices.total || 0
        })
      } catch (error) {
        console.error('Failed to calculate prices:', error)
        // Fallback calculation
        const subtotal = editedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        setNewTotals({
          subtotal,
          deliveryFee: order?.totals?.deliveryFee || 0,
          discount: order?.totals?.discount || 0,
          total: subtotal + (order?.totals?.deliveryFee || 0) - (order?.totals?.discount || 0)
        })
      }
    }

    calculateTotals()
  }, [editedItems, order])

  const updateItemQuantity = (index: number, delta: number) => {
    const newItems = [...editedItems]
    const newQuantity = newItems[index].quantity + delta
    
    if (newQuantity <= 0) {
      // Remove item if quantity becomes 0
      newItems.splice(index, 1)
    } else {
      newItems[index].quantity = newQuantity
      newItems[index].total = newItems[index].price * newQuantity
    }
    
    setEditedItems(newItems)
  }

  // تم الاحتفاظ بهذه الدالة للاستخدام المستقبلي - قد تُستخدم لحذف مباشر للعنصر
  // TypeScript: تم إضافة void لإخماد تحذير "unused variable"
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const removeItem = (index: number) => {
    const newItems = [...editedItems]
    newItems.splice(index, 1)
    setEditedItems(newItems)
  }
  
  // استخدام void لإخماد تحذير TypeScript
  void removeItem

  const addProduct = (productId: string) => {
    const product = products.find(p => p.id === productId)
    if (!product) return

    // Check if product already exists
    const existingIndex = editedItems.findIndex(item => item.productId === productId)
    if (existingIndex >= 0) {
      updateItemQuantity(existingIndex, 1)
      return
    }

    // Add new product
    const newItem: OrderItem = {
      productId: product.id,
      name: language === 'ar' ? product.name : (product.nameEn || product.name),
      quantity: 1,
      price: product.price,
      total: product.price
    }

    setEditedItems([...editedItems, newItem])
  }

  const handleSave = async () => {
    if (!order) return

    // Validation
    if (editedItems.length === 0) {
      showToast({
        type: 'error',
        title: language === 'ar' ? 'خطأ' : 'Error',
        message: language === 'ar' ? 'يجب إضافة منتج واحد على الأقل' : 'At least one product is required',
        duration: 3000
      })
      return
    }

    // Check if order can still be edited using TimeManager
    if (!TimeManager.canEditOrder(order)) {
      const remainingSeconds = TimeManager.getEditWindowRemaining(order)
      if (remainingSeconds === 0) {
        showToast({
          type: 'error',
          title: language === 'ar' ? 'انتهت المدة' : 'Time Expired',
          message: language === 'ar' ? 'انتهت فترة التعديل المسموحة (5 دقائق)' : 'Edit period expired (5 minutes)',
          duration: 3000
        })
      } else {
        showToast({
          type: 'error',
          title: language === 'ar' ? 'خطأ' : 'Error',
          message: language === 'ar' ? 'لا يمكن تعديل هذا الطلب' : 'Cannot edit this order',
          duration: 3000
        })
      }
      return
    }

    if (!['pending', 'جديد'].includes(order.status)) {
      showToast({
        type: 'error',
        title: language === 'ar' ? 'خطأ' : 'Error',
        message: language === 'ar' ? 'لا يمكن تعديل الطلب بعد قبوله' : 'Cannot edit order after acceptance',
        duration: 3000
      })
      return
    }

    setIsSaving(true)

    try {
      const itemsForApi = editedItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity
      }))

      const result = await editOrder(order.id, itemsForApi)

      // ✅ FIX: api.ts returns result.data directly, so check for orderId presence
      // Backend returns: {success: true, data: {orderId, status, items, totals}}
      // But api.ts extracts: {orderId, status, items, totals}
      console.log('🔍 Edit API Response full:', result)
      
      // Success if we have orderId (means data was extracted) OR explicit success flag
      const isSuccess = result.orderId || (result.success === true && !result.error)
      
      if (isSuccess) {
        console.log('✅ Order updated successfully (orderId present or success=true)')
        
        // Update local storage
        if (newTotals) {
          storage.updateOrderItems(order.id, editedItems, newTotals)
        }

        // Trigger ordersUpdated event
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('ordersUpdated', {
            detail: { orderId: order.id, action: 'edited' }
          }))
        }

        showToast({
          type: 'success',
          title: language === 'ar' ? 'تم التعديل' : 'Updated',
          message: language === 'ar' ? 'تم تعديل الطلب بنجاح' : 'Order updated successfully',
          duration: 3000
        })

        if (onSuccess) {
          onSuccess()
        }
        onClose()
      } else {
        // ✅ FIX: Better error extraction
        const errorMsg = result?.error || result?.message || result?.data?.error || result?.data?.message || 'Failed to update order'
        console.error('❌ Edit failed:', { result, errorMsg })
        throw new Error(errorMsg)
      }
    } catch (error: any) {
      console.error('Failed to edit order (catch):', error)
      showToast({
        type: 'error',
        title: language === 'ar' ? 'فشل التعديل' : 'Update Failed',
        message: language === 'ar' 
          ? `فشل تعديل الطلب: ${error.message || 'خطأ غير معروف'}`
          : `Failed to update order: ${error.message || 'Unknown error'}`,
        duration: 4000
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (!isOpen || !order) return null

  // فلترة المنتجات المتاحة - تم استخدام optional chaining للتعامل مع خاصية available التي قد لا تكون موجودة في النوع
  const availableProducts = products.filter(p => (p as any).available !== false)

  return (
    <div
      className="fixed inset-0 bg-black/75 backdrop-blur-md z-[10000] flex items-center justify-center p-5"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800 z-10">
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {language === 'ar' ? 'تعديل الطلب' : 'Edit Order'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-red-500 hover:text-white flex items-center justify-center transition-colors"
            aria-label="إغلاق"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* Current Items */}
          <div className="mb-6">
            <h3 className="font-bold text-slate-900 dark:text-white mb-3">
              {language === 'ar' ? 'المنتجات الحالية' : 'Current Items'}
            </h3>
            <div className="space-y-2">
              {editedItems.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  {language === 'ar' ? 'لا توجد منتجات' : 'No items'}
                </div>
              ) : (
                editedItems.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-slate-900 dark:text-white">{item.name}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {item.price.toFixed(2)} ج.م × {item.quantity} = {item.total.toFixed(2)} ج.م
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateItemQuantity(index, -1)}
                        className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                      >
                        {item.quantity === 1 ? (
                          <Trash2 className="w-4 h-4" />
                        ) : (
                          <Minus className="w-4 h-4" />
                        )}
                      </button>
                      <span className="w-8 text-center font-bold text-slate-900 dark:text-white">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateItemQuantity(index, 1)}
                        className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Add Products */}
          <div className="mb-6">
            <h3 className="font-bold text-slate-900 dark:text-white mb-3">
              {language === 'ar' ? 'إضافة منتج' : 'Add Product'}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
              {availableProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => addProduct(product.id)}
                  className="p-2 text-sm bg-slate-50 dark:bg-slate-700 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-colors text-left"
                >
                  <p className="font-medium text-slate-900 dark:text-white truncate">
                    {language === 'ar' ? product.name : (product.nameEn || product.name)}
                  </p>
                  <p className="text-xs text-purple-600 dark:text-purple-400">
                    {product.price.toFixed(2)} ج.م
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Price Summary */}
          {newTotals && (
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-slate-700 dark:to-slate-600 rounded-xl p-4 border-2 border-purple-200 dark:border-purple-800">
              <h3 className="font-bold text-slate-900 dark:text-white mb-3">
                {language === 'ar' ? 'ملخص الأسعار الجديدة' : 'New Price Summary'}
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-slate-700 dark:text-slate-300">
                  <span>{language === 'ar' ? 'المجموع الفرعي' : 'Subtotal'}:</span>
                  <span className="font-semibold">{newTotals.subtotal.toFixed(2)} ج.م</span>
                </div>
                {newTotals.deliveryFee > 0 && (
                  <div className="flex justify-between text-slate-700 dark:text-slate-300">
                    <span>{language === 'ar' ? 'رسوم التوصيل' : 'Delivery Fee'}:</span>
                    <span className="font-semibold">{newTotals.deliveryFee.toFixed(2)} ج.م</span>
                  </div>
                )}
                {newTotals.discount > 0 && (
                  <div className="flex justify-between text-green-600 dark:text-green-400">
                    <span>{language === 'ar' ? 'الخصم' : 'Discount'}:</span>
                    <span className="font-semibold">-{newTotals.discount.toFixed(2)} ج.م</span>
                  </div>
                )}
                <div className="pt-2 border-t border-purple-200 dark:border-slate-500 flex justify-between font-bold text-lg">
                  <span className="text-slate-800 dark:text-slate-100">
                    {language === 'ar' ? 'الإجمالي الجديد' : 'New Total'}:
                  </span>
                  <span className="text-purple-600 dark:text-purple-400">
                    {newTotals.total.toFixed(2)} ج.م
                  </span>
                </div>
                {order.total !== newTotals.total && (
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                    {language === 'ar' ? 'الفرق' : 'Difference'}: 
                    <span className={newTotals.total > order.total ? 'text-red-600' : 'text-green-600'}>
                      {newTotals.total > order.total ? '+' : ''}{(newTotals.total - order.total).toFixed(2)} ج.م
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-200 dark:border-slate-700 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-lg font-bold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
          >
            {language === 'ar' ? 'إلغاء' : 'Cancel'}
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || editedItems.length === 0}
            className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{language === 'ar' ? 'جاري الحفظ...' : 'Saving...'}</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{language === 'ar' ? 'حفظ التعديلات' : 'Save Changes'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}