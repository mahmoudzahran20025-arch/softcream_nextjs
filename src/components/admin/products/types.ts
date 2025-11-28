// src/components/admin/products/types.ts
import type { Product } from '@/lib/admin';

export interface ProductsPageProps {
  onRefresh?: () => void;
  onUpdate?: (product: Product) => void;
  onDelete?: (productId: string) => void;
}

export interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
  onToggleAvailability: (product: Product) => void;
  onOpenConfig: (product: Product) => void;
}

export interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  editingProduct: Product | null;
  onSubmit: (formData: ProductFormData) => Promise<void>;
}

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
  product_type: string;
  is_customizable: number;
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

// Product types for BYO system
export const PRODUCT_TYPES = [
  { value: 'standard', label: 'منتج عادي', icon: '🍽️', description: 'منتج بسيط بدون تخصيص' },
  { value: 'byo_ice_cream', label: 'BYO آيس كريم', icon: '✨', description: 'آيس كريم قابل للتخصيص بالكامل' },
  { value: 'milkshake', label: 'ميلك شيك', icon: '🥤', description: 'ميلك شيك مع خيارات النكهات' },
  { value: 'preset_ice_cream', label: 'آيس كريم جاهز', icon: '🍨', description: 'آيس كريم بوصفة محددة' },
  { value: 'dessert', label: 'حلويات', icon: '🍰', description: 'حلويات متنوعة' },
];

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
  product_type: 'standard',
  is_customizable: 0,
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
  allergens: ''
};
