// Product Templates - Separated for easy maintenance
export { default as ProductTemplateRenderer } from './ProductTemplateRenderer'

// New Complexity-Based Templates
export { default as ComplexTemplate } from './builders/ComplexTemplate'
export { default as MediumTemplate } from './composers/MediumTemplate'
export { default as SimpleTemplate } from './selectors/SimpleTemplate'

// Template types
export type LayoutMode =
  | 'complex'
  | 'medium'
  | 'simple'

