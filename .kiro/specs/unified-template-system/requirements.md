# Requirements Document

## Introduction

هذا المستند يحدد متطلبات توحيد وتنظيف نظام القوالب والعرض في النظام. الهدف هو إزالة التكرار والتشتت بين الحقول المختلفة وإنشاء نظام موحد وواضح.

### المشكلة الحالية:
- **4 حقول** تفعل نفس الشيء تقريباً:
  - `product_type` - نوع المنتج (غير مستخدم فعلياً)
  - `template_id` - قالب العرض (المتحكم الفعلي)
  - `layout_mode` - نسخة قديمة من template_id
  - `card_style` - تكرار مع template_id

### الهدف:
- **توحيد النظام** - استخدام `template_id` فقط للتحكم في العرض
- **إزالة التكرار** - حذف `product_type` و `card_style` من الأدمن
- **تبسيط الـ Seed Data** - تنظيف البيانات وجعلها واضحة
- **الخيارات يدوية** - الأدمن يضيف مجموعات الخيارات كما يريد

### التوثيق الكامل:
راجع ملف `softcream-api/docs/TEMPLATE_SYSTEM_PURIFICATION.md` للتفاصيل الكاملة

## Glossary

- **template_id**: معرف القالب الذي يحدد شكل البطاقة والـ Modal (`template_1`, `template_2`, `template_3`)
- **product_type**: نوع المنتج الذي يحدد قواعد التخصيص في الـ Backend (`standard`, `byo_ice_cream`, `milkshake`)
- **ProductCard**: بطاقة عرض المنتج في واجهة العميل
- **ProductModal**: نافذة التخصيص عند الضغط على المنتج
- **Option Group**: مجموعة خيارات (نكهات، صوصات، إضافات)
- **Seed Data**: البيانات الأولية في قاعدة البيانات

## Requirements

### Requirement 1: توحيد نظام القوالب

**User Story:** كمطور، أريد نظام قوالب موحد وواضح، حتى لا أتشتت بين الحقول المختلفة.

#### Acceptance Criteria

1. WHEN المنتج له `template_id` THEN النظام SHALL يستخدمه لتحديد شكل البطاقة والـ Modal
2. WHEN المنتج ليس له `template_id` THEN النظام SHALL يستخدم `template_2` كقيمة افتراضية
3. WHEN الأدمن يختار قالب THEN النظام SHALL يحفظ القيمة في `template_id` فقط
4. WHEN الأدمن يحفظ المنتج THEN النظام SHALL يزامن `layout_mode` تلقائياً مع `template_id`

### Requirement 2: تبسيط واجهة الأدمن

**User Story:** كمسؤول، أريد واجهة بسيطة لاختيار القالب، بدون خيارات مكررة.

#### Acceptance Criteria

1. WHEN الأدمن يفتح فورم المنتج THEN النظام SHALL يعرض خيار "القالب" فقط (بدون card_style)
2. WHEN الأدمن يختار قالب THEN النظام SHALL يعرض وصف واضح لكل قالب
3. WHEN الأدمن يختار `template_1` THEN النظام SHALL يعرض "بسيط - إضافة سريعة للسلة"
4. WHEN الأدمن يختار `template_2` THEN النظام SHALL يعرض "متوسط - معاينة الخيارات"
5. WHEN الأدمن يختار `template_3` THEN النظام SHALL يعرض "معقد - تخصيص كامل (BYO)"

### Requirement 3: إزالة الحقول المكررة من الأدمن

**User Story:** كمسؤول، أريد واجهة نظيفة بدون خيارات مشتتة.

#### Acceptance Criteria

1. WHEN الأدمن يفتح تبويب "تفاصيل المنتج" THEN النظام SHALL لا يعرض قسم "نمط عرض البطاقة" (card_style)
2. WHEN الأدمن يفتح تبويب "تفاصيل المنتج" THEN النظام SHALL يعرض قسم "نوع المنتج" (product_type) بشكل مبسط
3. WHEN الأدمن يفتح تبويب "القالب" THEN النظام SHALL يعرض اختيار القالب فقط
4. WHEN الأدمن يحفظ المنتج THEN النظام SHALL لا يرسل `card_style` للـ Backend

### Requirement 4: تحديث Seed Data

**User Story:** كمطور، أريد بيانات seed واضحة ومنظمة، حتى أفهم النظام بسهولة.

#### Acceptance Criteria

1. WHEN النظام يعمل seed THEN النظام SHALL يستخدم `template_id` فقط (بدون card_style)
2. WHEN المنتج بسيط THEN النظام SHALL يعين `template_id = 'template_1'`
3. WHEN المنتج متوسط THEN النظام SHALL يعين `template_id = 'template_2'`
4. WHEN المنتج معقد (BYO) THEN النظام SHALL يعين `template_id = 'template_3'`
5. WHEN النظام يعمل seed THEN النظام SHALL يزامن `layout_mode` تلقائياً

### Requirement 5: توافق ProductCard مع القوالب

**User Story:** كعميل، أريد رؤية البطاقة المناسبة لكل نوع منتج.

#### Acceptance Criteria

1. WHEN المنتج له `template_id = 'template_1'` THEN ProductCard SHALL يعرض SimpleCard
2. WHEN المنتج له `template_id = 'template_2'` THEN ProductCard SHALL يعرض StandardProductCard
3. WHEN المنتج له `template_id = 'template_3'` THEN ProductCard SHALL يعرض WizardCard/BYOProductCard
4. WHEN المنتج ليس له template_id THEN ProductCard SHALL يعرض StandardProductCard (افتراضي)

### Requirement 6: توافق ProductModal مع القوالب

**User Story:** كعميل، أريد رؤية نافذة التخصيص المناسبة لكل نوع منتج.

#### Acceptance Criteria

1. WHEN المنتج له `template_id = 'template_1'` THEN ProductModal SHALL يعرض SimpleTemplate (إضافة مباشرة)
2. WHEN المنتج له `template_id = 'template_2'` THEN ProductModal SHALL يعرض MediumTemplate (خيارات محدودة)
3. WHEN المنتج له `template_id = 'template_3'` THEN ProductModal SHALL يعرض ComplexTemplate (تخصيص كامل)
4. WHEN المنتج ليس له template_id THEN ProductModal SHALL يعرض MediumTemplate (افتراضي)

### Requirement 7: الحفاظ على product_type للـ Backend

**User Story:** كمطور، أريد الحفاظ على `product_type` لأنه يحدد قواعد التخصيص.

#### Acceptance Criteria

1. WHEN الأدمن يختار نوع المنتج THEN النظام SHALL يحفظ القيمة في `product_type`
2. WHEN المنتج `byo_ice_cream` THEN النظام SHALL يقترح مجموعات الخيارات المناسبة
3. WHEN المنتج `milkshake` THEN النظام SHALL يقترح الأحجام والنكهات
4. WHEN المنتج `standard` THEN النظام SHALL لا يقترح مجموعات خيارات

### Requirement 8: تصغير قسم الخصومات

**User Story:** كمسؤول، أريد قسم خصومات مصغر وأنيق، بدون مساحة كبيرة.

#### Acceptance Criteria

1. WHEN الأدمن يفتح قسم التسعير THEN النظام SHALL يعرض حقول السعر والخصم في صف واحد
2. WHEN الأدمن يدخل سعر قديم THEN النظام SHALL يعرض معاينة مصغرة للخصم
3. WHEN لا يوجد خصم THEN النظام SHALL يخفي قسم المعاينة
4. WHEN الأدمن يحفظ المنتج THEN النظام SHALL يحفظ `old_price` و `discount_percentage`

