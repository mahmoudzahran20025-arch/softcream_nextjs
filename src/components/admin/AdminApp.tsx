// src/components/admin/AdminApp.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { 
  updateOrderStatusWithTracking,
  createCoupon, 
  toggleCoupon,
  getAdminToken,
  clearAdminToken,
  type Order,
  type Coupon,
  type Product 
} from '@/lib/admin';

import Header from './Header';
import Sidebar from './Sidebar';
import DashboardPage from './DashboardPage';
import OrdersPage from './OrdersPage';
import ProductsPage from './ProductsPage';
import CustomizationSettingsPage from './CustomizationSettingsPage';
import CouponsPage from './CouponsPage';
import AnalyticsPage from './AnalyticsPage';
import SettingsPage from './SettingsPage';
import LoginPage from './LoginPage';
import UsersPage from './UsersPage';

interface AdminAppProps {
  initialData: {
    orders: Order[];
    coupons: Coupon[];
    stats: any;
  };
  onRefresh: () => void;
  onRefreshOrders?: () => Promise<void>;
  onRefreshCoupons?: () => Promise<void>;
  onRefreshStats?: () => Promise<void>;
  onAuthenticated?: () => void;
}

const AdminApp: React.FC<AdminAppProps> = ({ 
  initialData, 
  onRefresh,
  onRefreshOrders,
  onRefreshCoupons,
  onRefreshStats,
  onAuthenticated
}) => {
  const [activeTab, setActiveTab] = useState('orders');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [orders, setOrders] = useState<Order[]>(initialData.orders);
  const [coupons, setCoupons] = useState<Coupon[]>(initialData.coupons);
  const [stats, setStats] = useState(initialData.stats);

  // ✅ FIX: DISABLED automatic polling - use manual refresh only
  // Too many requests! Let user refresh manually instead.
  // useEffect(() => {
  //   const ordersPolling = new OrdersPolling((newOrders: Order[]) => {
  //     setOrders(newOrders);
  //   });
  //   ordersPolling.start();
  //   return () => {
  //     ordersPolling.stop();
  //   };
  // }, []);

  // Update data when initialData changes
  useEffect(() => {
    setOrders(initialData.orders);
    setCoupons(initialData.coupons);
    setStats(initialData.stats);
  }, [initialData]);

  // Check authentication on mount
  useEffect(() => {
    const token = getAdminToken();
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (_token: string) => {
    setIsAuthenticated(true);
    // Notify parent to load data now that we're authenticated
    if (onAuthenticated) {
      onAuthenticated();
    }
  };

  const handleLogout = () => {
    clearAdminToken();
    setIsAuthenticated(false);
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  // Handle order status update with tracking
  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      // Get admin token to extract admin ID
      const token = getAdminToken();
      let adminId = 'unknown';
      
      // Try to extract admin ID from JWT token (if available)
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          adminId = payload.sub || payload.adminId || 'admin';
        } catch (e) {
          console.warn('Could not extract admin ID from token');
          adminId = 'admin';
        }
      }
      
      // Optimistic update: Update local state immediately
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, status: newStatus, last_updated_by: `admin:${adminId}` }
            : order
        )
      );
      
      // Use the new tracking API with admin identification
      const response = await updateOrderStatusWithTracking(orderId, newStatus, {
        updated_by: `admin:${adminId}`
      });
      
      if (response.success) {
        alert(`تم تحديث حالة الطلب إلى ${newStatus} بنجاح`);
        
        // Refresh only orders (not all data)
        if (onRefreshOrders) {
          await onRefreshOrders();
        } else {
          onRefresh();
        }
      } else {
        // Revert optimistic update on failure
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.id === orderId 
              ? initialData.orders.find(o => o.id === orderId) || order
              : order
          )
        );
        alert(response.message || 'فشل تحديث حالة الطلب');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      // Revert optimistic update on error
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? initialData.orders.find(o => o.id === orderId) || order
            : order
        )
      );
      alert('حدث خطأ أثناء تحديث حالة الطلب');
    }
  };

  const handleCreateCoupon = async (couponData: any) => {
    try {
      const result = await createCoupon(couponData);
      setCoupons([result.data, ...coupons]);
      alert('✅ تم إنشاء الكوبون بنجاح');
      return true;
    } catch (error) {
      alert('❌ فشل إنشاء الكوبون');
      console.error(error);
      return false;
    }
  };

  const handleUpdateProduct = (product: Product) => {
    console.log('Product updated:', product);
  };

  const handleDeleteProduct = (productId: string) => {
    console.log('Product deleted:', productId);
  };

  const handleUpdateCoupon = async (code: string, data: any) => {
    try {
      const { updateCoupon } = await import('@/lib/admin');
      const result = await updateCoupon(code, data);
      
      if (result.success) {
        // Update local state with the returned data
        setCoupons(coupons.map(c => 
          c.code === code ? result.data : c
        ));
        alert('✅ تم تحديث الكوبون بنجاح');
        return true;
      } else {
        alert('❌ فشل تحديث الكوبون');
        return false;
      }
    } catch (error) {
      console.error('Failed to update coupon:', error);
      alert('❌ حدث خطأ أثناء تحديث الكوبون');
      return false;
    }
  };

  const handleDeleteCoupon = async (code: string) => {
    try {
      const { deleteCoupon } = await import('@/lib/admin');
      const result = await deleteCoupon(code);
      
      if (result.success) {
        // Remove from local state
        setCoupons(coupons.filter(c => c.code !== code));
        alert('✅ ' + result.message);
        return true;
      } else {
        alert('❌ فشل حذف الكوبون');
        return false;
      }
    } catch (error) {
      console.error('Failed to delete coupon:', error);
      alert('❌ حدث خطأ أثناء حذف الكوبون');
      return false;
    }
  };

  const handleToggleCoupon = async (code: string) => {
    try {
      const result = await toggleCoupon(code);
      setCoupons(coupons.map(c => 
        c.code === code ? result.coupon : c
      ));
      alert('✅ تم تحديث حالة الكوبون');
    } catch (error) {
      alert('❌ فشل تحديث الكوبون');
      console.error(error);
    }
  };

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-pink-50 to-purple-50" dir="rtl">
      <Header 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen}
        onLogout={handleLogout}
        onRefresh={onRefresh}
        activeTab={activeTab}
        onRefreshOrders={onRefreshOrders}
        onRefreshCoupons={onRefreshCoupons}
        onRefreshStats={onRefreshStats}
      />
      
      <div className="flex relative">
        <Sidebar 
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          stats={stats}
        />
        
        {/* Main Content - Full width on mobile */}
        <main className="flex-1 p-3 sm:p-4 md:p-6 min-w-0 w-full">
          {activeTab === 'dashboard' && (
            <DashboardPage stats={stats} orders={orders} />
          )}
          {activeTab === 'orders' && (
            <OrdersPage 
              orders={orders} 
              onUpdateStatus={handleUpdateOrderStatus}
            />
          )}
          {activeTab === 'products' && (
            <ProductsPage 
              onRefresh={onRefresh}
              onUpdate={handleUpdateProduct}
              onDelete={handleDeleteProduct}
            />
          )}
          {activeTab === 'customization' && (
            <CustomizationSettingsPage />
          )}
          {activeTab === 'coupons' && (
            <CouponsPage 
              coupons={coupons}
              onCreate={handleCreateCoupon}
              onToggle={handleToggleCoupon}
              onUpdate={handleUpdateCoupon}
              onDelete={handleDeleteCoupon}
            />
          )}
          {activeTab === 'users' && <UsersPage onRefresh={onRefresh} />}
          {activeTab === 'analytics' && <AnalyticsPage />}
          {activeTab === 'settings' && <SettingsPage />}
        </main>
      </div>
    </div>
  );
};

export default AdminApp;