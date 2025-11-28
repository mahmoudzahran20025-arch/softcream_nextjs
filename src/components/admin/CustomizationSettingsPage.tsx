// src/components/admin/CustomizationSettingsPage.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit2, Trash2, X, Save, Box, Ruler, Layers, Sparkles, 
  ChevronDown, ChevronRight, Settings
} from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://softcream-api.mahmoud-zahran20025.workers.dev';

async function apiRequest(endpoint: string, options: any = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
  const [path, queryString] = endpoint.split('?');
  const finalUrl = queryString ? `${API_BASE_URL}?path=${path}&${queryString}` : `${API_BASE_URL}?path=${path}`;
  const response = await fetch(finalUrl, { ...options, headers, body: options.body ? JSON.stringify(options.body) : undefined });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }
  return response.json();
}

// Types
interface Container { id: string; name_ar: string; name_en: string; price_modifier: number; calories: number; available: number; display_order: number; }
interface Size { id: string; name_ar: string; name_en: string; price_modifier: number; nutrition_multiplier: number; display_order: number; }
interface OptionGroup { id: string; name_ar: string; name_en: string; icon: string; display_order: number; options: Option[]; }
interface Option { id: string; group_id: string; name_ar: string; name_en: string; base_price: number; calories: number; available: number; }

type ActiveSection = 'overview' | 'containers' | 'sizes' | 'groups' | 'options';
type ModalType = 'container' | 'size' | 'group' | 'option' | null;

const CustomizationSettingsPage: React.FC = () => {
  const [containers, setContainers] = useState<Container[]>([]);
  const [sizes, setSizes] = useState<Size[]>([]);
  const [optionGroups, setOptionGroups] = useState<OptionGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<ActiveSection>('overview');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  
  // Modal state
  const [modalType, setModalType] = useState<ModalType>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');

  useEffect(() => { loadAllData(); }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [containersRes, sizesRes, optionsRes] = await Promise.all([
        apiRequest('/admin/containers'),
        apiRequest('/admin/sizes'),
        apiRequest('/admin/options')
      ]);
      if (containersRes.success) setContainers(containersRes.data || []);
      if (sizesRes.success) setSizes(sizesRes.data || []);
      if (optionsRes.success) setOptionGroups(optionsRes.data || []);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  };

  // Stats
  const totalOptions = optionGroups.reduce((sum, g) => sum + (g.options?.length || 0), 0);
  const availableContainers = containers.filter(c => c.available === 1).length;


  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-10 h-10 border-4 border-pink-200 border-t-pink-500 rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Settings className="text-purple-500" />
            إعدادات التخصيص
          </h1>
          <p className="text-gray-500 mt-1">إدارة الحاويات، المقاسات، ومجموعات الخيارات</p>
        </div>
      </div>

      {/* Visual Tree Structure */}
      <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 rounded-2xl p-6 border-2 border-purple-200">
        <h2 className="text-lg font-bold text-purple-800 mb-6 text-center">🌳 هيكل نظام التخصيص</h2>
        
        <div className="flex flex-col items-center">
          {/* Root */}
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg">
            🍦 المنتج
          </div>
          
          {/* Connector */}
          <div className="w-0.5 h-8 bg-purple-300" />
          
          {/* Three Branches */}
          <div className="flex items-start gap-4 relative">
            {/* Horizontal line */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-0.5 bg-purple-300" />
            
            {/* Containers Branch */}
            <div className="flex flex-col items-center pt-4 min-w-[200px]">
              <div className="w-0.5 h-4 bg-purple-300" />
              <button
                onClick={() => setActiveSection(activeSection === 'containers' ? 'overview' : 'containers')}
                className={`px-4 py-2 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                  activeSection === 'containers' 
                    ? 'bg-green-500 text-white shadow-lg scale-105' 
                    : 'bg-white border-2 border-green-300 text-green-700 hover:bg-green-50'
                }`}
              >
                <Box size={18} />
                الحاويات ({containers.length})
              </button>
              
              {/* Container items */}
              {activeSection === 'containers' && (
                <div className="mt-3 space-y-2 w-full">
                  {containers.map(c => (
                    <div key={c.id} className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm ${
                      c.available === 1 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'
                    }`}>
                      <span>{c.name_ar}</span>
                      <div className="flex gap-1">
                        <button onClick={() => { setEditingItem(c); setModalType('container'); }} className="p-1 hover:bg-green-200 rounded">
                          <Edit2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => { setEditingItem(null); setModalType('container'); }}
                    className="w-full flex items-center justify-center gap-1 px-3 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600"
                  >
                    <Plus size={14} /> إضافة حاوية
                  </button>
                </div>
              )}
            </div>

            {/* Sizes Branch */}
            <div className="flex flex-col items-center pt-4 min-w-[200px]">
              <div className="w-0.5 h-4 bg-purple-300" />
              <button
                onClick={() => setActiveSection(activeSection === 'sizes' ? 'overview' : 'sizes')}
                className={`px-4 py-2 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                  activeSection === 'sizes' 
                    ? 'bg-blue-500 text-white shadow-lg scale-105' 
                    : 'bg-white border-2 border-blue-300 text-blue-700 hover:bg-blue-50'
                }`}
              >
                <Ruler size={18} />
                المقاسات ({sizes.length})
              </button>
              
              {/* Size items */}
              {activeSection === 'sizes' && (
                <div className="mt-3 space-y-2 w-full">
                  {sizes.map(s => (
                    <div key={s.id} className="flex items-center justify-between px-3 py-2 bg-blue-100 text-blue-800 rounded-lg text-sm">
                      <span>{s.name_ar} (×{s.nutrition_multiplier})</span>
                      <button onClick={() => { setEditingItem(s); setModalType('size'); }} className="p-1 hover:bg-blue-200 rounded">
                        <Edit2 size={14} />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => { setEditingItem(null); setModalType('size'); }}
                    className="w-full flex items-center justify-center gap-1 px-3 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
                  >
                    <Plus size={14} /> إضافة مقاس
                  </button>
                </div>
              )}
            </div>

            {/* Options Branch */}
            <div className="flex flex-col items-center pt-4 min-w-[280px]">
              <div className="w-0.5 h-4 bg-purple-300" />
              <button
                onClick={() => setActiveSection(activeSection === 'groups' ? 'overview' : 'groups')}
                className={`px-4 py-2 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                  activeSection === 'groups' 
                    ? 'bg-amber-500 text-white shadow-lg scale-105' 
                    : 'bg-white border-2 border-amber-300 text-amber-700 hover:bg-amber-50'
                }`}
              >
                <Sparkles size={18} />
                مجموعات الخيارات ({optionGroups.length})
              </button>
              
              {/* Option Groups */}
              {activeSection === 'groups' && (
                <div className="mt-3 space-y-2 w-full">
                  {optionGroups.map(group => (
                    <div key={group.id} className="bg-amber-50 rounded-lg border border-amber-200 overflow-hidden">
                      <div 
                        className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-amber-100"
                        onClick={() => toggleGroup(group.id)}
                      >
                        <div className="flex items-center gap-2">
                          {expandedGroups.has(group.id) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                          <span className="text-lg">{group.icon}</span>
                          <span className="font-medium text-amber-800">{group.name_ar}</span>
                          <span className="text-xs bg-amber-200 text-amber-700 px-2 py-0.5 rounded-full">
                            {group.options?.length || 0}
                          </span>
                        </div>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setEditingItem(group); setModalType('group'); }} 
                          className="p-1 hover:bg-amber-200 rounded"
                        >
                          <Edit2 size={14} />
                        </button>
                      </div>
                      
                      {/* Options inside group */}
                      {expandedGroups.has(group.id) && (
                        <div className="px-3 pb-2 space-y-1">
                          {group.options?.map(opt => (
                            <div key={opt.id} className={`flex items-center justify-between px-2 py-1.5 rounded text-xs ${
                              opt.available === 1 ? 'bg-white' : 'bg-gray-100 text-gray-400'
                            }`}>
                              <span>{opt.name_ar}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-gray-500">{opt.base_price} ج</span>
                                <button 
                                  onClick={() => { setEditingItem(opt); setSelectedGroupId(group.id); setModalType('option'); }}
                                  className="p-0.5 hover:bg-gray-200 rounded"
                                >
                                  <Edit2 size={12} />
                                </button>
                              </div>
                            </div>
                          ))}
                          <button
                            onClick={() => { setEditingItem(null); setSelectedGroupId(group.id); setModalType('option'); }}
                            className="w-full flex items-center justify-center gap-1 px-2 py-1.5 bg-amber-500 text-white rounded text-xs hover:bg-amber-600"
                          >
                            <Plus size={12} /> إضافة خيار
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => { setEditingItem(null); setModalType('group'); }}
                    className="w-full flex items-center justify-center gap-1 px-3 py-2 bg-amber-500 text-white rounded-lg text-sm hover:bg-amber-600"
                  >
                    <Plus size={14} /> إضافة مجموعة
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>


      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Box className="text-green-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{containers.length}</p>
              <p className="text-xs text-gray-500">حاوية ({availableContainers} متاح)</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Ruler className="text-blue-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{sizes.length}</p>
              <p className="text-xs text-gray-500">مقاس</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <Layers className="text-amber-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{optionGroups.length}</p>
              <p className="text-xs text-gray-500">مجموعة خيارات</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Sparkles className="text-purple-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{totalOptions}</p>
              <p className="text-xs text-gray-500">خيار إجمالي</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h3 className="font-semibold text-blue-800 mb-2">💡 كيف يعمل النظام؟</h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm text-blue-700">
          <div>
            <strong>الحاويات:</strong> كوب، كون، وافل - لها سعر إضافي وقيم غذائية خاصة
          </div>
          <div>
            <strong>المقاسات:</strong> صغير، وسط، كبير - تؤثر على السعر والقيم الغذائية بمعامل
          </div>
          <div>
            <strong>الخيارات:</strong> نكهات، صوصات، إضافات - يختارها العميل حسب قواعد المنتج
          </div>
        </div>
      </div>

      {/* Modals */}
      {modalType && (
        <Modal
          type={modalType}
          item={editingItem}
          groupId={selectedGroupId}
          groups={optionGroups}
          onClose={() => { setModalType(null); setEditingItem(null); setSelectedGroupId(''); }}
          onSave={loadAllData}
        />
      )}
    </div>
  );
};

// Modal Component
interface ModalProps {
  type: ModalType;
  item: any;
  groupId: string;
  groups: OptionGroup[];
  onClose: () => void;
  onSave: () => void;
}

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
          setFormData({ id: '', name_ar: '', name_en: '', price_modifier: 0, calories: 0, protein: 0, carbs: 0, sugar: 0, fat: 0, fiber: 0, max_sizes: 3, display_order: 0, available: 1 });
          break;
        case 'size':
          setFormData({ id: '', name_ar: '', name_en: '', price_modifier: 0, nutrition_multiplier: 1.0, display_order: 0 });
          break;
        case 'group':
          setFormData({ id: '', name_ar: '', name_en: '', description_ar: '', icon: '📦', display_order: 0 });
          break;
        case 'option':
          setFormData({ id: '', group_id: groupId, name_ar: '', name_en: '', base_price: 0, calories: 0, protein: 0, carbs: 0, sugar: 0, fat: 0, fiber: 0, display_order: 0, available: 1 });
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
        container: '/admin/containers',
        size: '/admin/sizes',
        group: '/admin/option-groups',
        option: '/admin/options'
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
        container: '/admin/containers',
        size: '/admin/sizes',
        group: '/admin/option-groups',
        option: '/admin/options'
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

  const ICONS = ['📦', '🍦', '🍫', '🍬', '🥜', '🍓', '🍌', '🥤', '🧁', '🍰', '🎂', '🍪', '🍩', '⭐', '✨', '💎', '🔥', '❄️'];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">{titles[type!]}</h3>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">المعرف (ID) *</label>
            <input
              type="text"
              value={formData.id || ''}
              onChange={e => setFormData({ ...formData, id: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              disabled={!!item}
              required
            />
          </div>

          {/* Names */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الاسم بالعربية *</label>
              <input
                type="text"
                value={formData.name_ar || ''}
                onChange={e => setFormData({ ...formData, name_ar: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الاسم بالإنجليزية</label>
              <input
                type="text"
                value={formData.name_en || ''}
                onChange={e => setFormData({ ...formData, name_en: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Icon for groups */}
          {type === 'group' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الأيقونة</label>
              <div className="flex flex-wrap gap-2">
                {ICONS.map(icon => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setFormData({ ...formData, icon })}
                    className={`w-9 h-9 text-lg rounded-lg border-2 ${formData.icon === icon ? 'border-purple-500 bg-purple-50' : 'border-gray-200'}`}
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
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                required
              >
                {groups.map(g => <option key={g.id} value={g.id}>{g.icon} {g.name_ar}</option>)}
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
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              />
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
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
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
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              />
              <p className="text-xs text-gray-500 mt-1">0.7 = صغير، 1.0 = وسط، 1.3 = كبير</p>
            </div>
          )}

          {/* Nutrition for containers and options */}
          {(type === 'container' || type === 'option') && (
            <div className="border-t pt-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">القيم الغذائية</label>
              <div className="grid grid-cols-3 gap-2">
                {['calories', 'protein', 'carbs', 'sugar', 'fat', 'fiber'].map(field => (
                  <div key={field}>
                    <label className="block text-xs text-gray-500">{field === 'calories' ? 'سعرات' : field}</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData[field] || 0}
                      onChange={e => setFormData({ ...formData, [field]: parseFloat(e.target.value) || 0 })}
                      className="w-full px-2 py-1 border rounded text-sm"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Available toggle */}
          {(type === 'container' || type === 'option') && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.available === 1}
                onChange={e => setFormData({ ...formData, available: e.target.checked ? 1 : 0 })}
                className="rounded border-gray-300 text-purple-500"
              />
              <span className="text-sm text-gray-700">متاح</span>
            </label>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold disabled:opacity-50"
            >
              <Save size={16} />
              {saving ? 'جاري الحفظ...' : 'حفظ'}
            </button>
            {item && (
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomizationSettingsPage;
