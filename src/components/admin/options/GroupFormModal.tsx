/**
 * GroupFormModal - Create/Edit Option Group Modal
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.4
 * 
 * Modal form for creating new option groups or editing existing ones.
 * Handles validation, form state, submission, and API error display.
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { X, Loader2, AlertCircle } from 'lucide-react';
import type { GroupFormModalProps, OptionGroupFormData } from './types';
import { INITIAL_GROUP_FORM_DATA, ICON_OPTIONS } from './types';
import { getOptionErrorMessage, translateApiError } from '@/lib/admin/errorMessages';

/**
 * Validation errors interface
 */
interface ValidationErrors {
  id?: string;
  name_ar?: string;
  name_en?: string;
  icon?: string;
}

/**
 * Validate ID format - must be English letters, numbers, underscores, hyphens only
 */
const validateId = (id: string): boolean => {
  return /^[a-zA-Z0-9_-]+$/.test(id);
};

/**
 * GroupFormModal Component
 * 
 * Modal for creating/editing option groups.
 * - Create mode: All fields editable, ID required (Requirement 2.1, 2.2)
 * - Edit mode: ID disabled, other fields editable (Requirement 3.1, 3.2)
 */
const GroupFormModal: React.FC<GroupFormModalProps> = ({
  isOpen,
  onClose,
  editingGroup,
  onSubmit,
}) => {
  // ===========================
  // State Management
  // ===========================
  const [formData, setFormData] = useState<OptionGroupFormData>(INITIAL_GROUP_FORM_DATA);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const isEditMode = editingGroup !== null;

  // ===========================
  // Form Initialization
  // ===========================
  
  /**
   * Reset form to initial state or populate with editing data
   * Requirement 3.1: Pre-fill form with current values when editing
   */
  const initializeForm = useCallback(() => {
    if (editingGroup) {
      setFormData({
        id: editingGroup.id,
        name_ar: editingGroup.name_ar,
        name_en: editingGroup.name_en,
        description_ar: editingGroup.description_ar || '',
        description_en: editingGroup.description_en || '',
        icon: editingGroup.icon,
        display_order: editingGroup.display_order,
      });
    } else {
      setFormData(INITIAL_GROUP_FORM_DATA);
    }
    setErrors({});
    setApiError(null);
    setShowIconPicker(false);
  }, [editingGroup]);

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
   * Requirement 2.2: Required fields validation
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

    // Icon validation (required)
    if (!formData.icon.trim()) {
      newErrors.icon = 'هذا الحقل مطلوب';
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
    setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
  };

  const handleIconSelect = (icon: string) => {
    setFormData(prev => ({ ...prev, icon }));
    setShowIconPicker(false);
    if (errors.icon) {
      setErrors(prev => ({ ...prev, icon: undefined }));
    }
  };

  /**
   * Handle form submission with API error handling
   * Requirements: 2.4, 2.5, 3.3, 3.4
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
      onClose();
    } catch (error: unknown) {
      console.error('Failed to submit form:', error);
      // Handle API errors - Requirements: 2.5, 3.4
      if (error instanceof Error) {
        // Check for HTTP status code in error
        const statusMatch = error.message.match(/HTTP (\d{3})/);
        if (statusMatch) {
          const statusCode = parseInt(statusMatch[1], 10);
          setApiError(getOptionErrorMessage(statusCode));
        } else {
          setApiError(translateApiError(error));
        }
      } else {
        setApiError('حدث خطأ غير متوقع. حاول مرة أخرى.');
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
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn"
      onClick={handleBackdropClick}
    >
      <div
        className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto animate-modalIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800">
            {isEditMode ? '✏️ تعديل مجموعة الخيارات' : '➕ إضافة مجموعة جديدة'}
          </h3>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* API Error Display - Requirements: 2.5, 3.4 */}
        {apiError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-800">فشل في الحفظ</p>
              <p className="text-sm text-red-600">{apiError}</p>
            </div>
          </div>
        )}

        {/* Validation Summary - Requirements: 2.4 */}
        {Object.keys(errors).length > 0 && (
          <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-800">يرجى تصحيح الأخطاء التالية:</p>
              <ul className="text-sm text-amber-700 mt-1 list-disc list-inside">
                {errors.id && <li>المعرف: {errors.id}</li>}
                {errors.name_ar && <li>الاسم بالعربية: {errors.name_ar}</li>}
                {errors.name_en && <li>الاسم بالإنجليزية: {errors.name_en}</li>}
                {errors.icon && <li>الأيقونة: {errors.icon}</li>}
              </ul>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* ID Field - Requirement 2.2, 3.2 */}
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
              placeholder="flavors"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 font-mono ${
                errors.id ? 'border-red-500' : 'border-gray-200'
              } ${isEditMode ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            />
            {errors.id && (
              <p className="text-red-500 text-sm mt-1">{errors.id}</p>
            )}
            {!isEditMode && (
              <p className="text-xs text-gray-500 mt-1">
                معرف فريد بالإنجليزية (مثال: flavors, toppings, sauces)
              </p>
            )}
          </div>

          {/* Arabic Name - Requirement 2.2 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              الاسم بالعربية *
            </label>
            <input
              type="text"
              name="name_ar"
              value={formData.name_ar}
              onChange={handleInputChange}
              placeholder="نكهات الآيس كريم"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 ${
                errors.name_ar ? 'border-red-500' : 'border-gray-200'
              }`}
            />
            {errors.name_ar && (
              <p className="text-red-500 text-sm mt-1">{errors.name_ar}</p>
            )}
          </div>

          {/* English Name - Requirement 2.2 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              الاسم بالإنجليزية *
            </label>
            <input
              type="text"
              name="name_en"
              value={formData.name_en}
              onChange={handleInputChange}
              placeholder="Ice Cream Flavors"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 ${
                errors.name_en ? 'border-red-500' : 'border-gray-200'
              }`}
            />
            {errors.name_en && (
              <p className="text-red-500 text-sm mt-1">{errors.name_en}</p>
            )}
          </div>

          {/* Icon Picker - Requirement 2.2 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              الأيقونة *
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowIconPicker(!showIconPicker)}
                className={`w-full px-4 py-3 border rounded-lg text-right flex items-center justify-between ${
                  errors.icon ? 'border-red-500' : 'border-gray-200'
                } hover:border-pink-300 transition-colors`}
              >
                <span className="text-2xl">{formData.icon}</span>
                <span className="text-gray-500 text-sm">اختر أيقونة</span>
              </button>
              
              {showIconPicker && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-10">
                  <div className="grid grid-cols-8 gap-2">
                    {ICON_OPTIONS.map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => handleIconSelect(icon)}
                        className={`p-2 text-xl rounded-lg hover:bg-pink-100 transition-colors ${
                          formData.icon === icon ? 'bg-pink-200' : ''
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {errors.icon && (
              <p className="text-red-500 text-sm mt-1">{errors.icon}</p>
            )}
          </div>

          {/* Optional Fields Section - Requirement 2.3 */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-4">
            <h4 className="font-semibold text-gray-700 text-sm">حقول اختيارية</h4>
            
            {/* Arabic Description */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                الوصف بالعربية
              </label>
              <textarea
                name="description_ar"
                value={formData.description_ar || ''}
                onChange={handleInputChange}
                placeholder="وصف المجموعة بالعربية..."
                rows={2}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
              />
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
                placeholder="Group description in English..."
                rows={2}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
              />
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
              <p className="text-xs text-gray-500 mt-1">
                الأرقام الأصغر تظهر أولاً
              </p>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-2 pt-4 border-t">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>جاري الحفظ...</span>
                </>
              ) : (
                <span>{isEditMode ? '💾 حفظ التغييرات' : '✨ إنشاء المجموعة'}</span>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold transition-colors disabled:opacity-50"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GroupFormModal;
