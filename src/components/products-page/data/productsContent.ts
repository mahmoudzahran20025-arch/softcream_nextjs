// Products Page Content Data
export interface StoryCardData {
    id: string
    title: string
    description: string
    gradientClass: string
    glowColor: string
    iconName: string
    iconColor: string
    textPosition: 'left' | 'right'
}

export interface BrandValue {
    id: string
    icon: string
    title: string
    description: string
    metric: string
    gradientClass: string
}

export interface NutritionHighlight {
    id: string
    icon: string
    title: string
    value: number
    maxValue: number
    unit: string
    description: string
    color: string
}

// 4 Marketing Story Cards - "Discover Quality" Section
export const storyCards: StoryCardData[] = [
    {
        id: 'natural-ingredients',
        title: '🌿 مكونات طبيعية 100%',
        description: 'نختار بعناية أفضل المكونات الطبيعية لضمان جودة استثنائية. بدون مواد حافظة أو ألوان صناعية، فقط الطبيعة في أنقى صورها.',
        gradientClass: 'bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600',
        glowColor: 'shadow-emerald-500/30',
        iconName: 'Leaf',
        iconColor: 'text-emerald-100',
        textPosition: 'left'
    },
    {
        id: 'less-sugar',
        title: '🍬 سكريات أقل بنسبة 40%',
        description: 'نستخدم محليات طبيعية بديلة تحافظ على المذاق الرائع مع تقليل السكريات المضافة. صحتك أولويتنا دون التضحية بالطعم اللذيذ.',
        gradientClass: 'bg-gradient-to-br from-pink-500 via-rose-500 to-purple-600',
        glowColor: 'shadow-pink-500/30',
        iconName: 'Candy', // Map to a candy/sweet icon
        iconColor: 'text-pink-100',
        textPosition: 'right'
    },
    {
        id: 'high-protein',
        title: '💪 بروتين عالي الجودة',
        description: 'كل منتج يحتوي على مصادر بروتين طبيعية عالية الجودة لدعم نشاطك اليومي. طاقة طبيعية تدوم طويلاً.',
        gradientClass: 'bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600',
        glowColor: 'shadow-blue-500/30',
        iconName: 'Dumbbell',
        iconColor: 'text-blue-100',
        textPosition: 'left'
    },
    {
        id: 'custom-creation',
        title: '✨ صمم منتجك المثالي',
        description: 'نظام Build Your Own الفريد يتيح لك التحكم الكامل. اختر المكونات، شاهد القيم الغذائية، وأنشئ منتجك المخصص بدقة.',
        gradientClass: 'bg-gradient-to-br from-amber-500 via-orange-500 to-red-600',
        glowColor: 'shadow-amber-500/30',
        iconName: 'Sparkles',
        iconColor: 'text-amber-100',
        textPosition: 'right'
    }
]

// Brand Values Grid (Simple Badges)
export const brandValues: BrandValue[] = [
    {
        id: 'natural',
        icon: 'Leaf',
        title: '100% طبيعي',
        description: 'مكونات طبيعية نقية بدون إضافات صناعية',
        metric: '0 مواد صناعية',
        gradientClass: 'from-emerald-400 to-teal-600'
    },
    {
        id: 'low-sugar',
        icon: 'TrendingDown',
        title: 'سكريات أقل',
        description: 'أقل بنسبة 40% من المنتجات التقليدية',
        metric: '-40% سكريات',
        gradientClass: 'from-pink-400 to-rose-600'
    },
    {
        id: 'high-quality',
        icon: 'Award',
        title: 'جودة عالية',
        description: 'معايير صارمة لضمان أفضل تجربة',
        metric: '★★★★★',
        gradientClass: 'from-purple-400 to-indigo-600'
    }
]

// Nutrition Highlights (3-4 cards with charts)
export const nutritionHighlights: NutritionHighlight[] = [
    {
        id: 'protein',
        icon: 'Dumbbell',
        title: 'بروتين',
        value: 12,
        maxValue: 20,
        unit: 'g',
        description: 'لدعم العضلات والنشاط',
        color: 'from-blue-500 to-cyan-500'
    },
    {
        id: 'energy',
        icon: 'Zap',
        title: 'طاقة',
        value: 180,
        maxValue: 400,
        unit: 'cal',
        description: 'سعرات معتدلة ومتوازنة',
        color: 'from-amber-500 to-orange-500'
    },
    {
        id: 'fiber',
        icon: 'Wheat',
        title: 'ألياف',
        value: 5,
        maxValue: 10,
        unit: 'g',
        description: 'للهضم الصحي',
        color: 'from-green-500 to-emerald-500'
    },
    {
        id: 'vitamins',
        icon: 'Pill',
        title: 'فيتامينات',
        value: 8,
        maxValue: 10,
        unit: 'أنواع',
        description: 'مكملات طبيعية',
        color: 'from-purple-500 to-pink-500'
    }
]

// BYO Showcase Content
export const byoShowcase = {
    title: 'إبداعك.. في كل تفصيلة',
    subtitle: 'Your Masterpiece',
    description: 'لأن ذوقك فريد، نمنحك الحرية الكاملة لتكوين مزيجك المثالي. ابدأ باختيار الأساس، وانطلق في رحلة من النكهات التي لا تنتهي.',
    features: [
        {
            icon: 'Cookie', // Changed from Coffee to Cookie/Dessert icon concept
            title: 'اختر أساس سعادتك',
            description: 'وافل ذهبي، كريب فرنسي، أو براونيز غني'
        },
        {
            icon: 'IceCream',
            title: 'قلب النكهة',
            description: 'آيس كريم طبيعي، فواكه طازجة، أو زبادي'
        },
        {
            icon: 'Sparkles', // Changed from Droplet to Sparkles for "Final Touch"
            title: 'لمسة السحر الأخيرة',
            description: 'صوصات بلجيكية، مكسرات محمصة، وإضافات مقرمشة'
        }
    ],
    stats: {
        flavors: '20+',
        combinations: '∞',
        avgRating: '4.9'
    },
    ctaText: 'ابدأ التصميم الآن',
    ctaLink: '/build-your-own'
}

// Hero Section Content
export const heroContent = {
    title: 'منتجاتنا',
    subtitle: 'طعم لذيذ، صحة أفضل',
    description: 'اكتشف مجموعتنا من منتجات السوفت كريم الصحية المصنوعة من مكونات طبيعية 100%',
    features: [
        'مكونات طبيعية 100%',
        'سكريات أقل بنسبة 40%',
        'بروتين عالي الجودة',
        'قيم غذائية متوازنة'
    ]
}
