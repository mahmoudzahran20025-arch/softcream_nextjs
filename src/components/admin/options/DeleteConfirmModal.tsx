/**
 * DeleteConfirmModal - Delete Confirmation Modal
 * Requirements: 4.1, 4.2, 7.1
 * 
 * Modal for confirming deletion of option groups or options.
 * Shows warning for groups with options and handles delete action.
 */

'use client';

import React, { useState } from 'react';
import { X, AlertTriangle, Trash2, Loader2 } from 'lucide-react';
import type { DeleteConfirmModalProps } from './types';

/**
 * DeleteConfirmModal Component
 * 
 * Confirmation dialog for deleting option groups or options.
 * - Requirement 4.1: Display confirmation dialog for group deletion
 * - Requirement 4.2: Warn if group has options that will be deleted
 * - Requirement 7.1: Display confirmation dialog for option deletion
 */
const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  target,
  onConfirm,
  isLoading = false,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  // ===========================
  // Event Handlers
  // ===========================
  
  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error('Delete failed:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isDeleting && !isLoading) {
      onClose();
    }
  };

  // ===========================
  // Render Helpers
  // ===========================
  
  const isGroup = target?.type === 'group';
  const hasOptions = isGroup && target?.optionsCount && target.optionsCount > 0;
  const isProcessing = isDeleting || isLoading;

  // ===========================
  // Render
  // ===========================
  
  if (!isOpen || !target) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn"
      onClick={handleBackdropClick}
    >
      <div
        className="bg-white rounded-2xl p-6 max-w-md w-full animate-modalIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-800">
            🗑️ تأكيد الحذف
          </h3>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Warning Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
        </div>

        {/* Confirmation Message */}
        <div className="text-center mb-6">
          <p className="text-gray-700 text-lg mb-2">
            هل أنت متأكد من حذف {isGroup ? 'مجموعة' : 'خيار'}
          </p>
          <p className="text-xl font-bold text-gray-900">
            "{target.name}"؟
          </p>
        </div>

        {/* Warning for groups with options - Requirement 4.2 */}
        {hasOptions && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-800 mb-1">
                  تحذير: هذه المجموعة تحتوي على {target.optionsCount} خيار
                </p>
                <p className="text-sm text-amber-700">
                  سيتم حذف جميع الخيارات الموجودة في هذه المجموعة نهائياً.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Info message for options */}
        {!isGroup && (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-gray-600 text-center">
              سيتم حذف هذا الخيار نهائياً ولا يمكن استرجاعه.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleConfirm}
            disabled={isProcessing}
            className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>جاري الحذف...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-5 h-5" />
                <span>نعم، احذف</span>
              </>
            )}
          </button>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold transition-colors disabled:opacity-50"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
