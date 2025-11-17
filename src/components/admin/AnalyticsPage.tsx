// src/components/admin/AnalyticsPage.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { DollarSign, Calendar, ShoppingCart } from 'lucide-react';
import { getDashboardAnalytics, getSalesByPeriod, type DashboardAnalytics } from '@/lib/adminApi';

const AnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [salesPeriod, setSalesPeriod] = useState<'day' | 'week' | 'month'>('week');
  const [isLoading, setIsLoading] = useState(true);
  const [salesData, setSalesData] = useState<any[]>([]);

  const loadSalesData = useCallback(async () => {
    try {
      const data = await getSalesByPeriod(salesPeriod);
      setSalesData(data.data || []);
    } catch (error) {
      console.error('Failed to load sales data:', error);
    }
  }, [salesPeriod]);

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);
      const data = await getDashboardAnalytics();
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  useEffect(() => {
    loadSalesData();
  }, [loadSalesData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-8 text-gray-600">
        <p>فشل تحميل البيانات التحليلية</p>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">الإحصائيات والتحليلات</h2>
        <div className="flex gap-2">
          {(['day', 'week', 'month'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setSalesPeriod(period)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                salesPeriod === period
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {period === 'day' ? 'يوم' : period === 'week' ? 'أسبوع' : 'شهر'}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">طلبات اليوم</span>
            <ShoppingCart className="text-blue-600" size={20} />
          </div>
          <p className="text-3xl font-bold text-gray-800 mb-1">{analytics?.today?.orders ?? 0}</p>
          <p className="text-sm text-green-600">+{analytics?.today?.growth ?? 0}% من الأمس</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">إيرادات اليوم</span>
            <DollarSign className="text-purple-600" size={20} />
          </div>
          <p className="text-3xl font-bold text-gray-800 mb-1">{analytics?.today?.revenue ?? 0} ج</p>
          <p className="text-sm text-purple-600">+{analytics?.today?.growth ?? 0}% من الأمس</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">طلبات الأسبوع</span>
            <Calendar className="text-green-600" size={20} />
          </div>
          <p className="text-3xl font-bold text-gray-800 mb-1">{analytics?.week?.orders ?? 0}</p>
          <p className="text-sm text-green-600">+{analytics?.week?.growth ?? 0}% من الأسبوع الماضي</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            المبيعات {salesPeriod === 'day' ? 'اليومية' : salesPeriod === 'week' ? 'الأسبوعية' : 'الشهرية'}
          </h3>
          <div className="h-64 flex items-end justify-around gap-2">
            {salesData.length > 0 ? (
              salesData.map((item, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div className="relative w-full">
                    <div 
                      className="w-full bg-gradient-to-t from-pink-500 to-purple-600 rounded-t-lg transition-all hover:opacity-80"
                      style={{ height: `${(item.revenue / Math.max(...salesData.map(d => d.revenue))) * 200}px` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500">
                    {salesPeriod === 'day' ? `ساعة ${i + 1}` : salesPeriod === 'week' ? `يوم ${i + 1}` : item.label || `فترة ${i + 1}`}
                  </span>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center text-gray-500 py-8">
                لا توجد بيانات مبيعات
              </div>
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">أكثر المنتجات مبيعاً</h3>
          <div className="space-y-3">
            {(analytics?.topProducts || []).map((product, i) => (
              <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-sm">
                    {i + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{product.name}</p>
                    <p className="text-sm text-gray-600">{product.sales} بيع</p>
                  </div>
                </div>
                <div className="text-left">
                  <p className="font-bold text-gray-800">{product.revenue} ج</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-4">الطلبات الأخيرة</h3>
        <div className="space-y-3">
          {(analytics?.recentOrders || []).map((order) => (
            <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold">
                  {order.customer_name?.charAt(0) || 'U'}
                </div>
                <div>
                  <p className="font-medium text-gray-800">{order.customer_name || 'عميل'}</p>
                  <p className="text-sm text-gray-600">{order.id} • {order.total} ج</p>
                </div>
              </div>
              <div className="text-left">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                  order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {order.status === 'delivered' ? 'تم التوصيل' :
                   order.status === 'pending' ? 'في الانتظار' :
                   order.status === 'cancelled' ? 'ملغي' :
                   order.status === 'confirmed' ? 'مؤكد' :
                   order.status === 'preparing' ? 'قيد التحضير' :
                   order.status === 'out_for_delivery' ? 'في الطريق' :
                   order.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
