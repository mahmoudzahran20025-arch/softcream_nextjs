# 🎨 نظام التصميم - لوحة التحكم

## 🎯 دليل سريع لاستخدام نظام التصميم

---

## 📦 المكونات الجاهزة

### 1. Section Container

```tsx
<div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl p-5 border-2 border-pink-200">
  <h3 className="text-lg font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-4 flex items-center gap-2">
    <span>📝</span> عنوان القسم
  </h3>
  {/* محتوى القسم */}
</div>
```

### 2. Input Field

```tsx
<div>
  <label className="block text-sm font-semibold text-gray-700 mb-2">
    اسم الحقل *
  </label>
  <input
    type="text"
    required
    className="w-full px-4 py-2.5 border-2 border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all bg-white"
    placeholder="مثال..."
  />
</div>
```

### 3. Textarea Field

```tsx
<div>
  <label className="block text-sm font-semibold text-gray-700 mb-2">
    📄 الوصف
  </label>
  <textarea
    rows={3}
    className="w-full px-4 py-2.5 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white resize-none"
    placeholder="اكتب الوصف..."
  />
</div>
```

### 4. Select Field

```tsx
<div>
  <label className="block text-sm font-semibold text-gray-700 mb-2">
    اختر نوع
  </label>
  <select className="w-full px-4 py-2.5 border-2 border-yellow-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all bg-white">
    <option value="">اختر...</option>
    <option value="1">🧠 خيار 1</option>
    <option value="2">💪 خيار 2</option>
  </select>
</div>
```

### 5. Checkbox

```tsx
<label className="flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all hover:scale-105">
  <input
    type="checkbox"
    className="w-4 h-4 text-purple-600 border-purple-300 rounded focus:ring-purple-500"
  />
  <div className="flex-1">
    <div className="text-sm font-bold text-gray-800">العنوان</div>
    <div className="text-xs text-gray-500">الوصف</div>
  </div>
</label>
```

### 6. Primary Button

```tsx
<button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl hover:shadow-xl hover:scale-105 transition-all font-bold">
  <Icon size={20} />
  <span>✨ نص الزر</span>
</button>
```

### 7. Secondary Button

```tsx
<button className="px-6 py-3 text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-100 hover:border-gray-400 transition-all font-semibold">
  ❌ إلغاء
</button>
```

### 8. Product Card

```tsx
<div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:border-pink-300 hover:shadow-lg transition-all flex flex-col h-full">
  {/* Image */}
  <div className="relative w-full h-40 bg-gradient-to-br from-pink-50 to-purple-50 rounded-t-xl overflow-hidden">
    <Image src={image} alt={name} fill className="object-cover" />
  </div>
  
  {/* Content */}
  <div className="p-4 flex-1 flex flex-col">
    <div className="flex-1">
      <h3 className="font-bold text-base text-gray-800 line-clamp-1">{name}</h3>
    </div>
    
    {/* Actions */}
    <div className="flex items-center gap-2 mt-4 pt-3 border-t">
      {/* أزرار */}
    </div>
  </div>
</div>
```

---

## 🎨 نظام الألوان

### Brand Colors

```css
/* Primary Gradient */
from-pink-500 to-purple-600

/* Pink Scale */
pink-50   #fdf2f8
pink-100  #fce7f3
pink-200  #fbcfe8
pink-500  #ec4899
pink-600  #db2777

/* Purple Scale */
purple-50   #faf5ff
purple-100  #f3e8ff
purple-200  #e9d5ff
purple-500  #a855f7
purple-600  #9333ea
```

### Section Colors

```tsx
// المعلومات الأساسية
bg: "from-pink-50 to-purple-50"
border: "border-pink-200"
text: "from-pink-600 to-purple-600"

// الوصف
bg: "from-blue-50 to-cyan-50"
border: "border-blue-200"
text: "from-blue-600 to-cyan-600"

// التغذية
bg: "from-green-50 to-emerald-50"
border: "border-green-200"
text: "from-green-600 to-emerald-600"

// الطاقة
bg: "from-yellow-50 to-orange-50"
border: "border-yellow-200"
text: "from-yellow-600 to-orange-600"

// الإضافات
bg: "from-purple-50 to-pink-50"
border: "border-purple-200"
text: "from-purple-600 to-pink-600"

// إضافية
bg: "from-gray-50 to-slate-50"
border: "border-gray-200"
text: "from-gray-700 to-slate-700"
```

---

## 📏 Spacing System

```tsx
// Padding
p-2    // 0.5rem (8px)
p-3    // 0.75rem (12px)
p-4    // 1rem (16px)
p-5    // 1.25rem (20px)
p-6    // 1.5rem (24px)

// Gap
gap-2  // 0.5rem (8px)
gap-3  // 0.75rem (12px)
gap-4  // 1rem (16px)
gap-6  // 1.5rem (24px)

// Margin
mb-2   // 0.5rem (8px)
mb-3   // 0.75rem (12px)
mb-4   // 1rem (16px)
mt-4   // 1rem (16px)
mt-6   // 1.5rem (24px)
```

---

## 🔤 Typography

```tsx
// Headings
text-3xl font-bold              // Page Title
text-2xl font-bold              // Modal Title
text-lg font-bold               // Section Title
text-base font-bold             // Card Title
text-sm font-semibold           // Label

// Body
text-base                       // Normal Text
text-sm                         // Small Text
text-xs                         // Extra Small Text

// Colors
text-gray-800                   // Primary Text
text-gray-600                   // Secondary Text
text-gray-500                   // Tertiary Text
```

---

## 🎭 Emojis Guide

### أقسام الفورم:
- 📝 المعلومات الأساسية
- 📄 الوصف
- 🥗 معلومات التغذية
- ⚡ معلومات الطاقة
- ✨ الإضافات المتاحة
- 🏷️ معلومات إضافية

### حقول التغذية:
- 🔥 السعرات الحرارية
- 💪 البروتين
- 🍞 الكربوهيدرات
- 🧈 الدهون
- 🍬 السكر
- 🌾 الألياف

### أنواع الطاقة:
- 🚫 بدون
- 🧠 ذهني
- 💪 جسدي
- ⚖️ متوازن

### الأزرار:
- ✨ حفظ / إضافة
- 💾 تحديث
- ❌ إلغاء / حذف
- ✅ تأكيد
- 💡 معلومة

---

## 🎯 Border Radius

```tsx
rounded-lg    // 0.5rem (8px) - Inputs, Buttons
rounded-xl    // 0.75rem (12px) - Cards, Sections
rounded-2xl   // 1rem (16px) - Modals
rounded-full  // 9999px - Badges, Pills
```

---

## 🌊 Transitions

```tsx
// Standard
transition-all

// With Duration
transition-all duration-200

// With Transform
transition-all transform hover:scale-105

// With Shadow
transition-all hover:shadow-xl
```

---

## 📱 Responsive Grid

```tsx
// Products Grid
grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4

// Form Fields (2 columns)
grid grid-cols-1 md:grid-cols-2 gap-4

// Nutrition Fields (6 columns)
grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3
```

---

## 🎨 Gradient Patterns

### Background Gradients:
```tsx
bg-gradient-to-br from-pink-50 to-purple-50
bg-gradient-to-br from-blue-50 to-cyan-50
bg-gradient-to-br from-green-50 to-emerald-50
bg-gradient-to-br from-yellow-50 to-orange-50
```

### Text Gradients:
```tsx
bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent
```

### Button Gradients:
```tsx
bg-gradient-to-r from-pink-500 to-purple-600
bg-gradient-to-r from-blue-50 to-cyan-50
bg-gradient-to-r from-red-50 to-pink-50
```

---

## 🎯 Focus States

```tsx
// Input Focus
focus:ring-2 focus:ring-pink-500 focus:border-pink-500

// Button Focus
focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2
```

---

## 🖼️ Image Handling

```tsx
// Fixed Height Container
<div className="relative w-full h-40 bg-gradient-to-br from-pink-50 to-purple-50 rounded-t-xl overflow-hidden">
  <Image
    src={image}
    alt={name}
    fill
    className="object-cover"
    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  />
</div>
```

---

## 💡 Best Practices

### 1. Consistency:
- استخدم نفس الألوان للأقسام المتشابهة
- حافظ على spacing متناسق
- استخدم نفس border-radius

### 2. Accessibility:
- استخدم labels واضحة
- أضف placeholders مفيدة
- تأكد من contrast جيد
- أضف focus states

### 3. Performance:
- استخدم `Image` من Next.js
- أضف `sizes` للصور
- استخدم CSS transitions بدلاً من JS

### 4. Responsive:
- اختبر على جميع الشاشات
- استخدم breakpoints مناسبة
- تأكد من touch targets كافية (44x44px)

---

## 🚀 Quick Start

### إضافة قسم جديد:

```tsx
<div className="bg-gradient-to-br from-[COLOR1]-50 to-[COLOR2]-50 rounded-xl p-5 border-2 border-[COLOR1]-200">
  <h3 className="text-lg font-bold bg-gradient-to-r from-[COLOR1]-600 to-[COLOR2]-600 bg-clip-text text-transparent mb-4 flex items-center gap-2">
    <span>[EMOJI]</span> [TITLE]
  </h3>
  
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {/* Fields */}
  </div>
</div>
```

### إضافة حقل جديد:

```tsx
<div>
  <label className="block text-sm font-semibold text-gray-700 mb-2">
    [EMOJI] [LABEL] *
  </label>
  <input
    type="text"
    required
    className="w-full px-4 py-2.5 border-2 border-[COLOR]-200 rounded-lg focus:ring-2 focus:ring-[COLOR]-500 focus:border-[COLOR]-500 transition-all bg-white"
    placeholder="[PLACEHOLDER]"
  />
</div>
```

---

## 📚 Resources

- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Tailwind Color Palette](https://tailwindcss.com/docs/customizing-colors)
- [Lucide Icons](https://lucide.dev/)
- [Next.js Image](https://nextjs.org/docs/api-reference/next/image)

---

## ✅ Checklist للصفحات الجديدة

- [ ] استخدام نظام الألوان الموحد
- [ ] إضافة gradients مناسبة
- [ ] استخدام emojis بشكل معتدل
- [ ] إضافة hover effects
- [ ] إضافة focus states
- [ ] اختبار responsive
- [ ] تحسين accessibility
- [ ] إضافة transitions
- [ ] استخدام spacing متناسق
- [ ] اختبار على جميع المتصفحات
