// src/components/admin/coupons/CouponCard.tsx
'use client';

import React from 'react';
import { Tag, Edit2, Trash2, BarChart3 } from 'lucide-react';
import type { CouponCardProps } from './types';

const CouponCard: React.FC<CouponCardProps> = ({ 
  coupon, 
  onToggle, 
  onEdit, 
  onDelete, 
  onViewStats 
}) => {
  const usagePercent = (coupon.current_uses / coupon.max_uses) * 100;

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
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
          />
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
          onClick={() => onViewStats(coupon.code)}
          className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
          title="إحصائيات"
        >
          <BarChart3 size={16} />
        </button>
        <button 
          onClick={() => onEdit(coupon)}
          className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
        >
          <Edit2 size={16} className="inline mr-1" />
          تعديل
        </button>
        <button 
          onClick={() => {
            if (window.confirm(`هل أنت متأكد من حذف الكوبون "${coupon.code}"؟`)) {
              onDelete(coupon.code);
            }
          }}
          className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};

export default CouponCard;
