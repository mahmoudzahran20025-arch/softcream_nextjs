export type IconName = 'Zap' | 'ShieldCheck' | 'Activity' | 'Brain' | 'Award' | 'Scale'

export interface StoryData {
  title: string
  description: string
  src: string
  alt: string
  icon: IconName
  iconColor: string
  gradientClass: string
  glowColor: string
}

export const stories: StoryData[] = [
  {
    title: 'الطاقة تبدأ هنا: غنية، مش تقيلة.',
    description: 'بنقدم لك طعم السوفت كريم الغني اللي ينسيك البرد، بطاقة نقية تدفيك وتكمل معاك اليوم، من غير تقل.',
    src: 'https://i.ibb.co/wZYfZyz9/Gemini-Generated-Image-pm01k0pm01k0pm01.jpg',
    alt: 'شوكولاتة بركان - طاقة مكثفة',
    icon: 'Zap',
    iconColor: '#fbbf24',
    gradientClass: 'bg-gradient-to-br from-[#A3164D] via-slate-900 to-slate-950',
    glowColor: 'shadow-[0_0_50px_rgba(163,22,77,0.5)]',
  },
  {
    title: 'القوة النقية: 100% طبيعي.',
    description:
      'زي ما حتشوف في "ملخص التغذية"، كل مكوناتنا طبيعية مبنيه بنعاصر غذائيه  والتي  تحقق افضل معادله في تكاملها . دي مش مجرد متعة، ده اختيار ذكي لصحتك.',
    src: 'https://i.ibb.co/wF6qN1GS/Chat-GPT-Image-Nov-10-2025-02-46-37-AM.jpg',
    alt: 'انفجار الطاقة - نضارة منعشة',
    icon: 'ShieldCheck',
    iconColor: '#34d399',
    gradientClass: 'bg-gradient-to-br from-emerald-800 via-slate-900 to-slate-950',
    glowColor: 'shadow-[0_0_50px_rgba(16,185,129,0.5)]',
  },
  {
    title: 'طاقة بدنية: دفعة ليومك.',
    description: 'محتاج دفعة قبل الجيم أو بعد يوم طويل؟ مكوناتنا بتدي "طاقة بدنية" حقيقية (Physical Energy) تساعدك تكمل.',
    src: 'https://i.ibb.co/dxv9Sdm/Gemini-Generated-Image-jnrq0rjnrq0rjnrq-2.jpg',
    alt: 'مانجو - شروق الطاقة',
    icon: 'Activity',
    iconColor: '#fb923c',
    gradientClass: 'bg-gradient-to-br from-orange-800 via-slate-900 to-slate-950',
    glowColor: 'shadow-[0_0_50px_rgba(249,115,22,0.5)]',
  },
  {
    title: 'طاقة ذهنية: تركيز وراحة بال.',
    description: 'النعومة الكريمية والطعم الغني مش بس للمتعة. دي "طاقة ذهنية" (Mental Energy) بتساعدك تسترخي وتركز.',
    src: 'https://i.ibb.co/ycFt50b0/Gemini-Generated-Image-jnrq0rjnrq0rjnrq.jpg',
    alt: 'توت بري - طاقة طبيعية',
    icon: 'Brain',
    iconColor: '#c084fc',
    gradientClass: 'bg-gradient-to-br from-purple-800 via-slate-900 to-slate-950',
    glowColor: 'shadow-[0_0_50px_rgba(139,92,246,0.5)]',
  },
  {
    title: 'المعيار الصحيح: متعة بلا ذنب.',
    description:
      'نؤمن بالاعتدال. نستخدم معايير دقيقة لنقدم لك طعماً غنياً بسكريات أقل من الحلويات الأخرى، لتستمتع بكل لقمة وأنت مرتاح البال.',
    src: 'https://i.ibb.co/dxv9Sdm/Gemini-Generated-Image-jnrq0rjnrq0rjnrq-2.jpg',
    alt: 'توازن صحي - سكر معتدل',
    icon: 'Scale',
    iconColor: '#38bdf8',
    gradientClass: 'bg-gradient-to-br from-sky-800 via-slate-900 to-slate-950',
    glowColor: 'shadow-[0_0_50px_rgba(56,189,248,0.5)]',
  },
  {
    title: 'جودة تليق بك.',
    description: 'لأنك تستاهل الأفضل. جودة أوروبية، وطعم أصلي، وتجربة "Premium" في كل لقمة.',
    src: 'https://i.ibb.co/ynsxR1Rq/Gemini-Generated-Image-jnrq0rjnrq0rjnrq-1.jpg',
    alt: 'جودة ممتازة',
    icon: 'Award',
    iconColor: '#fcd34d',
    gradientClass: 'bg-gradient-to-br from-amber-700 via-slate-900 to-slate-950',
    glowColor: 'shadow-[0_0_50px_rgba(245,158,11,0.5)]',
  },
]
