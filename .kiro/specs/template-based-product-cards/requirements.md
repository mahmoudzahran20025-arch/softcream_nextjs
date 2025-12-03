# Requirements Document

## Introduction

هذا المستند يحدد متطلبات تحسين تصميمات ProductCard في واجهة العميل بحيث تكون مختلفة ومميزة لكل Template (Simple, Medium, Complex). الهدف هو عرض بيانات مميزة وتصميمات فريدة تتناسب مع طبيعة كل منتج مع التركيز على:

- **UX/UI احترافي** - تصميمات جذابة وسهلة الاستخدام
- **تسويقي** - عرض المنتجات بشكل يشجع على الشراء
- **صحي** - إبراز القيم الغذائية والفوائد الصحية

### الوضع الحالي:
- `StandardProductCard` - تصميم موحد للمنتجات المتوسطة
- `CompactProductCard` - تصميم مصغر للمنتجات البسيطة
- `BYOProductCard` - تصميم خاص بـ Build Your Own
- `FeaturedProductCard` - تصميم للمنتجات المميزة

### المشكلة:
- التصميمات متشابهة نسبياً ولا تستفيد من بيانات Templates
- لا يوجد تمييز بصري واضح بين أنواع المنتجات
- البيانات المعروضة محدودة ولا تعكس تعقيد المنتج
- أيقونات غير احترافية (emoji بدلاً من Lucide)
- عدم وجود Quantity selector مناسب لكل نوع
- منتجات BYO تضيف للسلة بدلاً من فتح صفحة التخصيص

## Glossary

- **ProductCard**: بطاقة عرض المنتج في صفحة المنتجات والصفحة الرئيسية
- **Template**: قالب يحدد تعقيد المنتج (Simple, Medium, Complex)
- **layout_mode**: حقل في المنتج يحدد نوع القالب
- **options_preview**: بيانات معاينة الخيارات المتاحة للمنتج
- **Health Badges**: شارات صحية تعرض معلومات غذائية باستخدام أيقونات Lucide
- **Quick Add**: إضافة سريعة للسلة بدون فتح modal (للمنتجات البسيطة فقط)
- **Customization Count**: عدد خيارات التخصيص المتاحة
- **Nutrition Swiper**: عرض دوار للقيم الغذائية (سعرات، بروتين، طاقة)
- **Lucide Icons**: مكتبة أيقونات احترافية (Flame, Zap, Heart, Leaf, etc.)
- **Quantity Selector**: محدد الكمية (يظهر فقط في البطاقات المناسبة)

## Requirements

### Requirement 1: SimpleCard - بطاقة المنتجات البسيطة

**User Story:** كعميل، أريد رؤية المنتجات البسيطة بتصميم مصغر وسريع، حتى أتمكن من الإضافة للسلة بسرعة.

#### Acceptance Criteria

1. WHEN a product has layout_mode='simple' or template_id='template_simple' THEN THE ProductCard SHALL render SimpleCard component
2. WHEN SimpleCard renders THEN THE system SHALL display product image, name, and price only
3. WHEN user hovers over SimpleCard THEN THE system SHALL show Quick Add button overlay with Lucide ShoppingCart icon
4. WHEN user clicks Quick Add THEN THE system SHALL add product to cart without opening modal
5. WHEN SimpleCard renders THEN THE system SHALL use compact dimensions (max-height: 200px)
6. WHEN product has calories THEN THE system SHALL display calorie badge with Lucide Flame icon on image
7. WHEN SimpleCard renders THEN THE system SHALL include inline Quantity Selector (1-5 range)
8. WHEN product has badge THEN THE system SHALL display badge with gradient background

### Requirement 2: MediumCard - بطاقة المنتجات المتوسطة

**User Story:** كعميل، أريد رؤية المنتجات المتوسطة مع preview للخيارات المتاحة، حتى أعرف ما يمكنني تخصيصه.

#### Acceptance Criteria

1. WHEN a product has layout_mode='medium' or template_id='template_medium' THEN THE ProductCard SHALL render MediumCard component
2. WHEN MediumCard renders THEN THE system SHALL display product image, name, price, and short description (max 2 lines)
3. WHEN product has options_preview THEN THE system SHALL display up to 3 featured options as circular thumbnails with tooltip
4. WHEN product has health_keywords THEN THE system SHALL display up to 2 Health Badges with Lucide icons (Heart, Leaf, Zap)
5. WHEN MediumCard renders THEN THE system SHALL show "اعرف المزيد" button with Lucide ChevronLeft icon
6. WHEN user clicks card THEN THE system SHALL navigate to product detail page
7. WHEN product has energy_type THEN THE system SHALL display energy badge with Lucide icon (Brain for mental, Activity for physical, Zap for balanced)
8. WHEN MediumCard renders THEN THE system SHALL include Quantity Selector with add to cart button
9. WHEN product has multiple nutrition values THEN THE system SHALL display rotating Nutrition Swiper (calories, protein, energy)
10. WHEN product has description THEN THE system SHALL display it with elegant typography

### Requirement 3: ComplexCard - بطاقة المنتجات المعقدة (BYO)

**User Story:** كعميل، أريد رؤية المنتجات المعقدة (BYO) بتصميم premium يوضح إمكانيات التخصيص، حتى أشعر بالحماس لتصميم منتجي.

#### Acceptance Criteria

1. WHEN a product has layout_mode='complex' or template_id='template_complex' THEN THE ProductCard SHALL render ComplexCard component
2. WHEN ComplexCard renders THEN THE system SHALL use premium gradient background (pink to purple)
3. WHEN ComplexCard renders THEN THE system SHALL display large product image with hover animation (scale and rotate)
4. WHEN product has options_preview THEN THE system SHALL display customization count badge with Lucide Sparkles icon showing total options
5. WHEN ComplexCard renders THEN THE system SHALL show "صمم بنفسك" CTA button with Lucide Palette icon
6. WHEN user clicks ComplexCard or CTA button THEN THE system SHALL navigate to product page (NOT add to cart directly)
7. WHEN user hovers over ComplexCard THEN THE system SHALL apply glow effect and scale animation
8. WHEN product has health_keywords THEN THE system SHALL display up to 3 Health Badges with overlay variant using Lucide icons
9. WHEN ComplexCard renders THEN THE system SHALL display "يبدأ من" price label with large typography
10. WHEN ComplexCard renders THEN THE system SHALL NOT show Quantity Selector (user must customize first)
11. WHEN ComplexCard renders THEN THE system SHALL display floating animated icons (Sparkles, IceCream) for premium feel
12. WHEN product has description THEN THE system SHALL display it as tagline below product name

### Requirement 4: البيانات المميزة المشتركة

**User Story:** كعميل، أريد رؤية بيانات مميزة في كل بطاقة تساعدني على اتخاذ قرار الشراء.

#### Acceptance Criteria

1. WHEN any ProductCard renders THEN THE system SHALL display product badge if available with gradient styling
2. WHEN product has discount_percentage THEN THE system SHALL display original price with strikethrough and discount badge with Lucide Tag icon
3. WHEN product is unavailable THEN THE system SHALL display "غير متاح" overlay with Lucide XCircle icon and disable interactions
4. WHEN product has energy_score greater than 0 THEN THE system SHALL display energy indicator with Lucide Zap icon
5. WHEN any card renders THEN THE system SHALL support dark mode styling with appropriate color schemes
6. WHEN product has allergens THEN THE system SHALL display warning icon with Lucide AlertTriangle

### Requirement 5: أيقونات Lucide الاحترافية

**User Story:** كعميل، أريد رؤية أيقونات احترافية وواضحة بدلاً من الإيموجي، حتى تبدو الواجهة أكثر احترافية.

#### Acceptance Criteria

1. WHEN displaying calories badge THEN THE system SHALL use Lucide Flame icon with orange color
2. WHEN displaying protein info THEN THE system SHALL use Lucide Dumbbell icon with blue color
3. WHEN displaying energy info THEN THE system SHALL use Lucide Zap icon with amber color
4. WHEN displaying health benefits THEN THE system SHALL use Lucide Heart or Leaf icons with green color
5. WHEN displaying customization options THEN THE system SHALL use Lucide Palette or Sparkles icons
6. WHEN displaying cart actions THEN THE system SHALL use Lucide ShoppingCart icon
7. WHEN displaying navigation THEN THE system SHALL use Lucide ChevronLeft icon (RTL support)

### Requirement 6: Nutrition Swiper - عرض القيم الغذائية

**User Story:** كعميل مهتم بالصحة، أريد رؤية القيم الغذائية بشكل دوار وجذاب، حتى أتمكن من اتخاذ قرارات صحية.

#### Acceptance Criteria

1. WHEN product has multiple nutrition values THEN THE system SHALL display rotating text showing calories, protein, and energy
2. WHEN Nutrition Swiper rotates THEN THE system SHALL use smooth fade transition (300ms)
3. WHEN displaying calories THEN THE system SHALL show "{value} سعرة" with Flame icon
4. WHEN displaying protein THEN THE system SHALL show "{value}g بروتين" with Dumbbell icon
5. WHEN displaying energy THEN THE system SHALL show "طاقة {score}" with Zap icon
6. WHEN Nutrition Swiper renders THEN THE system SHALL rotate every 3 seconds

### Requirement 7: التوافق مع النظام الحالي

**User Story:** كمطور، أريد أن تتوافق البطاقات الجديدة مع النظام الحالي، حتى لا تحدث مشاكل في الكود.

#### Acceptance Criteria

1. WHEN ProductCard component receives product THEN THE system SHALL automatically select correct card type based on template_id or layout_mode
2. WHEN forceCardType prop is provided THEN THE system SHALL override automatic selection
3. WHEN product lacks template_id and layout_mode THEN THE system SHALL fallback to MediumCard (StandardProductCard)
4. WHEN card type changes THEN THE system SHALL maintain consistent API for onAddToCart callback
5. WHEN rendering in grid THEN THE system SHALL maintain consistent card heights within same row

### Requirement 8: الأداء والتحسينات

**User Story:** كعميل، أريد أن تكون البطاقات سريعة التحميل وسلسة، حتى تكون تجربة التصفح ممتعة.

#### Acceptance Criteria

1. WHEN ProductCard renders THEN THE system SHALL lazy load product images using Next.js Image
2. WHEN multiple cards render THEN THE system SHALL use CSS containment for performance
3. WHEN animations play THEN THE system SHALL use GPU-accelerated transforms only (transform, opacity)
4. WHEN card state changes THEN THE system SHALL use optimistic UI updates
5. WHEN product data is missing THEN THE system SHALL display graceful fallback UI with placeholder

### Requirement 9: تجربة المستخدم التسويقية

**User Story:** كصاحب متجر، أريد أن تشجع البطاقات العملاء على الشراء، حتى تزيد المبيعات.

#### Acceptance Criteria

1. WHEN product has badge THEN THE system SHALL display it prominently with eye-catching gradient
2. WHEN product has discount THEN THE system SHALL highlight savings with contrasting colors
3. WHEN ComplexCard renders THEN THE system SHALL create sense of excitement with animations
4. WHEN MediumCard shows options THEN THE system SHALL create curiosity to explore more
5. WHEN SimpleCard renders THEN THE system SHALL make purchase friction-free with Quick Add
6. WHEN any card is hovered THEN THE system SHALL provide visual feedback (shadow, scale)
