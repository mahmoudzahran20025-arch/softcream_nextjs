# Implementation Plan: Options UI System Cleanup (Frontend)

- [x] 1. إزالة AdvancedStyleEditor من نموذج المنتج ✅
  - [x] 1.1 إزالة زر Palette من OptionGroupsSection ✅
    - إزالة import لـ Palette icon
    - إزالة state `editingVisualsGroupId`
    - إزالة زر الـ Palette من header كل مجموعة
    - إزالة AdvancedStyleEditor modal من نهاية الملف
    - _Requirements: 1.1, 1.2_
  - [x]* 1.2 Write property test for OptionGroupsSection ✅ (skipped - visual test)
    - **Property: No palette button rendered**
    - **Validates: Requirements 1.1**
  - [x] 1.3 إزالة ملف AdvancedStyleEditor.tsx ✅
    - حذف الملف من UnifiedProductForm folder
    - إزالة أي imports متبقية
    - _Requirements: 1.3_

- [x] 2. توحيد الحقول في UIConfig ✅
  - [x] 2.1 تحديث parseUIConfig في uiConfig.ts ✅
    - إضافة mapping لـ section_type → display_mode
    - إضافة mapping لـ show_macros → nutrition.show
    - إضافة deprecation warning في development mode
    - _Requirements: 2.1, 2.2, 2.4_
  - [x]* 2.2 Write property test for legacy field mapping ✅
    - **Property 1: Legacy section_type mapping**
    - **Property 2: Legacy show_macros mapping**
    - **Validates: Requirements 2.1, 2.2**
  - [x] 2.3 تحديث mergeUIConfig لإزالة الحقول القديمة ✅
    - إزالة section_type, show_macros, display_style من output
    - _Requirements: 2.3_
  - [x]* 2.4 Write property test for saved config ✅
    - **Property 3: Saved config uses new fields only**
    - **Validates: Requirements 2.3**

- [x] 3. Checkpoint - Make sure all tests are passing ✅
  - All 17 tests passing!

- [x] 4. توحيد حقل الأيقونة ✅
  - [x] 4.1 تحديث UIConfigEditor لحفظ الأيقونة في ui_config.icon فقط ✅
    - إزالة أي reference لحقل icon المنفصل
    - التأكد من أن onChange يرسل icon في ui_config فقط
    - _Requirements: 3.1_
  - [x]* 4.2 Write property test for icon storage ✅ (covered by 4.4)
    - **Property 4: Icon saved in ui_config only**
    - **Validates: Requirements 3.1**
  - [x] 4.3 تحديث getEffectiveIcon في OptionGroupRenderer ✅
    - إضافة priority logic: ui_config.icon > group.icon > default
    - _Requirements: 3.2_
  - [x]* 4.4 Write property test for icon priority ✅
    - **Property 5: Icon priority**
    - **Validates: Requirements 3.2**
  - [x] 4.5 تحديث DynamicIcon لدعم جميع أنواع الأيقونات ✅ (already supported)
    - التأكد من دعم emoji, lucide, custom URL
    - _Requirements: 3.4_

- [x] 5. إصلاح Live Preview






  - [x] 5.1 استبدال OptionRenderer بـ OptionGroupRenderer في UIConfigEditor

    - إنشاء mock group object للـ preview
    - تمرير sampleOptions كـ group.options
    - _Requirements: 4.1_

  - [x] 5.2 إضافة canRenderMode fallback logic للـ preview

    - استخدام getEffectiveMode من DisplayModeRenderer
    - _Requirements: 4.2_

  - [x] 5.3 عرض header مع icon و description في preview

    - التأكد من ظهور groupName و groupDescription
    - _Requirements: 4.3_
  - [ ]* 5.4 Write integration test for Live Preview
    - **Validates: Requirements 4.1, 4.2, 4.3**

- [ ] 6. Checkpoint - Make sure all tests are passing
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. إضافة show_group_description






  - [x] 7.1 إضافة حقل show_group_description في UIConfig type

    - تحديث interface في uiConfig.ts
    - إضافة default value في DEFAULT_UI_CONFIG
    - _Requirements: 7.3_

  - [x] 7.2 إضافة toggle في UIConfigEditor

    - إضافة checkbox في قسم Content visibility
    - _Requirements: 5.6_

  - [x] 7.3 تحديث OptionGroupRenderer لاستخدام show_group_description

    - إضافة logic لإظهار/إخفاء الوصف
    - _Requirements: 7.1, 7.2_
  - [x] 7.4 تمرير show_group_description لـ DisplayModeRenderer


    - إصلاح cards و grid ليعرضا الوصف
    - _Requirements: 7.4_
  - [ ]* 7.5 Write property test for group description visibility
    - **Property 10: Group description visibility**
    - **Validates: Requirements 7.1, 7.3**

- [x] 8. تحسين واجهة UIConfigEditor


  - [x] 8.1 تنظيم الأقسام بشكل واضح
    - Display Mode, Fallback Style, Nutrition, Layout, Content, Icon, Colors
    - _Requirements: 5.1_
  - [x] 8.2 إضافة conditional rendering لـ fallback_style
    - إظهار fallback options فقط عند الحاجة
    - _Requirements: 5.2_
  - [x] 8.3 تحسين قسم Nutrition
    - إضافة format selector و fields checkboxes
    - _Requirements: 5.3_
  - [x] 8.4 تحسين قسم Layout
    - إضافة columns, card_size, spacing controls
    - _Requirements: 5.4_
  - [x] 8.5 إصلاح Reset to defaults
    - التأكد من استعادة جميع القيم الافتراضية
    - _Requirements: 5.5_
  - [ ]* 8.6 Write property test for reset functionality
    - **Property 7: Reset restores defaults**
    - **Validates: Requirements 5.5**

- [x] 9. تبسيط التيمبلت في الـ Frontend






  - [x] 9.1 تحديث ProductTemplateRenderer

    - استخدام template.card_type بدلاً من complex config
    - _Requirements: 6.1_
  - [ ]* 9.2 Write property test for template to card mapping
    - **Property 8: Template to card mapping**
    - **Validates: Requirements 6.1**

  - [x] 9.3 تحديث واجهة اختيار التيمبلت في نموذج المنتج

    - إضافة visual previews للتيمبلت
    - إضافة descriptions واضحة
    - _Requirements: 6.2, 6.4_
  - [ ]* 9.4 Write property test for template independence
    - **Property 9: Template independence**
    - **Validates: Requirements 6.3**

- [ ] 10. Final Checkpoint - Make sure all tests are passing
  - Ensure all tests pass, ask the user if questions arise.

