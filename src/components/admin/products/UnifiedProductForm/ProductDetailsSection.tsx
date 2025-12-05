/**
 * ProductDetailsSection Component
 * 
 * Displays and manages product details fields in the unified form.
 * Includes product_type selector with template trigger.
 * Nutrition fields moved to NutritionSection (Requirements 5.3)
 * 
 * @module admin/products/UnifiedProductForm/ProductDetailsSection
 * Requirements: 1.1, 1.2, 2.4, 5.3 - Added template_id and card_style fields
 */

'use client';

import React from 'react';
import type { ProductDetailsSectionProps } from './types';

const ProductDetailsSection: React.FC<ProductDetailsSectionProps> = ({
  formData,
  onChange,
  isEditing,
}) => {
  // Debug: Log formData on every render
  console.log('🎯 ProductDetailsSection render, formData:', formData);

  const handleChange = (field: string, value: string | number | string[]) => {
    console.log('🔄 ProductDetailsSection handleChange:', { field, value });
    onChange({ ...formData, [field]: value });
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
              onFocus={() => console.log('👆 Input focused: name')}
              onClick={() => console.log('🖱️ Input clicked: name')}
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

      {/* Pricing & Discounts Section - Requirement 8 */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-5 border-2 border-amber-200">
        <h3 className="text-lg font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-4 flex items-center gap-2">
          <span>💰</span> التسعير والخصومات
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          {/* Current Price */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">السعر الحالي * (جنيه)</label>
            <div className="relative">
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => handleChange('price', e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all bg-white"
                placeholder="25.00"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">ج</span>
            </div>
          </div>

          {/* Old Price */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              السعر القديم (اختياري)
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.old_price || ''}
                onChange={(e) => {
                  const oldPriceStr = e.target.value;
                  handleChange('old_price', oldPriceStr);

                  // Auto-calculate discount percentage
                  const oldPrice = oldPriceStr ? parseFloat(oldPriceStr) : 0;
                  const currentPrice = formData.price ? parseFloat(formData.price) : 0;

                  if (oldPrice && currentPrice && oldPrice > currentPrice) {
                    const discountPct = Math.round(((oldPrice - currentPrice) / oldPrice) * 100);
                    handleChange('discount_percentage', discountPct.toString());
                  } else {
                    handleChange('discount_percentage', '');
                  }
                }}
                className="w-full px-4 py-2.5 border-2 border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all bg-white"
                placeholder="50.00"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">ج</span>
            </div>
          </div>

          {/* Discount Percentage */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              نسبة الخصم (%)
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="100"
                value={formData.discount_percentage || ''}
                onChange={(e) => handleChange('discount_percentage', e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all bg-white disabled:bg-gray-100"
                placeholder="تلقائي"
                disabled
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">%</span>
            </div>
          </div>
        </div>

        {/* Discount Preview */}
        {(() => {
          const oldPrice = formData.old_price ? parseFloat(formData.old_price) : 0;
          const currentPrice = formData.price ? parseFloat(formData.price) : 0;
          const discountPct = formData.discount_percentage ? parseInt(formData.discount_percentage) : 0;

          return oldPrice && currentPrice && oldPrice > currentPrice && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-green-600">🎯</span>
                <span className="text-sm text-green-800">
                  سيظهر السعر: <span className="line-through opacity-75">{oldPrice}</span> <span className="font-bold">{currentPrice} ج.م</span>
                </span>
              </div>
              <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">
                خصم {discountPct}%
              </span>
            </div>
          )
        })()}
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
