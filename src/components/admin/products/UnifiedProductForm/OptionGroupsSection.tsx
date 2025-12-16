/**
 * OptionGroupsSection Component
 * 
 * Displays available option groups for assignment and allows configuration
 * of is_required, min_selections, max_selections per group.
 * Shows inline validation errors and warnings.
 * Includes ConditionalRulesEditor for each assigned group.
 * 
 * @module admin/products/UnifiedProductForm/OptionGroupsSection
 * Requirements: 1.3, 3.1, 3.2, 3.3, 3.4, 6.1, 6.2, 6.3, 6.4, 6.5
 */

'use client';

import React from 'react';
import { Plus, Trash2, AlertCircle, AlertTriangle, GripVertical } from 'lucide-react';
import type { OptionGroupsSectionProps, OptionGroupAssignment, OptionGroupInfo } from './types';
import ConditionalRulesEditor from '../ConditionalRulesEditor';

const OptionGroupsSection: React.FC<OptionGroupsSectionProps> = ({
  assignments,
  onChange,
  availableGroups,
  errors = [],
  warnings = [],
  productId,
}) => {
  // Note: AdvancedStyleEditor removed - styling is now managed only from Options tab

  // Filter out groups with invalid IDs to prevent React key warnings
  const validGroups = availableGroups.filter(group => group.id != null && group.id !== '');

  // Get groups that are not yet assigned
  const unassignedGroups = validGroups.filter(
    group => !assignments.some(a => a.groupId === group.id)
  );

  // Add a new option group assignment
  const handleAddGroup = (groupId: string) => {
    const newAssignment: OptionGroupAssignment = {
      groupId,
      isRequired: false,
      minSelections: 0,
      maxSelections: 1,
      displayOrder: assignments.length + 1,
    };
    onChange([...assignments, newAssignment]);
  };

  // Remove an option group assignment
  const handleRemoveGroup = (groupId: string) => {
    onChange(assignments.filter(a => a.groupId !== groupId));
  };

  // Update an assignment field
  const handleUpdateAssignment = (
    groupId: string,
    field: keyof OptionGroupAssignment,
    value: boolean | number
  ) => {
    onChange(
      assignments.map(a => {
        if (a.groupId !== groupId) return a;

        const updated = { ...a, [field]: value };

        // Requirement 3.2: Auto-correct min_selections when is_required is set to true
        if (field === 'isRequired' && value === true && updated.minSelections === 0) {
          updated.minSelections = 1;
        }

        return updated;
      })
    );
  };

  // Get group info by ID
  const getGroupInfo = (groupId: string): OptionGroupInfo | undefined => {
    return validGroups.find(g => g.id === groupId);
  };

  // Check if a field has an error
  const hasError = (groupId: string, field?: string): boolean => {
    const fieldPath = field ? `optionGroup_${groupId}.${field}` : `optionGroup_${groupId}`;
    return errors.some(e => e.field === fieldPath || e.field.startsWith(fieldPath));
  };

  // Check if a field has a warning
  const hasWarning = (groupId: string, field?: string): boolean => {
    const fieldPath = field ? `optionGroup_${groupId}.${field}` : `optionGroup_${groupId}`;
    return warnings.some(w => w.field === fieldPath || w.field.startsWith(fieldPath));
  };

  // Get error message for a field
  const getErrorMessage = (groupId: string, field?: string): string | undefined => {
    const fieldPath = field ? `optionGroup_${groupId}.${field}` : `optionGroup_${groupId}`;
    const error = errors.find(e => e.field === fieldPath || e.field.startsWith(fieldPath));
    return error?.message;
  };

  // Get warning message for a field
  const getWarningMessage = (groupId: string, field?: string): string | undefined => {
    const fieldPath = field ? `optionGroup_${groupId}.${field}` : `optionGroup_${groupId}`;
    const warning = warnings.find(w => w.field === fieldPath || w.field.startsWith(fieldPath));
    return warning?.message;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-5 border-2 border-indigo-200">
        <h3 className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2 flex items-center gap-2">
          <span>🎨</span> مجموعات الخيارات
        </h3>
        <p className="text-sm text-gray-600">
          اختر مجموعات الخيارات التي تريد ربطها بهذا المنتج وحدد قواعد الاختيار لكل مجموعة
        </p>
      </div>

      {/* Assigned Groups */}
      {assignments.length > 0 && (
        <div className="space-y-4">
          {assignments.map((assignment) => {
            const groupInfo = getGroupInfo(assignment.groupId);
            if (!groupInfo) return null;

            const groupHasError = hasError(assignment.groupId);
            const groupHasWarning = hasWarning(assignment.groupId);

            return (
              <div
                key={assignment.groupId}
                className={`bg-white rounded-xl border-2 p-4 transition-all ${groupHasError
                  ? 'border-red-300 bg-red-50/50'
                  : groupHasWarning
                    ? 'border-yellow-300 bg-yellow-50/50'
                    : 'border-gray-200 hover:border-indigo-300'
                  }`}
              >
                {/* Group Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 rounded-lg cursor-move">
                      <GripVertical size={16} className="text-indigo-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{groupInfo.icon || '📦'}</span>
                        <span className="font-semibold text-gray-800">{groupInfo.name}</span>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                          {groupInfo.optionsCount} خيار
                        </span>
                        {/* Display Style Badge */}
                        {(groupInfo.display_style || (groupInfo.ui_config && groupInfo.ui_config.display_style)) && (
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full border border-purple-200">
                            {groupInfo.display_style || groupInfo.ui_config?.display_style}
                          </span>
                        )}
                      </div>
                      {groupInfo.nameEn && (
                        <span className="text-xs text-gray-500">{groupInfo.nameEn}</span>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveGroup(assignment.groupId)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    title="إزالة المجموعة"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                {/* Configuration */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Is Required */}
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`required-${assignment.groupId}`}
                      checked={assignment.isRequired}
                      onChange={(e) => handleUpdateAssignment(assignment.groupId, 'isRequired', e.target.checked)}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <label
                      htmlFor={`required-${assignment.groupId}`}
                      className="text-sm font-medium text-gray-700"
                    >
                      مطلوب
                    </label>
                  </div>

                  {/* Min Selections */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      الحد الأدنى
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={assignment.minSelections}
                      onChange={(e) => handleUpdateAssignment(assignment.groupId, 'minSelections', parseInt(e.target.value) || 0)}
                      className={`w-full px-3 py-2 border-2 rounded-lg text-sm transition-all ${hasError(assignment.groupId, 'minSelections')
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                        : hasWarning(assignment.groupId, 'minSelections')
                          ? 'border-yellow-300 focus:ring-yellow-500 focus:border-yellow-500'
                          : 'border-gray-200 focus:ring-indigo-500 focus:border-indigo-500'
                        }`}
                    />
                  </div>

                  {/* Max Selections */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      الحد الأقصى
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={assignment.maxSelections}
                      onChange={(e) => handleUpdateAssignment(assignment.groupId, 'maxSelections', parseInt(e.target.value) || 1)}
                      className={`w-full px-3 py-2 border-2 rounded-lg text-sm transition-all ${hasError(assignment.groupId, 'maxSelections')
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                        : hasWarning(assignment.groupId, 'maxSelections')
                          ? 'border-yellow-300 focus:ring-yellow-500 focus:border-yellow-500'
                          : 'border-gray-200 focus:ring-indigo-500 focus:border-indigo-500'
                        }`}
                    />
                  </div>

                  {/* Display Order */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      ترتيب العرض
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={assignment.displayOrder}
                      onChange={(e) => handleUpdateAssignment(assignment.groupId, 'displayOrder', parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    />
                  </div>
                </div>

                {/* Error/Warning Messages */}
                {(groupHasError || groupHasWarning) && (
                  <div className="mt-3 space-y-1">
                    {getErrorMessage(assignment.groupId) && (
                      <div className="flex items-center gap-2 text-sm text-red-600">
                        <AlertCircle size={14} />
                        <span>{getErrorMessage(assignment.groupId)}</span>
                      </div>
                    )}
                    {getWarningMessage(assignment.groupId) && (
                      <div className="flex items-center gap-2 text-sm text-yellow-600">
                        <AlertTriangle size={14} />
                        <span>{getWarningMessage(assignment.groupId)}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Conditional Rules Editor - Requirements: 6.1, 6.2, 6.3, 6.4, 6.5 */}
                {productId && (
                  <div className="mt-4">
                    <ConditionalRulesEditor
                      productId={productId}
                      targetGroupId={assignment.groupId}
                      targetGroupName={groupInfo.name || groupInfo.nameAr}
                      currentRules={assignment.conditionalMaxSelections || null}
                      availableGroups={validGroups.map(g => ({
                        id: g.id,
                        name_ar: g.nameAr,
                        name_en: g.nameEn,
                        options: g.options?.map(o => ({
                          id: o.id,
                          name_ar: o.name_ar || o.name,
                          name_en: o.name_en,
                          group_id: o.group_id || g.id
                        }))
                      }))}
                      onSave={async (rules) => {
                        // Call API to persist conditional rules
                        // Requirements: 6.4 - Save conditional rules as JSON in product_options.conditional_max_selections
                        const { updateConditionalRules } = await import('@/lib/admin/options.api');
                        const result = await updateConditionalRules(productId, assignment.groupId, rules);

                        if (!result.success) {
                          throw new Error(result.error || 'فشل في حفظ القواعد المشروطة');
                        }

                        // Update the local assignment state
                        onChange(
                          assignments.map(a =>
                            a.groupId === assignment.groupId
                              ? { ...a, conditionalMaxSelections: rules }
                              : a
                          )
                        );
                      }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {assignments.length === 0 && (
        <div className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 p-8 text-center">
          <div className="text-4xl mb-3">📦</div>
          <p className="text-gray-600 mb-2">لم يتم إضافة أي مجموعات خيارات</p>
          <p className="text-sm text-gray-500">اختر من المجموعات المتاحة أدناه لإضافتها للمنتج</p>
        </div>
      )}

      {/* Available Groups to Add */}
      {unassignedGroups.length > 0 && (
        <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-5 border-2 border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Plus size={16} />
            إضافة مجموعة خيارات
          </h4>
          <div className="flex flex-wrap gap-2">
            {unassignedGroups.map(group => (
              <button
                key={group.id}
                type="button"
                onClick={() => handleAddGroup(group.id)}
                className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-all text-sm"
              >
                <span>{group.icon || '📦'}</span>
                <span className="font-medium">{group.name}</span>
                <span className="text-xs text-gray-500">({group.optionsCount})</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* No Groups Available */}
      {validGroups.length === 0 && (
        <div className="bg-yellow-50 rounded-xl border-2 border-yellow-200 p-4">
          <div className="flex items-center gap-2 text-yellow-700">
            <AlertTriangle size={18} />
            <span className="font-medium">لا توجد مجموعات خيارات متاحة</span>
          </div>
          <p className="text-sm text-yellow-600 mt-1">
            يرجى إنشاء مجموعات خيارات أولاً من صفحة إدارة الخيارات
          </p>
        </div>
      )}

      {/* Global Warnings */}
      {warnings.filter(w => w.field === 'optionGroups').length > 0 && (
        <div className="bg-yellow-50 rounded-xl border-2 border-yellow-200 p-4">
          {warnings
            .filter(w => w.field === 'optionGroups')
            .map((warning, idx) => (
              <div key={idx} className="flex items-center gap-2 text-yellow-700">
                <AlertTriangle size={18} />
                <span>{warning.message}</span>
              </div>
            ))}
        </div>
      )}

      {/* Note: AdvancedStyleEditor removed - styling is now managed only from Options tab */}
    </div>
  );
};

export default OptionGroupsSection;
