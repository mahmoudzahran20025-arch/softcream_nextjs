// src/components/admin/products/ProductCard.tsx
'use client';

import React from 'react';
import { Edit, Trash2, Eye, EyeOff, Sparkles, Check } from 'lucide-react';
import Image from 'next/image';
import type { ProductCardProps } from './types';
import { PRODUCT_TYPES } from './types';
import TemplateBadge from './TemplateBadge';
import OptionGroupsBadge from './OptionGroupsBadge';

/**
 * ProductCard Component
 * Updated: Added TemplateBadge and OptionGroupsBadge
 * Requirements: 5.1 - Show template badge (Simple/Medium/Complex)
 * Requirements: 5.2 - Show assigned option groups count with tooltip
 */
const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onEdit, 
  onDelete, 
  onToggleAvailability, 
  onOpenConfig: _onOpenConfig, // Deprecated - kept for backward compatibility
  isSelected = false,
  onSelectionChange,
  selectionMode = false,
  // Template badge props (Requirements: 5.1)
  templateId,
  templateComplexity,
  templateNameAr,
  templateNameEn,
  // Option groups badge props (Requirements: 5.2)
  assignedGroups = []
}) => {
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    onSelectionChange?.(product.id, e.target.checked);
  };

  const handleCardClick = () => {
    if (selectionMode && onSelectionChange) {
      onSelectionChange(product.id, !isSelected);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={`relative bg-white rounded-xl shadow-sm border flex flex-col h-full ${
        product.available === 1 
          ? 'border-gray-200 hover:border-pink-300' 
          : 'border-gray-100 opacity-60'
      } ${
        isSelected 
          ? 'ring-2 ring-pink-500 border-pink-500' 
          : ''
      } ${
        selectionMode ? 'cursor-pointer' : ''
      } hover:shadow-lg transition-all duration-200`}
    >
      {/* Selection Checkbox */}
      {selectionMode && (
        <div className="absolute top-2 left-2 z-10">
          <label 
            className={`w-6 h-6 rounded-md border-2 flex items-center justify-center cursor-pointer transition-all ${
              isSelected 
                ? 'bg-pink-500 border-pink-500' 
                : 'bg-white border-gray-300 hover:border-pink-400'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="checkbox"
              checked={isSelected}
              onChange={handleCheckboxChange}
              className="sr-only"
            />
            {isSelected && <Check size={14} className="text-white" />}
          </label>
        </div>
      )}

      {/* Product Image */}
      {product.image && (
        <div className="relative w-full h-40 bg-gradient-to-br from-pink-50 to-purple-50 rounded-t-xl overflow-hidden">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {product.badge && (
            <div className="absolute top-2 right-2">
              <span className="px-3 py-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-semibold rounded-full shadow-lg">
                {product.badge}
              </span>
            </div>
          )}
          {product.available === 0 && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="text-white font-bold text-lg">غير متاح</span>
            </div>
          )}
        </div>
      )}

      {/* Product Info */}
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex-1">
          <h3 className="font-bold text-base text-gray-800 line-clamp-1">{product.name}</h3>
          {product.nameEn && (
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{product.nameEn}</p>
          )}
          
          <div className="mt-3 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 font-medium">الفئة</span>
              <span className="text-sm font-bold text-gray-800 bg-gradient-to-r from-gray-100 to-slate-100 px-3 py-1.5 rounded-lg border border-gray-200">
                {product.category}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 font-medium">السعر</span>
              <span className="font-bold text-xl bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                {product.price} ج
              </span>
            </div>
          </div>
        </div>

        {/* Badges Section - Template, Option Groups, Product Type */}
        {/* Requirements: 5.1 - Template Badge, 5.2 - Option Groups Badge */}
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {/* Template Badge (Requirements: 5.1) */}
          <TemplateBadge
            templateId={templateId || (product as any).template_id}
            complexity={templateComplexity}
            nameAr={templateNameAr}
            nameEn={templateNameEn}
          />
          
          {/* Option Groups Badge (Requirements: 5.2) */}
          <OptionGroupsBadge
            productId={product.id}
            assignedGroups={assignedGroups}
          />
          
          {/* Product Type Badge (legacy) */}
          {(product as any).product_type && (product as any).product_type !== 'standard' && (
            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full font-medium flex items-center gap-1">
              <Sparkles size={10} />
              {PRODUCT_TYPES.find(t => t.value === (product as any).product_type)?.label || 'قابل للتخصيص'}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        {/* Updated: Removed Settings button - use Edit for all configuration via UnifiedProductForm */}
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
          <button
            onClick={(e) => { e.stopPropagation(); onToggleAvailability(product); }}
            className={`flex-1 p-2 rounded-lg transition-all text-xs font-medium ${
              product.available === 1
                ? 'bg-green-50 text-green-600 hover:bg-green-100 border border-green-200'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
            title={product.available === 1 ? 'تعطيل' : 'تفعيل'}
          >
            {product.available === 1 ? <Eye size={14} className="mx-auto" /> : <EyeOff size={14} className="mx-auto" />}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(product); }}
            className="flex-1 p-2 bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-600 rounded-lg hover:from-blue-100 hover:to-cyan-100 transition-all border border-blue-200"
            title="تعديل المنتج والخيارات"
          >
            <Edit size={14} className="mx-auto" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(product.id); }}
            className="flex-1 p-2 bg-gradient-to-r from-red-50 to-pink-50 text-red-600 rounded-lg hover:from-red-100 hover:to-pink-100 transition-all border border-red-200"
            title="حذف"
          >
            <Trash2 size={14} className="mx-auto" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
