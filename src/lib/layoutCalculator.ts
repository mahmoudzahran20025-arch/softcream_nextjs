// src/lib/layoutCalculator.ts - Adaptive Layout Calculator
// ================================================================
// Calculates optimal layout based on option count and configuration
// Requirements: 6.1, 6.2, 6.3, 6.4

// ================================================================
// Type Definitions
// ================================================================

/**
 * Result of layout calculation
 */
export interface LayoutResult {
  /** Number of columns to display */
  columns: number;
  /** CSS class for the container element */
  containerClass: string;
  /** CSS class for each item element */
  itemClass: string;
  /** Whether the container should be scrollable */
  isScrollable: boolean;
}

/**
 * Column configuration type (matches UIConfig.columns)
 */
export type ColumnConfig = 1 | 2 | 3 | 4 | 'auto';

// ================================================================
// CSS Class Mappings
// ================================================================

/**
 * Container CSS classes based on column count
 */
const CONTAINER_CLASSES: Record<number, string> = {
  1: 'grid grid-cols-1 gap-3',
  2: 'grid grid-cols-2 gap-3',
  3: 'grid grid-cols-3 gap-3',
  4: 'grid grid-cols-4 gap-3',
};

/**
 * Mobile-responsive container classes
 */
const RESPONSIVE_CONTAINER_CLASSES: Record<number, string> = {
  1: 'grid grid-cols-1 gap-3',
  2: 'grid grid-cols-1 sm:grid-cols-2 gap-3',
  3: 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3',
  4: 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3',
};

/**
 * Item CSS classes based on column count
 */
const ITEM_CLASSES: Record<number, string> = {
  1: 'w-full',
  2: 'w-full',
  3: 'w-full',
  4: 'w-full',
};

/**
 * Scrollable container class suffix
 */
const SCROLLABLE_CLASS = 'max-h-80 overflow-y-auto';

// ================================================================
// Main Calculator Function
// ================================================================

/**
 * Calculate optimal layout based on option count and configuration
 * 
 * Requirements:
 * - 6.1: 1-3 options → single row (columns = option count)
 * - 6.2: 4-6 options → 2-column grid
 * - 6.3: 7+ options → 3-column grid with scroll
 * - 6.4: Explicit columns override auto-calculation
 * 
 * @param optionCount - Number of options to display
 * @param explicitColumns - Explicit column setting from ui_config (optional)
 * @param isMobile - Whether the viewport is mobile-sized (optional)
 * @returns LayoutResult with columns, CSS classes, and scroll state
 */
export function calculateLayout(
  optionCount: number,
  explicitColumns?: ColumnConfig,
  isMobile?: boolean
): LayoutResult {
  // Handle edge case: no options
  if (optionCount <= 0) {
    return {
      columns: 1,
      containerClass: CONTAINER_CLASSES[1],
      itemClass: ITEM_CLASSES[1],
      isScrollable: false,
    };
  }

  // Requirement 6.4: If explicit columns set (not 'auto'), use them
  if (explicitColumns !== undefined && explicitColumns !== 'auto') {
    const cols = Math.min(Math.max(explicitColumns, 1), 4); // Clamp to 1-4
    const containerClass = isMobile 
      ? CONTAINER_CLASSES[1] 
      : RESPONSIVE_CONTAINER_CLASSES[cols];
    
    return {
      columns: isMobile ? 1 : cols,
      containerClass,
      itemClass: ITEM_CLASSES[cols],
      isScrollable: optionCount > 6,
    };
  }

  // Auto-calculate based on option count
  let columns: number;
  let isScrollable: boolean;

  if (optionCount <= 3) {
    // Requirement 6.1: 1-3 options → single row
    columns = isMobile ? 1 : optionCount;
    isScrollable = false;
  } else if (optionCount <= 6) {
    // Requirement 6.2: 4-6 options → 2-column grid
    columns = isMobile ? 1 : 2;
    isScrollable = false;
  } else {
    // Requirement 6.3: 7+ options → 3-column grid with scroll
    columns = isMobile ? 1 : 3;
    isScrollable = true;
  }

  // Build container class
  let containerClass = isMobile 
    ? CONTAINER_CLASSES[1] 
    : RESPONSIVE_CONTAINER_CLASSES[columns];
  
  if (isScrollable) {
    containerClass = `${containerClass} ${SCROLLABLE_CLASS}`;
  }

  return {
    columns,
    containerClass,
    itemClass: ITEM_CLASSES[columns],
    isScrollable,
  };
}

// ================================================================
// Helper Functions
// ================================================================

/**
 * Get container class for a specific column count
 * Useful for custom layouts
 */
export function getContainerClass(columns: number, responsive: boolean = true): string {
  const clampedCols = Math.min(Math.max(columns, 1), 4);
  return responsive 
    ? RESPONSIVE_CONTAINER_CLASSES[clampedCols] 
    : CONTAINER_CLASSES[clampedCols];
}

/**
 * Get item class for a specific column count
 */
export function getItemClass(columns: number): string {
  const clampedCols = Math.min(Math.max(columns, 1), 4);
  return ITEM_CLASSES[clampedCols];
}

/**
 * Check if layout should be scrollable based on option count
 */
export function shouldScroll(optionCount: number): boolean {
  return optionCount > 6;
}
