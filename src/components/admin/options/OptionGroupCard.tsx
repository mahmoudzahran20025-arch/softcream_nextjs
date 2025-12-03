/**
 * OptionGroupCard Component - Option Group Card with Expand/Collapse
 * Requirements: 1.1, 1.2, 1.3, 1.4, 4.1, 4.2, 9.1
 * 
 * Displays an option group with its name, icon, options count,
 * expand/collapse functionality, and edit/delete buttons.
 * Uses DynamicIcon for icon rendering and shows display_style badge.
 * 
 * Enhanced features (Task 9.1):
 * - DynamicIcon component for icon rendering
 * - Edit UI Config button
 * - Improved animations for expand/collapse
 */

'use client';

import React from 'react';
import { ChevronDown, Edit2, Trash2, Plus, Settings2, GripVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { OptionGroupCardProps } from './types';
import OptionItem from './OptionItem';
import DynamicIcon from '@/components/ui/DynamicIcon';
import { parseUIConfig, type UIConfig, type IconConfig } from '@/lib/uiConfig';

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
 * Display style badge configuration
 * Requirements: 4.1
 */
const DISPLAY_STYLE_CONFIG: Record<string, { label: string; color: string; bgColor: string }> = {
  grid: { label: 'شبكة', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  list: { label: 'قائمة', color: 'text-green-700', bgColor: 'bg-green-100' },
  pills: { label: 'أزرار', color: 'text-purple-700', bgColor: 'bg-purple-100' },
  cards: { label: 'بطاقات', color: 'text-orange-700', bgColor: 'bg-orange-100' },
};

/**
 * DisplayStyleBadge Component
 * Shows the display style of the option group
 * Requirements: 4.1
 */
const DisplayStyleBadge: React.FC<{ displayMode: string }> = ({ displayMode }) => {
  const config = DISPLAY_STYLE_CONFIG[displayMode] || DISPLAY_STYLE_CONFIG.grid;
  
  return (
    <span 
      className={`px-2 py-0.5 text-xs font-medium rounded-full ${config.bgColor} ${config.color}`}
      title={`نمط العرض: ${config.label}`}
    >
      {config.label}
    </span>
  );
};

/**
 * Helper to get IconConfig from group
 * Requirements: 4.1
 */
const getIconConfig = (group: OptionGroupCardProps['group']): IconConfig => {
  // Parse ui_config if it's a string
  const uiConfig: UIConfig = typeof group.ui_config === 'string' 
    ? parseUIConfig(group.ui_config)
    : group.ui_config || parseUIConfig();
  
  // If ui_config has icon config, use it
  if (uiConfig.icon) {
    return uiConfig.icon;
  }
  
  // Fallback: use group.icon as emoji
  return {
    type: 'emoji',
    value: group.icon || '📦',
    style: 'solid',
    animation: 'none',
  };
};

/**
 * Animation variants for expand/collapse
 * Requirement 9.1: Improved animations
 */
const expandVariants = {
  collapsed: {
    height: 0,
    opacity: 0,
    transition: {
      height: { duration: 0.3, ease: [0.4, 0, 0.2, 1] as const },
      opacity: { duration: 0.2 },
    },
  },
  expanded: {
    height: 'auto',
    opacity: 1,
    transition: {
      height: { duration: 0.3, ease: [0.4, 0, 0.2, 1] as const },
      opacity: { duration: 0.2, delay: 0.1 },
    },
  },
};

const chevronVariants = {
  collapsed: { rotate: 0 },
  expanded: { rotate: 180 },
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
 * - 4.1: Use DynamicIcon component
 * - 4.2: Edit UI Config button
 * - 9.1: Improved animations
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
  onEditUIConfig,
  showDragHandle = false,
  dragHandleProps,
}) => {
  // Sort options by display_order (Requirement 1.4)
  // Filter out options with null/undefined IDs to prevent React key warnings
  const sortedOptions = [...group.options]
    .filter(opt => opt.id != null)
    .sort((a, b) => a.display_order - b.display_order);

  return (
    <motion.div 
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      {/* Group Header (Requirement 1.1, 4.1) */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={onToggleExpand}
        role="button"
        aria-expanded={isExpanded}
        aria-controls={`options-${group.id}`}
      >
        {/* Drag Handle (Requirement 4.4) */}
        {showDragHandle && (
          <div
            {...dragHandleProps}
            className="flex-shrink-0 p-1 mr-2 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical size={18} />
          </div>
        )}

        {/* Group Info */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* DynamicIcon for icon rendering (Requirement 4.1) */}
          <motion.div 
            className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-gray-50 rounded-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <DynamicIcon 
              config={getIconConfig(group)} 
              size={24}
              className="text-gray-700"
            />
          </motion.div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-gray-800 truncate">
                <HighlightText text={group.name_ar} query={searchQuery} />
              </h3>
              {/* Display Style Badge (Requirement 4.1) */}
              <DisplayStyleBadge 
                displayMode={
                  typeof group.ui_config === 'string' 
                    ? parseUIConfig(group.ui_config).displayMode 
                    : group.ui_config?.displayMode || 'grid'
                } 
              />
            </div>
            <p className="text-sm text-gray-500">
              {group.options.length} خيار
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Edit UI Config Button (Requirement 4.2) */}
          {onEditUIConfig && (
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                onEditUIConfig();
              }}
              className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
              title="إعدادات العرض"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Settings2 size={18} />
            </motion.button>
          )}

          {/* Edit Button */}
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="تعديل المجموعة"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Edit2 size={18} />
          </motion.button>

          {/* Delete Button */}
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="حذف المجموعة"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Trash2 size={18} />
          </motion.button>

          {/* Expand/Collapse Arrow (Requirement 1.2) with improved animation */}
          <motion.div
            variants={chevronVariants}
            animate={isExpanded ? 'expanded' : 'collapsed'}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="text-gray-400 p-1"
          >
            <ChevronDown size={20} />
          </motion.div>
        </div>
      </div>

      {/* Options List - Expanded (Requirement 1.2, 1.3) with improved animation */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            id={`options-${group.id}`}
            variants={expandVariants}
            initial="collapsed"
            animate="expanded"
            exit="collapsed"
            className="border-t border-gray-100 bg-gray-50 overflow-hidden"
          >
            {sortedOptions.length === 0 ? (
              /* Empty Options State */
              <motion.div 
                className="p-6 text-center text-gray-500"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <p className="mb-2">لا توجد خيارات في هذه المجموعة</p>
                <button
                  onClick={onAddOption}
                  className="text-pink-500 hover:text-pink-600 font-medium inline-flex items-center gap-1"
                >
                  <Plus size={16} />
                  <span>إضافة أول خيار</span>
                </button>
              </motion.div>
            ) : (
              /* Options List */
              <div className="divide-y divide-gray-100">
                {sortedOptions.map((option, index) => (
                  <motion.div
                    key={option.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <OptionItem
                      option={option}
                      searchQuery={searchQuery}
                      onEdit={() => onEditOption(option)}
                      onDelete={() => onDeleteOption(option)}
                      onToggleAvailability={(available) =>
                        onToggleOptionAvailability(option.id, available)
                      }
                    />
                  </motion.div>
                ))}
              </div>
            )}

            {/* Add Option Button */}
            <motion.div 
              className="p-3 pr-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <button
                onClick={onAddOption}
                className="w-full py-2.5 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-pink-400 hover:text-pink-500 hover:bg-pink-50/50 transition-all flex items-center justify-center gap-2"
              >
                <Plus size={18} />
                <span>إضافة خيار</span>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default OptionGroupCard;
