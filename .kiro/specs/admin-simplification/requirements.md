# Requirements Document

## Introduction

تبسيط وتكامل واجهات الأدمن للمنتجات والخيارات مع الحفاظ على الأجزاء الجيدة وإزالة التكرار. الهدف هو واجهة متكاملة وبسيطة تتبع نمط الكوبونات.

## Glossary

- **Admin_Products_Page**: صفحة إدارة المنتجات (products table)
- **Admin_Options_Page**: صفحة إدارة الخيارات (option_groups + options tables)
- **Product_Options_Link**: جدول الربط بين المنتجات ومجموعات الخيارات (product_options table)
- **Simple_Modal**: نافذة منبثقة بسيطة بدون tabs معقدة

## Requirements

### Requirement 1: صفحة المنتجات - العرض

**User Story:** As an admin, I want a clean products page, so that I can quickly see and manage all products.

#### Acceptance Criteria

1. WHEN an admin opens the products page THEN the Admin_Products_Page SHALL display a grid of ProductCards showing: name, price, image, availability toggle, category badge
2. THE Admin_Products_Page SHALL include a search bar and category filter
3. THE Admin_Products_Page SHALL show stats cards: total products, available, unavailable, by category
4. THE Admin_Products_Page SHALL follow the CouponsPage layout pattern

### Requirement 2: صفحة المنتجات - النموذج

**User Story:** As an admin, I want a simple product form, so that I can add/edit products without complex navigation.

#### Acceptance Criteria

1. WHEN an admin clicks "Add/Edit Product" THEN the Admin_Products_Page SHALL open a Simple_Modal with sections: Basic Info, Option Groups Assignment, Nutrition (collapsible)
2. THE Basic Info section SHALL contain: id (create only), name, nameEn, category, price, image, badge, available toggle
3. THE Option Groups Assignment section SHALL show checkboxes for available option_groups with settings: isRequired, minSelections, maxSelections
4. THE Nutrition section SHALL be collapsible and contain: calories, protein, carbs, fat, sugar, fiber
5. THE Simple_Modal SHALL NOT use tabs or wizard steps - all in one scrollable form
6. THE Simple_Modal SHALL use template_id='template_1' as default (hidden from user)

### Requirement 3: صفحة الخيارات - العرض

**User Story:** As an admin, I want a clean options page, so that I can manage option groups and their options efficiently.

#### Acceptance Criteria

1. WHEN an admin opens the options page THEN the Admin_Options_Page SHALL display expandable OptionGroupCards
2. EACH OptionGroupCard SHALL show: group name, icon, options count, expand/collapse toggle
3. WHEN expanded THEN the OptionGroupCard SHALL show list of OptionItems with: name, price, availability toggle
4. THE Admin_Options_Page SHALL include search and stats cards

### Requirement 4: صفحة الخيارات - نماذج المجموعات والخيارات

**User Story:** As an admin, I want simple forms for option groups and options, so that I can manage them quickly.

#### Acceptance Criteria

1. THE GroupFormModal SHALL contain only: id, name_ar, name_en, icon picker, display_order
2. THE GroupFormModal SHALL NOT include UIConfigEditor tab (use default ui_config)
3. THE OptionFormModal SHALL contain: id, name_ar, name_en, base_price, image, available, nutrition fields (collapsible)
4. BOTH modals SHALL follow the Simple_Modal pattern from CouponsPage

### Requirement 5: التكامل بين الصفحتين

**User Story:** As an admin, I want seamless integration between products and options pages, so that changes reflect immediately.

#### Acceptance Criteria

1. WHEN an option_group is created/updated in Admin_Options_Page THEN the Admin_Products_Page SHALL show it in the Option Groups Assignment section
2. WHEN an option_group is deleted THEN the Admin_Products_Page SHALL remove it from all product assignments
3. THE Product_Options_Link settings (isRequired, min, max) SHALL be editable only from Admin_Products_Page
4. THE option_group default settings (is_required, min_selections, max_selections) SHALL be editable from Admin_Options_Page

### Requirement 6: تنظيف الكود

**User Story:** As a developer, I want clean code without duplications, so that maintenance is easier.

#### Acceptance Criteria

1. THE system SHALL archive these product components: ProductWizard/, TemplateSelector/, TemplateBadge/, ChangePreviewModal, ValidationSummary, changeTracking.ts
2. THE system SHALL archive these option components: UIConfigEditor/, OptionsTable.tsx, OptionCards.tsx
3. THE system SHALL keep and simplify: UnifiedProductForm (rename to ProductFormModal), GroupFormModal, OptionFormModal
4. THE system SHALL use shared types from @/types/admin.ts
