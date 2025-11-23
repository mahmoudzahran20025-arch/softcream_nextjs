// ✅ OrderSummary.tsx - Items List & Price Totals

'use client'

import type { Order } from '../useOrderTracking'

interface OrderSummaryProps {
  order: Order
}

export default function OrderSummary({ order }: OrderSummaryProps) {
  return (
    <>
      {/* Customer Info */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700">
        <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold">
            {order.customer.name.charAt(0).toUpperCase()}
          </div>
          معلومات العميل
        </h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-slate-600 dark:text-slate-400">الاسم</span>
            <span className="font-semibold text-slate-900 dark:text-white">{order.customer.name}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-600 dark:text-slate-400">الهاتف</span>
            <span className="font-semibold text-slate-900 dark:text-white dir-ltr">{order.customer.phone}</span>
          </div>
          {order.customer.address && (
            <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
              <p className="text-slate-600 dark:text-slate-400 mb-2">العنوان</p>
              <p className="font-semibold text-slate-900 dark:text-white">{order.customer.address}</p>
            </div>
          )}
        </div>
      </div>

      {/* Items */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700">
        <h3 className="font-bold text-slate-900 dark:text-white mb-4">المنتجات المطلوبة</h3>
        <div className="space-y-3">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
              <div className="flex-1">
                <p className="font-medium text-slate-900 dark:text-white">{item.name}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {item.price.toFixed(2)} ج.م × {item.quantity}
                </p>
              </div>
              <p className="font-bold text-lg text-purple-600 dark:text-purple-400">
                {item.total.toFixed(2)} ج.م
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Total Summary */}
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-2xl p-5 border border-slate-200 dark:border-slate-600">
        <div className="space-y-3">
          <div className="flex justify-between text-slate-700 dark:text-slate-300">
            <span>المجموع الفرعي</span>
            <span className="font-semibold">{order.totals.subtotal.toFixed(2)} ج.م</span>
          </div>
          {order.totals.deliveryFee > 0 && (
            <div className="flex justify-between text-slate-700 dark:text-slate-300">
              <span>رسوم التوصيل</span>
              <span className="font-semibold">{order.totals.deliveryFee.toFixed(2)} ج.م</span>
            </div>
          )}
          {order.totals.discount > 0 && (
            <div className="flex justify-between text-green-600 dark:text-green-400">
              <span>الخصم</span>
              <span className="font-semibold">-{order.totals.discount.toFixed(2)} ج.م</span>
            </div>
          )}
          <div className="pt-3 border-t-2 border-slate-300 dark:border-slate-600 flex justify-between items-center">
            <span className="text-lg font-bold text-slate-800 dark:text-slate-100">الإجمالي</span>
            <span className="text-2xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {order.totals.total.toFixed(2)} ج.م
            </span>
          </div>
        </div>
      </div>
    </>
  )
}
