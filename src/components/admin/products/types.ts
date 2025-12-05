
// src/components/admin/products/types.ts
import type { Product } from '@/lib/admin';

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
  onSubmit: (formData: ProductFormData) => Promise<void>;
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
  // ❌ REMOVED: product_type (deprecated - use template_id instead, Requirements 3.1)
  // ❌ REMOVED: is_customizable (now derived from option groups)
  // ✅ Template System
  template_id: string;
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
  sugar: string;
  fiber: string;
  energy_type: string;
  energy_score: string;
  tags: string;
  ingredients: string;
  nutrition_facts: string;
  allergens: string;
  // Health-Driven Cart fields
  health_keywords: string[];
  health_benefit_ar: string;
}

export interface ProductConfig {
  product?: {
    productType: string;
  };
  hasContainers: boolean;
  containers?: any[];
  hasSizes: boolean;
  sizes?: any[];
  hasCustomization: boolean;
  customizationRules?: any[];
}

// ❌ REMOVED: PRODUCT_TYPES constant (deprecated - use template_id instead, Requirements 3.1)
// Product display is now controlled by template_id: 'template_1', 'template_2', 'template_3'

export const INITIAL_FORM_DATA: ProductFormData = {
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
  // ✅ Template System (Requirements 3.1)
  template_id: 'template_1',
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
  // Health-Driven Cart fields
  health_keywords: [],
  health_benefit_ar: ''
};

// Health Keywords for admin selection
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
};
