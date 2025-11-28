// Product Templates - Separated for easy maintenance
export { default as ProductTemplateRenderer } from './ProductTemplateRenderer'
export { default as BYOTemplate } from './BYOTemplate'
export { default as DessertTemplate } from './DessertTemplate'
export { default as MilkshakeTemplate } from './MilkshakeTemplate'
export { default as PresetTemplate } from './PresetTemplate'
export { default as StandardTemplate } from './StandardTemplate'

// Template types
export type ProductTemplateType = 
  | 'byo_ice_cream' 
  | 'milkshake' 
  | 'preset_ice_cream' 
  | 'dessert' 
  | 'standard'
