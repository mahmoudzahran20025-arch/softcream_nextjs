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
import { TEMPLATES, getTemplateById } from './templateConfig';

const ProductDetailsSection: React.FC<ProductDetailsSectionProps> = ({
  formData,
  onChange,
  isEditing,
}) => {
  // Debug: Log formData on every render
  console.log('🎯 ProductDetailsSection render, formData:', formData);

  // Pro mode removed - advanced features are now always available in collapsed sections

  // Helper for Smart Tags (Comma separated -> JSON)
  const handleTagsChange = (value: string) => {
    const tagsArray = value.split(',').map(t => t.trim()).filter(Boolean);
    onChange({ ...formData, tags: JSON.stringify(tagsArray) });
  };

  // Helper for reading tags
  const getTagsString = () => {
    try {
      if (!formData.tags) return '';
      const parsed = JSON.parse(formData.tags);
      return Array.isArray(parsed) ? parsed.join(', ') : formData.tags;
    } catch {
      return formData.tags || '';
    }
  };

  // Helper for Lifestyle Preset
  const toggleLifestyleMode = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      // Enable Lifestyle Mode
      const currentTags = getTagsString().split(',').map(t => t.trim()).filter(Boolean);
      if (!currentTags.includes('lifestyle')) currentTags.push('lifestyle');

      onChange({
        ...formData,
        template_id: 'template_lifestyle',
        tags: JSON.stringify(currentTags),
        ui_config: JSON.stringify({
          theme: "emerald_gradient",
          card_badge: "خيار ذكي",
          show_macros_on_card: true,
          loading_logo: "leaf_animated"
        })
      });
    } else {
      // Disable Lifestyle Mode (Basic Reset)
      onChange({
        ...formData,
        template_id: 'template_2', // Default to medium
        ui_config: '{}'
      });
    }
  };


  const handleChange = (field: string, value: string | number | string[]) => {
    console.log('🔄 ProductDetailsSection handleChange:', { field, value });
    
    // 🔍 DEBUG: Track template changes specifically
    if (field === 'template_id') {
      console.log('🎨 Template changed to:', value);
      console.log('📍 Current location:', typeof window !== 'undefined' ? window.location.pathname : 'SSR');
    }
    
    try {
      onChange({ ...formData, [field]: value });
    } catch (error) {
      console.error('❌ Error in handleChange:', error);
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
              onChange={(e) => {
                // Only allow English letters, numbers, underscores, and hyphens
                const sanitized = e.target.value.replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase();
                handleChange('id', sanitized);
              }}
              disabled={isEditing}
              className="w-full px-4 py-2.5 border-2 border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all bg-white disabled:bg-gray-100"
              placeholder="مثال: ice-cream-vanilla"
              pattern="[a-zA-Z0-9_-]+"
              title="يجب أن يحتوي على حروف إنجليزية وأرقام فقط"
            />
            <p className="text-xs text-gray-500 mt-1">حروف إنجليزية وأرقام فقط (a-z, 0-9, -, _)</p>
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

      {/* Template Selection - Requirements 6.2, 6.4: Visual previews and clear descriptions */}
      <div className="bg-gradient-to-br from-indigo-50 to-violet-50 rounded-xl p-5 border-2 border-indigo-200">
        <h3 className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent mb-3 flex items-center gap-2">
          <span>🎨</span> اختر قالب العرض
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          القالب يحدد نوع البطاقة التي ستظهر للعملاء. كل قالب يستخدم مكون بطاقة مختلف.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {TEMPLATES.map(template => {
            const isSelected = formData.template_id === template.id;
            // Theme colors based on template
            const themeColors = {
              amber: { border: 'border-amber-400', bg: 'bg-amber-50', badge: 'bg-amber-100 text-amber-700' },
              pink: { border: 'border-pink-400', bg: 'bg-pink-50', badge: 'bg-pink-100 text-pink-700' },
              purple: { border: 'border-purple-400', bg: 'bg-purple-50', badge: 'bg-purple-100 text-purple-700' },
              emerald: { border: 'border-emerald-400', bg: 'bg-emerald-50', badge: 'bg-emerald-100 text-emerald-700' },
            };
            const colors = themeColors[template.themeColor as keyof typeof themeColors] || themeColors.pink;
            
            return (
              <button
                key={template.id}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('🎨 Template button clicked:', template.id);
                  handleChange('template_id', template.id);
                }}
                className={`p-4 rounded-xl border-2 text-right transition-all relative overflow-hidden ${
                  isSelected
                    ? `${colors.border} ${colors.bg} shadow-lg ring-2 ring-offset-2 ring-indigo-300`
                    : 'border-gray-200 bg-white hover:border-indigo-300 hover:shadow-md'
                }`}
              >
                {/* Card Type Badge - Requirements 6.1 */}
                <div className={`absolute top-2 left-2 text-xs px-2 py-0.5 rounded-full font-medium ${colors.badge}`}>
                  {template.cardComponent}
                </div>
                
                {/* Selection indicator */}
                {isSelected && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                )}
                
                <div className="flex items-start gap-3 mb-3 mt-4">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-3xl ${colors.bg} border ${colors.border}`}>
                    {template.icon}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-gray-800 text-lg">{template.name}</div>
                    <div className="text-sm text-gray-500">{template.nameEn}</div>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                
                {/* Visual Preview Box */}
                <div className={`p-3 rounded-lg ${colors.bg} border ${colors.border}`}>
                  <div className="text-xs font-semibold text-gray-700 mb-1">👁️ المعاينة:</div>
                  <div className="text-sm text-gray-600">{template.preview}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Template Details - Requirements 6.2: Clear descriptions */}
        {formData.template_id && (() => {
          const selectedTemplate = getTemplateById(formData.template_id)
          if (!selectedTemplate) return null;
          
          const themeColors = {
            amber: { border: 'border-amber-200', bg: 'from-amber-50 to-orange-50', text: 'text-amber-700' },
            pink: { border: 'border-pink-200', bg: 'from-pink-50 to-rose-50', text: 'text-pink-700' },
            purple: { border: 'border-purple-200', bg: 'from-purple-50 to-violet-50', text: 'text-purple-700' },
            emerald: { border: 'border-emerald-200', bg: 'from-emerald-50 to-teal-50', text: 'text-emerald-700' },
          };
          const colors = themeColors[selectedTemplate.themeColor as keyof typeof themeColors] || themeColors.pink;
          
          return (
            <div className={`mt-4 p-4 bg-gradient-to-br ${colors.bg} rounded-xl border-2 ${colors.border}`}>
              {/* Card Component Info */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">🎴</span>
                <span className={`font-bold ${colors.text}`}>
                  يستخدم: {selectedTemplate.cardComponent}
                </span>
                <span className="text-xs bg-white px-2 py-0.5 rounded-full text-gray-600">
                  نوع البطاقة: {selectedTemplate.cardType}
                </span>
              </div>
              
              <div className="text-sm font-semibold text-gray-700 mb-2">
                📌 الاستخدام المثالي:
              </div>
              <p className="text-sm text-gray-700 mb-3">{selectedTemplate.usage}</p>
              
              <div className="text-sm font-semibold text-gray-700 mb-2">
                ✨ المميزات:
              </div>
              <ul className="text-sm text-gray-700 space-y-1">
                {selectedTemplate.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className={`${colors.text} mt-0.5`}>•</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )
        })()}
      </div>

      {/* Pricing & Discounts Section */}
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
              السعر الأصلي (قبل الخصم) *
            </label>
            <p className="text-xs text-gray-600 mb-2">
              أدخل السعر الأصلي إذا كان هناك خصم. النسبة ستُحسب تلقائياً
            </p>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.old_price || ''}
                onChange={(e) => handleChange('old_price', e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all bg-white"
                placeholder="50.00"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">ج</span>
            </div>
          </div>
        </div>

        {/* Discount Preview - Auto-calculated */}
        {(() => {
          const oldPrice = formData.old_price ? parseFloat(formData.old_price) : 0;
          const currentPrice = formData.price ? parseFloat(formData.price) : 0;
          const discountPct = oldPrice && currentPrice && oldPrice > currentPrice
            ? Math.round(((oldPrice - currentPrice) / oldPrice) * 100)
            : 0;

          return discountPct > 0 && (
            <div className="mt-4 p-4 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-green-600 text-xl">✨</span>
                  <span className="text-sm font-semibold text-green-800">معاينة الخصم</span>
                </div>
                <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-bold px-3 py-1 rounded-full shadow-md">
                  خصم {discountPct}%
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-lg text-gray-400 line-through">{oldPrice} ج.م</span>
                <span className="text-2xl font-bold text-green-600">{currentPrice} ج.م</span>
                <span className="text-sm text-green-700">وفّر {(oldPrice - currentPrice).toFixed(2)} جنيه!</span>
              </div>
            </div>
          );
        })()}
      </div>

      {/* 🚀 LIFESTYLE SHORTCUT (Quick Setup) */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 border-2 border-emerald-200 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-emerald-800 flex items-center gap-2">
            <span className="text-xl">🌿</span> إعدادات المنتج الصحي (Lifestyle)
          </h3>
          <p className="text-xs text-emerald-600 mt-1">تفعيل هذا الخيار سيقوم بضبط القالب والتاجز تلقائياً</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={formData.template_id === 'template_lifestyle'}
            onChange={toggleLifestyleMode}
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
        </label>
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

      {/* Smart Tags Input (Replaces Complex JSON Input) */}
      <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-xl p-5 border-2 border-slate-200">
        <h3 className="text-lg font-bold text-slate-700 mb-3 flex items-center gap-2">
          <span>🏷️</span> الوسوم والتصنيف
        </h3>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">الوسوم (Tags)</label>
          <input
            type="text"
            value={getTagsString()}
            onChange={(e) => handleTagsChange(e.target.value)}
            className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 transition-all bg-white"
            placeholder="مثال: lifestyle, summer, new (افصل بفاصلة)"
          />
          <p className="text-xs text-gray-500 mt-1">اكتب الوسوم مفصولة بفاصلة (،) وسيتم تحويلها تلقائياً للنظام</p>
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
