// src/components/admin/coupons/index.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Tag } from 'lucide-react';
import type { Coupon } from '@/lib/adminApi';
import { adminRealtime } from '@/lib/adminRealtime';
import type { CouponsPageProps } from './types';
import CouponCard from './CouponCard';
import CreateModal from './CreateModal';
import EditModal from './EditModal';
import StatsModal from './StatsModal';

const CouponsPage: React.FC<CouponsPageProps> = ({ 
  coupons, 
  onCreate, 
  onToggle, 
  onUpdate, 
  onDelete 
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [statsCode, setStatsCode] = useState<string | null>(null);
  const [couponsState, setCouponsState] = useState(coupons);

  useEffect(() => {
    adminRealtime().on('coupons', (newCoupons, hasChanged) => {
      if (hasChanged) {
        setCouponsState(newCoupons);
      }
    });
  }, []);

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setShowEditModal(true);
  };

  const handleViewStats = (code: string) => {
    setStatsCode(code);
    setShowStatsModal(true);
  };

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
          {couponsState.map((coupon) => (
            <CouponCard
              key={coupon.code}
              coupon={coupon}
              onToggle={onToggle}
              onEdit={handleEdit}
              onDelete={onDelete}
              onViewStats={handleViewStats}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <CreateModal 
          onClose={() => setShowCreateModal(false)}
          onCreate={onCreate}
        />
      )}

      {showEditModal && editingCoupon && (
        <EditModal 
          coupon={editingCoupon}
          onClose={() => {
            setShowEditModal(false);
            setEditingCoupon(null);
          }}
          onUpdate={onUpdate}
        />
      )}

      {showStatsModal && statsCode && (
        <StatsModal 
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

export default CouponsPage;
