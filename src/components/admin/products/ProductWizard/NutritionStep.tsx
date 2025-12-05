/**
 * NutritionStep - Third step in Product Wizard
 * 
 * Collects nutritional information (optional):
 * - Calories, Protein, Carbs, Fat, Sugar, Fiber
 * - Energy type and score
 * - Health keywords
 */

'use client';

import React from 'react';
import type { ProductFormData } from '../UnifiedProductForm/types';
import { HEALTH_KEYWORDS_OPTIONS } from '../UnifiedProductForm/types';

interface NutritionStepProps {
  data: ProductFormData;
  onChange: (data: ProductFormData) => void;
}

const NutritionStep: React.FC<NutritionStepProps> = ({ data, onChange }) => {
  const handleChange = (field: keyof ProductFormData, value: string | number | string[]) => {
    onChange({ ...data, [field]: value });
  };

  const toggleHealthKeyword = (keyword: string) => {
    const current = data.health_keywords || [];
    const updated = current.includes(keyword)
      ? current.filter(k => k !== keyword)
      : [...current, keyword];
    handleChange('health_keywords', updated);
  };

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-800">🍎 القيم الغذائية</h3>
        <p className="text-gray-500 mt-2">أضف المعلومات الغذائية للمنتج (اختياري)</p>
      </div>

      {/* Quick Skip Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-sm text-blue-700">
          💡 هذه الخطوة اختيارية. يمكنك تخطيها والعودة لإضافة القيم الغذائية لاحقاً.
        </p>
      </div>

      {/* Main Nutrition Values */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200">
        <h4 className="font-semibold text-green-800 mb-4 flex items-center gap-2">
          <span>📊</span> القيم الغذائية الأساسية
        </h4>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {/* Calories */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              السعرات الحرارية
            </label>
            <div className="relative">
              <input
                type="number"
                value={data.calories}
                onChange={(e) => handleChange('calories', e.target.value)}
                placeholder="0"
                min="0"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                kcal
              </span>
            </div>
          </div>

          {/* Protein */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              البروتين
            </label>
            <div className="relative">
              <input
                type="number"
                value={data.protein}
                onChange={(e) => handleChange('protein', e.target.value)}
                placeholder="0"
                min="0"
                step="0.1"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                g
              </span>
            </div>
          </div>

          {/* Carbs */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              الكربوهيدرات
            </label>
            <div className="relative">
              <input
                type="number"
                value={data.carbs}
                onChange={(e) => handleChange('carbs', e.target.value)}
                placeholder="0"
                min="0"
                step="0.1"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                g
              </span>
            </div>
          </div>

          {/* Fat */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              الدهون
            </label>
            <div className="relative">
              <input
                type="number"
                value={data.fat}
                onChange={(e) => handleChange('fat', e.target.value)}
                placeholder="0"
                min="0"
                step="0.1"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                g
              </span>
            </div>
          </div>

          {/* Sugar */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              السكر
            </label>
            <div className="relative">
              <input
                type="number"
                value={data.sugar}
                onChange={(e) => handleChange('sugar', e.target.value)}
                placeholder="0"
                min="0"
                step="0.1"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                g
              </span>
            </div>
          </div>

          {/* Fiber */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              الألياف
            </label>
            <div className="relative">
              <input
                type="number"
                value={data.fiber}
                onChange={(e) => handleChange('fiber', e.target.value)}
                placeholder="0"
                min="0"
                step="0.1"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                g
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Energy Section */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border-2 border-amber-200">
        <h4 className="font-semibold text-amber-800 mb-4 flex items-center gap-2">
          <span>⚡</span> الطاقة
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Energy Type */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              نوع الطاقة
            </label>
            <select
              value={data.energy_type}
              onChange={(e) => handleChange('energy_type', e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all bg-white"
            >
              <option value="none">بدون</option>
              <option value="mental">ذهنية 🧠</option>
              <option value="physical">جسدية 💪</option>
              <option value="balanced">متوازنة ⚖️</option>
            </select>
          </div>

          {/* Energy Score */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              درجة الطاقة (0-100)
            </label>
            <input
              type="number"
              value={data.energy_score}
              onChange={(e) => handleChange('energy_score', e.target.value)}
              placeholder="0"
              min="0"
              max="100"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Health Keywords */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200">
        <h4 className="font-semibold text-purple-800 mb-4 flex items-center gap-2">
          <span>🏷️</span> الكلمات الصحية
        </h4>
        
        {/* Nutritional Keywords */}
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">القيم الغذائية:</p>
          <div className="flex flex-wrap gap-2">
            {HEALTH_KEYWORDS_OPTIONS.nutritional.map(keyword => (
              <button
                key={keyword.value}
                type="button"
                onClick={() => toggleHealthKeyword(keyword.value)}
                className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                  data.health_keywords?.includes(keyword.value)
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-purple-100'
                }`}
              >
                {keyword.label}
              </button>
            ))}
          </div>
        </div>

        {/* Lifestyle Keywords */}
        <div>
          <p className="text-sm text-gray-600 mb-2">نمط الحياة:</p>
          <div className="flex flex-wrap gap-2">
            {HEALTH_KEYWORDS_OPTIONS.lifestyle.map(keyword => (
              <button
                key={keyword.value}
                type="button"
                onClick={() => toggleHealthKeyword(keyword.value)}
                className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                  data.health_keywords?.includes(keyword.value)
                    ? 'bg-pink-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-pink-100'
                }`}
              >
                {keyword.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Health Benefit */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          الفائدة الصحية (عربي)
        </label>
        <textarea
          value={data.health_benefit_ar}
          onChange={(e) => handleChange('health_benefit_ar', e.target.value)}
          placeholder="مثال: غني بالبروتين ومنخفض السكر، مثالي للرياضيين"
          rows={2}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all resize-none"
        />
      </div>
    </div>
  );
};

export default NutritionStep;
