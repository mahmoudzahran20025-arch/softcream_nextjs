# Design Document: Option Groups Management

## Overview

صفحة إدارة مجموعات الخيارات في لوحة تحكم الأدمن. تتيح للأدمن إنشاء وإدارة مجموعات الخيارات (نكهات، إضافات، صوصات، إلخ) وإضافة خيارات فردية لكل مجموعة.

### البنية العامة

```
┌─────────────────────────────────────────────────────────────────┐
│                    صفحة إدارة الخيارات                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  🔍 بحث...                    [+ إضافة مجموعة جديدة]    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 🍦 نكهات الآيس كريم (12 خيار)              [✏️] [🗑️]   │   │
│  │  ├── فانيليا - 0 ج                         [✏️] [🗑️]   │   │
│  │  ├── شوكولاتة - 0 ج                        [✏️] [🗑️]   │   │
│  │  └── [+ إضافة خيار]                                     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 🧁 إضافات الميلك شيك (8 خيارات)            [✏️] [🗑️]   │   │
│  │  ├── أوريو - 5 ج                           [✏️] [🗑️]   │   │
│  │  └── [+ إضافة خيار]                                     │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Architecture

### Component Structure

```
src/components/admin/
├── options/
│   ├── index.tsx              # Main page component
│   ├── OptionGroupCard.tsx    # Card for each option group
│   ├── OptionItem.tsx         # Row for each option
│   ├── GroupFormModal.tsx     # Create/Edit group modal
│   ├── OptionFormModal.tsx    # Create/Edit option modal
│   ├── DeleteConfirmModal.tsx # Delete confirmation modal
│   └── types.ts               # TypeScript types
└── CustomizationSettingsPage.tsx  # Re-export from options/
```

### Data Flow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Frontend   │────▶│   API Layer  │────▶│   Backend    │
│   (React)    │◀────│  (products.  │◀────│  (Workers)   │
│              │     │   api.ts)    │     │              │
└──────────────┘     └──────────────┘     └──────────────┘
```

## Components and Interfaces

### OptionsPage (Main Component)

```typescript
interface OptionsPageState {
  optionGroups: OptionGroup[];
  isLoading: boolean;
  searchQuery: string;
  expandedGroups: Set<string>;
  showGroupModal: boolean;
  showOptionModal: boolean;
  editingGroup: OptionGroup | null;
  editingOption: Option | null;
  selectedGroupId: string | null;
}
```

### OptionGroupCard

```typescript
interface OptionGroupCardProps {
  group: OptionGroup;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onAddOption: () => void;
  onEditOption: (option: Option) => void;
  onDeleteOption: (optionId: string) => void;
  onToggleOptionAvailability: (optionId: string, available: boolean) => void;
}
```

### GroupFormModal

```typescript
interface GroupFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingGroup: OptionGroup | null;
  onSubmit: (data: OptionGroupFormData) => Promise<void>;
}

interface OptionGroupFormData {
  id: string;
  name_ar: string;
  name_en: string;
  description_ar?: string;
  description_en?: string;
  icon: string;
  display_order: number;
}
```

### OptionFormModal

```typescript
interface OptionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  editingOption: Option | null;
  onSubmit: (data: OptionFormData) => Promise<void>;
}

interface OptionFormData {
  id: string;
  group_id: string;
  name_ar: string;
  name_en: string;
  description_ar?: string;
  description_en?: string;
  base_price: number;
  image?: string;
  display_order: number;
  available: boolean;
  // Nutrition
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  sugar: number;
  fiber: number;
}
```

## Data Models

### OptionGroup

```typescript
interface OptionGroup {
  id: string;
  name_ar: string;
  name_en: string;
  description_ar?: string;
  description_en?: string;
  display_order: number;
  icon: string;
  options: Option[];
}
```

### Option

```typescript
interface Option {
  id: string;
  group_id: string;
  name_ar: string;
  name_en: string;
  description_ar?: string;
  description_en?: string;
  base_price: number;
  image?: string;
  available: number;
  display_order: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  sugar: number;
  fiber: number;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Option Groups Display Correctly
*For any* list of option groups, the rendered component SHALL display all groups with their names, icons, and correct options count, sorted by display_order.
**Validates: Requirements 1.1, 1.3, 1.4**

### Property 2: Create Option Group Validation
*For any* option group form submission, if required fields (id, name_ar, name_en, icon) are missing or empty, the form SHALL prevent submission and display validation errors.
**Validates: Requirements 2.2, 2.4**

### Property 3: Edit Option Group Form Population
*For any* existing option group, when editing, the form SHALL be pre-filled with all current values and the ID field SHALL be disabled.
**Validates: Requirements 3.1, 3.3**

### Property 4: Delete Option Group with Products Prevention
*For any* option group that is linked to products, attempting to delete SHALL fail and display an error message.
**Validates: Requirements 4.3, 4.4**

### Property 5: Create Option Validation
*For any* option form submission, if required fields (id, name_ar, name_en) are missing or price is negative, the form SHALL prevent submission.
**Validates: Requirements 5.2, 5.5, 6.4**

### Property 6: Edit Option Form Population
*For any* existing option, when editing, the form SHALL be pre-filled with all current values including nutrition fields.
**Validates: Requirements 6.1, 6.3**

### Property 7: Delete Option Updates Count
*For any* option deletion, the parent group's options count SHALL decrease by 1.
**Validates: Requirements 7.2, 7.3**

### Property 8: Toggle Availability Updates State
*For any* availability toggle action, the option's available status SHALL be updated immediately in the UI.
**Validates: Requirements 8.1**

### Property 9: Search Filters Results
*For any* search query, the displayed groups and options SHALL only include items whose names contain the search text.
**Validates: Requirements 9.2**

## Error Handling

### API Errors

| Error | Cause | Response |
|-------|-------|----------|
| 409 Conflict | Duplicate ID | "المعرف موجود مسبقاً" |
| 400 Bad Request | Invalid data | "بيانات غير صالحة" |
| 404 Not Found | Item not found | "العنصر غير موجود" |
| 500 Server Error | Server issue | "حدث خطأ في الخادم" |

### Validation Errors

- Required field empty: "هذا الحقل مطلوب"
- Invalid price: "السعر يجب أن يكون رقماً موجباً"
- Invalid ID format: "المعرف يجب أن يكون بالإنجليزية بدون مسافات"

## Testing Strategy

### Property-Based Testing Library
- **Library**: `fast-check` (JavaScript)
- **Minimum Iterations**: 100

### Unit Tests
- Form validation logic
- Search/filter functionality
- State management

### Property-Based Tests
- Option groups display with various data shapes
- Form validation with random inputs
- Search filtering with random queries

### Integration Tests
- API calls for CRUD operations
- Error handling scenarios
