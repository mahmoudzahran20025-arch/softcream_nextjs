/**
 * NutritionSection Component
 * 
 * Displays and manages nutrition-related fields in the unified form.
 * Includes nutrition values, energy info, health keywords, and metadata.
 * 
 * @module admin/products/UnifiedProductForm/NutritionSection
 * Requirements: 5.3 - Organize form in tabs (Tab 4: Nutrition)
 */

'use client';

import React from 'react';
import type { ProductFormData } from './types';
import { HEALTH_KEYWORDS_OPTIONS } from './types';

export interface NutritionSectionProps {
  /** Current form data */
  formData: ProductFormData;
  /** Callback when form data changes */
  onChange: (data: ProductFormData) => void;
}

const NutritionSection: React.FC<NutritionSectionProps> = ({
  formData,
  onChange,
}) => {
  const handleChange = (field: string, value: string | number | string[]) => {
    onChange({ ...formData, [field]: value });
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
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${formData.health_keywords.includes(kw.value)
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
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${formData.health_keywords.includes(kw.value)
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
          {/* Note: Tags field removed - it's now in ProductDetailsSection with better UX */}
          {[
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

      {/* NEW: Health Benefit Description - Priority 2 */}
      <div className="col-span-2">
        <label className="block text-sm font-semibold text-green-700 mb-2">
          الفائدة الصحية (عربي)
        </label>
        <textarea
          value={formData.health_benefit_ar || ''}
          onChange={(e) => onChange({ ...formData, health_benefit_ar: e.target.value })}
          rows={2}
          className="w-full px-4 py-2.5 border-2 border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          placeholder="مثال: غني بالبروتين ويساعد على بناء العضلات"
        />
        <p className="text-xs text-gray-500 mt-1">
          💡 وصف مفصل للفائدة الصحية للمنتج
        </p>
      </div>
    </div>
  );
};

export default NutritionSection;
