/**
 * UnifiedProductForm Types
 * 
 * ⚠️ This file re-exports from @/types/admin for backward compatibility
 * New code should import directly from @/types/admin
 * 
 * @module admin/products/UnifiedProductForm/types
 * Requirements: 1.1, 1.3
 */

import type { Product } from '@/lib/admin/products.api';

// ============================================================================
// Re-export from unified types
// ============================================================================

export type {
  ProductFormData,
  OptionGroupAssignment,
  OptionGroupInfo,
  ContainerAssignment,
  ContainerInfo,
  SizeAssignment,
  SizeInfo,
  UnifiedProductData,
  FormTab,
  FormState,
  OptionGroupChange,
  ContainerChange,
  SizeChange,
  ProductDetailChange,
  ChangesSummary,
} from '@/types/admin';

export {
  HEALTH_KEYWORDS_OPTIONS,
  INITIAL_PRODUCT_FORM_DATA,
  INITIAL_UNIFIED_DATA,
  INITIAL_FORM_STATE,
  EMPTY_CHANGES_SUMMARY,
} from '@/types/admin';

// ============================================================================
// Component Props Types (kept here for component-specific props)
// ============================================================================

import type {
  ProductFormData,
  OptionGroupAssignment,
  OptionGroupInfo,
  ContainerAssignment,
  ContainerInfo,
  SizeAssignment,
  SizeInfo,
  UnifiedProductData,
  ChangesSummary,
} from '@/types/admin';

/**
 * Props for the UnifiedProductForm component
 * Requirements: 5.3 - Unified option groups interface
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
  /** Available option groups for assignment */
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
 * Requirements: 6.1 - Display conditional rules section when editing product options
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
  /** Product ID for conditional rules API calls (optional - only for existing products) */
  productId?: string;
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
