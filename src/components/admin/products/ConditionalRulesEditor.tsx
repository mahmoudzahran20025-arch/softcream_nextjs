/**
 * ConditionalRulesEditor Component
 * 
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5
 * - Display conditional rules section when editing product options
 * - Allow selecting trigger option group (e.g., sizes)
 * - Allow mapping trigger options to maxSelections values
 * - Validate rule references
 * - Persist rules as JSON in product_options.conditional_max_selections
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Settings2, 
  Plus, 
  Trash2, 
  AlertCircle, 
  Check, 
  ChevronDown,
  Loader2,
  Info
} from 'lucide-react';

// ===========================
// Types
// ===========================

export interface OptionGroup {
  id: string;
  name_ar: string;
  name_en?: string;
  options?: Option[];
}

export interface Option {
  id: string;
  name_ar: string;
  name_en?: string;
  group_id: string;
}

export interface ConditionalRule {
  trigger_group: string;
  rules: Record<string, number>;
}

export interface ConditionalRulesEditorProps {
  /** The product ID */
  productId: string;
  /** The option group ID this rule applies to (target group) */
  targetGroupId: string;
  /** Target group name for display */
  targetGroupName: string;
  /** Current conditional rules JSON string */
  currentRules: string | null;
  /** Available option groups to select as trigger */
  availableGroups: OptionGroup[];
  /** Callback when rules are saved */
  onSave: (rules: string | null) => Promise<void>;
  /** Whether the editor is in loading state */
  isLoading?: boolean;
  /** Optional class name */
  className?: string;
}

interface RuleMapping {
  optionId: string;
  optionName: string;
  maxSelections: number;
}

// ===========================
// Helper Functions
// ===========================

/**
 * Parse conditional rules JSON string
 */
function parseConditionalRules(jsonString: string | null): ConditionalRule | null {
  if (!jsonString) return null;
  
  try {
    const parsed = JSON.parse(jsonString);
    if (parsed && typeof parsed === 'object' && parsed.trigger_group && parsed.rules) {
      return parsed as ConditionalRule;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Stringify conditional rules to JSON
 */
function stringifyConditionalRules(rule: ConditionalRule | null): string | null {
  if (!rule || !rule.trigger_group || Object.keys(rule.rules).length === 0) {
    return null;
  }
  return JSON.stringify(rule);
}

// ===========================
// Sub-Components
// ===========================

interface TriggerGroupSelectorProps {
  value: string;
  onChange: (groupId: string) => void;
  groups: OptionGroup[];
  excludeGroupId: string;
  disabled?: boolean;
}

const TriggerGroupSelector: React.FC<TriggerGroupSelectorProps> = ({
  value,
  onChange,
  groups,
  excludeGroupId,
  disabled
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const availableGroups = groups.filter(g => g.id !== excludeGroupId);
  const selectedGroup = groups.find(g => g.id === value);

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        مجموعة التفعيل (Trigger Group)
      </label>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full flex items-center justify-between gap-2 px-3 py-2
          bg-white border rounded-lg transition-all text-right
          ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'hover:border-pink-400'}
          ${isOpen ? 'border-pink-500 ring-2 ring-pink-200' : 'border-gray-300'}
        `}
      >
        <span className={selectedGroup ? 'text-gray-800' : 'text-gray-500'}>
          {selectedGroup ? selectedGroup.name_ar : 'اختر مجموعة التفعيل...'}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {availableGroups.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-500">
              لا توجد مجموعات متاحة
            </div>
          ) : (
            availableGroups.map(group => (
              <button
                key={group.id}
                type="button"
                onClick={() => {
                  onChange(group.id);
                  setIsOpen(false);
                }}
                className={`
                  w-full px-3 py-2 text-right text-sm hover:bg-pink-50 transition-colors
                  ${value === group.id ? 'bg-pink-100 text-pink-700' : 'text-gray-700'}
                `}
              >
                {group.name_ar}
                {group.name_en && (
                  <span className="text-gray-400 mr-2">({group.name_en})</span>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

interface RuleMappingRowProps {
  mapping: RuleMapping;
  onChange: (optionId: string, maxSelections: number) => void;
  onRemove: (optionId: string) => void;
}

const RuleMappingRow: React.FC<RuleMappingRowProps> = ({
  mapping,
  onChange,
  onRemove
}) => {
  return (
    <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
      <div className="flex-1">
        <span className="text-sm font-medium text-gray-700">
          {mapping.optionName}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <label className="text-xs text-gray-500">الحد الأقصى:</label>
        <input
          type="number"
          min="0"
          max="20"
          value={mapping.maxSelections}
          onChange={(e) => onChange(mapping.optionId, parseInt(e.target.value) || 0)}
          className="w-16 px-2 py-1 text-center border border-gray-300 rounded focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
        />
      </div>
      <button
        type="button"
        onClick={() => onRemove(mapping.optionId)}
        className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
        title="حذف القاعدة"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
};

// ===========================
// Main Component
// ===========================

const ConditionalRulesEditor: React.FC<ConditionalRulesEditorProps> = ({
  productId,
  targetGroupId,
  targetGroupName,
  currentRules,
  availableGroups,
  onSave,
  isLoading = false,
  className = ''
}) => {
  // State
  const [isExpanded, setIsExpanded] = useState(false);
  const [triggerGroupId, setTriggerGroupId] = useState<string>('');
  const [ruleMappings, setRuleMappings] = useState<RuleMapping[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Get trigger group options
  const triggerGroup = availableGroups.find(g => g.id === triggerGroupId);
  const triggerOptions = triggerGroup?.options || [];

  // Initialize from current rules
  useEffect(() => {
    const parsed = parseConditionalRules(currentRules);
    if (parsed) {
      setTriggerGroupId(parsed.trigger_group);
      setIsExpanded(true);
      
      // Build mappings from rules
      const group = availableGroups.find(g => g.id === parsed.trigger_group);
      if (group?.options) {
        const mappings: RuleMapping[] = [];
        for (const [optionId, maxSelections] of Object.entries(parsed.rules)) {
          const option = group.options.find(o => o.id === optionId);
          if (option) {
            mappings.push({
              optionId,
              optionName: option.name_ar,
              maxSelections: maxSelections as number
            });
          }
        }
        setRuleMappings(mappings);
      }
    }
  }, [currentRules, availableGroups]);

  // Handle trigger group change
  const handleTriggerGroupChange = useCallback((groupId: string) => {
    setTriggerGroupId(groupId);
    setRuleMappings([]); // Reset mappings when trigger group changes
    setHasChanges(true);
    setError(null);
  }, []);

  // Add all options from trigger group
  const handleAddAllOptions = useCallback(() => {
    if (!triggerGroup?.options) return;
    
    const newMappings: RuleMapping[] = triggerGroup.options.map(option => ({
      optionId: option.id,
      optionName: option.name_ar,
      maxSelections: 1 // Default value
    }));
    
    setRuleMappings(newMappings);
    setHasChanges(true);
  }, [triggerGroup]);

  // Update a mapping
  const handleMappingChange = useCallback((optionId: string, maxSelections: number) => {
    setRuleMappings(prev => 
      prev.map(m => m.optionId === optionId ? { ...m, maxSelections } : m)
    );
    setHasChanges(true);
  }, []);

  // Remove a mapping
  const handleRemoveMapping = useCallback((optionId: string) => {
    setRuleMappings(prev => prev.filter(m => m.optionId !== optionId));
    setHasChanges(true);
  }, []);

  // Validate rules
  const validateRules = useCallback((): string | null => {
    if (!triggerGroupId) {
      return 'يجب اختيار مجموعة التفعيل';
    }
    
    if (ruleMappings.length === 0) {
      return 'يجب إضافة قاعدة واحدة على الأقل';
    }

    // Check if all referenced options exist
    const group = availableGroups.find(g => g.id === triggerGroupId);
    if (!group) {
      return 'مجموعة التفعيل غير موجودة';
    }

    for (const mapping of ruleMappings) {
      if (!group.options?.find(o => o.id === mapping.optionId)) {
        return `الخيار "${mapping.optionName}" غير موجود في مجموعة التفعيل`;
      }
      if (mapping.maxSelections < 0) {
        return 'الحد الأقصى يجب أن يكون 0 أو أكثر';
      }
    }

    return null;
  }, [triggerGroupId, ruleMappings, availableGroups]);

  // Save rules
  const handleSave = useCallback(async () => {
    // If no trigger group selected, clear rules
    if (!triggerGroupId) {
      setIsSaving(true);
      try {
        await onSave(null);
        setHasChanges(false);
        setError(null);
      } catch (err) {
        setError('فشل في حفظ القواعد');
      } finally {
        setIsSaving(false);
      }
      return;
    }

    // Validate
    const validationError = validateRules();
    if (validationError) {
      setError(validationError);
      return;
    }

    // Build rule object
    const rule: ConditionalRule = {
      trigger_group: triggerGroupId,
      rules: {}
    };

    for (const mapping of ruleMappings) {
      rule.rules[mapping.optionId] = mapping.maxSelections;
    }

    setIsSaving(true);
    setError(null);

    try {
      await onSave(stringifyConditionalRules(rule));
      setHasChanges(false);
    } catch (err) {
      setError('فشل في حفظ القواعد');
    } finally {
      setIsSaving(false);
    }
  }, [triggerGroupId, ruleMappings, validateRules, onSave]);

  // Clear all rules
  const handleClear = useCallback(async () => {
    setTriggerGroupId('');
    setRuleMappings([]);
    setHasChanges(true);
  }, []);

  // Get unmapped options
  const unmappedOptions = triggerOptions.filter(
    opt => !ruleMappings.find(m => m.optionId === opt.id)
  );

  return (
    <div className={`border border-amber-200 rounded-lg bg-amber-50 ${className}`}>
      {/* Header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 hover:bg-amber-100 transition-colors rounded-t-lg"
      >
        <div className="flex items-center gap-2">
          <Settings2 className="w-5 h-5 text-amber-600" />
          <span className="font-medium text-amber-800">
            قواعد مشروطة لـ "{targetGroupName}"
          </span>
          {currentRules && (
            <span className="px-2 py-0.5 text-xs bg-amber-200 text-amber-800 rounded-full">
              مُفعّل
            </span>
          )}
        </div>
        <ChevronDown className={`w-5 h-5 text-amber-600 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="p-4 border-t border-amber-200 space-y-4">
          {/* Info */}
          <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-700">
              القواعد المشروطة تسمح بتغيير الحد الأقصى للاختيارات بناءً على اختيار العميل.
              مثال: عند اختيار حجم كبير، يمكن للعميل اختيار 3 نكهات بدلاً من 1.
            </p>
          </div>

          {/* Trigger Group Selector */}
          <TriggerGroupSelector
            value={triggerGroupId}
            onChange={handleTriggerGroupChange}
            groups={availableGroups}
            excludeGroupId={targetGroupId}
            disabled={isLoading || isSaving}
          />

          {/* Rule Mappings */}
          {triggerGroupId && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  قواعد الحد الأقصى
                </label>
                {unmappedOptions.length > 0 && (
                  <button
                    type="button"
                    onClick={handleAddAllOptions}
                    className="flex items-center gap-1 px-2 py-1 text-xs text-pink-600 hover:bg-pink-50 rounded transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    إضافة كل الخيارات
                  </button>
                )}
              </div>

              {/* Mappings List */}
              <div className="space-y-2">
                {ruleMappings.map(mapping => (
                  <RuleMappingRow
                    key={mapping.optionId}
                    mapping={mapping}
                    onChange={handleMappingChange}
                    onRemove={handleRemoveMapping}
                  />
                ))}
              </div>

              {/* Add Option Dropdown */}
              {unmappedOptions.length > 0 && ruleMappings.length > 0 && (
                <div className="pt-2">
                  <select
                    onChange={(e) => {
                      const optionId = e.target.value;
                      if (!optionId) return;
                      const option = triggerOptions.find(o => o.id === optionId);
                      if (option) {
                        setRuleMappings(prev => [...prev, {
                          optionId: option.id,
                          optionName: option.name_ar,
                          maxSelections: 1
                        }]);
                        setHasChanges(true);
                      }
                      e.target.value = '';
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  >
                    <option value="">+ إضافة خيار...</option>
                    {unmappedOptions.map(opt => (
                      <option key={opt.id} value={opt.id}>
                        {opt.name_ar}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Empty State */}
              {ruleMappings.length === 0 && (
                <div className="text-center py-4 text-gray-500 text-sm">
                  لم يتم إضافة قواعد بعد. اضغط "إضافة كل الخيارات" للبدء.
                </div>
              )}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg border border-red-200">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-amber-200">
            <button
              type="button"
              onClick={handleClear}
              disabled={isLoading || isSaving || (!triggerGroupId && ruleMappings.length === 0)}
              className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              مسح الكل
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isLoading || isSaving || !hasChanges}
              className={`
                flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded transition-colors
                ${hasChanges 
                  ? 'bg-pink-500 text-white hover:bg-pink-600' 
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }
              `}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  حفظ القواعد
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConditionalRulesEditor;
