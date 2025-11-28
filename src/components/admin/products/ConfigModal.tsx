// src/components/admin/products/ConfigModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { X, Settings, Sparkles, Ruler, Plus, Trash2, Save, Box, Check } from 'lucide-react';
import { getBYOOptions, updateProductCustomization, type BYOOptionGroup } from '@/lib/adminApi';
import type { ConfigModalProps } from './types';
import { PRODUCT_TYPES } from './types';

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

interface CustomizationRule {
  group_id: string;
  group_name?: string;
  group_icon?: string;
  is_required: boolean;
  min_selections: number;
  max_selections: number;
  price_override?: number | null;
  display_order: number;
}

interface ContainerType {
  id: string;
  name_ar: string;
  name_en: string;
  price_modifier: number;
  available: number;
}

interface SizeType {
  id: string;
  name_ar: string;
  name_en: string;
  price_modifier: number;
  nutrition_multiplier: number;
}

const ConfigModal: React.FC<ConfigModalProps> = ({
  isOpen,
  onClose,
  product,
  config,
  loading,
  onUpdateProductType
}) => {
  const [activeTab, setActiveTab] = useState<'type' | 'containers' | 'sizes' | 'options'>('type');
  const [optionGroups, setOptionGroups] = useState<BYOOptionGroup[]>([]);
  const [customizationRules, setCustomizationRules] = useState<CustomizationRule[]>([]);
  const [allContainers, setAllContainers] = useState<ContainerType[]>([]);
  const [allSizes, setAllSizes] = useState<SizeType[]>([]);
  const [selectedContainers, setSelectedContainers] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [defaultContainer, setDefaultContainer] = useState<string>('');
  const [defaultSize, setDefaultSize] = useState<string>('');
  const [loadingData, setLoadingData] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (isOpen && product) {
      loadAllData();
    }
  }, [isOpen, product]);

  useEffect(() => {
    if (config) {
      // Initialize from config
      if (config.customizationRules) {
        const rules = config.customizationRules.map((rule: any) => ({
          group_id: rule.groupId || rule.group_id,
          group_name: rule.groupName,
          group_icon: rule.groupIcon,
          is_required: rule.isRequired || rule.is_required || false,
          min_selections: rule.minSelections || rule.min_selections || 0,
          max_selections: rule.maxSelections || rule.max_selections || 1,
          price_override: rule.priceOverride || rule.price_override || null,
          display_order: rule.displayOrder || rule.display_order || 0
        }));
        setCustomizationRules(rules);
      }
      if (config.containers) {
        setSelectedContainers(config.containers.map((c: any) => c.id || c.container_id));
        const def = config.containers.find((c: any) => c.is_default);
        if (def) setDefaultContainer(def.id || def.container_id);
      }
      if (config.sizes) {
        setSelectedSizes(config.sizes.map((s: any) => s.id || s.size_id));
        const def = config.sizes.find((s: any) => s.is_default);
        if (def) setDefaultSize(def.id || def.size_id);
      }
      setHasChanges(false);
    }
  }, [config]);

  const loadAllData = async () => {
    try {
      setLoadingData(true);
      const [optionsRes, containersRes, sizesRes] = await Promise.all([
        getBYOOptions(),
        apiRequest('/admin/containers'),
        apiRequest('/admin/sizes')
      ]);
      if (optionsRes.success) setOptionGroups(optionsRes.data || []);
      if (containersRes.success) setAllContainers(containersRes.data || []);
      if (sizesRes.success) setAllSizes(sizesRes.data || []);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoadingData(false);
    }
  };


  const toggleContainer = (containerId: string) => {
    setSelectedContainers(prev => {
      const newList = prev.includes(containerId) 
        ? prev.filter(id => id !== containerId)
        : [...prev, containerId];
      if (!newList.includes(defaultContainer)) setDefaultContainer(newList[0] || '');
      return newList;
    });
    setHasChanges(true);
  };

  const toggleSize = (sizeId: string) => {
    setSelectedSizes(prev => {
      const newList = prev.includes(sizeId)
        ? prev.filter(id => id !== sizeId)
        : [...prev, sizeId];
      if (!newList.includes(defaultSize)) setDefaultSize(newList[0] || '');
      return newList;
    });
    setHasChanges(true);
  };

  const handleAddGroup = (groupId: string) => {
    const group = optionGroups.find(g => g.id === groupId);
    if (!group || customizationRules.some(r => r.group_id === groupId)) return;
    setCustomizationRules([...customizationRules, {
      group_id: groupId,
      group_name: group.name_ar,
      group_icon: group.icon,
      is_required: false,
      min_selections: 0,
      max_selections: 3,
      price_override: null,
      display_order: customizationRules.length
    }]);
    setHasChanges(true);
  };

  const handleRemoveGroup = (groupId: string) => {
    setCustomizationRules(customizationRules.filter(r => r.group_id !== groupId));
    setHasChanges(true);
  };

  const handleUpdateRule = (groupId: string, field: keyof CustomizationRule, value: any) => {
    setCustomizationRules(customizationRules.map(rule =>
      rule.group_id === groupId ? { ...rule, [field]: value } : rule
    ));
    setHasChanges(true);
  };

  const handleSaveAll = async () => {
    if (!product) return;
    try {
      setSaving(true);
      await updateProductCustomization(product.id, {
        customization_rules: customizationRules.map(rule => ({
          group_id: rule.group_id,
          is_required: rule.is_required,
          min_selections: rule.min_selections,
          max_selections: rule.max_selections,
          price_override: rule.price_override,
          display_order: rule.display_order
        })),
        containers: selectedContainers.map(id => ({
          container_id: id,
          is_default: id === defaultContainer
        })),
        sizes: selectedSizes.map(id => ({
          size_id: id,
          is_default: id === defaultSize
        }))
      });
      alert('✅ تم حفظ جميع الإعدادات بنجاح');
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to save:', error);
      alert('❌ فشل حفظ الإعدادات');
    } finally {
      setSaving(false);
    }
  };

  const availableGroups = optionGroups.filter(g => !customizationRules.some(r => r.group_id === g.id));

  if (!isOpen || !product) return null;

  const tabs = [
    { id: 'type', label: 'نوع المنتج', icon: Sparkles },
    { id: 'containers', label: 'الحاويات', icon: Box, count: selectedContainers.length },
    { id: 'sizes', label: 'المقاسات', icon: Ruler, count: selectedSizes.length },
    { id: 'options', label: 'خيارات التخصيص', icon: Settings, count: customizationRules.length },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Settings size={22} />
                إعدادات المنتج المتقدمة
              </h2>
              <p className="text-purple-100 text-sm">{product.name}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg text-white">
              <X size={22} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b bg-gray-50 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-purple-600 border-b-2 border-purple-600 bg-white'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon size={18} />
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded-full">{tab.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading || loadingData ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* Tab: Product Type */}
              {activeTab === 'type' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">اختر نوع المنتج</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {PRODUCT_TYPES.map((type) => (
                      <button
                        key={type.value}
                        onClick={() => onUpdateProductType(type.value)}
                        className={`p-4 rounded-xl border-2 transition-all text-right ${
                          config?.product?.productType === type.value
                            ? 'border-purple-500 bg-purple-50 shadow-lg'
                            : 'border-gray-200 bg-white hover:border-purple-300'
                        }`}
                      >
                        <div className="text-2xl mb-2">{type.icon}</div>
                        <div className="font-bold text-gray-800">{type.label}</div>
                        <div className="text-xs text-gray-500 mt-1">{type.description}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}


              {/* Tab: Containers */}
              {activeTab === 'containers' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-800">اختر الحاويات المتاحة لهذا المنتج</h3>
                    <span className="text-sm text-gray-500">{selectedContainers.length} محدد</span>
                  </div>
                  
                  {allContainers.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-xl">
                      <Box className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500">لا توجد حاويات. أضف حاويات من صفحة "الحاويات" أولاً.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {allContainers.filter(c => c.available === 1).map(container => {
                        const isSelected = selectedContainers.includes(container.id);
                        const isDefault = defaultContainer === container.id;
                        return (
                          <div
                            key={container.id}
                            className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                              isSelected
                                ? 'border-green-500 bg-green-50'
                                : 'border-gray-200 bg-white hover:border-gray-300'
                            }`}
                            onClick={() => toggleContainer(container.id)}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                  isSelected ? 'bg-green-500 border-green-500' : 'border-gray-300'
                                }`}>
                                  {isSelected && <Check size={14} className="text-white" />}
                                </div>
                                <span className="font-bold text-gray-800">{container.name_ar}</span>
                              </div>
                              {isSelected && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); setDefaultContainer(container.id); setHasChanges(true); }}
                                  className={`text-xs px-2 py-1 rounded ${
                                    isDefault ? 'bg-purple-500 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                  }`}
                                >
                                  {isDefault ? 'افتراضي' : 'تعيين افتراضي'}
                                </button>
                              )}
                            </div>
                            <p className="text-sm text-gray-500">{container.name_en}</p>
                            <p className="text-sm text-gray-600 mt-1">
                              تعديل السعر: <span className={container.price_modifier > 0 ? 'text-green-600' : 'text-gray-600'}>
                                {container.price_modifier > 0 ? '+' : ''}{container.price_modifier} ج
                              </span>
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Tab: Sizes */}
              {activeTab === 'sizes' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-800">اختر المقاسات المتاحة لهذا المنتج</h3>
                    <span className="text-sm text-gray-500">{selectedSizes.length} محدد</span>
                  </div>
                  
                  {allSizes.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-xl">
                      <Ruler className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500">لا توجد مقاسات. أضف مقاسات من صفحة "المقاسات" أولاً.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                      {allSizes.map(size => {
                        const isSelected = selectedSizes.includes(size.id);
                        const isDefault = defaultSize === size.id;
                        return (
                          <div
                            key={size.id}
                            className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                              isSelected
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 bg-white hover:border-gray-300'
                            }`}
                            onClick={() => toggleSize(size.id)}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                  isSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
                                }`}>
                                  {isSelected && <Check size={14} className="text-white" />}
                                </div>
                                <span className="font-bold text-gray-800">{size.name_ar}</span>
                              </div>
                            </div>
                            <p className="text-sm text-gray-500">{size.name_en}</p>
                            <div className="mt-2 space-y-1 text-xs">
                              <p className="text-gray-600">
                                السعر: <span className={size.price_modifier !== 0 ? (size.price_modifier > 0 ? 'text-green-600' : 'text-red-600') : ''}>
                                  {size.price_modifier > 0 ? '+' : ''}{size.price_modifier} ج
                                </span>
                              </p>
                              <p className="text-gray-600">التغذية: ×{size.nutrition_multiplier}</p>
                            </div>
                            {isSelected && (
                              <button
                                onClick={(e) => { e.stopPropagation(); setDefaultSize(size.id); setHasChanges(true); }}
                                className={`mt-2 w-full text-xs px-2 py-1 rounded ${
                                  isDefault ? 'bg-purple-500 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                }`}
                              >
                                {isDefault ? '✓ افتراضي' : 'تعيين افتراضي'}
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}


              {/* Tab: Options */}
              {activeTab === 'options' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-800">قواعد التخصيص (النكهات، الصوصات، الإضافات)</h3>
                  
                  {/* Add Group */}
                  {availableGroups.length > 0 && (
                    <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">إضافة مجموعة خيارات</label>
                      <div className="flex gap-2 flex-wrap">
                        {availableGroups.map(group => (
                          <button
                            key={group.id}
                            onClick={() => handleAddGroup(group.id)}
                            className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-amber-100 text-amber-800 rounded-lg transition-colors text-sm border border-amber-200"
                          >
                            <Plus size={14} />
                            <span>{group.icon}</span>
                            <span>{group.name_ar}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Rules List */}
                  {customizationRules.length > 0 ? (
                    <div className="space-y-3">
                      {customizationRules.map((rule) => {
                        const group = optionGroups.find(g => g.id === rule.group_id);
                        return (
                          <div key={rule.group_id} className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <span className="text-xl">{rule.group_icon || group?.icon || '📦'}</span>
                                <div>
                                  <div className="font-bold text-gray-800">{rule.group_name || group?.name_ar}</div>
                                  <div className="text-xs text-gray-500">{group?.options?.length || 0} خيار</div>
                                </div>
                              </div>
                              <button
                                onClick={() => handleRemoveGroup(rule.group_id)}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">إجباري؟</label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={rule.is_required}
                                    onChange={(e) => handleUpdateRule(rule.group_id, 'is_required', e.target.checked)}
                                    className="rounded border-gray-300 text-purple-500"
                                  />
                                  <span className="text-sm">{rule.is_required ? 'نعم' : 'لا'}</span>
                                </label>
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">الحد الأدنى</label>
                                <input
                                  type="number"
                                  min="0"
                                  value={rule.min_selections}
                                  onChange={(e) => handleUpdateRule(rule.group_id, 'min_selections', parseInt(e.target.value) || 0)}
                                  className="w-full px-2 py-1 border rounded text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">الحد الأقصى</label>
                                <input
                                  type="number"
                                  min="1"
                                  value={rule.max_selections}
                                  onChange={(e) => handleUpdateRule(rule.group_id, 'max_selections', parseInt(e.target.value) || 1)}
                                  className="w-full px-2 py-1 border rounded text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">الترتيب</label>
                                <input
                                  type="number"
                                  min="0"
                                  value={rule.display_order}
                                  onChange={(e) => handleUpdateRule(rule.group_id, 'display_order', parseInt(e.target.value) || 0)}
                                  className="w-full px-2 py-1 border rounded text-sm"
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-xl">
                      <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500">لا توجد قواعد تخصيص</p>
                      <p className="text-sm text-gray-400">اختر مجموعات الخيارات من الأعلى</p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 flex gap-3">
          {hasChanges && (
            <button
              onClick={handleSaveAll}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold hover:shadow-lg disabled:opacity-50"
            >
              <Save size={18} />
              {saving ? 'جاري الحفظ...' : 'حفظ جميع التغييرات'}
            </button>
          )}
          <button
            onClick={onClose}
            className={`${hasChanges ? 'flex-1' : 'w-full'} px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold hover:shadow-lg`}
          >
            {hasChanges ? 'إلغاء' : 'إغلاق'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfigModal;
