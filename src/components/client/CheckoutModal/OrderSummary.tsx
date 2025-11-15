'use client'

//import React from 'react'
import { Receipt, Loader2, AlertCircle, Info } from 'lucide-react'

interface OrderSummaryProps {
  cart: any[]
  products: Record<string, any>
  productsLoading: boolean
  prices: any
  pricesLoading: boolean
  pricesError: string | null
  deliveryMethod: 'pickup' | 'delivery' | null
}

const OrderSummary = ({
  cart,
  products,
  productsLoading, // تم الاحتفاظ به للاستخدام المستقبلي - قد يُستخدم لإظهار حالة التحميل للمنتجات
  prices,
  pricesLoading,
  pricesError,
  deliveryMethod
}: OrderSummaryProps) => {
  // استخدام void لإخماد تحذير TypeScript عن المتغير غير المستخدم
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  void productsLoading
  return (
    <div className="bg-gradient-to-br from-pink-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 rounded-2xl p-5 mb-6 border-2 border-pink-100 dark:border-gray-600 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2.5 text-base font-bold mb-4 pb-3 border-b-2 border-pink-200 dark:border-gray-500">
        <Receipt className="w-5 h-5 text-purple-600" />
        <span className="text-gray-800 dark:text-gray-100">
          Order Summary
        </span>
      </div>

      {/* Loading State */}
      {pricesLoading ? (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
          <span className="ml-2 text-sm text-gray-600">
            Calculating prices...
          </span>
        </div>
      ) : pricesError && !prices ? (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-500 rounded-xl text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{pricesError}</span>
        </div>
      ) : prices ? (
        <>
          {/* Cart Items */}
          <div className="space-y-2.5 mb-4">
            {cart.map((item, index) => {
              const product = products[item.productId]
              if (!product) return null
              
              const productName = product.name
              const priceItem = prices.items?.find((p: any) => p.productId === item.productId)
              const itemPrice = priceItem?.price || product.price
              const itemTotal = priceItem?.subtotal || (itemPrice * item.quantity)
              
              return (
                <div 
                  key={index} 
                  className="flex justify-between items-center text-sm bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm"
                >
                  <div className="flex items-center gap-2">
                    {product.image && (
                      <img 
                        src={product.image} 
                        alt={productName} 
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                    )}
                    <div>
                      <div className="font-semibold text-gray-800 dark:text-gray-100">
                        {productName}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {itemPrice.toFixed(2)} ج.م × {item.quantity}
                      </div>
                    </div>
                  </div>
                  <span className="font-bold text-purple-600">
                    {itemTotal.toFixed(2)} ج.م
                  </span>
                </div>
              )
            })}
          </div>
          
          {/* Price Breakdown */}
          <div className="border-t-2 border-pink-200 dark:border-gray-500 pt-3 space-y-2">
            {/* Subtotal */}
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
              <span>Subtotal:</span>
              <span className="font-semibold">{prices.subtotal.toFixed(2)} ج.م</span>
            </div>
            
            {/* Delivery Fee */}
            {deliveryMethod === 'delivery' && (
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                <div className="flex items-center gap-2">
                  <span>Delivery Fee:</span>
                  {prices.deliveryInfo?.isEstimated && (
                    <span className="inline-flex items-center bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 px-2 py-0.5 rounded-full text-xs font-bold">
                      Est.
                    </span>
                  )}
                </div>
                <span className="font-semibold">
                  {prices.deliveryFee > 0 
                    ? `${prices.deliveryFee.toFixed(2)} ج.م` 
                    : 'FREE'
                  }
                </span>
              </div>
            )}
            
            {/* Discount */}
            {prices.discount > 0 && (
              <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                <span>Discount:</span>
                <span className="font-semibold">-{prices.discount.toFixed(2)} ج.م</span>
              </div>
            )}
            
            {/* Total */}
            <div className="flex justify-between text-lg font-bold text-gray-800 dark:text-gray-100 pt-2 border-t border-pink-200 dark:border-gray-500">
              <span>Total:</span>
              <span className="text-purple-600 text-xl">{prices.total.toFixed(2)} ج.م</span>
            </div>
          </div>

          {/* Estimated Delivery Notice */}
          {prices.deliveryInfo?.isEstimated && deliveryMethod === 'delivery' && (
            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 rounded-lg">
              <div className="flex items-start gap-2">
                <Info className="w-5 h-5 text-yellow-600 dark:text-yellow-500 shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed">
                  <div className="font-bold text-yellow-800 dark:text-yellow-400 mb-1">
                    Important Note
                  </div>
                  <div className="text-yellow-700 dark:text-yellow-500">
                    Delivery fee is estimated. We will contact you to confirm location and calculate actual fee.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Offline Notice */}
          {prices.isOffline && (
            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed">
                  <div className="font-bold text-yellow-800 dark:text-yellow-400 mb-1">
                    ⚠️ Offline Mode
                  </div>
                  <div className="text-yellow-700 dark:text-yellow-500">
                    Prices are estimated - will be confirmed when online
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-6 text-gray-500 text-sm">
          Select delivery method to see prices
        </div>
      )}
    </div>
  )
}

export default OrderSummary
