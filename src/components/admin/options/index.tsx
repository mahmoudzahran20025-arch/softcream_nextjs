/**
 * Options Page - Admin Option Groups Management
 * Requirements: 1.1, 1.5, 4.4
 * 
 * Main page component for managing option groups and their options.
 * Displays all option groups with search functionality, loading states,
 * empty state handling, and drag & drop reordering.
 */

'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Plus, Search, Package, Layers, CheckCircle, XCircle } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { getOptionGroups, toggleOptionAvailability, createOptionGroup, updateOptionGroup, deleteOptionGroup, deleteOption, createOption, updateOption, reorderOptionGroups } from '@/lib/admin/options.api';
import type { OptionGroup, Option, OptionsPageState, OptionGroupFormData, OptionFormData } from './types';
import OptionGroupCard from './OptionGroupCard';
import GroupFormModal from './GroupFormModal';
import OptionFormModal from './OptionFormModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import OptionGroupSkeleton from './OptionGroupSkeleton';
import UIConfigModal from './UIConfigModal';

// Simplified: Only groups view mode (Requirements: 6.2 - archive OptionsTable and OptionCards)

/**
 * SortableOptionGroupCard - Wrapper for OptionGroupCard with drag & drop
 * Requirement 4.4: Drag & Drop reordering
 */
interface SortableOptionGroupCardProps {
  group: OptionGroup;
  isExpanded: boolean;
  searchQuery: string;
  isDragDisabled: boolean;
  onToggleExpand: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onAddOption: () => void;
  onEditOption: (option: Option) => void;
  onDeleteOption: (option: Option) => void;
  onToggleOptionAvailability: (optionId: string, available: boolean) => Promise<void>;
  onEditUIConfig: () => void;
}

const SortableOptionGroupCard: React.FC<SortableOptionGroupCardProps> = ({
  group,
  isDragDisabled,
  ...props
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: group.id,
    disabled: isDragDisabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 'auto',
  };

  return (
    <div ref={setNodeRef} style={style}>
      <OptionGroupCard
        group={group}
        {...props}
        showDragHandle={!isDragDisabled}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
};

/**
 * OptionsPage Component
 * 
 * Main page for managing option groups and options.
 * Implements Requirements 1.1 (display option groups), 1.5 (empty state), and 4.4 (drag & drop)
 */
const OptionsPage: React.FC = () => {
  // ===========================
  // State Management
  // ===========================
  const [state, setState] = useState<OptionsPageState>({
    optionGroups: [],
    isLoading: true,
    searchQuery: '',
    expandedGroups: new Set<string>(),
    showGroupModal: false,
    showOptionModal: false,
    showDeleteModal: false,
    editingGroup: null,
    editingOption: null,
    selectedGroupId: null,
    deleteTarget: null,
  });

  // Separate state for UI Config modal
  const [uiConfigModal, setUIConfigModal] = useState<{
    isOpen: boolean;
    group: OptionGroup | null;
  }>({ isOpen: false, group: null });

  // Track if reordering is in progress
  const [isReordering, setIsReordering] = useState(false);

  // ===========================
  // Drag & Drop Sensors (Requirement 4.4)
  // ===========================
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Minimum drag distance before activation
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // ===========================
  // Data Fetching
  // ===========================
  const fetchOptionGroups = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const response = await getOptionGroups();
      if (response.success && response.data) {
        // Sort by display_order (Requirement 1.4)
        const sortedGroups = [...response.data].sort(
          (a, b) => a.display_order - b.display_order
        );
        setState(prev => ({
          ...prev,
          optionGroups: sortedGroups,
          isLoading: false,
        }));
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error('Failed to fetch option groups:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  useEffect(() => {
    fetchOptionGroups();
  }, [fetchOptionGroups]);

  // ===========================
  // Stats Calculation (Requirement 3.4)
  // ===========================
  const stats = useMemo(() => {
    const totalGroups = state.optionGroups.length;
    const totalOptions = state.optionGroups.reduce(
      (sum, group) => sum + (group.options || []).length,
      0
    );
    const availableOptions = state.optionGroups.reduce(
      (sum, group) =>
        sum + (group.options || []).filter((opt) => opt.available === 1).length,
      0
    );
    const unavailableOptions = totalOptions - availableOptions;

    return {
      totalGroups,
      totalOptions,
      availableOptions,
      unavailableOptions,
    };
  }, [state.optionGroups]);

  // ===========================
  // Search/Filter Logic (Requirement 9.1, 9.2)
  // ===========================
  const filteredGroups = useMemo(() => {
    if (!state.searchQuery.trim()) {
      return state.optionGroups;
    }

    const query = state.searchQuery.toLowerCase().trim();

    return state.optionGroups
      .map(group => {
        // Check if group name matches
        const groupMatches =
          group.name_ar.toLowerCase().includes(query) ||
          group.name_en.toLowerCase().includes(query);

        // Filter options that match (with null check)
        const groupOptions = group.options || [];
        const matchingOptions = groupOptions.filter(
          option =>
            option.name_ar.toLowerCase().includes(query) ||
            option.name_en.toLowerCase().includes(query)
        );

        // Include group if group name matches or has matching options
        if (groupMatches || matchingOptions.length > 0) {
          return {
            ...group,
            // If group name matches, show all options; otherwise show only matching
            options: groupMatches ? groupOptions : matchingOptions,
          };
        }
        return null;
      })
      .filter((group): group is OptionGroup => group !== null);
  }, [state.optionGroups, state.searchQuery]);

  // ===========================
  // Event Handlers
  // ===========================
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState(prev => ({ ...prev, searchQuery: e.target.value }));
  };

  const handleToggleExpand = (groupId: string) => {
    setState(prev => {
      const newExpanded = new Set(prev.expandedGroups);
      if (newExpanded.has(groupId)) {
        newExpanded.delete(groupId);
      } else {
        newExpanded.add(groupId);
      }
      return { ...prev, expandedGroups: newExpanded };
    });
  };

  const handleAddGroup = () => {
    setState(prev => ({
      ...prev,
      showGroupModal: true,
      editingGroup: null,
    }));
  };

  const handleEditGroup = (group: OptionGroup) => {
    setState(prev => ({
      ...prev,
      showGroupModal: true,
      editingGroup: group,
    }));
  };

  // Handler for opening UI Config modal (separate from edit group)
  const handleEditUIConfig = (group: OptionGroup) => {
    setUIConfigModal({ isOpen: true, group });
  };

  const handleCloseUIConfigModal = () => {
    setUIConfigModal({ isOpen: false, group: null });
  };

  const handleDeleteGroup = (group: OptionGroup) => {
    // Guard against null/undefined IDs
    if (!group.id) {
      console.error('Cannot delete group with null/undefined ID');
      return;
    }
    setState(prev => ({
      ...prev,
      showDeleteModal: true,
      deleteTarget: {
        type: 'group',
        id: group.id,
        name: group.name_ar,
        optionsCount: (group.options || []).length,
      },
    }));
  };

  const handleAddOption = (groupId: string) => {
    setState(prev => ({
      ...prev,
      showOptionModal: true,
      selectedGroupId: groupId,
      editingOption: null,
    }));
  };

  const handleEditOption = (option: Option) => {
    setState(prev => ({
      ...prev,
      showOptionModal: true,
      selectedGroupId: option.group_id,
      editingOption: option,
    }));
  };

  const handleDeleteOption = (option: Option) => {
    // Guard against null/undefined IDs
    if (!option.id) {
      console.error('Cannot delete option with null/undefined ID');
      return;
    }
    setState(prev => ({
      ...prev,
      showDeleteModal: true,
      deleteTarget: {
        type: 'option',
        id: option.id,
        name: option.name_ar,
        groupId: option.group_id,
      },
    }));
  };

  // ===========================
  // Render Helpers
  // ===========================

  /**
   * Loading State Component with Skeleton
   * Requirement 1.1: Show loading during API calls
   */
  const renderLoading = () => (
    <div className="animate-fadeIn">
      <OptionGroupSkeleton count={4} showExpanded={true} />
    </div>
  );

  /**
   * Empty State Component (Requirement 1.5)
   */
  const renderEmptyState = () => (
    <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100 animate-fadeIn">
      <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-xl font-bold text-gray-700 mb-2">
        لا توجد مجموعات خيارات
      </h3>
      <p className="text-gray-500 mb-6">
        ابدأ بإنشاء أول مجموعة خيارات لإضافة نكهات، إضافات، أو صوصات
      </p>
      <button
        onClick={handleAddGroup}
        className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all inline-flex items-center gap-2"
      >
        <Plus size={20} />
        <span>إنشاء أول مجموعة</span>
      </button>
    </div>
  );

  /**
   * No Search Results Component
   */
  const renderNoResults = () => (
    <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100 animate-fadeIn">
      <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-xl font-bold text-gray-700 mb-2">
        لا توجد نتائج
      </h3>
      <p className="text-gray-500">
        لم يتم العثور على مجموعات أو خيارات تطابق &quot;{state.searchQuery}&quot;
      </p>
    </div>
  );

  /**
   * Handle group form submission (create/edit)
   * Requirements: 2.4, 3.3
   */
  const handleGroupSubmit = async (data: OptionGroupFormData) => {
    try {
      if (state.editingGroup) {
        // Edit mode - Requirement 3.3
        const response = await updateOptionGroup(state.editingGroup.id, data);
        if (response.success) {
          await fetchOptionGroups();
        } else {
          throw new Error(response.error || 'فشل في تحديث المجموعة');
        }
      } else {
        // Create mode - Requirement 2.4
        const response = await createOptionGroup(data);
        if (response.success) {
          await fetchOptionGroups();
        } else {
          throw new Error(response.error || 'فشل في إنشاء المجموعة');
        }
      }
    } catch (error) {
      console.error('Failed to submit group:', error);
      throw error;
    }
  };

  const handleCloseGroupModal = () => {
    setState(prev => ({
      ...prev,
      showGroupModal: false,
      editingGroup: null,
    }));
  };

  const handleCloseDeleteModal = () => {
    setState(prev => ({
      ...prev,
      showDeleteModal: false,
      deleteTarget: null,
    }));
  };

  const handleCloseOptionModal = () => {
    setState(prev => ({
      ...prev,
      showOptionModal: false,
      editingOption: null,
      selectedGroupId: null,
    }));
  };

  /**
   * Handle option form submission (create/edit)
   * Requirements: 5.5, 6.3
   */
  const handleOptionSubmit = async (data: OptionFormData) => {
    try {
      if (state.editingOption) {
        // Edit mode - Requirement 6.3
        const response = await updateOption(state.editingOption.id, data);
        if (response.success) {
          await fetchOptionGroups();
        } else {
          throw new Error(response.error || 'فشل في تحديث الخيار');
        }
      } else {
        // Create mode - Requirement 5.5
        const response = await createOption(data);
        if (response.success) {
          await fetchOptionGroups();
        } else {
          throw new Error(response.error || 'فشل في إنشاء الخيار');
        }
      }
    } catch (error) {
      console.error('Failed to submit option:', error);
      throw error;
    }
  };

  /**
   * Handle delete confirmation
   * Requirements: 4.4, 7.2, 7.3
   */
  const handleConfirmDelete = async () => {
    if (!state.deleteTarget) return;

    try {
      if (state.deleteTarget.type === 'group') {
        // Delete option group - Requirement 4.4
        const response = await deleteOptionGroup(state.deleteTarget.id);
        if (response.success) {
          // Update local state to remove the group
          setState(prev => ({
            ...prev,
            optionGroups: prev.optionGroups.filter(g => g.id !== state.deleteTarget!.id),
          }));
        } else {
          throw new Error(response.error || 'فشل في حذف المجموعة');
        }
      } else {
        // Delete option - Requirements 7.2, 7.3
        const response = await deleteOption(state.deleteTarget.id);
        if (response.success) {
          const deletedOptionId = state.deleteTarget.id;
          const parentGroupId = state.deleteTarget.groupId;

          // Update local state: remove option and update parent group's options count
          // Requirement 7.3: THE system SHALL update the options count for the parent group
          setState(prev => ({
            ...prev,
            optionGroups: prev.optionGroups.map(group => {
              if (group.id === parentGroupId) {
                // Remove the deleted option from the group's options array
                // This automatically updates the options count (options.length)
                return {
                  ...group,
                  options: (group.options || []).filter(opt => opt.id !== deletedOptionId),
                };
              }
              return group;
            }),
          }));
        } else {
          throw new Error(response.error || 'فشل في حذف الخيار');
        }
      }
    } catch (error) {
      console.error('Failed to delete:', error);
      throw error;
    }
  };

  /**
   * Handle drag end for reordering option groups
   * Requirement 4.4: Update display_order when dragging
   */
  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    // Get current order
    const oldIndex = state.optionGroups.findIndex(g => g.id === active.id);
    const newIndex = state.optionGroups.findIndex(g => g.id === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    // Optimistic update - reorder locally first
    const newGroups = arrayMove(state.optionGroups, oldIndex, newIndex);

    // Update display_order values
    const updatedGroups = newGroups.map((group, index) => ({
      ...group,
      display_order: index,
    }));

    setState(prev => ({
      ...prev,
      optionGroups: updatedGroups,
    }));

    // Persist to backend
    setIsReordering(true);
    try {
      const orderedIds = updatedGroups.map(g => g.id);
      const response = await reorderOptionGroups(orderedIds);

      if (!response.success) {
        // Rollback on failure
        console.error('Failed to reorder groups:', response.error);
        await fetchOptionGroups();
      }
    } catch (error) {
      console.error('Failed to reorder groups:', error);
      // Rollback on error
      await fetchOptionGroups();
    } finally {
      setIsReordering(false);
    }
  }, [state.optionGroups, fetchOptionGroups]);

  /**
   * Handle availability toggle with optimistic UI update
   * Requirements: 8.1 (immediate update), 8.3 (error rollback)
   * 
   * Implements optimistic UI pattern:
   * 1. Update UI immediately for responsive feel
   * 2. Make API call in background
   * 3. Rollback UI if API call fails and throw error for component to display
   */
  const handleToggleOptionAvailability = async (optionId: string, available: boolean) => {
    // Optimistic update - immediately reflect change in UI (Requirement 8.1)
    setState(prev => ({
      ...prev,
      optionGroups: prev.optionGroups.map(group => ({
        ...group,
        options: (group.options || []).map(opt =>
          opt.id === optionId ? { ...opt, available: available ? 1 : 0 } : opt
        ),
      })),
    }));

    try {
      const response = await toggleOptionAvailability(optionId, available);
      if (!response.success) {
        // Rollback on failure (Requirement 8.3)
        setState(prev => ({
          ...prev,
          optionGroups: prev.optionGroups.map(group => ({
            ...group,
            options: (group.options || []).map(opt =>
              opt.id === optionId ? { ...opt, available: available ? 0 : 1 } : opt
            ),
          })),
        }));
        // Throw error so OptionItem can display error message (Requirement 8.3)
        throw new Error(response.error || 'فشل تحديث حالة التوفر');
      }
    } catch (error) {
      // Rollback on error (Requirement 8.3)
      setState(prev => ({
        ...prev,
        optionGroups: prev.optionGroups.map(group => ({
          ...group,
          options: (group.options || []).map(opt =>
            opt.id === optionId ? { ...opt, available: available ? 0 : 1 } : opt
          ),
        })),
      }));
      // Re-throw so OptionItem can catch and display error message
      throw error;
    }
  };

  /**
   * Check if drag & drop should be disabled
   * Disable when searching to avoid confusion
   */
  const isDragDisabled = state.searchQuery.trim().length > 0 || isReordering;

  /**
   * Option Groups List Component (Requirement 1.1, 4.4)
   * Includes smooth transitions for list items and drag & drop reordering
   */
  const renderOptionGroups = () => {
    const validGroups = filteredGroups.filter(group => group.id != null);
    const groupIds = validGroups.map(g => g.id);

    return (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={groupIds} strategy={verticalListSortingStrategy}>
          <div className="space-y-4">
            {/* Reordering indicator */}
            {isReordering && (
              <div className="text-center py-2 text-sm text-gray-500 animate-pulse">
                جاري حفظ الترتيب...
              </div>
            )}

            {/* Drag hint when not searching */}
            {!isDragDisabled && validGroups.length > 1 && (
              <div className="text-center py-2 text-xs text-gray-400">
                💡 اسحب المجموعات لإعادة ترتيبها
              </div>
            )}

            {validGroups.map((group, index) => (
              <div
                key={group.id}
                className="animate-fadeIn"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <SortableOptionGroupCard
                  group={group}
                  isExpanded={state.expandedGroups.has(group.id)}
                  searchQuery={state.searchQuery}
                  isDragDisabled={isDragDisabled}
                  onToggleExpand={() => handleToggleExpand(group.id)}
                  onEdit={() => handleEditGroup(group)}
                  onDelete={() => handleDeleteGroup(group)}
                  onAddOption={() => handleAddOption(group.id)}
                  onEditOption={handleEditOption}
                  onDeleteOption={handleDeleteOption}
                  onToggleOptionAvailability={handleToggleOptionAvailability}
                  onEditUIConfig={() => handleEditUIConfig(group)}
                />
              </div>
            ))}
          </div>
        </SortableContext>
      </DndContext>
    );
  };

  // ===========================
  // Main Render
  // ===========================
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">📦 إدارة مجموعات الخيارات</h2>
        <button
          onClick={handleAddGroup}
          className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg shadow-lg flex items-center gap-2 hover:shadow-xl transition-all"
        >
          <Plus size={20} />
          <span>إضافة مجموعة جديدة</span>
        </button>
      </div>

      {/* Stats Cards (Requirement 3.4) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Groups Stat */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">المجـموعات</p>
              <p className="text-3xl font-black text-gray-800">{stats.totalGroups}</p>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Layers className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Options Stat */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">إجمالي الخيارات</p>
              <p className="text-3xl font-black text-gray-800">{stats.totalOptions}</p>
            </div>
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <Package className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Available Stat */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">مـتــاح</p>
              <p className="text-3xl font-black text-gray-800">{stats.availableOptions}</p>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Unavailable Stat */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute top-0 right-0 w-20 h-20 bg-red-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">غـيـر مـتــاح</p>
              <p className="text-3xl font-black text-gray-800">{stats.unavailableOptions}</p>
            </div>
            <div className="p-3 bg-red-50 text-red-600 rounded-xl">
              <XCircle className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden p-4">
        <div className="relative">
          <Search
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="بحث في المجموعات والخيارات..."
            value={state.searchQuery}
            onChange={handleSearchChange}
            className="w-full pr-10 pl-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
        </div>
      </div>

      {/* Content - Groups View Only (Simplified per Requirements 6.2) */}
      {state.isLoading ? (
        renderLoading()
      ) : state.optionGroups.length === 0 ? (
        renderEmptyState()
      ) : filteredGroups.length === 0 ? (
        renderNoResults()
      ) : (
        renderOptionGroups()
      )}

      {/* Group Form Modal - Requirements 2.1, 3.1 */}
      <GroupFormModal
        isOpen={state.showGroupModal}
        onClose={handleCloseGroupModal}
        editingGroup={state.editingGroup}
        onSubmit={handleGroupSubmit}
      />

      {/* Option Form Modal - Requirements 5.1, 6.1, 3.1 */}
      <OptionFormModal
        isOpen={state.showOptionModal}
        onClose={handleCloseOptionModal}
        groupId={state.selectedGroupId || ''}
        editingOption={state.editingOption}
        onSubmit={handleOptionSubmit}
        groupNutritionConfig={
          state.selectedGroupId
            ? (() => {
              const group = state.optionGroups.find(g => g.id === state.selectedGroupId);
              if (group?.ui_config) {
                const config = typeof group.ui_config === 'string'
                  ? JSON.parse(group.ui_config)
                  : group.ui_config;
                return config?.nutrition;
              }
              return undefined;
            })()
            : undefined
        }
      />

      {/* Delete Confirm Modal - Requirements 4.1, 4.2, 7.1 */}
      <DeleteConfirmModal
        isOpen={state.showDeleteModal}
        onClose={handleCloseDeleteModal}
        target={state.deleteTarget}
        onConfirm={handleConfirmDelete}
      />

      {/* UI Config Modal - Separate from Group Edit */}
      <UIConfigModal
        isOpen={uiConfigModal.isOpen}
        onClose={handleCloseUIConfigModal}
        group={uiConfigModal.group}
        onSave={async (groupId, uiConfig) => {
          // Update the group with new ui_config
          // FIX: Directly call updateOptionGroup to avoid 409 Conflict (creating instead of updating)
          try {
            const response = await updateOptionGroup(groupId, { ui_config: uiConfig });
            if (response.success) {
              await fetchOptionGroups();
            } else {
              throw new Error(response.error || 'فشل في تحديث إعدادات العرض');
            }
          } catch (error) {
            console.error('Failed to update UI config:', error);
            throw error; // UIConfigModal handles the error display
          }
        }}
      />
    </div>
  );
};

export default OptionsPage;
