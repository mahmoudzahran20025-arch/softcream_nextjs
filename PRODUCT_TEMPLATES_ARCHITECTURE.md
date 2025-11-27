# 🏗️ Product Templates Architecture

## المشكلة
منتجات مختلفة تحتاج أنظمة عرض وتخصيص مختلفة:
- آيس كريم: نكهات + صوصات + إضافات
- كيك: نوع + حجم + آيس كريم اختياري
- ميلك شيك: نكهة + mix-ins + حجم

## الحل: Template System

### 1. Database Schema (إضافة جدول جديد)

```sql
-- Product Templates
CREATE TABLE product_templates (
  id TEXT PRIMARY KEY,
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  description_ar TEXT,
  description_en TEXT,
  icon TEXT,
  layout_type TEXT NOT NULL, -- 'grid', 'list', 'tabs', 'wizard'
  display_order INTEGER DEFAULT 0
);

-- Link products to templates
ALTER TABLE products ADD COLUMN template_id TEXT REFERENCES product_templates(id);

-- Template-specific settings for option groups
ALTER TABLE product_options ADD COLUMN display_style TEXT; -- 'cards', 'buttons', 'dropdown', 'radio'
ALTER TABLE product_options ADD COLUMN conditional_on TEXT; -- For conditional display
ALTER TABLE product_options ADD COLUMN conditional_value TEXT;
```

### 2. Templates Examples

#### Template 1: BYO Ice Cream (موجود حالياً)
```json
{
  "id": "byo_ice_cream",
  "name_ar": "اصنع الآيس كريم الخاص بك",
  "layout_type": "grid",
  "groups": [
    {
      "id": "flavors",
      "display_style": "cards",
      "columns": 2
    },
    {
      "id": "sauces",
      "display_style": "cards",
      "columns": 2
    },
    {
      "id": "toppings",
      "display_style": "cards",
      "columns": 3
    }
  ]
}
```

#### Template 2: Cake + Ice Cream
```json
{
  "id": "cake_with_ice_cream",
  "name_ar": "كيك مع آيس كريم",
  "layout_type": "wizard",
  "steps": [
    {
      "step": 1,
      "title": "اختر نوع الكيك",
      "group_id": "cake_type",
      "display_style": "cards",
      "required": true
    },
    {
      "step": 2,
      "title": "اختر الحجم",
      "group_id": "cake_size",
      "display_style": "radio",
      "required": true
    },
    {
      "step": 3,
      "title": "أضف آيس كريم؟",
      "group_id": "add_ice_cream",
      "display_style": "toggle",
      "required": false
    },
    {
      "step": 4,
      "title": "اختر نكهة الآيس كريم",
      "group_id": "ice_cream_flavor",
      "display_style": "cards",
      "conditional_on": "add_ice_cream",
      "conditional_value": "yes"
    }
  ]
}
```

#### Template 3: Milkshake
```json
{
  "id": "milkshake",
  "name_ar": "ميلك شيك",
  "layout_type": "tabs",
  "tabs": [
    {
      "tab": "flavor",
      "title": "النكهة",
      "group_id": "shake_flavor",
      "display_style": "list"
    },
    {
      "tab": "mixins",
      "title": "الإضافات",
      "group_id": "shake_mixins",
      "display_style": "cards"
    },
    {
      "tab": "size",
      "title": "الحجم",
      "group_id": "shake_size",
      "display_style": "radio"
    }
  ]
}
```

### 3. Frontend Components

#### أ) Template Renderer (Dynamic)
```tsx
// components/customization/TemplateRenderer.tsx
export function TemplateRenderer({ template, product, onSelectionChange }) {
  switch (template.layout_type) {
    case 'grid':
      return <GridLayout template={template} {...props} />;
    case 'wizard':
      return <WizardLayout template={template} {...props} />;
    case 'tabs':
      return <TabsLayout template={template} {...props} />;
    case 'list':
      return <ListLayout template={template} {...props} />;
    default:
      return <GridLayout template={template} {...props} />;
  }
}
```

#### ب) Display Styles (Reusable)
```tsx
// components/customization/DisplayStyles/
- CardStyle.tsx      // Current style (cards with images)
- ButtonStyle.tsx    // Simple buttons
- RadioStyle.tsx     // Radio buttons (for single selection)
- DropdownStyle.tsx  // Dropdown menu
- ToggleStyle.tsx    // Yes/No toggle
- ListStyle.tsx      // Vertical list
```

#### ج) Conditional Logic
```tsx
// useConditionalGroups.ts
export function useConditionalGroups(template, selections) {
  return useMemo(() => {
    return template.groups.filter(group => {
      if (!group.conditional_on) return true;
      
      const conditionMet = selections[group.conditional_on]?.includes(
        group.conditional_value
      );
      
      return conditionMet;
    });
  }, [template, selections]);
}
```

### 4. Migration Path (خطوات التنفيذ)

#### Phase 1: Foundation (أسبوع 1)
- ✅ إضافة جدول `product_templates`
- ✅ إضافة `template_id` للمنتجات
- ✅ إنشاء template للـ BYO Ice Cream الحالي
- ✅ Refactor `CustomizationSelector` ليكون template-aware

#### Phase 2: New Templates (أسبوع 2)
- ✅ إنشاء `TemplateRenderer` component
- ✅ إضافة display styles الجديدة
- ✅ إنشاء template للكيك
- ✅ Testing

#### Phase 3: Advanced Features (أسبوع 3)
- ✅ Conditional groups
- ✅ Wizard layout
- ✅ Tabs layout
- ✅ Dynamic nutrition calculation

### 5. API Changes

#### Get Template
```javascript
GET /api/products/:id/template

Response:
{
  "template": {
    "id": "byo_ice_cream",
    "layout_type": "grid",
    "groups": [...]
  },
  "customization_rules": [...]
}
```

#### Validate with Template
```javascript
POST /api/products/:id/validate-selections

Body:
{
  "template_id": "byo_ice_cream",
  "selections": {...}
}

Response:
{
  "valid": true,
  "errors": [],
  "calculated_price": 70
}
```

### 6. Benefits

#### ✅ Scalability
- إضافة منتجات جديدة = إنشاء template جديد فقط
- لا حاجة لتعديل الكود

#### ✅ Flexibility
- كل منتج له نظام عرض خاص
- Conditional logic للخيارات المعقدة

#### ✅ Maintainability
- Components reusable
- Logic منفصل عن UI
- Easy to test

#### ✅ User Experience
- واجهة مناسبة لكل نوع منتج
- Wizard للمنتجات المعقدة
- Grid للمنتجات البسيطة

### 7. Example: Cake Product

```javascript
// Database
INSERT INTO products (id, name, template_id, is_customizable) 
VALUES ('chocolate_cake', 'كيك شوكولاتة', 'cake_with_ice_cream', 1);

// Option Groups
INSERT INTO option_groups (id, name_ar, icon) VALUES
('cake_type', 'نوع الكيك', '🎂'),
('cake_size', 'الحجم', '📏'),
('add_ice_cream', 'إضافة آيس كريم', '🍦'),
('ice_cream_flavor', 'نكهة الآيس كريم', '🍨');

// Product Options (Rules)
INSERT INTO product_options (product_id, option_group_id, is_required, min_selections, max_selections, display_style) VALUES
('chocolate_cake', 'cake_type', 1, 1, 1, 'cards'),
('chocolate_cake', 'cake_size', 1, 1, 1, 'radio'),
('chocolate_cake', 'add_ice_cream', 0, 0, 1, 'toggle'),
('chocolate_cake', 'ice_cream_flavor', 0, 0, 2, 'cards');

// Conditional Logic
UPDATE product_options 
SET conditional_on = 'add_ice_cream', conditional_value = 'yes'
WHERE product_id = 'chocolate_cake' AND option_group_id = 'ice_cream_flavor';
```

### 8. Code Example

```tsx
// RichProductPage.tsx
const { template, customizationRules } = useProductTemplate(product.id);

return (
  <div>
    {product.is_customizable ? (
      <TemplateRenderer
        template={template}
        rules={customizationRules}
        selections={selections}
        onSelectionChange={handleSelectionChange}
      />
    ) : (
      <AddonsList addons={addons} />
    )}
  </div>
);
```

---

## 🎯 Recommendation

### للبدء الآن:
1. **استمر بالنظام الحالي** للآيس كريم (شغال 100%)
2. **أضف nutrition calculation** (2-3 ساعات)
3. **خطط للـ template system** للمستقبل

### للتوسع لاحقاً:
1. **Phase 1**: Template foundation (أسبوع)
2. **Phase 2**: Cake template (أسبوع)
3. **Phase 3**: Advanced features (أسبوع)

### الأولوية:
```
1. ✅ Nutrition calculation (سريع ومهم)
2. 🔄 Template system planning (للمستقبل)
3. 🚀 New product types (بعد التخطيط)
```

---

## 💡 النظام الحالي قابل للتوسع؟

### ✅ نعم! لكن بشروط:

#### ما يعمل حالياً:
- ✅ BYO Ice Cream (ممتاز)
- ✅ Simple products (عادي)
- ✅ Price calculation (دقيق)

#### ما يحتاج تطوير:
- ⚠️ Multiple templates (يحتاج template system)
- ⚠️ Conditional logic (يحتاج refactoring)
- ⚠️ Different layouts (يحتاج TemplateRenderer)

### الخلاصة:
النظام الحالي **ممتاز للبداية** ✅
لكن للتوسع الكبير، محتاج **template system** 🏗️

---

## 📊 Effort Estimation

| Feature | Effort | Priority | Impact |
|---------|--------|----------|--------|
| Nutrition calculation | 2-3h | High | Medium |
| Template system foundation | 1 week | Medium | High |
| Cake template | 1 week | Low | High |
| Wizard layout | 3 days | Low | Medium |
| Conditional logic | 2 days | Medium | High |

---

عايز تبدأ بإيه الأول؟ 🚀
