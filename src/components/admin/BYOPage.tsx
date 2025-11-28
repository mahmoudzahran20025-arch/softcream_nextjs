// src/components/admin/BYOPage.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { 
  getBYOOptions, 
  createBYOOption, 
  updateBYOOption, 
  deleteBYOOption,
  type BYOOption,
  type BYOOptionGroup 
} from '@/lib/adminApi';

interface BYOPageProps {
  onRefresh?: () => void;
}

const BYOPage: React.FC<BYOPageProps> = ({ onRefresh: _onRefresh }) => {
  const [groups, setGroups] = useState<BYOOptionGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingOption, setEditingOption] = useState<BYOOption | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchOptions = async () => {
    try {
      setLoading(true);
      const response = await getBYOOptions();
      if (response.success) {
        setGroups(response.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch BYO options:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOptions();
  }, []);

  const handleUpdateOption = async (option: BYOOption) => {
    try {
      const response = await updateBYOOption(option.id, option);
      if (response.success) {
        alert('✅ تم تحديث الخيار بنجاح');
        setEditingOption(null);
        fetchOptions();
      }
    } catch (error) {
      console.error('Failed to update option:', error);
      alert('❌ فشل تحديث الخيار');
    }
  };

  const handleCreateOption = async (option: Partial<BYOOption> & { id: string }) => {
    try {
      const response = await createBYOOption(option);
      if (response.success) {
        alert('✅ تم إضافة الخيار بنجاح');
        setShowAddModal(false);
        fetchOptions();
      }
    } catch (error) {
      console.error('Failed to create option:', error);
      alert('❌ فشل إضافة الخيار');
    }
  };

  const handleDeleteOption = async (optionId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الخيار؟')) return;
    
    try {
      const response = await deleteBYOOption(optionId);
      if (response.success) {
        alert('✅ تم حذف الخيار بنجاح');
        fetchOptions();
      }
    } catch (error) {
      console.error('Failed to delete option:', error);
      alert('❌ فشل حذف الخيار');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-pink-200 border-t-pink-500 rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">إدارة خيارات BYO</h1>
          <p className="text-gray-500 mt-1">النكهات، الصوصات، والإضافات</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:from-pink-600 hover:to-purple-600 transition-all shadow-lg"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          إضافة خيار جديد
        </button>
      </div>

      {/* Groups */}
      <div className="space-y-6">
        {groups.map((group) => (
          <div key={group.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Group Header */}
            <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{group.icon}</span>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900">{group.name_ar}</h3>
                  <p className="text-sm text-gray-500">{group.description_ar}</p>
                </div>
                <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm font-medium">
                  {group.options.length} خيار
                </span>
              </div>
            </div>

            {/* Options Grid */}
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {group.options.map((option) => (
                  <OptionCard
                    key={option.id}
                    option={option}
                    onEdit={() => setEditingOption(option)}
                    onDelete={() => handleDeleteOption(option.id)}
                  />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editingOption && (
        <OptionModal
          option={editingOption}
          groups={groups}
          onSave={handleUpdateOption}
          onClose={() => setEditingOption(null)}
          mode="edit"
        />
      )}

      {/* Add Modal */}
      {showAddModal && (
        <OptionModal
          groups={groups}
          onSave={handleCreateOption}
          onClose={() => setShowAddModal(false)}
          mode="add"
        />
      )}
    </div>
  );
};

// Option Card Component
const OptionCard: React.FC<{
  option: BYOOption;
  onEdit: () => void;
  onDelete: () => void;
}> = ({ option, onEdit, onDelete }) => {
  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-pink-300 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900">{option.name_ar}</h4>
          <p className="text-sm text-gray-500">{option.name_en}</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onEdit}
            className="p-1.5 text-gray-400 hover:text-blue-500 transition-colors"
            title="تعديل"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
            title="حذف"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">السعر:</span>
          <span className="font-medium text-gray-900">{option.base_price} ج.م</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-600">السعرات:</span>
          <span className="font-medium text-gray-900">{option.calories} cal</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-600">الحالة:</span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
            option.available 
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}>
            {option.available ? 'متوفر' : 'غير متوفر'}
          </span>
        </div>
      </div>
    </div>
  );
};

// Option Modal Component
const OptionModal: React.FC<{
  option?: BYOOption;
  groups: BYOOptionGroup[];
  onSave: (option: any) => void;
  onClose: () => void;
  mode: 'edit' | 'add';
}> = ({ option, groups, onSave, onClose, mode }) => {
  const [formData, setFormData] = useState<Partial<BYOOption> & { id: string }>({
    id: option?.id || '',
    group_id: option?.group_id || groups[0]?.id || '',
    name_ar: option?.name_ar || '',
    name_en: option?.name_en || '',
    description_ar: option?.description_ar || '',
    description_en: option?.description_en || '',
    base_price: option?.base_price || 0,
    image: option?.image || '',
    available: option?.available ?? 1,
    display_order: option?.display_order || 0,
    calories: option?.calories || 0,
    protein: option?.protein || 0,
    carbs: option?.carbs || 0,
    sugar: option?.sugar || 0,
    fat: option?.fat || 0,
    fiber: option?.fiber || 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'add' && !formData.id) {
      alert('يرجى إدخال معرف الخيار');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">
            {mode === 'edit' ? 'تعديل الخيار' : 'إضافة خيار جديد'}
          </h3>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* ID and Group */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                معرف الخيار (ID)
              </label>
              <input
                type="text"
                value={formData.id}
                onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                placeholder="مثال: new_flavor"
                disabled={mode === 'edit'}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                المجموعة
              </label>
              <select
                value={formData.group_id}
                onChange={(e) => setFormData({ ...formData, group_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                required
              >
                {groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.icon} {group.name_ar}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Names */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الاسم بالعربية
              </label>
              <input
                type="text"
                value={formData.name_ar}
                onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الاسم بالإنجليزية
              </label>
              <input
                type="text"
                value={formData.name_en}
                onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              />
            </div>
          </div>

          {/* Price and Order */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                السعر (ج.م)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.base_price}
                onChange={(e) => setFormData({ ...formData, base_price: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ترتيب العرض
              </label>
              <input
                type="number"
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              />
            </div>
          </div>

          {/* Nutrition */}
          <div className="border-t border-gray-200 pt-4">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span>⚡</span> القيم الغذائية
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">السعرات</label>
                <input
                  type="number"
                  value={formData.calories}
                  onChange={(e) => setFormData({ ...formData, calories: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">البروتين (g)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.protein}
                  onChange={(e) => setFormData({ ...formData, protein: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الكربوهيدرات (g)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.carbs}
                  onChange={(e) => setFormData({ ...formData, carbs: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">السكر (g)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.sugar}
                  onChange={(e) => setFormData({ ...formData, sugar: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الدهون (g)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.fat}
                  onChange={(e) => setFormData({ ...formData, fat: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الألياف (g)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.fiber}
                  onChange={(e) => setFormData({ ...formData, fiber: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                />
              </div>
            </div>
          </div>

          {/* Availability */}
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.available === 1}
                onChange={(e) => setFormData({ ...formData, available: e.target.checked ? 1 : 0 })}
                className="rounded border-gray-300 text-pink-500 focus:ring-pink-500"
              />
              <span className="text-sm text-gray-700">متوفر</span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:from-pink-600 hover:to-purple-600 transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {mode === 'edit' ? 'حفظ التغييرات' : 'إضافة الخيار'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BYOPage;
