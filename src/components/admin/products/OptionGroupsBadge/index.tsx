/**
 * OptionGroupsBadge Component
 * 
 * Displays a badge showing the number of assigned option groups for a product.
 * Shows a tooltip with group names on hover.
 * 
 * @module admin/products/OptionGroupsBadge
 */

'use client';

import React, { useState } from 'react';
import { Layers } from 'lucide-react';
import { calculateBadgeCount, type AssignedGroupInfo } from './utils';

// Re-export types and functions for backward compatibility
export { calculateBadgeCount, type AssignedGroupInfo } from './utils';

export interface OptionGroupsBadgeProps {
  productId: string;
  assignedGroups: AssignedGroupInfo[];
}

/**
 * OptionGroupsBadge Component
 * 
 * Displays a count badge showing how many option groups are assigned to a product.
 * On hover, shows a tooltip with the names of all assigned groups.
 */
const OptionGroupsBadge: React.FC<OptionGroupsBadgeProps> = ({
  productId,
  assignedGroups,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  
  const count = calculateBadgeCount(assignedGroups);
  
  // Don't render if no groups assigned
  if (count === 0) {
    return null;
  }

  return (
    <div 
      className="relative inline-flex"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Badge */}
      <span 
        className="inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 text-xs font-medium rounded-full border border-purple-200"
        data-testid={`option-groups-badge-${productId}`}
        data-count={count}
      >
        <Layers size={12} />
        <span>{count}</span>
      </span>

      {/* Tooltip */}
      {showTooltip && assignedGroups.length > 0 && (
        <div 
          className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50"
          data-testid={`option-groups-tooltip-${productId}`}
        >
          <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 shadow-lg min-w-max">
            <div className="font-semibold mb-1 text-gray-300">مجموعات الخيارات:</div>
            <ul className="space-y-1">
              {assignedGroups.map((group) => (
                <li key={group.groupId} className="flex items-center gap-2">
                  {group.groupIcon && <span>{group.groupIcon}</span>}
                  <span>{group.groupName}</span>
                  {group.isRequired && (
                    <span className="text-yellow-400 text-[10px]">(مطلوب)</span>
                  )}
                </li>
              ))}
            </ul>
            {/* Tooltip arrow */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
          </div>
        </div>
      )}
    </div>
  );
};

export default OptionGroupsBadge;
