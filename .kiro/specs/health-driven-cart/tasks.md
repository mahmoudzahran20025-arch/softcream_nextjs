# Implementation Plan

## Health-Driven Cart Experience

- [x] 1. Backend: Database Schema Enhancement



  - [x] 1.1 Add health fields to products table

    - Add `health_keywords` TEXT column (JSON array)
    - Add `health_benefit_ar` TEXT column
    - Create migration file in `softcream-api/migrations/`
    - _Requirements: 1.1, 1.2, 1.3_
  - [x] 1.2 Write property test for health fields round-trip


    - **Property 1: Health Fields Round-Trip Consistency**
    - **Validates: Requirements 1.1, 1.2**



- [x] 2. Frontend: Health Keywords Taxonomy

  - [x] 2.1 Create health keywords constants file

    - Create `src/lib/health/keywords.ts`
    - Define HEALTH_KEYWORDS with weights and categories
    - Export HealthKeyword type
    - _Requirements: 3.1_


  - [x] 2.2 Write property test for keyword weight application




    - **Property 4: Keyword Weight Application**
    - **Validates: Requirements 3.1, 3.2**

- [x] 3. Frontend: Health Insights Library


  - [ ] 3.1 Create health insights library
    - Create `src/lib/health/insights.ts`
    - Define HealthInsight interface


    - Create 5 insight categories (high_protein, low_sugar, balanced, indulgent, fallback)
    - Each insight with title, emoji, and max 3 lines
    - _Requirements: 2.1, 2.2, 2.3, 2.4_
  - [ ] 3.2 Write property tests for insights library
    - **Property 2: Insight Lines Maximum Length**
    - **Property 3: Insight Structure Completeness**
    - **Property 8: Insight Emoji Category Match**
    - **Validates: Requirements 2.2, 2.4, 6.4**

- [x] 4. Frontend: Insight Selection Algorithm

  - [x] 4.1 Create insight selection algorithm

    - Create `src/lib/health/selectInsight.ts`
    - Implement `extractDominantKeywords()` function
    - Implement `selectHealthInsight()` function
    - Filter by score range first, then match by keywords
    - Return fallback when no match
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 4.2 Write property test for insight selection order

    - **Property 5: Insight Selection Order**
    - **Validates: Requirements 3.3**







- [ ] 5. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.



- [x] 6. Frontend: Update Health Score Calculation




  - [ ] 6.1 Enhance healthScore.ts to include customizations
    - Update `calculateHealthScore()` to include customization nutrition
    - Ensure score is always between 0-100
    - _Requirements: 4.1, 4.2, 4.3_
  - [x] 6.2 Write property tests for health score




    - **Property 6: Health Score Bounds**
    - **Property 7: Health Score Includes All Nutrition**
    - **Validates: Requirements 4.1, 4.2, 4.3**

- [ ] 7. Frontend: HealthInsightCard UI Component
  - [x] 7.1 Create HealthInsightCard component


    - Create `src/components/modals/CartModal/HealthInsightCard.tsx`




    - Gradient background (green-50 to blue-50)
    - Fade-in and slide-up animation (0.5s delay)
    - Dismiss button
    - Display emoji, title, and max 3 lines


    - _Requirements: 6.1, 6.2, 6.3, 6.4_





- [ ] 8. Frontend: Integrate Health Insights into CartModal
  - [ ] 8.1 Update CartModal to use health insights
    - Import and use selectHealthInsight


    - Pass health_keywords from products



    - Display HealthInsightCard below HealthyMeter
    - Use React.memo for performance
    - Debounce calculations by 300ms
    - Lazy load HealthInsightCard
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 9. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 10. Backend: Update Seed Data
  - [ ] 10.1 Add health_keywords to existing products in seed
    - Update `softcream-api/src/database/seed.js`
    - Assign keywords based on category and nutrition
    - Max 3 keywords per product
    - Prioritize specific keywords over generic
    - _Requirements: 8.1, 8.2, 8.3_
  - [ ] 10.2 Write property test for seed keyword assignment
    - **Property 10: Seed Keyword Assignment Rules**
    - **Validates: Requirements 8.2, 8.3**

- [ ] 11. Admin: Product Health Keywords Management
  - [ ] 11.1 Add health fields to admin product form
    - Update admin product form component
    - Add multi-select for health_keywords
    - Add text field for health_benefit_ar
    - Group keywords by category
    - _Requirements: 7.1, 7.2, 7.4_
  - [ ] 11.2 Write property test for keyword validation
    - **Property 9: Keyword Validation**
    - **Validates: Requirements 7.3**

- [ ] 12. Final Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
