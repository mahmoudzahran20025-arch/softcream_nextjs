'use client'

import { motion } from 'framer-motion'

interface EnergyLevelBadgeProps {
    energyType: string
    energyScore: number
}

export default function EnergyLevelBadge({ energyType, energyScore }: EnergyLevelBadgeProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={energyType}
            className="mb-6"
        >
            <div className={`
        relative overflow-hidden rounded-2xl p-4 border
        ${energyType === 'physical' ? 'bg-orange-50/50 border-orange-100 dark:bg-orange-900/10 dark:border-orange-900/30' : ''}
        ${energyType === 'mental' ? 'bg-purple-50/50 border-purple-100 dark:bg-purple-900/10 dark:border-purple-900/30' : ''}
        ${energyType === 'balanced' ? 'bg-emerald-50/50 border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-900/30' : ''}
      `}>
                {/* Background Pattern */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/40 to-transparent dark:from-white/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />

                <div className="relative flex items-center gap-4">
                    {/* Icon Circle */}
                    <div className={`
            w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-sm border-2 border-white dark:border-slate-800
            ${energyType === 'physical' ? 'bg-gradient-to-br from-orange-400 to-red-500 text-white' : ''}
            ${energyType === 'mental' ? 'bg-gradient-to-br from-purple-400 to-indigo-500 text-white' : ''}
            ${energyType === 'balanced' ? 'bg-gradient-to-br from-emerald-400 to-teal-500 text-white' : ''}
          `}>
                        {energyType === 'physical' && '💪'}
                        {energyType === 'mental' && '🧠'}
                        {energyType === 'balanced' && '⚖️'}
                    </div>

                    {/* Text Info */}
                    <div className="flex-1">
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                {energyType === 'physical' && 'طاقة بدنية عالية'}
                                {energyType === 'mental' && 'طاقة ذهنية وتركيز'}
                                {energyType === 'balanced' && 'طاقة متوازنة'}
                            </h3>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${energyType === 'physical' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300' :
                                    energyType === 'mental' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300' :
                                        'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300'
                                }`}>
                                {energyScore}%
                            </span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                            {energyType === 'physical' && 'مثالي للتمارين والنشاط البدني العالي، غني بالبروتين.'}
                            {energyType === 'mental' && 'يعزز التركيز والنشاط الذهني السريع، غني بالطاقة.'}
                            {energyType === 'balanced' && 'خيار ممتاز لوجبة خفيفة صحية ومتكاملة العناصر.'}
                        </p>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
