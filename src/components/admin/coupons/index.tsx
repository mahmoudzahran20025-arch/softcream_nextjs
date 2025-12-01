// src/components/admin/coupons/index.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Tag, Search, Truck, UserPlus, Users } from 'lucide-react';
import type { Coupon } from '@/lib/admin';
import { adminRealtime } from '@/lib/adminRealtime';
import type { CouponsPageProps } from './types';
import CouponCard from './CouponCard';
import CreateModal from './CreateModal';
import EditModal from './EditModal';
import StatsModal from './StatsModal';

type FilterType = 'all' | 'first_order' | 'registered' | 'general';
type StatusFilter = 'all' | 'active' | 'inactive';

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
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  useEffect(() => {
    adminRealtime().on('coupons', (newCoupons, hasChanged) => {
      if (hasChanged) {
        setCouponsState(newCoupons);
      }
    });
  }, []);

  // Stats
  const stats = useMemo(() => ({
    total: couponsState.length,
    active: couponsState.filter(c => c.active === 1).length,
    firstOrder: couponsState.filter(c => c.first_order_only === 1).length,
    registered: couponsState.filter(c => c.requires_registration === 1).length,
    freeDelivery: couponsState.filter(c => c.discount_type === 'free_delivery').length
  }), [couponsState]);

  // Filtered coupons
  const filteredCoupons = useMemo(() => {
    return couponsState.filter(coupon => {
      // Search filter
      const matchesSearch = !searchTerm || 
        coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        coupon.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Type filter
      const matchesType = filterType === 'all' ||
        (filterType === 'first_order' && coupon.first_order_only === 1) ||
        (filterType === 'registered' && coupon.requires_registration === 1) ||
        (filterType === 'general' && coupon.first_order_only !== 1 && coupon.requires_registration !== 1);
      
      // Status filter
      const matchesStatus = statusFilter === 'all' ||
        (statusFilter === 'active' && coupon.active === 1) ||
        (statusFilter === 'inactive' && coupon.active !== 1);
      
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [couponsState, searchTerm, filterType, statusFilter]);

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
        <h2 className="text-2xl font-bold text-gray-800">🎟️ إدارة الكوبونات</h2>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg shadow-lg flex items-center gap-2 hover:shadow-xl transition-all"
        >
          <Plus size={20} />
          <span>كوبون جديد</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border-r-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">إجمالي</p>
              <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
            </div>
            <Tag className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-sm border-r-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">نشطة</p>
              <p className="text-2xl font-bold text-gray-800">{stats.active}</p>
            </div>
            <span className="text-2xl">✅</span>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-sm border-r-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">أول طلب</p>
              <p className="text-2xl font-bold text-gray-800">{stats.firstOrder}</p>
            </div>
            <UserPlus className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-sm border-r-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">للمسجلين</p>
              <p className="text-2xl font-bold text-gray-800">{stats.registered}</p>
            </div>
            <Users className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-sm border-r-4 border-cyan-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">توصيل مجاني</p>
              <p className="text-2xl font-bold text-gray-800">{stats.freeDelivery}</p>
            </div>
            <Truck className="w-8 h-8 text-cyan-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Search */}
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="بحث بالكود أو الاسم..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 pl-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>
          
          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as FilterType)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
          >
            <option value="all">كل الأنواع</option>
            <option value="first_order">🎯 للطلب الأول</option>
            <option value="registered">🔐 للمسجلين</option>
            <option value="general">🌟 عام</option>
          </select>
          
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
          >
            <option value="all">كل الحالات</option>
            <option value="active">✅ نشطة</option>
            <option value="inactive">⏸️ معطلة</option>
          </select>
        </div>
      </div>

      {/* Coupons Grid */}
      {filteredCoupons.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
          <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">
            {couponsState.length === 0 ? 'لا توجد كوبونات' : 'لا توجد نتائج للبحث'}
          </p>
          {couponsState.length === 0 && (
            <button 
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-semibold"
            >
              إنشاء أول كوبون
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCoupons.map((coupon) => (
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
