import { 
  IceCream, 
  Apple, 
  Star, 
  Crown, 
  Heart, 
  Cake, 
  Coffee, 
  Cookie, 
  Sandwich, 
  Pizza,
  Salad, 
  Soup, 
  Flame, 
  Zap, 
  Leaf,
  Sparkles,
  Grid,
  Milk,
  Cherry,
  Candy,
  Croissant,
  Wheat,
  type LucideIcon
} from 'lucide-react'

/**
 * Category Icon Mapping
 * Maps category names to their corresponding Lucide icons
 * Supports both exact matches and partial matches
 */
export const CATEGORY_ICON_MAP: Record<string, LucideIcon> = {
  // ✅ آيس كريم
  'كلاسيك': IceCream,
  'آيس كريم': IceCream,
  'ايس كريم': IceCream,
  'ice cream': IceCream,
  'icecream': IceCream,
  
  // ✅ حلويات
  'كيك': Cake,
  'كوب': Coffee,
  'مثلث': Cake,
  'تشيز كيك': Cake,
  'cheesecake': Cake,
  'cake': Cake,
  'كب كيك': Cake,
  'cupcake': Cake,
  
  // ✅ فواكه وصحي
  'فواكه': Apple,
  'فاكهة': Apple,
  'fruits': Apple,
  'fruit': Apple,
  'صحي': Heart,
  'healthy': Heart,
  'دايت': Leaf,
  'diet': Leaf,
  'لايت': Leaf,
  'light': Leaf,
  
  // ✅ مميز وفاخر
  'مميز': Star,
  'special': Star,
  'فاخر': Crown,
  'premium': Crown,
  'luxury': Crown,
  
  // ✅ طواجن وساخن
  'طواجن': Soup,
  'طاجن': Soup,
  'tagine': Soup,
  'ساخن': Flame,
  'hot': Flame,
  'سخن': Flame,
  
  // ✅ طاقة وباور
  'طاقة': Zap,
  'energy': Zap,
  'باور': Zap,
  'power': Zap,
  'قوة': Zap,
  
  // ✅ أرز بلبن وحلويات تقليدية
  'أرز بلبن': Cookie,
  'ارز بلبن': Cookie,
  'rice pudding': Cookie,
  'حلويات': Cookie,
  'desserts': Cookie,
  'حلو': Cookie,
  'sweet': Cookie,
  
  // ✅ مشروبات
  'مشروبات': Coffee,
  'drinks': Coffee,
  'شراب': Coffee,
  'beverage': Coffee,
  'قهوة': Coffee,
  'coffee': Coffee,
  
  // ✅ سلطات
  'سلطة': Salad,
  'سلطات': Salad,
  'salad': Salad,
  'salads': Salad,
  
  // ✅ ساندويتش وبيتزا
  'ساندويتش': Sandwich,
  'sandwich': Sandwich,
  'برجر': Sandwich,
  'burger': Sandwich,
  'بيتزا': Pizza,
  'pizza': Pizza,
  
  // ✅ شوكولاتة
  'شوكولاتة': Sparkles,
  'شيكولاته': Sparkles,
  'chocolate': Sparkles,
  'شوكو': Sparkles,
  
  // ✅ NEW: ألبان ومنتجات الحليب
  'ألبان': Milk,
  'البان': Milk,
  'حليب': Milk,
  'لبن': Milk,
  'milk': Milk,
  'dairy': Milk,
  'يوجرت': Milk,
  'yogurt': Milk,
  
  // ✅ NEW: فواكه طازجة وتوت
  'توت': Cherry,
  'فراولة': Cherry,
  'strawberry': Cherry,
  'كرز': Cherry,
  'cherry': Cherry,
  'berry': Cherry,
  'توت بري': Cherry,
  'blueberry': Cherry,
  
  // ✅ NEW: حلويات وسكريات
  'حلوى': Candy,
  'سكر': Candy,
  'candy': Candy,
  'sugar': Candy,
  'كاندي': Candy,
  'جيلي': Candy,
  'jelly': Candy,
  
  // ✅ NEW: معجنات ومخبوزات
  'معجنات': Croissant,
  'مخبوزات': Croissant,
  'كرواسون': Croissant,
  'croissant': Croissant,
  'pastry': Croissant,
  'باستري': Croissant,
  'دونات': Croissant,
  'donut': Croissant,
  
  // ✅ NEW: حبوب كاملة وصحي
  'حبوب': Wheat,
  'شوفان': Wheat,
  'oats': Wheat,
  'wheat': Wheat,
  'قمح': Wheat,
  'جرانولا': Wheat,
  'granola': Wheat,
  'صحي كامل': Wheat,
  
  // ✅ افتراضي
  'default': Star,
  'أخرى': Grid,
  'other': Grid
}

/**
 * Smart Category Icon Selector
 * Intelligently matches category names to icons
 * 
 * @param categoryName - The category name from backend
 * @returns The corresponding Lucide icon component
 * 
 * @example
 * getCategoryIcon('كيك') // Returns Cake icon
 * getCategoryIcon('آيس كريم كلاسيك') // Returns IceCream icon
 * getCategoryIcon('منتج جديد') // Returns Star icon (default)
 */
export function getCategoryIcon(categoryName: string): LucideIcon {
  if (!categoryName) return CATEGORY_ICON_MAP['default']
  
  const name = categoryName.toLowerCase().trim()
  
  // 1️⃣ Try exact match first
  if (CATEGORY_ICON_MAP[name]) {
    return CATEGORY_ICON_MAP[name]
  }
  
  // 2️⃣ Try partial match (category name contains keyword)
  for (const [key, icon] of Object.entries(CATEGORY_ICON_MAP)) {
    if (name.includes(key.toLowerCase())) {
      return icon
    }
  }
  
  // 3️⃣ Try reverse partial match (keyword contains category name)
  for (const [key, icon] of Object.entries(CATEGORY_ICON_MAP)) {
    if (key.toLowerCase().includes(name)) {
      return icon
    }
  }
  
  // 4️⃣ Return default icon
  return CATEGORY_ICON_MAP['default']
}

/**
 * Get category color based on name
 * Returns brand colors (Pink/Purple gradient)
 * 
 * @param categoryName - The category name
 * @returns Hex color code
 */
export function getCategoryColor(categoryName: string): string {
  // Brand colors
  const BRAND_PINK = '#FF6B9D'
  const BRAND_PURPLE = '#9333EA'
  
  // Use purple for premium/luxury categories
  const premiumKeywords = ['فاخر', 'premium', 'luxury', 'باور', 'power']
  const name = categoryName.toLowerCase()
  
  for (const keyword of premiumKeywords) {
    if (name.includes(keyword)) {
      return BRAND_PURPLE
    }
  }
  
  // Default to pink
  return BRAND_PINK
}
