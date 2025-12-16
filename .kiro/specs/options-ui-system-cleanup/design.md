# Design Document: Options UI System Cleanup (Frontend)

## Overview

هذا المشروع يهدف إلى تنظيف وتوحيد نظام تخصيص الخيارات في الـ Frontend. سيتم إزالة `AdvancedStyleEditor` من نموذج المنتج، توحيد الحقول في `UIConfig`، وإصلاح Live Preview.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Admin Panel                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────┐         ┌─────────────────┐                │
│  │  Products Tab   │         │  Options Tab    │                │
│  │                 │         │                 │                │
│  │  - Product Info │         │  - Group List   │                │
│  │  - Template     │         │  - UIConfigEditor│ ← Single      │
│  │  - Option Groups│         │  - Live Preview │   Source       │
│  │    (link only)  │         │                 │                │
│  └─────────────────┘         └─────────────────┘                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    Shared Components                             │
├─────────────────────────────────────────────────────────────────┤
│  OptionGroupRenderer → DisplayModeRenderer → OptionRenderer     │
│  DynamicIcon (emoji, lucide, custom)                            │
│  parseUIConfig (with legacy field mapping)                      │
└─────────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. OptionGroupsSection (Modified)

```typescript
// Before: Had palette button that opened AdvancedStyleEditor
// After: Only shows option group assignment, no styling controls

interface OptionGroupsSectionProps {
  assignments: OptionGroupAssignment[];
  onChange: (assignments: OptionGroupAssignment[]) => void;
  availableGroups: OptionGroupInfo[];
  errors?: ValidationError[];
  warnings?: ValidationWarning[];
  productId?: string;
}

// Removed: editingVisualsGroupId state
// Removed: AdvancedStyleEditor modal
// Removed: Palette button
```

### 2. UIConfigEditor (Enhanced)

```typescript
interface UIConfigEditorProps {
  value: UIConfig;
  onChange: (config: UIConfig) => void;
  sampleOptions?: OptionData[];
  showPreview?: boolean;
}

// Sections:
// 1. Display Mode (display_mode)
// 2. Fallback Style (fallback_style)
// 3. Nutrition (nutrition.show, nutrition.format, nutrition.fields)
// 4. Layout (columns, card_size, spacing)
// 5. Content (show_images, show_prices, show_descriptions)
// 6. Icon (ui_config.icon)
// 7. Colors (accent_color)
// 8. Live Preview (using OptionGroupRenderer)
```

### 3. UIConfig Interface (Unified)

```typescript
interface UIConfig {
  // Primary display mode
  display_mode: 'default' | 'hero_flavor' | 'smart_meter' | 'brand_accent';
  
  // Fallback when primary can't render
  fallback_style: 'cards' | 'grid' | 'list' | 'pills' | 'checkbox';
  
  // Layout
  columns?: 1 | 2 | 3 | 4 | 'auto';
  card_size?: 'sm' | 'md' | 'lg';
  spacing?: 'compact' | 'normal' | 'loose';
  
  // Content visibility
  show_images?: boolean;
  show_prices?: boolean;
  show_descriptions?: boolean;      // وصف الخيار الفردي
  show_group_description?: boolean; // NEW: وصف المجموعة (تحت العنوان)
  
  // Nutrition display
  nutrition?: {
    show: boolean;
    format: 'compact' | 'detailed' | 'badges';
    fields: ('calories' | 'protein' | 'carbs' | 'fat')[];
  };
  
  // Icon (unified)
  icon?: {
    type: 'emoji' | 'lucide' | 'custom';
    value: string;
    fallback?: string;
  };
  
  // Styling
  accent_color?: string;
  
  // Legacy fields (for backward compatibility, mapped on parse)
  section_type?: string;  // → display_mode
  display_style?: string; // → fallback_style
  show_macros?: boolean;  // → nutrition.show
}
```

### 4. Group Description Display Logic

```typescript
// OptionGroupRenderer.tsx
// الوصف يظهر بناءً على show_group_description في ui_config

const showGroupDescription = uiConfig.show_group_description ?? true; // default: true

// في الـ header
{showGroupDescription && groupDescription && (
  <p className="text-sm text-slate-500 mt-0.5">
    {groupDescription}
  </p>
)}
```

**ملاحظة**: حالياً الوصف لا يظهر في `cards` و `grid` لأن `DisplayModeRenderer` له header خاص. سيتم إصلاح هذا ليمرر `show_group_description` للـ renderer.

## Data Models

### Legacy Field Mapping

```typescript
const LEGACY_FIELD_MAP = {
  section_type: {
    'default': 'default',
    'hero_selection': 'hero_flavor',
    'interactive_meter': 'smart_meter',
    'compact_addons': 'default'
  },
  display_style: 'fallback_style',
  show_macros: 'nutrition.show'
};
```

### Icon Priority

```typescript
function getEffectiveIcon(group: OptionGroup): IconConfig {
  // Priority: ui_config.icon > option_groups.icon > default
  if (group.ui_config?.icon) {
    return group.ui_config.icon;
  }
  if (group.icon) {
    return { type: 'emoji', value: group.icon };
  }
  return DEFAULT_UI_CONFIG.icon;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Legacy section_type mapping
*For any* ui_config with section_type field, parsing SHALL produce equivalent display_mode value according to the mapping table.
**Validates: Requirements 2.1**

### Property 2: Legacy show_macros mapping
*For any* ui_config with show_macros field, parsing SHALL produce nutrition.show with the same boolean value.
**Validates: Requirements 2.2**

### Property 3: Saved config uses new fields only
*For any* ui_config saved through UIConfigEditor, the output SHALL NOT contain section_type, show_macros, or display_style fields.
**Validates: Requirements 2.3**

### Property 4: Icon saved in ui_config only
*For any* icon set through UIConfigEditor, the icon SHALL be stored in ui_config.icon and NOT in a separate icon field.
**Validates: Requirements 3.1**

### Property 5: Icon priority
*For any* option group with both ui_config.icon and separate icon field, the system SHALL use ui_config.icon.
**Validates: Requirements 3.2**

### Property 6: Fallback mode application
*For any* display_mode that cannot render (e.g., hero_flavor without images), the system SHALL fall back to fallback_style.
**Validates: Requirements 4.2**

### Property 7: Reset restores defaults
*For any* UIConfigEditor state, clicking reset SHALL produce a config equal to DEFAULT_UI_CONFIG.
**Validates: Requirements 5.5**

### Property 8: Template to card mapping
*For any* product with template_id, the system SHALL render the corresponding card component (template_1→SimpleCard, template_2→StandardCard, template_3→BYOCard, template_lifestyle→LifestyleCard).
**Validates: Requirements 6.1**

### Property 9: Template independence
*For any* template change on a product, the option groups' ui_config SHALL remain unchanged.
**Validates: Requirements 6.3**

### Property 10: Group description visibility
*For any* option group with description_ar and show_group_description=true (or undefined), the description SHALL be displayed under the group title.
**Validates: Requirements 7.1, 7.3**

## Error Handling

1. **Invalid ui_config JSON**: Return DEFAULT_UI_CONFIG with console warning
2. **Unknown display_mode**: Fall back to 'default'
3. **Unknown fallback_style**: Fall back to 'cards'
4. **Missing icon**: Use default icon from DEFAULT_UI_CONFIG

## Testing Strategy

### Unit Tests
- parseUIConfig with various legacy field combinations
- mergeUIConfig preserves existing values
- getEffectiveIcon priority logic
- DynamicIcon renders all icon types

### Property-Based Tests (using fast-check)
- Property 1: Legacy section_type mapping
- Property 2: Legacy show_macros mapping
- Property 3: Saved config uses new fields only
- Property 7: Reset restores defaults
- Property 8: Template to card mapping

### Integration Tests
- UIConfigEditor saves and loads correctly
- Live Preview reflects actual rendering
- OptionGroupsSection without palette button

