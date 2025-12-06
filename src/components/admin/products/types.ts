/**
 * Admin Products Types
 * 
 * ⚠️ This file re-exports from @/types/admin for backward compatibility
 * New code should import directly from @/types/admin
 */

// ===========================
// Re-export from unified types
// ===========================

import type { Product } from '@/lib/admin';

export type {
  ProductFormData,
} from '@/types/admin';

export {
  HEALTH_KEYWORDS_OPTIONS,
  INITIAL_PRODUCT_FORM_DATA as INITIAL_FORM_DATA,
} from '@/types/admin';

// ===========================
// Component-specific Props Types
// ===========================

export interface ProductsPageProps {
  onRefresh?: () => void;
  onUpdate?: (product: Product) => void;
  onDelete?: (productId: string) => void;
}

/**
 * Information about an assigned option group for display in ProductCard
 * Requirements: 5.2 - Show assigned option groups count with tooltip
 */
export interface AssignedGroupInfo {
  groupId: string;
  groupName: string;
  groupIcon?: string;
  isRequired: boolean;
  optionsCount: number;
}

export interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
  onToggleAvailability: (product: Product) => void;
  onOpenConfig: (product: Product) => void;
  // Selection props for bulk actions
  isSelected?: boolean;
  onSelectionChange?: (productId: string, selected: boolean) => void;
  selectionMode?: boolean;
  // Template badge props (Requirements: 5.1)
  templateId?: string | null;
  templateComplexity?: 'simple' | 'medium' | 'complex' | null;
  templateNameAr?: string;
  templateNameEn?: string;
  // Option groups badge props (Requirements: 5.2)
  assignedGroups?: AssignedGroupInfo[];
}

export interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  editingProduct: Product | null;
  onSubmit: (formData: import('@/types/admin').ProductFormData) => Promise<void>;
}

/**
 * @deprecated ConfigModal is deprecated. Use UnifiedProductForm instead.
 * This interface is kept for backward compatibility only.
 * @see UnifiedProductForm
 */
export interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  config: ProductConfig | null;
  loading: boolean;
  onUpdateProductType: (productType: string) => Promise<void>;
}

export interface ProductConfig {
  product?: {
    productType: string;
  };
  hasContainers: boolean;
  containers?: unknown[];
  hasSizes: boolean;
  sizes?: unknown[];
  hasCustomization: boolean;
  customizationRules?: unknown[];
}
