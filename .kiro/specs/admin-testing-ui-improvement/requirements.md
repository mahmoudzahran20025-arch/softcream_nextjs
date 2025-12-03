# Requirements Document

## Introduction

هذا المستند يحدد متطلبات خطة شاملة بناءً على التحديثات الأخيرة في الـ Architecture:

### ما تم إنجازه سابقاً:
**Backend:**
- `product_templates` table مع 3 templates (Simple, Medium, Complex)
- `option_groups` مع `ui_config` للـ metadata-driven rendering
- `products` مع `template_id`, `ui_config`, `card_style`
- Recommendation Service للمنتجات المقترحة

**Frontend:**
- `DynamicIcon` component (Emojis, Lucide, SVG)
- `OptionGroupRenderer` - metadata-driven, zero hard-coded styling
- Cards System: `CompactCard`, `WizardCard`, `StandardProductCard`
- `ProductTemplateRenderer` مع Complex/Medium/Simple templates

### ما نحتاجه الآن:
1. اختبارات سريعة للتحقق من الجداول والتغييرات
2. ربط التحديثات الجديدة بصفحات الأدمن (options, products)
3. تحسين UI الأدمن ليستخدم النظام الجديد (templates, ui_config)

## Glossary

- **Product Template**: قالب يحدد تعقيد المنتج (Simple, Medium, Complex)
- **UI Config**: JSON metadata يتحكم في شكل العرض بدون hard-coding
- **Option Group**: مجموعة خيارات مثل "الحاويات" أو "الأحجام" أو "النكهات"
- **Option**: خيار فردي داخل مجموعة مثل "كوب" أو "كون" أو "فانيليا"
- **OptionGroupRenderer**: component موحد يعرض أي مجموعة خيارات بناءً على ui_config
- **DynamicIcon**: component يعرض أيقونات (emoji, lucide, svg) بشكل ديناميكي
- **UnifiedProductForm**: نموذج موحد لإنشاء وتعديل المنتجات في الأدمن
- **OptionsPage**: صفحة إدارة مجموعات الخيارات في الأدمن

## Requirements

### Requirement 1: اختبارات سريعة للجداول الجديدة

**User Story:** كمطور، أريد التحقق السريع من صحة الجداول والتغييرات الأخيرة، حتى أتأكد من أن الأساس سليم.

#### Acceptance Criteria

1. WHEN querying product_templates table THEN THE system SHALL return 3 templates (Simple, Medium, Complex) with ui_config
2. WHEN querying option_groups table THEN THE system SHALL return groups with ui_config JSON field
3. WHEN querying products table THEN THE system SHALL return products with template_id and card_style fields
4. WHEN querying product_options table THEN THE system SHALL use option_group_id column exclusively
5. WHEN fetching product with expand=template THEN THE system SHALL return enriched template_config

### Requirement 2: ربط الأدمن بنظام Templates

**User Story:** كمدير، أريد إدارة المنتجات مع اختيار Template المناسب، حتى يظهر المنتج بالشكل الصحيح للعملاء.

#### Acceptance Criteria

1. WHEN creating product in admin THEN THE system SHALL allow selecting template (Simple, Medium, Complex)
2. WHEN editing product THEN THE system SHALL display current template and allow changing it
3. WHEN template is selected THEN THE system SHALL show preview of how product card will look
4. WHEN saving product with template THEN THE system SHALL persist template_id correctly
5. WHEN template changes THEN THE system SHALL suggest appropriate option groups for that template

### Requirement 3: ربط الأدمن بنظام UI Config

**User Story:** كمدير، أريد تخصيص شكل عرض الخيارات، حتى تظهر بشكل جذاب للعملاء.

#### Acceptance Criteria

1. WHEN editing option group THEN THE system SHALL allow configuring ui_config (display_style, icon, colors)
2. WHEN configuring display_style THEN THE system SHALL offer options (cards, pills, list, checkbox)
3. WHEN setting icon THEN THE system SHALL support emoji, lucide icon name, or image URL
4. WHEN saving ui_config THEN THE system SHALL validate JSON structure before saving
5. WHEN previewing THEN THE system SHALL show how option group will render using OptionGroupRenderer

### Requirement 4: تحسين OptionsPage للنظام الجديد

**User Story:** كمدير، أريد واجهة محسنة لإدارة الخيارات تستخدم النظام الجديد، حتى أتمكن من العمل بكفاءة.

#### Acceptance Criteria

1. WHEN viewing option group THEN THE system SHALL display using DynamicIcon component for icons
2. WHEN editing group THEN THE system SHALL show ui_config editor with visual preview
3. WHEN adding option THEN THE system SHALL allow setting nutrition info and image
4. WHEN reordering groups THEN THE system SHALL update display_order and persist changes
5. WHEN searching THEN THE system SHALL highlight matching text in Arabic and English names

### Requirement 5: تحسين ProductsPage للنظام الجديد

**User Story:** كمدير، أريد واجهة محسنة لإدارة المنتجات تعرض Templates والخيارات بوضوح.

#### Acceptance Criteria

1. WHEN viewing product card THEN THE system SHALL show template badge (Simple/Medium/Complex)
2. WHEN viewing product card THEN THE system SHALL show assigned option groups count with tooltip
3. WHEN editing product THEN THE system SHALL organize form in tabs (Details, Template, Options, Nutrition)
4. WHEN selecting template THEN THE system SHALL auto-suggest relevant option groups
5. WHEN saving THEN THE system SHALL validate template compatibility with assigned options

### Requirement 6: تحليل الفجوات وخطة التحسين

**User Story:** كمطور، أريد تحليل الفجوات بين النظام الجديد والأدمن الحالي، حتى أخطط للتحسينات.

#### Acceptance Criteria

1. WHEN analyzing admin components THEN THE system SHALL identify components not using new system
2. WHEN identifying gaps THEN THE system SHALL list missing features (template selection, ui_config editor)
3. WHEN proposing improvements THEN THE system SHALL prioritize by impact (high, medium, low)
4. WHEN documenting THEN THE system SHALL create clear action items with estimated effort
