/**
 * ValidationSummary Component
 * 
 * Displays all validation errors and warnings before save.
 * Blocks save if errors exist, allows save with warnings after confirmation.
 * 
 * @module admin/products/UnifiedProductForm/ValidationSummary
 * Requirements: 7.3
 */

'use client';

import React from 'react';
import { X, AlertCircle, AlertTriangle, CheckCircle, Save } from 'lucide-react';
import type { ValidationSummaryProps } from './types';

const ValidationSummary: React.FC<ValidationSummaryProps> = ({
  errors,
  warnings,
  onConfirmWithWarnings,
  onCancel,
}) => {
  const hasErrors = errors.length > 0;
  const hasWarnings = warnings.length > 0;
  const canSave = !hasErrors;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60] backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className={`p-6 ${
          hasErrors 
            ? 'bg-gradient-to-r from-red-500 to-rose-600' 
            : 'bg-gradient-to-r from-yellow-500 to-amber-600'
        }`}>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              {hasErrors ? (
                <AlertCircle size={28} className="text-white" />
              ) : (
                <AlertTriangle size={28} className="text-white" />
              )}
              <div>
                <h2 className="text-xl font-bold text-white">
                  {hasErrors ? 'يوجد أخطاء في البيانات' : 'تحذيرات قبل الحفظ'}
                </h2>
                <p className="text-white/80 text-sm mt-0.5">
                  {hasErrors 
                    ? 'يرجى تصحيح الأخطاء التالية قبل الحفظ'
                    : 'يرجى مراجعة التحذيرات التالية'
                  }
                </p>
              </div>
            </div>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-all text-white"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {/* Errors Section */}
          {hasErrors && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-red-700 mb-3 flex items-center gap-2">
                <AlertCircle size={16} />
                أخطاء ({errors.length})
              </h3>
              <div className="space-y-2">
                {errors.map((error, index) => (
                  <div
                    key={`error-${index}`}
                    className="bg-red-50 border border-red-200 rounded-lg p-3"
                  >
                    <div className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                        !
                      </div>
                      <div>
                        <p className="text-sm text-red-800 font-medium">{error.message}</p>
                        <p className="text-xs text-red-600 mt-0.5">
                          الحقل: {translateFieldName(error.field)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Warnings Section */}
          {hasWarnings && (
            <div>
              <h3 className="text-sm font-semibold text-yellow-700 mb-3 flex items-center gap-2">
                <AlertTriangle size={16} />
                تحذيرات ({warnings.length})
              </h3>
              <div className="space-y-2">
                {warnings.map((warning, index) => (
                  <div
                    key={`warning-${index}`}
                    className="bg-yellow-50 border border-yellow-200 rounded-lg p-3"
                  >
                    <div className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-full bg-yellow-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                        ⚠
                      </div>
                      <div>
                        <p className="text-sm text-yellow-800 font-medium">{warning.message}</p>
                        <p className="text-xs text-yellow-600 mt-0.5">
                          الحقل: {translateFieldName(warning.field)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No Issues */}
          {!hasErrors && !hasWarnings && (
            <div className="text-center py-8">
              <CheckCircle size={48} className="text-green-500 mx-auto mb-3" />
              <p className="text-gray-700 font-medium">جميع البيانات صحيحة</p>
              <p className="text-sm text-gray-500 mt-1">يمكنك حفظ المنتج الآن</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-6 bg-gray-50 border-t border-gray-200">
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-100 hover:border-gray-400 transition-all font-semibold"
            >
              {hasErrors ? 'العودة للتعديل' : 'إلغاء'}
            </button>
            {canSave && (
              <button
                type="button"
                onClick={onConfirmWithWarnings}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all ${
                  hasWarnings
                    ? 'bg-gradient-to-r from-yellow-500 to-amber-600 text-white hover:shadow-lg'
                    : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg'
                }`}
              >
                <Save size={18} />
                <span>{hasWarnings ? 'حفظ مع التحذيرات' : 'حفظ المنتج'}</span>
              </button>
            )}
          </div>
          
          {hasWarnings && canSave && (
            <p className="text-xs text-gray-500 text-center mt-3">
              سيتم حفظ المنتج مع وجود التحذيرات المذكورة أعلاه
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Translates field names to Arabic for display
 */
function translateFieldName(field: string): string {
  const translations: Record<string, string> = {
    id: 'معرف المنتج',
    name: 'اسم المنتج',
    category: 'الفئة',
    price: 'السعر',
    optionGroups: 'مجموعات الخيارات',
    containers: 'الحاويات',
    sizes: 'الأحجام',
  };

  // Handle option group fields
  if (field.startsWith('optionGroup_')) {
    const parts = field.split('.');
    const groupId = parts[0].replace('optionGroup_', '');
    const subField = parts[1];
    
    const subFieldTranslations: Record<string, string> = {
      minSelections: 'الحد الأدنى',
      maxSelections: 'الحد الأقصى',
      isRequired: 'مطلوب',
    };
    
    if (subField && subFieldTranslations[subField]) {
      return `مجموعة ${groupId} - ${subFieldTranslations[subField]}`;
    }
    return `مجموعة ${groupId}`;
  }

  return translations[field] || field;
}

export default ValidationSummary;
