'use client'

import { Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import PriceDisplay from '@/components/ui/common/PriceDisplay'
import { Addon } from '@/lib/api'

interface AddonsListProps {
  addons: Addon[]
  tags: string[]
  selectedAddons: string[]
  onToggleAddon: (addonId: string) => void
  isLoading: boolean
}

export default function AddonsList({ addons, tags, selectedAddons, onToggleAddon, isLoading }: AddonsListProps) {
  return (
    <>
      {/* Add-ons Section */}
      {addons.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-2"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#FF6B9D]" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              أضف إضافات مميزة
            </h3>
          </div>
          
          {isLoading && addons.length === 0 ? (
            <div className="space-y-2">
              {/* Skeleton Loader */}
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 animate-pulse"
                >
                  <div className="flex items-center gap-2.5 flex-1">
                    <div className="w-4.5 h-4.5 rounded bg-slate-200 dark:bg-slate-700" />
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded flex-1 max-w-[60%]" />
                  </div>
                  <div className="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {addons.map((addon, index) => {
                const isSelected = selectedAddons.includes(addon.id)
                return (
                  <motion.button
                    key={addon.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.05 }}
                    onClick={() => onToggleAddon(addon.id)}
                    className={`
                      w-full flex items-center justify-between p-2.5 rounded-lg border transition-all
                      ${isSelected
                        ? 'border-[#FF6B9D] bg-pink-50 dark:bg-pink-900/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-[#FF6B9D]/50 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }
                    `}
                  >
                    <div className="flex items-center gap-2.5 flex-1">
                      {/* Checkbox */}
                      <div className={`
                        w-4.5 h-4.5 rounded border-2 flex items-center justify-center transition-all flex-shrink-0
                        ${isSelected 
                          ? 'bg-[#FF6B9D] border-[#FF6B9D]' 
                          : 'border-slate-300 dark:border-slate-600'
                        }
                      `}>
                        {isSelected && (
                          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      
                      <div className="text-right flex-1">
                        <div className="text-sm font-semibold text-slate-900 dark:text-white">
                          {addon.name}
                        </div>
                      </div>
                    </div>
                    
                    <PriceDisplay price={addon.price} size="sm" className="flex-shrink-0" />
                  </motion.button>
                )
              })}
            </div>
          )}
          
          {/* Selected Count Badge */}
          {selectedAddons.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-1.5 text-xs text-[#FF6B9D] bg-pink-50 dark:bg-pink-900/20 px-2.5 py-1.5 rounded-lg border border-pink-200 dark:border-pink-800"
            >
              <div className="w-4 h-4 rounded-full bg-[#FF6B9D] flex items-center justify-center">
                <span className="text-white text-[10px] font-bold">{selectedAddons.length}</span>
              </div>
              <span className="font-semibold">تم اختيار {selectedAddons.length} إضافة</span>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-2"
        >
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">المميزات</h3>
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag: string, index: number) => (
              <motion.span
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + index * 0.05 }}
                className="px-3 py-1 bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900/30 dark:to-rose-900/30 text-[#FF6B9D] dark:text-pink-300 rounded-full text-xs font-semibold border border-pink-200 dark:border-pink-800/50"
              >
                #{tag}
              </motion.span>
            ))}
          </div>
        </motion.div>
      )}
    </>
  )
}
