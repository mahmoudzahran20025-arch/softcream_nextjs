/**
 * UnifiedProductForm Types
 * 
 * Types and interfaces for the unified product form that combines
 * product creation with option groups, containers, and sizes assignment.
 * 
 * @module admin/products/UnifiedProductForm/types
 * Requirements: 1.1, 1.3
 */

import type { Product } from '@/lib/admin/products.api';

// ============================================================================
// Option Group Assignment Types
// ============================================================================

/**
 * Configuration for assigning an option group to a product
 * Requirement 1.3: Allow configuration of is_required, min_selections, max_selections
 */
export interface OptionGroupAssignment {
  /** The option group ID */
  groupId: string;
  /** Whether this group is required for the product */
  isRequired: boolean;
  /** Minimum number of selections required */
  minSelections: number;
  /** Maximum number of selections allowed */
  maxSelections: number;
  /** Optional price override for this group */
  priceOverride?: number;
  /** Display order in the product customization UI */
  displayOrder: number;
}

/**
 * Extended option group info for display in the form
 */
export interface OptionGroupInfo {
  id: string;
  name: string;
  nameEn?: string;
  icon?: string;
  optionsCount: number;
  options?: Array<{
    id: string;
    name: string;
    price: number;
  }>;
}

// ============================================================================
// Container Assignment Types
// ============================================================================

/**
 * Configuration for assigning a container to a product
 * Requirement 1.3: Allow container selection with default setting
 */
export interface ContainerAssignment {
  /** The container ID */
  containerId: string;
  /** Whether this is the default container */
  isDefault: boolean;
}

/**
 * Container info for display in the form
 */
export interface ContainerInfo {
  id: string;
  name: string;
  nameEn?: string;
  price: number;
  image?: string;
}

// ============================================================================
// Size Assignment Types
// ============================================================================

/**
 * Configuration for assigning a size to a product
 * Requirement 1.3: Allow size selection with default setting
 */
export interface SizeAssignment {
  /** The size ID */
  sizeId: string;
  /** Whether this is the default size */
  isDefault: boolean;
}

/**
 * Size info for display in the form
 */
export interface SizeInfo {
  id: string;
  name: string;
  nameEn?: string;
  priceMultiplier: number;
}

// ============================================================================
// Product Form Data Types
// ============================================================================

/**
 * Product details form data
 * Requirement 1.1: Product details section in unified form
 * Requirements 2.4: template_id and card_style fields
 * Requirements 4.1-4.6, 5.1, 5.3-5.5: ui_config for display settings
 */
export interface ProductFormData {
  id: string;
  name: string;
  nameEn: string;
  category: string;
  categoryEn: string;
  price: string;
  description: string;
  descriptionEn: string;
  image: string;
  badge: string;
  available: number;
  // ✅ Template System - single source of truth
  template_id: string;
  // ✅ UI Config - display settings (Requirements 4.1-4.6, 5.1, 5.3-5.5)
  ui_config: string;
  // Discount fields - Pricing with Discounts
  old_price: string;
  discount_percentage: string;
  // Nutrition fields
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
  sugar: string;
  fiber: string;
  // Energy fields
  energy_type: string;
  energy_score: string;
  // Metadata fields (JSON strings)
  tags: string;
  ingredients: string;
  nutrition_facts: string;
  allergens: string;
  // Health-Driven Cart fields
  health_keywords: string[];
  health_benefit_ar: string;
}

// ============================================================================
// Unified Product Data
// ============================================================================

/**
 * Complete unified product data for form submission
 * Requirement 1.1: Unified form with product details and option groups assignment
 */
export interface UnifiedProductData {
  /** Product details */
  product: ProductFormData;
  /** Option groups assigned to this product */
  optionGroupAssignments: OptionGroupAssignment[];
  /** Containers assigned to this product */
  containerAssignments: ContainerAssignment[];
  /** Sizes assigned to this product */
  sizeAssignments: SizeAssignment[];
}

// ============================================================================
// Form Props Types
// ============================================================================

/**
 * Props for the UnifiedProductForm component
 * Requirements: 5.3 - Unified option groups interface
 * Containers and sizes are now part of optionGroups with group_id 'containers' and 'sizes'
 */
export interface UnifiedProductFormProps {
  /** Whether the form modal is open */
  isOpen: boolean;
  /** Callback when the form is closed */
  onClose: () => void;
  /** Product being edited (null for new product) */
  editingProduct: Product | null;
  /** Callback when form is submitted */
  onSubmit: (data: UnifiedProductData) => Promise<void>;
  /** 
   * Available option groups for assignment
   * Now includes containers (group_id='containers') and sizes (group_id='sizes')
   */
  optionGroups: OptionGroupInfo[];
  /** @deprecated Containers are now part of optionGroups with group_id='containers' */
  containers?: ContainerInfo[];
  /** @deprecated Sizes are now part of optionGroups with group_id='sizes' */
  sizes?: SizeInfo[];
}

/**
 * Props for ProductDetailsSection component
 */
export interface ProductDetailsSectionProps {
  /** Current form data */
  formData: ProductFormData;
  /** Callback when form data changes */
  onChange: (data: ProductFormData) => void;
  /** Whether editing an existing product (disables ID field) */
  isEditing: boolean;
  /** Callback when product type changes (for template suggestions) */
  onProductTypeChange?: (productType: string) => void;
}

/**
 * Props for OptionGroupsSection component
 */
export interface OptionGroupsSectionProps {
  /** Current option group assignments */
  assignments: OptionGroupAssignment[];
  /** Callback when assignments change */
  onChange: (assignments: OptionGroupAssignment[]) => void;
  /** Available option groups */
  availableGroups: OptionGroupInfo[];
  /** Validation errors for this section */
  errors?: Array<{ field: string; message: string }>;
  /** Validation warnings for this section */
  warnings?: Array<{ field: string; message: string }>;
}

/**
 * Props for ContainersSection component
 */
export interface ContainersSectionProps {
  /** Current container assignments */
  assignments: ContainerAssignment[];
  /** Callback when assignments change */
  onChange: (assignments: ContainerAssignment[]) => void;
  /** Available containers */
  availableContainers: ContainerInfo[];
  /** Validation warnings for this section */
  warnings?: Array<{ field: string; message: string }>;
}

/**
 * Props for SizesSection component
 */
export interface SizesSectionProps {
  /** Current size assignments */
  assignments: SizeAssignment[];
  /** Callback when assignments change */
  onChange: (assignments: SizeAssignment[]) => void;
  /** Available sizes */
  availableSizes: SizeInfo[];
  /** Validation warnings for this section */
  warnings?: Array<{ field: string; message: string }>;
}

/**
 * Props for ValidationSummary component
 */
export interface ValidationSummaryProps {
  /** Validation errors (blocking) */
  errors: Array<{ field: string; message: string; code: string }>;
  /** Validation warnings (non-blocking) */
  warnings: Array<{ field: string; message: string; code: string }>;
  /** Callback when user confirms save with warnings */
  onConfirmWithWarnings: () => void;
  /** Callback when user cancels */
  onCancel: () => void;
}

// ============================================================================
// Form State Types
// ============================================================================

/**
 * Active tab in the unified form
 * Requirements: 5.3 - Organize form in tabs (Details, Template, Options, Nutrition)
 * Requirements: 2.1, 2.2 - Added template tab for template selection
 * Requirements: 4.1-4.6, 5.1, 5.3-5.5 - Added uiConfig tab for display settings
 * Containers and sizes are now part of option_groups with group_id 'containers' and 'sizes'
 */
export type FormTab = 'details' | 'template' | 'uiConfig' | 'optionGroups' | 'nutrition';

/**
 * Form state for tracking changes
 */
export interface FormState {
  /** Current active tab */
  activeTab: FormTab;
  /** Whether form has unsaved changes */
  isDirty: boolean;
  /** Whether form is currently submitting */
  isSubmitting: boolean;
  /** Whether validation summary modal is shown */
  showValidationSummary: boolean;
  /** Whether change preview modal is shown */
  showChangePreview: boolean;
}

// ============================================================================
// Change Tracking Types
// ============================================================================

/**
 * Represents a change to an option group assignment
 * Requirement 2.2: Show preview of changes before saving
 */
export interface OptionGroupChange {
  type: 'added' | 'removed' | 'modified';
  groupId: string;
  groupName: string;
  /** Original assignment (for removed/modified) */
  original?: OptionGroupAssignment;
  /** New assignment (for added/modified) */
  current?: OptionGroupAssignment;
  /** Whether the removed group was required (for warning) */
  wasRequired?: boolean;
}

/**
 * Represents a change to a container assignment
 */
export interface ContainerChange {
  type: 'added' | 'removed' | 'modified';
  containerId: string;
  containerName: string;
  original?: ContainerAssignment;
  current?: ContainerAssignment;
}

/**
 * Represents a change to a size assignment
 */
export interface SizeChange {
  type: 'added' | 'removed' | 'modified';
  sizeId: string;
  sizeName: string;
  original?: SizeAssignment;
  current?: SizeAssignment;
}

/**
 * Represents changes to product details
 */
export interface ProductDetailChange {
  field: string;
  fieldLabel: string;
  originalValue: string | number;
  currentValue: string | number;
}

/**
 * Complete change summary for the unified product data
 * Requirement 2.2: Preview of changes before saving
 */
export interface ChangesSummary {
  /** Whether there are any changes */
  hasChanges: boolean;
  /** Changes to product details */
  productChanges: ProductDetailChange[];
  /** Changes to option group assignments */
  optionGroupChanges: OptionGroupChange[];
  /** Changes to container assignments */
  containerChanges: ContainerChange[];
  /** Changes to size assignments */
  sizeChanges: SizeChange[];
  /** Whether any required groups are being removed (for warning) */
  hasRequiredGroupRemoval: boolean;
}

/**
 * Props for ChangePreviewModal component
 * Requirement 2.2, 2.3: Display changes and warn about required group removal
 */
export interface ChangePreviewModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when modal is closed */
  onClose: () => void;
  /** Changes summary to display */
  changes: ChangesSummary;
  /** Callback when user confirms changes */
  onConfirm: () => void;
  /** Option groups info for displaying names */
  optionGroups: OptionGroupInfo[];
  /** Containers info for displaying names */
  containers: ContainerInfo[];
  /** Sizes info for displaying names */
  sizes: SizeInfo[];
}

// ============================================================================
// Initial State
// ============================================================================

/**
 * Initial product form data for new products
 * Requirements 2.4: Added template_id and card_style
 * Requirements 4.1-4.6, 5.1, 5.3-5.5: Added ui_config
 */
export const INITIAL_PRODUCT_FORM_DATA: ProductFormData = {
  id: '',
  name: '',
  nameEn: '',
  category: '',
  categoryEn: '',
  price: '',
  description: '',
  descriptionEn: '',
  image: '',
  badge: '',
  available: 1,
  template_id: 'template_1',  // ✅ Default to template_1
  ui_config: '{}',  // ✅ Default empty ui_config
  old_price: '',
  discount_percentage: '',
  calories: '',
  protein: '',
  carbs: '',
  fat: '',
  sugar: '',
  fiber: '',
  energy_type: 'none',
  energy_score: '',
  tags: '',
  ingredients: '',
  nutrition_facts: '',
  allergens: '',
  health_keywords: [],
  health_benefit_ar: '',
};

/**
 * Initial unified product data for new products
 */
export const INITIAL_UNIFIED_DATA: UnifiedProductData = {
  product: INITIAL_PRODUCT_FORM_DATA,
  optionGroupAssignments: [],
  containerAssignments: [],
  sizeAssignments: [],
};

/**
 * Initial form state
 */
export const INITIAL_FORM_STATE: FormState = {
  activeTab: 'details',
  isDirty: false,
  isSubmitting: false,
  showValidationSummary: false,
  showChangePreview: false,
};

/**
 * Initial empty changes summary
 */
export const EMPTY_CHANGES_SUMMARY: ChangesSummary = {
  hasChanges: false,
  productChanges: [],
  optionGroupChanges: [],
  containerChanges: [],
  sizeChanges: [],
  hasRequiredGroupRemoval: false,
};

// ============================================================================
// Product Types Configuration
// ============================================================================

// ❌ REMOVED: PRODUCT_TYPES constant (deprecated - use template_id instead)
// ❌ REMOVED: CARD_STYLE_OPTIONS constant (deprecated - not used)

/**
 * Health keywords options for admin selection
 */
export const HEALTH_KEYWORDS_OPTIONS = {
  nutritional: [
    { value: 'high-protein', label: 'عالي البروتين', labelEn: 'High Protein' },
    { value: 'low-sugar', label: 'منخفض السكر', labelEn: 'Low Sugar' },
    { value: 'calcium', label: 'غني بالكالسيوم', labelEn: 'Rich in Calcium' },
    { value: 'fiber-rich', label: 'غني بالألياف', labelEn: 'Fiber Rich' },
    { value: 'probiotic', label: 'بروبيوتيك', labelEn: 'Probiotic' },
  ],
  lifestyle: [
    { value: 'energy-boost', label: 'يعزز الطاقة', labelEn: 'Energy Boost' },
    { value: 'indulgent', label: 'للاستمتاع', labelEn: 'Indulgent' },
    { value: 'balanced', label: 'متوازن', labelEn: 'Balanced' },
    { value: 'refreshing', label: 'منعش', labelEn: 'Refreshing' },
  ],
} as const;
