// src/components/admin/customization/StatsCards.tsx
'use client';

import React from 'react';
import { Box, Ruler, Layers, Sparkles } from 'lucide-react';

interface StatsCardsProps {
  containersCount: number;
  availableContainers: number;
  sizesCount: number;
  groupsCount: number;
  totalOptions: number;
}

const StatsCards: React.FC<StatsCardsProps> = ({
  containersCount,
  availableContainers,
  sizesCount,
  groupsCount,
  totalOptions
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
      <div className="bg-white rounded-xl p-3 sm:p-4 border border-gray-200 shadow-sm">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <Box className="text-green-600" size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-xl sm:text-2xl font-bold text-gray-800">{containersCount}</p>
            <p className="text-[10px] sm:text-xs text-gray-500 truncate">حاوية ({availableContainers} متاح)</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl p-3 sm:p-4 border border-gray-200 shadow-sm">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Ruler className="text-blue-600" size={18} />
          </div>
          <div>
            <p className="text-xl sm:text-2xl font-bold text-gray-800">{sizesCount}</p>
            <p className="text-[10px] sm:text-xs text-gray-500">مقاس</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl p-3 sm:p-4 border border-gray-200 shadow-sm">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-amber-100 rounded-lg flex items-center justify-center">
            <Layers className="text-amber-600" size={18} />
          </div>
          <div>
            <p className="text-xl sm:text-2xl font-bold text-gray-800">{groupsCount}</p>
            <p className="text-[10px] sm:text-xs text-gray-500">مجموعة</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl p-3 sm:p-4 border border-gray-200 shadow-sm">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <Sparkles className="text-purple-600" size={18} />
          </div>
          <div>
            <p className="text-xl sm:text-2xl font-bold text-gray-800">{totalOptions}</p>
            <p className="text-[10px] sm:text-xs text-gray-500">خيار</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsCards;
