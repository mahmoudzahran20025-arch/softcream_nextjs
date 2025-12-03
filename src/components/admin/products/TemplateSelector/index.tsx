/**
 * TemplateSelector Component
 * 
 * Allows admin to select a product template (Simple, Medium, Complex).
 * Displays templates as cards with description and complexity level.
 * 
 * @module admin/products/TemplateSelector
 * Requirements: 2.1, 2.2 - Allow selecting and displaying templates
 */

'use client';

import React, { useEffect, useState } from 'react';
import { Layers, Sparkles, Wand2, Check, AlertCircle, Loader2 } from 'lucide-react';
import { getTemplates, type ProductTemplate } from '@/lib/admin/templates.api';

export interface TemplateSelectorProps {
  /** Currently selected template ID */
  value: string | null;
  /** Callback when template is selected */
  onChange: (templateId: string) => void;
  /** Number of currently assigned option groups (for compatibility check) */
  optionGroupsCount?: number;
  /** Whether the selector is disabled */
  disabled?: boolean;
}

/**
 * Get icon for template based on complexity
 */
function getTemplateIcon(complexity: string) {
  switch (complexity) {
    case 'simple':
      return <Layers className="w-6 h-6" />;
    case 'medium':
      return <Sparkles className="w-6 h-6" />;
    case 'complex':
      return <Wand2 className="w-6 h-6" />;
    default:
      return <Layers className="w-6 h-6" />;
  }
}

/**
 * Get color classes for template based on complexity
 */
function getTemplateColors(complexity: string, isSelected: boolean) {
  const baseColors = {
    simple: {
      bg: isSelected ? 'bg-green-100' : 'bg-green-50',
      border: isSelected ? 'border-green-500 ring-2 ring-green-500' : 'border-green-200',
      icon: 'text-green-600',
      badge: 'bg-green-100 text-green-700',
    },
    medium: {
      bg: isSelected ? 'bg-blue-100' : 'bg-blue-50',
      border: isSelected ? 'border-blue-500 ring-2 ring-blue-500' : 'border-blue-200',
      icon: 'text-blue-600',
      badge: 'bg-blue-100 text-blue-700',
    },
    complex: {
      bg: isSelected ? 'bg-purple-100' : 'bg-purple-50',
      border: isSelected ? 'border-purple-500 ring-2 ring-purple-500' : 'border-purple-200',
      icon: 'text-purple-600',
      badge: 'bg-purple-100 text-purple-700',
    },
  };
  
  return baseColors[complexity as keyof typeof baseColors] || baseColors.simple;
}

/**
 * TemplateSelector Component
 * 
 * Displays available templates as selectable cards.
 * Requirements: 2.1, 2.2
 */
const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  value,
  onChange,
  optionGroupsCount = 0,
  disabled = false,
}) => {
  const [templates, setTemplates] = useState<ProductTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch templates on mount
  useEffect(() => {
    async function fetchTemplates() {
      try {
        setLoading(true);
        setError(null);
        const response = await getTemplates();
        if (response.success) {
          setTemplates(response.data);
        } else {
          setError('فشل في تحميل القوالب');
        }
      } catch (err) {
        console.error('Error fetching templates:', err);
        setError('فشل في تحميل القوالب');
      } finally {
        setLoading(false);
      }
    }
    
    fetchTemplates();
  }, []);

  /**
   * Check if template is compatible with current option groups count
   */
  function isCompatible(template: ProductTemplate): boolean {
    return optionGroupsCount >= template.option_groups_min && 
           optionGroupsCount <= template.option_groups_max;
  }

  /**
   * Get compatibility message
   */
  function getCompatibilityMessage(template: ProductTemplate): string | null {
    if (optionGroupsCount < template.option_groups_min) {
      return `يتطلب ${template.option_groups_min} مجموعات على الأقل`;
    }
    if (optionGroupsCount > template.option_groups_max) {
      return `يدعم ${template.option_groups_max} مجموعات كحد أقصى`;
    }
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-pink-500" />
        <span className="mr-2 text-gray-600">جاري تحميل القوالب...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-8 text-red-500">
        <AlertCircle className="w-5 h-5 ml-2" />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">اختر قالب المنتج</h3>
        {optionGroupsCount > 0 && (
          <span className="text-xs text-gray-500">
            {optionGroupsCount} مجموعات خيارات مُعيّنة
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {templates.map((template) => {
          const isSelected = value === template.id;
          const compatible = isCompatible(template);
          const compatibilityMsg = getCompatibilityMessage(template);
          const colors = getTemplateColors(template.complexity, isSelected);
          
          return (
            <button
              key={template.id}
              type="button"
              onClick={() => onChange(template.id)}
              disabled={disabled}
              className={`
                relative p-4 rounded-xl border-2 transition-all duration-200
                ${colors.bg} ${colors.border}
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md cursor-pointer'}
                ${!compatible && !isSelected ? 'opacity-60' : ''}
              `}
            >
              {/* Selected indicator */}
              {isSelected && (
                <div className="absolute top-2 left-2">
                  <div className="w-6 h-6 rounded-full bg-white shadow flex items-center justify-center">
                    <Check className="w-4 h-4 text-green-600" />
                  </div>
                </div>
              )}

              {/* Template Icon */}
              <div className={`mb-3 ${colors.icon}`}>
                {getTemplateIcon(template.complexity)}
              </div>

              {/* Template Name */}
              <h4 className="font-bold text-gray-800 mb-1">
                {template.name_ar}
              </h4>
              <p className="text-xs text-gray-500 mb-2">
                {template.name_en}
              </p>

              {/* Description */}
              <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                {template.description_ar}
              </p>

              {/* Complexity Badge */}
              <div className="flex items-center justify-between">
                <span className={`text-xs px-2 py-1 rounded-full ${colors.badge}`}>
                  {template.option_groups_min}-{template.option_groups_max} مجموعات
                </span>
                
                {/* Compatibility Warning */}
                {compatibilityMsg && !isSelected && (
                  <span className="text-xs text-amber-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                  </span>
                )}
              </div>

              {/* Compatibility Message Tooltip */}
              {compatibilityMsg && (
                <div className="mt-2 text-xs text-amber-600 bg-amber-50 rounded px-2 py-1">
                  {compatibilityMsg}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Help Text */}
      <p className="text-xs text-gray-500 mt-2">
        💡 اختر القالب المناسب بناءً على عدد مجموعات الخيارات التي تريد إضافتها للمنتج
      </p>
    </div>
  );
};

export default TemplateSelector;
