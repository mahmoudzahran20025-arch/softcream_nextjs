/**
 * TemplateBadge Component
 * 
 * Displays a badge showing the product template type (Simple/Medium/Complex).
 * Each template type has a distinct color for easy identification.
 * 
 * Requirements: 5.1 - Show template badge (Simple/Medium/Complex) with different colors
 * 
 * @module admin/products/TemplateBadge
 */

'use client';

import React from 'react';
import { Layers, Sparkles, Zap } from 'lucide-react';

export type TemplateComplexity = 'simple' | 'medium' | 'complex';

export interface TemplateBadgeProps {
  /** Template ID (e.g., 'template_1', 'template_2', 'template_3') */
  templateId?: string | null;
  /** Template complexity level */
  complexity?: TemplateComplexity | null;
  /** Template name in Arabic */
  nameAr?: string;
  /** Template name in English */
  nameEn?: string;
  /** Size variant */
  size?: 'sm' | 'md';
}

/**
 * Configuration for each template complexity level
 */
const TEMPLATE_CONFIG: Record<TemplateComplexity, {
  label: string;
  labelEn: string;
  icon: React.ReactNode;
  bgClass: string;
  textClass: string;
  borderClass: string;
}> = {
  simple: {
    label: 'بسيط',
    labelEn: 'Simple',
    icon: <Layers size={12} />,
    bgClass: 'bg-gradient-to-r from-green-50 to-emerald-50',
    textClass: 'text-green-700',
    borderClass: 'border-green-200',
  },
  medium: {
    label: 'متوسط',
    labelEn: 'Medium',
    icon: <Sparkles size={12} />,
    bgClass: 'bg-gradient-to-r from-blue-50 to-cyan-50',
    textClass: 'text-blue-700',
    borderClass: 'border-blue-200',
  },
  complex: {
    label: 'معقد',
    labelEn: 'Complex',
    icon: <Zap size={12} />,
    bgClass: 'bg-gradient-to-r from-purple-50 to-pink-50',
    textClass: 'text-purple-700',
    borderClass: 'border-purple-200',
  },
};

/**
 * Maps template ID to complexity level
 */
export function getComplexityFromTemplateId(templateId: string | null | undefined): TemplateComplexity | null {
  if (!templateId) return null;
  
  // Handle both formats: 'template_1' and 'simple'
  const mapping: Record<string, TemplateComplexity> = {
    'template_1': 'simple',
    'template_2': 'medium',
    'template_3': 'complex',
    'simple': 'simple',
    'medium': 'medium',
    'complex': 'complex',
  };
  
  return mapping[templateId] || null;
}

/**
 * TemplateBadge Component
 * 
 * Displays a colored badge indicating the product's template complexity.
 */
const TemplateBadge: React.FC<TemplateBadgeProps> = ({
  templateId,
  complexity,
  nameAr,
  nameEn,
  size = 'sm',
}) => {
  // Determine complexity from props or templateId
  const resolvedComplexity = complexity || getComplexityFromTemplateId(templateId);
  
  // Don't render if no template assigned
  if (!resolvedComplexity) {
    return null;
  }

  const config = TEMPLATE_CONFIG[resolvedComplexity];
  
  // Use custom names if provided, otherwise use defaults
  const displayLabel = nameAr || config.label;
  
  const sizeClasses = size === 'sm' 
    ? 'px-2 py-0.5 text-xs gap-1'
    : 'px-2.5 py-1 text-sm gap-1.5';

  return (
    <span
      className={`inline-flex items-center ${sizeClasses} ${config.bgClass} ${config.textClass} font-medium rounded-full border ${config.borderClass}`}
      data-testid="template-badge"
      data-template-id={templateId}
      data-complexity={resolvedComplexity}
      title={nameEn || config.labelEn}
    >
      {config.icon}
      <span>{displayLabel}</span>
    </span>
  );
};

export default TemplateBadge;
