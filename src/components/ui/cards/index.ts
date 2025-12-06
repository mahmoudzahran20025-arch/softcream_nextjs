/**
 * Product Card Components - Unified Template System
 * =================================================
 * ✅ 3 card types mapped to 3 templates:
 * - template_1 → SimpleCard (Quick add, minimal UI)
 * - template_2 → StandardProductCard (Options preview)
 * - template_3 → BYOProductCard (Premium BYO style)
 */

// ✅ Active Template Cards
export { default as SimpleCard } from './SimpleCard'              // template_1 - Simple
export { default as StandardProductCard } from './StandardProductCard'  // template_2 - Medium
export { default as BYOProductCard } from './BYOProductCard'      // template_3 - Complex/BYO
