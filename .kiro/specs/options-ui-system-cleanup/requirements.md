# Requirements Document

## Introduction

تنظيف وتوحيد نظام تخصيص الخيارات (Options UI System) في لوحة الأدمن. يهدف هذا المشروع إلى إزالة التناقضات بين المحررين المختلفين، توحيد الحقول المستخدمة، وإصلاح Live Preview ليعكس الواقع الفعلي.

### المشاكل الحالية:
1. وجود محررين مختلفين (`UIConfigEditor` و `AdvancedStyleEditor`) يستخدمان حقول مختلفة
2. `AdvancedStyleEditor` يعدل المجموعة العامة من داخل نموذج المنتج (يأثر على كل المنتجات)
3. Live Preview يستخدم `OptionRenderer` مباشرة بدلاً من `OptionGroupRenderer`
4. حقل `icon` موجود في مكانين (`option_groups.icon` و `ui_config.icon`)
5. حقول قديمة (`section_type`, `show_macros`) لا تزال مستخدمة

## Glossary

- **Option_Group**: مجموعة خيارات (مثل: النكهات، الإضافات، الأحجام)
- **UIConfig**: كائن JSON يحتوي على إعدادات العرض لمجموعة الخيارات
- **display_mode**: نمط العرض الرئيسي (default, hero_flavor, smart_meter, brand_accent)
- **fallback_style**: نمط العرض الاحتياطي (cards, grid, list, pills, checkbox)
- **AdvancedStyleEditor**: المحرر الموجود في نموذج المنتج (سيتم إزالته)
- **UIConfigEditor**: المحرر الموجود في تاب الخيارات (سيبقى ويُحسَّن)
- **OptionGroupRenderer**: المكون الذي يعرض مجموعة الخيارات للعميل
- **Live_Preview**: معاينة مباشرة لشكل الخيارات في المحرر

## Requirements

### Requirement 1: إزالة AdvancedStyleEditor من نموذج المنتج

**User Story:** As an admin, I want option group styling to be managed only from the Options tab, so that changes don't accidentally affect all products using the same group.

#### Acceptance Criteria

1. WHEN an admin opens the product form THEN the System SHALL NOT display the palette button (🎨) next to option groups
2. WHEN an admin wants to customize option group appearance THEN the System SHALL redirect them to the Options tab
3. WHEN the AdvancedStyleEditor component is removed THEN the System SHALL maintain all existing functionality in UIConfigEditor

### Requirement 2: توحيد الحقول في UIConfig

**User Story:** As a developer, I want a single source of truth for UI configuration fields, so that the codebase is maintainable and consistent.

#### Acceptance Criteria

1. WHEN parsing ui_config THEN the System SHALL map `section_type` to `display_mode` for backward compatibility
2. WHEN parsing ui_config THEN the System SHALL map `show_macros` to `nutrition.show` for backward compatibility
3. WHEN saving ui_config THEN the System SHALL use only the new field names (`display_mode`, `fallback_style`, `nutrition`)
4. WHEN the System encounters legacy fields THEN the System SHALL log a deprecation warning in development mode

### Requirement 3: توحيد حقل الأيقونة

**User Story:** As an admin, I want to set icons from one place only, so that I don't get confused about which icon setting takes precedence.

#### Acceptance Criteria

1. WHEN an admin sets an icon THEN the System SHALL save it in `ui_config.icon` only
2. WHEN the System reads icon data THEN the System SHALL prioritize `ui_config.icon` over `option_groups.icon`
3. WHEN migrating existing data THEN the System SHALL copy `option_groups.icon` to `ui_config.icon` if not already set
4. WHEN displaying icons THEN the System SHALL support emoji, Lucide icons, and custom image URLs

### Requirement 4: إصلاح Live Preview

**User Story:** As an admin, I want the live preview to accurately reflect how options will appear to customers, so that I can make informed styling decisions.

#### Acceptance Criteria

1. WHEN displaying live preview THEN the System SHALL use OptionGroupRenderer component
2. WHEN displaying live preview THEN the System SHALL apply canRenderMode fallback logic
3. WHEN displaying live preview THEN the System SHALL show group header with icon and description
4. WHEN the admin changes settings THEN the System SHALL update the preview in real-time

### Requirement 5: تحسين واجهة UIConfigEditor

**User Story:** As an admin, I want a clear and comprehensive UI configuration editor, so that I can easily customize how options appear.

#### Acceptance Criteria

1. WHEN opening UIConfigEditor THEN the System SHALL display all available configuration options in organized sections
2. WHEN selecting display_mode THEN the System SHALL show relevant fallback_style options
3. WHEN configuring nutrition display THEN the System SHALL allow selecting format and visible fields
4. WHEN configuring layout THEN the System SHALL allow setting columns, card_size, and spacing
5. WHEN resetting to defaults THEN the System SHALL restore all fields to DEFAULT_UI_CONFIG values
6. WHEN configuring content visibility THEN the System SHALL allow toggling show_group_description to control group description display

### Requirement 7: التحكم في ظهور وصف المجموعة

**User Story:** As an admin, I want to control whether the group description appears under the group title, so that I can customize the display based on the group content.

#### Acceptance Criteria

1. WHEN show_group_description is true THEN the System SHALL display description_ar under the group title
2. WHEN show_group_description is false THEN the System SHALL hide the group description
3. WHEN show_group_description is not set THEN the System SHALL default to showing the description
4. WHEN using cards or grid display style THEN the System SHALL pass show_group_description to DisplayModeRenderer

### Requirement 6: تبسيط التيمبلت

**User Story:** As an admin, I want templates to clearly define card appearance only, so that I understand what each template controls.

#### Acceptance Criteria

1. WHEN selecting a template THEN the System SHALL apply the corresponding card type (SimpleCard, StandardCard, BYOCard, LifestyleCard)
2. WHEN displaying template options THEN the System SHALL show clear descriptions of what each template controls
3. WHEN a template is selected THEN the System SHALL NOT affect option group ui_config settings
4. WHEN editing a product THEN the System SHALL display template selection with visual previews

