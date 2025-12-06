# Design Document

## Overview

تبسيط واجهات الأدمن للمنتجات والخيارات مع الحفاظ على التكامل بينهما. التصميم يتبع نمط صفحة الكوبونات البسيط والفعال.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Admin Dashboard                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────┐    ┌─────────────────┐                 │
│  │  ProductsPage   │    │   OptionsPage   │                 │
│  │  (index.tsx)    │    │   (index.tsx)   │                 │
│  └────────┬────────┘    └────────┬────────┘                 │
│           │                      │                           │
│           ▼                      ▼                           │
│  ┌─────────────────┐    ┌─────────────────┐                 │
│  │  ProductCard    │    │ OptionGroupCard │                 │
│  └────────┬────────┘    └────────┬────────┘                 │
│           │                      │                           │
│           ▼                      ├──────────────┐            │
│  ┌─────────────────┐    ┌───────▼───────┐ ┌────▼─────┐     │
│  │ProductFormModal │    │GroupFormModal │ │OptionItem│     │
│  │ (Simple Modal)  │    │(Simple Modal) │ └──────────┘     │
│  └─────────────────┘    └───────────────┘                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. ProductsPage (index.tsx)

```typescript
interface ProductsPageProps {
  onRefresh?: () => void;
}

// State
const [products, setProducts] = useState<Product[]>([]);
const [searchQuery, setSearchQuery] = useState('');
const [categoryFilter, setCategoryFilter] = useState<string>('all');
const [showModal, setShowModal] = useState(false);
const [editingProduct, setEditingProduct] = useState<Product | null>(null);
const [optionGroups, setOptionGroups] = useState<OptionGroupInfo[]>([]);
```

### 2. ProductCard

```typescript
interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onToggleAvailability: (product: Product) => void;
}
```

### 3. ProductFormModal (Simplified)

```typescript
interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingProduct: Product | null;
  onSubmit: (data: ProductFormData) => Promise<void>;
  optionGroups: OptionGroupInfo[];
}

// Sections (no tabs):
// 1. Basic Info Section
// 2. Option Groups Assignment Section  
// 3. Nutrition Section (collapsible)
```

### 4. OptionsPage (index.tsx)

```typescript
interface OptionsPageProps {
  // No props needed - self-contained
}

// State
const [optionGroups, setOptionGroups] = useState<OptionGroup[]>([]);
const [searchQuery, setSearchQuery] = useState('');
const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
const [showGroupModal, setShowGroupModal] = useState(false);
const [showOptionModal, setShowOptionModal] = useState(false);
const [editingGroup, setEditingGroup] = useState<OptionGroup | null>(null);
const [editingOption, setEditingOption] = useState<Option | null>(null);
```

### 5. OptionGroupCard

```typescript
interface OptionGroupCardProps {
  group: OptionGroup;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onEditGroup: (group: OptionGroup) => void;
  onDeleteGroup: (id: string) => void;
  onAddOption: (groupId: string) => void;
  onEditOption: (option: Option) => void;
  onDeleteOption: (id: string) => void;
  onToggleOptionAvailability: (option: Option) => void;
}
```

### 6. GroupFormModal (Simplified)

```typescript
interface GroupFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingGroup: OptionGroup | null;
  onSubmit: (data: OptionGroupFormData) => Promise<void>;
}

// Fields only:
// - id (create only)
// - name_ar, name_en
// - icon (emoji picker)
// - display_order
// NO UIConfigEditor tab
```

### 7. OptionFormModal

```typescript
interface OptionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  editingOption: Option | null;
  onSubmit: (data: OptionFormData) => Promise<void>;
}

// Fields:
// - id, name_ar, name_en
// - base_price, image
// - available toggle
// - Nutrition (collapsible): calories, protein, carbs, fat, sugar, fiber
```

## Data Models

### ProductFormData (Simplified)

```typescript
interface ProductFormData {
  id: string;
  name: string;
  nameEn: string;
  category: string;
  price: string;
  image: string;
  badge: string;
  available: number;
  template_id: 'template_1'; // Always default
  // Option Groups Assignment
  optionGroupAssignments: OptionGroupAssignment[];
  // Nutrition (optional)
  calories?: string;
  protein?: string;
  carbs?: string;
  fat?: string;
  sugar?: string;
  fiber?: string;
}
```

### OptionGroupAssignment

```typescript
interface OptionGroupAssignment {
  groupId: string;
  isRequired: boolean;
  minSelections: number;
  maxSelections: number;
  displayOrder: number;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Stats Calculation Accuracy
*For any* list of products, the stats cards SHALL correctly calculate: total count, available count (where available=1), unavailable count (where available=0)
**Validates: Requirements 1.3**

### Property 2: Default Template Assignment
*For any* product form submission, the submitted data SHALL always have template_id='template_1'
**Validates: Requirements 2.6**

### Property 3: Option Groups Display Completeness
*For any* set of option groups in the database, the Option Groups Assignment section SHALL display all of them as checkboxes
**Validates: Requirements 2.3**

### Property 4: OptionGroupCard Content Completeness
*For any* OptionGroupCard, it SHALL display: group name (name_ar), icon, options count equal to group.options.length
**Validates: Requirements 3.2**

### Property 5: Option Group Sync Between Pages
*For any* option_group created in OptionsPage, it SHALL appear in ProductsPage Option Groups Assignment within the same session
**Validates: Requirements 5.1**

### Property 6: Cascade Delete on Option Group Removal
*For any* option_group deleted from OptionsPage, all product_options referencing it SHALL be removed
**Validates: Requirements 5.2**

## Error Handling

1. **Form Validation**: Inline error messages with red borders on invalid fields
2. **API Errors**: Toast notifications with Arabic error messages
3. **Loading States**: Skeleton loaders during data fetch
4. **Empty States**: Helpful messages with action buttons

## Testing Strategy

### Unit Tests
- ProductCard renders correctly with all props
- Stats calculation functions
- Form validation logic

### Property-Based Tests
- Use fast-check library for TypeScript
- Minimum 100 iterations per property
- Tag format: **Feature: admin-simplification, Property {number}: {property_text}**

### Integration Tests
- Option group creation reflects in products page
- Product form submission with option groups
- Delete cascade behavior
