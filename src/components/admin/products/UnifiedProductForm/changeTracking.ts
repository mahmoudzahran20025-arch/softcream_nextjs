/**
 * Change Tracking Utilities
 * 
 * Functions for tracking and computing differences between original
 * and current product data in the UnifiedProductForm.
 * 
 * @module admin/products/UnifiedProductForm/changeTracking
 * Requirements: 2.2 - Show preview of changes before saving
 */

import type {
  UnifiedProductData,
  ProductFormData,
  OptionGroupAssignment,
  ContainerAssignment,
  SizeAssignment,
  ChangesSummary,
  ProductDetailChange,
  OptionGroupChange,
  ContainerChange,
  SizeChange,
  OptionGroupInfo,
  ContainerInfo,
  SizeInfo,
  EMPTY_CHANGES_SUMMARY,
} from './types';

/**
 * Product field labels for display in change preview
 */
const PRODUCT_FIELD_LABELS: Record<string, string> = {
  id: 'معرف المنتج',
  name: 'اسم المنتج',
  nameEn: 'الاسم بالإنجليزية',
  category: 'الفئة',
  categoryEn: 'الفئة بالإنجليزية',
  price: 'السعر',
  description: 'الوصف',
  descriptionEn: 'الوصف بالإنجليزية',
  image: 'الصورة',
  badge: 'الشارة',
  available: 'متاح',
  product_type: 'نوع المنتج',
  calories: 'السعرات الحرارية',
  protein: 'البروتين',
  carbs: 'الكربوهيدرات',
  fat: 'الدهون',
  sugar: 'السكر',
  fiber: 'الألياف',
  energy_type: 'نوع الطاقة',
  energy_score: 'درجة الطاقة',
  tags: 'الوسوم',
  ingredients: 'المكونات',
  nutrition_facts: 'القيم الغذائية',
  allergens: 'مسببات الحساسية',
  health_keywords: 'الكلمات الصحية',
  health_benefit_ar: 'الفائدة الصحية',
};

/**
 * Fields to track for product detail changes
 */
const TRACKED_PRODUCT_FIELDS: (keyof ProductFormData)[] = [
  'name',
  'nameEn',
  'category',
  'categoryEn',
  'price',
  'description',
  'descriptionEn',
  'image',
  'badge',
  'available',
  'product_type',
  'calories',
  'protein',
  'carbs',
  'fat',
  'sugar',
  'fiber',
  'energy_type',
  'energy_score',
];

/**
 * Compare two values for equality (handles arrays)
 */
function areValuesEqual(a: unknown, b: unknown): boolean {
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((val, idx) => val === b[idx]);
  }
  return a === b;
}

/**
 * Compute changes to product details
 */
function computeProductChanges(
  original: ProductFormData,
  current: ProductFormData
): ProductDetailChange[] {
  const changes: ProductDetailChange[] = [];

  for (const field of TRACKED_PRODUCT_FIELDS) {
    const originalValue = original[field];
    const currentValue = current[field];

    if (!areValuesEqual(originalValue, currentValue)) {
      changes.push({
        field,
        fieldLabel: PRODUCT_FIELD_LABELS[field] || field,
        originalValue: originalValue as string | number,
        currentValue: currentValue as string | number,
      });
    }
  }

  return changes;
}

/**
 * Compute changes to option group assignments
 * Requirement 2.3: Warn if removing required groups
 */
function computeOptionGroupChanges(
  original: OptionGroupAssignment[],
  current: OptionGroupAssignment[],
  optionGroups: OptionGroupInfo[]
): OptionGroupChange[] {
  const changes: OptionGroupChange[] = [];
  const originalMap = new Map(original.map(a => [a.groupId, a]));
  const currentMap = new Map(current.map(a => [a.groupId, a]));

  // Find removed groups
  for (const [groupId, originalAssignment] of originalMap) {
    if (!currentMap.has(groupId)) {
      const groupInfo = optionGroups.find(g => g.id === groupId);
      changes.push({
        type: 'removed',
        groupId,
        groupName: groupInfo?.name || groupId,
        original: originalAssignment,
        wasRequired: originalAssignment.isRequired,
      });
    }
  }

  // Find added groups
  for (const [groupId, currentAssignment] of currentMap) {
    if (!originalMap.has(groupId)) {
      const groupInfo = optionGroups.find(g => g.id === groupId);
      changes.push({
        type: 'added',
        groupId,
        groupName: groupInfo?.name || groupId,
        current: currentAssignment,
      });
    }
  }

  // Find modified groups
  for (const [groupId, currentAssignment] of currentMap) {
    const originalAssignment = originalMap.get(groupId);
    if (originalAssignment) {
      const isModified =
        originalAssignment.isRequired !== currentAssignment.isRequired ||
        originalAssignment.minSelections !== currentAssignment.minSelections ||
        originalAssignment.maxSelections !== currentAssignment.maxSelections ||
        originalAssignment.displayOrder !== currentAssignment.displayOrder ||
        originalAssignment.priceOverride !== currentAssignment.priceOverride;

      if (isModified) {
        const groupInfo = optionGroups.find(g => g.id === groupId);
        changes.push({
          type: 'modified',
          groupId,
          groupName: groupInfo?.name || groupId,
          original: originalAssignment,
          current: currentAssignment,
        });
      }
    }
  }

  return changes;
}

/**
 * Compute changes to container assignments
 */
function computeContainerChanges(
  original: ContainerAssignment[],
  current: ContainerAssignment[],
  containers: ContainerInfo[]
): ContainerChange[] {
  const changes: ContainerChange[] = [];
  const originalMap = new Map(original.map(a => [a.containerId, a]));
  const currentMap = new Map(current.map(a => [a.containerId, a]));

  // Find removed containers
  for (const [containerId, originalAssignment] of originalMap) {
    if (!currentMap.has(containerId)) {
      const containerInfo = containers.find(c => c.id === containerId);
      changes.push({
        type: 'removed',
        containerId,
        containerName: containerInfo?.name || containerId,
        original: originalAssignment,
      });
    }
  }

  // Find added containers
  for (const [containerId, currentAssignment] of currentMap) {
    if (!originalMap.has(containerId)) {
      const containerInfo = containers.find(c => c.id === containerId);
      changes.push({
        type: 'added',
        containerId,
        containerName: containerInfo?.name || containerId,
        current: currentAssignment,
      });
    }
  }

  // Find modified containers (default changed)
  for (const [containerId, currentAssignment] of currentMap) {
    const originalAssignment = originalMap.get(containerId);
    if (originalAssignment && originalAssignment.isDefault !== currentAssignment.isDefault) {
      const containerInfo = containers.find(c => c.id === containerId);
      changes.push({
        type: 'modified',
        containerId,
        containerName: containerInfo?.name || containerId,
        original: originalAssignment,
        current: currentAssignment,
      });
    }
  }

  return changes;
}

/**
 * Compute changes to size assignments
 */
function computeSizeChanges(
  original: SizeAssignment[],
  current: SizeAssignment[],
  sizes: SizeInfo[]
): SizeChange[] {
  const changes: SizeChange[] = [];
  const originalMap = new Map(original.map(a => [a.sizeId, a]));
  const currentMap = new Map(current.map(a => [a.sizeId, a]));

  // Find removed sizes
  for (const [sizeId, originalAssignment] of originalMap) {
    if (!currentMap.has(sizeId)) {
      const sizeInfo = sizes.find(s => s.id === sizeId);
      changes.push({
        type: 'removed',
        sizeId,
        sizeName: sizeInfo?.name || sizeId,
        original: originalAssignment,
      });
    }
  }

  // Find added sizes
  for (const [sizeId, currentAssignment] of currentMap) {
    if (!originalMap.has(sizeId)) {
      const sizeInfo = sizes.find(s => s.id === sizeId);
      changes.push({
        type: 'added',
        sizeId,
        sizeName: sizeInfo?.name || sizeId,
        current: currentAssignment,
      });
    }
  }

  // Find modified sizes (default changed)
  for (const [sizeId, currentAssignment] of currentMap) {
    const originalAssignment = originalMap.get(sizeId);
    if (originalAssignment && originalAssignment.isDefault !== currentAssignment.isDefault) {
      const sizeInfo = sizes.find(s => s.id === sizeId);
      changes.push({
        type: 'modified',
        sizeId,
        sizeName: sizeInfo?.name || sizeId,
        original: originalAssignment,
        current: currentAssignment,
      });
    }
  }

  return changes;
}

/**
 * Compute all changes between original and current unified product data
 * 
 * @param original - The original data when form was opened
 * @param current - The current data in the form
 * @param optionGroups - Available option groups for name lookup
 * @param containers - Available containers for name lookup
 * @param sizes - Available sizes for name lookup
 * @returns ChangesSummary with all detected changes
 * 
 * Requirement 2.2: Show preview of changes before saving
 */
export function getChanges(
  original: UnifiedProductData,
  current: UnifiedProductData,
  optionGroups: OptionGroupInfo[],
  containers: ContainerInfo[],
  sizes: SizeInfo[]
): ChangesSummary {
  const productChanges = computeProductChanges(original.product, current.product);
  const optionGroupChanges = computeOptionGroupChanges(
    original.optionGroupAssignments,
    current.optionGroupAssignments,
    optionGroups
  );
  const containerChanges = computeContainerChanges(
    original.containerAssignments,
    current.containerAssignments,
    containers
  );
  const sizeChanges = computeSizeChanges(
    original.sizeAssignments,
    current.sizeAssignments,
    sizes
  );

  // Check if any required groups are being removed (Requirement 2.3)
  const hasRequiredGroupRemoval = optionGroupChanges.some(
    change => change.type === 'removed' && change.wasRequired
  );

  const hasChanges =
    productChanges.length > 0 ||
    optionGroupChanges.length > 0 ||
    containerChanges.length > 0 ||
    sizeChanges.length > 0;

  return {
    hasChanges,
    productChanges,
    optionGroupChanges,
    containerChanges,
    sizeChanges,
    hasRequiredGroupRemoval,
  };
}

/**
 * Create a deep clone of UnifiedProductData for storing original state
 */
export function cloneUnifiedProductData(data: UnifiedProductData): UnifiedProductData {
  return {
    product: { ...data.product, health_keywords: [...data.product.health_keywords] },
    optionGroupAssignments: data.optionGroupAssignments.map(a => ({ ...a })),
    containerAssignments: data.containerAssignments.map(a => ({ ...a })),
    sizeAssignments: data.sizeAssignments.map(a => ({ ...a })),
  };
}
