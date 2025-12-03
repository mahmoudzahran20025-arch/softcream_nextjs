/**
 * UnifiedProductForm Component
 * 
 * Main component that integrates all sections for unified product creation/editing.
 * Includes tabs layout, validation on change and submit, and template application.
 * 
 * Updated to use unified option groups interface for containers and sizes.
 * Requirements: 5.1, 5.3 - Remove separate containers/sizes sections, use unified option groups
 * 
 * @module admin/products/UnifiedProductForm
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 5.1, 5.3
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { X, Save, FileText, Layers, LayoutTemplate, Apple } from 'lucide-react';
import type {
  UnifiedProductFormProps,
  UnifiedProductData,
  ProductFormData,
  OptionGroupAssignment,
  FormTab,
  FormState,
  ChangesSummary,
} from './types';
import {
  INITIAL_UNIFIED_DATA,
  INITIAL_FORM_STATE,
  EMPTY_CHANGES_SUMMARY,
} from './types';
import { getChanges, cloneUnifiedProductData } from './changeTracking';
import ProductDetailsSection from './ProductDetailsSection';
import OptionGroupsSection from './OptionGroupsSection';
import NutritionSection from './NutritionSection';
import ValidationSummary from './ValidationSummary';
import ChangePreviewModal from './ChangePreviewModal';
import TemplateSelector from '../TemplateSelector';
import { getTemplates, getSuggestedGroupsForTemplate, checkTemplateCompatibility, type ProductTemplate } from '@/lib/admin/templates.api';
import {
  validateUnifiedProductData,
  autoCorrectUnifiedProductData,
  getTemplateForProductType,
  applySuggestedGroups,
  translateApiError,
  type ValidationResult,
  type UnifiedProductData as ValidationUnifiedProductData,
} from '@/lib/admin';

// Convert form data to validation format
// Requirements 2.4: Added template_id, card_style, old_price, discount_percentage
function toValidationFormat(data: UnifiedProductData): ValidationUnifiedProductData {
  return {
    product: {
      id: data.product.id,
      name: data.product.name,
      nameEn: data.product.nameEn || undefined,
      category: data.product.category,
      categoryEn: data.product.categoryEn || undefined,
      price: data.product.price,
      description: data.product.description || undefined,
      descriptionEn: data.product.descriptionEn || undefined,
      image: data.product.image || undefined,
      badge: data.product.badge || undefined,
      available: data.product.available,
      product_type: data.product.product_type || undefined,
      template_id: data.product.template_id || undefined,
      card_style: data.product.card_style || undefined,
      // Discount fields
      old_price: data.product.old_price || undefined,
      discount_percentage: data.product.discount_percentage || undefined,
      // Nutrition fields
      calories: data.product.calories || undefined,
      protein: data.product.protein || undefined,
      carbs: data.product.carbs || undefined,
      fat: data.product.fat || undefined,
      sugar: data.product.sugar || undefined,
      fiber: data.product.fiber || undefined,
      energy_type: data.product.energy_type || undefined,
      energy_score: data.product.energy_score || undefined,
      tags: data.product.tags || undefined,
      ingredients: data.product.ingredients || undefined,
      nutrition_facts: data.product.nutrition_facts || undefined,
      allergens: data.product.allergens || undefined,
      health_keywords: data.product.health_keywords,
      health_benefit_ar: data.product.health_benefit_ar || undefined,
    },
    optionGroupAssignments: data.optionGroupAssignments,
    containerAssignments: data.containerAssignments,
    sizeAssignments: data.sizeAssignments,
  };
}

/**
 * Tab configuration
 * Requirements: 5.3 - Organize form in tabs (Details, Template, Options, Nutrition)
 * Requirements: 2.1, 2.2, 2.5 - Added Template tab for template selection
 * Containers and sizes are now part of option_groups with group_id 'containers' and 'sizes'
 */
const TABS: Array<{ id: FormTab; label: string; icon: React.ReactNode }> = [
  { id: 'details', label: 'تفاصيل المنتج', icon: <FileText size={18} /> },
  { id: 'template', label: 'القالب', icon: <LayoutTemplate size={18} /> },
  { id: 'optionGroups', label: 'مجموعات الخيارات', icon: <Layers size={18} /> },
  { id: 'nutrition', label: 'القيم الغذائية', icon: <Apple size={18} /> },
];

// Helper to parse health_keywords from JSON string
const parseHealthKeywords = (value: string | null | undefined): string[] => {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

/**
 * UnifiedProductForm Component
 * Requirements: 5.1, 5.3 - Unified option groups interface
 * Containers and sizes are now part of optionGroups with group_id 'containers' and 'sizes'
 */
const UnifiedProductForm: React.FC<UnifiedProductFormProps> = ({
  isOpen,
  onClose,
  editingProduct,
  onSubmit,
  optionGroups,
  // Deprecated props - kept for backward compatibility
  containers: _containers,
  sizes: _sizes,
}) => {
  // Form data state
  const [unifiedData, setUnifiedData] = useState<UnifiedProductData>(INITIAL_UNIFIED_DATA);
  
  // Original data for change tracking (Requirement 2.2)
  const [originalData, setOriginalData] = useState<UnifiedProductData>(INITIAL_UNIFIED_DATA);
  
  // Form UI state
  const [formState, setFormState] = useState<FormState>(INITIAL_FORM_STATE);
  
  // Validation state
  const [validationResult, setValidationResult] = useState<ValidationResult>({
    isValid: true,
    errors: [],
    warnings: [],
  });
  
  // Changes summary for preview modal (Requirement 2.2)
  const [changesSummary, setChangesSummary] = useState<ChangesSummary>(EMPTY_CHANGES_SUMMARY);
  
  // API error state for displaying meaningful error messages (Requirement 5.5)
  const [apiError, setApiError] = useState<string | null>(null);
  
  // Templates state - Requirements 2.1, 2.2, 2.5
  const [templates, setTemplates] = useState<ProductTemplate[]>([]);
  
  // Template compatibility warning - Requirements 5.5
  const [templateCompatibilityWarning, setTemplateCompatibilityWarning] = useState<string | null>(null);

  // Fetch templates on mount - Requirements 2.1, 2.2
  useEffect(() => {
    async function fetchTemplates() {
      try {
        const response = await getTemplates();
        if (response.success) {
          setTemplates(response.data);
        }
      } catch (err) {
        console.error('Error fetching templates:', err);
      }
    }
    fetchTemplates();
  }, []);

  // Initialize form data when editing product changes
  useEffect(() => {
    if (editingProduct) {
      // Load existing product data - Requirements 2.4: Added template_id and card_style
      const productData: ProductFormData = {
        id: editingProduct.id,
        name: editingProduct.name,
        nameEn: editingProduct.nameEn || '',
        category: editingProduct.category,
        categoryEn: editingProduct.categoryEn || '',
        price: editingProduct.price.toString(),
        description: editingProduct.description || '',
        descriptionEn: editingProduct.descriptionEn || '',
        image: editingProduct.image || '',
        badge: editingProduct.badge || '',
        available: editingProduct.available,
        product_type: (editingProduct as any).product_type || 'standard',
        template_id: (editingProduct as any).template_id || '',
        card_style: (editingProduct as any).card_style || '',
        // Discount fields
        old_price: (editingProduct as any).old_price?.toString() || '',
        discount_percentage: (editingProduct as any).discount_percentage?.toString() || '',
        // Nutrition fields
        calories: editingProduct.calories?.toString() || '',
        protein: editingProduct.protein?.toString() || '',
        carbs: editingProduct.carbs?.toString() || '',
        fat: editingProduct.fat?.toString() || '',
        sugar: editingProduct.sugar?.toString() || '',
        fiber: editingProduct.fiber?.toString() || '',
        energy_type: editingProduct.energy_type || 'none',
        energy_score: editingProduct.energy_score?.toString() || '',
        tags: editingProduct.tags || '',
        ingredients: editingProduct.ingredients || '',
        nutrition_facts: editingProduct.nutrition_facts || '',
        allergens: editingProduct.allergens || '',
        health_keywords: parseHealthKeywords((editingProduct as any).health_keywords),
        health_benefit_ar: (editingProduct as any).health_benefit_ar || '',
      };

      const initialData: UnifiedProductData = {
        product: productData,
        optionGroupAssignments: [], // Will be loaded from API in full implementation
        containerAssignments: [],
        sizeAssignments: [],
      };

      setUnifiedData(initialData);
      // Store original data for change tracking (Requirement 2.2)
      setOriginalData(cloneUnifiedProductData(initialData));
    } else {
      setUnifiedData(INITIAL_UNIFIED_DATA);
      setOriginalData(cloneUnifiedProductData(INITIAL_UNIFIED_DATA));
    }
    
    setFormState(INITIAL_FORM_STATE);
    setValidationResult({ isValid: true, errors: [], warnings: [] });
    setChangesSummary(EMPTY_CHANGES_SUMMARY);
    setApiError(null); // Clear API error when form is initialized
  }, [editingProduct]);

  // Convert OptionGroupInfo to validation format
  const getValidationOptionGroups = useCallback(() => {
    return optionGroups.map(g => ({
      id: g.id,
      name: g.name,
      optionsCount: g.optionsCount,
    }));
  }, [optionGroups]);

  // Validate on data change
  useEffect(() => {
    const validationData = toValidationFormat(unifiedData);
    const result = validateUnifiedProductData(validationData, getValidationOptionGroups());
    setValidationResult(result);
  }, [unifiedData, getValidationOptionGroups]);

  // Check template compatibility - Requirements 5.5
  useEffect(() => {
    if (unifiedData.product.template_id && templates.length > 0) {
      const selectedTemplate = templates.find(t => t.id === unifiedData.product.template_id);
      if (selectedTemplate) {
        const compatibility = checkTemplateCompatibility(
          selectedTemplate,
          unifiedData.optionGroupAssignments.length
        );
        setTemplateCompatibilityWarning(compatibility.compatible ? null : compatibility.message || null);
      } else {
        setTemplateCompatibilityWarning(null);
      }
    } else {
      setTemplateCompatibilityWarning(null);
    }
  }, [unifiedData.product.template_id, unifiedData.optionGroupAssignments.length, templates]);

  // Handle product details change
  const handleProductChange = useCallback((productData: ProductFormData) => {
    console.log('📥 UnifiedProductForm handleProductChange received:', productData);
    setUnifiedData(prev => {
      const newData = {
        ...prev,
        product: productData,
      };
      console.log('📤 UnifiedProductForm new unifiedData:', newData);
      return newData;
    });
    setFormState(prev => ({ ...prev, isDirty: true }));
  }, []);

  /**
   * Handle template selection change
   * Requirements: 2.1, 2.2, 2.5 - Select template and apply suggested groups
   */
  const handleTemplateChange = useCallback((templateId: string) => {
    // Update template_id in product data
    setUnifiedData(prev => ({
      ...prev,
      product: {
        ...prev.product,
        template_id: templateId,
      },
    }));
    setFormState(prev => ({ ...prev, isDirty: true }));

    // Find the selected template and apply suggested groups
    const selectedTemplate = templates.find(t => t.id === templateId);
    if (selectedTemplate) {
      const suggestedGroupIds = getSuggestedGroupsForTemplate(selectedTemplate);
      
      // Only apply suggestions if there are no current assignments
      if (suggestedGroupIds.length > 0) {
        // Find matching option groups from available groups
        const suggestedAssignments = suggestedGroupIds
          .map((groupId, index) => {
            const group = optionGroups.find(g => g.id === groupId);
            if (group) {
              return {
                groupId: group.id,
                isRequired: false,
                minSelections: 0,
                maxSelections: group.optionsCount || 5,
                displayOrder: index + 1,
              };
            }
            return null;
          })
          .filter((a): a is NonNullable<typeof a> => a !== null);

        // Apply suggested groups if we found any matches
        if (suggestedAssignments.length > 0) {
          setUnifiedData(prev => ({
            ...prev,
            optionGroupAssignments: suggestedAssignments,
          }));
        }
      }
    }
  }, [templates, optionGroups]);

  /**
   * Handle product type change with template application
   * Requirements: 5.3 - Containers and sizes are now unified option groups
   * When product type changes, suggest appropriate option groups including containers/sizes
   */
  const handleProductTypeChange = useCallback((productType: string) => {
    const template = getTemplateForProductType(productType);
    
    // Convert optionGroups to the format expected by applySuggestedGroups
    const validationGroups = optionGroups.map(g => ({
      id: g.id,
      name: g.name,
      optionsCount: g.optionsCount,
    }));
    
    const suggestedAssignments = applySuggestedGroups(template, validationGroups);
    
    // Apply suggested groups if any (now includes containers and sizes as option groups)
    if (suggestedAssignments.length > 0) {
      setUnifiedData(prev => ({
        ...prev,
        optionGroupAssignments: suggestedAssignments,
      }));
    }
    
    // Note: Containers and sizes are now handled as unified option groups
    // with group_id 'containers' and 'sizes' respectively
    // The template.suggestedContainers and template.suggestedSizes flags
    // are handled by applySuggestedGroups which adds these option groups
  }, [optionGroups]);

  /**
   * Handle option groups change
   * Requirements: 5.1, 5.3 - Unified option groups interface
   * Now handles all option groups including containers and sizes
   */
  const handleOptionGroupsChange = useCallback((assignments: OptionGroupAssignment[]) => {
    setUnifiedData(prev => ({
      ...prev,
      optionGroupAssignments: assignments,
    }));
    setFormState(prev => ({ ...prev, isDirty: true }));
  }, []);

  // Handle tab change
  const handleTabChange = useCallback((tab: FormTab) => {
    setFormState(prev => ({ ...prev, activeTab: tab }));
  }, []);

  // Handle form submission
  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    // Validate before showing summary
    const validationData = toValidationFormat(unifiedData);
    const result = validateUnifiedProductData(validationData, getValidationOptionGroups());
    
    // Add template compatibility warning to validation result - Requirements 5.5
    if (templateCompatibilityWarning) {
      result.warnings.push({
        field: 'template_compatibility',
        message: templateCompatibilityWarning,
        code: 'TEMPLATE_INCOMPATIBLE'
      });
    }
    
    setValidationResult(result);
    
    // Show validation summary if there are errors or warnings
    if (!result.isValid || result.warnings.length > 0) {
      setFormState(prev => ({ ...prev, showValidationSummary: true }));
      return;
    }
    
    // For editing mode, show change preview (Requirement 2.2)
    // Requirements: 5.3 - Containers and sizes are now part of option groups
    if (editingProduct) {
      const changes = getChanges(originalData, unifiedData, optionGroups, [], []);
      setChangesSummary(changes);
      
      // If there are changes, show preview modal
      if (changes.hasChanges) {
        setFormState(prev => ({ ...prev, showChangePreview: true }));
        return;
      }
    }
    
    // Submit directly if no issues and no changes to preview
    await submitForm();
  }, [unifiedData, getValidationOptionGroups, editingProduct, originalData, optionGroups]);

  // Submit form after validation
  // Requirement 5.5: Display meaningful error messages to the admin
  const submitForm = useCallback(async () => {
    setFormState(prev => ({ ...prev, isSubmitting: true, showValidationSummary: false }));
    setApiError(null); // Clear previous errors
    
    try {
      // Auto-correct data before submission
      const validationData = toValidationFormat(unifiedData);
      const correctedValidationData = autoCorrectUnifiedProductData(validationData);
      
      // Convert back to form format for submission
      const correctedData: UnifiedProductData = {
        product: {
          ...unifiedData.product,
        },
        optionGroupAssignments: correctedValidationData.optionGroupAssignments,
        containerAssignments: correctedValidationData.containerAssignments,
        sizeAssignments: correctedValidationData.sizeAssignments,
      };
      
      await onSubmit(correctedData);
      handleClose();
    } catch (error) {
      console.error('Failed to submit product:', error);
      // Requirement 5.5: Extract meaningful error message for display using translation utility
      const errorMessage = translateApiError(error);
      setApiError(errorMessage);
    } finally {
      setFormState(prev => ({ ...prev, isSubmitting: false }));
    }
  }, [unifiedData, onSubmit]);

  // Handle close
  const handleClose = useCallback(() => {
    setUnifiedData(INITIAL_UNIFIED_DATA);
    setOriginalData(cloneUnifiedProductData(INITIAL_UNIFIED_DATA));
    setFormState(INITIAL_FORM_STATE);
    setValidationResult({ isValid: true, errors: [], warnings: [] });
    setChangesSummary(EMPTY_CHANGES_SUMMARY);
    setApiError(null); // Clear API error on close
    onClose();
  }, [onClose]);

  // Handle confirm from change preview modal (Requirement 2.2)
  const handleConfirmChanges = useCallback(() => {
    setFormState(prev => ({ ...prev, showChangePreview: false }));
    submitForm();
  }, [submitForm]);

  // Handle cancel change preview
  const handleCancelChangePreview = useCallback(() => {
    setFormState(prev => ({ ...prev, showChangePreview: false }));
  }, []);

  // Handle confirm with warnings
  const handleConfirmWithWarnings = useCallback(() => {
    submitForm();
  }, [submitForm]);

  // Handle cancel validation summary
  const handleCancelValidation = useCallback(() => {
    setFormState(prev => ({ ...prev, showValidationSummary: false }));
  }, []);

  /**
   * Get errors/warnings for current section
   * Requirements: 5.3 - Containers and sizes are now part of option groups
   */
  const getOptionGroupErrors = () => 
    validationResult.errors.filter(e => e.field.startsWith('optionGroup_'));
  
  const getOptionGroupWarnings = () => 
    validationResult.warnings.filter(w => 
      w.field.startsWith('optionGroup_') || 
      w.field === 'optionGroups' ||
      w.field === 'containers' ||  // Include container warnings in option groups
      w.field === 'sizes'          // Include size warnings in option groups
    );

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {editingProduct ? '✏️ تعديل منتج' : '✨ إضافة منتج جديد'}
                </h2>
                <p className="text-pink-100 text-sm mt-1">
                  {editingProduct 
                    ? 'قم بتحديث معلومات المنتج وخياراته' 
                    : 'أضف منتج جديد مع جميع الخيارات في مكان واحد'
                  }
                </p>
              </div>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-all text-white"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 bg-gray-50">
            <div className="flex overflow-x-auto">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap transition-all border-b-2 ${
                    formState.activeTab === tab.id
                      ? 'border-purple-500 text-purple-600 bg-white'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                  {/* Show error/warning indicators */}
                  {tab.id === 'details' && validationResult.errors.some(e => 
                    ['id', 'name', 'category', 'price'].includes(e.field)
                  ) && (
                    <span className="w-2 h-2 bg-red-500 rounded-full" />
                  )}
                  {/* Template tab indicator - Requirements 2.1, 2.2, 5.5 */}
                  {tab.id === 'template' && (
                    templateCompatibilityWarning ? (
                      <span className="w-2 h-2 bg-amber-500 rounded-full" title={templateCompatibilityWarning} />
                    ) : unifiedData.product.template_id ? (
                      <span className="w-2 h-2 bg-green-500 rounded-full" />
                    ) : (
                      <span className="w-2 h-2 bg-gray-300 rounded-full" />
                    )
                  )}
                  {tab.id === 'optionGroups' && (
                    getOptionGroupErrors().length > 0 ? (
                      <span className="w-2 h-2 bg-red-500 rounded-full" />
                    ) : getOptionGroupWarnings().length > 0 ? (
                      <span className="w-2 h-2 bg-yellow-500 rounded-full" />
                    ) : null
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Form Content */}
          {/* Requirements: 5.3 - Unified option groups interface */}
          {/* Requirements: 2.1, 2.2, 2.5 - Template selection tab */}
          {/* Containers and sizes are now part of option groups with group_id 'containers' and 'sizes' */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
            {formState.activeTab === 'details' && (
              <ProductDetailsSection
                formData={unifiedData.product}
                onChange={handleProductChange}
                isEditing={!!editingProduct}
                onProductTypeChange={handleProductTypeChange}
              />
            )}
            
            {/* Template Tab - Requirements 2.1, 2.2, 2.5, 5.5 */}
            {formState.activeTab === 'template' && (
              <div className="space-y-6">
                {/* Template Compatibility Warning - Requirements 5.5 */}
                {templateCompatibilityWarning && (
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border-2 border-amber-300">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                        <span className="text-amber-600 text-lg">⚠️</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-amber-800 mb-1">تحذير التوافق</h4>
                        <p className="text-sm text-amber-700">{templateCompatibilityWarning}</p>
                        <p className="text-xs text-amber-600 mt-2">
                          يمكنك تعديل مجموعات الخيارات من تبويب &quot;مجموعات الخيارات&quot; لتتوافق مع القالب المختار.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl p-5 border-2 border-violet-200">
                  <h3 className="text-lg font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent mb-4 flex items-center gap-2">
                    <span>🎨</span> قالب المنتج
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    اختر القالب المناسب لتحديد كيفية عرض المنتج وخياراته للعملاء.
                    سيتم اقتراح مجموعات الخيارات المناسبة تلقائياً.
                  </p>
                  <TemplateSelector
                    value={unifiedData.product.template_id || null}
                    onChange={handleTemplateChange}
                    optionGroupsCount={unifiedData.optionGroupAssignments.length}
                  />
                </div>
                
                {/* Current Template Info */}
                {unifiedData.product.template_id && (
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border-2 border-green-200">
                    <h4 className="text-sm font-bold text-green-700 mb-2 flex items-center gap-2">
                      <span>✅</span> القالب المختار
                    </h4>
                    {(() => {
                      const selectedTemplate = templates.find(t => t.id === unifiedData.product.template_id);
                      if (selectedTemplate) {
                        return (
                          <div className="space-y-2">
                            <p className="font-semibold text-gray-800">{selectedTemplate.name_ar}</p>
                            <p className="text-sm text-gray-600">{selectedTemplate.description_ar}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                              <span>📊 مجموعات الخيارات: {selectedTemplate.option_groups_min}-{selectedTemplate.option_groups_max}</span>
                              <span>🎯 التعقيد: {selectedTemplate.complexity === 'simple' ? 'بسيط' : selectedTemplate.complexity === 'medium' ? 'متوسط' : 'معقد'}</span>
                            </div>
                          </div>
                        );
                      }
                      return <p className="text-sm text-gray-500">جاري تحميل معلومات القالب...</p>;
                    })()}
                  </div>
                )}
                
                {/* Suggested Groups Info */}
                {unifiedData.optionGroupAssignments.length > 0 && (
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-5 border-2 border-blue-200">
                    <h4 className="text-sm font-bold text-blue-700 mb-2 flex items-center gap-2">
                      <span>💡</span> مجموعات الخيارات المُعيّنة
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {unifiedData.optionGroupAssignments.map(assignment => {
                        const group = optionGroups.find(g => g.id === assignment.groupId);
                        return (
                          <span
                            key={assignment.groupId}
                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                          >
                            {group?.name || assignment.groupId}
                          </span>
                        );
                      })}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      يمكنك تعديل هذه المجموعات من تبويب &quot;مجموعات الخيارات&quot;
                    </p>
                  </div>
                )}
              </div>
            )}
            
            {formState.activeTab === 'optionGroups' && (
              <div className="space-y-6">
                {/* Template Compatibility Warning in Options Tab - Requirements 5.5 */}
                {templateCompatibilityWarning && (
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border-2 border-amber-300">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                        <span className="text-amber-600 text-lg">⚠️</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-amber-800 mb-1">تحذير التوافق مع القالب</h4>
                        <p className="text-sm text-amber-700">{templateCompatibilityWarning}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                <OptionGroupsSection
                  assignments={unifiedData.optionGroupAssignments}
                  onChange={handleOptionGroupsChange}
                  availableGroups={optionGroups}
                  errors={getOptionGroupErrors()}
                  warnings={getOptionGroupWarnings()}
                />
              </div>
            )}
            
            {/* Nutrition Tab - Requirements 5.3 */}
            {formState.activeTab === 'nutrition' && (
              <NutritionSection
                formData={unifiedData.product}
                onChange={handleProductChange}
              />
            )}
          </form>

          {/* API Error Display - Requirement 5.5 */}
          {apiError && (
            <div className="mx-6 mb-0 mt-4 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 text-lg">❌</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-red-800 mb-1">فشل حفظ المنتج</h4>
                  <p className="text-sm text-red-600">{apiError}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setApiError(null)}
                  className="text-red-400 hover:text-red-600 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="p-6 bg-gray-50 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">
                {validationResult.errors.length > 0 && (
                  <span className="text-red-600">
                    ⚠️ {validationResult.errors.length} خطأ
                  </span>
                )}
                {validationResult.errors.length > 0 && validationResult.warnings.length > 0 && (
                  <span className="mx-2">|</span>
                )}
                {validationResult.warnings.length > 0 && (
                  <span className="text-yellow-600">
                    ⚡ {validationResult.warnings.length} تحذير
                  </span>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-6 py-3 text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-100 hover:border-gray-400 transition-all font-semibold"
                >
                  ❌ إلغاء
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={formState.isSubmitting}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl hover:shadow-xl hover:scale-105 transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <Save size={20} />
                  <span>
                    {formState.isSubmitting 
                      ? 'جاري الحفظ...' 
                      : editingProduct 
                        ? '💾 تحديث المنتج' 
                        : '✨ حفظ المنتج'
                    }
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Validation Summary Modal */}
      {formState.showValidationSummary && (
        <ValidationSummary
          errors={validationResult.errors}
          warnings={validationResult.warnings}
          onConfirmWithWarnings={handleConfirmWithWarnings}
          onCancel={handleCancelValidation}
        />
      )}

      {/* Change Preview Modal (Requirement 2.2, 2.3) */}
      {/* Requirements: 5.3 - Containers and sizes are now part of option groups */}
      <ChangePreviewModal
        isOpen={formState.showChangePreview}
        onClose={handleCancelChangePreview}
        changes={changesSummary}
        onConfirm={handleConfirmChanges}
        optionGroups={optionGroups}
        containers={[]}
        sizes={[]}
      />
    </>
  );
};

export default UnifiedProductForm;
