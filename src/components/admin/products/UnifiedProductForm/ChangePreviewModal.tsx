/**
 * ChangePreviewModal Component
 * 
 * Displays a preview of all changes made to a product before saving.
 * Shows added, removed, and modified assignments with warnings for
 * required group removal.
 * 
 * @module admin/products/UnifiedProductForm/ChangePreviewModal
 * Requirements: 2.2, 2.3
 */

'use client';

import React from 'react';
import {
  X,
  AlertTriangle,
  Plus,
  Minus,
  Edit3,
  Layers,
  Package,
  Ruler,
  FileText,
  Check,
} from 'lucide-react';
import type { ChangePreviewModalProps, OptionGroupChange, ContainerChange, SizeChange, ProductDetailChange } from './types';

/**
 * Badge component for change type
 */
const ChangeBadge: React.FC<{ type: 'added' | 'removed' | 'modified' }> = ({ type }) => {
  const config = {
    added: { bg: 'bg-green-100', text: 'text-green-700', icon: Plus, label: 'إضافة' },
    removed: { bg: 'bg-red-100', text: 'text-red-700', icon: Minus, label: 'حذف' },
    modified: { bg: 'bg-blue-100', text: 'text-blue-700', icon: Edit3, label: 'تعديل' },
  };
  const { bg, text, icon: Icon, label } = config[type];

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${bg} ${text}`}>
      <Icon size={12} />
      {label}
    </span>
  );
};

/**
 * Section header component
 */
const SectionHeader: React.FC<{ icon: React.ReactNode; title: string; count: number }> = ({
  icon,
  title,
  count,
}) => (
  <div className="flex items-center gap-2 mb-3">
    <span className="text-gray-500">{icon}</span>
    <h4 className="font-semibold text-gray-800">{title}</h4>
    <span className="bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded-full">{count}</span>
  </div>
);

/**
 * Option group change item
 */
const OptionGroupChangeItem: React.FC<{ change: OptionGroupChange }> = ({ change }) => (
  <div className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
    <div className="flex-1">
      <div className="flex items-center gap-2 mb-1">
        <span className="font-medium text-gray-800">{change.groupName}</span>
        <ChangeBadge type={change.type} />
        {change.wasRequired && change.type === 'removed' && (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
            <AlertTriangle size={12} />
            مجموعة مطلوبة
          </span>
        )}
      </div>
      {change.type === 'modified' && change.original && change.current && (
        <div className="text-sm text-gray-600 mt-2 space-y-1">
          {change.original.isRequired !== change.current.isRequired && (
            <div>
              مطلوب: <span className="line-through text-red-500">{change.original.isRequired ? 'نعم' : 'لا'}</span>
              {' → '}
              <span className="text-green-600">{change.current.isRequired ? 'نعم' : 'لا'}</span>
            </div>
          )}
          {change.original.minSelections !== change.current.minSelections && (
            <div>
              الحد الأدنى: <span className="line-through text-red-500">{change.original.minSelections}</span>
              {' → '}
              <span className="text-green-600">{change.current.minSelections}</span>
            </div>
          )}
          {change.original.maxSelections !== change.current.maxSelections && (
            <div>
              الحد الأقصى: <span className="line-through text-red-500">{change.original.maxSelections}</span>
              {' → '}
              <span className="text-green-600">{change.current.maxSelections}</span>
            </div>
          )}
        </div>
      )}
      {change.type === 'added' && change.current && (
        <div className="text-sm text-gray-600 mt-1">
          مطلوب: {change.current.isRequired ? 'نعم' : 'لا'} | 
          الحد الأدنى: {change.current.minSelections} | 
          الحد الأقصى: {change.current.maxSelections}
        </div>
      )}
    </div>
  </div>
);

/**
 * Container change item
 */
const ContainerChangeItem: React.FC<{ change: ContainerChange }> = ({ change }) => (
  <div className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
    <div className="flex-1">
      <div className="flex items-center gap-2 mb-1">
        <span className="font-medium text-gray-800">{change.containerName}</span>
        <ChangeBadge type={change.type} />
      </div>
      {change.type === 'modified' && change.original && change.current && (
        <div className="text-sm text-gray-600 mt-1">
          افتراضي: <span className="line-through text-red-500">{change.original.isDefault ? 'نعم' : 'لا'}</span>
          {' → '}
          <span className="text-green-600">{change.current.isDefault ? 'نعم' : 'لا'}</span>
        </div>
      )}
    </div>
  </div>
);

/**
 * Size change item
 */
const SizeChangeItem: React.FC<{ change: SizeChange }> = ({ change }) => (
  <div className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
    <div className="flex-1">
      <div className="flex items-center gap-2 mb-1">
        <span className="font-medium text-gray-800">{change.sizeName}</span>
        <ChangeBadge type={change.type} />
      </div>
      {change.type === 'modified' && change.original && change.current && (
        <div className="text-sm text-gray-600 mt-1">
          افتراضي: <span className="line-through text-red-500">{change.original.isDefault ? 'نعم' : 'لا'}</span>
          {' → '}
          <span className="text-green-600">{change.current.isDefault ? 'نعم' : 'لا'}</span>
        </div>
      )}
    </div>
  </div>
);

/**
 * Product detail change item
 */
const ProductDetailChangeItem: React.FC<{ change: ProductDetailChange }> = ({ change }) => (
  <div className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
    <div className="flex-1">
      <div className="flex items-center gap-2 mb-1">
        <span className="font-medium text-gray-800">{change.fieldLabel}</span>
        <ChangeBadge type="modified" />
      </div>
      <div className="text-sm text-gray-600 mt-1">
        <span className="line-through text-red-500">
          {change.originalValue === '' ? '(فارغ)' : String(change.originalValue)}
        </span>
        {' → '}
        <span className="text-green-600">
          {change.currentValue === '' ? '(فارغ)' : String(change.currentValue)}
        </span>
      </div>
    </div>
  </div>
);

/**
 * ChangePreviewModal Component
 * 
 * Displays all changes made to a product before saving.
 * Shows warnings for required group removal.
 * 
 * Requirements: 2.2, 2.3
 */
const ChangePreviewModal: React.FC<ChangePreviewModalProps> = ({
  isOpen,
  onClose,
  changes,
  onConfirm,
}) => {
  if (!isOpen) return null;

  const totalChanges =
    changes.productChanges.length +
    changes.optionGroupChanges.length +
    changes.containerChanges.length +
    changes.sizeChanges.length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60] backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-5">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Edit3 size={24} />
                معاينة التغييرات
              </h3>
              <p className="text-blue-100 text-sm mt-1">
                {totalChanges} تغيير سيتم تطبيقه
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-all text-white"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Warning for required group removal */}
        {changes.hasRequiredGroupRemoval && (
          <div className="bg-yellow-50 border-b border-yellow-200 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <h4 className="font-semibold text-yellow-800">تحذير: إزالة مجموعة مطلوبة</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  أنت على وشك إزالة مجموعة خيارات كانت مطلوبة. هذا قد يؤثر على تجربة العملاء عند طلب هذا المنتج.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Changes Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Product Details Changes */}
          {changes.productChanges.length > 0 && (
            <div>
              <SectionHeader
                icon={<FileText size={18} />}
                title="تفاصيل المنتج"
                count={changes.productChanges.length}
              />
              <div className="space-y-2">
                {changes.productChanges.map((change, idx) => (
                  <ProductDetailChangeItem key={idx} change={change} />
                ))}
              </div>
            </div>
          )}

          {/* Option Groups Changes */}
          {changes.optionGroupChanges.length > 0 && (
            <div>
              <SectionHeader
                icon={<Layers size={18} />}
                title="مجموعات الخيارات"
                count={changes.optionGroupChanges.length}
              />
              <div className="space-y-2">
                {changes.optionGroupChanges.map((change, idx) => (
                  <OptionGroupChangeItem key={idx} change={change} />
                ))}
              </div>
            </div>
          )}

          {/* Container Changes */}
          {changes.containerChanges.length > 0 && (
            <div>
              <SectionHeader
                icon={<Package size={18} />}
                title="الحاويات"
                count={changes.containerChanges.length}
              />
              <div className="space-y-2">
                {changes.containerChanges.map((change, idx) => (
                  <ContainerChangeItem key={idx} change={change} />
                ))}
              </div>
            </div>
          )}

          {/* Size Changes */}
          {changes.sizeChanges.length > 0 && (
            <div>
              <SectionHeader
                icon={<Ruler size={18} />}
                title="الأحجام"
                count={changes.sizeChanges.length}
              />
              <div className="space-y-2">
                {changes.sizeChanges.map((change, idx) => (
                  <SizeChangeItem key={idx} change={change} />
                ))}
              </div>
            </div>
          )}

          {/* No changes message */}
          {!changes.hasChanges && (
            <div className="text-center py-8 text-gray-500">
              <Edit3 size={48} className="mx-auto mb-3 opacity-30" />
              <p>لا توجد تغييرات للمعاينة</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-5 bg-gray-50 border-t border-gray-200">
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-100 hover:border-gray-400 transition-all font-semibold"
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={!changes.hasChanges}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all ${
                changes.hasRequiredGroupRemoval
                  ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                  : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:shadow-lg'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <Check size={18} />
              {changes.hasRequiredGroupRemoval ? 'تأكيد مع التحذير' : 'تأكيد التغييرات'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePreviewModal;
