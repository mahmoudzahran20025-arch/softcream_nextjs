/**
 * ContainersSection Component
 * 
 * Displays available containers for selection and allows setting default container.
 * 
 * @module admin/products/UnifiedProductForm/ContainersSection
 * Requirements: 1.3
 */

'use client';

import React from 'react';
import { Check, AlertTriangle } from 'lucide-react';
import type { ContainersSectionProps, ContainerAssignment } from './types';

const ContainersSection: React.FC<ContainersSectionProps> = ({
  assignments,
  onChange,
  availableContainers,
  warnings = [],
}) => {
  // Check if a container is assigned
  const isAssigned = (containerId: string): boolean => {
    return assignments.some(a => a.containerId === containerId);
  };

  // Check if a container is the default
  const isDefault = (containerId: string): boolean => {
    return assignments.some(a => a.containerId === containerId && a.isDefault);
  };

  // Toggle container assignment
  const handleToggleContainer = (containerId: string) => {
    if (isAssigned(containerId)) {
      // Remove container
      onChange(assignments.filter(a => a.containerId !== containerId));
    } else {
      // Add container
      const newAssignment: ContainerAssignment = {
        containerId,
        isDefault: assignments.length === 0, // First container is default
      };
      onChange([...assignments, newAssignment]);
    }
  };

  // Set container as default
  const handleSetDefault = (containerId: string) => {
    onChange(
      assignments.map(a => ({
        ...a,
        isDefault: a.containerId === containerId,
      }))
    );
  };

  // Check for warnings
  const hasNoDefaultWarning = warnings.some(w => w.field === 'containers');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-5 border-2 border-amber-200">
        <h3 className="text-lg font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-2 flex items-center gap-2">
          <span>🥤</span> الحاويات
        </h3>
        <p className="text-sm text-gray-600">
          اختر الحاويات المتاحة لهذا المنتج وحدد الحاوية الافتراضية
        </p>
      </div>

      {/* Containers Grid */}
      {availableContainers.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {availableContainers.map(container => {
            const assigned = isAssigned(container.id);
            const defaultContainer = isDefault(container.id);

            return (
              <div
                key={container.id}
                className={`relative rounded-xl border-2 p-4 transition-all cursor-pointer ${
                  assigned
                    ? defaultContainer
                      ? 'border-amber-500 bg-amber-50 shadow-md'
                      : 'border-amber-300 bg-amber-50/50'
                    : 'border-gray-200 bg-white hover:border-amber-300 hover:bg-amber-50/30'
                }`}
                onClick={() => handleToggleContainer(container.id)}
              >
                {/* Selection Indicator */}
                {assigned && (
                  <div className="absolute top-2 right-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      defaultContainer ? 'bg-amber-500' : 'bg-amber-300'
                    }`}>
                      <Check size={14} className="text-white" />
                    </div>
                  </div>
                )}

                {/* Container Image */}
                {container.image ? (
                  <div className="w-16 h-16 mx-auto mb-3 rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={container.image}
                      alt={container.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 mx-auto mb-3 rounded-lg bg-amber-100 flex items-center justify-center text-3xl">
                    🥤
                  </div>
                )}

                {/* Container Info */}
                <div className="text-center">
                  <div className="font-semibold text-gray-800 text-sm">{container.name}</div>
                  {container.nameEn && (
                    <div className="text-xs text-gray-500">{container.nameEn}</div>
                  )}
                  <div className="text-sm text-amber-600 font-medium mt-1">
                    {container.price > 0 ? `+${container.price} ج` : 'مجاني'}
                  </div>
                </div>

                {/* Default Badge */}
                {assigned && defaultContainer && (
                  <div className="absolute bottom-2 left-2 right-2">
                    <div className="bg-amber-500 text-white text-xs font-medium px-2 py-1 rounded-full text-center">
                      افتراضي
                    </div>
                  </div>
                )}

                {/* Set as Default Button */}
                {assigned && !defaultContainer && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSetDefault(container.id);
                    }}
                    className="absolute bottom-2 left-2 right-2 bg-white border border-amber-300 text-amber-600 text-xs font-medium px-2 py-1 rounded-full text-center hover:bg-amber-50 transition-all"
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
          <div className="text-4xl mb-3">🥤</div>
          <p className="text-gray-600 mb-2">لا توجد حاويات متاحة</p>
          <p className="text-sm text-gray-500">يرجى إضافة حاويات من إعدادات النظام</p>
        </div>
      )}

      {/* Selected Summary */}
      {assignments.length > 0 && (
        <div className="bg-amber-50 rounded-xl border border-amber-200 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-amber-800">
              الحاويات المختارة: {assignments.length}
            </span>
            {!assignments.some(a => a.isDefault) && (
              <span className="text-sm text-amber-600">
                ⚠️ لم يتم تحديد حاوية افتراضية
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
            <span>لم يتم تحديد حاوية افتراضية - يرجى اختيار حاوية كافتراضية</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContainersSection;
