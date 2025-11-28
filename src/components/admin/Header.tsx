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
  activeTab?: string;
  onRefreshOrders?: () => Promise<void>;
  onRefreshCoupons?: () => Promise<void>;
  onRefreshStats?: () => Promise<void>;
}

const Header: React.FC<HeaderProps> = ({ 
  sidebarOpen, 
  setSidebarOpen, 
  onLogout,
  onRefresh,
  activeTab,
  onRefreshOrders,
  onRefreshCoupons,
  onRefreshStats
}) => {
  const [isConnected, setIsConnected] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const checkConnection = () => {
      setIsConnected(navigator.onLine);
    };

    window.addEventListener('online', checkConnection);
    window.addEventListener('offline', checkConnection);

    adminRealtime().on('stats', () => setLastUpdate(new Date()));
    adminRealtime().on('orders', () => setLastUpdate(new Date()));
    adminRealtime().on('coupons', () => setLastUpdate(new Date()));

    return () => {
      window.removeEventListener('online', checkConnection);
      window.removeEventListener('offline', checkConnection);
    };
  }, []);

  const formatLastUpdate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'الآن';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} د`;
    return date.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
  };

  const handleRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      switch (activeTab) {
        case 'orders':
          if (onRefreshOrders) await onRefreshOrders();
          else if (onRefresh) await onRefresh();
          break;
        case 'coupons':
          if (onRefreshCoupons) await onRefreshCoupons();
          else if (onRefresh) await onRefresh();
          break;
        case 'dashboard':
          if (onRefreshStats) await onRefreshStats();
          else if (onRefresh) await onRefresh();
          break;
        default:
          if (onRefresh) await onRefresh();
      }
      setLastUpdate(new Date());
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="flex items-center justify-between px-2 sm:px-4 py-2 sm:py-3">
        {/* Left Side - Menu & Logo */}
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-lg">
              🍦
            </div>
            <div className="hidden xs:block">
              <h1 className="text-base sm:text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                Soft Cream
              </h1>
              <p className="text-[10px] sm:text-xs text-gray-500 hidden sm:block">لوحة التحكم</p>
            </div>
          </div>
        </div>

        {/* Right Side - Actions */}
        <div className="flex items-center gap-1 sm:gap-2 md:gap-4">
          {/* Connection Status - Compact on mobile */}
          <div className="hidden sm:flex items-center gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-blue-50 border border-blue-200 rounded-full">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-blue-500' : 'bg-red-500'}`}></div>
            <span className="text-[10px] sm:text-xs font-medium text-blue-700">
              <span className="hidden md:inline">تحديث يدوي • </span>
              {formatLastUpdate(lastUpdate)}
            </span>
          </div>

          {/* Mobile: Simple status dot */}
          <div className="sm:hidden flex items-center gap-1 px-2 py-1 bg-blue-50 rounded-full">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-blue-500' : 'bg-red-500'}`}></div>
            <span className="text-[10px] text-blue-700">{formatLastUpdate(lastUpdate)}</span>
          </div>

          {/* Refresh Button */}
          <button 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
            title="تحديث"
            aria-label="Refresh data"
          >
            <RefreshCw size={18} className={`text-gray-600 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>

          {/* Notifications - Hidden on very small screens */}
          <button 
            className="relative p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition-colors hidden xs:block"
            aria-label="Notifications"
          >
            <Bell size={18} className="text-gray-600" />
            <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          </button>

          {/* Admin Profile - Compact on mobile */}
          <div className="hidden md:flex items-center gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-gray-50 rounded-lg">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm">
              A
            </div>
            <div className="text-right">
              <p className="text-xs sm:text-sm font-semibold text-gray-800">Admin</p>
              <p className="text-[10px] sm:text-xs text-gray-500">مدير</p>
            </div>
          </div>

          {/* Mobile: Just avatar */}
          <div className="md:hidden w-7 h-7 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
            A
          </div>

          {/* Logout Button */}
          <button 
            onClick={onLogout}
            className="p-1.5 sm:p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
            title="خروج"
            aria-label="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
