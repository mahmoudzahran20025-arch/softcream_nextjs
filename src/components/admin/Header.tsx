// src/components/admin/Header.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Bell, Menu, X, LogOut, RefreshCw } from 'lucide-react';
import { adminRealtime } from '@/lib/adminRealtime';

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  onLogout: () => void;
  onRefresh?: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  sidebarOpen, 
  setSidebarOpen, 
  onLogout,
  onRefresh 
}) => {
  const [isConnected, setIsConnected] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    // Monitor connection status
    const checkConnection = () => {
      setIsConnected(navigator.onLine);
    };

    window.addEventListener('online', checkConnection);
    window.addEventListener('offline', checkConnection);

    // Update last update time when data refreshes
    adminRealtime().on('stats', () => {
      setLastUpdate(new Date());
    });

    adminRealtime().on('orders', () => {
      setLastUpdate(new Date());
    });

    adminRealtime().on('coupons', () => {
      setLastUpdate(new Date());
    });

    return () => {
      window.removeEventListener('online', checkConnection);
      window.removeEventListener('offline', checkConnection);
    };
  }, []);

  const formatLastUpdate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'الآن';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} دقيقة`;
    return date.toLocaleTimeString('ar-SA');
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
              🍦
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                Soft Cream Admin
              </h1>
              <p className="text-xs text-gray-500">لوحة التحكم الإدارية</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Live Status Indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            <span className="text-xs font-medium text-green-700">
              مباشر • تحديث منذ {formatLastUpdate(lastUpdate)}
            </span>
          </div>

          {/* Refresh Button */}
          <button 
            onClick={onRefresh}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title="تحديث البيانات"
            aria-label="Refresh data"
          >
            <RefreshCw size={20} className="text-gray-600" />
          </button>

          {/* Notifications */}
          <button 
            className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Notifications"
          >
            <Bell size={20} className="text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          </button>

          {/* Admin Profile */}
          <div className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
              A
            </div>
            <div className="text-right hidden md:block">
              <p className="text-sm font-semibold text-gray-800">Admin</p>
              <p className="text-xs text-gray-500">مدير النظام</p>
            </div>
          </div>

          {/* Logout Button */}
          <button 
            onClick={onLogout}
            className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
            title="تسجيل الخروج"
            aria-label="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;