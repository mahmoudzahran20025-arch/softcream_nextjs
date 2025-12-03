  # Implementation Plan

## Phase 1: اختبارات سريعة للجداول

- [x] 1. إنشاء اختبارات التحقق من الجداول





  - [x] 1.1 إنشاء ملف اختبارات SQL verification


    - إنشاء `softcream-api/test/schema-verification.unit.spec.js`
    - اختبار وجود جدول `product_templates` مع 3 قوالب
    - اختبار وجود `ui_config` في `option_groups`
    - اختبار وجود `template_id` و `card_style` في `products`
    - اختبار استخدام `option_group_id` في `product_options`
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [ ]* 1.2 كتابة property test للـ template enrichment
    - **Property 1: Template Persistence Round-Trip**
    - **Validates: Requirements 2.4**

- [ ] 2. Checkpoint - التحقق من الاختبارات
  - Ensure all tests pass, ask the user if questions arise.

## Phase 2: ربط الأدمن بنظام Templates

- [x] 3. إنشاء Template Selector component





  - [x] 3.1 إنشاء API endpoint للـ templates


    - إضافة `getTemplates()` في `src/lib/admin/templates.api.ts`
    - _Requirements: 2.1_


  - [x] 3.2 إنشاء TemplateSelector component

    - إنشاء `src/components/admin/products/TemplateSelector/index.tsx`
    - عرض القوالب الثلاثة (Simple, Medium, Complex) كـ cards
    - إظهار وصف كل قالب ومستوى التعقيد
    - _Requirements: 2.1, 2.2_

  - [ ]* 3.3 كتابة property test للـ template suggestions
    - **Property 2: Template Suggestions Relevance**
    - **Validates: Requirements 2.5, 5.4**

- [x] 4. دمج Template Selector في UnifiedProductForm




  - [x] 4.1 تحديث UnifiedProductForm


    - إضافة tab جديد للـ Template
    - عرض TemplateSelector
    - تطبيق suggested groups عند اختيار template
    - _Requirements: 2.1, 2.2, 2.5_



  - [x] 4.2 تحديث ProductDetailsSection





    - إضافة حقل template_id
    - إضافة حقل card_style
    - _Requirements: 2.4_

- [ ] 5. Checkpoint - التحقق من Template integration
  - Ensure all tests pass, ask the user if questions arise.

## Phase 3: ربط الأدمن بنظام UI Config

- [ ] 6. إنشاء UI Config Editor
  - [x] 6.1 إنشاء UIConfigEditor component





    - إنشاء `src/components/admin/options/UIConfigEditor/index.tsx`
    - حقول: display_style, icon, colors
    - JSON validation قبل الحفظ
    - _Requirements: 3.1, 3.2, 3.3_

  - [ ]* 6.2 كتابة property test للـ icon format
    - **Property 3: Icon Format Acceptance**
    - **Validates: Requirements 3.3**

  - [ ]* 6.3 كتابة property test للـ JSON validation
    - **Property 4: UI Config JSON Validation**
    - **Validates: Requirements 3.4**

- [ ] 7. دمج UI Config Editor في OptionsPage
  - [x] 7.1 تحديث GroupFormModal





    - إضافة UIConfigEditor
    - حفظ ui_config مع المجموعة
    - _Requirements: 3.1, 3.4_

  - [x] 7.2 تحديث OptionGroupCard





    - استخدام DynamicIcon لعرض الأيقونة
    - عرض display_style badge
    - _Requirements: 4.1_

- [ ] 8. Checkpoint - التحقق من UI Config integration
  - Ensure all tests pass, ask the user if questions arise.

## Phase 4: تحسين OptionsPage

- [x] 9. تحسين عرض مجموعات الخيارات






  - [x] 9.1 تحديث OptionGroupCard للنظام الجديد

    - استخدام DynamicIcon component
    - إضافة زر Edit UI Config
    - تحسين animations عند expand/collapse
    - _Requirements: 4.1, 4.2_

  - [x] 9.2 إضافة Drag & Drop لإعادة الترتيب


    - تثبيت `@dnd-kit/core` و `@dnd-kit/sortable`
    - تحديث display_order عند السحب
    - _Requirements: 4.4_

  - [ ]* 9.3 كتابة property test للـ display order
    - **Property 5: Display Order Persistence**
    - **Validates: Requirements 4.4**

- [ ] 10. تحسين البحث
  - [ ] 10.1 إضافة search highlighting
    - إنشاء `highlightText` utility function
    - تطبيق على الأسماء العربية والإنجليزية
    - _Requirements: 4.5_

  - [ ]* 10.2 كتابة property test للـ search highlighting
    - **Property 6: Search Highlighting**
    - **Validates: Requirements 4.5**

- [ ] 11. Checkpoint - التحقق من OptionsPage improvements
  - Ensure all tests pass, ask the user if questions arise.

## Phase 5: تحسين ProductsPage

- [x] 12. تحسين ProductCard






  - [x] 12.1 إضافة Template Badge

    - عرض badge يوضح نوع القالب (Simple/Medium/Complex)
    - ألوان مختلفة لكل نوع
    - _Requirements: 5.1_

  - [ ]* 12.2 كتابة property test للـ template badge
    - **Property 7: Template Badge Display**
    - **Validates: Requirements 5.1**


  - [x] 12.3 تحسين Option Groups Badge

    - عرض عدد المجموعات المرتبطة
    - tooltip يعرض أسماء المجموعات
    - _Requirements: 5.2_

  - [ ]* 12.4 كتابة property test للـ option groups count
    - **Property 8: Option Groups Count Accuracy**
    - **Validates: Requirements 5.2**

- [x] 13. تحسين UnifiedProductForm






  - [x] 13.1 تنظيم الـ form في tabs

    - Tab 1: Details (الاسم، الفئة، السعر)
    - Tab 2: Template (اختيار القالب)
    - Tab 3: Options (مجموعات الخيارات)
    - Tab 4: Nutrition (القيم الغذائية)
    - _Requirements: 5.3_


  - [x] 13.2 إضافة Template compatibility validation

    - التحقق من توافق الخيارات مع القالب
    - عرض تحذير إذا كان هناك عدم توافق
    - _Requirements: 5.5_

  - [ ]* 13.3 كتابة property test للـ compatibility
    - **Property 9: Template-Options Compatibility**
    - **Validates: Requirements 5.5**

- [ ] 14. Checkpoint - التحقق من ProductsPage improvements
  - Ensure all tests pass, ask the user if questions arise.

## Phase 6: تحليل الفجوات والتوثيق

- [x] 15. تحليل وتوثيق الفجوات






  - [x] 15.1 إنشاء تقرير تحليل الفجوات

    - إنشاء `soft-cream-nextjs/docs/ADMIN_GAP_ANALYSIS.md`
    - قائمة المكونات التي لا تستخدم النظام الجديد
    - قائمة الميزات المفقودة
    - _Requirements: 6.1, 6.2_


  - [x] 15.2 إنشاء خطة التحسين

    - ترتيب التحسينات حسب الأولوية (high, medium, low)
    - تقدير الجهد لكل تحسين
    - _Requirements: 6.3, 6.4_

- [ ] 16. Final Checkpoint - التأكد من اكتمال كل شيء
  - Ensure all tests pass, ask the user if questions arise.
