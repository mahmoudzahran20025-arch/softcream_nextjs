// ================================================================
// SmartFooter.tsx - Smart Modal Footer Component
// Displays compact summary of selections in a single line
// Requirements: 3.1, 3.2, 3.3, 3.4, 3.5
// ================================================================

'use client'

import { ShoppingCart } from 'lucide-react'
import { motion } from 'framer-motion'
import QuantitySelector from '@/components/ui/common/QuantitySelector'
import PriceDisplay from '@/components/ui/common/PriceDisplay'

// ================================================================
// Types
// ================================================================

/**
 * Selected option for display in footer
 */
export interface FooterSelectedOption {
  id: string
  name: string
  price: number
  groupId: string
  groupIcon?: string
}

/**
 * Selected size for display
 */
export interface FooterSelectedSize {
  id: string
  name: string
  priceModifier: number
}

/**
 * Props for SmartFooter component
 */
export interface SmartFooterProps {
  /** Selected size (displayed prominently) */
  selectedSize?: FooterSelectedSize | null
  /** Selected options (displayed as badges) */
  selectedOptions: FooterSelectedOption[]
  /** Total price to display */
  totalPrice: number
  /** Current quantity */
  quantity: number
  /** Callback when quantity increases */
  onIncrease: () => void
  /** Callback when quantity decreases */
  onDecrease: () => void
  /** Callback when add to cart is clicked */
  onAddToCart: () => void
  /** Whether the current selection is valid */
  isValid?: boolean
  /** Validation message to display */
  validationMessage?: string
  /** Maximum options to show before collapsing to count */
  maxVisibleOptions?: number
}

// ================================================================
// Pure Utility Functions (for testing)
// ================================================================

/**
 * Format footer summary line
 * @see Requirements 3.1, 3.2, 3.3, 3.4, 3.5
 * 
 * @param sizeName - Selected size name (displayed prominently)
 * @param options - Array of selected options
 * @param maxVisible - Maximum options to show before collapsing (default: 3)
 * @returns Formatted summary string
 */
export function formatFooterSummary(
  sizeName: string | null | undefined,
  options: Array<{ name: string; groupIcon?: string }>,
  maxVisible: number = 3
): string {
  const parts: string[] = []

  // Add size name prominently (Requirement 3.2)
  if (sizeName && sizeName.trim()) {
    parts.push(sizeName.trim())
  }

  // Handle options (Requirements 3.3, 3.4)
  if (options && options.length > 0) {
    if (options.length <= maxVisible) {
      // Show individual option names as badges (Requirement 3.3)
      options.forEach(opt => {
        if (opt.name && opt.name.trim()) {
          parts.push(opt.name.trim())
        }
      })
    } else {
      // Show count when options > maxVisible (Requirement 3.4)
      parts.push(`+${options.length} إضافات`)
    }
  }

  // Join with bullet separator (Requirement 3.1 - single line)
  // Requirement 3.5 - no redundant separators
  return parts.filter(p => p.length > 0).join(' • ')
}

/**
 * Group options by their group for display
 * Returns a summary with counts per group
 */
export function groupOptionsByCategory(
  options: FooterSelectedOption[]
): Map<string, { count: number; icon?: string }> {
  const groups = new Map<string, { count: number; icon?: string }>()

  options.forEach(opt => {
    const existing = groups.get(opt.groupId)
    if (existing) {
      existing.count++
    } else {
      groups.set(opt.groupId, { count: 1, icon: opt.groupIcon })
    }
  })

  return groups
}

/**
 * Known option group IDs from backend
 * These are fixed IDs that should not change
 */
export const KNOWN_GROUP_IDS = {
  SIZES: 'sizes',
  FLAVORS: 'flavors',
  SAUCES: 'sauces',
  FRUITS: 'fruits',
  CREAMY: 'creamy',
  DRY_TOPPINGS: 'dry_toppings'
} as const

/**
 * Group display configuration
 * Defines how each group should be displayed in the footer
 */
export const GROUP_DISPLAY_CONFIG: Record<string, { 
  labelAr: string
  labelEn: string
  icon: string
  priority: number
  showIndividual: boolean // Show individual names or just count
}> = {
  [KNOWN_GROUP_IDS.SIZES]: { labelAr: 'الحجم', labelEn: 'Size', icon: '📏', priority: 1, showIndividual: true },
  [KNOWN_GROUP_IDS.FLAVORS]: { labelAr: 'نكهات', labelEn: 'Flavors', icon: '🍦', priority: 2, showIndividual: true },
  [KNOWN_GROUP_IDS.SAUCES]: { labelAr: 'صوصات', labelEn: 'Sauces', icon: '🍫', priority: 3, showIndividual: false },
  [KNOWN_GROUP_IDS.FRUITS]: { labelAr: 'فواكه', labelEn: 'Fruits', icon: '🥭', priority: 4, showIndividual: false },
  [KNOWN_GROUP_IDS.CREAMY]: { labelAr: 'كريمي', labelEn: 'Creamy', icon: '☁️', priority: 5, showIndividual: false },
  [KNOWN_GROUP_IDS.DRY_TOPPINGS]: { labelAr: 'إضافات', labelEn: 'Toppings', icon: '🍪', priority: 6, showIndividual: false }
}

/**
 * Get compact badge display for options
 * Groups options by category and shows smart summaries
 */
export function getCompactBadges(
  options: FooterSelectedOption[],
  maxVisible: number = 3
): Array<{ text: string; icon?: string; groupId?: string }> {
  if (!options || options.length === 0) {
    return []
  }

  // Group options by groupId
  const grouped = groupOptionsByCategory(options)
  const badges: Array<{ text: string; icon?: string; groupId?: string }> = []

  // Sort groups by priority
  const sortedGroups = Array.from(grouped.entries()).sort((a, b) => {
    const configA = GROUP_DISPLAY_CONFIG[a[0]]
    const configB = GROUP_DISPLAY_CONFIG[b[0]]
    return (configA?.priority ?? 99) - (configB?.priority ?? 99)
  })

  for (const [groupId, { count, icon }] of sortedGroups) {
    const config = GROUP_DISPLAY_CONFIG[groupId]
    const groupOptions = options.filter(o => o.groupId === groupId)

    if (config?.showIndividual && count <= 2) {
      // Show individual names for this group
      groupOptions.forEach(opt => {
        badges.push({
          text: opt.name,
          icon: opt.groupIcon || config?.icon || icon,
          groupId
        })
      })
    } else {
      // Show count for this group
      const label = config?.labelAr || groupId
      badges.push({
        text: count > 1 ? `${count} ${label}` : groupOptions[0]?.name || label,
        icon: config?.icon || icon,
        groupId
      })
    }
  }

  // If too many badges, collapse to summary
  if (badges.length > maxVisible) {
    const visible = badges.slice(0, maxVisible - 1)
    const visibleCount = visible.reduce((sum, b) => {
      // Count options represented by this badge
      const match = b.text.match(/^(\d+)\s/)
      return sum + (match ? parseInt(match[1]) : 1)
    }, 0)
    const remaining = options.length - visibleCount
    
    if (remaining > 0) {
      visible.push({ text: `+${remaining} إضافات`, icon: undefined })
    }
    return visible
  }

  return badges
}

// ================================================================
// Component Implementation
// ================================================================

/**
 * SmartFooter - Compact modal footer with selection summary
 * 
 * @example
 * ```tsx
 * <SmartFooter
 *   selectedSize={{ id: 'large', name: 'حجم كبير', priceModifier: 15 }}
 *   selectedOptions={[
 *     { id: '1', name: 'صوص نوتيلا', price: 5, groupId: 'sauces' },
 *     { id: '2', name: 'فراولة', price: 3, groupId: 'toppings' }
 *   ]}
 *   totalPrice={85}
 *   quantity={1}
 *   onIncrease={() => {}}
 *   onDecrease={() => {}}
 *   onAddToCart={() => {}}
 * />
 * ```
 */
export default function SmartFooter({
  selectedSize,
  selectedOptions,
  totalPrice,
  quantity,
  onIncrease,
  onDecrease,
  onAddToCart,
  isValid = true,
  validationMessage,
  maxVisibleOptions = 3
}: SmartFooterProps) {
  // Get compact badges for display
  const badges = getCompactBadges(selectedOptions, maxVisibleOptions)
  const hasSelections = selectedSize || selectedOptions.length > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, type: 'spring', damping: 25 }}
      className="relative border-t border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md"
    >
      {/* Validation Message */}
      {!isValid && validationMessage && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-800/50 px-4 py-2"
        >
          <p className="text-xs text-amber-700 dark:text-amber-400 text-center">
            ⚠️ {validationMessage}
          </p>
        </motion.div>
      )}

      {/* Smart Summary Line (Requirement 3.1 - single line) */}
      {hasSelections && (
        <div className="px-4 lg:px-6 pt-3 pb-1 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-sm overflow-x-auto scrollbar-none">
            {/* Size Badge (Requirement 3.2 - prominent display) */}
            {selectedSize && (
              <span className="flex-shrink-0 bg-pink-100 dark:bg-pink-900/40 text-pink-700 dark:text-pink-300 px-2.5 py-1 rounded-full text-xs font-medium">
                📏 {selectedSize.name}
              </span>
            )}

            {/* Option Badges (Requirements 3.3, 3.4) */}
            {badges.map((badge, index) => (
              <span
                key={index}
                className="flex-shrink-0 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1"
              >
                {badge.icon && <span className="text-xs">{badge.icon}</span>}
                {badge.text}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Main Action Row */}
      <div className="p-4 lg:p-5">
        <div className="flex items-center gap-3">
          {/* Quantity Selector */}
          <div className="flex-shrink-0">
            <QuantitySelector
              quantity={quantity}
              onIncrease={onIncrease}
              onDecrease={onDecrease}
              size="lg"
            />
          </div>

          {/* Add to Cart Button */}
          <motion.button
            onClick={onAddToCart}
            disabled={!isValid}
            whileHover={isValid ? { scale: 1.02 } : {}}
            whileTap={isValid ? { scale: 0.98 } : {}}
            className={`
              flex-1 min-h-[52px] py-3.5 px-5 rounded-2xl font-bold text-base
              flex items-center justify-center gap-2
              transition-all duration-200
              ${isValid
                ? 'bg-gradient-to-r from-[#FF6B9D] to-[#FF5A8E] hover:from-[#FF5A8E] hover:to-[#FF4979] text-white shadow-lg shadow-pink-500/25 hover:shadow-xl hover:shadow-pink-500/30'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
              }
            `}
          >
            <ShoppingCart className="w-5 h-5 flex-shrink-0" />
            <span className="whitespace-nowrap">أضف للسلة</span>
            <span className="mx-1 opacity-50">•</span>
            <PriceDisplay 
              price={totalPrice} 
              size="md" 
              className={isValid ? 'text-white' : 'text-slate-400 dark:text-slate-500'}
            />
          </motion.button>
        </div>
      </div>

      {/* Safe Area Padding for iOS */}
      <div className="h-safe-area-inset-bottom bg-white dark:bg-slate-900" />
    </motion.div>
  )
}
