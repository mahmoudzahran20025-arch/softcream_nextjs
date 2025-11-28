// src/components/admin/OrdersPage.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Search, Download, Package, User, Phone, MapPin, Clock, Eye } from 'lucide-react';
import type { Order } from '@/lib/admin';
import { StatusManager } from '@/lib/orderTracking';

interface OrdersPageProps {
  orders: Order[];
  onUpdateStatus: (orderId: string, newStatus: string) => Promise<void>;
}

const OrdersPage: React.FC<OrdersPageProps> = ({ orders, onUpdateStatus }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [ordersWithTracking, setOrdersWithTracking] = useState<Order[]>([]);

  // ✅ FIX: Remove duplicate polling - rely on parent component's polling
  // Just process the orders prop when it changes (parent already polls via adminRealtime)
  useEffect(() => {
    // Simply use the orders from props - they already have tracking data from parent
    const processedOrders = (orders || []).map(order => ({
      ...order,
      // Ensure all tracking fields have fallback values
      progress: order.progress ?? 0,
      elapsedMinutes: order.elapsedMinutes ?? 0,
      isAutoProgressed: order.isAutoProgressed ?? false,
      nextStatus: order.nextStatus ?? '',
      estimatedCompletionTime: order.estimatedCompletionTime ?? '',
      last_updated_by: order.last_updated_by ?? 'system',
      processed_date: order.processed_date ?? '',
      processed_by: order.processed_by ?? ''
    }));
    
    setOrdersWithTracking(processedOrders);
  }, [orders]);

  const statuses = [
    { id: 'all', label: 'الكل' },
    { id: 'جديد', label: 'جديد' },
    { id: 'قيد التحضير', label: 'قيد التحضير' },
    { id: 'جاهز', label: 'جاهز' },
    { id: 'تم التوصيل', label: 'تم التوصيل' },
    { id: 'cancelled', label: 'ملغي' },
  ];

  const filteredOrders = (ordersWithTracking || []).filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_phone.includes(searchQuery);
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'جديد': return 'blue';
      case 'قيد التحضير': return 'yellow';
      case 'جاهز': return 'green';
      case 'تم التوصيل': return 'purple';
      case 'cancelled': return 'red';
      default: return 'gray';
    }
  };

  const getAvailableStatusTransitions = (currentStatus: string) => {
    const transitions = [];
    
    // Check if admin can transition to each status
    const possibleStatuses = ['قيد التحضير', 'جاهز', 'تم التوصيل', 'cancelled'];
    
    for (const status of possibleStatuses) {
      if (StatusManager.canTransitionTo(currentStatus, status, 'admin')) {
        transitions.push(status);
      }
    }
    
    return transitions;
  };

  const formatDate = (timestamp: number | string) => {
    const date = new Date(typeof timestamp === 'string' ? parseInt(timestamp) : timestamp);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);
    
    if (diffMinutes < 1) return 'الآن';
    if (diffMinutes < 60) return `منذ ${diffMinutes} دقيقة`;
    if (diffMinutes < 1440) return `منذ ${Math.floor(diffMinutes / 60)} ساعة`;
    return date.toLocaleDateString('ar-EG');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">إدارة الطلبات</h2>
        <button className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg shadow-lg flex items-center gap-2 hover:shadow-xl transition-all">
          <Download size={20} />
          <span>تصدير</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="بحث برقم الطلب، اسم العميل، أو رقم الهاتف..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-10 pl-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
          >
            {statuses.map(status => (
              <option key={status.id} value={status.id}>{status.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">لا توجد طلبات</p>
          </div>
        ) : (
          filteredOrders.map(order => (
            <div 
              key={order.id} 
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                {/* Order Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-800">{order.id}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold bg-${getStatusColor(order.status)}-100 text-${getStatusColor(order.status)}-700`}>
                        {order.status}
                      </span>
                      <span className="text-sm text-gray-500">{formatDate(order.timestamp)}</span>
                    </div>
                    
                    {/* Customer Info */}
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <User size={16} />
                        <span>{order.customer_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone size={16} />
                        <span dir="ltr">{order.customer_phone}</span>
                      </div>
                      {order.delivery_method === 'delivery' && order.customer_address && (
                        <div className="flex items-center gap-2">
                          <MapPin size={16} />
                          <span>{order.customer_address}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Clock size={16} />
                        <span>⏱️ {order.eta_minutes} دقيقة</span>
                      </div>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="text-left">
                    <p className="text-2xl font-bold text-gray-800">{order.total} ج</p>
                    <p className="text-sm text-gray-500">
                      {order.delivery_method === 'pickup' ? '🏃 استلام' : '🚗 توصيل'}
                    </p>
                  </div>
                </div>

                {/* 🎯 Enhanced Progress Tracking */}
                <div className="mb-4 p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg border border-pink-100">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-gray-700">📊 تقدم الطلب</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">{order.progress || 0}%</span>
                      {order.isAutoProgressed && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full font-medium">
                          ⚡ تلقائي
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-3 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-pink-500 to-purple-600 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${order.progress || 0}%` }}
                    >
                      <div className="h-full bg-white bg-opacity-30 animate-pulse"></div>
                    </div>
                  </div>
                  
                  {/* Status Timeline */}
                  <div className="flex justify-between mt-3">
                    {['جديد', 'قيد التحضير', 'جاهز', 'تم التوصيل'].map((status, index) => {
                      const isCompleted = order.status === status || 
                        ['جديد', 'قيد التحضير', 'جاهز', 'تم التوصيل'].indexOf(order.status) > index;
                      const isCurrent = order.status === status;
                      
                      return (
                        <div key={status} className="flex flex-col items-center flex-1">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                            isCompleted 
                              ? 'bg-green-500 text-white' 
                              : isCurrent 
                                ? 'bg-pink-500 text-white animate-pulse' 
                                : 'bg-gray-300 text-gray-600'
                          }`}>
                            {isCompleted ? '✓' : index + 1}
                          </div>
                          <span className={`text-xs mt-1 text-center ${
                            isCurrent ? 'font-semibold text-pink-600' : 'text-gray-600'
                          }`}>
                            {status}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Last Updated By Information */}
                  {order.last_updated_by && (
                    <div className="mb-3 p-2 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-600">آخر تحديث بواسطة:</span>
                        <span className={`font-semibold ${
                          order.last_updated_by === 'system' ? 'text-blue-600' :
                          order.last_updated_by === 'frontend' ? 'text-green-600' :
                          order.last_updated_by === 'auto-time-progress' ? 'text-purple-600' :
                          order.last_updated_by.startsWith('admin:') ? 'text-orange-600' :
                          'text-gray-600'
                        }`}>
                          {order.last_updated_by === 'system' ? 'النظام' :
                           order.last_updated_by === 'frontend' ? 'العميل' :
                           order.last_updated_by === 'auto-time-progress' ? 'تحديث تلقائي' :
                           order.last_updated_by.startsWith('admin:') ? `الأدمن: ${order.last_updated_by.split(':')[1]}` :
                           order.last_updated_by}
                        </span>
                      </div>
                      {order.processed_date && (
                        <div className="text-xs text-gray-500 mt-1">
                          {formatDate(order.processed_date)}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Next Status & ETA */}
                  {order.nextStatus && order.status !== 'تم التوصيل' && order.status !== 'cancelled' && (
                    <div className="mt-3 p-2 bg-white bg-opacity-70 rounded-lg border border-pink-200">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600">الخطوة التالية:</span>
                          <span className="font-semibold text-pink-600">{order.nextStatus}</span>
                        </div>
                        {order.estimatedCompletionTime && (
                          <div className="flex items-center gap-1 text-gray-600">
                            <Clock size={14} />
                            <span>متوقع خلال: {order.estimatedCompletionTime}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Time Metrics */}
                  <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                    <span>⏱️ منذ: {order.elapsedMinutes || 0} دقيقة</span>
                    <span>📍 الحالة: {order.status}</span>
                    {order.eta_minutes && (
                      <span>🚚 التوصيل: {order.eta_minutes} دقيقة</span>
                    )}
                  </div>
                </div>

                {/* Pricing Breakdown */}
                <div className="border-t border-gray-100 pt-3 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>المجموع الفرعي:</span>
                    <span>{order.subtotal} ج</span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>الخصم {order.coupon_code && `(${order.coupon_code})`}:</span>
                      <span>- {order.discount} ج</span>
                    </div>
                  )}
                  {order.delivery_fee > 0 && (
                    <div className="flex justify-between text-gray-600">
                      <span>رسوم التوصيل:</span>
                      <span>{order.delivery_fee} ج</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                  {/* Dynamic status transition buttons */}
                  {getAvailableStatusTransitions(order.status).map(status => {
                    const buttonConfig = {
                      'قيد التحضير': { color: 'yellow', label: 'بدء التحضير' },
                      'جاهز': { color: 'green', label: 'جاهز للتوصيل' },
                      'تم التوصيل': { color: 'purple', label: 'تم التوصيل' },
                      'cancelled': { color: 'red', label: 'إلغاء الطلب' }
                    };
                    const config = buttonConfig[status as keyof typeof buttonConfig];
                    
                    return (
                      <button
                        key={status}
                        onClick={() => onUpdateStatus(order.id, status)}
                        className={`flex-1 px-4 py-2 bg-${config.color}-500 hover:bg-${config.color}-600 text-white rounded-lg font-semibold transition-colors`}
                      >
                        {config.label}
                      </button>
                    );
                  })}
                  
                  {/* Time remaining for cancellation/edit */}
                  {order.status === 'جديد' && (
                    <div className="flex-1 text-center text-sm text-gray-500">
                      {(() => {
                        const createdTime = new Date(order.timestamp);
                        const cancelUntil = order.can_cancel_until ? new Date(order.can_cancel_until) : new Date(createdTime.getTime() + 5 * 60 * 1000);
                        const remaining = Math.max(0, Math.floor((cancelUntil.getTime() - Date.now()) / 1000));
                        
                        if (remaining > 0) {
                          const minutes = Math.floor(remaining / 60);
                          const seconds = remaining % 60;
                          return `⏰ يمكن التعديل: ${minutes}:${seconds.toString().padStart(2, '0')}`;
                        }
                        return '⏰ انتهت فترة التعديل';
                      })()}
                    </div>
                  )}
                  
                  <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                    <Eye size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default OrdersPage;