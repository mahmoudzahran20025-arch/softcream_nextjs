// src/app/admin/page.tsx
'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { 
  getOrders, 
  getCoupons, 
  getTodayStats,
  type Order,
  type Coupon
} from '@/lib/adminApi';
import { adminRealtime } from '@/lib/adminRealtime';

// Dynamic import to avoid SSR issues
const AdminApp = dynamic(() => import('@/components/admin/AdminApp'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">جاري تحميل لوحة التحكم...</p>
      </div>
    </div>
  )
});

export default function AdminPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState({
    orders: [] as Order[],
    coupons: [] as Coupon[],
    stats: null as any,
    analytics: null as any
  });

  useEffect(() => {
    loadInitialData();
    
    // Setup real-time manager for all data including orders
    adminRealtime().on('orders', (newOrders: any) => {
      setData(prev => ({
        ...prev,
        orders: newOrders
      }));
    });

    adminRealtime().on('stats', (newStats: any) => {
      setData(prev => ({
        ...prev,
        stats: newStats
      }));
    });

    adminRealtime().on('coupons', (newCoupons: any) => {
      setData(prev => ({
        ...prev,
        coupons: newCoupons
      }));
    });

    adminRealtime().on('analytics', (newAnalytics: any) => {
      setData(prev => ({
        ...prev,
        analytics: newAnalytics
      }));
    });

    // ✅ NEW: Listen to client-side order updates (from EditOrderModal, etc.)
    const handleOrdersUpdated = (event: any) => {
      const { orderId, action } = event.detail || {};
      console.log(`📢 Admin: Order ${orderId} ${action} - refreshing data`);
      loadInitialData(); // Reload all orders
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('ordersUpdated', handleOrdersUpdated);
    }

    // ✅ OPTIMIZED: Auto-refresh every 2 minutes (reduced load)
    // Only refresh orders (most dynamic data), not everything
    const refreshInterval = setInterval(() => {
      console.log('🔄 Auto-refreshing orders...');
      refreshOrders(); // Only refresh orders, not all data
    }, 120000); // 120 seconds (2 minutes)

    return () => {
      clearInterval(refreshInterval);
      adminRealtime().stopAll();
      if (typeof window !== 'undefined') {
        window.removeEventListener('ordersUpdated', handleOrdersUpdated);
      }
    };
  }, []);

  async function loadInitialData() {
    try {
      setIsLoading(true);
      setError(null);

      // Load all data in parallel
      const [ordersRes, couponsRes, statsRes] = await Promise.allSettled([
        getOrders({ limit: 50 }),
        getCoupons(),
        getTodayStats()
      ]);

      const newData: any = { orders: [], coupons: [], stats: null };

      if (ordersRes.status === 'fulfilled') {
        newData.orders = ordersRes.value.data.orders;
      } else {
        console.error('Failed to load orders:', ordersRes.reason);
      }

      if (couponsRes.status === 'fulfilled') {
        newData.coupons = couponsRes.value.data;
      } else {
        console.error('Failed to load coupons:', couponsRes.reason);
      }

      if (statsRes.status === 'fulfilled') {
        newData.stats = statsRes.value;
      } else {
        console.error('Failed to load stats:', statsRes.reason);
      }

      setData(newData);

    } catch (err) {
      console.error('Error loading admin data:', err);
      setError('فشل تحميل البيانات. تحقق من الاتصال.');
    } finally {
      setIsLoading(false);
    }
  }

  // Granular refresh functions
  async function refreshOrders() {
    try {
      const ordersRes = await getOrders({ limit: 50 });
      setData(prev => ({
        ...prev,
        orders: ordersRes.data.orders
      }));
    } catch (err) {
      console.error('Failed to refresh orders:', err);
    }
  }

  async function refreshCoupons() {
    try {
      const couponsRes = await getCoupons();
      setData(prev => ({
        ...prev,
        coupons: couponsRes.data
      }));
    } catch (err) {
      console.error('Failed to refresh coupons:', err);
    }
  }

  async function refreshStats() {
    try {
      const statsRes = await getTodayStats();
      setData(prev => ({
        ...prev,
        stats: statsRes
      }));
    } catch (err) {
      console.error('Failed to refresh stats:', err);
    }
  }

  if (error && !isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">خطأ في التحميل</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={loadInitialData}
            className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-pink-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">جاري التحميل...</h3>
          <p className="text-gray-600">الرجاء الانتظار قليلاً</p>
        </div>
      </div>
    );
  }

  return (
    <AdminApp 
      initialData={data} 
      onRefresh={loadInitialData}
      onRefreshOrders={refreshOrders}
      onRefreshCoupons={refreshCoupons}
      onRefreshStats={refreshStats}
    />
  );
}