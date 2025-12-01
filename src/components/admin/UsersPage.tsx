// src/components/admin/UsersPage.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  getUsers, 
  getUserDetails, 
  getUsersStats, 
  updateUser, 
  addLoyaltyPoints,
  type User,
  type UsersStatsResponse
} from '@/lib/admin';

// ==========================================
// Types
// ==========================================

interface UsersPageProps {
  onRefresh?: () => void;
}

// ==========================================
// Tier Badge Component
// ==========================================

const TierBadge: React.FC<{ tier: string }> = ({ tier }) => {
  const colors: Record<string, string> = {
    bronze: 'bg-amber-100 text-amber-800',
    silver: 'bg-gray-200 text-gray-800',
    gold: 'bg-yellow-100 text-yellow-800',
    platinum: 'bg-purple-100 text-purple-800'
  };

  const labels: Record<string, string> = {
    bronze: 'برونزي',
    silver: 'فضي',
    gold: 'ذهبي',
    platinum: 'بلاتيني'
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[tier] || colors.bronze}`}>
      {labels[tier] || tier}
    </span>
  );
};

// ==========================================
// Stats Card Component
// ==========================================

const StatsCard: React.FC<{ title: string; value: string | number; icon: string; color: string }> = ({ 
  title, value, icon, color 
}) => (
  <div className={`bg-white rounded-xl p-4 shadow-sm border-r-4 ${color}`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
      <span className="text-3xl">{icon}</span>
    </div>
  </div>
);

// ==========================================
// User Details Modal
// ==========================================

const UserDetailsModal: React.FC<{
  phone: string;
  onClose: () => void;
  onUpdate: () => void;
}> = ({ phone, onClose, onUpdate }) => {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [pointsToAdd, setPointsToAdd] = useState('');
  const [addingPoints, setAddingPoints] = useState(false);

  useEffect(() => {
    loadUserDetails();
  }, [phone]);

  const loadUserDetails = async () => {
    try {
      setLoading(true);
      const response = await getUserDetails(phone);
      setUserData(response.data);
    } catch (error) {
      console.error('Failed to load user details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPoints = async () => {
    const points = parseInt(pointsToAdd);
    if (!points || points <= 0) return;

    try {
      setAddingPoints(true);
      await addLoyaltyPoints(phone, points, 'Admin bonus');
      setPointsToAdd('');
      await loadUserDetails();
      onUpdate();
    } catch (error) {
      console.error('Failed to add points:', error);
      alert('فشل إضافة النقاط');
    } finally {
      setAddingPoints(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8">
          <div className="animate-spin w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full mx-auto"></div>
        </div>
      </div>
    );
  }

  const { user, addresses, recentOrders, couponUsage } = userData || {};

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">تفاصيل العميل</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* User Info */}
          <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {user?.name?.[0] || '👤'}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold">{user?.name || 'بدون اسم'}</h3>
                <p className="text-gray-600">{user?.phone}</p>
                <div className="flex items-center gap-2 mt-1">
                  <TierBadge tier={user?.loyalty_tier || 'bronze'} />
                  <span className="text-sm text-gray-500">{user?.loyalty_points || 0} نقطة</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-blue-600">{user?.total_orders || 0}</p>
              <p className="text-sm text-gray-600">طلب</p>
            </div>
            <div className="bg-green-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-green-600">{(user?.total_spent || 0).toFixed(0)}</p>
              <p className="text-sm text-gray-600">ج.م إجمالي</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-purple-600">{user?.loyalty_points || 0}</p>
              <p className="text-sm text-gray-600">نقطة</p>
            </div>
          </div>

          {/* Add Points */}
          <div className="bg-yellow-50 rounded-xl p-4">
            <h4 className="font-semibold mb-2">إضافة نقاط ولاء</h4>
            <div className="flex gap-2">
              <input
                type="number"
                value={pointsToAdd}
                onChange={(e) => setPointsToAdd(e.target.value)}
                placeholder="عدد النقاط"
                className="flex-1 px-3 py-2 border rounded-lg"
              />
              <button
                onClick={handleAddPoints}
                disabled={addingPoints || !pointsToAdd}
                className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50"
              >
                {addingPoints ? '...' : 'إضافة'}
              </button>
            </div>
          </div>

          {/* Recent Orders */}
          {recentOrders?.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">آخر الطلبات</h4>
              <div className="space-y-2">
                {recentOrders.slice(0, 5).map((order: any) => (
                  <div key={order.id} className="bg-gray-50 rounded-lg p-3 flex justify-between items-center">
                    <div>
                      <span className="font-mono text-sm">{order.id}</span>
                      <span className="text-gray-500 text-sm mr-2">{order.date}</span>
                    </div>
                    <span className="font-semibold">{order.total} ج.م</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Coupon Usage */}
          {couponUsage?.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">الكوبونات المستخدمة</h4>
              <div className="space-y-2">
                {couponUsage.map((usage: any, i: number) => (
                  <div key={i} className="bg-gray-50 rounded-lg p-3 flex justify-between items-center">
                    <span className="font-mono">{usage.coupon_code}</span>
                    <span className="text-green-600">-{usage.discount_applied} ج.م</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// Main Component
// ==========================================

const UsersPage: React.FC<UsersPageProps> = ({ onRefresh }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UsersStatsResponse['data'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      
      const [usersRes, statsRes] = await Promise.all([
        getUsers({ page, limit: 20, search, tier: tierFilter, sortBy, sortOrder: 'DESC' }),
        getUsersStats()
      ]);

      setUsers(usersRes.data.users);
      setTotalPages(usersRes.data.pagination.totalPages);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  }, [page, search, tierFilter, sortBy]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadData();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">👥 إدارة العملاء</h1>
        <button
          onClick={loadData}
          className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
        >
          🔄 تحديث
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatsCard title="إجمالي العملاء" value={stats.totalUsers} icon="👥" color="border-blue-500" />
          <StatsCard title="عملاء جدد (الشهر)" value={stats.newUsersThisMonth} icon="🆕" color="border-green-500" />
          <StatsCard title="عملاء نشطين" value={stats.activeUsers} icon="⚡" color="border-yellow-500" />
          <StatsCard title="متوسط الطلب" value={`${stats.averages.orderValue} ج.م`} icon="💰" color="border-purple-500" />
        </div>
      )}

      {/* Tier Breakdown */}
      {stats && (
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="font-semibold mb-3">توزيع المستويات</h3>
          <div className="flex gap-4 flex-wrap">
            {Object.entries(stats.tierBreakdown).map(([tier, count]) => (
              <div key={tier} className="flex items-center gap-2">
                <TierBadge tier={tier} />
                <span className="font-semibold">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث بالاسم أو الرقم..."
            className="flex-1 min-w-[200px] px-4 py-2 border rounded-lg"
          />
          <select
            value={tierFilter}
            onChange={(e) => { setTierFilter(e.target.value); setPage(1); }}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="">كل المستويات</option>
            <option value="bronze">برونزي</option>
            <option value="silver">فضي</option>
            <option value="gold">ذهبي</option>
            <option value="platinum">بلاتيني</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="created_at">تاريخ التسجيل</option>
            <option value="total_orders">عدد الطلبات</option>
            <option value="total_spent">إجمالي الإنفاق</option>
            <option value="loyalty_points">النقاط</option>
          </select>
          <button type="submit" className="px-6 py-2 bg-pink-500 text-white rounded-lg">
            بحث
          </button>
        </form>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full mx-auto"></div>
          </div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            لا يوجد عملاء
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">العميل</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">الطلبات</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">الإنفاق</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">المستوى</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">النقاط</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">آخر طلب</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium">{user.name || 'بدون اسم'}</p>
                        <p className="text-sm text-gray-500">{user.phone}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold">{user.total_orders}</td>
                    <td className="px-4 py-3">{user.total_spent_formatted}</td>
                    <td className="px-4 py-3"><TierBadge tier={user.loyalty_tier} /></td>
                    <td className="px-4 py-3">{user.loyalty_points}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {user.last_order_date_formatted || '-'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => setSelectedUser(user.phone)}
                        className="px-3 py-1 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 text-sm"
                      >
                        عرض
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t flex items-center justify-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              السابق
            </button>
            <span className="px-4">صفحة {page} من {totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              التالي
            </button>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <UserDetailsModal
          phone={selectedUser}
          onClose={() => setSelectedUser(null)}
          onUpdate={loadData}
        />
      )}
    </div>
  );
};

export default UsersPage;
