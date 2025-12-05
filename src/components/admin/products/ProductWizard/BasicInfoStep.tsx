/**
 * BasicInfoStep - First step in Product Wizard
 * 
 * Collects essential product information:
 * - Name (Arabic & English)
 * - Price
 * - Category
 * - Image
 * - Availability
 */

'use client';

import React from 'react';
import type { ProductFormData } from '../UnifiedProductForm/types';

interface BasicInfoStepProps {
  data: ProductFormData;
  onChange: (data: ProductFormData) => void;
  isEditing: boolean;
}

// Common categories
const CATEGORIES = [
  { value: 'آيس كريم', label: 'آيس كريم 🍦' },
  { value: 'ميلك شيك', label: 'ميلك شيك 🥤' },
  { value: 'سموذي', label: 'سموذي 🍹' },
  { value: 'وافل', label: 'وافل 🧇' },
  { value: 'كريب', label: 'كريب 🥞' },
  { value: 'حلويات', label: 'حلويات 🍰' },
  { value: 'مشروبات', label: 'مشروبات ☕' },
];

const BasicInfoStep: React.FC<BasicInfoStepProps> = ({ data, onChange, isEditing }) => {
  const handleChange = (field: keyof ProductFormData, value: string | number) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-800">📝 المعلومات الأساسية</h3>
        <p className="text-gray-500 mt-2">أدخل المعلومات الأساسية للمنتج</p>
      </div>

      {/* Product ID (only for editing) */}
      {isEditing && (
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
          <label className="block text-sm font-medium text-gray-500 mb-1">
            معرف المنتج
          </label>
          <p className="text-gray-800 font-mono">{data.id}</p>
        </div>
      )}

      {/* Name Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Arabic Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            اسم المنتج (عربي) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={data.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="مثال: آيس كريم فانيلا"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
            required
          />
        </div>

        {/* English Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            اسم المنتج (إنجليزي)
          </label>
          <input
            type="text"
            value={data.nameEn}
            onChange={(e) => handleChange('nameEn', e.target.value)}
            placeholder="e.g. Vanilla Ice Cream"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
            dir="ltr"
          />
        </div>
      </div>

      {/* Price & Category */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Price */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            السعر (ج.م) <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={data.price}
              onChange={(e) => handleChange('price', e.target.value)}
              placeholder="0"
              min="0"
              step="0.5"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all pl-12"
              required
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">
              ج.م
            </span>
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            الفئة <span className="text-red-500">*</span>
          </label>
          <select
            value={data.category}
            onChange={(e) => handleChange('category', e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all bg-white"
            required
          >
            <option value="">اختر الفئة...</option>
            {CATEGORIES.map(cat => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Discount Fields */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-5 border-2 border-amber-200">
        <h4 className="font-semibold text-amber-800 mb-4 flex items-center gap-2">
          <span>🏷️</span> الخصم (اختياري)
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Old Price */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              السعر القديم
            </label>
            <input
              type="number"
              value={data.old_price}
              onChange={(e) => handleChange('old_price', e.target.value)}
              placeholder="السعر قبل الخصم"
              min="0"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all"
            />
          </div>

          {/* Discount Percentage */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              نسبة الخصم %
            </label>
            <input
              type="number"
              value={data.discount_percentage}
              onChange={(e) => handleChange('discount_percentage', e.target.value)}
              placeholder="مثال: 20"
              min="0"
              max="100"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Image URL */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          رابط الصورة
        </label>
        <input
          type="url"
          value={data.image}
          onChange={(e) => handleChange('image', e.target.value)}
          placeholder="https://example.com/image.jpg"
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
          dir="ltr"
        />
        {data.image && (
          <div className="mt-3 flex items-center gap-4">
            <img
              src={data.image}
              alt="معاينة"
              className="w-20 h-20 object-cover rounded-xl border-2 border-gray-200"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder-product.png';
              }}
            />
            <span className="text-sm text-gray-500">معاينة الصورة</span>
          </div>
        )}
      </div>

      {/* Description Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Arabic Description */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            الوصف (عربي)
          </label>
          <textarea
            value={data.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="وصف مختصر للمنتج..."
            rows={3}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all resize-none"
          />
        </div>

        {/* English Description */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            الوصف (إنجليزي)
          </label>
          <textarea
            value={data.descriptionEn}
            onChange={(e) => handleChange('descriptionEn', e.target.value)}
            placeholder="Short product description..."
            rows={3}
            dir="ltr"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all resize-none"
          />
        </div>
      </div>

      {/* Category English & Badge */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Category English */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            الفئة (إنجليزي)
          </label>
          <input
            type="text"
            value={data.categoryEn}
            onChange={(e) => handleChange('categoryEn', e.target.value)}
            placeholder="e.g. Ice Cream"
            dir="ltr"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
          />
        </div>

        {/* Badge */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            الشارة (Badge)
          </label>
          <input
            type="text"
            value={data.badge}
            onChange={(e) => handleChange('badge', e.target.value)}
            placeholder="مثال: جديد، الأكثر مبيعاً"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
          />
        </div>
      </div>

      {/* Availability Toggle */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
        <div>
          <p className="font-semibold text-gray-800">حالة التوفر</p>
          <p className="text-sm text-gray-500">هل المنتج متاح للطلب؟</p>
        </div>
        <button
          type="button"
          onClick={() => handleChange('available', data.available === 1 ? 0 : 1)}
          className={`relative w-14 h-8 rounded-full transition-all ${
            data.available === 1 ? 'bg-green-500' : 'bg-gray-300'
          }`}
        >
          <span
            className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-all ${
              data.available === 1 ? 'right-1' : 'left-1'
            }`}
          />
        </button>
      </div>
    </div>
  );
};

export default BasicInfoStep;
