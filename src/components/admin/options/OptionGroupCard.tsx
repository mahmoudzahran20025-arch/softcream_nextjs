/**
 * OptionGroupCard Component - Option Group Card with Expand/Collapse
 * Requirements: 1.1, 1.2, 1.3, 1.4
 * 
 * Displays an option group with its name, icon, options count,
 * expand/collapse functionality, and edit/delete buttons.
 */

'use client';

import React from 'react';
import { ChevronDown, Edit2, Trash2, Plus } from 'lucide-react';
import type { OptionGroupCardProps } from './types';
import OptionItem from './OptionItem';

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
 * OptionGroupCard Component
 * 
 * Displays option group with expandable options list.
 * Requirements:
 * - 1.1: Display group name, icon, options count
 * - 1.2: Expand/collapse to show options
 * - 1.3: Show options with details
 * - 1.4: Display in configured order
 */
const OptionGroupCard: React.FC<OptionGroupCardProps> = ({
  group,
  isExpanded,
  searchQuery,
  onToggleExpand,
  onEdit,
  onDelete,
  onAddOption,
  onEditOption,
  onDeleteOption,
  onToggleOptionAvailability,
}) => {
  // Sort options by display_order (Requirement 1.4)
  // Filter out options with null/undefined IDs to prevent React key warnings
  const sortedOptions = [...group.options]
    .filter(opt => opt.id != null)
    .sort((a, b) => a.display_order - b.display_order);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      {/* Group Header (Requirement 1.1) */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={onToggleExpand}
        role="button"
        aria-expanded={isExpanded}
        aria-controls={`options-${group.id}`}
      >
        {/* Group Info */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className="text-2xl flex-shrink-0" role="img" aria-label="icon">
            {group.icon}
          </span>
          <div className="min-w-0">
            <h3 className="font-bold text-gray-800 truncate">
              <HighlightText text={group.name_ar} query={searchQuery} />
            </h3>
            <p className="text-sm text-gray-500">
              {group.options.length} خيار
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Edit Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="تعديل المجموعة"
          >
            <Edit2 size={18} />
          </button>

          {/* Delete Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="حذف المجموعة"
          >
            <Trash2 size={18} />
          </button>

          {/* Expand/Collapse Arrow (Requirement 1.2) */}
          <ChevronDown
            size={20}
            className={`text-gray-400 transition-transform duration-200 ${
              isExpanded ? 'rotate-180' : ''
            }`}
          />
        </div>
      </div>

      {/* Options List - Expanded (Requirement 1.2, 1.3) */}
      {isExpanded && (
        <div
          id={`options-${group.id}`}
          className="border-t border-gray-100 bg-gray-50 animate-expandDown overflow-hidden"
        >
          {sortedOptions.length === 0 ? (
            /* Empty Options State */
            <div className="p-6 text-center text-gray-500">
              <p className="mb-2">لا توجد خيارات في هذه المجموعة</p>
              <button
                onClick={onAddOption}
                className="text-pink-500 hover:text-pink-600 font-medium inline-flex items-center gap-1"
              >
                <Plus size={16} />
                <span>إضافة أول خيار</span>
              </button>
            </div>
          ) : (
            /* Options List */
            <div className="divide-y divide-gray-100">
              {sortedOptions.map((option) => (
                <OptionItem
                  key={option.id}
                  option={option}
                  searchQuery={searchQuery}
                  onEdit={() => onEditOption(option)}
                  onDelete={() => onDeleteOption(option)}
                  onToggleAvailability={(available) =>
                    onToggleOptionAvailability(option.id, available)
                  }
                />
              ))}
            </div>
          )}

          {/* Add Option Button */}
          <div className="p-3 pr-12">
            <button
              onClick={onAddOption}
              className="w-full py-2.5 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-pink-400 hover:text-pink-500 hover:bg-pink-50/50 transition-all flex items-center justify-center gap-2"
            >
              <Plus size={18} />
              <span>إضافة خيار</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OptionGroupCard;
