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
    title: 'نكهات تأسر حواسك',
    description: 'استمتع بتشكيلة متنوعة من النكهات الطبيعية، محضرة بعناية لتمنحك لحظات من السعادة الحقيقية.',
    src: 'https://i.ibb.co/wZYfZyz9/Gemini-Generated-Image-pm01k0pm01k0pm01.jpg',
    alt: 'شوكولاتة ناعمة',
    icon: 'Award',
    iconColor: '#f43f5e',
    gradientClass: 'bg-gradient-to-br from-rose-50 via-white to-pink-50 border border-pink-100',
    glowColor: 'shadow-pink-200/50',
  },
  {
    title: 'جودة عالمية، نكهة محلية',
    description:
      'نختار أجود المكونات الأوروبية ونمزجها بشغف لنقدم لك سوفت كريم بمواصفات عالمية وطعم يناسب ذوقك.',
    src: 'https://i.ibb.co/wF6qN1GS/Chat-GPT-Image-Nov-10-2025-02-46-37-AM.jpg',
    alt: 'جودة عالية',
    icon: 'ShieldCheck',
    iconColor: '#10b981',
    gradientClass: 'bg-gradient-to-br from-emerald-50 via-white to-green-50 border border-emerald-100',
    glowColor: 'shadow-emerald-200/50',
  },
  {
    title: 'انتعاش الصيف في كل وقت',
    description: 'مزيج المانجو الاستوائي يمنحك شعوراً بالانتعاش والحيوية، كأنك في عطلة صيفية مستمرة.',
    src: 'https://i.ibb.co/dxv9Sdm/Gemini-Generated-Image-jnrq0rjnrq0rjnrq-2.jpg',
    alt: 'مانجو منعش',
    icon: 'Zap',
    iconColor: '#facc15',
    gradientClass: 'bg-gradient-to-br from-amber-50 via-white to-yellow-50 border border-amber-100',
    glowColor: 'shadow-amber-200/50',
  },
  {
    title: 'راحة بالك، أولويتنا',
    description: 'نلتزم بأعلى معايير النظافة والسلامة الغذائية، لتستمتع بكل لقمة وأنت مطمئن على صحتك وصحة عائلتك.',
    src: 'https://i.ibb.co/ycFt50b0/Gemini-Generated-Image-jnrq0rjnrq0rjnrq.jpg',
    alt: 'سلامة غذائية',
    icon: 'Scale',
    iconColor: '#3b82f6',
    gradientClass: 'bg-gradient-to-br from-blue-50 via-white to-sky-50 border border-blue-100',
    glowColor: 'shadow-blue-200/50',
  },
  {
    title: 'ابتكر مزيجك الخاص',
    description:
      'أطلق العنان لإبداعك! اختر نكهتك المفضلة وأضف عليها لمساتك من الفواكه والمكسرات لتبتكر كوبك المثالي.',
    src: 'https://i.ibb.co/ynsxR1Rq/Gemini-Generated-Image-jnrq0rjnrq0rjnrq-1.jpg',
    alt: 'اصنعها بنفسك',
    icon: 'Brain',
    iconColor: '#8b5cf6',
    gradientClass: 'bg-gradient-to-br from-purple-50 via-white to-violet-50 border border-purple-100',
    glowColor: 'shadow-purple-200/50',
  },
]
