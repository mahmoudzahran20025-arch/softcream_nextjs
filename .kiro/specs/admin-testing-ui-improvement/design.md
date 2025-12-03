# Design Document

## Overview

هذا التصميم يغطي ثلاثة محاور رئيسية:
1. **اختبارات سريعة** للتحقق من الجداول والتغييرات الأخيرة
2. **ربط الأدمن بالنظام الجديد** (Templates, UI Config)
3. **تحسين واجهات الأدمن** (OptionsPage, ProductsPage)

### الهدف
- التأكد من أن الأساس (Backend) سليم
- تحديث الأدمن ليستخدم النظام الجديد
- تحسين تجربة المستخدم للمدير

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Admin Dashboard                         │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐    ┌─────────────────┐                 │
│  │   OptionsPage   │    │  ProductsPage   │                 │
│  │  (Enhanced)     │    │  (Enhanced)     │                 │
│  └────────┬────────┘    └────────┬────────┘                 │
│           │                      │                           │
│  ┌────────▼────────┐    ┌────────▼────────┐                 │
│  │ OptionGroupCard │    │ UnifiedProduct  │                 │
│  │ + DynamicIcon   │    │ Form + Template │                 │
│  │ + UIConfigEditor│    │ Selector        │                 │
│  └────────┬────────┘    └────────┬────────┘                 │
│           │                      │                           │
│           └──────────┬───────────┘                          │
│                      │                                       │
│           ┌──────────▼───────────┐                          │
│           │    Admin API Layer   │                          │
│           │  (products.api.ts,   │                          │
│           │   options.api.ts)    │                          │
│           └──────────┬───────────┘                          │
└──────────────────────┼──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                    Backend API                               │
├─────────────────────────────────────────────────────────────┤
│  /admin/products     /admin/options     /admin/templates    │
│  - CRUD + template   - CRUD + ui_config - List templates    │
│  - expand=template   - reorder          - Get by id         │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                    Database (D1)                             │
├─────────────────────────────────────────────────────────────┤
│  product_templates   option_groups      products            │
│  - id, name         - id, ui_config    - template_id        │
│  - complexity       - display_style    - card_style         │
│  - ui_config        - icon             - ui_config          │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. اختبارات الجداول (SQL Queries)

```sql
-- Test 1.1: Verify product_templates
SELECT id, name, complexity_level, ui_config 
FROM product_templates;
-- Expected: 3 rows (template_1, template_2, template_3)

-- Test 1.2: Verify option_groups with ui_config
SELECT id, name_ar, ui_config 
FROM option_groups 
WHERE ui_config IS NOT NULL;

-- Test 1.3: Verify products schema
SELECT id, name, template_id, card_style 
FROM products 
LIMIT 5;

-- Test 1.4: Verify product_options uses option_group_id
SELECT column_name 
FROM pragma_table_info('product_options') 
WHERE column_name = 'option_group_id';
```

### 2. Template Selector Component

```typescript
// src/components/admin/products/TemplateSelector.tsx
interface TemplateSelectorProps {
  value: string | null;
  onChange: (templateId: string) => void;
  templates: ProductTemplate[];
}

interface ProductTemplate {
  id: string;
  name: string;
  name_ar: string;
  complexity_level: 'simple' | 'medium' | 'complex';
  description: string;
  suggested_groups: string[]; // group IDs
}
```

### 3. UI Config Editor Component

```typescript
// src/components/admin/options/UIConfigEditor.tsx
interface UIConfigEditorProps {
  value: UIConfig;
  onChange: (config: UIConfig) => void;
  onPreview: () => void;
}

interface UIConfig {
  display_style: 'cards' | 'pills' | 'list' | 'checkbox';
  icon?: IconConfig;
  colors?: {
    primary?: string;
    secondary?: string;
    background?: string;
  };
  layout?: {
    columns?: number;
    gap?: string;
  };
}

interface IconConfig {
  type: 'emoji' | 'lucide' | 'image';
  value: string;
  animation?: 'pulse' | 'bounce' | 'spin' | 'none';
}
```

### 4. Enhanced OptionGroupCard

```typescript
// Updates to src/components/admin/options/OptionGroupCard.tsx
interface EnhancedOptionGroupCardProps {
  group: OptionGroup;
  // ... existing props
  onEditUIConfig: () => void;
  renderIcon: () => ReactNode; // Uses DynamicIcon
}
```

### 5. Enhanced ProductCard

```typescript
// Updates to src/components/admin/products/ProductCard.tsx
interface EnhancedProductCardProps {
  product: Product;
  // ... existing props
  templateBadge?: {
    name: string;
    color: string;
  };
  optionGroupsCount: number;
}
```

## Data Models

### ProductTemplate (from backend)

```typescript
interface ProductTemplate {
  id: string;                    // 'template_1', 'template_2', 'template_3'
  name: string;                  // 'Simple', 'Medium', 'Complex'
  name_ar: string;               // 'بسيط', 'متوسط', 'معقد'
  complexity_level: string;      // 'simple', 'medium', 'complex'
  description: string;
  description_ar: string;
  ui_config: string;             // JSON string
  card_preview_config: string;   // JSON string
  suggested_option_groups: string[]; // ['containers', 'sizes', 'flavors']
}
```

### OptionGroup (enhanced)

```typescript
interface OptionGroup {
  id: string;
  name_ar: string;
  name_en: string;
  description_ar?: string;
  description_en?: string;
  display_style: 'cards' | 'pills' | 'list' | 'checkbox';
  display_order: number;
  icon?: string;                 // emoji, lucide name, or URL
  ui_config?: UIConfig;          // Parsed JSON
  is_required: number;
  min_selections: number;
  max_selections: number;
  options: Option[];
}
```

### Product (enhanced)

```typescript
interface Product {
  id: string;
  name: string;
  nameEn?: string;
  category: string;
  price: number;
  // ... existing fields
  
  // New fields
  template_id?: string;          // Reference to product_templates
  card_style?: string;           // 'compact', 'standard', 'wizard'
  ui_config?: string;            // JSON for custom styling
  
  // Enriched data (from expand=template)
  template_config?: ProductTemplate;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

Based on the prework analysis, the following properties are testable:

### Property 1: Template Persistence Round-Trip
*For any* product saved with a template_id, fetching that product should return the same template_id.
**Validates: Requirements 2.4**

### Property 2: Template Suggestions Relevance
*For any* template selection, the suggested option groups should be appropriate for that template's complexity level (e.g., Complex templates suggest more groups than Simple).
**Validates: Requirements 2.5, 5.4**

### Property 3: Icon Format Acceptance
*For any* valid icon format (emoji, lucide name, or image URL), the system should accept and save it in ui_config.
**Validates: Requirements 3.3**

### Property 4: UI Config JSON Validation
*For any* ui_config input, if the JSON is invalid the system should reject it, and if valid the system should accept and persist it.
**Validates: Requirements 3.4**

### Property 5: Display Order Persistence
*For any* reorder operation on option groups, the display_order values should update correctly and persist.
**Validates: Requirements 4.4**

### Property 6: Search Highlighting
*For any* search query, all matching text in results (Arabic or English) should be highlighted.
**Validates: Requirements 4.5**

### Property 7: Template Badge Display
*For any* product with a template_id, the product card should display the corresponding template badge.
**Validates: Requirements 5.1**

### Property 8: Option Groups Count Accuracy
*For any* product, the displayed option groups count should match the actual number of assigned groups in product_options.
**Validates: Requirements 5.2**

### Property 9: Template-Options Compatibility
*For any* product save operation, the system should validate that assigned option groups are compatible with the selected template.
**Validates: Requirements 5.5**

## Error Handling

### API Errors
```typescript
// src/lib/admin/errorMessages.ts
const ERROR_MESSAGES = {
  TEMPLATE_NOT_FOUND: 'القالب غير موجود',
  INVALID_UI_CONFIG: 'إعدادات العرض غير صالحة',
  TEMPLATE_INCOMPATIBLE: 'القالب غير متوافق مع الخيارات المحددة',
  SAVE_FAILED: 'فشل في الحفظ، حاول مرة أخرى',
  LOAD_FAILED: 'فشل في تحميل البيانات',
};
```

### Validation Errors
- Template selection required for customizable products
- UI Config must be valid JSON
- Icon format must be emoji, lucide name, or valid URL

## Testing Strategy

### Unit Tests
- Template selector renders all templates
- UI Config editor validates JSON
- DynamicIcon renders all icon types
- Search highlighting works for Arabic text

### Property-Based Tests (using fast-check)
Each correctness property will be implemented as a property-based test:

1. **Property 1**: Generate random products with templates, save, fetch, verify template_id matches
2. **Property 2**: Generate random template selections, verify suggestions match complexity
3. **Property 3**: Generate random icon formats, verify acceptance/rejection
4. **Property 4**: Generate random JSON strings, verify validation behavior
5. **Property 5**: Generate random reorder operations, verify display_order updates
6. **Property 6**: Generate random search queries, verify highlighting
7. **Property 7**: Generate random products with templates, verify badge display
8. **Property 8**: Generate random products with options, verify count accuracy
9. **Property 9**: Generate random template-options combinations, verify compatibility validation

### Test Configuration
```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    // Run property tests with 100 iterations minimum
    testTimeout: 30000,
  },
});
```

### Test Annotation Format
Each property-based test will be annotated with:
```typescript
/**
 * **Feature: admin-testing-ui-improvement, Property 1: Template Persistence Round-Trip**
 * **Validates: Requirements 2.4**
 */
```
