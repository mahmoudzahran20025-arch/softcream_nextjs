/**
 * OptionItem Component - Individual Option Row
 * Requirements: 1.3, 8.1, 8.2, 8.3
 * 
 * Displays a single option with name, price, image thumbnail,
 * availability toggle, and edit/delete buttons.
 * Implements optimistic UI update with error rollback.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Edit2, Trash2, Loader2, AlertCircle } from 'lucide-react';
import type { OptionItemProps } from './types';

/**
 * Highlights matching text in search results
 * Requirements: 9.3
 */
const HighlightText: React.FC<{ text: string; query?: string }> = ({ text, query }) => {
  if (!query?.trim()) {
    return <>{text}</>;
  }

  const parts = text.split(new RegExp(`(${query})`, 'gi'));
  
  return (
    <>
      {parts.map((part, index) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={index} className="bg-yellow-200 rounded px-0.5">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
};

/**
 * OptionItem Component
 * 
 * Displays option details with actions for edit, delete, and availability toggle.
 * Requirements: 1.3 (display option info), 8.2 (visual indication of unavailable)
 */
const OptionItem: React.FC<OptionItemProps> = ({
  option,
  searchQuery,
  onEdit,
  onDelete,
  onToggleAvailability,
}) => {
  const [isToggling, setIsToggling] = useState(false);
  const [toggleError, setToggleError] = useState<string | null>(null);
  const isAvailable = option.available === 1;

  // Auto-dismiss error after 3 seconds
  useEffect(() => {
    if (toggleError) {
      const timer = setTimeout(() => setToggleError(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toggleError]);

  /**
   * Handle availability toggle with optimistic UI update
   * Requirements: 8.1 (immediate update), 8.3 (error rollback and message)
   */
  const handleToggle = async () => {
    setIsToggling(true);
    setToggleError(null);
    try {
      await onToggleAvailability(!isAvailable);
    } catch (error) {
      // Display error message (Requirement 8.3)
      setToggleError('فشل تحديث حالة التوفر');
      console.error('Toggle availability failed:', error);
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <div
      className={`relative flex items-center justify-between p-3 pr-12 transition-all duration-200 ${
        !isAvailable ? 'opacity-50 bg-gray-100/50' : ''
      }`}
    >
      {/* Error Message Toast (Requirement 8.3) */}
      {toggleError && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full mb-1 z-10">
          <div className="bg-red-500 text-white text-xs px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-1.5 whitespace-nowrap">
            <AlertCircle size={14} />
            <span>{toggleError}</span>
          </div>
        </div>
      )}

      {/* Option Info */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Image Thumbnail */}
        {option.image ? (
          <img
            src={option.image}
            alt={option.name_ar}
            className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-gray-200"
          />
        ) : (
          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 border border-gray-200">
            <span className="text-gray-400 text-xs">📷</span>
          </div>
        )}

        {/* Name and Price */}
        <div className="min-w-0 flex-1">
          <p className="font-medium text-gray-800 truncate">
            <HighlightText text={option.name_ar} query={searchQuery} />
          </p>
          <p className="text-sm text-gray-500">
            {option.base_price > 0 ? `${option.base_price} ج.م` : 'مجاني'}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Availability Badge (Requirement 8.2) */}
        {!isAvailable && (
          <span className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded-full whitespace-nowrap">
            غير متوفر
          </span>
        )}

        {/* Availability Toggle (Requirement 8.1) */}
        <button
          onClick={handleToggle}
          disabled={isToggling}
          className={`relative w-12 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 ${
            isAvailable ? 'bg-green-500' : 'bg-gray-300'
          } ${isToggling ? 'opacity-50 cursor-not-allowed' : ''}`}
          title={isAvailable ? 'إيقاف التوفر' : 'تفعيل التوفر'}
        >
          {isToggling ? (
            <Loader2 className="w-4 h-4 text-white absolute top-1 left-1/2 -translate-x-1/2 animate-spin" />
          ) : (
            <span
              className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                isAvailable ? 'right-0.5' : 'right-6'
              }`}
            />
          )}
        </button>

        {/* Edit Button */}
        <button
          onClick={onEdit}
          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          title="تعديل الخيار"
        >
          <Edit2 size={16} />
        </button>

        {/* Delete Button */}
        <button
          onClick={onDelete}
          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="حذف الخيار"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};

export default OptionItem;
