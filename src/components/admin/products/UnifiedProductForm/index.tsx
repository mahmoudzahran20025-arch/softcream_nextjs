/**
 * ProductFormModal (Simplified UnifiedProductForm)
 * 
 * Simple modal for product creation/editing following CouponsPage pattern.
 * Single scrollable form with 3 sections: Basic Info, Option Groups, Nutrition.
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6
 * - No tabs or wizard steps - all in one scrollable form
 * - template_id='template_1' as hidden default
 * 
 * @module admin/products/UnifiedProductForm
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { X, Save, ChevronDown, ChevronUp } from 'lucide-react';
import type {
  UnifiedProductFormProps,
  UnifiedProductData,
  ProductFormData,
  OptionGroupAssignment,
} from './types';
import {
  INITIAL_UNIFIED_DATA,
  INITIAL_PRODUCT_FORM_DATA,
} from './types';
import ProductDetailsSection from './ProductDetailsSection';
import OptionGroupsSection from './OptionGroupsSection';
import NutritionSection from './NutritionSection';
import {
  validateUnifiedProductData,
  autoCorrectUnifiedProductData,
  translateApiError,
  type ValidationResult,
  type UnifiedProductData as ValidationUnifiedProductData,
} from '@/lib/admin';

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

// Convert form data to validation format
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
      template_id: data.product.template_id || 'template_1', // Use selected template
      // Nutrition fields
      calories: data.product.calories || undefined,
      protein: data.product.protein || undefined,
      carbs: data.product.carbs || undefined,
      fat: data.product.fat || undefined,
      sugar: data.product.sugar || undefined,
      fiber: data.product.fiber || undefined,
      health_keywords: data.product.health_keywords,
    },
    optionGroupAssignments: data.optionGroupAssignments,
    containerAssignments: [],
    sizeAssignments: [],
  };
}

/**
 * ProductFormModal - Simplified product form
 * Requirements: 2.1, 2.5 - Single scrollable form, no tabs
 * Requirements: 2.6 - template_id='template_1' as hidden default
 */
const UnifiedProductForm: React.FC<UnifiedProductFormProps> = ({
  isOpen,
  onClose,
  editingProduct,
  onSubmit,
  optionGroups,
}) => {
  // Form data state
  const [unifiedData, setUnifiedData] = useState<UnifiedProductData>(INITIAL_UNIFIED_DATA);

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nutritionExpanded, setNutritionExpanded] = useState(false);
  const [isLoadingFull, setIsLoadingFull] = useState(false); // ✅ NEW: loading state for full product data

  // Validation state
  const [validationResult, setValidationResult] = useState<ValidationResult>({
    isValid: true,
    errors: [],
    warnings: [],
  });

  // API error state
  const [apiError, setApiError] = useState<string | null>(null);

  // ✅ NEW: Initialize form data when editing product changes - fetch full data from API
  useEffect(() => {
    async function loadProductData() {
      if (editingProduct && isOpen) {
        try {
          setIsLoadingFull(true);

          // Fetch full product data including option groups using the API client
          const { getProductFull } = await import('@/lib/admin/products.api');
          const result = await getProductFull(editingProduct.id);

          if (result.success && result.data) {
            const { product, optionGroups } = result.data;

            // Map product data to form format
            const productData: ProductFormData = {
              id: product.id,
              name: product.name,
              nameEn: product.nameEn || '',
              category: product.category,
              categoryEn: product.categoryEn || '',
              price: product.price?.toString() || '',
              description: product.description || '',
              descriptionEn: product.descriptionEn || '',
              image: product.image || '',
              badge: product.badge || '',
              available: product.available,
              template_id: product.template_id || 'template_1',
              template_variant: product.template_variant || '',
              is_template_dynamic: product.is_template_dynamic || 0,
              ui_config: product.ui_config || '{}',
              old_price: product.old_price?.toString() || '',
              // Nutrition
              calories: product.calories?.toString() || '',
              protein: product.protein?.toString() || '',
              carbs: product.carbs?.toString() || '',
              fat: product.fat?.toString() || '',
              sugar: product.sugar?.toString() || '',
              fiber: product.fiber?.toString() || '',
              // Energy
              energy_type: product.energy_type || 'none',
              energy_score: product.energy_score?.toString() || '',
              // Metadata
              tags: product.tags || '',
              ingredients: product.ingredients || '',
              nutrition_facts: product.nutrition_facts || '',
              allergens: product.allergens || '',
              // Health
              health_keywords: parseHealthKeywords(product.health_keywords),
              health_benefit_ar: product.health_benefit_ar || '',
            };

            // Map option groups to assignments format
            // ✅ Include conditionalMaxSelections for conditional rules (Requirements 6.1)
            const optionGroupAssignments = optionGroups.map((og: any) => ({
              groupId: og.groupId,
              isRequired: og.isRequired,
              minSelections: og.minSelections,
              maxSelections: og.maxSelections,
              displayOrder: og.displayOrder || 0,
              conditionalMaxSelections: og.conditionalMaxSelections || null,
            }));

            console.log('✅ Loaded full product data:', {
              productId: product.id,
              optionGroupsCount: optionGroupAssignments.length
            });

            setUnifiedData({
              product: productData,
              optionGroupAssignments,
              containerAssignments: [],
              sizeAssignments: [],
            });
          } else {
            console.error('Failed to load full product data');
            // Fallback to basic data
            loadBasicProductData();
          }
        } catch (error) {
          console.error('Error loading full product:', error);
          // Fallback to basic data
          loadBasicProductData();
        } finally {
          setIsLoadingFull(false);
        }
      } else if (!editingProduct && isOpen) {
        // New product - use defaults
        setUnifiedData({
          ...INITIAL_UNIFIED_DATA,
          product: {
            ...INITIAL_PRODUCT_FORM_DATA,
            template_id: 'template_1',
          },
        });
      }

      setValidationResult({ isValid: true, errors: [], warnings: [] });
      setApiError(null);
      setNutritionExpanded(false);
    }

    // Fallback function for basic data (if API fails)
    function loadBasicProductData() {
      if (!editingProduct) return;

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
        template_id: editingProduct.template_id || 'template_1',
        template_variant: '',
        is_template_dynamic: 0,
        ui_config: '{}',
        old_price: '',
        calories: editingProduct.calories?.toString() || '',
        protein: editingProduct.protein?.toString() || '',
        carbs: editingProduct.carbs?.toString() || '',
        fat: editingProduct.fat?.toString() || '',
        sugar: editingProduct.sugar?.toString() || '',
        fiber: editingProduct.fiber?.toString() || '',
        energy_type: 'none',
        energy_score: '',
        tags: '',
        ingredients: '',
        nutrition_facts: '',
        allergens: '',
        health_keywords: parseHealthKeywords((editingProduct as any).health_keywords),
        health_benefit_ar: '',
      };

      setUnifiedData({
        product: productData,
        optionGroupAssignments: [], // Empty - API failed
        containerAssignments: [],
        sizeAssignments: [],
      });
    }

    loadProductData();
  }, [editingProduct, isOpen]);

  // Convert OptionGroupInfo to validation format
  const getValidationOptionGroups = useCallback(() => {
    return optionGroups.map(g => ({
      id: g.id,
      name: g.name || g.nameAr || g.id,
      optionsCount: g.optionsCount,
    }));
  }, [optionGroups]);

  // Validate on data change
  useEffect(() => {
    const validationData = toValidationFormat(unifiedData);
    const result = validateUnifiedProductData(validationData, getValidationOptionGroups());
    setValidationResult(result);
  }, [unifiedData, getValidationOptionGroups]);

  // Handle product details change
  const handleProductChange = useCallback((productData: ProductFormData) => {
    console.log('🔄 UnifiedProductForm handleProductChange:', {
      template_id: productData.template_id,
      name: productData.name,
    });
    
    setUnifiedData(prev => ({
      ...prev,
      product: productData, // Use template_id from productData (user selection)
    }));
  }, []);

  // Handle option groups change
  const handleOptionGroupsChange = useCallback((assignments: OptionGroupAssignment[]) => {
    setUnifiedData(prev => ({
      ...prev,
      optionGroupAssignments: assignments,
    }));
  }, []);

  // Handle form submission
  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();

    // Validate before submission
    const validationData = toValidationFormat(unifiedData);
    const result = validateUnifiedProductData(validationData, getValidationOptionGroups());
    setValidationResult(result);

    if (!result.isValid) {
      return;
    }

    setIsSubmitting(true);
    setApiError(null);

    try {
      // Auto-correct and ensure template_id is set
      const correctedValidationData = autoCorrectUnifiedProductData(validationData);

      const submissionData: UnifiedProductData = {
        product: {
          ...unifiedData.product,
          template_id: unifiedData.product.template_id || 'template_1', // Use selected template
        },
        optionGroupAssignments: correctedValidationData.optionGroupAssignments,
        containerAssignments: [],
        sizeAssignments: [],
      };

      await onSubmit(submissionData);
      handleClose();
    } catch (error) {
      console.error('Failed to submit product:', error);
      const errorMessage = translateApiError(error);
      setApiError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, [unifiedData, onSubmit, getValidationOptionGroups]);

  // Handle close
  const handleClose = useCallback(() => {
    setUnifiedData(INITIAL_UNIFIED_DATA);
    setValidationResult({ isValid: true, errors: [], warnings: [] });
    setApiError(null);
    setNutritionExpanded(false);
    onClose();
  }, [onClose]);

  // Get errors for option groups section
  const getOptionGroupErrors = () =>
    validationResult.errors.filter(e => e.field.startsWith('optionGroup_'));

  const getOptionGroupWarnings = () =>
    validationResult.warnings.filter(w =>
      w.field.startsWith('optionGroup_') || w.field === 'optionGroups'
    );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-white">
                {editingProduct ? '✏️ تعديل منتج' : '✨ إضافة منتج جديد'}
              </h2>
              <p className="text-pink-100 text-sm mt-1">
                {editingProduct
                  ? 'قم بتحديث معلومات المنتج'
                  : 'أضف منتج جديد للقائمة'
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

        {/* ✅ NEW: Loading State when fetching full product data */}
        {isLoadingFull && (
          <div className="flex-1 flex items-center justify-center p-12">
            <div className="text-center">
              <div className="relative w-16 h-16 mx-auto mb-4">
                {/* Spinning loader */}
                <div className="absolute inset-0 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin"></div>
                {/* Inner pulsing circle */}
                <div className="absolute inset-2 bg-pink-100 rounded-full animate-pulse"></div>
              </div>
              <p className="text-gray-700 font-medium mb-1">جاري تحميل بيانات المنتج...</p>
              <p className="text-sm text-gray-500">يتم الآن تحميل مجموعات الخيارات والإعدادات</p>
            </div>
          </div>
        )}

        {/* Form Content - Only show when not loading */}
        {!isLoadingFull && (
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Section 1: Basic Info */}
            <ProductDetailsSection
              formData={unifiedData.product}
              onChange={handleProductChange}
              isEditing={!!editingProduct}
            />

            {/* Section 2: Option Groups */}
            <OptionGroupsSection
              assignments={unifiedData.optionGroupAssignments}
              onChange={handleOptionGroupsChange}
              availableGroups={optionGroups}
              errors={getOptionGroupErrors()}
              warnings={getOptionGroupWarnings()}
              productId={editingProduct?.id}
            />

            {/* Section 3: Nutrition (Collapsible) */}
            <div className="rounded-xl border-2 border-green-200 overflow-hidden">
              <button
                type="button"
                onClick={() => setNutritionExpanded(!nutritionExpanded)}
                className="w-full p-4 flex items-center justify-between text-left bg-gradient-to-br from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 transition-colors"
              >
                <h3 className="text-lg font-bold text-green-800 flex items-center gap-2">
                  <span>🍎</span> القيم الغذائية
                  <span className="text-sm font-normal text-gray-500">(اختياري)</span>
                </h3>
                {nutritionExpanded ? (
                  <ChevronUp className="text-green-600" size={24} />
                ) : (
                  <ChevronDown className="text-green-600" size={24} />
                )}
              </button>
              {nutritionExpanded && (
                <div className="p-4 bg-white">
                  <NutritionSection
                    formData={unifiedData.product}
                    onChange={handleProductChange}
                  />
                </div>
              )}
            </div>
          </form>
        )}

        {/* API Error Display */}
        {apiError && (
          <div className="mx-6 mb-0 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
            <div className="flex items-start gap-3">
              <span className="text-red-600 text-lg">❌</span>
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

        {/* Validation Errors Display */}
        {validationResult.errors.length > 0 && (
          <div className="mx-6 mb-0 p-4 bg-amber-50 border-2 border-amber-200 rounded-xl">
            <div className="flex items-start gap-3">
              <span className="text-amber-600 text-lg">⚠️</span>
              <div className="flex-1">
                <h4 className="font-semibold text-amber-800 mb-1">يرجى تصحيح الأخطاء التالية</h4>
                <ul className="text-sm text-amber-700 list-disc list-inside">
                  {validationResult.errors.map((err, idx) => (
                    <li key={idx}>{err.message}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="p-6 bg-gray-50 border-t border-gray-200">
          <div className="flex justify-end gap-3">
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
              disabled={isSubmitting || validationResult.errors.length > 0}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl hover:shadow-xl hover:scale-105 transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <Save size={20} />
              <span>
                {isSubmitting
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
  );
};

export default UnifiedProductForm;
