'use client';

import React, { useState, useEffect } from 'react';
import {
  updateOrderStatusWithTracking,
  createCoupon,
  toggleCoupon,
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
  user?: {
    username: string;
    role: string;
    name?: string;
  };
}

const AdminApp: React.FC<AdminAppProps> = ({
  initialData,
  onRefresh,
  onRefreshOrders,
  onRefreshCoupons,
  onRefreshStats,
  user
}) => {
  const [activeTab, setActiveTab] = useState('orders');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [orders, setOrders] = useState<Order[]>(initialData.orders);
  const [coupons, setCoupons] = useState<Coupon[]>(initialData.coupons);
  const [stats, setStats] = useState(initialData.stats);

  // Update data when initialData changes
  useEffect(() => {
    setOrders(initialData.orders);
    setCoupons(initialData.coupons);
    setStats(initialData.stats);
  }, [initialData]);

  const handleLogout = () => {
    clearAdminToken(); // Calls /api/auth/logout
    if (typeof window !== 'undefined') {
      window.location.href = '/admin/login';
    }
  };

  // Handle order status update with tracking
  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const adminName = user?.name || user?.username || 'admin';

      // Optimistic update: Update local state immediately
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId
            ? { ...order, status: newStatus, last_updated_by: adminName }
            : order
        )
      );

      // Use the new tracking API (Server will handle identifying the user via cookie)
      const response = await updateOrderStatusWithTracking(orderId, newStatus, {
        updated_by: adminName
      });

      if (response.success) {
        // Refresh only orders
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
      // Revert optimistic update
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