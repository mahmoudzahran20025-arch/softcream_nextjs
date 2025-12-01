// src/components/admin/coupons/EditModal.tsx
'use client';

import React, { useState } from 'react';
import { X, Percent, DollarSign, Truck, Gift, Users, UserPlus } from 'lucide-react';
import type { EditCouponModalProps, CouponFormData, DiscountType, RestrictionType } from './types';
import { DISCOUNT_TYPE_LABELS, TELECOM_PREFIXES } from './types';

const EditModal: React.FC<EditCouponModalProps> = ({ coupon, onClose, onUpdate }) => {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Parse restricted prefixes from JSON string
  const parsePrefixes = (): string[] => {
    if (!coupon.restricted_prefixes) return [];
    try {
      return JSON.parse(coupon.restricted_prefixes);
    } catch {
      return [];
    }
  };

  const [formData, setFormData] = useState<CouponFormData>({
    name: coupon.name,
    discountType: (coupon.discount_type || 'percent') as DiscountType,
    discountValue: coupon.discount_value || coupon.discount_percent || 0,
    maxDiscount: coupon.max_discount || null,
    maxUsesTotal: coupon.max_uses_total || coupon.max_uses || null,
    maxUsesPerUser: coupon.max_uses_per_user || 1,
    minOrder: coupon.min_order || 0,
    validDays: 7,
    firstOrderOnly: coupon.first_order_only === 1,
    requiresRegistration: coupon.requires_registration === 1,
    restrictionType: (coupon.restriction_type || 'none') as RestrictionType,
    restrictedPrefixes: parsePrefixes(),
    restrictedCompany: coupon.restricted_company || '',
    restrictedPhone: coupon.restricted_phone || '',
    active: coupon.active === 1,
    messageAr: coupon.message_ar || '',
    messageEn: coupon.message_en || '',
    successMessageAr: coupon.success_message_ar || '',
    successMessageEn: coupon.success_message_en || ''
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

  const discountTypeIcons: Record<DiscountType, React.ReactNode> = {
    percent: <Percent size={20} />,
    fixed_amount: <DollarSign size={20} />,
    free_delivery: <Truck size={20} />,
    free_item: <Gift size={20} />
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800">✏️ تعديل كوبون: {coupon.code}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Coupon Info (Read-only) */}
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <h4 className="font-bold text-blue-800 mb-3">📋 معلومات الكوبون</h4>
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
                  value={`${coupon.current_uses || 0} / ${coupon.max_uses_total || coupon.max_uses || '∞'}`}
                  disabled
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">تاريخ البداية</label>
                <input
                  type="text"
                  value={coupon.valid_from ? formatDate(coupon.valid_from) : '-'}
                  disabled
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-600 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">تاريخ النهاية</label>
                <input
                  type="text"
                  value={coupon.valid_to ? formatDate(coupon.valid_to) : '-'}
                  disabled
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-600 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Basic Info */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="font-bold text-gray-800 mb-4">📝 المعلومات الأساسية</h4>
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

          {/* Discount Type */}
          <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-4">
            <h4 className="font-bold text-gray-800 mb-4">💰 نوع الخصم</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {(Object.keys(DISCOUNT_TYPE_LABELS) as DiscountType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData({...formData, discountType: type, discountValue: type === 'free_delivery' ? 0 : formData.discountValue})}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    formData.discountType === type
                      ? 'border-pink-500 bg-pink-100 text-pink-700'
                      : 'border-gray-200 bg-white hover:border-pink-300'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    {discountTypeIcons[type]}
                    <span className="text-sm font-medium">{DISCOUNT_TYPE_LABELS[type].ar}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Discount Value */}
            {formData.discountType !== 'free_delivery' && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {formData.discountType === 'percent' ? 'نسبة الخصم (%)' : 'قيمة الخصم (ج.م)'}
                  </label>
                  <input
                    type="number"
                    value={formData.discountValue}
                    onChange={(e) => setFormData({...formData, discountValue: parseFloat(e.target.value) || 0})}
                    min={formData.discountType === 'percent' ? 1 : 0}
                    max={formData.discountType === 'percent' ? 100 : 10000}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    required
                  />
                </div>

                {formData.discountType === 'percent' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      الحد الأقصى للخصم (ج.م)
                    </label>
                    <input
                      type="number"
                      value={formData.maxDiscount || ''}
                      onChange={(e) => setFormData({...formData, maxDiscount: e.target.value ? parseFloat(e.target.value) : null})}
                      min={0}
                      placeholder="بدون حد"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">اتركه فارغاً لعدم وضع حد</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User Restrictions */}
          <div className="bg-blue-50 rounded-xl p-4">
            <h4 className="font-bold text-gray-800 mb-4">👥 قيود المستخدمين</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                formData.firstOrderOnly ? 'border-blue-500 bg-blue-100' : 'border-gray-200 bg-white'
              }`}>
                <input
                  type="checkbox"
                  checked={formData.firstOrderOnly}
                  onChange={(e) => setFormData({...formData, firstOrderOnly: e.target.checked})}
                  className="w-5 h-5 text-blue-600 rounded"
                />
                <div className="flex items-center gap-2">
                  <UserPlus size={20} className="text-blue-600" />
                  <div>
                    <p className="font-semibold">لأول طلب فقط</p>
                    <p className="text-xs text-gray-500">يعمل فقط للعملاء الجدد</p>
                  </div>
                </div>
              </label>

              <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                formData.requiresRegistration ? 'border-purple-500 bg-purple-100' : 'border-gray-200 bg-white'
              }`}>
                <input
                  type="checkbox"
                  checked={formData.requiresRegistration}
                  onChange={(e) => setFormData({...formData, requiresRegistration: e.target.checked})}
                  className="w-5 h-5 text-purple-600 rounded"
                />
                <div className="flex items-center gap-2">
                  <Users size={20} className="text-purple-600" />
                  <div>
                    <p className="font-semibold">للمسجلين فقط</p>
                    <p className="text-xs text-gray-500">يتطلب طلب سابق</p>
                  </div>
                </div>
              </label>
            </div>
          </div>


          {/* Usage Settings */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="font-bold text-gray-800 mb-4">⚙️ إعدادات الاستخدام</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">إجمالي الاستخدامات</label>
                <input
                  type="number"
                  value={formData.maxUsesTotal || ''}
                  onChange={(e) => setFormData({...formData, maxUsesTotal: e.target.value ? parseInt(e.target.value) : null})}
                  min={1}
                  placeholder="غير محدود"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">لكل مستخدم</label>
                <input
                  type="number"
                  value={formData.maxUsesPerUser}
                  onChange={(e) => setFormData({...formData, maxUsesPerUser: parseInt(e.target.value) || 1})}
                  min={1}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">الحد الأدنى (ج.م)</label>
                <input
                  type="number"
                  value={formData.minOrder}
                  onChange={(e) => setFormData({...formData, minOrder: parseFloat(e.target.value) || 0})}
                  min={0}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">تمديد الصلاحية (أيام)</label>
                <input
                  type="number"
                  value={formData.validDays}
                  onChange={(e) => setFormData({...formData, validDays: parseInt(e.target.value) || 7})}
                  min={0}
                  placeholder="0 = بدون تمديد"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
                <p className="text-xs text-gray-500 mt-1">0 = بدون تغيير</p>
              </div>
            </div>
          </div>

          {/* Phone Restrictions */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="font-bold text-gray-800 mb-4">📱 قيود الأرقام</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">نوع القيد</label>
                <select
                  value={formData.restrictionType}
                  onChange={(e) => setFormData({...formData, restrictionType: e.target.value as RestrictionType})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                  <option value="none">للجميع (بدون قيود)</option>
                  <option value="prefix">شركة اتصالات محددة</option>
                  <option value="phone">رقم تليفون محدد</option>
                </select>
              </div>

              {formData.restrictionType === 'prefix' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">اختر الشركات</label>
                  <div className="flex flex-wrap gap-2">
                    {TELECOM_PREFIXES.map((prefix) => (
                      <label key={prefix.value} className={`px-3 py-2 rounded-lg border cursor-pointer transition-all ${
                        formData.restrictedPrefixes?.includes(prefix.value)
                          ? 'border-pink-500 bg-pink-100 text-pink-700'
                          : 'border-gray-200 bg-white hover:border-pink-300'
                      }`}>
                        <input
                          type="checkbox"
                          checked={formData.restrictedPrefixes?.includes(prefix.value)}
                          onChange={(e) => {
                            const prefixes = formData.restrictedPrefixes || [];
                            if (e.target.checked) {
                              setFormData({...formData, restrictedPrefixes: [...prefixes, prefix.value]});
                            } else {
                              setFormData({...formData, restrictedPrefixes: prefixes.filter(p => p !== prefix.value)});
                            }
                          }}
                          className="sr-only"
                        />
                        {prefix.label}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {formData.restrictionType === 'phone' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">رقم التليفون</label>
                  <input
                    type="tel"
                    value={formData.restrictedPhone || ''}
                    onChange={(e) => setFormData({...formData, restrictedPhone: e.target.value})}
                    placeholder="01012345678"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Status */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-gray-800">الحالة</h4>
                <p className="text-sm text-gray-500">
                  {formData.active ? '✅ نشط - يمكن استخدامه' : '⏸️ معطل - لن يعمل'}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => setFormData({...formData, active: e.target.checked})}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-500" />
              </label>
            </div>
          </div>

          {/* Messages */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="font-bold text-gray-800 mb-4">💬 الرسائل</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">رسالة النجاح (عربي)</label>
                <textarea
                  value={formData.successMessageAr || ''}
                  onChange={(e) => setFormData({...formData, successMessageAr: e.target.value})}
                  placeholder="🎉 تم تطبيق الخصم بنجاح!"
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">رسالة النجاح (إنجليزي)</label>
                <textarea
                  value={formData.successMessageEn || ''}
                  onChange={(e) => setFormData({...formData, successMessageEn: e.target.value})}
                  placeholder="🎉 Discount applied successfully!"
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
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
