/**
 * GroupFormModal - Create/Edit Option Group Modal
 * Requirements: 4.1, 4.2
 * 
 * Modal form for creating new option groups or editing existing ones.
 * Includes two tabs:
 * - Tab 1: Basic Info (id, name_ar, name_en, icon, display_order)
 * - Tab 2: UI Config (display style, columns, colors)
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { X, Loader2, AlertCircle, Settings2, FileText } from 'lucide-react';
import type { GroupFormModalProps, OptionGroupFormData } from './types';
import { INITIAL_GROUP_FORM_DATA, ICON_OPTIONS } from './types';
import { getOptionErrorMessage, translateApiError } from '@/lib/admin/errorMessages';
import UIConfigEditor from './UIConfigEditor';
import type { UIConfig } from '@/lib/uiConfig';
import { parseUIConfig } from '@/lib/uiConfig';

type TabType = 'basic' | 'uiConfig';

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
 * Simplified modal for creating/editing option groups.
 * Requirements 4.1: Only id, name_ar, name_en, icon picker, display_order
 * Requirements 4.2: No UIConfigEditor tab (use default ui_config)
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
  const [activeTab, setActiveTab] = useState<TabType>('basic');

  const isEditMode = editingGroup !== null;

  // ===========================
  // Form Initialization
  // ===========================
  
  const initializeForm = useCallback(() => {
    if (editingGroup) {
      // Parse ui_config if it's a string
      const uiConfig = typeof editingGroup.ui_config === 'string' 
        ? parseUIConfig(editingGroup.ui_config)
        : editingGroup.ui_config || INITIAL_GROUP_FORM_DATA.ui_config;
      
      setFormData({
        id: editingGroup.id,
        name_ar: editingGroup.name_ar,
        name_en: editingGroup.name_en,
        description_ar: editingGroup.description_ar || '',
        description_en: editingGroup.description_en || '',
        icon: editingGroup.icon || '📦',
        display_order: editingGroup.display_order,
        ui_config: uiConfig,
      });
    } else {
      setFormData(INITIAL_GROUP_FORM_DATA);
    }
    setErrors({});
    setApiError(null);
    setShowIconPicker(false);
    setActiveTab('basic');
  }, [editingGroup]);

  useEffect(() => {
    if (isOpen) {
      initializeForm();
    }
  }, [isOpen, initializeForm]);

  // ===========================
  // Validation
  // ===========================
  
  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!formData.id.trim()) {
      newErrors.id = 'هذا الحقل مطلوب';
    } else if (!validateId(formData.id)) {
      newErrors.id = 'المعرف يجب أن يكون بالإنجليزية بدون مسافات';
    }

    if (!formData.name_ar.trim()) {
      newErrors.name_ar = 'هذا الحقل مطلوب';
    }

    if (!formData.name_en.trim()) {
      newErrors.name_en = 'هذا الحقل مطلوب';
    }

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
      if (error instanceof Error) {
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

  const handleUIConfigChange = (config: UIConfig) => {
    setFormData(prev => ({ ...prev, ui_config: config }));
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
        <div className="flex items-center justify-between mb-4">
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

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          <button
            type="button"
            onClick={() => setActiveTab('basic')}
            className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors border-b-2 -mb-px ${
              activeTab === 'basic'
                ? 'text-pink-600 border-pink-500'
                : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
          >
            <FileText size={18} />
            <span>البيانات الأساسية</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('uiConfig')}
            className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors border-b-2 -mb-px ${
              activeTab === 'uiConfig'
                ? 'text-pink-600 border-pink-500'
                : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
          >
            <Settings2 size={18} />
            <span>إعدادات العرض</span>
          </button>
        </div>

        {/* API Error Display */}
        {apiError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-800">فشل في الحفظ</p>
              <p className="text-sm text-red-600">{apiError}</p>
            </div>
          </div>
        )}

        {/* Validation Summary */}
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
          {/* Basic Info Tab */}
          {activeTab === 'basic' && (
            <>
              {/* ID Field */}
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

              {/* Arabic Name */}
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

              {/* English Name */}
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

              {/* Icon Picker */}
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

              {/* Display Order */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
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
            </>
          )}

          {/* UI Config Tab */}
          {activeTab === 'uiConfig' && (
            <div className="min-h-[300px]">
              <p className="text-sm text-gray-600 mb-4">
                تحكم في كيفية عرض هذه المجموعة للعملاء في واجهة المنتج
              </p>
              <UIConfigEditor
                value={formData.ui_config || INITIAL_GROUP_FORM_DATA.ui_config!}
                onChange={handleUIConfigChange}
              />
            </div>
          )}

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
