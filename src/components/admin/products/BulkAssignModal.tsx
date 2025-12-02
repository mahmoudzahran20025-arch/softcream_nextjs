/**
 * BulkAssignModal Component
 * 
 * Modal for bulk assigning option groups to multiple products.
 * Allows selecting an option group and configuring rules (is_required, min_selections, max_selections).
 * Displays selected products count and handles bulk assignment.
 * 
 * @module admin/products/BulkAssignModal
 * Requirements: 6.2
 */

'use client';

import React, { useState, useEffect } from 'react';
import { X, Layers, AlertCircle, AlertTriangle, CheckCircle, Package } from 'lucide-react';
import type { Product } from '@/lib/admin/products.api';
import type { OptionGroupInfo, OptionGroupAssignment } from './UnifiedProductForm/types';

// ============================================================================
// Types
// ============================================================================

export interface BulkAssignModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when the modal is closed */
  onClose: () => void;
  /** Selected products for bulk assignment */
  selectedProducts: Product[];
  /** Available option groups */
  optionGroups: OptionGroupInfo[];
  /** Callback when bulk assignment is confirmed */
  onConfirm: (assignment: OptionGroupAssignment) => Promise<BulkAssignResult>;
}

export interface BulkAssignResult {
  /** Product IDs that succeeded */
  success: string[];
  /** Products that failed with error messages */
  failed: { productId: string; productName: string; error: string }[];
}

// ============================================================================
// Component
// ============================================================================

const BulkAssignModal: React.FC<BulkAssignModalProps> = ({
  isOpen,
  onClose,
  selectedProducts,
  optionGroups,
  onConfirm,
}) => {
  // Filter out groups with invalid IDs to prevent React key warnings
  const validGroups = optionGroups.filter(group => group.id != null && group.id !== '');
  
  // Form state
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [isRequired, setIsRequired] = useState(false);
  const [minSelections, setMinSelections] = useState(0);
  const [maxSelections, setMaxSelections] = useState(1);
  
  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<BulkAssignResult | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setSelectedGroupId('');
      setIsRequired(false);
      setMinSelections(0);
      setMaxSelections(1);
      setResult(null);
      setValidationError(null);
    }
  }, [isOpen]);

  // Auto-correct min_selections when is_required changes (Requirement 3.2)
  useEffect(() => {
    if (isRequired && minSelections === 0) {
      setMinSelections(1);
    }
  }, [isRequired, minSelections]);

  // Get selected group info
  const selectedGroup = validGroups.find(g => g.id === selectedGroupId);

  // Validate form
  const validate = (): boolean => {
    if (!selectedGroupId) {
      setValidationError('يرجى اختيار مجموعة خيارات');
      return false;
    }
    
    // Requirement 3.1: min_selections cannot be greater than max_selections
    if (minSelections > maxSelections) {
      setValidationError('الحد الأدنى لا يمكن أن يكون أكبر من الحد الأقصى');
      return false;
    }

    setValidationError(null);
    return true;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    setResult(null);

    try {
      const assignment: OptionGroupAssignment = {
        groupId: selectedGroupId,
        isRequired,
        minSelections,
        maxSelections,
        displayOrder: 1, // Default display order for bulk assignment
      };

      const bulkResult = await onConfirm(assignment);
      setResult(bulkResult);
    } catch (error) {
      console.error('Bulk assignment failed:', error);
      setValidationError('حدث خطأ أثناء تعيين المجموعة');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle close
  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden animate-slideUp">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Layers size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold">تعيين مجموعة خيارات</h2>
                <p className="text-sm text-white/80">
                  تعيين لـ {selectedProducts.length} منتج
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Show result if available */}
          {result ? (
            <div className="space-y-4">
              {/* Success count */}
              {result.success.length > 0 && (
                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-green-700 mb-2">
                    <CheckCircle size={20} />
                    <span className="font-semibold">
                      تم التعيين بنجاح لـ {result.success.length} منتج
                    </span>
                  </div>
                </div>
              )}

              {/* Failed items */}
              {result.failed.length > 0 && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-red-700 mb-3">
                    <AlertCircle size={20} />
                    <span className="font-semibold">
                      فشل التعيين لـ {result.failed.length} منتج
                    </span>
                  </div>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {result.failed.map((item, idx) => (
                      <div key={idx} className="text-sm text-red-600 bg-red-100 rounded-lg p-2">
                        <span className="font-medium">{item.productName}:</span> {item.error}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Close button */}
              <button
                onClick={handleClose}
                className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                إغلاق
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Selected Products Preview */}
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-4 border-2 border-purple-200">
                <div className="flex items-center gap-2 text-purple-700 mb-2">
                  <Package size={18} />
                  <span className="font-semibold">المنتجات المحددة ({selectedProducts.length})</span>
                </div>
                <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                  {selectedProducts.slice(0, 10).map(product => (
                    <span
                      key={product.id}
                      className="px-2 py-1 bg-white text-purple-700 text-xs rounded-lg border border-purple-200"
                    >
                      {product.name}
                    </span>
                  ))}
                  {selectedProducts.length > 10 && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-lg">
                      +{selectedProducts.length - 10} أخرى
                    </span>
                  )}
                </div>
              </div>

              {/* Option Group Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  اختر مجموعة الخيارات <span className="text-red-500">*</span>
                </label>
                {validGroups.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {validGroups.map(group => (
                      <button
                        key={group.id}
                        type="button"
                        onClick={() => setSelectedGroupId(group.id)}
                        className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all text-right ${
                          selectedGroupId === group.id
                            ? 'border-purple-500 bg-purple-50 text-purple-700'
                            : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/50'
                        }`}
                      >
                        <span className="text-xl">{group.icon || '📦'}</span>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">{group.name}</div>
                          <div className="text-xs text-gray-500">{group.optionsCount} خيار</div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 text-center">
                    <AlertTriangle size={24} className="text-yellow-500 mx-auto mb-2" />
                    <p className="text-yellow-700 text-sm">لا توجد مجموعات خيارات متاحة</p>
                  </div>
                )}
              </div>

              {/* Configuration Options - shown when a group is selected */}
              {selectedGroup && (
                <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200 space-y-4">
                  <h4 className="font-semibold text-gray-700 flex items-center gap-2">
                    <span>⚙️</span> إعدادات التعيين
                  </h4>

                  {/* Is Required */}
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="bulk-is-required"
                      checked={isRequired}
                      onChange={(e) => setIsRequired(e.target.checked)}
                      className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <label htmlFor="bulk-is-required" className="text-sm font-medium text-gray-700">
                      مطلوب (يجب على العميل الاختيار)
                    </label>
                  </div>

                  {/* Min/Max Selections */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        الحد الأدنى للاختيارات
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={minSelections}
                        onChange={(e) => setMinSelections(parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        الحد الأقصى للاختيارات
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={maxSelections}
                        onChange={(e) => setMaxSelections(parseInt(e.target.value) || 1)}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                  </div>

                  {/* Warning if max > options count (Requirement 3.4) */}
                  {selectedGroup.optionsCount > 0 && maxSelections > selectedGroup.optionsCount && (
                    <div className="flex items-center gap-2 text-yellow-600 text-sm bg-yellow-50 p-2 rounded-lg">
                      <AlertTriangle size={16} />
                      <span>الحد الأقصى أكبر من عدد الخيارات المتاحة ({selectedGroup.optionsCount})</span>
                    </div>
                  )}
                </div>
              )}

              {/* Validation Error */}
              {validationError && (
                <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-xl border border-red-200">
                  <AlertCircle size={18} />
                  <span>{validationError}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer - only show when not showing result */}
        {!result && (
          <div className="border-t border-gray-200 p-4 bg-gray-50 flex gap-3">
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-colors disabled:opacity-50"
            >
              إلغاء
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !selectedGroupId || validGroups.length === 0}
              className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>جاري التعيين...</span>
                </>
              ) : (
                <>
                  <Layers size={18} />
                  <span>تعيين للمنتجات</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BulkAssignModal;
