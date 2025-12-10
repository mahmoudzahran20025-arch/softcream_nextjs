/**
 * Option Groups Management Types
 * Requirements: 1.1, 2.2, 5.2, 3.1, 3.4
 * 
 * ⚠️ This file re-exports from @/types/admin for backward compatibility
 * New code should import directly from @/types/admin
 */

// ===========================
// Re-export from unified types
// ===========================

export type {
  Option,
  OptionGroup,
  OptionGroupFormData,
  OptionFormData,
  OptionsPageState,
  DeleteTarget,
  ApiResponse,
  OptionGroupsResponse,
} from '@/types/admin';

export {
  ICON_OPTIONS,
  INITIAL_OPTION_GROUP_FORM_DATA as INITIAL_GROUP_FORM_DATA,
  INITIAL_OPTION_FORM_DATA,
} from '@/types/admin';

// ===========================
// Component Props Types (kept here for component-specific props)
// ===========================

import type { Option, OptionGroup, OptionGroupFormData, OptionFormData, DeleteTarget } from '@/types/admin';

export interface OptionGroupCardProps {
  group: OptionGroup;
  isExpanded: boolean;
  searchQuery?: string;
  onToggleExpand: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onAddOption: () => void;
  onEditOption: (option: Option) => void;
  onDeleteOption: (option: Option) => void;
  onToggleOptionAvailability: (optionId: string, available: boolean) => Promise<void>;
  /** Handler for editing UI config directly - Requirement 4.2 */
  onEditUIConfig?: () => void;
  /** Whether drag handle should be shown for reordering - Requirement 4.4 */
  showDragHandle?: boolean;
  /** Drag handle props from dnd-kit */
  dragHandleProps?: Record<string, unknown>;
}

export interface OptionItemProps {
  option: Option;
  searchQuery?: string;
  onEdit: () => void;
  onDelete: () => void;
  onToggleAvailability: (available: boolean) => Promise<void>;
}

export interface GroupFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingGroup: OptionGroup | null;
  onSubmit: (data: OptionGroupFormData) => Promise<void>;
}

export interface OptionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  editingOption: Option | null;
  onSubmit: (data: OptionFormData) => Promise<void>;
  /** Group's nutrition display config for preview - Requirement 3.1 */
  groupNutritionConfig?: {
    show: boolean;
    format: 'compact' | 'detailed' | 'badges';
    fields: ('calories' | 'protein' | 'carbs' | 'fat')[];
  };
}

export interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  target: DeleteTarget | null;
  onConfirm: () => Promise<void>;
  isLoading?: boolean;
}
