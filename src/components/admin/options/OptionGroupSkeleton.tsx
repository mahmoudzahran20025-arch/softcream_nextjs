/**
 * OptionGroupSkeleton - Loading skeleton for option groups
 * Requirements: 1.1
 * 
 * Displays animated skeleton placeholders while option groups are loading.
 * Provides visual feedback during API calls.
 */

'use client';

import React from 'react';

/**
 * Skeleton shimmer animation component
 */
const Shimmer: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div
    className={`bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded animate-shimmer ${className}`}
  />
);

/**
 * Single option group skeleton card
 */
const OptionGroupCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
    <div className="flex items-center justify-between p-4">
      {/* Icon and name skeleton */}
      <div className="flex items-center gap-3 flex-1">
        <Shimmer className="w-10 h-10 rounded-lg" />
        <div className="space-y-2 flex-1">
          <Shimmer className="h-5 w-32" />
          <Shimmer className="h-4 w-16" />
        </div>
      </div>
      
      {/* Action buttons skeleton */}
      <div className="flex items-center gap-2">
        <Shimmer className="w-8 h-8 rounded-lg" />
        <Shimmer className="w-8 h-8 rounded-lg" />
        <Shimmer className="w-5 h-5 rounded" />
      </div>
    </div>
  </div>
);

/**
 * Option item skeleton row
 */
const OptionItemSkeleton: React.FC = () => (
  <div className="flex items-center justify-between p-3 pr-12">
    {/* Image and info skeleton */}
    <div className="flex items-center gap-3 flex-1">
      <Shimmer className="w-10 h-10 rounded-lg" />
      <div className="space-y-2 flex-1">
        <Shimmer className="h-4 w-24" />
        <Shimmer className="h-3 w-12" />
      </div>
    </div>
    
    {/* Actions skeleton */}
    <div className="flex items-center gap-2">
      <Shimmer className="w-12 h-6 rounded-full" />
      <Shimmer className="w-8 h-8 rounded-lg" />
      <Shimmer className="w-8 h-8 rounded-lg" />
    </div>
  </div>
);

/**
 * Expanded option group skeleton with options
 */
const ExpandedGroupSkeleton: React.FC<{ optionsCount?: number }> = ({ 
  optionsCount = 3 
}) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
    <div className="flex items-center justify-between p-4">
      {/* Icon and name skeleton */}
      <div className="flex items-center gap-3 flex-1">
        <Shimmer className="w-10 h-10 rounded-lg" />
        <div className="space-y-2 flex-1">
          <Shimmer className="h-5 w-32" />
          <Shimmer className="h-4 w-16" />
        </div>
      </div>
      
      {/* Action buttons skeleton */}
      <div className="flex items-center gap-2">
        <Shimmer className="w-8 h-8 rounded-lg" />
        <Shimmer className="w-8 h-8 rounded-lg" />
        <Shimmer className="w-5 h-5 rounded" />
      </div>
    </div>
    
    {/* Options list skeleton */}
    <div className="border-t border-gray-100 bg-gray-50">
      <div className="divide-y divide-gray-100">
        {Array.from({ length: optionsCount }).map((_, index) => (
          <OptionItemSkeleton key={index} />
        ))}
      </div>
    </div>
  </div>
);

interface OptionGroupSkeletonProps {
  /** Number of skeleton cards to show */
  count?: number;
  /** Whether to show expanded state for first card */
  showExpanded?: boolean;
}

/**
 * OptionGroupSkeleton Component
 * 
 * Displays multiple skeleton cards for loading state.
 * Shows smooth animated placeholders while data is being fetched.
 */
const OptionGroupSkeleton: React.FC<OptionGroupSkeletonProps> = ({
  count = 3,
  showExpanded = true,
}) => {
  return (
    <div className="space-y-4">
      {/* First card expanded to show options skeleton */}
      {showExpanded && <ExpandedGroupSkeleton optionsCount={3} />}
      
      {/* Remaining collapsed cards */}
      {Array.from({ length: showExpanded ? count - 1 : count }).map((_, index) => (
        <OptionGroupCardSkeleton key={index} />
      ))}
    </div>
  );
};

export default OptionGroupSkeleton;
export { OptionGroupCardSkeleton, OptionItemSkeleton, ExpandedGroupSkeleton };
