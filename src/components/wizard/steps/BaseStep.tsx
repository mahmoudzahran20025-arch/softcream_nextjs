'use client'

import { motion } from 'framer-motion'

interface BaseStepProps {
    onNext: () => void
}

export default function BaseStep({ onNext }: BaseStepProps) {
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                اختر الأساس
            </h2>
            <div className="grid grid-cols-2 gap-4">
                {/* Cup Option */}
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onNext}
                    className="p-6 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-pink-500 dark:hover:border-pink-500 bg-white dark:bg-slate-800 transition-colors text-center"
                >
                    <div className="text-6xl mb-4">🥣</div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">كوب</h3>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">كلاسيكي وعملي</p>
                </motion.button>

                {/* Cone Option */}
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onNext}
                    className="p-6 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-pink-500 dark:hover:border-pink-500 bg-white dark:bg-slate-800 transition-colors text-center"
                >
                    <div className="text-6xl mb-4">🍦</div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">بسكويت</h3>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">مقرمش ولذيذ</p>
                </motion.button>
            </div>
        </div>
    )
}
