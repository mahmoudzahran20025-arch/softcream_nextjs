'use client'



interface ToppingsStepProps {
    onNext: () => void
    onBack: () => void
}

export default function ToppingsStep({ onNext, onBack }: ToppingsStepProps) {
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                أضف الإضافات
            </h2>

            <div className="p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-slate-400">
                Toppings Grid Placeholder
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
