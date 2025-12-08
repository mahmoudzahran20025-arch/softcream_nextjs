'use client'

import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { ContainerType } from '@/lib/api'

interface ContainerSelectorProps {
  containers: ContainerType[]
  selectedContainer: string | null
  onSelect: (containerId: string) => void
}

// Container icons mapping
const containerIcons: Record<string, string> = {
  cup: '🥤',
  cone: '🍦',
  waffle_bowl: '🧇',
  choco_cone: '🍫',
}

export default function ContainerSelector({
  containers,
  selectedContainer,
  onSelect
}: ContainerSelectorProps) {
  if (!containers || containers.length === 0) return null

  return (
    <div className="flex gap-1.5 flex-wrap">
      {containers.map((container) => {
        const isSelected = selectedContainer === container.id
        const icon = containerIcons[container.id] || '📦'

        return (
          <motion.button
            key={container.id}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelect(container.id)}
            className={`
              relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all duration-200
              ${isSelected
                ? 'border-pink-500 bg-pink-500 text-white shadow-sm'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-pink-300 text-slate-700 dark:text-slate-300'
              }
            `}
          >
            {isSelected && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-white rounded-full flex items-center justify-center shadow-sm"
              >
                <Check className="w-2 h-2 text-pink-500" strokeWidth={3} />
              </motion.div>
            )}
            <span className="text-base">{icon}</span>
            <span className="text-[11px] font-semibold">{container.name}</span>
            {container.priceModifier > 0 && (
              <span className={`text-[9px] font-medium ${isSelected ? 'text-white/80' : 'text-orange-500'}`}>
                +{container.priceModifier}
              </span>
            )}
          </motion.button>
        )
      })}
    </div>
  )
}
