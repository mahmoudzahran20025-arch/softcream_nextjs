'use client'



interface ReviewStepProps {
    onBack: () => void
    onAddToCart: () => void
}

export default function ReviewStep({ onBack, onAddToCart }: ReviewStepProps) {
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                مراجعة طلبك
            </h2>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b pb-4 dark:border-slate-700">
                    <span className="font-bold">كوب وسط</span>
                    <span>50 ج.م</span>
                </div>
                <div className="flex justify-between items-center border-b pb-4 dark:border-slate-700">
                    <span>فانيليا + شوكولاتة</span>
                    <span>0 ج.م</span>
                </div>
                <div className="flex justify-between items-center font-bold text-xl pt-2">
                    <span>الإجمالي</span>
                    <span className="text-pink-500">50 ج.م</span>
                </div>
            </div>

            <div className="flex justify-between pt-6">
                <button
                    onClick={onBack}
                    className="px-6 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                >
                    رجوع
                </button>
                <button
                    onClick={onAddToCart}
                    className="px-8 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                >
                    إضافة للسلة 🛒
                </button>
            </div>
        </div>
    )
}
