// src/components/admin/customization/TreeView.tsx
'use client';

import React from 'react';
import { Plus, Edit2, Box, Ruler, Sparkles, ChevronDown, ChevronRight } from 'lucide-react';
import type { Container, Size, OptionGroup, ActiveSection, ModalType } from './types';

interface TreeViewProps {
  containers: Container[];
  sizes: Size[];
  optionGroups: OptionGroup[];
  activeSection: ActiveSection;
  setActiveSection: (section: ActiveSection) => void;
  expandedGroups: Set<string>;
  toggleGroup: (groupId: string) => void;
  setEditingItem: (item: any) => void;
  setModalType: (type: ModalType) => void;
  setSelectedGroupId: (id: string) => void;
}

const TreeView: React.FC<TreeViewProps> = ({
  containers,
  sizes,
  optionGroups,
  activeSection,
  setActiveSection,
  expandedGroups,
  toggleGroup,
  setEditingItem,
  setModalType,
  setSelectedGroupId
}) => {
  return (
    <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 rounded-2xl p-3 sm:p-6 border-2 border-purple-200 overflow-x-auto">
      <h2 className="text-base sm:text-lg font-bold text-purple-800 mb-4 sm:mb-6 text-center">
        🌳 هيكل نظام التخصيص
      </h2>
      
      <div className="flex flex-col items-center min-w-[600px] sm:min-w-0">
        {/* Root */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-bold shadow-lg text-sm sm:text-base">
          🍦 المنتج
        </div>
        
        {/* Connector */}
        <div className="w-0.5 h-6 sm:h-8 bg-purple-300" />
        
        {/* Three Branches */}
        <div className="flex flex-row items-start gap-2 sm:gap-4 relative w-full justify-center">
          {/* Horizontal line */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[85%] h-0.5 bg-purple-300 hidden sm:block" />
          
          {/* Containers Branch */}
          <ContainersBranch
            containers={containers}
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            setEditingItem={setEditingItem}
            setModalType={setModalType}
          />

          {/* Sizes Branch */}
          <SizesBranch
            sizes={sizes}
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            setEditingItem={setEditingItem}
            setModalType={setModalType}
          />

          {/* Options Branch */}
          <OptionsBranch
            optionGroups={optionGroups}
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            expandedGroups={expandedGroups}
            toggleGroup={toggleGroup}
            setEditingItem={setEditingItem}
            setModalType={setModalType}
            setSelectedGroupId={setSelectedGroupId}
          />
        </div>
      </div>
    </div>
  );
};

// Containers Branch Component
const ContainersBranch: React.FC<{
  containers: Container[];
  activeSection: ActiveSection;
  setActiveSection: (section: ActiveSection) => void;
  setEditingItem: (item: any) => void;
  setModalType: (type: ModalType) => void;
}> = ({ containers, activeSection, setActiveSection, setEditingItem, setModalType }) => (
  <div className="flex flex-col items-center pt-2 sm:pt-4 flex-1 min-w-[150px] sm:min-w-[200px] max-w-[220px]">
    <div className="w-0.5 h-3 sm:h-4 bg-purple-300 hidden sm:block" />
    <button
      onClick={() => setActiveSection(activeSection === 'containers' ? 'overview' : 'containers')}
      className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded-xl font-semibold transition-all flex items-center gap-1 sm:gap-2 text-xs sm:text-sm whitespace-nowrap ${
        activeSection === 'containers' 
          ? 'bg-green-500 text-white shadow-lg scale-105' 
          : 'bg-white border-2 border-green-300 text-green-700 hover:bg-green-50'
      }`}
    >
      <Box size={16} />
      الحاويات ({containers.length})
    </button>
    
    {activeSection === 'containers' && (
      <div className="mt-2 sm:mt-3 space-y-1.5 sm:space-y-2 w-full">
        {containers.map(c => (
          <div key={c.id} className={`flex items-center justify-between px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm ${
            c.available === 1 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'
          }`}>
            <span className="truncate">{c.name_ar}</span>
            <button 
              onClick={() => { setEditingItem(c); setModalType('container'); }} 
              className="p-1 hover:bg-green-200 rounded flex-shrink-0"
            >
              <Edit2 size={12} />
            </button>
          </div>
        ))}
        <button
          onClick={() => { setEditingItem(null); setModalType('container'); }}
          className="w-full flex items-center justify-center gap-1 px-2 sm:px-3 py-1.5 sm:py-2 bg-green-500 text-white rounded-lg text-xs sm:text-sm hover:bg-green-600"
        >
          <Plus size={12} /> إضافة حاوية
        </button>
      </div>
    )}
  </div>
);

// Sizes Branch Component
const SizesBranch: React.FC<{
  sizes: Size[];
  activeSection: ActiveSection;
  setActiveSection: (section: ActiveSection) => void;
  setEditingItem: (item: any) => void;
  setModalType: (type: ModalType) => void;
}> = ({ sizes, activeSection, setActiveSection, setEditingItem, setModalType }) => (
  <div className="flex flex-col items-center pt-2 sm:pt-4 flex-1 min-w-[150px] sm:min-w-[200px] max-w-[220px]">
    <div className="w-0.5 h-3 sm:h-4 bg-purple-300 hidden sm:block" />
    <button
      onClick={() => setActiveSection(activeSection === 'sizes' ? 'overview' : 'sizes')}
      className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded-xl font-semibold transition-all flex items-center gap-1 sm:gap-2 text-xs sm:text-sm whitespace-nowrap ${
        activeSection === 'sizes' 
          ? 'bg-blue-500 text-white shadow-lg scale-105' 
          : 'bg-white border-2 border-blue-300 text-blue-700 hover:bg-blue-50'
      }`}
    >
      <Ruler size={16} />
      المقاسات ({sizes.length})
    </button>
    
    {activeSection === 'sizes' && (
      <div className="mt-2 sm:mt-3 space-y-1.5 sm:space-y-2 w-full">
        {sizes.map(s => (
          <div key={s.id} className="flex items-center justify-between px-2 sm:px-3 py-1.5 sm:py-2 bg-blue-100 text-blue-800 rounded-lg text-xs sm:text-sm">
            <span className="truncate">{s.name_ar} <span className="text-[10px] sm:text-xs">(×{s.nutrition_multiplier})</span></span>
            <button 
              onClick={() => { setEditingItem(s); setModalType('size'); }} 
              className="p-1 hover:bg-blue-200 rounded flex-shrink-0"
            >
              <Edit2 size={12} />
            </button>
          </div>
        ))}
        <button
          onClick={() => { setEditingItem(null); setModalType('size'); }}
          className="w-full flex items-center justify-center gap-1 px-2 sm:px-3 py-1.5 sm:py-2 bg-blue-500 text-white rounded-lg text-xs sm:text-sm hover:bg-blue-600"
        >
          <Plus size={12} /> إضافة مقاس
        </button>
      </div>
    )}
  </div>
);

// Options Branch Component
const OptionsBranch: React.FC<{
  optionGroups: OptionGroup[];
  activeSection: ActiveSection;
  setActiveSection: (section: ActiveSection) => void;
  expandedGroups: Set<string>;
  toggleGroup: (groupId: string) => void;
  setEditingItem: (item: any) => void;
  setModalType: (type: ModalType) => void;
  setSelectedGroupId: (id: string) => void;
}> = ({ 
  optionGroups, activeSection, setActiveSection, expandedGroups, 
  toggleGroup, setEditingItem, setModalType, setSelectedGroupId 
}) => (
  <div className="flex flex-col items-center pt-2 sm:pt-4 flex-1 min-w-[180px] sm:min-w-[280px] max-w-[300px]">
    <div className="w-0.5 h-3 sm:h-4 bg-purple-300 hidden sm:block" />
    <button
      onClick={() => setActiveSection(activeSection === 'groups' ? 'overview' : 'groups')}
      className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded-xl font-semibold transition-all flex items-center gap-1 sm:gap-2 text-xs sm:text-sm whitespace-nowrap ${
        activeSection === 'groups' 
          ? 'bg-amber-500 text-white shadow-lg scale-105' 
          : 'bg-white border-2 border-amber-300 text-amber-700 hover:bg-amber-50'
      }`}
    >
      <Sparkles size={16} />
      الخيارات ({optionGroups.length})
    </button>
    
    {activeSection === 'groups' && (
      <div className="mt-2 sm:mt-3 space-y-1.5 sm:space-y-2 w-full">
        {optionGroups.map(group => (
          <div key={group.id} className="bg-amber-50 rounded-lg border border-amber-200 overflow-hidden">
            <div 
              className="flex items-center justify-between px-2 sm:px-3 py-1.5 sm:py-2 cursor-pointer hover:bg-amber-100"
              onClick={() => toggleGroup(group.id)}
            >
              <div className="flex items-center gap-1 sm:gap-2 min-w-0">
                {expandedGroups.has(group.id) ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                <span className="text-sm sm:text-lg">{group.icon}</span>
                <span className="font-medium text-amber-800 text-xs sm:text-sm truncate">{group.name_ar}</span>
                <span className="text-[10px] sm:text-xs bg-amber-200 text-amber-700 px-1.5 sm:px-2 py-0.5 rounded-full flex-shrink-0">
                  {group.options?.length || 0}
                </span>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); setEditingItem(group); setModalType('group'); }} 
                className="p-1 hover:bg-amber-200 rounded flex-shrink-0"
              >
                <Edit2 size={12} />
              </button>
            </div>
            
            {expandedGroups.has(group.id) && (
              <div className="px-2 sm:px-3 pb-2 space-y-1">
                {group.options?.map(opt => (
                  <div key={opt.id} className={`flex items-center justify-between px-1.5 sm:px-2 py-1 sm:py-1.5 rounded text-[10px] sm:text-xs ${
                    opt.available === 1 ? 'bg-white' : 'bg-gray-100 text-gray-400'
                  }`}>
                    <span className="truncate">{opt.name_ar}</span>
                    <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                      <span className="text-gray-500">{opt.base_price} ج</span>
                      <button 
                        onClick={() => { setEditingItem(opt); setSelectedGroupId(group.id); setModalType('option'); }}
                        className="p-0.5 hover:bg-gray-200 rounded"
                      >
                        <Edit2 size={10} />
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => { setEditingItem(null); setSelectedGroupId(group.id); setModalType('option'); }}
                  className="w-full flex items-center justify-center gap-1 px-2 py-1 sm:py-1.5 bg-amber-500 text-white rounded text-[10px] sm:text-xs hover:bg-amber-600"
                >
                  <Plus size={10} /> إضافة خيار
                </button>
              </div>
            )}
          </div>
        ))}
        <button
          onClick={() => { setEditingItem(null); setModalType('group'); }}
          className="w-full flex items-center justify-center gap-1 px-2 sm:px-3 py-1.5 sm:py-2 bg-amber-500 text-white rounded-lg text-xs sm:text-sm hover:bg-amber-600"
        >
          <Plus size={12} /> إضافة مجموعة
        </button>
      </div>
    )}
  </div>
);

export default TreeView;
