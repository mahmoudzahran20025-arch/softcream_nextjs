# Implementation Plan

## Phase 1: أرشفة الملفات غير الضرورية

- [x] 1. Archive unnecessary product components






  - [x] 1.1 Move ProductWizard/ folder to archive/admin/products/

    - Move all 4 files: index.tsx, BasicInfoStep.tsx, NutritionStep.tsx, TemplateOptionsStep.tsx
    - _Requirements: 6.1_

  - [x] 1.2 Move TemplateSelector/ and TemplateBadge/ folders to archive

    - _Requirements: 6.1_

  - [x] 1.3 Move UnifiedProductForm complexity files to archive

    - Move: ChangePreviewModal.tsx, ValidationSummary.tsx, changeTracking.ts
    - Keep: index.tsx, ProductDetailsSection.tsx, OptionGroupsSection.tsx, NutritionSection.tsx, types.ts
    - _Requirements: 6.1_

- [x] 2. Archive unnecessary options components





  - [x] 2.1 Move UIConfigEditor/ folder to archive/admin/options/


    - _Requirements: 6.2_

  - [x] 2.2 Move OptionsTable.tsx and OptionCards.tsx to archive

    - Keep: OptionCard.tsx, OptionItem.tsx
    - _Requirements: 6.2_

## Phase 2: تبسيط صفحة المنتجات

- [x] 3. Simplify ProductsPage (index.tsx)






  - [x] 3.1 Remove formMode state and related logic

    - Remove setFormMode calls
    - Keep single "Add Product" button
    - _Requirements: 1.1, 1.2_

  - [x] 3.2 Add stats cards section

    - Total products, available, unavailable counts
    - _Requirements: 1.3_
  - [ ]* 3.3 Write property test for stats calculation
    - **Property 1: Stats Calculation Accuracy**
    - **Validates: Requirements 1.3**

  - [x] 3.4 Add category filter dropdown

    - _Requirements: 1.2_

- [x] 4. Simplify ProductFormModal (UnifiedProductForm/index.tsx)





  - [x] 4.1 Remove tabs navigation - convert to single scrollable form


    - Remove TABS constant and tab switching logic
    - _Requirements: 2.1, 2.5_

  - [x] 4.2 Simplify to 3 sections: Basic Info, Option Groups, Nutrition

    - Basic Info: id, name, nameEn, category, price, image, badge, available
    - Option Groups: checkboxes with settings
    - Nutrition: collapsible section
    - _Requirements: 2.2, 2.3, 2.4_

  - [x] 4.3 Set template_id='template_1' as hidden default

    - Remove template selection UI
    - _Requirements: 2.6_
  - [ ]* 4.4 Write property test for default template
    - **Property 2: Default Template Assignment**
    - **Validates: Requirements 2.6**
  - [ ]* 4.5 Write property test for option groups display
    - **Property 3: Option Groups Display Completeness**
    - **Validates: Requirements 2.3**

- [ ] 5. Checkpoint - Ensure products page works




  - Ensure all tests pass, ask the user if questions arise.

## Phase 3: تبسيط صفحة الخيارات

- [x] 6. Simplify OptionsPage (index.tsx)






  - [x] 6.1 Add stats cards section

    - Total groups, total options, available options
    - _Requirements: 3.4_

  - [x] 6.2 Ensure OptionGroupCard shows required info

    - Group name, icon, options count, expand toggle
    - _Requirements: 3.1, 3.2_
  - [ ]* 6.3 Write property test for OptionGroupCard content
    - **Property 4: OptionGroupCard Content Completeness**
    - **Validates: Requirements 3.2**

- [ ] 7. Simplify GroupFormModal
  - [ ] 7.1 Remove UIConfigEditor tab
    - Keep only 'basic' tab content
    - Remove activeTab state and tab buttons
    - _Requirements: 4.1, 4.2_
  - [ ] 7.2 Keep only essential fields
    - id, name_ar, name_en, icon picker, display_order
    - _Requirements: 4.1_

- [ ] 8. Verify OptionFormModal is simple
  - [ ] 8.1 Ensure OptionFormModal has correct fields
    - id, name_ar, name_en, base_price, image, available
    - Nutrition fields in collapsible section
    - _Requirements: 4.3_

- [ ] 9. Checkpoint - Ensure options page works
  - Ensure all tests pass, ask the user if questions arise.

## Phase 4: التكامل بين الصفحتين

- [ ] 10. Ensure option groups sync between pages
  - [ ] 10.1 Verify option groups load in ProductFormModal
    - loadOptionGroups function fetches from API
    - _Requirements: 5.1_
  - [ ]* 10.2 Write property test for option group sync
    - **Property 5: Option Group Sync Between Pages**
    - **Validates: Requirements 5.1**

- [ ] 11. Verify cascade delete behavior
  - [ ] 11.1 Test that deleting option group removes product_options
    - Backend handles cascade via API
    - _Requirements: 5.2_
  - [ ]* 11.2 Write property test for cascade delete
    - **Property 6: Cascade Delete on Option Group Removal**
    - **Validates: Requirements 5.2**

## Phase 5: التنظيف النهائي

- [ ] 12. Clean up unused imports and code
  - [ ] 12.1 Remove unused imports from all modified files
    - _Requirements: 6.3_
  - [ ] 12.2 Update types.ts files to remove unused types
    - _Requirements: 6.4_

- [ ] 13. Final Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
