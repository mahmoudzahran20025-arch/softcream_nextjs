# Implementation Plan

## Phase 1: المكونات المشتركة

- [x] 1. إنشاء NutritionSwiper Component






  - [x] 1.1 إنشاء NutritionSwiper component

    - إنشاء `src/components/ui/common/NutritionSwiper.tsx`
    - عرض دوار للسعرات والبروتين والطاقة
    - استخدام Lucide icons (Flame, Dumbbell, Zap)
    - تبديل كل 3 ثواني مع fade transition
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

  - [ ]* 1.2 كتابة property test للـ Nutrition Swiper
    - **Property 10: Nutrition Swiper Rotation**
    - **Validates: Requirements 6.1**

- [x] 2. تحديث HealthBadges Component





  - [x] 2.1 تحديث HealthBadges لاستخدام Lucide icons


    - تحديث `src/components/ui/health/HealthBadges.tsx`
    - استبدال emoji بـ Lucide icons (Heart, Leaf, Zap)
    - إضافة prop لـ maxBadges
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 3. Checkpoint - التحقق من المكونات المشتركة
  - Ensure all tests pass, ask the user if questions arise.

## Phase 2: SimpleCard

- [x] 4. إنشاء SimpleCard Component






  - [x] 4.1 إنشاء SimpleCard component

    - إنشاء `src/components/ui/cards/SimpleCard.tsx`
    - تصميم مصغر (max-height: 280px)
    - صورة مربعة مع badges (calories, energy)
    - اسم المنتج (سطر واحد)
    - Health badge واحد
    - Quantity Selector (1-5)
    - زر Quick Add مع ShoppingCart icon
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8_

  - [ ]* 4.2 كتابة property test للـ SimpleCard calories badge
    - **Property 8: Conditional Badge Display**
    - **Validates: Requirements 4.1**

- [x] 5. Checkpoint - التحقق من SimpleCard





  - Ensure all tests pass, ask the user if questions arise.

## Phase 3: MediumCard

- [x] 6. تحديث MediumCard (StandardProductCard)






  - [x] 6.1 تحديث StandardProductCard ليصبح MediumCard

    - تحديث `src/components/ui/cards/StandardProductCard.tsx`
    - إضافة Energy + Calories badges على الصورة
    - تحديث Options Preview (3 circles max)
    - إضافة NutritionSwiper
    - تحديث Health Badges (2 max) مع Lucide icons
    - تحديد max-height: 320px
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 2.10_

  - [ ]* 6.2 كتابة property test للـ Options Preview limit
    - **Property 6: Options Preview Limit**
    - **Validates: Requirements 2.3**

  - [ ]* 6.3 كتابة property test للـ Health Badges limit
    - **Property 7: Health Badges Limit**
    - **Validates: Requirements 2.4, 3.8**

- [ ] 7. Checkpoint - التحقق من MediumCard
  - Ensure all tests pass, ask the user if questions arise.

## Phase 4: ComplexCard

- [x] 8. تحديث ComplexCard (BYOProductCard)




  - [x] 8.1 تحديث BYOProductCard ليصبح ComplexCard


    - تحديث `src/components/ui/cards/BYOProductCard.tsx`
    - Gradient background (pink → purple)
    - Energy + Calories badges على الصورة
    - Customization count badge مع Sparkles icon
    - إضافة NutritionSwiper
    - Health Badges (3 max) مع overlay variant
    - "يبدأ من" price label
    - زر "صمم بنفسك" مع Palette icon (أبيض/وردي)
    - إزالة Quantity Selector
    - Navigation بدلاً من Add to Cart
    - تحديد max-height: 340px
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10, 3.11, 3.12_

  - [ ]* 8.2 كتابة property test للـ ComplexCard navigation
    - **Property 4: ComplexCard Navigation Behavior**
    - **Validates: Requirements 3.6**

  - [ ]* 8.3 كتابة property test للـ ComplexCard no quantity
    - **Property 5: ComplexCard No Quantity Selector**
    - **Validates: Requirements 3.10**

- [ ] 9. Checkpoint - التحقق من ComplexCard
  - Ensure all tests pass, ask the user if questions arise.

## Phase 5: ProductCard Smart Selector

- [-] 10. تحديث ProductCard Smart Selector



  - [x] 10.1 تحديث ProductCard component


    - تحديث `src/components/ui/ProductCard.tsx`
    - تحديث getCardType logic للـ template_id و layout_mode
    - إضافة SimpleCard للـ switch
    - تحديث fallback إلى MediumCard
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

  - [ ]* 10.2 كتابة property test للـ Card Type Selection
    - **Property 1: Card Type Selection**
    - **Validates: Requirements 1.1, 2.1, 3.1, 7.1**

  - [ ]* 10.3 كتابة property test للـ Fallback Card Type
    - **Property 2: Fallback Card Type**
    - **Validates: Requirements 7.3**

  - [ ]* 10.4 كتابة property test للـ Force Card Type
    - **Property 3: Force Card Type Override**
    - **Validates: Requirements 7.2**

- [ ] 11. Checkpoint - التحقق من ProductCard
  - Ensure all tests pass, ask the user if questions arise.

## Phase 6: البيانات المشتركة والتحسينات

- [x] 12. تحسينات مشتركة





  - [x] 12.1 إضافة Unavailable Overlay


    - إضافة overlay "غير متاح" مع XCircle icon
    - تعطيل التفاعلات
    - _Requirements: 4.3_


  - [ ] 12.2 إضافة Discount Display
    - عرض السعر الأصلي مع خط
    - badge الخصم مع Tag icon
    - _Requirements: 4.2_



  - [ ] 12.3 تحسين Dark Mode
    - التأكد من دعم dark mode في جميع البطاقات
    - _Requirements: 4.5_

  - [ ]* 12.4 كتابة property test للـ Unavailable Overlay
    - **Property 9: Unavailable Product Overlay**
    - **Validates: Requirements 4.3**

- [ ] 13. Final Checkpoint - التأكد من اكتمال كل شيء
  - Ensure all tests pass, ask the user if questions arise.
