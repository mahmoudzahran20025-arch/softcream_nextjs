/**
 * Admin Product Validation Types
 * 
 * Types and interfaces for validating product data and option group assignments
 * in the unified product form.
 * 
 * @module admin/validation/types
 * Requirements: 1.4, 3.1, 3.2, 3.3, 3.4
 */

// ============================================================================
// Error Codes
// ============================================================================

/**
 * Validation error codes for product data validation
 */
export const ERROR_CODES = {
  // Required field errors (Requirement 1.4)
  MISSING_ID: 'MISSING_ID',
  MISSING_NAME: 'MISSING_NAME',
  MISSING_CATEGORY: 'MISSING_CATEGORY',
  MISSING_PRICE: 'MISSING_PRICE',
  INVALID_PRICE: 'INVALID_PRICE',
  
  // Option group assignment errors (Requirements 3.1, 3.3)
  INVALID_MIN_MAX: 'INVALID_MIN_MAX',
  DUPLICATE_GROUP: 'DUPLICATE_GROUP',
  
  // General errors
  INVALID_DATA: 'INVALID_DATA',
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];

// ============================================================================
// Warning Codes
// ============================================================================

/**
 * Validation warning codes for product data validation
 */
export const WARNING_CODES = {
  // Option group warnings (Requirements 3.2, 3.4)
  REQUIRED_MIN_ZERO: 'REQUIRED_MIN_ZERO',
  MAX_EXCEEDS_OPTIONS: 'MAX_EXCEEDS_OPTIONS',
  
  // Product configuration warnings (Requirements 7.1, 7.2)
  NO_OPTION_GROUPS: 'NO_OPTION_GROUPS',
  NO_DEFAULT_CONTAINER: 'NO_DEFAULT_CONTAINER',
  NO_DEFAULT_SIZE: 'NO_DEFAULT_SIZE',
  
  // General warnings
  POTENTIAL_ISSUE: 'POTENTIAL_ISSUE',
} as const;

export type WarningCode = typeof WARNING_CODES[keyof typeof WARNING_CODES];

// ============================================================================
// Validation Result Types
// ============================================================================

/**
 * Represents a single validation error
 */
export interface ValidationError {
  /** The field that has the error */
  field: string;
  /** Human-readable error message (Arabic) */
  message: string;
  /** Error code for programmatic handling */
  code: ErrorCode;
}

/**
 * Represents a single validation warning
 */
export interface ValidationWarning {
  /** The field that has the warning */
  field: string;
  /** Human-readable warning message (Arabic) */
  message: string;
  /** Warning code for programmatic handling */
  code: WarningCode;
}

/**
 * Result of a validation operation
 */
export interface ValidationResult {
  /** Whether the validation passed (no errors) */
  isValid: boolean;
  /** List of validation errors (blocking) */
  errors: ValidationError[];
  /** List of validation warnings (non-blocking) */
  warnings: ValidationWarning[];
}

// ============================================================================
// Error Messages (Arabic)
// ============================================================================

/**
 * Arabic error messages mapped to error codes
 */
export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  [ERROR_CODES.MISSING_ID]: 'معرف المنتج مطلوب',
  [ERROR_CODES.MISSING_NAME]: 'اسم المنتج مطلوب',
  [ERROR_CODES.MISSING_CATEGORY]: 'الفئة مطلوبة',
  [ERROR_CODES.MISSING_PRICE]: 'السعر مطلوب',
  [ERROR_CODES.INVALID_PRICE]: 'السعر غير صالح',
  [ERROR_CODES.INVALID_MIN_MAX]: 'الحد الأدنى لا يمكن أن يكون أكبر من الحد الأقصى',
  [ERROR_CODES.DUPLICATE_GROUP]: 'هذه المجموعة مضافة بالفعل',
  [ERROR_CODES.INVALID_DATA]: 'البيانات غير صالحة',
};

// ============================================================================
// Warning Messages (Arabic)
// ============================================================================

/**
 * Arabic warning messages mapped to warning codes
 */
export const WARNING_MESSAGES: Record<WarningCode, string> = {
  [WARNING_CODES.REQUIRED_MIN_ZERO]: 'المجموعة مطلوبة لكن الحد الأدنى صفر - سيتم تعديله تلقائياً إلى 1',
  [WARNING_CODES.MAX_EXCEEDS_OPTIONS]: 'الحد الأقصى أكبر من عدد الخيارات المتاحة',
  [WARNING_CODES.NO_OPTION_GROUPS]: 'المنتج قابل للتخصيص لكن لا توجد مجموعات خيارات',
  [WARNING_CODES.NO_DEFAULT_CONTAINER]: 'لم يتم تحديد حاوية افتراضية',
  [WARNING_CODES.NO_DEFAULT_SIZE]: 'لم يتم تحديد مقاس افتراضي',
  [WARNING_CODES.POTENTIAL_ISSUE]: 'قد تكون هناك مشكلة محتملة',
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Creates an empty validation result (valid with no errors/warnings)
 */
export function createEmptyValidationResult(): ValidationResult {
  return {
    isValid: true,
    errors: [],
    warnings: [],
  };
}

/**
 * Creates a validation error object
 */
export function createValidationError(
  field: string,
  code: ErrorCode,
  message?: string
): ValidationError {
  return {
    field,
    code,
    message: message || ERROR_MESSAGES[code],
  };
}

/**
 * Creates a validation warning object
 */
export function createValidationWarning(
  field: string,
  code: WarningCode,
  message?: string
): ValidationWarning {
  return {
    field,
    code,
    message: message || WARNING_MESSAGES[code],
  };
}

/**
 * Merges multiple validation results into one
 */
export function mergeValidationResults(...results: ValidationResult[]): ValidationResult {
  const merged: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
  };

  for (const result of results) {
    merged.errors.push(...result.errors);
    merged.warnings.push(...result.warnings);
  }

  merged.isValid = merged.errors.length === 0;
  return merged;
}
