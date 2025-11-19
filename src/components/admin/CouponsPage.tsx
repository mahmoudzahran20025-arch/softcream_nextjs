// src/components/admin/CouponsPage.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Tag, Edit2, Trash2, X, BarChart3 } from 'lucide-react';
import type { Coupon } from '@/lib/adminApi';
import { adminRealtime } from '@/lib/adminRealtime';
import { getCouponStats } from '@/lib/adminApi';

interface CouponsPageProps {
  coupons: Coupon[];
  onCreate: (data: any) => Promise<boolean>;
  onToggle: (code: string) => Promise<void>;
  onUpdate: (code: string, data: any) => Promise<boolean>;
  onDelete: (code: string) => Promise<boolean>;
}

const CouponsPage: React.FC<CouponsPageProps> = ({ coupons, onCreate, onToggle, onUpdate, onDelete }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [statsCode, setStatsCode] = useState<string | null>(null);
  const [couponsState, setCouponsState] = useState(coupons);

  useEffect(() => {
    // Listen for real-time updates
    adminRealtime().on('coupons', (newCoupons, hasChanged) => {
      if (hasChanged) {
        setCouponsState(newCoupons);
      }
    });

    return () => {
      // Cleanup handled by adminRealtime
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">إدارة الكوبونات</h2>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg shadow-lg flex items-center gap-2 hover:shadow-xl transition-all"
        >
          <Plus size={20} />
          <span>كوبون جديد</span>
        </button>
      </div>

      {/* Coupons Grid */}
      {couponsState.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
          <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">لا توجد كوبونات</p>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-semibold"
          >
            إنشاء أول كوبون
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {couponsState.map((coupon) => {
            const usagePercent = (coupon.current_uses / coupon.max_uses) * 100;
            
            return (
              <div key={coupon.code} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Tag className="text-pink-600" size={20} />
                    <h3 className="font-bold text-lg">{coupon.code}</h3>
                  </div>
                  <button
                    onClick={() => onToggle(coupon.code)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                      coupon.active 
                        ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {coupon.active ? 'نشط' : 'معطل'}
                  </button>
                </div>
                
                <p className="text-sm text-gray-600 mb-4">{coupon.name}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">الخصم:</span>
                    <span className="font-bold text-pink-600">{coupon.discount_percent}%</span>
                  </div>
                  {coupon.discount_percent_child && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">خصم الإحالة:</span>
                      <span className="font-bold text-purple-600">{coupon.discount_percent_child}%</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">الاستخدامات:</span>
                    <span className="font-semibold">{coupon.current_uses} / {coupon.max_uses}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-pink-500 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(usagePercent, 100)}%` }}
                    ></div>
                  </div>
                  {coupon.min_order > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">الحد الأدنى:</span>
                      <span className="font-semibold">{coupon.min_order} ج</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      setStatsCode(coupon.code);
                      setShowStatsModal(true);
                    }}
                    className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                    title="إحصائيات"
                  >
                    <BarChart3 size={16} />
                  </button>
                  <button 
                    onClick={() => {
                      setEditingCoupon(coupon);
                      setShowEditModal(true);
                    }}
                    className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
                  >
                    <Edit2 size={16} className="inline mr-1" />
                    تعديل
                  </button>
                  <button 
                    onClick={async () => {
                      if (window.confirm(`هل أنت متأكد من حذف الكوبون "${coupon.code}"؟`)) {
                        await onDelete(coupon.code);
                      }
                    }}
                    className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Coupon Modal */}
      {showCreateModal && (
        <CreateCouponModal 
          onClose={() => setShowCreateModal(false)}
          onCreate={onCreate}
        />
      )}

      {/* Edit Coupon Modal */}
      {showEditModal && editingCoupon && (
        <EditCouponModal 
          coupon={editingCoupon}
          onClose={() => {
            setShowEditModal(false);
            setEditingCoupon(null);
          }}
          onUpdate={onUpdate}
        />
      )}

      {/* Stats Modal */}
      {showStatsModal && statsCode && (
        <CouponStatsModal 
          code={statsCode}
          onClose={() => {
            setShowStatsModal(false);
            setStatsCode(null);
          }}
        />
      )}
    </div>
  );
};

// Coupon Stats Modal Component
interface CouponStatsModalProps {
  code: string;
  onClose: () => void;
}

const CouponStatsModal: React.FC<CouponStatsModalProps> = ({ code, onClose }) => {
  const [stats, setStats] = useState<any>(null);
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
            <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">جاري التحميل...</p>
          </div>
        ) : stats ? (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
                <p className="text-sm text-blue-600 mb-1">إجمالي الاستخدامات</p>
                <p className="text-2xl font-bold text-blue-900">{stats.totalUses} / {stats.maxUses}</p>
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
                  {stats.usageBreakdown.map((item: any) => (
                    <div key={item.usage_type} className="flex items-center justify-between bg-white rounded-lg p-3">
                      <span className="font-medium">{getUsageTypeLabel(item.usage_type)}</span>
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
                        {stats.usageHistory.map((usage: any) => (
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

// Create Coupon Modal Component
interface CreateCouponModalProps {
  onClose: () => void;
  onCreate: (data: any) => Promise<boolean>;
}

const CreateCouponModal: React.FC<CreateCouponModalProps> = ({ onClose, onCreate }) => {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    discountPercent: 50,
    discountPercentChild: 35,
    discountPercentSecond: 25,
    maxUses: 10,
    validDays: 7,
    minOrder: 0,
    active: true,
    messageAr: '',
    messageEn: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const success = await onCreate(formData);
    
    setIsSubmitting(false);
    
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800">إنشاء كوبون جديد</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="font-bold text-gray-800 mb-4">المعلومات الأساسية</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  كود الكوبون * <span className="text-xs text-gray-500">(3-20 حرف/رقم)</span>
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                  placeholder="SUMMER50"
                  pattern="[A-Z0-9]{3,20}"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">اسم الكوبون *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="خصم الصيف"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Discount Percentages */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="font-bold text-gray-800 mb-4">نسب الخصم</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  خصم الاستخدام الأول * <span className="text-xs text-gray-500">(1-100%)</span>
                </label>
                <input
                  type="number"
                  value={formData.discountPercent}
                  onChange={(e) => setFormData({...formData, discountPercent: parseInt(e.target.value)})}
                  min="1"
                  max="100"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">للأب - أول مرة</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  خصم الإحالة <span className="text-xs text-gray-500">(0-100%)</span>
                </label>
                <input
                  type="number"
                  value={formData.discountPercentChild}
                  onChange={(e) => setFormData({...formData, discountPercentChild: parseInt(e.target.value)})}
                  min="0"
                  max="100"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
                <p className="text-xs text-gray-500 mt-1">للمحالين (الأبناء)</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  خصم ثاني استخدام <span className="text-xs text-gray-500">(0-100%)</span>
                </label>
                <input
                  type="number"
                  value={formData.discountPercentSecond}
                  onChange={(e) => setFormData({...formData, discountPercentSecond: parseInt(e.target.value)})}
                  min="0"
                  max="100"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
                <p className="text-xs text-gray-500 mt-1">للأب - ثاني مرة</p>
              </div>
            </div>
          </div>

          {/* Usage Settings */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="font-bold text-gray-800 mb-4">إعدادات الاستخدام</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">عدد الاستخدامات *</label>
                <input
                  type="number"
                  value={formData.maxUses}
                  onChange={(e) => setFormData({...formData, maxUses: parseInt(e.target.value)})}
                  min="1"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">إجمالي عدد المرات</p>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">مدة الصلاحية *</label>
                <input
                  type="number"
                  value={formData.validDays}
                  onChange={(e) => setFormData({...formData, validDays: parseInt(e.target.value)})}
                  min="1"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">بالأيام من الآن</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">الحد الأدنى للطلب</label>
                <input
                  type="number"
                  value={formData.minOrder}
                  onChange={(e) => setFormData({...formData, minOrder: parseInt(e.target.value)})}
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
                <p className="text-xs text-gray-500 mt-1">بالجنيه (0 = بدون حد)</p>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="font-bold text-gray-800 mb-4">الحالة</h4>
            <div className="flex items-center gap-3">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => setFormData({...formData, active: e.target.checked})}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
              </label>
              <span className="text-sm font-medium text-gray-700">
                {formData.active ? '✅ نشط (يمكن استخدامه فوراً)' : '⏸️ معطل (لن يعمل حتى التفعيل)'}
              </span>
            </div>
          </div>

          {/* Messages */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="font-bold text-gray-800 mb-4">الرسائل الترحيبية</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">رسالة عربية</label>
                <textarea
                  value={formData.messageAr}
                  onChange={(e) => setFormData({...formData, messageAr: e.target.value})}
                  placeholder="🎉 مرحباً بك! خصم خاص لك"
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
                <p className="text-xs text-gray-500 mt-1">تظهر للعميل عند تطبيق الكوبون</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">رسالة إنجليزية</label>
                <textarea
                  value={formData.messageEn}
                  onChange={(e) => setFormData({...formData, messageEn: e.target.value})}
                  placeholder="🎉 Welcome! Special discount for you"
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
                <p className="text-xs text-gray-500 mt-1">للعملاء الذين يستخدمون اللغة الإنجليزية</p>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-2 pt-4 border-t">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'جاري الإنشاء...' : '✨ إنشاء الكوبون'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold transition-colors"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Edit Coupon Modal Component
interface EditCouponModalProps {
  coupon: Coupon;
  onClose: () => void;
  onUpdate: (code: string, data: any) => Promise<boolean>;
}

const EditCouponModal: React.FC<EditCouponModalProps> = ({ coupon, onClose, onUpdate }) => {
  // Calculate valid_days from valid_from and valid_to
  const calculateValidDays = () => {
    const diffMs = coupon.valid_to - coupon.valid_from;
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  };

  // Format dates for display
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const [formData, setFormData] = useState({
    name: coupon.name,
    discountPercent: coupon.discount_percent,
    discountPercentChild: coupon.discount_percent_child || 35,
    discountPercentSecond: coupon.discount_percent_parent_second || 25,
    maxUses: coupon.max_uses,
    validDays: calculateValidDays(),
    minOrder: coupon.min_order || 0,
    messageAr: coupon.message_ar || '',
    messageEn: coupon.message_en || ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const success = await onUpdate(coupon.code, formData);
    
    setIsSubmitting(false);
    
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800">تعديل كوبون: {coupon.code}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Coupon Info (Read-only) */}
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <h4 className="font-bold text-blue-800 mb-3">معلومات الكوبون</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">كود الكوبون</label>
                <input
                  type="text"
                  value={coupon.code}
                  disabled
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-600 font-mono"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">الاستخدامات الحالية</label>
                <input
                  type="text"
                  value={`${coupon.current_uses} / ${coupon.max_uses}`}
                  disabled
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">تاريخ البداية</label>
                <input
                  type="text"
                  value={formatDate(coupon.valid_from)}
                  disabled
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-600 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">تاريخ النهاية</label>
                <input
                  type="text"
                  value={formatDate(coupon.valid_to)}
                  disabled
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-600 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Basic Info */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="font-bold text-gray-800 mb-4">المعلومات الأساسية</h4>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">اسم الكوبون *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="خصم الصيف"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                required
              />
            </div>
          </div>

          {/* Discount Percentages */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="font-bold text-gray-800 mb-4">نسب الخصم</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  خصم الاستخدام الأول * <span className="text-xs text-gray-500">(1-100%)</span>
                </label>
                <input
                  type="number"
                  value={formData.discountPercent}
                  onChange={(e) => setFormData({...formData, discountPercent: parseInt(e.target.value)})}
                  min="1"
                  max="100"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">للأب - أول مرة</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  خصم الإحالة <span className="text-xs text-gray-500">(0-100%)</span>
                </label>
                <input
                  type="number"
                  value={formData.discountPercentChild}
                  onChange={(e) => setFormData({...formData, discountPercentChild: parseInt(e.target.value)})}
                  min="0"
                  max="100"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
                <p className="text-xs text-gray-500 mt-1">للمحالين (الأبناء)</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  خصم ثاني استخدام <span className="text-xs text-gray-500">(0-100%)</span>
                </label>
                <input
                  type="number"
                  value={formData.discountPercentSecond}
                  onChange={(e) => setFormData({...formData, discountPercentSecond: parseInt(e.target.value)})}
                  min="0"
                  max="100"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
                <p className="text-xs text-gray-500 mt-1">للأب - ثاني مرة</p>
              </div>
            </div>
          </div>

          {/* Usage Settings */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="font-bold text-gray-800 mb-4">إعدادات الاستخدام</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">عدد الاستخدامات *</label>
                <input
                  type="number"
                  value={formData.maxUses}
                  onChange={(e) => setFormData({...formData, maxUses: parseInt(e.target.value)})}
                  min="1"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">إجمالي عدد المرات</p>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">مدة الصلاحية *</label>
                <input
                  type="number"
                  value={formData.validDays}
                  onChange={(e) => setFormData({...formData, validDays: parseInt(e.target.value)})}
                  min="1"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">بالأيام من تاريخ البداية</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">الحد الأدنى للطلب</label>
                <input
                  type="number"
                  value={formData.minOrder}
                  onChange={(e) => setFormData({...formData, minOrder: parseInt(e.target.value)})}
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
                <p className="text-xs text-gray-500 mt-1">بالجنيه (0 = بدون حد)</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="font-bold text-gray-800 mb-4">الرسائل الترحيبية</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">رسالة عربية</label>
                <textarea
                  value={formData.messageAr}
                  onChange={(e) => setFormData({...formData, messageAr: e.target.value})}
                  placeholder="🎉 مرحباً بك! خصم خاص لك"
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
                <p className="text-xs text-gray-500 mt-1">تظهر للعميل عند تطبيق الكوبون</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">رسالة إنجليزية</label>
                <textarea
                  value={formData.messageEn}
                  onChange={(e) => setFormData({...formData, messageEn: e.target.value})}
                  placeholder="🎉 Welcome! Special discount for you"
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
                <p className="text-xs text-gray-500 mt-1">للعملاء الذين يستخدمون اللغة الإنجليزية</p>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-2 pt-4 border-t">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'جاري التحديث...' : '💾 تحديث الكوبون'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold transition-colors"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CouponsPage;