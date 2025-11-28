// src/components/admin/coupons/EditModal.tsx
'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { EditCouponModalProps, CouponFormData } from './types';

const EditModal: React.FC<EditCouponModalProps> = ({ coupon, onClose, onUpdate }) => {
  // Calculate valid_days from valid_from and valid_to
  const calculateValidDays = () => {
    const diffMs = coupon.valid_to - coupon.valid_from;
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
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

  const [formData, setFormData] = useState<CouponFormData>({
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

export default EditModal;
