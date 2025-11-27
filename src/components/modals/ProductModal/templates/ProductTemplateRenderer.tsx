'use client'

import { motion } from 'framer-motion'
import { Product } from '@/lib/api'
import { useProductConfiguration } from '@/hooks/useProductConfiguration'
import ContainerSelector from '../ContainerSelector'
import SizeSelector from '../SizeSelector'
import CustomizationSelector from '../CustomizationSelector'
import CustomizationSummary from '../CustomizationSummary'

interface ProductTemplateRendererProps {
  product: Product
  productConfig: ReturnType<typeof useProductConfiguration>
}

// Template Headers by product type
const templateHeaders: Record<string, { icon: string; title: string; subtitle: string; gradient: string }> = {
  byo_ice_cream: {
    icon: '✨',
    title: 'اصنع الآيس كريم الخاص بك',
    subtitle: 'ابدأ من الصفر واختر كل شيء!',
    gradient: 'from-pink-500 via-purple-500 to-pink-500'
  },
  milkshake: {
    icon: '🥤',
    title: 'ميلك شيك',
    subtitle: 'اختر الحجم وأضف إضافاتك المفضلة',
    gradient: 'from-amber-400 via-orange-400 to-amber-400'
  },
  preset_ice_cream: {
    icon: '🍨',
    title: 'آيس كريم',
    subtitle: 'اختر الحجم وأضف إضافاتك',
    gradient: 'from-cyan-400 via-blue-400 to-cyan-400'
  },
  dessert: {
    icon: '🍰',
    title: 'حلويات',
    subtitle: 'أضف آيس كريم وصوصات لتجربة مميزة',
    gradient: 'from-amber-500 via-yellow-500 to-amber-500'
  },
  standard: {
    icon: '🍽️',
    title: 'خصص طلبك',
    subtitle: 'اختر الإضافات المفضلة',
    gradient: 'from-slate-500 via-slate-600 to-slate-500'
  }
}

export default function ProductTemplateRenderer({
  product,
  productConfig
}: ProductTemplateRendererProps) {
  const {
    productType,
    isLoading,
    hasContainers,
    containers,
    selectedContainer,
    setSelectedContainer,
    hasSizes,
    sizes,
    selectedSize,
    setSelectedSize,
    hasCustomization,
    customizationRules,
    selections,
    updateGroupSelections,
    selectedOptions,
    customizationTotal
  } = productConfig

  // Loading state
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-12 space-y-4"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
          className="w-12 h-12 border-4 border-pink-200 dark:border-pink-800 border-t-pink-500 dark:border-t-pink-400 rounded-full"
        />
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
          جاري تحميل الخيارات...
        </p>
      </motion.div>
    )
  }

  // Determine product type - check if it's truly BYO or just has customization
  const isBYO = productType === 'byo_ice_cream' || (hasContainers && hasCustomization)
  const isDessert = productType === 'dessert'
  
  // Get header config - use product name for non-BYO products
  const header = templateHeaders[productType] || templateHeaders.standard

  // For dessert: separate ice cream options from other add-ons
  const iceCreamGroup = isDessert 
    ? customizationRules.find((g: any) => g.groupId === 'flavors' || g.groupId === 'ice_cream_flavors')
    : null
  const otherGroups = isDessert
    ? customizationRules.filter((g: any) => g.groupId !== 'flavors' && g.groupId !== 'ice_cream_flavors')
    : customizationRules

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="space-y-4"
    >
      {/* Dynamic Header - Only show for BYO products */}
      {isBYO && (
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          className={`relative overflow-hidden bg-gradient-to-r ${header.gradient} bg-[length:200%_100%] p-4 md:p-5 rounded-2xl shadow-lg`}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
          />
          <div className="relative flex items-center gap-3">
            <motion.span
              animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 3 }}
              className="text-3xl md:text-4xl drop-shadow-lg"
            >
              {header.icon}
            </motion.span>
            <div>
              <h3 className="text-xl md:text-lg font-bold text-white drop-shadow-md">
                {header.title}
              </h3>
              <p className="text-xs md:text-[11px] text-white/90 mt-0.5">
                {header.subtitle}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Container Selector (BYO only) */}
      {hasContainers && (
        <ContainerSelector
          containers={containers}
          selectedContainer={selectedContainer}
          onSelect={setSelectedContainer}
        />
      )}

      {/* Size Selector */}
      {hasSizes && (
        <SizeSelector
          sizes={sizes}
          selectedSize={selectedSize}
          onSelect={setSelectedSize}
          basePrice={product.price}
          showPriceAsTotal={isBYO}
        />
      )}

      {/* Ice Cream Add-on for Desserts (Special Section) */}
      {isDessert && iceCreamGroup && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 rounded-2xl p-4 border border-pink-200 dark:border-pink-800"
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">🍦</span>
            <h4 className="font-bold text-slate-800 dark:text-white">
              أضف آيس كريم
            </h4>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              (اختياري)
            </span>
          </div>
          <CustomizationSelector
            group={iceCreamGroup}
            selections={selections[iceCreamGroup.groupId] || []}
            onSelectionChange={(ids) => updateGroupSelections(iceCreamGroup.groupId, ids)}
            compact={true}
          />
        </motion.div>
      )}

      {/* Free with size label for BYO flavors */}
      {isBYO && hasCustomization && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-3 py-1.5 rounded-lg inline-flex items-center gap-1 w-fit"
        >
          <span>✨</span>
          النكهات مجانية مع المقاس
        </motion.div>
      )}

      {/* Customization Groups */}
      {hasCustomization && otherGroups.map((group: any) => (
        <CustomizationSelector
          key={group.groupId}
          group={group}
          selections={selections[group.groupId] || []}
          onSelectionChange={(ids) => updateGroupSelections(group.groupId, ids)}
          showFreeLabel={isBYO && group.groupId === 'flavors'}
        />
      ))}

      {/* Selection Summary */}
      {selectedOptions.length > 0 && (
        <CustomizationSummary
          selections={selectedOptions}
          customizationTotal={customizationTotal}
          onRemove={(optionId) => {
            const group = customizationRules.find((g: any) =>
              g.options.some((opt: any) => opt.id === optionId)
            )
            if (group) {
              const currentSelections = selections[group.groupId] || []
              updateGroupSelections(
                group.groupId,
                currentSelections.filter((id: string) => id !== optionId)
              )
            }
          }}
        />
      )}
    </motion.div>
  )
}
