// ================================================================
// Product Templates - Unified Product Model
// ================================================================
// Legacy templates archived to _archived/ folder
// All rendering now uses UnifiedProductRenderer
// ================================================================

export { default as ProductTemplateRenderer } from './ProductTemplateRenderer'
export { default as UnifiedProductRenderer } from '../UnifiedProductRenderer'

// Re-export types from ProductTemplateRenderer
export type { LayoutMode, TemplateProduct } from './ProductTemplateRenderer'
export { getEffectiveLayoutMode } from './ProductTemplateRenderer'
