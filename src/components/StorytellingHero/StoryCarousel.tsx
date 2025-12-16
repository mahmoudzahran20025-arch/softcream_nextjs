'use client'

import { useRef } from 'react'
import { motion, useScroll } from 'framer-motion'
import { Leaf, Droplets, Heart } from 'lucide-react'

const FEATURES = [
    {
        title: "نقاء الطبيعة",
        subtitle: "مكونات طبيعية 100%",
        description: "لا نستخدم سوى الحليب الطازج والفواكه الطبيعية. خالي من الإضافات الصناعية لنضمن لك طعماً نقياً وصحياً.",
        icon: Leaf,
        color: "bg-green-100/50 text-green-600",
        image: "https://i.ibb.co/wF6qN1GS/Chat-GPT-Image-Nov-10-2025-02-46-37-AM.jpg"
    },
    {
        title: "انتعاش يومي",
        subtitle: "يحضر طازجاً كل صباح",
        description: "نؤمن بأن الطعم الحقيقي يكمن في النضارة. يتم تحضير السوفت كريم يومياً لضمان أعلى معايير الجودة.",
        icon: Droplets,
        color: "bg-blue-100/50 text-blue-600",
        image: "https://i.ibb.co/dxv9Sdm/Gemini-Generated-Image-jnrq0rjnrq0rjnrq-2.jpg"
    },
    {
        title: "صنع بحب",
        subtitle: "لك ولعائلتك",
        description: "كل كوب نقدمه هو رسالة حب. نهتم بأدق التفاصيل لنسعدك ونرسم الابتسامة على وجهك.",
        icon: Heart,
        color: "bg-pink-100/50 text-pink-600",
        image: "https://i.ibb.co/wZYfZyz9/Gemini-Generated-Image-pm01k0pm01k0pm01.jpg"
    }
]

export default function StoryCarousel() {
    const containerRef = useRef<HTMLDivElement>(null)
    const { scrollXProgress } = useScroll({ container: containerRef })

    return (
        <section className="py-20 bg-white overflow-hidden">
            <div className="container mx-auto px-4 mb-12 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">
                        لماذا سوفت كريم؟
                    </h2>
                    <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium">
                        ثلاثة أسباب تجعلنا اختيارك الأول
                    </p>
                </motion.div>
            </div>

            {/* Scrollable Container with Mobile Peek */}
            <div
                ref={containerRef}
                className="flex overflow-x-auto snap-x snap-mandatory pb-12 px-4 gap-4 md:gap-8 no-scrollbar touch-pan-x"
                style={{ scrollBehavior: 'smooth' }}
            >
                {/* Mobile Left Spacer to center first item */}
                <div className="w-[5vw] md:hidden flex-none" />

                {FEATURES.map((feature, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="flex-none w-[85vw] md:w-[600px] snap-center select-none"
                    >
                        <div className="group relative h-[450px] md:h-[550px] rounded-[2.5rem] overflow-hidden bg-slate-50 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                            {/* Image Section with Parallax Feel */}
                            <div className="absolute inset-0 h-full w-full overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent z-10" />
                                <motion.img
                                    src={feature.image}
                                    alt={feature.title}
                                    className="h-full w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
                                    initial={{ scale: 1.1 }}
                                    whileInView={{ scale: 1 }}
                                    transition={{ duration: 1.5 }}
                                />
                            </div>

                            {/* Content Section */}
                            <div className="relative z-20 h-full flex flex-col justify-end p-6 md:p-12 text-white">
                                <div className={`w-12 h-12 md:w-16 md:h-16 rounded-2xl ${feature.color} backdrop-blur-md flex items-center justify-center mb-4 md:mb-6 shadow-lg shadow-black/10`}>
                                    <feature.icon className="w-6 h-6 md:w-8 md:h-8" />
                                </div>

                                <span className="text-pink-300 font-bold tracking-wider mb-2 block uppercase text-xs md:text-sm">
                                    {feature.subtitle}
                                </span>

                                <h3 className="text-2xl md:text-5xl font-black mb-3 md:mb-5 leading-tight tracking-tight">
                                    {feature.title}
                                </h3>

                                <p className="text-slate-200 text-sm md:text-xl leading-relaxed md:leading-relaxed max-w-md opacity-90 group-hover:opacity-100 transition-opacity duration-500">
                                    {feature.description}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                ))}

                {/* Mobile Right Spacer */}
                <div className="w-[5vw] md:hidden flex-none" />
                {/* Desktop Spacer */}
                <div className="hidden md:block w-4 flex-none" />
            </div>

            {/* Progress Bar */}
            <div className="max-w-[200px] md:max-w-md mx-auto h-1.5 bg-slate-100 rounded-full mt-2 md:mt-4 overflow-hidden">
                <motion.div
                    style={{ scaleX: scrollXProgress, transformOrigin: "0%" }}
                    className="h-full bg-gradient-to-r from-pink-500 to-purple-600"
                />
            </div>

        </section>
    )
}
