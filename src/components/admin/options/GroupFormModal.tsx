/**
 * GroupFormModal - Create/Edit Option Group Basic Info Modal
 * Requirements: 1.2, 2.1, 2.2, 4.1, 4.2
 * 
 * Modal form for creating new option groups or editing BASIC INFO only:
 * - id, name_ar, name_en, description_ar, description_en, icon, display_order
 * 
 * NOTE: UI Config (display style, columns, colors) is handled by UIConfigModal
 * which is opened via the ⚙️ button in OptionGroupCard.
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { X, Loader2, AlertCircle, Info, Eye } from 'lucide-react';
import type { GroupFormModalProps, OptionGroupFormData } from './types';
import { INITIAL_GROUP_FORM_DATA, ICON_OPTIONS } from './types';
import { getOptionErrorMessage, translateApiError } from '@/lib/admin/errorMessages';
import { parseUIConfig, mergeUIConfig } from '@/lib/uiConfig';
import type { IconConfig } from '@/lib/uiConfig';
import { toast } from '@/components/ui/Toast';
import LucideIconPicker, { renderLucideIcon } from './LucideIconPicker';

/**
 * Validation errors interface
 */
interface ValidationErrors {
  id?: string;
  name_ar?: string;
  name_en?: string;
  icon?: string;
  description_ar?: string;
  description_en?: string;
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

  /**
   * Handle Lucide icon selection - stores in ui_config.icon
   * Requirements: 2.1, 2.2
   */
  const handleLucideIconSelect = (iconName: string) => {
    const newIconConfig: IconConfig = {
      type: 'lucide',
      value: iconName,
      fallback: 'Circle',
      style: 'solid',
      animation: 'none'
    };
    
    setFormData(prev => ({
      ...prev,
      ui_config: mergeUIConfig(prev.ui_config || parseUIConfig(null), { icon: newIconConfig })
    }));
  };

  /**
   * Get current Lucide icon name from ui_config
   */
  const getCurrentLucideIcon = (): string => {
    const iconConfig = formData.ui_config?.icon;
    if (iconConfig?.type === 'lucide' && iconConfig.value) {
      return iconConfig.value;
    }
    return 'Package'; // Default
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
      toast.success(isEditMode ? 'تم تحديث المجموعة بنجاح ✅' : 'تم إنشاء المجموعة بنجاح ✅');
      onClose();
    } catch (error: unknown) {
      console.error('Failed to submit form:', error);
      if (error instanceof Error) {
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
        className="bg-white rounded-2xl w-full max-w-[95vw] sm:max-w-lg md:max-w-xl lg:max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col animate-modalIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Fixed height, not sticky */}
        <div className="flex-shrink-0 p-4 sm:p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-lg sm:text-xl font-bold text-gray-800">
              {isEditMode ? '✏️ تعديل البيانات الأساسية' : '➕ إضافة مجموعة جديدة'}
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
          {/* Info Box - What this form does */}
          {isEditMode && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-4">
              <div className="flex items-start gap-2 sm:gap-3">
                <Info size={18} className="text-blue-600 mt-0.5 flex-shrink-0 hidden sm:block" />
                <div>
                  <p className="text-sm text-blue-700">
                    هذا النموذج لتعديل <strong>البيانات الأساسية</strong> فقط.
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    💡 لتعديل <strong>إعدادات العرض</strong> استخدم زر ⚙️
                  </p>
                </div>
              </div>
            </div>
          )}

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

        <form id="group-form" onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
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

              {/* Arabic Description - Requirements: 1.2 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  الوصف بالعربية (اختياري)
                </label>
                <textarea
                  name="description_ar"
                  value={formData.description_ar || ''}
                  onChange={handleInputChange}
                  placeholder="اضف المزيد :: اختر نكهاتك براحتك"
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  يظهر كعنوان فرعي تحت اسم المجموعة (مثال: &quot;اضف المزيد :: اختر نكهاتك براحتك&quot;)
                </p>
              </div>

              {/* English Description - Requirements: 1.2 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  الوصف بالإنجليزية (اختياري)
                </label>
                <textarea
                  name="description_en"
                  value={formData.description_en || ''}
                  onChange={handleInputChange}
                  placeholder="Add more :: Choose your flavors freely"
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
                />
              </div>

              {/* Subtitle Preview - Requirements: 1.2 */}
              {(formData.description_ar || formData.description_en) && (
                <div className="bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Eye size={16} className="text-pink-500" />
                      معاينة العنوان الفرعي
                    </span>
                  </div>
                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <div className="flex items-center gap-2 mb-1">
                      {formData.ui_config?.icon?.type === 'lucide' ? (
                        <span className="text-pink-500">
                          {renderLucideIcon(getCurrentLucideIcon(), 'Circle', { size: 20 })}
                        </span>
                      ) : (
                        <span className="text-xl">{formData.icon}</span>
                      )}
                      <span className="font-bold text-gray-800">
                        {formData.name_ar || 'اسم المجموعة'}
                      </span>
                    </div>
                    {formData.description_ar && (
                      <p className="text-sm text-gray-600 mr-7">
                        {formData.description_ar}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Lucide Icon Picker - Requirements: 2.1, 2.2 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  أيقونة Lucide (حديثة)
                </label>
                <LucideIconPicker
                  value={getCurrentLucideIcon()}
                  onChange={handleLucideIconSelect}
                  category="food"
                />
                <p className="text-xs text-gray-500 mt-1">
                  أيقونات حديثة ومتسقة التصميم - تُحفظ في إعدادات العرض
                </p>
              </div>

              {/* Legacy Emoji Icon Picker - for backward compatibility */}
              <div className="border-t border-gray-100 pt-4 mt-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  أيقونة Emoji (قديمة) *
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  للتوافق مع الإصدارات السابقة - يُفضل استخدام أيقونات Lucide أعلاه
                </p>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowIconPicker(!showIconPicker)}
                    className={`w-full px-4 py-3 border rounded-lg text-right flex items-center justify-between ${
                      errors.icon ? 'border-red-500' : 'border-gray-200'
                    } hover:border-pink-300 transition-colors`}
                  >
                    <span className="text-2xl">{formData.icon}</span>
                    <span className="text-gray-500 text-sm">اختر أيقونة Emoji</span>
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

          </form>
        </div>

        {/* Footer - Fixed height */}
        <div className="flex-shrink-0 bg-white border-t border-gray-100 p-4 sm:p-6">
          <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold transition-colors disabled:opacity-50"
            >
              إلغاء
            </button>
            <button
              type="submit"
              form="group-form"
              disabled={isSubmitting}
              className="w-full sm:flex-1 px-4 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupFormModal;
