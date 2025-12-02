/**
 * SizesSection Component
 * 
 * Displays available sizes for selection and allows setting default size.
 * 
 * @module admin/products/UnifiedProductForm/SizesSection
 * Requirements: 1.3
 */

'use client';

import React from 'react';
import { Check, AlertTriangle } from 'lucide-react';
import type { SizesSectionProps, SizeAssignment } from './types';

const SizesSection: React.FC<SizesSectionProps> = ({
  assignments,
  onChange,
  availableSizes,
  warnings = [],
}) => {
  // Check if a size is assigned
  const isAssigned = (sizeId: string): boolean => {
    return assignments.some(a => a.sizeId === sizeId);
  };

  // Check if a size is the default
  const isDefault = (sizeId: string): boolean => {
    return assignments.some(a => a.sizeId === sizeId && a.isDefault);
  };

  // Toggle size assignment
  const handleToggleSize = (sizeId: string) => {
    if (isAssigned(sizeId)) {
      // Remove size
      onChange(assignments.filter(a => a.sizeId !== sizeId));
    } else {
      // Add size
      const newAssignment: SizeAssignment = {
        sizeId,
        isDefault: assignments.length === 0, // First size is default
      };
      onChange([...assignments, newAssignment]);
    }
  };

  // Set size as default
  const handleSetDefault = (sizeId: string) => {
    onChange(
      assignments.map(a => ({
        ...a,
        isDefault: a.sizeId === sizeId,
      }))
    );
  };

  // Check for warnings
  const hasNoDefaultWarning = warnings.some(w => w.field === 'sizes');

  // Get size icon based on multiplier
  const getSizeIcon = (multiplier: number): string => {
    if (multiplier <= 0.8) return '🥄';
    if (multiplier <= 1.0) return '🥣';
    if (multiplier <= 1.3) return '🍨';
    return '🍧';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border-2 border-blue-200">
        <h3 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2 flex items-center gap-2">
          <span>📏</span> الأحجام
        </h3>
        <p className="text-sm text-gray-600">
          اختر الأحجام المتاحة لهذا المنتج وحدد الحجم الافتراضي
        </p>
      </div>

      {/* Sizes Grid */}
      {availableSizes.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {availableSizes.map(size => {
            const assigned = isAssigned(size.id);
            const defaultSize = isDefault(size.id);

            return (
              <div
                key={size.id}
                className={`relative rounded-xl border-2 p-4 transition-all cursor-pointer ${
                  assigned
                    ? defaultSize
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-blue-300 bg-blue-50/50'
                    : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/30'
                }`}
                onClick={() => handleToggleSize(size.id)}
              >
                {/* Selection Indicator */}
                {assigned && (
                  <div className="absolute top-2 right-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      defaultSize ? 'bg-blue-500' : 'bg-blue-300'
                    }`}>
                      <Check size={14} className="text-white" />
                    </div>
                  </div>
                )}

                {/* Size Icon */}
                <div className="w-16 h-16 mx-auto mb-3 rounded-lg bg-blue-100 flex items-center justify-center text-3xl">
                  {getSizeIcon(size.priceMultiplier)}
                </div>

                {/* Size Info */}
                <div className="text-center">
                  <div className="font-semibold text-gray-800 text-sm">{size.name}</div>
                  {size.nameEn && (
                    <div className="text-xs text-gray-500">{size.nameEn}</div>
                  )}
                  <div className="text-sm text-blue-600 font-medium mt-1">
                    {size.priceMultiplier === 1 
                      ? 'السعر الأساسي' 
                      : `×${size.priceMultiplier}`
                    }
                  </div>
                </div>

                {/* Default Badge */}
                {assigned && defaultSize && (
                  <div className="absolute bottom-2 left-2 right-2">
                    <div className="bg-blue-500 text-white text-xs font-medium px-2 py-1 rounded-full text-center">
                      افتراضي
                    </div>
                  </div>
                )}

                {/* Set as Default Button */}
                {assigned && !defaultSize && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSetDefault(size.id);
                    }}
                    className="absolute bottom-2 left-2 right-2 bg-white border border-blue-300 text-blue-600 text-xs font-medium px-2 py-1 rounded-full text-center hover:bg-blue-50 transition-all"
                  >
                    تعيين كافتراضي
                  </button>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 p-8 text-center">
          <div className="text-4xl mb-3">📏</div>
          <p className="text-gray-600 mb-2">لا توجد أحجام متاحة</p>
          <p className="text-sm text-gray-500">يرجى إضافة أحجام من إعدادات النظام</p>
        </div>
      )}

      {/* Selected Summary */}
      {assignments.length > 0 && (
        <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-800">
              الأحجام المختارة: {assignments.length}
            </span>
            {!assignments.some(a => a.isDefault) && (
              <span className="text-sm text-blue-600">
                ⚠️ لم يتم تحديد حجم افتراضي
              </span>
            )}
          </div>
        </div>
      )}

      {/* Warning */}
      {hasNoDefaultWarning && (
        <div className="bg-yellow-50 rounded-xl border-2 border-yellow-200 p-4">
          <div className="flex items-center gap-2 text-yellow-700">
            <AlertTriangle size={18} />
            <span>لم يتم تحديد حجم افتراضي - يرجى اختيار حجم كافتراضي</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SizesSection;
