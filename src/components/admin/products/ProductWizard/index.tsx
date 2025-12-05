/**
 * ProductWizard - Simplified Product Creation/Editing
 * 
 * A step-by-step wizard that simplifies the product creation process.
 * Replaces the complex tabbed UnifiedProductForm with a cleaner UX.
 * 
 * Steps:
 * 1. Basic Info (name, price, category, image)
 * 2. Template & Options (combined for simplicity)
 * 3. Nutrition (optional, can skip)
 */

'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Check, Loader2 } from 'lucide-react';
import type { Product } from '@/lib/admin/products.api';
import type { OptionGroupInfo, ProductFormData, OptionGroupAssignment } from '../UnifiedProductForm/types';
import { INITIAL_PRODUCT_FORM_DATA } from '../UnifiedProductForm/types';
import BasicInfoStep from './BasicInfoStep';
import TemplateOptionsStep from './TemplateOptionsStep';
import NutritionStep from './NutritionStep';

// Wizard steps configuration
const STEPS = [
  { id: 'basic', title: 'الأساسيات', icon: '📝', required: true },
  { id: 'template', title: 'القالب والخيارات', icon: '🎨', required: false },
  { id: 'nutrition', title: 'التغذية', icon: '🍎', required: false },
] as const;

type StepId = typeof STEPS[number]['id'];

interface ProductWizardProps {
  isOpen: boolean;
  onClose: () => void;
  editingProduct: Product | null;
  onSubmit: (data: ProductWizardData) => Promise<void>;
  optionGroups: OptionGroupInfo[];
}

export interface ProductWizardData {
  product: ProductFormData;
  optionGroupAssignments: OptionGroupAssignment[];
}

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

const ProductWizard: React.FC<ProductWizardProps> = ({
  isOpen,
  onClose,
  editingProduct,
  onSubmit,
  optionGroups,
}) => {
  // Current step
  const [currentStep, setCurrentStep] = useState<StepId>('basic');
  
  // Form data
  const [productData, setProductData] = useState<ProductFormData>(INITIAL_PRODUCT_FORM_DATA);
  const [optionAssignments, setOptionAssignments] = useState<OptionGroupAssignment[]>([]);
  
  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize form when editing product changes
  useEffect(() => {
    if (editingProduct) {
      setProductData({
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
        template_id: (editingProduct as any).template_id || 'template_1',
        old_price: (editingProduct as any).old_price?.toString() || '',
        discount_percentage: (editingProduct as any).discount_percentage?.toString() || '',
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
      });
    } else {
      setProductData(INITIAL_PRODUCT_FORM_DATA);
      setOptionAssignments([]);
    }
    setCurrentStep('basic');
    setError(null);
  }, [editingProduct, isOpen]);

  // Get current step index
  const currentStepIndex = STEPS.findIndex(s => s.id === currentStep);

  // Navigation handlers
  const goToNextStep = useCallback(() => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < STEPS.length) {
      setCurrentStep(STEPS[nextIndex].id);
    }
  }, [currentStepIndex]);

  const goToPrevStep = useCallback(() => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(STEPS[prevIndex].id);
    }
  }, [currentStepIndex]);

  // Validation for current step
  const isCurrentStepValid = useCallback(() => {
    if (currentStep === 'basic') {
      return productData.name.trim() !== '' && 
             productData.category.trim() !== '' && 
             parseFloat(productData.price) > 0;
    }
    return true; // Other steps are optional
  }, [currentStep, productData]);

  // Handle form submission
  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      await onSubmit({
        product: productData,
        optionGroupAssignments: optionAssignments,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء الحفظ');
    } finally {
      setIsSubmitting(false);
    }
  }, [productData, optionAssignments, onSubmit, onClose]);

  // Handle close
  const handleClose = useCallback(() => {
    if (!isSubmitting) {
      onClose();
    }
  }, [isSubmitting, onClose]);

  if (!isOpen) return null;

  const isLastStep = currentStepIndex === STEPS.length - 1;
  const isFirstStep = currentStepIndex === 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-5">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-white">
                {editingProduct ? '✏️ تعديل منتج' : '✨ إضافة منتج جديد'}
              </h2>
              <p className="text-pink-100 text-sm mt-1">
                الخطوة {currentStepIndex + 1} من {STEPS.length}
              </p>
            </div>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="p-2 hover:bg-white/20 rounded-lg transition-all text-white disabled:opacity-50"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 bg-gray-50 border-b">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => {
              const isActive = step.id === currentStep;
              const isCompleted = index < currentStepIndex;
              
              return (
                <React.Fragment key={step.id}>
                  <button
                    onClick={() => index <= currentStepIndex && setCurrentStep(step.id)}
                    disabled={index > currentStepIndex}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                      isActive
                        ? 'bg-purple-100 text-purple-700 font-semibold'
                        : isCompleted
                        ? 'bg-green-100 text-green-700 cursor-pointer hover:bg-green-200'
                        : 'text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-lg ${
                      isActive
                        ? 'bg-purple-500 text-white'
                        : isCompleted
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200'
                    }`}>
                      {isCompleted ? <Check size={16} /> : step.icon}
                    </span>
                    <span className="hidden sm:inline">{step.title}</span>
                  </button>
                  
                  {index < STEPS.length - 1 && (
                    <div className={`flex-1 h-1 mx-2 rounded ${
                      index < currentStepIndex ? 'bg-green-400' : 'bg-gray-200'
                    }`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
              <p className="font-semibold">❌ خطأ</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {currentStep === 'basic' && (
            <BasicInfoStep
              data={productData}
              onChange={setProductData}
              isEditing={!!editingProduct}
            />
          )}

          {currentStep === 'template' && (
            <TemplateOptionsStep
              productData={productData}
              onProductChange={setProductData}
              optionAssignments={optionAssignments}
              onAssignmentsChange={setOptionAssignments}
              availableGroups={optionGroups}
            />
          )}

          {currentStep === 'nutrition' && (
            <NutritionStep
              data={productData}
              onChange={setProductData}
            />
          )}
        </div>

        {/* Footer Navigation */}
        <div className="p-4 bg-gray-50 border-t flex items-center justify-between">
          <button
            onClick={goToPrevStep}
            disabled={isFirstStep || isSubmitting}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              isFirstStep
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            <ChevronRight size={20} />
            <span>السابق</span>
          </button>

          <div className="flex items-center gap-2">
            {/* Skip button for optional steps */}
            {!STEPS[currentStepIndex].required && !isLastStep && (
              <button
                onClick={goToNextStep}
                disabled={isSubmitting}
                className="px-4 py-2 text-gray-500 hover:text-gray-700 transition-all"
              >
                تخطي
              </button>
            )}

            {isLastStep ? (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !isCurrentStepValid()}
                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    <span>جاري الحفظ...</span>
                  </>
                ) : (
                  <>
                    <Check size={20} />
                    <span>حفظ المنتج</span>
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={goToNextStep}
                disabled={!isCurrentStepValid() || isSubmitting}
                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
              >
                <span>التالي</span>
                <ChevronLeft size={20} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductWizard;
