# Requirements Document

## Introduction

هذا المستند يحدد متطلبات تحسين واجهة إدارة المنتجات في لوحة التحكم (Admin Panel) لضمان الإدخالات الصحيحة من الأدمن والتأكد من ترابط المنتجات مع مجموعات الخيارات (Option Groups) بشكل سليم. النظام الحالي يعتمد على معمارية "Everything-as-Option" حيث كل التخصيصات تتم عبر option_groups و options و product_options.

## Glossary

- **Product**: منتج في النظام (آيس كريم، ميلك شيك، حلويات)
- **Option Group**: مجموعة خيارات (الحاويات، الأحجام، النكهات، الإضافات، الصوصات)
- **Option**: خيار فردي داخل مجموعة (كوب، كون، صغير، وسط، فانيليا، أوريو)
- **Product Options**: جدول الربط بين المنتجات ومجموعات الخيارات مع قواعد مخصصة
- **Product Type**: نوع المنتج (standard, byo_ice_cream, milkshake, preset_ice_cream, dessert)
- **Admin Panel**: لوحة تحكم الأدمن لإدارة المنتجات والخيارات
- **Validation**: التحقق من صحة البيانات المدخلة

## Requirements

### Requirement 1

**User Story:** As an admin, I want to create a new product with its option groups in a single unified form, so that I can ensure data consistency and reduce errors.

#### Acceptance Criteria

1. WHEN an admin opens the product creation form THEN the Admin Panel SHALL display a unified form with product details section and option groups assignment section
2. WHEN an admin selects a product type THEN the Admin Panel SHALL suggest relevant option groups based on the product type
3. WHEN an admin assigns an option group to a product THEN the Admin Panel SHALL allow configuration of is_required, min_selections, and max_selections for that specific product-group relationship
4. WHEN an admin submits the form with missing required fields THEN the Admin Panel SHALL display clear validation errors and prevent submission
5. WHEN an admin successfully creates a product THEN the Admin Panel SHALL save both product data and product_options relationships in a single transaction

### Requirement 2

**User Story:** As an admin, I want to edit existing products and their option group assignments together, so that I can maintain data integrity when making changes.

#### Acceptance Criteria

1. WHEN an admin opens a product for editing THEN the Admin Panel SHALL load and display both product details and current option group assignments
2. WHEN an admin modifies option group assignments THEN the Admin Panel SHALL show a preview of changes before saving
3. WHEN an admin removes an option group from a product THEN the Admin Panel SHALL warn if the group was marked as required
4. WHEN an admin saves changes THEN the Admin Panel SHALL update product data and product_options atomically

### Requirement 3

**User Story:** As an admin, I want the system to validate option group configurations, so that I can avoid invalid combinations that would break the frontend.

#### Acceptance Criteria

1. WHEN an admin sets min_selections greater than max_selections THEN the Admin Panel SHALL display an error and prevent saving
2. WHEN an admin sets is_required to true with min_selections of 0 THEN the Admin Panel SHALL automatically set min_selections to 1
3. WHEN an admin assigns the same option group twice to a product THEN the Admin Panel SHALL prevent the duplicate and show an error
4. WHEN an admin configures max_selections greater than available options in the group THEN the Admin Panel SHALL display a warning

### Requirement 4

**User Story:** As an admin, I want to see a visual representation of product-option relationships, so that I can understand the current configuration at a glance.

#### Acceptance Criteria

1. WHEN an admin views the products list THEN the Admin Panel SHALL display a badge showing the number of assigned option groups per product
2. WHEN an admin hovers over the option groups badge THEN the Admin Panel SHALL show a tooltip with the names of assigned groups
3. WHEN an admin views product details THEN the Admin Panel SHALL display option groups in a tree-like structure showing group name, options count, and configuration rules

### Requirement 5

**User Story:** As an admin, I want product type templates that pre-configure common option group combinations, so that I can quickly set up new products.

#### Acceptance Criteria

1. WHEN an admin selects "byo_ice_cream" product type THEN the Admin Panel SHALL suggest containers, sizes, flavors, and toppings option groups
2. WHEN an admin selects "milkshake" product type THEN the Admin Panel SHALL suggest sizes and flavors option groups
3. WHEN an admin selects "standard" product type THEN the Admin Panel SHALL not suggest any option groups by default
4. WHEN an admin applies a template THEN the Admin Panel SHALL allow modification of the suggested configuration before saving

### Requirement 6

**User Story:** As an admin, I want to bulk assign option groups to multiple products, so that I can efficiently manage products with similar configurations.

#### Acceptance Criteria

1. WHEN an admin selects multiple products THEN the Admin Panel SHALL enable a bulk actions menu
2. WHEN an admin chooses "Assign Option Group" from bulk actions THEN the Admin Panel SHALL display a modal to select option groups and configure rules
3. WHEN an admin confirms bulk assignment THEN the Admin Panel SHALL apply the configuration to all selected products and report success/failure for each

### Requirement 7

**User Story:** As an admin, I want to see validation warnings before saving, so that I can fix potential issues proactively.

#### Acceptance Criteria

1. WHEN an admin creates a customizable product without any option groups THEN the Admin Panel SHALL display a warning that the product will have no customization options
2. WHEN an admin creates a product with option groups but no default selections THEN the Admin Panel SHALL display a warning about missing defaults
3. WHEN an admin saves a product THEN the Admin Panel SHALL validate all data and display a summary of warnings before final confirmation

