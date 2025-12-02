# Implementation Plan

- [ ] 1. Create validation service and types
  - [x] 1.1 Create validation types and interfaces





    - Create `src/lib/admin/validation/types.ts` with ValidationResult, ValidationError, ValidationWarning interfaces
    - Define error codes and warning codes as constants
    - _Requirements: 1.4, 3.1, 3.2, 3.3, 3.4_

  - [x] 1.2 Implement core validation functions





    - Create `src/lib/admin/validation/index.ts`
    - Implement `validateProductData()` for required fields validation
    - Implement `validateOptionGroupAssignment()` for min/max validation
    - Implement `validateUnifiedProductData()` as main validation entry point
    - _Requirements: 1.4, 3.1, 3.2, 3.3, 3.4_

  - [ ] 1.3 Write property test for required fields validation
    - **Property 2: Required Fields Validation**
    - **Validates: Requirements 1.4**

  - [ ] 1.4 Write property test for min-max selection validation
    - **Property 6: Min-Max Selection Validation**
    - **Validates: Requirements 3.1**

  - [ ] 1.5 Write property test for required group auto-correction
    - **Property 7: Required Group Auto-Correction**
    - **Validates: Requirements 3.2**

  - [ ] 1.6 Write property test for duplicate group prevention
    - **Property 8: Duplicate Group Prevention**
    - **Validates: Requirements 3.3**

  - [ ] 1.7 Write property test for max selections bounds warning
    - **Property 9: Max Selections Bounds Warning**
    - **Validates: Requirements 3.4**

- [ ] 2. Create template service
  - [x] 2.1 Implement template definitions and service





    - Create `src/lib/admin/templates.ts`
    - Define PRODUCT_TEMPLATES constant with byo_ice_cream, milkshake, standard templates
    - Implement `getTemplateForProductType()` function
    - Implement `applySuggestedGroups()` function
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [ ] 2.2 Write property test for product type template suggestions
    - **Property 1: Product Type Template Suggestions**
    - **Validates: Requirements 1.2**

- [ ] 3. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Create UnifiedProductForm component





  - [x] 4.1 Create form types and initial state


    - Create `src/components/admin/products/UnifiedProductForm/types.ts`
    - Define UnifiedProductData, OptionGroupAssignment, ContainerAssignment, SizeAssignment interfaces
    - Define initial form state
    - _Requirements: 1.1, 1.3_


  - [x] 4.2 Implement ProductDetailsSection

    - Create `src/components/admin/products/UnifiedProductForm/ProductDetailsSection.tsx`
    - Include all existing product fields (name, category, price, nutrition, etc.)
    - Add product_type selector with template trigger
    - _Requirements: 1.1, 1.2_

  - [x] 4.3 Implement OptionGroupsSection


    - Create `src/components/admin/products/UnifiedProductForm/OptionGroupsSection.tsx`
    - Display available option groups for assignment
    - Allow configuration of is_required, min_selections, max_selections per group
    - Show inline validation errors and warnings
    - _Requirements: 1.3, 3.1, 3.2, 3.3, 3.4_

  - [x] 4.4 Implement ContainersSection


    - Create `src/components/admin/products/UnifiedProductForm/ContainersSection.tsx`
    - Display available containers for selection
    - Allow setting default container
    - _Requirements: 1.3_


  - [x] 4.5 Implement SizesSection

    - Create `src/components/admin/products/UnifiedProductForm/SizesSection.tsx`
    - Display available sizes for selection
    - Allow setting default size
    - _Requirements: 1.3_


  - [x] 4.6 Implement ValidationSummary component

    - Create `src/components/admin/products/UnifiedProductForm/ValidationSummary.tsx`
    - Display all errors and warnings before save
    - Block save if errors exist, allow save with warnings after confirmation
    - _Requirements: 7.3_

  - [x] 4.7 Assemble UnifiedProductForm main component


    - Create `src/components/admin/products/UnifiedProductForm/index.tsx`
    - Integrate all sections with tabs or accordion layout
    - Wire up validation on change and on submit
    - Handle template application when product_type changes
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [x] 4.8 Write property test for customizable product warning


    - **Property 12: Customizable Product Warning**
    - **Validates: Requirements 7.1**

  - [x] 4.9 Write property test for missing defaults warning

    - **Property 13: Missing Defaults Warning**
    - **Validates: Requirements 7.2**

- [ ] 5. Checkpoint - Ensure all tests pass





  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Update backend API for unified operations
  - [x] 6.1 Create unified product creation endpoint





    - Update `softcream-api/src/routes/admin/products.js`
    - Modify `handleCreateProduct` to accept optionGroups, containers, sizes in request body
    - Implement transaction-like behavior (save all or rollback)
    - _Requirements: 1.5_

  - [x] 6.2 Create full product fetch endpoint




    - Add `handleGetProductFull` handler for GET /admin/products/:id/full
    - Return product with all assignments (option groups, containers, sizes)
    - _Requirements: 2.1_



  - [ ] 6.3 Write property test for atomic save operations

    - **Property 3: Atomic Save Operations**
    - **Validates: Requirements 1.5, 2.4**

  - [ ] 6.4 Write property test for product data loading consistency
    - **Property 4: Product Data Loading Consistency**

    - **Validates: Requirements 2.1**


- [x] 7. Implement edit mode with change preview






  - [x] 7.1 Add change tracking to UnifiedProductForm




    - Track original data vs current data
    - Implement `getChanges()` function to compute diff
    - _Requirements: 2.2_


  - [x] 7.2 Implement ChangePreviewModal

    - Create `src/components/admin/products/UnifiedProductForm/ChangePreviewModal.tsx`
    - Display added, removed, and modified assignments
    - Show warning for required group removal
    - _Requirements: 2.2, 2.3_

  - [x] 7.3 Write property test for required group removal warning


    - **Property 5: Required Group Removal Warning**
    - **Validates: Requirements 2.3**

- [ ] 8. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. Create OptionGroupsBadge component
  - [ ] 9.1 Implement OptionGroupsBadge with tooltip

    - Create `src/components/admin/products/OptionGroupsBadge.tsx`
    - Display count badge on product card
    - Show tooltip with group names on hover
    - _Requirements: 4.1, 4.2_


  - [ ] 9.2 Update ProductCard to use OptionGroupsBadge

    - Modify `src/components/admin/products/ProductCard.tsx`
    - Fetch and display assigned groups count
    - _Requirements: 4.1, 4.3_

  - [ ] 9.3 Write property test for option groups badge accuracy

    - **Property 10: Option Groups Badge Accuracy**
    - **Validates: Requirements 4.1**

- [ ] 10. Implement bulk actions
  - [x] 10.1 Add product selection to ProductsPage






    - Add checkbox selection to ProductCard
    - Track selected products in ProductsPage state
    - Show bulk actions toolbar when products selected
    - _Requirements: 6.1_

  - [-] 10.2 Implement BulkAssignModal







    - Create `src/components/admin/products/BulkAssignModal.tsx`
    - Allow selecting option group and configuring rules
    - Display selected products count
    - _Requirements: 6.2_

  - [ ] 10.3 Create bulk assignment API endpoint


    - Add `handleBulkAssignOptionGroup` to backend
    - Process each product and collect results
    - Return success/failure for each product
    - _Requirements: 6.3_

  - [ ] 10.4 Write property test for bulk assignment application
    - **Property 11: Bulk Assignment Application**
    - **Validates: Requirements 6.3**

- [x] 11. Integrate and update ProductsPage








  - [x] 11.1 Replace ProductForm with UnifiedProductForm





    - Update `src/components/admin/products/index.tsx`
    - Remove old ProductForm import, use UnifiedProductForm
    - Update form submission handler
    - _Requirements: 1.1, 2.1_

  - [x] 11.2 Remove or deprecate ConfigModal






    - ConfigModal functionality now in UnifiedProductForm
    - Keep for backward compatibility or remove entirely
    - _Requirements: 1.1_

  - [x] 11.3 Update products.api.ts with new endpoints






    - Add `createProductUnified()` function
    - Add `getProductFull()` function
    - Add `bulkAssignOptionGroup()` function
    - _Requirements: 1.5, 2.1, 6.3_

- [ ] 12. Final Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

