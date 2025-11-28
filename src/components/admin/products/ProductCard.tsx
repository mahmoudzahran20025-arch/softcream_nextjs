// src/components/admin/products/ProductCard.tsx
'use client';

import React from 'react';
import { Edit, Trash2, Eye, EyeOff, Settings, Sparkles } from 'lucide-react';
import Image from 'next/image';
import type { ProductCardProps } from './types';
import { PRODUCT_TYPES } from './types';

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onEdit, 
  onDelete, 
  onToggleAvailability, 
  onOpenConfig 
}) => {
  return (
    <div
      className={`bg-white rounded-xl shadow-sm border flex flex-col h-full ${
        product.available === 1 
          ? 'border-gray-200 hover:border-pink-300' 
          : 'border-gray-100 opacity-60'
      } hover:shadow-lg transition-all duration-200`}
    >
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

        {/* Product Type Badge */}
        {(product as any).product_type && (product as any).product_type !== 'standard' && (
          <div className="mt-2 flex items-center gap-1">
            <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium flex items-center gap-1">
              <Sparkles size={10} />
              {PRODUCT_TYPES.find(t => t.value === (product as any).product_type)?.label || 'قابل للتخصيص'}
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
          <button
            onClick={() => onToggleAvailability(product)}
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
            onClick={() => onOpenConfig(product)}
            className="flex-1 p-2 bg-gradient-to-r from-purple-50 to-pink-50 text-purple-600 rounded-lg hover:from-purple-100 hover:to-pink-100 transition-all border border-purple-200"
            title="إعدادات التخصيص"
          >
            <Settings size={14} className="mx-auto" />
          </button>
          <button
            onClick={() => onEdit(product)}
            className="flex-1 p-2 bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-600 rounded-lg hover:from-blue-100 hover:to-cyan-100 transition-all border border-blue-200"
            title="تعديل"
          >
            <Edit size={14} className="mx-auto" />
          </button>
          <button
            onClick={() => onDelete(product.id)}
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
