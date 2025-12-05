// src/components/admin/coupons/StatsModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { getCouponStats } from '@/lib/admin';
import type { StatsModalProps, CouponStats } from './types';

const StatsModal: React.FC<StatsModalProps> = ({ code, onClose }) => {
  const [stats, setStats] = useState<CouponStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [code]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await getCouponStats(code);
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
      alert('فشل تحميل الإحصائيات');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getUsageTypeLabel = (type: string) => {
    switch (type) {
      case 'parent_first': return 'الأب - أول استخدام';
      case 'parent_second': return 'الأب - ثاني استخدام';
      case 'child': return 'محال (ابن)';
      default: return type;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800">إحصائيات الكوبون: {code}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">جاري التحميل...</p>
          </div>
        ) : stats ? (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
                <p className="text-sm text-blue-600 mb-1">إجمالي الاستخدامات</p>
                <p className="text-2xl font-bold text-blue-900">{stats.totalUses} / {stats.maxUsesTotal ?? '∞'}</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
                <p className="text-sm text-green-600 mb-1">الاستخدامات المتبقية</p>
                <p className="text-2xl font-bold text-green-900">{stats.remainingUses}</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
                <p className="text-sm text-purple-600 mb-1">إجمالي الخصم</p>
                <p className="text-2xl font-bold text-purple-900">{stats.totalDiscount.toFixed(2)} ج</p>
              </div>
              <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl p-4">
                <p className="text-sm text-pink-600 mb-1">متوسط الخصم</p>
                <p className="text-2xl font-bold text-pink-900">
                  {stats.totalUses > 0 ? (stats.totalDiscount / stats.totalUses).toFixed(2) : 0} ج
                </p>
              </div>
            </div>

            {/* Usage Breakdown */}
            {stats.usageBreakdown && stats.usageBreakdown.length > 0 && (
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-bold text-gray-800 mb-3">توزيع الاستخدامات</h4>
                <div className="space-y-2">
                  {stats.usageBreakdown.map((item) => (
                    <div key={item.discount_type} className="flex items-center justify-between bg-white rounded-lg p-3">
                      <span className="font-medium">{getUsageTypeLabel(item.discount_type)}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600">{item.count} مرة</span>
                        <span className="font-bold text-pink-600">{item.total_discount?.toFixed(2) || 0} ج</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Usage History */}
            {stats.usageHistory && stats.usageHistory.length > 0 && (
              <div>
                <h4 className="font-bold text-gray-800 mb-3">سجل الاستخدامات</h4>
                <div className="bg-gray-50 rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-200">
                        <tr>
                          <th className="px-4 py-3 text-right text-sm font-semibold">التاريخ</th>
                          <th className="px-4 py-3 text-right text-sm font-semibold">العميل</th>
                          <th className="px-4 py-3 text-right text-sm font-semibold">الهاتف</th>
                          <th className="px-4 py-3 text-right text-sm font-semibold">النوع</th>
                          <th className="px-4 py-3 text-right text-sm font-semibold">الخصم</th>
                          <th className="px-4 py-3 text-right text-sm font-semibold">إجمالي الطلب</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {stats.usageHistory.map((usage) => (
                          <tr key={usage.id} className="bg-white hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm">{formatDate(usage.used_at)}</td>
                            <td className="px-4 py-3 text-sm">{usage.customer_name || '-'}</td>
                            <td className="px-4 py-3 text-sm font-mono">{usage.user_phone}</td>
                            <td className="px-4 py-3 text-sm">
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                                {getUsageTypeLabel(usage.usage_type)}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm font-bold text-pink-600">
                              {usage.discount_applied.toFixed(2)} ج
                            </td>
                            <td className="px-4 py-3 text-sm font-semibold">
                              {usage.order_total?.toFixed(2) || '-'} ج
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {(!stats.usageHistory || stats.usageHistory.length === 0) && (
              <div className="text-center py-8 text-gray-500">
                لا توجد استخدامات لهذا الكوبون بعد
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-red-600">
            فشل تحميل الإحصائيات
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatsModal;
