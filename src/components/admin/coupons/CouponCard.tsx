// src/components/admin/coupons/CouponCard.tsx
'use client';

import React from 'react';
import { Tag, Edit2, Trash2, BarChart3, Percent, DollarSign, Truck, Gift, UserPlus, Users } from 'lucide-react';
import type { CouponCardProps, DiscountType } from './types';

const CouponCard: React.FC<CouponCardProps> = ({ 
  coupon, 
  onToggle, 
  onEdit, 
  onDelete, 
  onViewStats 
}) => {
  const discountType = (coupon.discount_type || 'percent') as DiscountType;
  const discountValue = coupon.discount_value || coupon.discount_percent || 0;
  const maxUses = coupon.max_uses_total || coupon.max_uses || 0;
  const currentUses = coupon.current_uses || 0;
  const usagePercent = maxUses > 0 ? (currentUses / maxUses) * 100 : 0;

  const discountTypeIcons: Record<DiscountType, React.ReactNode> = {
    percent: <Percent size={16} className="text-pink-600" />,
    fixed_amount: <DollarSign size={16} className="text-green-600" />,
    free_delivery: <Truck size={16} className="text-blue-600" />,
    free_item: <Gift size={16} className="text-purple-600" />
  };

  const getDiscountDisplay = () => {
    switch (discountType) {
      case 'percent':
        return `${discountValue}%`;
      case 'fixed_amount':
        return `${discountValue} ج.م`;
      case 'free_delivery':
        return 'توصيل مجاني';
      case 'free_item':
        return 'منتج مجاني';
      default:
        return `${discountValue}%`;
    }
  };

  const getDiscountColor = () => {
    switch (discountType) {
      case 'percent': return 'text-pink-600 bg-pink-50';
      case 'fixed_amount': return 'text-green-600 bg-green-50';
      case 'free_delivery': return 'text-blue-600 bg-blue-50';
      case 'free_item': return 'text-purple-600 bg-purple-50';
      default: return 'text-pink-600 bg-pink-50';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all overflow-hidden">
      {/* Header with gradient based on type */}
      <div className={`p-4 ${
        discountType === 'free_delivery' ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
        discountType === 'free_item' ? 'bg-gradient-to-r from-purple-500 to-pink-500' :
        discountType === 'fixed_amount' ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
        'bg-gradient-to-r from-pink-500 to-purple-600'
      } text-white`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tag size={20} />
            <h3 className="font-bold text-lg font-mono">{coupon.code}</h3>
          </div>
          <button
            onClick={() => onToggle(coupon.code)}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
              coupon.active 
                ? 'bg-white/20 text-white hover:bg-white/30' 
                : 'bg-black/20 text-white/80 hover:bg-black/30'
            }`}
          >
            {coupon.active ? '✅ نشط' : '⏸️ معطل'}
          </button>
        </div>
        <p className="text-white/80 text-sm mt-1">{coupon.name}</p>
      </div>

      {/* Body */}
      <div className="p-4 space-y-4">
        {/* Discount Badge */}
        <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg ${getDiscountColor()}`}>
          {discountTypeIcons[discountType]}
          <span className="font-bold text-lg">{getDiscountDisplay()}</span>
          {coupon.max_discount && discountType === 'percent' && (
            <span className="text-xs opacity-70">(حد أقصى {coupon.max_discount} ج.م)</span>
          )}
        </div>

        {/* User Restrictions Badges */}
        <div className="flex flex-wrap gap-2">
          {coupon.first_order_only === 1 && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
              <UserPlus size={12} />
              أول طلب فقط
            </span>
          )}
          {coupon.requires_registration === 1 && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
              <Users size={12} />
              للمسجلين
            </span>
          )}
          {coupon.restriction_type && coupon.restriction_type !== 'none' && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
              📱 {coupon.restriction_type === 'prefix' ? 'شركة محددة' : 'رقم محدد'}
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">الاستخدامات:</span>
            <span className="font-semibold">
              {currentUses} / {maxUses > 0 ? maxUses : '∞'}
            </span>
          </div>
          {maxUses > 0 && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all ${
                  usagePercent >= 90 ? 'bg-red-500' :
                  usagePercent >= 70 ? 'bg-yellow-500' :
                  'bg-green-500'
                }`}
                style={{ width: `${Math.min(usagePercent, 100)}%` }}
              />
            </div>
          )}
          
          {coupon.min_order > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">الحد الأدنى:</span>
              <span className="font-semibold">{coupon.min_order} ج.م</span>
            </div>
          )}

          <div className="flex justify-between text-sm">
            <span className="text-gray-600">لكل مستخدم:</span>
            <span className="font-semibold">{coupon.max_uses_per_user || 1} مرة</span>
          </div>
        </div>

        {/* Validity */}
        <div className="text-xs text-gray-500 pt-2 border-t">
          <div className="flex justify-between">
            <span>صالح حتى:</span>
            <span>{coupon.valid_to ? new Date(coupon.valid_to).toLocaleDateString('ar-EG') : '-'}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 bg-gray-50 border-t flex gap-2">
        <button 
          onClick={() => onViewStats(coupon.code)}
          className="px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-colors"
          title="إحصائيات"
        >
          <BarChart3 size={16} />
        </button>
        <button 
          onClick={() => onEdit(coupon)}
          className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1"
        >
          <Edit2 size={16} />
          تعديل
        </button>
        <button 
          onClick={() => {
            if (window.confirm(`هل أنت متأكد من حذف الكوبون "${coupon.code}"؟`)) {
              onDelete(coupon.code);
            }
          }}
          className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};

export default CouponCard;
