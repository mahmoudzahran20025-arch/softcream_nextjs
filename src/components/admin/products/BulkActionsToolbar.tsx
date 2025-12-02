// src/components/admin/products/BulkActionsToolbar.tsx
'use client';

import React from 'react';
import { X, Layers, CheckSquare, Square } from 'lucide-react';

export interface BulkActionsToolbarProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onOpenBulkAssign: () => void;
  onCancel: () => void;
}

const BulkActionsToolbar: React.FC<BulkActionsToolbarProps> = ({
  selectedCount,
  totalCount,
  onSelectAll,
  onDeselectAll,
  onOpenBulkAssign,
  onCancel,
}) => {
  const allSelected = selectedCount === totalCount && totalCount > 0;

  return (
    <div className="sticky top-0 z-20 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg shadow-lg p-3 mb-4 flex items-center justify-between gap-4 animate-slideDown">
      <div className="flex items-center gap-3">
        {/* Selection count */}
        <div className="flex items-center gap-2">
          <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
            {selectedCount} منتج محدد
          </span>
        </div>

        {/* Select/Deselect all */}
        <button
          onClick={allSelected ? onDeselectAll : onSelectAll}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm"
        >
          {allSelected ? (
            <>
              <Square size={16} />
              <span>إلغاء تحديد الكل</span>
            </>
          ) : (
            <>
              <CheckSquare size={16} />
              <span>تحديد الكل ({totalCount})</span>
            </>
          )}
        </button>
      </div>

      <div className="flex items-center gap-2">
        {/* Bulk Assign Option Group */}
        <button
          onClick={onOpenBulkAssign}
          disabled={selectedCount === 0}
          className="flex items-center gap-1.5 px-4 py-2 bg-white text-purple-600 rounded-lg hover:bg-purple-50 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Layers size={16} />
          <span>تعيين مجموعة خيارات</span>
        </button>

        {/* Cancel */}
        <button
          onClick={onCancel}
          className="flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm"
        >
          <X size={16} />
          <span>إلغاء</span>
        </button>
      </div>
    </div>
  );
};

export default BulkActionsToolbar;
