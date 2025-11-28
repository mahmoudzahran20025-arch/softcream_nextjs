// src/components/admin/customization/types.ts

export interface Container {
  id: string;
  name_ar: string;
  name_en: string;
  price_modifier: number;
  calories: number;
  protein?: number;
  carbs?: number;
  sugar?: number;
  fat?: number;
  fiber?: number;
  max_sizes?: number;
  available: number;
  display_order: number;
}

export interface Size {
  id: string;
  name_ar: string;
  name_en: string;
  price_modifier: number;
  nutrition_multiplier: number;
  display_order: number;
}

export interface Option {
  id: string;
  group_id: string;
  name_ar: string;
  name_en: string;
  base_price: number;
  calories: number;
  protein?: number;
  carbs?: number;
  sugar?: number;
  fat?: number;
  fiber?: number;
  available: number;
  display_order?: number;
}

export interface OptionGroup {
  id: string;
  name_ar: string;
  name_en: string;
  description_ar?: string;
  icon: string;
  display_order: number;
  options: Option[];
}

export type ActiveSection = 'overview' | 'containers' | 'sizes' | 'groups' | 'options';
export type ModalType = 'container' | 'size' | 'group' | 'option' | null;

export interface CustomizationPageProps {
  // Future props if needed
}
