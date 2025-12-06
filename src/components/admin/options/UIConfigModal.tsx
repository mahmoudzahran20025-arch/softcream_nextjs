/**
 * UIConfigModal - Dedicated Modal for UI Configuration
 * 
 * Separate modal for editing display settings only.
 * This is different from GroupFormModal which handles basic info.
 * 
 * Purpose:
 * - Edit display_style (cards, pills, list, grid)
 * - Edit columns, card size
 * - Edit icon configuration
 * - Edit accent colors
 * 
 * NOT for editing: name, description, display_order (use GroupFormModal)
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { X, Loader2, Settings2, Info, Eye } from 'lucide-react';
import type { OptionGroup } from './types';
import UIConfigEditor from './UIConfigEditor';
import type { UIConfig } from '@/lib/uiConfig';
import { parseUIConfig } from '@/lib/uiConfig';
import { toast } from '@/components/ui/Toast';

interface UIConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: OptionGroup | null;
  onSave: (groupId: string, uiConfig: UIConfig) => Promise<void>;
}

/**
 * UIConfigModal Component
 * 
 * Dedicated modal for editing UI configuration only.
 * Provides clear separation from basic group info editing.
 */
const UIConfigModal: React.FC<UIConfigModalProps> = ({
  isOpen,
  onClose,
  group,
  onSave,
}) => {
  const [config, setConfig] = useState<UIConfig>(parseUIConfig());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize config when group changes
  useEffect(() => {
    if (group) {
      const uiConfig = typeof group.ui_config === 'string'
        ? parseUIConfig(group.ui_config)
        : group.ui_config || parseUIConfig();
      setConfig(uiConfig);
      setError(null);
    }
  }, [group]);

  const handleSubmit = useCallback(async () => {
    if (!group) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await onSave(group.id, config);
      toast.success('تم حفظ إعدادات العرض بنجاح ✅');
      onClose();
    } catch (err) {
      console.error('Failed to save UI config:', err);
      const errorMsg = err instanceof Error ? err.message : 'فشل في حفظ الإعدادات';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  }, [group, config, onSave, onClose]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isSubmitting) {
      onClose();
    }
  };

  if (!isOpen || !group) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4 animate-fadeIn"
      onClick={handleBackdropClick}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-[95vw] sm:max-w-lg md:max-w-xl lg:max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col animate-modalIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Only this is sticky */}
        <div className="flex-shrink-0 p-4 sm:p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Settings2 size={18} className="text-purple-600 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 truncate">
                  ⚙️ إعدادات العرض
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 truncate">
                  {group.name_ar}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 flex-shrink-0"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content - Everything scrollable */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* Info Box - Inside scrollable area */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 sm:p-4 mb-4">
            <div className="flex items-start gap-2 sm:gap-3">
              <Info size={16} className="text-purple-600 mt-0.5 flex-shrink-0 hidden sm:block" />
              <div>
                <h4 className="font-medium text-purple-800 mb-1 text-sm sm:text-base">ماذا تؤثر هذه الإعدادات؟</h4>
                <ul className="text-xs sm:text-sm text-purple-700 space-y-0.5 sm:space-y-1">
                  <li>• <strong>نمط العرض:</strong> بطاقات، أزرار، قائمة، شبكة</li>
                  <li>• <strong>عدد الأعمدة:</strong> كم خيار في كل صف</li>
                  <li>• <strong>الأيقونة:</strong> رمز المجموعة</li>
                  <li>• <strong>الألوان:</strong> اللون الرئيسي</li>
                </ul>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <UIConfigEditor
            value={config}
            onChange={setConfig}
          />

          {/* Preview Summary - Inside scrollable area */}
          <div className="mt-4 bg-gray-50 rounded-lg p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-2">
              <Eye size={14} className="text-gray-500 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm font-medium text-gray-700">ملخص الإعدادات</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5 sm:gap-2 text-xs">
              <div className="bg-white p-1.5 sm:p-2 rounded border text-center">
                <span className="text-gray-500 block text-[10px] sm:text-xs">النمط</span>
                <span className="font-medium text-gray-800 text-xs sm:text-sm">{config.displayMode}</span>
              </div>
              <div className="bg-white p-1.5 sm:p-2 rounded border text-center">
                <span className="text-gray-500 block text-[10px] sm:text-xs">الأعمدة</span>
                <span className="font-medium text-gray-800 text-xs sm:text-sm">{config.columns}</span>
              </div>
              <div className="bg-white p-1.5 sm:p-2 rounded border text-center">
                <span className="text-gray-500 block text-[10px] sm:text-xs">الصور</span>
                <span className={`font-medium text-xs sm:text-sm ${config.showImages ? 'text-green-600' : 'text-red-600'}`}>
                  {config.showImages ? '✅' : '❌'}
                </span>
              </div>
              <div className="bg-white p-1.5 sm:p-2 rounded border text-center">
                <span className="text-gray-500 block text-[10px] sm:text-xs">الأسعار</span>
                <span className={`font-medium text-xs sm:text-sm ${config.showPrices ? 'text-green-600' : 'text-red-600'}`}>
                  {config.showPrices ? '✅' : '❌'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Sticky at bottom */}
        <div className="flex-shrink-0 p-4 sm:p-6 border-t border-gray-100 bg-gray-50">
          <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-6 py-2.5 sm:py-3 bg-white border border-gray-200 hover:bg-gray-100 rounded-lg font-semibold transition-colors disabled:opacity-50 text-sm sm:text-base"
            >
              إلغاء
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full sm:flex-1 px-4 py-2.5 sm:py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                  <span>جاري الحفظ...</span>
                </>
              ) : (
                <span>💾 حفظ إعدادات العرض</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UIConfigModal;
