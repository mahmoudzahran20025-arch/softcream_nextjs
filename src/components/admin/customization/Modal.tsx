// src/components/admin/customization/Modal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, Trash2 } from 'lucide-react';
import { apiRequest, ENDPOINTS } from './api';
import type { ModalType, OptionGroup } from './types';

interface ModalProps {
  type: ModalType;
  item: any;
  groupId: string;
  groups: OptionGroup[];
  onClose: () => void;
  onSave: () => void;
}

const ICONS = ['📦', '🍦', '🍫', '🍬', '🥜', '🍓', '🍌', '🥤', '🧁', '🍰', '🎂', '🍪', '🍩', '⭐', '✨', '💎', '🔥', '❄️'];

const Modal: React.FC<ModalProps> = ({ type, item, groupId, groups, onClose, onSave }) => {
  const [formData, setFormData] = useState<any>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (item) {
      setFormData({ ...item });
    } else {
      // Default values based on type
      switch (type) {
        case 'container':
          setFormData({ 
            id: '', name_ar: '', name_en: '', price_modifier: 0, 
            calories: 0, protein: 0, carbs: 0, sugar: 0, fat: 0, fiber: 0, 
            max_sizes: 3, display_order: 0, available: 1 
          });
          break;
        case 'size':
          setFormData({ 
            id: '', name_ar: '', name_en: '', 
            price_modifier: 0, nutrition_multiplier: 1.0, display_order: 0 
          });
          break;
        case 'group':
          setFormData({ 
            id: '', name_ar: '', name_en: '', 
            description_ar: '', icon: '📦', display_order: 0 
          });
          break;
        case 'option':
          setFormData({ 
            id: '', group_id: groupId, name_ar: '', name_en: '', 
            base_price: 0, calories: 0, protein: 0, carbs: 0, sugar: 0, fat: 0, fiber: 0, 
            display_order: 0, available: 1 
          });
          break;
      }
    }
  }, [item, type, groupId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id || !formData.name_ar) {
      alert('يرجى إدخال المعرف والاسم');
      return;
    }

    try {
      setSaving(true);
      const endpoints: Record<string, string> = {
        container: ENDPOINTS.containers,
        size: ENDPOINTS.sizes,
        group: ENDPOINTS.optionGroups,
        option: ENDPOINTS.options
      };
      
      const endpoint = endpoints[type!];
      if (item) {
        await apiRequest(`${endpoint}/${item.id}`, { method: 'PUT', body: formData });
      } else {
        await apiRequest(endpoint, { method: 'POST', body: formData });
      }
      
      alert('✅ تم الحفظ بنجاح');
      onSave();
      onClose();
    } catch (error: any) {
      alert(`❌ فشل الحفظ: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!item || !confirm('هل أنت متأكد من الحذف؟')) return;
    
    try {
      const endpoints: Record<string, string> = {
        container: ENDPOINTS.containers,
        size: ENDPOINTS.sizes,
        group: ENDPOINTS.optionGroups,
        option: ENDPOINTS.options
      };
      await apiRequest(`${endpoints[type!]}/${item.id}`, { method: 'DELETE' });
      alert('✅ تم الحذف');
      onSave();
      onClose();
    } catch (error: any) {
      alert(`❌ فشل الحذف: ${error.message}`);
    }
  };

  const titles: Record<string, string> = {
    container: item ? 'تعديل الحاوية' : 'إضافة حاوية',
    size: item ? 'تعديل المقاس' : 'إضافة مقاس',
    group: item ? 'تعديل المجموعة' : 'إضافة مجموعة',
    option: item ? 'تعديل الخيار' : 'إضافة خيار'
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4" onClick={onClose}>
      <div className="bg-white rounded-t-2xl sm:rounded-xl p-4 sm:p-6 w-full sm:max-w-lg max-h-[85vh] sm:max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4 pb-3 border-b">
          <h3 className="text-base sm:text-lg font-bold text-gray-900">{titles[type!]}</h3>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">المعرف (ID) *</label>
            <input
              type="text"
              value={formData.id || ''}
              onChange={e => setFormData({ ...formData, id: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
              className="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
              placeholder="مثال: cup, small, chocolate"
              disabled={!!item}
              required
            />
            {!item && <p className="text-xs text-gray-500 mt-1">المعرف يستخدم في الكود ولا يمكن تغييره لاحقاً</p>}
          </div>

          {/* Names */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الاسم بالعربية *</label>
              <input
                type="text"
                value={formData.name_ar || ''}
                onChange={e => setFormData({ ...formData, name_ar: e.target.value })}
                className="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                placeholder="مثال: كوب"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الاسم بالإنجليزية</label>
              <input
                type="text"
                value={formData.name_en || ''}
                onChange={e => setFormData({ ...formData, name_en: e.target.value })}
                className="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                placeholder="Example: Cup"
              />
            </div>
          </div>

          {/* Icon for groups */}
          {type === 'group' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الأيقونة</label>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {ICONS.map(icon => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setFormData({ ...formData, icon })}
                    className={`w-8 h-8 sm:w-9 sm:h-9 text-base sm:text-lg rounded-lg border-2 transition-all ${
                      formData.icon === icon 
                        ? 'border-purple-500 bg-purple-50 scale-110' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Group selector for options */}
          {type === 'option' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">المجموعة</label>
              <select
                value={formData.group_id || ''}
                onChange={e => setFormData({ ...formData, group_id: e.target.value })}
                className="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                required
              >
                {groups.map(g => (
                  <option key={g.id} value={g.id}>{g.icon} {g.name_ar}</option>
                ))}
              </select>
            </div>
          )}

          {/* Price fields */}
          {(type === 'container' || type === 'size') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">تعديل السعر (ج.م)</label>
              <input
                type="number"
                step="0.5"
                value={formData.price_modifier || 0}
                onChange={e => setFormData({ ...formData, price_modifier: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">السعر الإضافي الذي يُضاف للمنتج عند اختيار هذا العنصر</p>
            </div>
          )}

          {type === 'option' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">السعر (ج.م)</label>
              <input
                type="number"
                step="0.5"
                value={formData.base_price || 0}
                onChange={e => setFormData({ ...formData, base_price: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
              />
            </div>
          )}

          {/* Nutrition multiplier for sizes */}
          {type === 'size' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">معامل التغذية</label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={formData.nutrition_multiplier || 1}
                onChange={e => setFormData({ ...formData, nutrition_multiplier: parseFloat(e.target.value) || 1 })}
                className="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                يُضرب في القيم الغذائية للمنتج • 0.7 = صغير، 1.0 = وسط، 1.3 = كبير
              </p>
            </div>
          )}

          {/* Nutrition for containers and options */}
          {(type === 'container' || type === 'option') && (
            <div className="border-t pt-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">القيم الغذائية</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: 'calories', label: 'سعرات' },
                  { key: 'protein', label: 'بروتين' },
                  { key: 'carbs', label: 'كربوهيدرات' },
                  { key: 'sugar', label: 'سكر' },
                  { key: 'fat', label: 'دهون' },
                  { key: 'fiber', label: 'ألياف' }
                ].map(({ key, label }) => (
                  <div key={key}>
                    <label className="block text-[10px] sm:text-xs text-gray-500 mb-0.5">{label}</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData[key] || 0}
                      onChange={e => setFormData({ ...formData, [key]: parseFloat(e.target.value) || 0 })}
                      className="w-full px-2 py-1.5 border rounded text-sm"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Available toggle */}
          {(type === 'container' || type === 'option') && (
            <label className="flex items-center gap-3 cursor-pointer py-2 px-3 bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                checked={formData.available === 1}
                onChange={e => setFormData({ ...formData, available: e.target.checked ? 1 : 0 })}
                className="w-5 h-5 rounded border-gray-300 text-purple-500"
              />
              <div>
                <span className="text-sm text-gray-700 font-medium">متاح للعملاء</span>
                <p className="text-xs text-gray-500">إذا تم تعطيله، لن يظهر للعملاء في التطبيق</p>
              </div>
            </label>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold disabled:opacity-50 text-sm"
            >
              <Save size={16} />
              {saving ? 'جاري الحفظ...' : 'حفظ'}
            </button>
            {item && (
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center gap-2"
              >
                <Trash2 size={16} />
                <span className="hidden sm:inline">حذف</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Modal;
