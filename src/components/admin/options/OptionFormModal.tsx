/**
 * OptionFormModal - Create/Edit Option Modal
 * Requirements: 1.1, 3.1, 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 6.1, 6.2, 6.3, 6.4
 * 
 * Modal form for creating new options or editing existing ones.
 * Handles validation, form state, nutrition fields, submission, and API error display.
 * Enhanced with prominent description fields and nutrition preview.
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { X, Loader2, ImageIcon, AlertCircle, Eye, FileText } from 'lucide-react';
import type { OptionFormModalProps, OptionFormData } from './types';
import { INITIAL_OPTION_FORM_DATA } from './types';
import { getOptionErrorMessage, translateApiError } from '@/lib/admin/errorMessages';
import { toast } from '@/components/ui/Toast';
import NutritionBadge, { hasNutritionData } from '@/components/shared/NutritionBadge';

/**
 * Validation errors interface
 */
interface ValidationErrors {
  id?: string;
  name_ar?: string;
  name_en?: string;
  base_price?: string;
  image?: string;
}

/**
 * Validate ID format - must be English letters, numbers, underscores, hyphens only
 */
const validateId = (id: string): boolean => {
  return /^[a-zA-Z0-9_-]+$/.test(id);
};

/**
 * Validate URL format
 */
const validateUrl = (url: string): boolean => {
  if (!url) return true; // Optional field
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * OptionFormModal Component
 * 
 * Modal for creating/editing options.
 * - Create mode: All fields editable, ID required (Requirement 5.1, 5.2)
 * - Edit mode: ID disabled, other fields editable (Requirement 6.1, 6.2)
 */
const OptionFormModal: React.FC<OptionFormModalProps> = ({
  isOpen,
  onClose,
  groupId,
  editingOption,
  onSubmit,
  groupNutritionConfig,
}) => {
  // ===========================
  // State Management
  // ===========================
  const [formData, setFormData] = useState<OptionFormData>({
    ...INITIAL_OPTION_FORM_DATA,
    group_id: groupId,
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const isEditMode = editingOption !== null;

  // ===========================
  // Form Initialization
  // ===========================
  
  /**
   * Reset form to initial state or populate with editing data
   * Requirement 6.1: Pre-fill form with current values when editing
   */
  const initializeForm = useCallback(() => {
    if (editingOption) {
      setFormData({
        id: editingOption.id,
        group_id: editingOption.group_id,
        name_ar: editingOption.name_ar,
        name_en: editingOption.name_en,
        description_ar: editingOption.description_ar || '',
        description_en: editingOption.description_en || '',
        base_price: editingOption.base_price,
        image: editingOption.image || '',
        display_order: editingOption.display_order,
        available: editingOption.available === 1,
        // Nutrition fields
        calories: editingOption.calories,
        protein: editingOption.protein,
        carbs: editingOption.carbs,
        fat: editingOption.fat,
        sugar: editingOption.sugar,
        fiber: editingOption.fiber,
      });
    } else {
      setFormData({
        ...INITIAL_OPTION_FORM_DATA,
        group_id: groupId,
      });
    }
    setErrors({});
    setApiError(null);
  }, [editingOption, groupId]);

  useEffect(() => {
    if (isOpen) {
      initializeForm();
    }
  }, [isOpen, initializeForm]);

  // ===========================
  // Validation
  // ===========================
  
  /**
   * Validate form data
   * Requirement 5.2: Required fields validation
   * Requirement 6.4: Price validation
   */
  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    // ID validation (required, format check)
    if (!formData.id.trim()) {
      newErrors.id = 'هذا الحقل مطلوب';
    } else if (!validateId(formData.id)) {
      newErrors.id = 'المعرف يجب أن يكون بالإنجليزية بدون مسافات';
    }

    // Arabic name validation (required)
    if (!formData.name_ar.trim()) {
      newErrors.name_ar = 'هذا الحقل مطلوب';
    }

    // English name validation (required)
    if (!formData.name_en.trim()) {
      newErrors.name_en = 'هذا الحقل مطلوب';
    }

    // Price validation (must be non-negative)
    if (formData.base_price < 0) {
      newErrors.base_price = 'السعر يجب أن يكون رقماً موجباً';
    }

    // Image URL validation (optional but must be valid if provided)
    if (formData.image && !validateUrl(formData.image)) {
      newErrors.image = 'رابط الصورة غير صالح';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ===========================
  // Event Handlers
  // ===========================
  
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name as keyof ValidationErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseFloat(value) || 0;
    setFormData(prev => ({ ...prev, [name]: numValue }));
    
    // Clear error for price field
    if (name === 'base_price' && errors.base_price) {
      setErrors(prev => ({ ...prev, base_price: undefined }));
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  /**
   * Handle form submission with API error handling
   * Requirements: 5.5, 5.6, 6.3, 6.4
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSubmit(formData);
      toast.success(isEditMode ? 'تم تحديث الخيار بنجاح ✅' : 'تم إضافة الخيار بنجاح ✅');
      onClose();
    } catch (error: unknown) {
      console.error('Failed to submit form:', error);
      // Handle API errors - Requirements: 5.6, 6.4
      if (error instanceof Error) {
        // Check for HTTP status code in error
        const statusMatch = error.message.match(/HTTP (\d{3})/);
        if (statusMatch) {
          const statusCode = parseInt(statusMatch[1], 10);
          const errorMsg = getOptionErrorMessage(statusCode);
          setApiError(errorMsg);
          toast.error(errorMsg);
        } else {
          const errorMsg = translateApiError(error);
          setApiError(errorMsg);
          toast.error(errorMsg);
        }
      } else {
        const errorMsg = 'حدث خطأ غير متوقع. حاول مرة أخرى.';
        setApiError(errorMsg);
        toast.error(errorMsg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isSubmitting) {
      onClose();
    }
  };

  // ===========================
  // Render
  // ===========================
  
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4 animate-fadeIn"
      onClick={handleBackdropClick}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-[95vw] sm:max-w-xl md:max-w-2xl lg:max-w-3xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col animate-modalIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Fixed height */}
        <div className="flex-shrink-0 p-4 sm:p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-lg sm:text-xl font-bold text-gray-800">
              {isEditMode ? '✏️ تعديل الخيار' : '➕ إضافة خيار جديد'}
            </h3>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">

        {/* API Error Display - Requirements: 5.6, 6.4 */}
        {apiError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-800">فشل في الحفظ</p>
              <p className="text-sm text-red-600">{apiError}</p>
            </div>
          </div>
        )}

        {/* Validation Summary - Requirements: 5.5, 6.4 */}
        {Object.keys(errors).length > 0 && (
          <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-800">يرجى تصحيح الأخطاء التالية:</p>
              <ul className="text-sm text-amber-700 mt-1 list-disc list-inside">
                {errors.id && <li>المعرف: {errors.id}</li>}
                {errors.name_ar && <li>الاسم بالعربية: {errors.name_ar}</li>}
                {errors.name_en && <li>الاسم بالإنجليزية: {errors.name_en}</li>}
                {errors.base_price && <li>السعر: {errors.base_price}</li>}
                {errors.image && <li>رابط الصورة: {errors.image}</li>}
              </ul>
            </div>
          </div>
        )}

        <form id="option-form" onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          {/* Required Fields Section */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-700 text-sm border-b pb-2">
              الحقول المطلوبة
            </h4>

            {/* ID Field - Requirement 5.2, 6.2 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                المعرف (ID) *
              </label>
              <input
                type="text"
                name="id"
                value={formData.id}
                onChange={handleInputChange}
                disabled={isEditMode}
                placeholder="vanilla"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 font-mono ${
                  errors.id ? 'border-red-500' : 'border-gray-200'
                } ${isEditMode ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              />
              {errors.id && (
                <p className="text-red-500 text-sm mt-1">{errors.id}</p>
              )}
              {!isEditMode && (
                <p className="text-xs text-gray-500 mt-1">
                  معرف فريد بالإنجليزية (مثال: vanilla, chocolate, oreo)
                </p>
              )}
            </div>

            {/* Names Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Arabic Name - Requirement 5.2 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  الاسم بالعربية *
                </label>
                <input
                  type="text"
                  name="name_ar"
                  value={formData.name_ar}
                  onChange={handleInputChange}
                  placeholder="فانيليا"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 ${
                    errors.name_ar ? 'border-red-500' : 'border-gray-200'
                  }`}
                />
                {errors.name_ar && (
                  <p className="text-red-500 text-sm mt-1">{errors.name_ar}</p>
                )}
              </div>

              {/* English Name - Requirement 5.2 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  الاسم بالإنجليزية *
                </label>
                <input
                  type="text"
                  name="name_en"
                  value={formData.name_en}
                  onChange={handleInputChange}
                  placeholder="Vanilla"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 ${
                    errors.name_en ? 'border-red-500' : 'border-gray-200'
                  }`}
                />
                {errors.name_en && (
                  <p className="text-red-500 text-sm mt-1">{errors.name_en}</p>
                )}
              </div>
            </div>
          </div>

          {/* Description Section - PROMINENT POSITION - Requirements: 1.1 */}
          <div className="bg-purple-50 rounded-xl p-4 space-y-4 border-2 border-purple-200">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-600" />
              <h4 className="font-semibold text-gray-700 text-sm">الوصف التفصيلي</h4>
              <span className="text-xs text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full">مهم للعرض</span>
            </div>
            
            {/* Helper text explaining usage - Requirement 1.1 */}
            <p className="text-xs text-purple-700 bg-purple-100 p-2 rounded-lg">
              💡 الوصف يظهر للعملاء عند عرض الخيارات في أنماط العرض المختلفة (Cards, List). 
              أضف وصفاً جذاباً يساعد العميل على اتخاذ قراره.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Arabic Description */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  الوصف بالعربية
                </label>
                <textarea
                  name="description_ar"
                  value={formData.description_ar || ''}
                  onChange={handleInputChange}
                  placeholder="مثال: نكهة الفانيليا الكلاسيكية الغنية والكريمية..."
                  rows={3}
                  className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  يظهر تحت اسم الخيار في بطاقات العرض
                </p>
              </div>

              {/* English Description */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  الوصف بالإنجليزية
                </label>
                <textarea
                  name="description_en"
                  value={formData.description_en || ''}
                  onChange={handleInputChange}
                  placeholder="Example: Rich and creamy classic vanilla flavor..."
                  rows={3}
                  className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Shown below option name in display cards
                </p>
              </div>
            </div>
          </div>

          {/* Price & Image Section - Requirement 5.3 */}
          <div className="bg-blue-50 rounded-xl p-4 space-y-4">
            <h4 className="font-semibold text-gray-700 text-sm">السعر والصورة</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  السعر (ج.م)
                </label>
                <input
                  type="number"
                  name="base_price"
                  value={formData.base_price}
                  onChange={handleNumberChange}
                  min={0}
                  step={0.5}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 ${
                    errors.base_price ? 'border-red-500' : 'border-gray-200'
                  }`}
                />
                {errors.base_price && (
                  <p className="text-red-500 text-sm mt-1">{errors.base_price}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  0 = مجاني
                </p>
              </div>

              {/* Display Order */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  ترتيب العرض
                </label>
                <input
                  type="number"
                  name="display_order"
                  value={formData.display_order}
                  onChange={handleNumberChange}
                  min={0}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
            </div>

            {/* Image URL */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                رابط الصورة
              </label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <input
                    type="url"
                    name="image"
                    value={formData.image || ''}
                    onChange={handleInputChange}
                    placeholder="https://example.com/image.jpg"
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 ${
                      errors.image ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                  {errors.image && (
                    <p className="text-red-500 text-sm mt-1">{errors.image}</p>
                  )}
                </div>
                {formData.image && validateUrl(formData.image) && (
                  <div className="w-12 h-12 rounded-lg border border-gray-200 overflow-hidden flex-shrink-0">
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
                {!formData.image && (
                  <div className="w-12 h-12 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center flex-shrink-0">
                    <ImageIcon size={20} className="text-gray-400" />
                  </div>
                )}
              </div>
            </div>

            {/* Availability Toggle */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                name="available"
                id="available"
                checked={formData.available}
                onChange={handleCheckboxChange}
                className="w-5 h-5 rounded border-gray-300 text-pink-500 focus:ring-pink-500"
              />
              <label htmlFor="available" className="text-sm font-medium text-gray-700">
                متاح للطلب
              </label>
            </div>
          </div>

          {/* Nutrition Section with Preview - Requirements: 3.1, 5.4 */}
          <div className="bg-green-50 rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h4 className="font-semibold text-gray-700 text-sm flex items-center gap-2">
                🥗 القيم الغذائية (اختياري)
              </h4>
              
              {/* Group nutrition status indicator */}
              {groupNutritionConfig?.show ? (
                <span className="text-xs bg-green-200 text-green-800 px-2 py-0.5 rounded-full">
                  ✓ مفعّل في المجموعة
                </span>
              ) : (
                <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                  غير مفعّل في المجموعة
                </span>
              )}
            </div>
            
            {/* Helper text for nutrition */}
            <p className="text-xs text-green-700 bg-green-100 p-2 rounded-lg">
              💡 القيم الغذائية تظهر للعملاء عند تفعيل خيار &quot;عرض القيم الغذائية&quot; في إعدادات المجموعة.
            </p>
            
            {/* Nutrition Display Preview based on Group Settings - Requirement 3.1 */}
            {hasNutritionData({
              calories: formData.calories,
              protein: formData.protein,
              carbs: formData.carbs,
              fat: formData.fat
            }) && (
              <div className="bg-white rounded-lg p-3 border border-green-200 space-y-3">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-semibold text-gray-700">معاينة العرض للعملاء</span>
                </div>
                
                {groupNutritionConfig?.show ? (
                  <div className="space-y-2">
                    {/* Preview with group's format settings */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-gray-500">
                        النمط: {groupNutritionConfig.format === 'compact' ? 'مختصر' : 
                               groupNutritionConfig.format === 'badges' ? 'شارات' : 'تفصيلي'}
                      </span>
                      <span className="text-xs text-gray-400">|</span>
                      <span className="text-xs text-gray-500">
                        الحقول: {groupNutritionConfig.fields?.map(f => 
                          f === 'calories' ? 'سعرات' :
                          f === 'protein' ? 'بروتين' :
                          f === 'carbs' ? 'كربوهيدرات' : 'دهون'
                        ).join('، ') || 'سعرات'}
                      </span>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-3">
                      <NutritionBadge
                        nutrition={{
                          calories: formData.calories,
                          protein: formData.protein,
                          carbs: formData.carbs,
                          fat: formData.fat
                        }}
                        format={groupNutritionConfig.format || 'compact'}
                        fields={groupNutritionConfig.fields || ['calories']}
                        showTooltip={false}
                        size="md"
                        language="ar"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-3 text-gray-500 text-sm">
                    <p>⚠️ عرض القيم الغذائية غير مفعّل في إعدادات المجموعة</p>
                    <p className="text-xs mt-1">فعّل الخيار من ⚙️ إعدادات العرض لعرض القيم للعملاء</p>
                  </div>
                )}
              </div>
            )}
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {/* Calories */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  السعرات (kcal)
                </label>
                <input
                  type="number"
                  name="calories"
                  value={formData.calories}
                  onChange={handleNumberChange}
                  min={0}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* Protein */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  البروتين (g)
                </label>
                <input
                  type="number"
                  name="protein"
                  value={formData.protein}
                  onChange={handleNumberChange}
                  min={0}
                  step={0.1}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* Carbs */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  الكربوهيدرات (g)
                </label>
                <input
                  type="number"
                  name="carbs"
                  value={formData.carbs}
                  onChange={handleNumberChange}
                  min={0}
                  step={0.1}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* Fat */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  الدهون (g)
                </label>
                <input
                  type="number"
                  name="fat"
                  value={formData.fat}
                  onChange={handleNumberChange}
                  min={0}
                  step={0.1}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* Sugar */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  السكر (g)
                </label>
                <input
                  type="number"
                  name="sugar"
                  value={formData.sugar}
                  onChange={handleNumberChange}
                  min={0}
                  step={0.1}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* Fiber */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  الألياف (g)
                </label>
                <input
                  type="number"
                  name="fiber"
                  value={formData.fiber}
                  onChange={handleNumberChange}
                  min={0}
                  step={0.1}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
          </div>

          </form>
        </div>

        {/* Footer - Fixed height */}
        <div className="flex-shrink-0 bg-white border-t border-gray-100 p-4 sm:p-6">
          <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-6 py-2.5 sm:py-3 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold transition-colors disabled:opacity-50 text-sm sm:text-base"
            >
              إلغاء
            </button>
            <button
              type="submit"
              form="option-form"
              disabled={isSubmitting}
              className="w-full sm:flex-1 px-4 py-2.5 sm:py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                  <span>جاري الحفظ...</span>
                </>
              ) : (
                <span>{isEditMode ? '💾 حفظ التغييرات' : '✨ إضافة الخيار'}</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OptionFormModal;
