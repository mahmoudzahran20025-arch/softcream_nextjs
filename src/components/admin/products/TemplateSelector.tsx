/**
 * TemplateSelector Component
 * 
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5
 * - Display template selector dropdown when editing a product
 * - Show preview of selected template
 * - Fetch templates from product_templates table
 * - Default to template_2 (StandardCard) when no template selected
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ChevronDown, Layout, Layers, Wand2, Check, AlertCircle, Loader2 } from 'lucide-react';
import { 
  getTemplates, 
  type ProductTemplate,
  checkTemplateCompatibility 
} from '@/lib/admin/templates.api';

// ===========================
// Types
// ===========================

export interface TemplateSelectorProps {
  value: string;
  onChange: (templateId: string) => void;
  optionGroupCount?: number;
  disabled?: boolean;
  className?: string;
}

// ===========================
// Template Preview Card
// ===========================

interface TemplatePreviewProps {
  template: ProductTemplate;
  isSelected: boolean;
}

const TemplatePreview: React.FC<TemplatePreviewProps> = ({ template, isSelected }) => {
  // Get icon based on complexity
  const getIcon = () => {
    switch (template.complexity) {
      case 'simple':
        return <Layout className="w-5 h-5" />;
      case 'medium':
        return <Layers className="w-5 h-5" />;
      case 'complex':
        return <Wand2 className="w-5 h-5" />;
      default:
        return <Layout className="w-5 h-5" />;
    }
  };

  // Get color scheme based on complexity
  const getColorScheme = () => {
    switch (template.complexity) {
      case 'simple':
        return {
          bg: 'bg-green-50',
          border: isSelected ? 'border-green-500' : 'border-green-200',
          icon: 'text-green-600',
          badge: 'bg-green-100 text-green-700',
        };
      case 'medium':
        return {
          bg: 'bg-blue-50',
          border: isSelected ? 'border-blue-500' : 'border-blue-200',
          icon: 'text-blue-600',
          badge: 'bg-blue-100 text-blue-700',
        };
      case 'complex':
        return {
          bg: 'bg-purple-50',
          border: isSelected ? 'border-purple-500' : 'border-purple-200',
          icon: 'text-purple-600',
          badge: 'bg-purple-100 text-purple-700',
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: isSelected ? 'border-gray-500' : 'border-gray-200',
          icon: 'text-gray-600',
          badge: 'bg-gray-100 text-gray-700',
        };
    }
  };

  const colors = getColorScheme();

  return (
    <div className={`${colors.bg} rounded-lg p-3 border-2 ${colors.border} transition-all`}>
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg bg-white ${colors.icon}`}>
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-gray-800 text-sm">
              {template.name_ar}
            </h4>
            <span className={`text-xs px-2 py-0.5 rounded-full ${colors.badge}`}>
              {template.complexity === 'simple' && 'بسيط'}
              {template.complexity === 'medium' && 'متوسط'}
              {template.complexity === 'complex' && 'معقد'}
            </span>
          </div>
          <p className="text-xs text-gray-600 mt-1 line-clamp-2">
            {template.description_ar}
          </p>
          <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
            <span>
              {template.option_groups_min}-{template.option_groups_max} مجموعات خيارات
            </span>
          </div>
        </div>
        {isSelected && (
          <div className="flex-shrink-0">
            <Check className="w-5 h-5 text-green-600" />
          </div>
        )}
      </div>
    </div>
  );
};

// ===========================
// Main Component
// ===========================

const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  value,
  onChange,
  optionGroupCount = 0,
  disabled = false,
  className = '',
}) => {
  const [templates, setTemplates] = useState<ProductTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch templates on mount
  const fetchTemplates = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getTemplates();
      if (response.success && response.data) {
        setTemplates(response.data);
      } else {
        setError('فشل في تحميل القوالب');
      }
    } catch (err) {
      console.error('Error fetching templates:', err);
      setError('فشل في تحميل القوالب');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  // Get selected template
  const selectedTemplate = templates.find(t => t.id === value) || templates.find(t => t.id === 'template_2');
  
  // Check compatibility
  const compatibility = selectedTemplate 
    ? checkTemplateCompatibility(selectedTemplate, optionGroupCount)
    : { compatible: true };

  // Handle template selection
  const handleSelect = (templateId: string) => {
    onChange(templateId);
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.template-selector-container')) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-4 bg-gray-50 rounded-lg ${className}`}>
        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
        <span className="mr-2 text-sm text-gray-500">جاري تحميل القوالب...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center gap-2 p-4 bg-red-50 rounded-lg border border-red-200 ${className}`}>
        <AlertCircle className="w-5 h-5 text-red-500" />
        <span className="text-sm text-red-700">{error}</span>
        <button
          onClick={fetchTemplates}
          className="mr-auto text-sm text-red-600 hover:text-red-800 underline"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  return (
    <div className={`template-selector-container relative ${className}`}>
      {/* Label */}
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        🎨 قالب العرض
      </label>

      {/* Dropdown Trigger */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full flex items-center justify-between gap-2 px-4 py-3
          bg-white border-2 rounded-xl transition-all
          ${disabled 
            ? 'border-gray-200 bg-gray-50 cursor-not-allowed' 
            : isOpen 
              ? 'border-pink-500 ring-2 ring-pink-200' 
              : 'border-pink-200 hover:border-pink-400'
          }
        `}
      >
        <div className="flex items-center gap-3">
          {selectedTemplate && (
            <>
              <div className={`
                p-1.5 rounded-lg
                ${selectedTemplate.complexity === 'simple' ? 'bg-green-100 text-green-600' : ''}
                ${selectedTemplate.complexity === 'medium' ? 'bg-blue-100 text-blue-600' : ''}
                ${selectedTemplate.complexity === 'complex' ? 'bg-purple-100 text-purple-600' : ''}
              `}>
                {selectedTemplate.complexity === 'simple' && <Layout className="w-4 h-4" />}
                {selectedTemplate.complexity === 'medium' && <Layers className="w-4 h-4" />}
                {selectedTemplate.complexity === 'complex' && <Wand2 className="w-4 h-4" />}
              </div>
              <div className="text-right">
                <span className="font-medium text-gray-800">{selectedTemplate.name_ar}</span>
                <span className="text-xs text-gray-500 mr-2">({selectedTemplate.name_en})</span>
              </div>
            </>
          )}
          {!selectedTemplate && (
            <span className="text-gray-500">اختر قالب العرض</span>
          )}
        </div>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Compatibility Warning */}
      {!compatibility.compatible && (
        <div className="flex items-center gap-2 mt-2 p-2 bg-amber-50 rounded-lg border border-amber-200">
          <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
          <span className="text-xs text-amber-700">{compatibility.message}</span>
        </div>
      )}

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="p-2 max-h-96 overflow-y-auto">
            <div className="space-y-2">
              {templates.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => handleSelect(template.id)}
                  className="w-full text-right"
                >
                  <TemplatePreview 
                    template={template} 
                    isSelected={template.id === value}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Selected Template Preview */}
      {selectedTemplate && !isOpen && (
        <div className="mt-3">
          <TemplatePreview 
            template={selectedTemplate} 
            isSelected={true}
          />
        </div>
      )}
    </div>
  );
};

export default TemplateSelector;
