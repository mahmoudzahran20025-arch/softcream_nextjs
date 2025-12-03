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
import { PRODUCT_TYPES, CARD_STYLE_OPTIONS } from './types';

const ProductDetailsSection: React.FC<ProductDetailsSectionProps> = ({
  formData,
  onChange,
  isEditing,
  onProductTypeChange,
}) => {
  // Debug: Log formData on every render
  console.log('🎯 ProductDetailsSection render, formData:', formData);

  const handleChange = (field: string, value: string | number | string[]) => {
    console.log('🔄 ProductDetailsSection handleChange:', { field, value });
    onChange({ ...formData, [field]: value });
  };

  const handleProductTypeChange = (newType: string) => {
    handleChange('product_type', newType);
    onProductTypeChange?.(newType);
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
            <label className="block text-sm font-semibold text-gray-700 mb-2">السعر الحالي * (جنيه)</label>
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
            <p className="text-xs text-gray-500 mt-1">هذا هو السعر النهائي بعد الخصم</p>
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

      {/* Pricing & Discounts Section */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-5 border-2 border-amber-200">
        <h3 className="text-lg font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-4 flex items-center gap-2">
          <span>💰</span> التسعير والخصومات
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          اضبط السعر القديم لعرض خصم على المنتج. سيتم حساب نسبة الخصم تلقائياً.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              السعر القديم (قبل الخصم) - اختياري
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
                placeholder="مثال: 50.00"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">ج</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {formData.old_price ? '✅ سيظهر السعر القديم مشطوب' : '💡 اتركه فارغاً إذا لم يكن هناك خصم'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              نسبة الخصم (%) - تلقائي
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="100"
                value={formData.discount_percentage || ''}
                onChange={(e) => handleChange('discount_percentage', e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all bg-white"
                placeholder="يتم حسابها تلقائياً"
                disabled
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">%</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {formData.discount_percentage ? `🎉 خصم ${formData.discount_percentage}%` : '📊 سيتم الحساب عند إدخال السعر القديم'}
            </p>
          </div>
        </div>

        {/* Discount Preview */}
        {(() => {
          const oldPrice = formData.old_price ? parseFloat(formData.old_price) : 0;
          const currentPrice = formData.price ? parseFloat(formData.price) : 0;
          const discountPct = formData.discount_percentage ? parseInt(formData.discount_percentage) : 0;

          return oldPrice && currentPrice && oldPrice > currentPrice && (
            <div className="mt-4 p-4 bg-green-50 border-2 border-green-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-green-800">🎯 معاينة الخصم:</p>
                  <p className="text-xs text-green-600 mt-1">
                    السعر القديم: <span className="line-through">{oldPrice.toFixed(2)} ج.م</span>
                  </p>
                  <p className="text-xs text-green-600">
                    السعر الجديد: <span className="font-bold text-lg">{currentPrice.toFixed(2)} ج.م</span>
                  </p>
                </div>
                <div className="text-left">
                  <div className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
                    <p className="text-xs font-medium">وفر</p>
                    <p className="text-2xl font-bold">{(oldPrice - currentPrice).toFixed(2)} ج</p>
                    <p className="text-xs">خصم {discountPct}%</p>
                  </div>
                </div>
              </div>
            </div>
          )
        })()}

        {/* Warning for invalid discount */}
        {(() => {
          const oldPrice = formData.old_price ? parseFloat(formData.old_price) : 0;
          const currentPrice = formData.price ? parseFloat(formData.price) : 0;

          return oldPrice && currentPrice && oldPrice <= currentPrice && (
            <div className="mt-4 p-3 bg-yellow-50 border-2 border-yellow-200 rounded-lg flex items-start gap-2">
              <span className="text-lg">⚠️</span>
              <p className="text-sm text-yellow-800">
                <strong>تنبيه:</strong> السعر القديم يجب أن يكون <strong>أكبر</strong> من السعر الحالي لعرض الخصم.
              </p>
            </div>
          )
        })()}
      </div>

      {/* Template ID Display - Requirement 2.4 (read-only reference) */}
      {formData.template_id && (
        <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl p-4 border-2 border-violet-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">🎨</span>
              <span className="text-sm font-semibold text-violet-700">القالب المختار:</span>
              <span className="px-3 py-1 bg-violet-100 text-violet-800 rounded-full text-sm font-medium">
                {formData.template_id}
              </span>
            </div>
            <span className="text-xs text-gray-500">
              يمكنك تغييره من تبويب &quot;القالب&quot;
            </span>
          </div>
        </div>
      )}

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
              className={`p-4 rounded-xl border-2 text-right transition-all ${formData.product_type === type.value
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

      {/* Card Style - Requirement 2.4 */}
      <div className="bg-gradient-to-br from-indigo-50 to-violet-50 rounded-xl p-5 border-2 border-indigo-200">
        <h3 className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent mb-4 flex items-center gap-2">
          <span>🎴</span> نمط عرض البطاقة
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          اختر كيف سيظهر المنتج في واجهة العملاء
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {CARD_STYLE_OPTIONS.map((style) => (
            <button
              key={style.value}
              type="button"
              onClick={() => handleChange('card_style', style.value)}
              className={`p-4 rounded-xl border-2 text-right transition-all ${formData.card_style === style.value
                ? 'border-indigo-500 bg-indigo-50 shadow-md'
                : 'border-gray-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/50'
                }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{style.icon}</span>
                <div>
                  <div className="font-semibold text-gray-800">{style.label}</div>
                  <div className="text-xs text-gray-500">{style.description}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
        {!formData.card_style && (
          <p className="text-xs text-amber-600 mt-2">
            💡 سيتم استخدام النمط الافتراضي بناءً على القالب المختار
          </p>
        )}
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
