/**
 * Option Groups Management Types
 * Requirements: 1.1, 2.2, 5.2
 */

// ===========================
// Core Data Models
// ===========================

/**
 * Option - خيار فردي داخل مجموعة
 * Requirements: 1.3, 5.2
 */
export interface Option {
  id: string;
  group_id: string;
  name_ar: string;
  name_en: string;
  description_ar?: string;
  description_en?: string;
  base_price: number;
  image?: string;
  available: number;
  display_order: number;
  // Nutrition fields
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  sugar: number;
  fiber: number;
}

/**
 * OptionGroup - مجموعة خيارات
 * Requirements: 1.1, 2.2
 */
export interface OptionGroup {
  id: string;
  name_ar: string;
  name_en: string;
  description_ar?: string;
  description_en?: string;
  display_order: number;
  icon: string;
  options: Option[];
}

// ===========================
// Form Data Types
// ===========================

/**
 * Form data for creating/editing option groups
 * Requirements: 2.2, 3.1
 */
export interface OptionGroupFormData {
  id: string;
  name_ar: string;
  name_en: string;
  description_ar?: string;
  description_en?: string;
  icon: string;
  display_order: number;
}

/**
 * Form data for creating/editing options
 * Requirements: 5.2, 6.1
 */
export interface OptionFormData {
  id: string;
  group_id: string;
  name_ar: string;
  name_en: string;
  description_ar?: string;
  description_en?: string;
  base_price: number;
  image?: string;
  display_order: number;
  available: boolean;
  // Nutrition fields
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  sugar: number;
  fiber: number;
}

// ===========================
// Component Props Types
// ===========================

export interface OptionsPageState {
  optionGroups: OptionGroup[];
  isLoading: boolean;
  searchQuery: string;
  expandedGroups: Set<string>;
  showGroupModal: boolean;
  showOptionModal: boolean;
  showDeleteModal: boolean;
  editingGroup: OptionGroup | null;
  editingOption: Option | null;
  selectedGroupId: string | null;
  deleteTarget: { type: 'group' | 'option'; id: string; name: string; optionsCount?: number; groupId?: string } | null;
}

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
}

export interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  target: { type: 'group' | 'option'; id: string; name: string; optionsCount?: number; groupId?: string } | null;
  onConfirm: () => Promise<void>;
  isLoading?: boolean;
}

// ===========================
// API Response Types
// ===========================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface OptionGroupsResponse {
  success: boolean;
  data: OptionGroup[];
}

// ===========================
// Initial/Default Values
// ===========================

export const INITIAL_GROUP_FORM_DATA: OptionGroupFormData = {
  id: '',
  name_ar: '',
  name_en: '',
  description_ar: '',
  description_en: '',
  icon: '📦',
  display_order: 0,
};

export const INITIAL_OPTION_FORM_DATA: OptionFormData = {
  id: '',
  group_id: '',
  name_ar: '',
  name_en: '',
  description_ar: '',
  description_en: '',
  base_price: 0,
  image: '',
  display_order: 0,
  available: true,
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
  sugar: 0,
  fiber: 0,
};

// ===========================
// Icon Options
// ===========================

export const ICON_OPTIONS = [
  '🍦', '🍨', '🥤', '🧁', '🍰', '🍫', '🍓', '🍌',
  '🥜', '🍪', '🍩', '🧇', '🍯', '🥛', '☕', '🍵',
  '📦', '⭐', '✨', '💎', '🎁', '🏷️', '🔖', '📋',
];
