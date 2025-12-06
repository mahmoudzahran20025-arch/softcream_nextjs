# Requirements Document

## Introduction

تحسين نظام الـ Product Modal لحل مشاكل حساب الأسعار مع الخصومات والكوبونات، تحسين عرض الأحجام، إضافة نظام الخيارات الشرطية، تحسين ظهور الـ Footer، وتبسيط نظام الـ Templates. الهدف هو تجربة مستخدم أفضل وأكثر وضوحاً.

## Glossary

- **Product Modal**: نافذة عرض تفاصيل المنتج
- **Action Footer**: شريط الإجراءات السفلي (السلة + الكمية + السعر)
- **Size Selector**: مكون اختيار الحجم
- **Conditional Options**: الخيارات الشرطية التي تظهر بناءً على اختيارات أخرى
- **No Stacking**: منع تراكم الخصومات (الكوبون لا يعمل على منتجات مخصومة)
- **Base Price**: السعر الأساسي للمنتج
- **Price Modifier**: فرق السعر للحجم أو الإضافة
- **Intersection Observer**: تقنية لمراقبة ظهور العناصر في الشاشة
- **Template System**: نظام القوالب لعرض المنتجات

## Requirements

### Requirement 1: نظام حساب الأسعار مع الخصومات (No Stacking)

**User Story:** كصاحب متجر، أريد أن يكون نظام الخصومات واضح ومحمي من الخسائر، حتى لا أتعرض لخصومات مضاعفة غير متوقعة.

#### Acceptance Criteria

1. WHEN a product has a discount AND a coupon is applied THEN the Pricing_System SHALL apply only the product discount and ignore the coupon
2. WHEN a product has no discount AND a coupon is applied THEN the Pricing_System SHALL apply the coupon discount to the original price
3. WHEN calculating the final price THEN the Pricing_System SHALL display a clear message explaining which discount is applied
4. WHEN a coupon is rejected due to existing discount THEN the Pricing_System SHALL show a user-friendly message "الكوبون لا يعمل على المنتجات المخصومة"

### Requirement 2: تحسين عرض الأحجام (Size as Base Price)

**User Story:** كمستخدم، أريد أن أفهم أن الحجم الأساسي مضمن في السعر، والأحجام الأكبر تظهر كفرق سعر فقط، حتى لا أشعر بأنني أدفع مرتين.

#### Acceptance Criteria

1. WHEN displaying sizes THEN the Size_Selector SHALL show the base size as "السعر الأساسي" with 0 price modifier
2. WHEN displaying larger sizes THEN the Size_Selector SHALL show only the price difference (e.g., "+10 ج.م")
3. WHEN a size is selected THEN the Size_Selector SHALL update the total price by adding only the price modifier
4. WHEN the base size is selected THEN the Size_Selector SHALL display the product's base price without any additions

### Requirement 3: نظام الخيارات الشرطية (Conditional Options)

**User Story:** كمستخدم، أريد أن تظهر لي خيارات إضافية بناءً على اختياراتي السابقة، حتى أحصل على تجربة تخصيص ذكية.

#### Acceptance Criteria

1. WHEN an option group has a condition THEN the Product_Modal SHALL evaluate the condition before displaying the group
2. WHEN the condition depends on size selection THEN the Product_Modal SHALL show the conditional group only when the specified size is selected
3. WHEN the condition depends on container selection THEN the Product_Modal SHALL show the conditional group only when the specified container is selected
4. WHEN the dependency selection changes THEN the Product_Modal SHALL immediately update the visibility of conditional groups
5. WHEN a conditional group becomes hidden THEN the Product_Modal SHALL clear any selections made in that group

### Requirement 4: تحسين ظهور الـ Footer (Early Footer Visibility)

**User Story:** كمستخدم، أريد أن يظهر الـ Footer مبكراً عند التمرير، حتى أتمكن من إضافة المنتج للسلة بسرعة.

#### Acceptance Criteria

1. WHEN the user scrolls past the second option group THEN the Action_Footer SHALL become visible
2. WHEN the user scrolls up THEN the Action_Footer SHALL remain visible
3. WHEN the user is at the top of the modal THEN the Action_Footer SHALL be hidden with a scroll hint
4. WHEN the footer appears THEN the Action_Footer SHALL animate smoothly from the bottom

### Requirement 5: تبسيط نظام الـ Templates

**User Story:** كمطور، أريد نظام templates بسيط وواضح، حتى يكون الكود سهل الصيانة والتطوير.

#### Acceptance Criteria

1. WHEN a product is loaded THEN the Template_System SHALL determine the template based on template_id field only
2. WHEN rendering option groups THEN the Template_System SHALL use a unified display configuration per group
3. WHEN the display_style is "cards" THEN the Template_System SHALL render options as visual cards with images
4. WHEN the display_style is "buttons" THEN the Template_System SHALL render options as compact buttons
5. WHEN the display_style is "chips" THEN the Template_System SHALL render options as small chip elements

