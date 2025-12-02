/**
 * ProductDetailsSection Component
 * 
 * Displays and manages product details fields in the unified form.
 * Includes product_type selector with template trigger.
 * 
 * @module admin/products/UnifiedProductForm/ProductDetailsSection
 * Requirements: 1.1, 1.2
 */

'use client';

import React from 'react';
import type { ProductDetailsSectionProps } from './types';
import { PRODUCT_TYPES, HEALTH_KEYWORDS_OPTIONS } from './types';

const ProductDetailsSection: React.FC<ProductDetailsSectionProps> = ({
  formData,
  onChange,
  isEditing,
  onProductTypeChange,
}) => {
  const handleChange = (field: string, value: string | number | string[]) => {
    onChange({ ...formData, [field]: value });
  };

  const handleProductTypeChange = (newType: string) => {
    handleChange('product_type', newType);
    onProductTypeChange?.(newType);
  };

  const handleHealthKeywordToggle = (keyword: string) => {
    const current = formData.health_keywords;
    if (current.includes(keyword)) {
      handleChange('health_keywords', current.filter(k => k !== keyword));
    } else if (current.length < 3) {
      handleChange('health_keywords', [...current, keyword]);
    }
  };

  return (
    <div className="space-y-6">
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
              onChange={(e) => handleChange('id', e.target.value)}
              disabled={isEditing}
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
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all bg-white"
              placeholder="مثال: آيس كريم فانيليا"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">الاسم (الإنجليزية)</label>
            <input
              type="text"
              value={formData.nameEn}
              onChange={(e) => handleChange('nameEn', e.target.value)}
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
              onChange={(e) => handleChange('category', e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all bg-white"
              placeholder="مثال: آيس كريم"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">الفئة (الإنجليزية)</label>
            <input
              type="text"
              value={formData.categoryEn}
              onChange={(e) => handleChange('categoryEn', e.target.value)}
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
                onChange={(e) => handleChange('price', e.target.value)}
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
              onChange={(e) => handleChange('badge', e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all bg-white"
              placeholder="مثال: جديد، الأكثر مبيعاً"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">رابط الصورة</label>
            <input
              type="url"
              value={formData.image}
              onChange={(e) => handleChange('image', e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all bg-white"
              placeholder="https://example.com/image.jpg"
            />
          </div>
        </div>
      </div>

      {/* Product Type - Requirement 1.2 */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border-2 border-purple-200">
        <h3 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4 flex items-center gap-2">
          <span>✨</span> نوع المنتج
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          اختر نوع المنتج لتحديد خيارات التخصيص المقترحة تلقائياً
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {PRODUCT_TYPES.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => handleProductTypeChange(type.value)}
              className={`p-4 rounded-xl border-2 text-right transition-all ${
                formData.product_type === type.value
                  ? 'border-purple-500 bg-purple-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{type.icon}</span>
                <div>
                  <div className="font-semibold text-gray-800">{type.label}</div>
                  <div className="text-xs text-gray-500">{type.description}</div>
                </div>
              </div>
            </button>
          ))}
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
              onChange={(e) => handleChange('description', e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white resize-none"
              placeholder="وصف المنتج بالتفصيل..."
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">الوصف (الإنجليزية)</label>
            <textarea
              value={formData.descriptionEn}
              onChange={(e) => handleChange('descriptionEn', e.target.value)}
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
                value={formData[key as keyof typeof formData] as string}
                onChange={(e) => handleChange(key, e.target.value)}
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
              onChange={(e) => handleChange('energy_type', e.target.value)}
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
              onChange={(e) => handleChange('energy_score', e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-yellow-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all bg-white"
              placeholder="45"
            />
          </div>
        </div>
      </div>

      {/* Health Keywords */}
      <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl p-5 border-2 border-teal-200">
        <h3 className="text-lg font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent mb-4 flex items-center gap-2">
          <span>💚</span> معلومات صحية
        </h3>
        
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            الكلمات المفتاحية الصحية (اختر حتى 3)
          </label>
          <div className="space-y-3">
            <div>
              <p className="text-xs font-medium text-teal-600 mb-2">🥗 تغذوية</p>
              <div className="flex flex-wrap gap-2">
                {HEALTH_KEYWORDS_OPTIONS.nutritional.map(kw => (
                  <button
                    key={kw.value}
                    type="button"
                    onClick={() => handleHealthKeywordToggle(kw.value)}
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
            
            <div>
              <p className="text-xs font-medium text-cyan-600 mb-2">🌟 نمط الحياة</p>
              <div className="flex flex-wrap gap-2">
                {HEALTH_KEYWORDS_OPTIONS.lifestyle.map(kw => (
                  <button
                    key={kw.value}
                    type="button"
                    onClick={() => handleHealthKeywordToggle(kw.value)}
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
        
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            الفائدة الصحية (بالعربية)
          </label>
          <textarea
            value={formData.health_benefit_ar}
            onChange={(e) => handleChange('health_benefit_ar', e.target.value)}
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
                value={formData[key as keyof typeof formData] as string}
                onChange={(e) => handleChange(key, e.target.value)}
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
            onChange={(e) => handleChange('available', e.target.checked ? 1 : 0)}
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
    </div>
  );
};

export default ProductDetailsSection;
