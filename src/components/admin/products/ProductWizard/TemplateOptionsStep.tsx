/**
 * TemplateOptionsStep - Second step in Product Wizard
 * 
 * Combines template selection and option groups assignment
 * for a simpler user experience.
 */

'use client';

import React, { useState } from 'react';
import { Plus, X, ChevronDown, ChevronUp } from 'lucide-react';
import type { ProductFormData, OptionGroupInfo, OptionGroupAssignment } from '../UnifiedProductForm/types';

interface TemplateOptionsStepProps {
  productData: ProductFormData;
  onProductChange: (data: ProductFormData) => void;
  optionAssignments: OptionGroupAssignment[];
  onAssignmentsChange: (assignments: OptionGroupAssignment[]) => void;
  availableGroups: OptionGroupInfo[];
}

// Template cards for quick selection
const TEMPLATE_PRESETS = [
  {
    id: 'template_1',
    name: 'بسيط',
    icon: '🍦',
    description: 'منتج بسيط بدون خيارات',
    optionGroups: { min: 0, max: 1 },
  },
  {
    id: 'template_2',
    name: 'قياسي',
    icon: '🍨',
    description: 'منتج مع خيارات أساسية',
    optionGroups: { min: 1, max: 3 },
  },
  {
    id: 'template_3',
    name: 'BYO',
    icon: '🎨',
    description: 'اصنع بنفسك - خيارات متعددة',
    optionGroups: { min: 2, max: 6 },
  },
];

const TemplateOptionsStep: React.FC<TemplateOptionsStepProps> = ({
  productData,
  onProductChange,
  optionAssignments,
  onAssignmentsChange,
  availableGroups,
}) => {
  const [showGroupSelector, setShowGroupSelector] = useState(false);

  // Handle template selection
  const handleTemplateSelect = (templateId: string) => {
    onProductChange({ ...productData, template_id: templateId });
  };

  // Add option group
  const handleAddGroup = (groupId: string) => {
    const group = availableGroups.find(g => g.id === groupId);
    if (!group) return;

    const newAssignment: OptionGroupAssignment = {
      groupId: group.id,
      isRequired: false,
      minSelections: 0,
      maxSelections: group.optionsCount || 5,
      displayOrder: optionAssignments.length + 1,
    };

    onAssignmentsChange([...optionAssignments, newAssignment]);
    setShowGroupSelector(false);
  };

  // Remove option group
  const handleRemoveGroup = (groupId: string) => {
    onAssignmentsChange(optionAssignments.filter(a => a.groupId !== groupId));
  };

  // Update option group settings
  const handleUpdateGroup = (groupId: string, updates: Partial<OptionGroupAssignment>) => {
    onAssignmentsChange(
      optionAssignments.map(a =>
        a.groupId === groupId ? { ...a, ...updates } : a
      )
    );
  };

  // Get unassigned groups
  const unassignedGroups = availableGroups.filter(
    g => !optionAssignments.some(a => a.groupId === g.id)
  );

  // Get selected template info
  const selectedTemplate = TEMPLATE_PRESETS.find(t => t.id === productData.template_id);

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-800">🎨 القالب والخيارات</h3>
        <p className="text-gray-500 mt-2">اختر قالب العرض وأضف مجموعات الخيارات</p>
      </div>

      {/* Template Selection */}
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-700 flex items-center gap-2">
          <span>📐</span> نوع القالب
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {TEMPLATE_PRESETS.map(template => (
            <button
              key={template.id}
              type="button"
              onClick={() => handleTemplateSelect(template.id)}
              className={`p-5 rounded-xl border-2 text-right transition-all ${
                productData.template_id === template.id
                  ? 'border-purple-500 bg-purple-50 shadow-lg'
                  : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
              }`}
            >
              <div className="text-3xl mb-2">{template.icon}</div>
              <h5 className="font-bold text-gray-800">{template.name}</h5>
              <p className="text-sm text-gray-500 mt-1">{template.description}</p>
              <p className="text-xs text-purple-600 mt-2">
                {template.optionGroups.min}-{template.optionGroups.max} مجموعات
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Option Groups */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-gray-700 flex items-center gap-2">
            <span>📦</span> مجموعات الخيارات
          </h4>
          
          {unassignedGroups.length > 0 && (
            <button
              type="button"
              onClick={() => setShowGroupSelector(!showGroupSelector)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-all"
            >
              <Plus size={18} />
              <span>إضافة مجموعة</span>
            </button>
          )}
        </div>

        {/* Group Selector Dropdown */}
        {showGroupSelector && unassignedGroups.length > 0 && (
          <div className="bg-white border-2 border-purple-200 rounded-xl p-4 shadow-lg">
            <p className="text-sm text-gray-600 mb-3">اختر مجموعة لإضافتها:</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {unassignedGroups.map(group => (
                <button
                  key={group.id}
                  type="button"
                  onClick={() => handleAddGroup(group.id)}
                  className="p-3 text-right bg-gray-50 hover:bg-purple-50 rounded-lg border border-gray-200 hover:border-purple-300 transition-all"
                >
                  <p className="font-medium text-gray-800">{group.name}</p>
                  <p className="text-xs text-gray-500">{group.optionsCount} خيارات</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Assigned Groups */}
        {optionAssignments.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
            <p className="text-gray-500">لم يتم إضافة مجموعات خيارات بعد</p>
            <p className="text-sm text-gray-400 mt-1">
              {selectedTemplate
                ? `القالب "${selectedTemplate.name}" يدعم ${selectedTemplate.optionGroups.min}-${selectedTemplate.optionGroups.max} مجموعات`
                : 'اختر قالب أولاً'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {optionAssignments.map((assignment, index) => {
              const group = availableGroups.find(g => g.id === assignment.groupId);
              if (!group) return null;

              return (
                <OptionGroupCard
                  key={assignment.groupId}
                  group={group}
                  assignment={assignment}
                  index={index}
                  onUpdate={(updates) => handleUpdateGroup(assignment.groupId, updates)}
                  onRemove={() => handleRemoveGroup(assignment.groupId)}
                />
              );
            })}
          </div>
        )}

        {/* Template Compatibility Warning */}
        {selectedTemplate && (
          <div className={`p-4 rounded-xl ${
            optionAssignments.length >= selectedTemplate.optionGroups.min &&
            optionAssignments.length <= selectedTemplate.optionGroups.max
              ? 'bg-green-50 border border-green-200'
              : 'bg-amber-50 border border-amber-200'
          }`}>
            <p className={`text-sm ${
              optionAssignments.length >= selectedTemplate.optionGroups.min &&
              optionAssignments.length <= selectedTemplate.optionGroups.max
                ? 'text-green-700'
                : 'text-amber-700'
            }`}>
              {optionAssignments.length >= selectedTemplate.optionGroups.min &&
               optionAssignments.length <= selectedTemplate.optionGroups.max
                ? `✅ عدد المجموعات (${optionAssignments.length}) متوافق مع القالب`
                : `⚠️ القالب "${selectedTemplate.name}" يتطلب ${selectedTemplate.optionGroups.min}-${selectedTemplate.optionGroups.max} مجموعات (لديك ${optionAssignments.length})`
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Option Group Card Component
interface OptionGroupCardProps {
  group: OptionGroupInfo;
  assignment: OptionGroupAssignment;
  index: number;
  onUpdate: (updates: Partial<OptionGroupAssignment>) => void;
  onRemove: () => void;
}

const OptionGroupCard: React.FC<OptionGroupCardProps> = ({
  group,
  assignment,
  index,
  onUpdate,
  onRemove,
}) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-50">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-bold">
            {index + 1}
          </span>
          <div>
            <p className="font-semibold text-gray-800">{group.name}</p>
            <p className="text-xs text-gray-500">{group.optionsCount} خيارات</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="p-2 hover:bg-gray-200 rounded-lg transition-all"
          >
            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="p-2 hover:bg-red-100 text-red-500 rounded-lg transition-all"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Settings (Expandable) */}
      {expanded && (
        <div className="p-4 border-t border-gray-200 space-y-4">
          {/* Required Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">مطلوب</span>
            <button
              type="button"
              onClick={() => onUpdate({ isRequired: !assignment.isRequired })}
              className={`w-12 h-6 rounded-full transition-all ${
                assignment.isRequired ? 'bg-purple-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`block w-5 h-5 bg-white rounded-full shadow transition-all ${
                  assignment.isRequired ? 'mr-auto ml-0.5' : 'ml-auto mr-0.5'
                }`}
              />
            </button>
          </div>

          {/* Min/Max Selections */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">الحد الأدنى</label>
              <input
                type="number"
                value={assignment.minSelections}
                onChange={(e) => onUpdate({ minSelections: parseInt(e.target.value) || 0 })}
                min="0"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">الحد الأقصى</label>
              <input
                type="number"
                value={assignment.maxSelections}
                onChange={(e) => onUpdate({ maxSelections: parseInt(e.target.value) || 1 })}
                min="1"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateOptionsStep;
