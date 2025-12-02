/**
 * API Error Messages - Arabic translations for API errors
 * 
 * Provides meaningful error messages for admin panel users
 * Requirements: 5.5 - Display meaningful error messages to the admin
 */

/**
 * Common API error patterns and their Arabic translations
 */
export const API_ERROR_MESSAGES: Record<string, string> = {
  // Product errors
  'Product ID already exists': 'معرف المنتج موجود بالفعل. اختر معرفًا مختلفًا.',
  'Product not found': 'المنتج غير موجود.',
  'Missing required fields': 'بعض الحقول المطلوبة مفقودة.',
  'No fields to update': 'لا توجد حقول للتحديث.',
  'Failed to create product': 'فشل إنشاء المنتج. حاول مرة أخرى.',
  'Failed to update product': 'فشل تحديث المنتج. حاول مرة أخرى.',
  'Failed to delete product': 'فشل حذف المنتج. حاول مرة أخرى.',
  'Failed to save product': 'فشل حفظ المنتج. حاول مرة أخرى.',
  'Failed to fetch products': 'فشل تحميل المنتجات. حاول مرة أخرى.',
  'Failed to update product availability': 'فشل تحديث حالة توفر المنتج.',
  
  // Option group errors - Requirements: 2.5, 3.4, 4.3
  'Duplicate option group assignment': 'مجموعة الخيارات مُعينة بالفعل لهذا المنتج.',
  'Invalid reference': 'مرجع غير صالح. تأكد من وجود مجموعات الخيارات المحددة.',
  'Option group ID already exists': 'المعرف موجود مسبقاً. اختر معرفًا مختلفًا.',
  'Option group not found': 'مجموعة الخيارات غير موجودة.',
  'Failed to create option group': 'فشل إنشاء مجموعة الخيارات. حاول مرة أخرى.',
  'Failed to update option group': 'فشل تحديث مجموعة الخيارات. حاول مرة أخرى.',
  'Failed to delete option group': 'فشل حذف مجموعة الخيارات. حاول مرة أخرى.',
  'Option group is linked to products': 'لا يمكن حذف المجموعة لأنها مرتبطة بمنتجات.',
  'Cannot delete option group with products': 'لا يمكن حذف المجموعة لأنها مرتبطة بمنتجات.',
  
  // Option errors - Requirements: 5.6, 8.3
  'Option ID already exists': 'المعرف موجود مسبقاً. اختر معرفًا مختلفًا.',
  'Option not found': 'الخيار غير موجود.',
  'Failed to create option': 'فشل إنشاء الخيار. حاول مرة أخرى.',
  'Failed to update option': 'فشل تحديث الخيار. حاول مرة أخرى.',
  'Failed to delete option': 'فشل حذف الخيار. حاول مرة أخرى.',
  'Failed to toggle availability': 'فشل تحديث حالة التوفر. حاول مرة أخرى.',
  'Invalid price': 'السعر يجب أن يكون رقماً موجباً.',
  
  // Container errors
  'Duplicate container assignment': 'الحاوية مُعينة بالفعل لهذا المنتج.',
  
  // Size errors
  'Duplicate size assignment': 'المقاس مُعين بالفعل لهذا المنتج.',
  
  // Configuration errors
  'Failed to fetch configuration': 'فشل تحميل إعدادات المنتج.',
  'Failed to update customization': 'فشل تحديث إعدادات التخصيص.',
  'Failed to fetch product data': 'فشل تحميل بيانات المنتج.',
  
  // Bulk operation errors
  'Bulk assignment failed': 'فشل التعيين الجماعي.',
  
  // Network errors
  'Network Error': 'خطأ في الاتصال. تحقق من اتصالك بالإنترنت.',
  'Failed to fetch': 'فشل الاتصال بالخادم. تحقق من اتصالك بالإنترنت.',
  
  // Auth errors
  'Unauthorized': 'غير مصرح. يرجى تسجيل الدخول مرة أخرى.',
  'Forbidden': 'ليس لديك صلاحية لهذا الإجراء.',
  
  // Generic errors
  'Unknown error': 'حدث خطأ غير متوقع.',
  'Internal Server Error': 'خطأ في الخادم. حاول مرة أخرى لاحقًا.',
};

/**
 * HTTP status code messages
 */
export const HTTP_STATUS_MESSAGES: Record<number, string> = {
  400: 'طلب غير صالح. تحقق من البيانات المدخلة.',
  401: 'غير مصرح. يرجى تسجيل الدخول مرة أخرى.',
  403: 'ليس لديك صلاحية لهذا الإجراء.',
  404: 'العنصر المطلوب غير موجود.',
  409: 'تعارض في البيانات. العنصر موجود بالفعل.',
  500: 'خطأ في الخادم. حاول مرة أخرى لاحقًا.',
  502: 'خطأ في الخادم. حاول مرة أخرى لاحقًا.',
  503: 'الخدمة غير متاحة حاليًا. حاول مرة أخرى لاحقًا.',
};

/**
 * Option-specific error messages by HTTP status code
 * Requirements: 2.5, 3.4, 4.3, 5.6, 8.3
 */
export const OPTION_ERROR_MESSAGES: Record<number, string> = {
  400: 'بيانات غير صالحة. تحقق من الحقول المدخلة.',
  404: 'العنصر غير موجود.',
  409: 'المعرف موجود مسبقاً. اختر معرفًا مختلفًا.',
  500: 'حدث خطأ في الخادم. حاول مرة أخرى لاحقًا.',
};

/**
 * Get error message for options API by status code
 * Requirements: 2.5, 3.4, 4.3, 5.6, 8.3
 */
export function getOptionErrorMessage(statusCode: number, fallbackMessage?: string): string {
  return OPTION_ERROR_MESSAGES[statusCode] || HTTP_STATUS_MESSAGES[statusCode] || fallbackMessage || 'حدث خطأ غير متوقع.';
}

/**
 * Translate an API error message to Arabic
 * 
 * @param error - The error object or message string
 * @returns Translated Arabic error message
 */
export function translateApiError(error: unknown): string {
  // Handle Error objects
  if (error instanceof Error) {
    const message = error.message;
    
    // Check for exact match
    if (API_ERROR_MESSAGES[message]) {
      return API_ERROR_MESSAGES[message];
    }
    
    // Check for partial match (error message contains known pattern)
    for (const [pattern, translation] of Object.entries(API_ERROR_MESSAGES)) {
      if (message.toLowerCase().includes(pattern.toLowerCase())) {
        return translation;
      }
    }
    
    // Check for HTTP status code in message
    const httpMatch = message.match(/HTTP (\d{3})/);
    if (httpMatch) {
      const statusCode = parseInt(httpMatch[1], 10);
      if (HTTP_STATUS_MESSAGES[statusCode]) {
        return HTTP_STATUS_MESSAGES[statusCode];
      }
    }
    
    // Return original message if no translation found
    return message;
  }
  
  // Handle string errors
  if (typeof error === 'string') {
    if (API_ERROR_MESSAGES[error]) {
      return API_ERROR_MESSAGES[error];
    }
    
    for (const [pattern, translation] of Object.entries(API_ERROR_MESSAGES)) {
      if (error.toLowerCase().includes(pattern.toLowerCase())) {
        return translation;
      }
    }
    
    return error;
  }
  
  // Handle objects with error property
  if (error && typeof error === 'object' && 'error' in error) {
    return translateApiError((error as { error: unknown }).error);
  }
  
  // Default fallback
  return API_ERROR_MESSAGES['Unknown error'];
}

/**
 * Extract error details from API response
 * 
 * @param error - The error object
 * @returns Object with translated message and optional details
 */
export function extractApiErrorDetails(error: unknown): {
  message: string;
  details?: string;
  fields?: string[];
} {
  const result: { message: string; details?: string; fields?: string[] } = {
    message: translateApiError(error),
  };
  
  // Extract additional details if available
  if (error && typeof error === 'object') {
    const errorObj = error as Record<string, unknown>;
    
    if ('details' in errorObj && typeof errorObj.details === 'string') {
      result.details = errorObj.details;
    }
    
    if ('fields' in errorObj && Array.isArray(errorObj.fields)) {
      result.fields = errorObj.fields as string[];
    }
  }
  
  return result;
}
