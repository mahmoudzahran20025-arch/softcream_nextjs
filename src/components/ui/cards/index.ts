/**
 * Product Card Components
 * =======================
 * Different card styles for different product templates/complexity levels
 */

// Template-based cards
export { default as WizardCard } from './WizardCard'  // Template 3 - Complex
export { default as StandardProductCard } from './StandardProductCard'  // Template 2 - Medium
export { default as CompactCard } from './CompactCard'  // Template 1 - Simple
export { default as SimpleCard } from './SimpleCard'  // Template 1 - Simple (New Design)

// Legacy cards (for backward compatibility)
export { default as BYOProductCard } from './BYOProductCard'
export { default as FeaturedProductCard } from './FeaturedProductCard'
export { default as CompactProductCard } from './CompactProductCard'
