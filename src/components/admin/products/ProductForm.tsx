// src/components/admin/products/ProductForm.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import type { ProductFormProps, ProductFormData } from './types';
import { INITIAL_FORM_DATA, HEALTH_KEYWORDS_OPTIONS } from './types';

// Helper to parse health_keywords from JSON string
const parseHealthKeywords = (value: string | null | undefined): string[] => {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const ProductForm: React.FC<ProductFormProps> = ({ 
  isOpen, 
  onClose, 
  editingProduct, 
  onSubmit 
}) => {
  const [formData, setFormData] = useState<ProductFormData>(INITIAL_FORM_DATA);

  useEffect(() => {
    if (editingProduct) {
      setFormData({
        id: editingProduct.id,
        name: editingProduct.name,
        nameEn: editingProduct.nameEn || '',
        category: editingProduct.category,
        categoryEn: editingProduct.categoryEn || '',
        price: editingProduct.price.toString(),
        description: editingProduct.description || '',
        descriptionEn: editingProduct.descriptionEn || '',
        image: editingProduct.image || '',
        badge: editingProduct.badge || '',
        available: editingProduct.available,
        // ✅ Template System (Requirements 3.1)
        template_id: editingProduct.template_id || 'template_1',
        ui_config: editingProduct.ui_config || '{}',
        // Discount fields
        old_price: editingProduct.old_price?.toString() || '',
        discount_percentage: editingProduct.discount_percentage?.toString() || '',
        // Nutrition
        calories: editingProduct.calories?.toString() || '',
        protein: editingProduct.protein?.toString() || '',
        carbs: editingProduct.carbs?.toString() || '',
        fat: editingProduct.fat?.toString() || '',
        sugar: editingProduct.sugar?.toString() || '',
        fiber: editingProduct.fiber?.toString() || '',
        energy_type: editingProduct.energy_type || 'none',
        energy_score: editingProduct.energy_score?.toString() || '',
        tags: editingProduct.tags || '',
        ingredients: editingProduct.ingredients || '',
        nutrition_facts: editingProduct.nutrition_facts || '',
        allergens: editingProduct.allergens || '',
        health_keywords: parseHealthKeywords((editingProduct as any).health_keywords),
        health_benefit_ar: (editingProduct as any).health_benefit_ar || ''
      });
    } else {
      setFormData(INITIAL_FORM_DATA);
    }
  }, [editingProduct]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const handleClose = () => {
    setFormData(INITIAL_FORM_DATA);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-white">
                {editingProduct ? '✏️ تعديل منتج' : '✨ إضافة منتج جديد'}
              </h2>
              <p className="text-pink-100 text-sm mt-1">
                {editingProduct ? 'قم بتحديث معلومات المنتج' : 'أضف منتج جديد إلى القائمة'}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-all text-white"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Basic Information */}
          <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl p-5 border-2 border-pink-200">
            <h3 className="text-lg font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-4 flex items-center gap-2">
              <span>📝</span> المعلومات الأساسية
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">معرف المنتج *</label>
                <input
                  type="text"
                  required
                  value={formData.id}
                  onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                  disabled={!!editingProduct}
                  className="w-full px-4 py-2.5 border-2 border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all bg-white disabled:bg-gray-100"
                  placeholder="مثال: ice-cream-vanilla"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">الاسم (العربية) *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all bg-white"
                  placeholder="مثال: آيس كريم فانيليا"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">الاسم (الإنجليزية)</label>
                <input
                  type="text"
                  value={formData.nameEn}
                  onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all bg-white"
                  placeholder="Vanilla Ice Cream"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">الفئة *</label>
                <input
                  type="text"
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all bg-white"
                  placeholder="مثال: آيس كريم"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">الفئة (الإنجليزية)</label>
                <input
                  type="text"
                  value={formData.categoryEn}
                  onChange={(e) => setFormData({ ...formData, categoryEn: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all bg-white"
                  placeholder="Ice Cream"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">السعر * (جنيه)</label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all bg-white"
                    placeholder="25.00"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">ج</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">شارة مميزة</label>
                <input
                  type="text"
                  value={formData.badge}
                  onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all bg-white"
                  placeholder="مثال: جديد، الأكثر مبيعاً"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">رابط الصورة</label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all bg-white"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-5 border-2 border-blue-200">
            <h3 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-4 flex items-center gap-2">
              <span>📄</span> الوصف
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">الوصف (العربية)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white resize-none"
                  placeholder="وصف المنتج بالتفصيل..."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">الوصف (الإنجليزية)</label>
                <textarea
                  value={formData.descriptionEn}
                  onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white resize-none"
                  placeholder="Product description in detail..."
                />
              </div>
            </div>
          </div>

          {/* Nutrition */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border-2 border-green-200">
            <h3 className="text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4 flex items-center gap-2">
              <span>🥗</span> معلومات التغذية
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { key: 'calories', label: '🔥 السعرات', placeholder: '207' },
                { key: 'protein', label: '💪 البروتين (g)', placeholder: '3.5' },
                { key: 'carbs', label: '🍞 الكربوهيدرات (g)', placeholder: '24' },
                { key: 'fat', label: '🧈 الدهون (g)', placeholder: '11' },
                { key: 'sugar', label: '🍬 السكر (g)', placeholder: '21' },
                { key: 'fiber', label: '🌾 الألياف (g)', placeholder: '0.5' },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">{label}</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData[key as keyof ProductFormData] as string}
                    onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white text-sm"
                    placeholder={placeholder}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Energy */}
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-5 border-2 border-yellow-200">
            <h3 className="text-lg font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent mb-4 flex items-center gap-2">
              <span>⚡</span> معلومات الطاقة
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">نوع الطاقة</label>
                <select
                  value={formData.energy_type}
                  onChange={(e) => setFormData({ ...formData, energy_type: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-yellow-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all bg-white"
                >
                  <option value="none">🚫 بدون</option>
                  <option value="mental">🧠 ذهني</option>
                  <option value="physical">💪 جسدي</option>
                  <option value="balanced">⚖️ متوازن</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">درجة الطاقة (0-100)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.energy_score}
                  onChange={(e) => setFormData({ ...formData, energy_score: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-yellow-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all bg-white"
                  placeholder="45"
                />
              </div>
            </div>
          </div>

          {/* Health Keywords */}
          <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl p-5 border-2 border-teal-200">
            <h3 className="text-lg font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent mb-4 flex items-center gap-2">
              <span>💚</span> معلومات صحية (Health-Driven Cart)
            </h3>
            
            {/* Health Keywords Multi-Select */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                الكلمات المفتاحية الصحية (اختر حتى 3)
              </label>
              <div className="space-y-3">
                {/* Nutritional Keywords */}
                <div>
                  <p className="text-xs font-medium text-teal-600 mb-2">🥗 تغذوية</p>
                  <div className="flex flex-wrap gap-2">
                    {HEALTH_KEYWORDS_OPTIONS.nutritional.map(kw => (
                      <button
                        key={kw.value}
                        type="button"
                        onClick={() => {
                          const current = formData.health_keywords;
                          if (current.includes(kw.value)) {
                            setFormData({ ...formData, health_keywords: current.filter(k => k !== kw.value) });
                          } else if (current.length < 3) {
                            setFormData({ ...formData, health_keywords: [...current, kw.value] });
                          }
                        }}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                          formData.health_keywords.includes(kw.value)
                            ? 'bg-teal-500 text-white shadow-md'
                            : 'bg-white border border-teal-200 text-teal-700 hover:bg-teal-50'
                        } ${formData.health_keywords.length >= 3 && !formData.health_keywords.includes(kw.value) ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={formData.health_keywords.length >= 3 && !formData.health_keywords.includes(kw.value)}
                      >
                        {kw.label}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Lifestyle Keywords */}
                <div>
                  <p className="text-xs font-medium text-cyan-600 mb-2">🌟 نمط الحياة</p>
                  <div className="flex flex-wrap gap-2">
                    {HEALTH_KEYWORDS_OPTIONS.lifestyle.map(kw => (
                      <button
                        key={kw.value}
                        type="button"
                        onClick={() => {
                          const current = formData.health_keywords;
                          if (current.includes(kw.value)) {
                            setFormData({ ...formData, health_keywords: current.filter(k => k !== kw.value) });
                          } else if (current.length < 3) {
                            setFormData({ ...formData, health_keywords: [...current, kw.value] });
                          }
                        }}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                          formData.health_keywords.includes(kw.value)
                            ? 'bg-cyan-500 text-white shadow-md'
                            : 'bg-white border border-cyan-200 text-cyan-700 hover:bg-cyan-50'
                        } ${formData.health_keywords.length >= 3 && !formData.health_keywords.includes(kw.value) ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={formData.health_keywords.length >= 3 && !formData.health_keywords.includes(kw.value)}
                      >
                        {kw.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                المختار: {formData.health_keywords.length}/3
              </p>
            </div>
            
            {/* Health Benefit Arabic */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                الفائدة الصحية (بالعربية)
              </label>
              <textarea
                value={formData.health_benefit_ar}
                onChange={(e) => setFormData({ ...formData, health_benefit_ar: e.target.value })}
                rows={2}
                className="w-full px-4 py-2.5 border-2 border-teal-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all bg-white resize-none"
                placeholder="مثال: غني بالبروتين ومنخفض السكر - مثالي للرياضيين"
                maxLength={200}
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.health_benefit_ar.length}/200 حرف
              </p>
            </div>
          </div>

          {/* Customization Note */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border-2 border-purple-200">
            <h3 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3 flex items-center gap-2">
              <span>✨</span> إعدادات التخصيص
            </h3>
            <div className="bg-white bg-opacity-50 p-4 rounded-lg">
              <p className="text-sm text-gray-700 mb-2">
                💡 لإدارة خيارات التخصيص (النكهات، الصوصات، الإضافات) لهذا المنتج:
              </p>
              <ol className="text-sm text-gray-600 list-decimal list-inside space-y-1">
                <li>احفظ المنتج أولاً</li>
                <li>اضغط على زر ⚙️ (إعدادات التخصيص) في كارت المنتج</li>
                <li>اختر نوع المنتج وقواعد التخصيص</li>
              </ol>
            </div>
          </div>

          {/* Metadata */}
          <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-5 border-2 border-gray-200">
            <h3 className="text-lg font-bold bg-gradient-to-r from-gray-700 to-slate-700 bg-clip-text text-transparent mb-4 flex items-center gap-2">
              <span>🏷️</span> معلومات إضافية (JSON)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: 'tags', label: '🏷️ الوسوم', placeholder: '["classic","creamy"]' },
                { key: 'ingredients', label: '🥛 المكونات', placeholder: '["fresh milk","vanilla"]' },
                { key: 'nutrition_facts', label: '📊 الحقائق الغذائية', placeholder: '{"vitamins":{}}' },
                { key: 'allergens', label: '⚠️ مسببات الحساسية', placeholder: '["milk"]' },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
                  <textarea
                    value={formData[key as keyof ProductFormData] as string}
                    onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all bg-white font-mono text-sm resize-none"
                    placeholder={placeholder}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Availability */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-200">
            <label htmlFor="available" className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                id="available"
                checked={formData.available === 1}
                onChange={(e) => setFormData({ ...formData, available: e.target.checked ? 1 : 0 })}
                className="w-5 h-5 text-green-600 border-green-300 rounded focus:ring-green-500"
              />
              <div className="flex-1">
                <span className="text-base font-bold text-gray-800">متاح للبيع</span>
                <p className="text-xs text-gray-600 mt-0.5">
                  {formData.available === 1 ? '✅ المنتج متاح للعملاء' : '❌ المنتج غير متاح حالياً'}
                </p>
              </div>
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6 mt-6 border-t-2 border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-3 text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-100 hover:border-gray-400 transition-all font-semibold"
            >
              ❌ إلغاء
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl hover:shadow-xl hover:scale-105 transition-all font-bold"
            >
              <Save size={20} />
              <span>{editingProduct ? '💾 تحديث المنتج' : '✨ حفظ المنتج'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;
