// src/components/admin/CouponsPage.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Tag, Edit2, Trash2, X } from 'lucide-react';
import type { Coupon } from '@/lib/adminApi';
import { adminRealtime } from '@/lib/adminRealtime';

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
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
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
      <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800">إنشاء كوبون جديد</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">كود الكوبون *</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                placeholder="SUMMER50"
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">خصم الاستخدام الأول (%)</label>
              <input
                type="number"
                value={formData.discountPercent}
                onChange={(e) => setFormData({...formData, discountPercent: parseInt(e.target.value)})}
                min="1"
                max="100"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">خصم الإحالة (%)</label>
              <input
                type="number"
                value={formData.discountPercentChild}
                onChange={(e) => setFormData({...formData, discountPercentChild: parseInt(e.target.value)})}
                min="0"
                max="100"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">خصم ثاني استخدام (%)</label>
              <input
                type="number"
                value={formData.discountPercentSecond}
                onChange={(e) => setFormData({...formData, discountPercentSecond: parseInt(e.target.value)})}
                min="0"
                max="100"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">عدد الاستخدامات</label>
              <input
                type="number"
                value={formData.maxUses}
                onChange={(e) => setFormData({...formData, maxUses: parseInt(e.target.value)})}
                min="1"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">مدة الصلاحية (أيام)</label>
              <input
                type="number"
                value={formData.validDays}
                onChange={(e) => setFormData({...formData, validDays: parseInt(e.target.value)})}
                min="1"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">الحد الأدنى (ج)</label>
              <input
                type="number"
                value={formData.minOrder}
                onChange={(e) => setFormData({...formData, minOrder: parseInt(e.target.value)})}
                min="0"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">رسالة (عربي)</label>
            <textarea
              value={formData.messageAr}
              onChange={(e) => setFormData({...formData, messageAr: e.target.value})}
              placeholder="🎉 مرحباً بك! خصم خاص لك"
              rows={2}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'جاري الإنشاء...' : 'إنشاء الكوبون'}
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
  const [formData, setFormData] = useState({
    name: coupon.name,
    discountPercent: coupon.discount_percent,
    discountPercentChild: coupon.discount_percent_child || 35,
    discountPercentSecond: coupon.discount_percent_second || 25,
    maxUses: coupon.max_uses,
    validDays: coupon.valid_days,
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
      <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800">تعديل كوبون: {coupon.code}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">كود الكوبون</label>
            <input
              type="text"
              value={coupon.code}
              disabled
              className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">خصم الاستخدام الأول (%)</label>
              <input
                type="number"
                value={formData.discountPercent}
                onChange={(e) => setFormData({...formData, discountPercent: parseInt(e.target.value)})}
                min="1"
                max="100"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">خصم الإحالة (%)</label>
              <input
                type="number"
                value={formData.discountPercentChild}
                onChange={(e) => setFormData({...formData, discountPercentChild: parseInt(e.target.value)})}
                min="0"
                max="100"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">خصم ثاني استخدام (%)</label>
              <input
                type="number"
                value={formData.discountPercentSecond}
                onChange={(e) => setFormData({...formData, discountPercentSecond: parseInt(e.target.value)})}
                min="0"
                max="100"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">عدد الاستخدامات</label>
              <input
                type="number"
                value={formData.maxUses}
                onChange={(e) => setFormData({...formData, maxUses: parseInt(e.target.value)})}
                min="1"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">مدة الصلاحية (أيام)</label>
              <input
                type="number"
                value={formData.validDays}
                onChange={(e) => setFormData({...formData, validDays: parseInt(e.target.value)})}
                min="1"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">الحد الأدنى (ج)</label>
              <input
                type="number"
                value={formData.minOrder}
                onChange={(e) => setFormData({...formData, minOrder: parseInt(e.target.value)})}
                min="0"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">رسالة (عربي)</label>
            <textarea
              value={formData.messageAr}
              onChange={(e) => setFormData({...formData, messageAr: e.target.value})}
              placeholder="🎉 مرحباً بك! خصم خاص لك"
              rows={2}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'جاري التحديث...' : 'تحديث الكوبون'}
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