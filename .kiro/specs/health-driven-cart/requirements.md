# Requirements Document

## Introduction

هذا المستند يحدد متطلبات تطوير تجربة Cart صحية ومحفزة تسويقياً لتطبيق Soft Cream. الهدف هو تحويل الـ Cart من مجرد قائمة منتجات إلى تجربة تفاعلية تعزز الوعي الصحي وتحفز العميل على اتخاذ قرارات شراء إيجابية، مع الحفاظ على أداء عالي (INP < 200ms).

## Glossary

- **Cart_System**: نظام سلة التسوق في تطبيق Soft Cream الذي يعرض المنتجات المختارة ويحسب الإجمالي
- **Health_Score**: رقم من 0-100 يمثل مدى صحية اختيارات العميل بناءً على القيم الغذائية
- **Health_Insight**: رسالة تسويقية ديناميكية تظهر بناءً على الـ Health Score والـ Keywords
- **Health_Keywords**: كلمات مفتاحية صحية مرتبطة بكل منتج (مثل: high-protein, low-sugar, indulgent)
- **HealthyMeter**: مكون UI يعرض الـ Health Score بشكل مرئي
- **INP (Interaction to Next Paint)**: مقياس أداء يقيس الوقت بين تفاعل المستخدم وظهور التغيير على الشاشة
- **Keyword_Weight**: وزن رقمي لكل keyword يحدد أولويته في اختيار الـ Insight المناسب

## Requirements

### Requirement 1: Database Schema Enhancement

**User Story:** As a system administrator, I want to store health-related metadata for each product, so that the system can generate relevant health insights.

#### Acceptance Criteria

1. WHEN a product record is created or updated THEN the Cart_System SHALL support storing health_keywords as a JSON array field
2. WHEN a product record is created or updated THEN the Cart_System SHALL support storing health_benefit_ar as an optional Arabic text field
3. WHEN the database schema is migrated THEN the Cart_System SHALL preserve all existing product data without data loss
4. WHEN health_keywords field is empty or null THEN the Cart_System SHALL treat the product as having no health keywords

### Requirement 2: Health Insights Library

**User Story:** As a product owner, I want a curated library of health insights, so that customers receive relevant and positive messages based on their cart contents.

#### Acceptance Criteria

1. WHEN the Health_Insight library is initialized THEN the Cart_System SHALL contain exactly 5 insight categories: high_protein, low_sugar, balanced, indulgent, and fallback
2. WHEN an insight is displayed THEN the Cart_System SHALL show a maximum of 3 lines of Arabic text
3. WHEN an insight is selected THEN the Cart_System SHALL ensure all health claims are scientifically accurate and legally safe
4. WHEN the insight library is accessed THEN the Cart_System SHALL return insights with title, lines array, and associated keywords

### Requirement 3: Insight Selection Algorithm

**User Story:** As a customer, I want to see the most relevant health insight for my cart, so that I feel informed and positive about my choices.

#### Acceptance Criteria

1. WHEN calculating dominant keywords THEN the Cart_System SHALL apply keyword weights (high-protein: 3, low-sugar: 3, calcium: 2, indulgent: 1)
2. WHEN multiple products share keywords THEN the Cart_System SHALL multiply keyword weight by product quantity
3. WHEN selecting an insight THEN the Cart_System SHALL filter by Health_Score range first, then match by keywords
4. WHEN no keywords match THEN the Cart_System SHALL return the fallback insight
5. WHEN the cart is empty THEN the Cart_System SHALL not display any Health_Insight

### Requirement 4: Health Score Calculation

**User Story:** As a customer, I want to see a health score for my cart, so that I understand the nutritional balance of my choices.

#### Acceptance Criteria

1. WHEN calculating Health_Score THEN the Cart_System SHALL use nutrition values (calories, protein, sugar, fiber) from all cart items
2. WHEN a product has customizations THEN the Cart_System SHALL include customization nutrition values in the calculation
3. WHEN Health_Score is calculated THEN the Cart_System SHALL return a value between 0 and 100
4. WHEN displaying Health_Score THEN the Cart_System SHALL show appropriate tone: 70-100 (positive), 50-70 (balanced), below 50 (encouraging)

### Requirement 5: Cart Performance Optimization

**User Story:** As a customer, I want the cart to respond quickly to my interactions, so that I have a smooth shopping experience.

#### Acceptance Criteria

1. WHEN the cart modal opens THEN the Cart_System SHALL render within 200ms (INP target)
2. WHEN cart items change THEN the Cart_System SHALL use React.memo to prevent unnecessary re-renders
3. WHEN Health_Score is recalculated THEN the Cart_System SHALL debounce calculations by 300ms minimum
4. WHEN Health_Insight is loaded THEN the Cart_System SHALL use lazy loading to avoid blocking initial render

### Requirement 6: Health Insight UI Component

**User Story:** As a customer, I want to see health insights in an attractive card format, so that the information is easy to read and engaging.

#### Acceptance Criteria

1. WHEN Health_Insight is displayed THEN the Cart_System SHALL show a card with gradient background (green-50 to blue-50)
2. WHEN Health_Insight appears THEN the Cart_System SHALL animate with fade-in and slide-up (0.5s delay after cart opens)
3. WHEN Health_Insight is displayed THEN the Cart_System SHALL include a dismiss button for user control
4. WHEN Health_Insight title is shown THEN the Cart_System SHALL display an emoji icon matching the insight category

### Requirement 7: Admin Product Management

**User Story:** As an admin, I want to manage health keywords for products, so that I can control which insights appear for each product.

#### Acceptance Criteria

1. WHEN editing a product in admin THEN the Cart_System SHALL display a multi-select field for health_keywords
2. WHEN editing a product in admin THEN the Cart_System SHALL display a text field for health_benefit_ar
3. WHEN saving product changes THEN the Cart_System SHALL validate that health_keywords contains only predefined valid keywords
4. WHEN displaying keyword options THEN the Cart_System SHALL group keywords by category (Energy, Nutritional, Lifestyle, Special Diets)

### Requirement 8: Seed Data Update

**User Story:** As a developer, I want existing products to have appropriate health keywords, so that the system works correctly from deployment.

#### Acceptance Criteria

1. WHEN seed data is executed THEN the Cart_System SHALL assign health_keywords to all existing products based on their category and nutrition values
2. WHEN assigning keywords THEN the Cart_System SHALL limit each product to a maximum of 3 keywords
3. WHEN assigning keywords THEN the Cart_System SHALL prioritize specific keywords (high-protein, low-sugar) over generic ones (indulgent)
