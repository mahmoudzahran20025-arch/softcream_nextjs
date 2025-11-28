'use client'

import { motion } from 'framer-motion'

interface FlavorStepProps {
    onNext: () => void
    onBack: () => void
}

export default function FlavorStep({ onNext, onBack }: FlavorStepProps) {
    // Mock flavors for now
    const flavors = [
        { id: 'vanilla', name: 'فانيليا', color: 'bg-yellow-100' },
        { id: 'chocolate', name: 'شوكولاتة', color: 'bg-stone-800 text-white' },
        { id: 'strawberry', name: 'فراولة', color: 'bg-pink-200' },
        { id: 'mango', name: 'مانجو', color: 'bg-orange-200' },
    ]

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                اختر النكهات (1-3)
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {flavors.map((flavor) => (
                    <motion.button
                        key={flavor.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`p-4 rounded-xl shadow-sm h-32 flex flex-col items-center justify-center gap-2 ${flavor.color}`}
                    >
                        <span className="font-bold">{flavor.name}</span>
                    </motion.button>
                ))}
            </div>

            <div className="flex justify-between pt-6">
                <button
                    onClick={onBack}
                    className="px-6 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                >
                    رجوع
                </button>
                <button
                    onClick={onNext}
                    className="px-6 py-2 rounded-xl bg-pink-500 text-white font-bold shadow-lg hover:bg-pink-600"
                >
                    التالي
                </button>
            </div>
        </div>
    )
}
