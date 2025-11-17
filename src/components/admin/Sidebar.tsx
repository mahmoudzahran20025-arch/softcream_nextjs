// src/components/admin/Sidebar.tsx
'use client';

import React from 'react';
import { Package, Tag, TrendingUp, Settings, LayoutDashboard, ShoppingBag, LucideIcon } from 'lucide-react';

interface MenuItem {
  id: string;
  icon: LucideIcon;
  label: string;
  badge?: number;
}

interface SidebarProps {
  sidebarOpen: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  stats: any;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  sidebarOpen, 
  activeTab, 
  setActiveTab, 
  stats 
}) => {
  const menuItems: MenuItem[] = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'لوحة التحكم' },
    { id: 'orders', icon: Package, label: 'الطلبات', badge: stats?.activeOrders || 0 },
    { id: 'products', icon: ShoppingBag, label: 'المنتجات' },
    { id: 'coupons', icon: Tag, label: 'الكوبونات' },
    { id: 'analytics', icon: TrendingUp, label: 'الإحصائيات' },
    { id: 'settings', icon: Settings, label: 'الإعدادات' },
  ];

  return (
    <aside
      className={`${
        sidebarOpen ? 'w-64' : 'w-0'
      } bg-white shadow-lg transition-all duration-300 overflow-hidden sticky top-16 h-[calc(100vh-4rem)]`}
    >
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg shadow-pink-500/30'
                  : 'hover:bg-gray-50 text-gray-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                  isActive ? 'bg-white text-pink-600' : 'bg-pink-100 text-pink-600'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Quick Stats */}
      {stats && (
        <div className="p-4 mx-4 mt-6 bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl border border-pink-100">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">إحصائيات سريعة</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">طلبات اليوم</span>
              <span className="text-sm font-bold text-pink-600">
                {stats.totalOrders || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">الإيرادات</span>
              <span className="text-sm font-bold text-green-600">
                {stats.totalRevenue ? `${stats.totalRevenue.toFixed(0)} ج` : '0 ج'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">متوسط الطلب</span>
              <span className="text-sm font-bold text-purple-600">
                {stats.averageOrderValue ? `${stats.averageOrderValue.toFixed(0)} ج` : '0 ج'}
              </span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;