'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

import BaseStep from './steps/BaseStep'
import FlavorStep from './steps/FlavorStep'
import ToppingsStep from './steps/ToppingsStep'
import ReviewStep from './steps/ReviewStep'

export default function BYOWizard() {
    const [step, setStep] = useState(1)
    const [direction, setDirection] = useState(0)

    const nextStep = () => {
        setDirection(1)
        setStep(s => Math.min(s + 1, 4))
    }

    const prevStep = () => {
        setDirection(-1)
        setStep(s => Math.max(s - 1, 1))
    }

    const variants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 50 : -50,
            opacity: 0
        }),
        center: {
            x: 0,
            opacity: 1
        },
        exit: (direction: number) => ({
            x: direction < 0 ? 50 : -50,
            opacity: 0
        })
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-10 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="flex justify-between text-sm font-bold text-slate-500 mb-2 px-2">
                        <span className={step >= 1 ? 'text-pink-500' : ''}>الأساس</span>
                        <span className={step >= 2 ? 'text-pink-500' : ''}>النكهات</span>
                        <span className={step >= 3 ? 'text-pink-500' : ''}>الإضافات</span>
                        <span className={step >= 4 ? 'text-pink-500' : ''}>المراجعة</span>
                    </div>
                    <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-pink-500"
                            initial={{ width: '25%' }}
                            animate={{ width: `${step * 25}%` }}
                            transition={{ duration: 0.3 }}
                        />
                    </div>
                </div>

                <h1 className="text-3xl font-bold text-center mb-8 text-slate-900 dark:text-white">
                    صمم آيس كريم أحلامك 🍦
                </h1>

                {/* Wizard Steps */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 md:p-8 min-h-[400px] overflow-hidden relative">
                    <AnimatePresence mode="wait" custom={direction}>
                        <motion.div
                            key={step}
                            custom={direction}
                            variants={variants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.3 }}
                        >
                            {step === 1 && <BaseStep onNext={nextStep} />}
                            {step === 2 && <FlavorStep onNext={nextStep} onBack={prevStep} />}
                            {step === 3 && <ToppingsStep onNext={nextStep} onBack={prevStep} />}
                            {step === 4 && <ReviewStep onBack={prevStep} onAddToCart={() => alert('Added!')} />}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}
