/**
 * OptionGroupsBadge Component
 * 
 * Displays a badge showing the number of assigned option groups for a product.
 * Shows a tooltip with group names on hover.
 * 
 * Requirements: 5.2 - Show assigned option groups count with tooltip showing group names
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
 * 
 * Requirements: 5.2 - عرض عدد المجموعات المرتبطة, tooltip يعرض أسماء المجموعات
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
      {/* Badge - Requirements: 5.2 - عرض عدد المجموعات المرتبطة */}
      <span 
        className="inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-orange-50 to-amber-50 text-orange-700 text-xs font-medium rounded-full border border-orange-200"
        data-testid={`option-groups-badge-${productId}`}
        data-count={count}
      >
        <Layers size={12} />
        <span>{count} مجموعة</span>
      </span>

      {/* Tooltip - Requirements: 5.2 - tooltip يعرض أسماء المجموعات */}
      {showTooltip && assignedGroups.length > 0 && (
        <div 
          className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50"
          data-testid={`option-groups-tooltip-${productId}`}
        >
          <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 shadow-lg min-w-max max-w-xs">
            <div className="font-semibold mb-1.5 text-gray-300 border-b border-gray-700 pb-1">
              مجموعات الخيارات ({count})
            </div>
            <ul className="space-y-1.5">
              {assignedGroups.map((group) => (
                <li key={group.groupId} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5">
                    {group.groupIcon && <span className="text-sm">{group.groupIcon}</span>}
                    <span>{group.groupName}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px]">
                    {group.optionsCount > 0 && (
                      <span className="text-gray-400">({group.optionsCount} خيار)</span>
                    )}
                    {group.isRequired && (
                      <span className="text-yellow-400 font-medium">مطلوب</span>
                    )}
                  </div>
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
