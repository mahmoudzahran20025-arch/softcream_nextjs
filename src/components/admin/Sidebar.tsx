// src/components/admin/Sidebar.tsx
'use client';

import React, { useEffect } from 'react';
import { Package, Tag, TrendingUp, Settings, LayoutDashboard, ShoppingBag, LucideIcon, Sliders, X, Users } from 'lucide-react';

interface MenuItem {
  id: string;
  icon: LucideIcon;
  label: string;
  badge?: number;
}

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen?: (open: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  stats: any;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  sidebarOpen, 
  setSidebarOpen,
  activeTab, 
  setActiveTab, 
  stats 
}) => {
  const menuItems: MenuItem[] = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'لوحة التحكم' },
    { id: 'orders', icon: Package, label: 'الطلبات', badge: stats?.activeOrders || 0 },
    { id: 'products', icon: ShoppingBag, label: 'المنتجات' },
    { id: 'customization', icon: Sliders, label: 'إعدادات التخصيص' },
    { id: 'coupons', icon: Tag, label: 'الكوبونات' },
    { id: 'users', icon: Users, label: 'العملاء' },
    { id: 'analytics', icon: TrendingUp, label: 'الإحصائيات' },
    { id: 'settings', icon: Settings, label: 'الإعدادات' },
  ];

  // Close sidebar on mobile when clicking outside
  useEffect(() => {
    const handleResize = () => {
      // Auto-close sidebar on mobile screens
      if (window.innerWidth < 768 && sidebarOpen && setSidebarOpen) {
        // Don't auto-close, let user control it
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [sidebarOpen, setSidebarOpen]);

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    // Close sidebar on mobile after selecting a tab
    if (window.innerWidth < 768 && setSidebarOpen) {
      setSidebarOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen?.(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:sticky top-16 right-0 z-50 md:z-30
          h-[calc(100vh-4rem)] bg-white shadow-lg
          transition-all duration-300 ease-in-out
          ${sidebarOpen ? 'w-64 translate-x-0' : 'w-0 translate-x-full md:translate-x-0'}
          md:${sidebarOpen ? 'w-64' : 'w-0'}
          overflow-hidden
        `}
      >
        {/* Mobile Close Button */}
        <div className="flex items-center justify-between p-4 border-b md:hidden">
          <span className="font-bold text-gray-800">القائمة</span>
          <button
            onClick={() => setSidebarOpen?.(false)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="p-4 space-y-2 overflow-y-auto h-full">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg shadow-pink-500/30'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={20} />
                  <span className="font-medium whitespace-nowrap">{item.label}</span>
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

          {/* Quick Stats - Hidden on very small screens */}
          {stats && (
            <div className="p-4 mt-6 bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl border border-pink-100">
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
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
