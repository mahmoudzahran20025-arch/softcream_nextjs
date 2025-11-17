// src/components/admin/DashboardPage.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Package, 
  TrendingUp, 
  Clock,
  LucideIcon
} from 'lucide-react';
import { adminRealtime } from '@/lib/adminRealtime';

interface StatCard {
  label: string;
  value: string | number;
  change: string;
  icon: LucideIcon;
  color: string;
}

interface DashboardPageProps {
  stats?: {
    todayOrders: number;
    todayRevenue: number;
    totalOrders: number;
    totalRevenue: number;
    activeOrders: number;
  };
  orders?: any[];
}

const DashboardPage: React.FC<DashboardPageProps> = ({ 
  stats: initialStats,
  orders: initialOrders
}) => {
  const [stats, setStats] = useState(initialStats);
  const [orders, setOrders] = useState(initialOrders || []);

  useEffect(() => {
    // Listen for real-time updates
    adminRealtime().on('stats', (newStats) => {
      if (newStats) {
        // Update stats in real-time
        console.log('Dashboard: Stats updated', newStats);
        setStats(newStats);
      }
    });

    adminRealtime().on('orders', (newOrders) => {
      if (newOrders && newOrders.length > 0) {
        // Update recent orders in real-time
        console.log('Dashboard: Recent orders updated', newOrders);
        setOrders(newOrders);
      }
    });

    return () => {
      // Cleanup handled by adminRealtime
    };
  }, []);

  const dashboardStats: StatCard[] = [
    { 
      label: 'إجمالي الطلبات اليوم', 
      value: stats?.totalOrders || 0, 
      change: '+12%', 
      icon: Package, 
      color: 'blue' 
    },
    { 
      label: 'إجمالي المبيعات', 
      value: `${stats?.totalRevenue?.toFixed(0) || 0} ج`, 
      change: '+18%', 
      icon: DollarSign, 
      color: 'green' 
    },
    { 
      label: 'متوسط قيمة الطلب', 
      value: stats?.totalOrders && stats?.totalRevenue ? `${(stats.totalRevenue / stats.totalOrders).toFixed(0)} ج` : '0 ج', 
      change: '+5%', 
      icon: TrendingUp, 
      color: 'purple' 
    },
    { 
      label: 'طلبات نشطة', 
      value: stats?.activeOrders || 0, 
      change: '+3%', 
      icon: Clock, 
      color: 'pink' 
    }
  ];

  const recentOrders = orders.slice(0, 5);

  const formatDate = (timestamp: number | string) => {
    const date = new Date(typeof timestamp === 'string' ? parseInt(timestamp) : timestamp);
    return new Intl.DateTimeFormat('ar-EG', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">لوحة التحكم الرئيسية</h2>
        <div className="text-sm text-gray-500">
          {new Date().toLocaleDateString('ar-EG', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {dashboardStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div 
              key={index} 
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-${stat.color}-100 rounded-xl flex items-center justify-center`}>
                  <Icon className={`text-${stat.color}-600`} size={24} />
                </div>
                <span className="text-sm font-semibold text-green-600">{stat.change}</span>
              </div>
              <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800">أحدث الطلبات</h3>
          <span className="text-sm text-gray-500">{recentOrders.length} طلب</span>
        </div>
        
        {recentOrders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">لا توجد طلبات جديدة</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div 
                key={order.id} 
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                    <Package size={20} className="text-pink-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{order.id}</p>
                    <p className="text-xs text-gray-500">
                      {order.customer_name} • {formatDate(order.timestamp)}
                    </p>
                  </div>
                </div>
                <div className="text-left">
                  <p className="font-bold text-gray-800">{order.total} ج</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    order.status === 'جديد' ? 'bg-blue-100 text-blue-700' :
                    order.status === 'قيد التحضير' ? 'bg-yellow-100 text-yellow-700' :
                    order.status === 'جاهز' ? 'bg-green-100 text-green-700' :
                    'bg-purple-100 text-purple-700'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;