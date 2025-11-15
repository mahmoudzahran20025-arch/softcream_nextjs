'use client';
import { useTransform, motion, useScroll } from 'framer-motion';
import { useRef } from 'react';
import { Zap, ShieldCheck, Activity, Brain, Award, ArrowLeft ,ChevronsDown ,Scale} from 'lucide-react';

// Helper Component للأيقونات مع ألوان مميزة
const IconComponent = ({ name, className, iconColor }) => {
  const icons = {
    Zap: <Zap className={className} style={{ color: iconColor }} />,
    ShieldCheck: <ShieldCheck className={className} style={{ color: iconColor }} />,
    Activity: <Activity className={className} style={{ color: iconColor }} />,
    Brain: <Brain className={className} style={{ color: iconColor }} />,
    Award: <Award className={className} style={{ color: iconColor }} />,
    Scale: <Scale className={className} style={{ color: iconColor }} />, // 💡 أضف هذا السطر
  };
  return icons[name] || null;
};

// المصفوفة المحدثة مع ألوان الأيقونات
const stories = [
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
    description: 'زي ما حتشوف في "ملخص التغذية"، كل مكوناتنا طبيعية مبنيه بنعاصر غذائيه  والتي  تحقق افضل معادله في تكاملها . دي مش مجرد متعة، ده اختيار ذكي لصحتك.',
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
    description: 'نؤمن بالاعتدال. نستخدم معايير دقيقة لنقدم لك طعماً غنياً بسكريات أقل من الحلويات الأخرى، لتستمتع بكل لقمة وأنت مرتاح البال.',
    src: 'https://i.ibb.co/dxv9Sdm/Gemini-Generated-Image-jnrq0rjnrq0rjnrq-2.jpg', // يمكنك تغيير الصورة
    alt: 'توازن صحي - سكر معتدل',
    icon: 'Scale', // أيقونة الميزان (التوازن)
    iconColor: '#38bdf8', // لون أزرق سماوي (يعبر عن النقاء والثقة)
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
];

// Card Component
const Card = ({
  i,
  title,
  description,
  src,
  alt,
  icon,
  iconColor,
  gradientClass,
  glowColor,
  progress,
  range,
  targetScale,
}) => {
  const container = useRef(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ['start end', 'start start'],
  });

  const imageScale = useTransform(scrollYProgress, [0, 1], [1.5, 1]);
  const scale = useTransform(progress, range, [1, targetScale]);

  return (
    <div
      ref={container}
      className='h-screen flex items-center justify-center sticky top-0 px-4 sm:px-6 md:px-8'
    >
      <motion.div
        style={{
          scale,
          top: `calc(-5vh + ${i * 25}px)`,
        }}
        className={`flex flex-col relative -top-[10%] sm:-top-[15%] md:-top-[25%] h-auto min-h-[520px] min-[560px]:min-h-[450px] min-[560px]:h-[450px] lg:h-[450px] w-full sm:w-[92%] md:w-[85%] lg:w-[75%] xl:w-[70%] rounded-xl sm:rounded-2xl lg:rounded-3xl p-4 sm:p-5 md:p-6 lg:p-10 origin-top ${gradientClass} ${glowColor} hover:scale-[1.02] transition-all duration-300`}
      >
        <div className='flex items-center justify-center gap-2 sm:gap-2.5 md:gap-3 mb-4 sm:mb-4 md:mb-5'>
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            whileInView={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className='bg-white/10 backdrop-blur-sm rounded-full p-2 sm:p-2.5'
          >
            <IconComponent 
              name={icon}
              iconColor={iconColor}
              className='w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 drop-shadow-lg flex-shrink-0' 
            />
          </motion.div>
          <h2 className='text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl text-white text-center font-black leading-tight'>
            {title}
          </h2>
        </div>
        
        <div className='flex flex-col min-[560px]:flex-row h-full gap-4 min-[560px]:gap-6 lg:gap-10'>
          <div className='relative w-full min-[560px]:w-[58%] h-[70%] min-[560px]:h-full rounded-lg sm:rounded-xl overflow-hidden shadow-2xl order-1 min-[560px]:order-2'>
            <motion.div
              className='w-full h-full'
              style={{ scale: imageScale }}
            >
              <img
                src={src}
                alt={alt}
                width='600'
                height='450'
                loading={i === 0 ? 'eager' : 'lazy'}
                className='w-full h-full object-cover'
              />
            </motion.div>
          </div>

          <div className='w-full min-[560px]:w-[42%] h-[30%] min-[560px]:h-full flex flex-col justify-center order-2 min-[560px]:order-1'>
            <p className='text-xs sm:text-sm min-[560px]:text-base lg:text-lg text-white/90 leading-snug sm:leading-relaxed mb-2 sm:mb-3 min-[560px]:mb-4'>
              {description}
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className='inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 md:py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full text-white font-bold text-xs sm:text-sm md:text-base group w-fit transition-all duration-300 border border-white/30'
              aria-label='اعرف المزيد'
            >
              <span>اعرف المزيد</span>
              <ArrowLeft className='w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 group-hover:-translate-x-1 transition-transform' />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Main Component
export default function StorytellingHero() {
  const container = useRef(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ['start start', 'end end'],
  });

  return (
    <div className='bg-black' ref={container}>
      {/* Hero Introduction */}
      <section className='text-white h-[70vh] sm:h-[75vh] md:h-[80vh] lg:h-[70vh] w-full bg-slate-950 grid place-content-center relative overflow-hidden'>
        
        {/* Video Background */}
        <div className='absolute inset-0 w-full h-full overflow-hidden'>
          <video
            autoPlay
            loop
            muted
            playsInline
            preload='metadata'
            className='absolute inset-0 w-full h-full object-cover opacity-40'
            poster='data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080"%3E%3Crect fill="%230f172a" width="1920" height="1080"/%3E%3C/svg%3E'
          >
            <source 
              src='https://res.cloudinary.com/djefdgy41/video/upload/v1762897127/mixkit-lightning-strike-and-thunders-47948-hd-ready_1_ajfuc1.mp4' 
              type='video/mp4' 
            />
          </video>
          <div className='absolute inset-0 bg-gradient-to-b from-slate-950/60 via-slate-950/70 to-slate-950/90'></div>
        </div>

        <div className='absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] [background-size:54px_54px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none z-10'></div>

        <motion.div
          className='absolute inset-0 opacity-20 z-10'
          animate={{
            background: [
              'radial-gradient(circle at 20% 50%, rgba(163,22,77,0.3) 0%, transparent 50%)',
              'radial-gradient(circle at 80% 50%, rgba(139,92,246,0.3) 0%, transparent 50%)',
              'radial-gradient(circle at 50% 80%, rgba(16,185,129,0.3) 0%, transparent 50%)',
              'radial-gradient(circle at 20% 50%, rgba(163,22,77,0.3) 0%, transparent 50%)',
            ],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
        />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className='relative z-20 px-4 sm:px-6 md:px-8 text-center'
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className='mb-4 sm:mb-6'
          >
            <Zap className='w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 mx-auto text-primary drop-shadow-[0_0_30px_rgba(163,22,77,1)]' />
          </motion.div>
          
          <h1 className='text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-black tracking-tight leading-[105%] mb-3 sm:mb-4 md:mb-6 drop-shadow-2xl'>
            الطاقة لها طعم
            <br />
            <span className='bg-gradient-to-r from-primary via-purple-500 to-orange-400 bg-clip-text text-transparent drop-shadow-[0_2px_10px_rgba(163,22,77,0.5)]'>
              SOFT & ENERGY
            </span>
          </h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className='text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-light text-gray-200 max-w-xs sm:max-w-md md:max-w-2xl mx-auto px-2 drop-shadow-lg'
          >
            اكتشف كيف نحول المكونات النقية إلى لحظات تغير مزاجك
            <br />
            <span 
              className='inline-flex items-center justify-center gap-2 mt-3 cursor-default'
              // يمكنك إضافة onClick={() => window.scrollTo(...)} إذا أردت
            >
              <span className='font-medium text-white/90'>
                اكتشف رحلة الطاقة
              </span>
              
              {/* الأيقونة والتأثير الجديد */}
              <motion.span
                animate={{ 
                  y: [0, 6, 0], // حركة أخف
                  opacity: [1, 0.4, 1] // تأثير "نبض"
                }}
                transition={{ 
                  duration: 2.0, // مدة أطول لإحساس أهدأ
                  repeat: Infinity,
                  ease: "easeInOut" 
                }}
              >
                <ChevronsDown 
                  className='w-5 h-5 md:w-6 md:h-6 text-primary' 
                  // استخدم لون البراند الأساسي
                  style={{ filter: 'drop-shadow(0 0 8px rgba(163,22,77,0.7))' }} // إضافة توهج
                />
              </motion.span>
            </span>
          </motion.p>
        </motion.div>
      </section>

      {/* Stacking Cards */}
      <section className='text-white w-full bg-slate-950'>
        {stories.map((story, i) => {
          const targetScale = 1 - (stories.length - i) * 0.05;
          return (
            <Card
              key={`story_${i}`}
              i={i}
              title={story.title}
              description={story.description}
              src={story.src}
              alt={story.alt}
              icon={story.icon}
              iconColor={story.iconColor}
              gradientClass={story.gradientClass}
              glowColor={story.glowColor}
              progress={scrollYProgress}
              range={[i * 0.2, 1]}
              targetScale={targetScale}
            />
          );
        })}
      </section>

      {/* ⚡ Footer مع Lightning CSS Animation */}
      <footer className='group bg-slate-950 pt-12 sm:pt-16 md:pt-20 overflow-hidden relative'>
        
        {/* 🔥 Lightning Animation Background - CSS Only */}
        <div className='absolute inset-0 w-full h-full overflow-hidden'>
          <div className='absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-black'></div>
          
          <div className='absolute inset-0'>
            {/* Lightning 1 - Purple */}
            <div className='absolute top-0 left-[20%] w-1 h-full bg-gradient-to-b from-transparent via-purple-400/40 to-transparent opacity-0 animate-lightning-1'></div>
            <div className='absolute top-0 left-[20%] w-0.5 h-full bg-gradient-to-b from-transparent via-white/60 to-transparent opacity-0 animate-lightning-1' style={{ animationDelay: '0.05s' }}></div>
            
            {/* Lightning 2 - Pink */}
            <div className='absolute top-0 right-[25%] w-1 h-full bg-gradient-to-b from-transparent via-primary/40 to-transparent opacity-0 animate-lightning-2'></div>
            <div className='absolute top-0 right-[25%] w-0.5 h-full bg-gradient-to-b from-transparent via-white/60 to-transparent opacity-0 animate-lightning-2' style={{ animationDelay: '0.05s' }}></div>
            
            {/* Lightning 3 - Orange */}
            <div className='absolute top-0 left-[60%] w-1 h-full bg-gradient-to-b from-transparent via-orange-400/40 to-transparent opacity-0 animate-lightning-3'></div>
            <div className='absolute top-0 left-[60%] w-0.5 h-full bg-gradient-to-b from-transparent via-white/60 to-transparent opacity-0 animate-lightning-3' style={{ animationDelay: '0.05s' }}></div>
            
            {/* Lightning 4 - Subtle */}
            <div className='absolute top-0 right-[45%] w-1 h-full bg-gradient-to-b from-transparent via-purple-500/30 to-transparent opacity-0 animate-lightning-4'></div>
            
            {/* Lightning Glow */}
            <div className='absolute top-0 left-[20%] w-32 h-full bg-gradient-to-b from-transparent via-purple-500/10 to-transparent opacity-0 blur-3xl animate-lightning-glow-1'></div>
            <div className='absolute top-0 right-[25%] w-32 h-full bg-gradient-to-b from-transparent via-primary/10 to-transparent opacity-0 blur-3xl animate-lightning-glow-2'></div>
            <div className='absolute top-0 left-[60%] w-32 h-full bg-gradient-to-b from-transparent via-orange-400/10 to-transparent opacity-0 blur-3xl animate-lightning-glow-3'></div>
          </div>
          
          <div className='absolute inset-0 bg-gradient-to-b from-slate-950/40 via-slate-950/60 to-black/90'></div>
        </div>

        <div className='absolute inset-0 bg-[linear-gradient(to_right,#8b5cf615_1px,transparent_1px),linear-gradient(to_bottom,#8b5cf615_1px,transparent_1px)] [background-size:50px_50px] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_50%,#000_30%,transparent_100%)] pointer-events-none z-10'></div>
        
        <div className='absolute inset-0 bg-gradient-radial from-primary/5 via-transparent to-transparent opacity-60 pointer-events-none z-10'></div>

        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className='relative z-20 text-[20vw] sm:text-[18vw] md:text-[16vw] group-hover:translate-y-2 sm:group-hover:translate-y-4 translate-y-12 sm:translate-y-16 md:translate-y-20 leading-[100%] uppercase font-black text-center bg-gradient-to-r from-gray-200 via-gray-400 to-gray-600 bg-clip-text text-transparent transition-all ease-linear duration-500 drop-shadow-[0_0_40px_rgba(163,22,77,0.6)]'
        >
          Soft Energy 
        </motion.h1>

        <section className='bg-black/70 backdrop-blur-md h-auto py-12 sm:py-14 md:h-56 relative z-20 grid place-content-center text-center rounded-tr-[50px] rounded-tl-[50px] sm:rounded-tr-[80px] sm:rounded-tl-[80px] md:rounded-tr-full md:rounded-tl-full px-4 sm:px-6 md:px-8 border-t border-white/10'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className='text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3 sm:mb-4 drop-shadow-xl'>
              جاهز لتجربتك؟
            </h2>
            <p className='text-base sm:text-lg md:text-xl lg:text-2xl text-gray-200 font-light mb-4 sm:mb-6 drop-shadow-lg'>
              اطلب الآن واستمتع بالطاقة الحقيقية.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className='inline-flex items-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-primary via-purple-600 to-orange-500 rounded-full text-white font-bold cursor-pointer shadow-[0_0_30px_rgba(163,22,77,0.7)] hover:shadow-[0_0_50px_rgba(163,22,77,0.9)] transition-all duration-300 text-sm sm:text-base'
              aria-label='ابدأ الآن'
            >
              <Zap className='w-4 h-4 sm:w-5 sm:h-5 animate-pulse' />
              ابدأ الآن
            </motion.button>
          </motion.div>
        </section>
        
        {/* ⚡ CSS Lightning Animations */}
        <style jsx>{`
          @keyframes lightning-1 {
            0%, 10%, 12%, 100% { opacity: 0; transform: scaleY(0); }
            11%, 11.5% { opacity: 1; transform: scaleY(1); }
          }
          @keyframes lightning-2 {
            0%, 25%, 27%, 100% { opacity: 0; transform: scaleY(0); }
            26%, 26.5% { opacity: 1; transform: scaleY(1); }
          }
          @keyframes lightning-3 {
            0%, 45%, 47%, 48%, 100% { opacity: 0; transform: scaleY(0); }
            46%, 46.3%, 47.5% { opacity: 1; transform: scaleY(1); }
          }
          @keyframes lightning-4 {
            0%, 60%, 62%, 100% { opacity: 0; transform: scaleY(0); }
            61%, 61.5% { opacity: 1; transform: scaleY(1); }
          }
          @keyframes lightning-glow-1 {
            0%, 10%, 12%, 100% { opacity: 0; }
            11% { opacity: 0.8; }
          }
          @keyframes lightning-glow-2 {
            0%, 25%, 27%, 100% { opacity: 0; }
            26% { opacity: 0.8; }
          }
          @keyframes lightning-glow-3 {
            0%, 45%, 48%, 100% { opacity: 0; }
            46%, 47.5% { opacity: 0.8; }
          }
          .animate-lightning-1 { animation: lightning-1 8s infinite; }
          .animate-lightning-2 { animation: lightning-2 8s infinite; }
          .animate-lightning-3 { animation: lightning-3 8s infinite; }
          .animate-lightning-4 { animation: lightning-4 8s infinite; }
          .animate-lightning-glow-1 { animation: lightning-glow-1 8s infinite; }
          .animate-lightning-glow-2 { animation: lightning-glow-2 8s infinite; }
          .animate-lightning-glow-3 { animation: lightning-glow-3 8s infinite; }
        `}</style>
      </footer>
    </div>
  );
}
/*
Primary (#A3164D - Strawberry Pink):
✅ طاقة، حيوية، passion
✅ يحفز الشهية (مثالي للطعام)
✅ أنثوي لكن قوي (Ice Cream = متعة)

Purple (#7C3AED - Blueberry):
✅ إبداع، رفاهية، premium
✅ طاقة ذهنية (Mental Energy) ← ده اللي أنت قلته!
✅ يوحي بالجودة

Black/Slate:
✅ فخامة، غموض، exclusivity
✅ يبرز الألوان الزاهية
✅ يخلي المستخدم يركز

Orange/Yellow (في Hero):
✅ طاقة بدنية، حيوية، دفء
✅ تفاؤل، سعادة
```

---

## ⚡ **StorytellingHero بتاعك:**
```
✅ Lightning/Thunder Video = Genius!
السبب:
- يعبر عن "الطاقة" حرفياً
- Dramatic entrance
- يربط المنتج بمفهوم Energy
- مش مجرد آيس كريم، ده "تجربة"

الألوان:
- أسود = Canvas نقي
- Lightning = لحظة الطاقة
- Gradients (Pink, Purple, Orange) = أنواع الطاقة
  (بدنية، ذهنية، عاطفية)
```

**ده Perfect! لكن...**

---

## 🌉 **مشكلة الـ Transition:**
```
User Journey:
1. StorytellingHero (Dark, Dramatic) 😍
   ↓
2. Marquee (???)
   ↓
3. FilterBar (???)
   ↓
4. Products (???)

المشكلة:
❌ لو عملت Light بعد Hero مباشرة = Visual Shock
❌ لو فضلت Dark = صعب في القراءة الطويلة

*/
