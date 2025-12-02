# Requirements Document

## Introduction

هذا المشروع يهدف لإنشاء صفحة إدارة مجموعات الخيارات في لوحة تحكم الأدمن. الصفحة ستسمح للأدمن بإنشاء وإدارة مجموعات الخيارات (مثل: نكهات الآيس كريم، إضافات الميلك شيك، الصوصات، التوبينج) وإضافة خيارات فردية لكل مجموعة مع تحديد السعر والصورة والقيم الغذائية.

## Glossary

- **Option Group**: مجموعة خيارات (مثل: نكهات، إضافات، صوصات، حاويات، مقاسات)
- **Option**: خيار فردي داخل مجموعة (مثل: فانيليا، شوكولاتة، أوريو)
- **Admin Panel**: لوحة تحكم الأدمن في Next.js
- **Customization Tab**: تاب "إعدادات التخصيص" في الـ Sidebar
- **Backend API**: واجهة برمجة التطبيقات في Cloudflare Workers

## Requirements

### Requirement 1: عرض مجموعات الخيارات

**User Story:** As an admin, I want to view all option groups with their options, so that I can manage product customization options.

#### Acceptance Criteria

1. WHEN the admin navigates to the customization tab THEN the system SHALL display a list of all option groups with their names, icons, and options count
2. WHEN the admin clicks on an option group THEN the system SHALL expand the group to show all options within it
3. WHEN displaying options THEN the system SHALL show option name, price, image thumbnail, and availability status
4. THE system SHALL display option groups in their configured display order
5. WHEN no option groups exist THEN the system SHALL display an empty state with a call-to-action to create the first group

### Requirement 2: إنشاء مجموعة خيارات جديدة

**User Story:** As an admin, I want to create new option groups, so that I can add new customization categories for products.

#### Acceptance Criteria

1. WHEN the admin clicks "إضافة مجموعة جديدة" THEN the system SHALL display a modal form for creating a new option group
2. THE form SHALL require the following fields: ID (unique identifier), Arabic name, English name, icon
3. THE form SHALL include optional fields: Arabic description, English description, display order
4. WHEN the admin submits a valid form THEN the system SHALL create the option group and display it in the list
5. IF the option group ID already exists THEN the system SHALL display an error message and prevent creation

### Requirement 3: تعديل مجموعة خيارات

**User Story:** As an admin, I want to edit existing option groups, so that I can update their information.

#### Acceptance Criteria

1. WHEN the admin clicks the edit button on an option group THEN the system SHALL display a modal form pre-filled with the group's current data
2. THE admin SHALL be able to modify all fields except the ID
3. WHEN the admin saves changes THEN the system SHALL update the option group and reflect changes immediately
4. IF the update fails THEN the system SHALL display a meaningful error message

### Requirement 4: حذف مجموعة خيارات

**User Story:** As an admin, I want to delete option groups that are no longer needed, so that I can keep the system clean.

#### Acceptance Criteria

1. WHEN the admin clicks the delete button on an option group THEN the system SHALL display a confirmation dialog
2. IF the option group has options THEN the system SHALL warn that all options will be deleted
3. IF the option group is linked to products THEN the system SHALL prevent deletion and display an error message
4. WHEN deletion is confirmed THEN the system SHALL remove the option group and all its options

### Requirement 5: إضافة خيار جديد لمجموعة

**User Story:** As an admin, I want to add new options to a group, so that I can expand the available choices for customers.

#### Acceptance Criteria

1. WHEN the admin clicks "إضافة خيار" within a group THEN the system SHALL display a modal form for creating a new option
2. THE form SHALL require: ID, Arabic name, English name, group_id
3. THE form SHALL include optional fields: price, image URL, Arabic description, English description, display order, availability
4. THE form SHALL include nutrition fields: calories, protein, carbs, fat, sugar, fiber
5. WHEN the admin submits a valid form THEN the system SHALL create the option and display it in the group
6. IF the option ID already exists THEN the system SHALL display an error message

### Requirement 6: تعديل خيار

**User Story:** As an admin, I want to edit existing options, so that I can update prices, images, and nutrition information.

#### Acceptance Criteria

1. WHEN the admin clicks the edit button on an option THEN the system SHALL display a modal form pre-filled with the option's current data
2. THE admin SHALL be able to modify all fields except the ID and group_id
3. WHEN the admin saves changes THEN the system SHALL update the option immediately
4. THE system SHALL validate that price is a non-negative number

### Requirement 7: حذف خيار

**User Story:** As an admin, I want to delete options that are no longer available, so that customers don't see unavailable choices.

#### Acceptance Criteria

1. WHEN the admin clicks the delete button on an option THEN the system SHALL display a confirmation dialog
2. WHEN deletion is confirmed THEN the system SHALL remove the option from the group
3. THE system SHALL update the options count for the parent group

### Requirement 8: تبديل توفر الخيار

**User Story:** As an admin, I want to quickly toggle option availability, so that I can temporarily disable options without deleting them.

#### Acceptance Criteria

1. WHEN the admin clicks the availability toggle THEN the system SHALL immediately update the option's availability status
2. THE system SHALL visually indicate unavailable options with reduced opacity or a badge
3. WHEN toggling fails THEN the system SHALL revert the UI state and display an error message

### Requirement 9: البحث والفلترة

**User Story:** As an admin, I want to search and filter options, so that I can quickly find specific items.

#### Acceptance Criteria

1. THE system SHALL provide a search input that filters option groups and options by name
2. WHEN the admin types in the search input THEN the system SHALL filter results in real-time
3. THE system SHALL highlight matching text in search results
