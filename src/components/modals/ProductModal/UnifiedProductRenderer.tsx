'use client'

// ================================================================
// UnifiedProductRenderer.tsx - Data-Driven Product UI
// ================================================================
// UNIFIED PRODUCT MODEL: Single component for all product types
// Renders based on ui_config JSON from product_templates
// NO hardcoded templates - fully dynamic
// ================================================================

import { motion } from 'framer-motion'
import type { ProductEngineReturn, UIConfig } from '@/hooks/useProductEngine'
import { Product } from '@/lib/api'
import OptionGroupRenderer from '@/components/shared/OptionGroupRenderer'
import CustomizationSummary from './CustomizationSummary'

// ================================================================
// TYPES
// ================================================================

interface UnifiedProductRendererProps {
    product: Product
    engine: ProductEngineReturn
}

// ================================================================
// LAYOUT COMPONENTS (Based on display_style)
// ================================================================

interface LayoutProps {
    children: React.ReactNode
    columns: number
    cardSize: UIConfig['card_size']
}

function GridLayout({ children, columns }: LayoutProps) {
    const getColumnClass = () => {
        switch (columns) {
            case 1: return 'grid-cols-1'
            case 2: return 'grid-cols-2'
            case 3: return 'grid-cols-2 md:grid-cols-3'
            case 4: return 'grid-cols-2 md:grid-cols-4'
            default: return 'grid-cols-2'
        }
    }

    return (
        <div className={`grid ${getColumnClass()} gap-3`}>
            {children}
        </div>
    )
}

function ListLayout({ children }: LayoutProps) {
    return (
        <div className="flex flex-col space-y-3">
            {children}
        </div>
    )
}

function CardsLayout({ children }: LayoutProps) {
    return (
        <div className="flex flex-wrap gap-3">
            {children}
        </div>
    )
}

// ================================================================
// TEMPLATE ID CONSTANTS (from seedTemplates.js)
// ================================================================

const TEMPLATE_IDS = {
    SIMPLE: 'template_1',
    MEDIUM: 'template_2',
    COMPLEX: 'template_3',
    LIFESTYLE: 'template_lifestyle'
} as const

// ================================================================
// SPECIALIZED LAYOUTS (Template-Specific Overrides)
// ================================================================

/**
 * LifestyleWizardLayout - Specialized layout for Lifestyle/Healthy products
 * Features: Prominent nutrition display, emerald gradient theme, wizard-like flow
 */
interface LifestyleWizardLayoutProps {
    engine: ProductEngineReturn
    LayoutComponent: React.ComponentType<LayoutProps>
    uiConfig: UIConfig
}

function LifestyleWizardLayout({ engine, LayoutComponent, uiConfig }: LifestyleWizardLayoutProps) {
    const {
        containers,
        selectedContainer,
        sizes,
        selectedSize,
        optionGroups,
        selections,
        selectedOptions,
        customizationTotal,
        nutrition,
        energyType,
        energyScore,
        hasContainers,
        hasSizes,
        hasCustomization,
        actions
    } = engine

    // Handle remove from customization summary
    const handleRemoveOption = (optionId: string) => {
        const option = selectedOptions.find(o => o.id === optionId)
        if (option) {
            actions.remove(option.groupId, optionId)
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-5"
        >
            {/* Lifestyle Header Badge */}
            <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 p-4 shadow-lg"
            >
                <div className="absolute inset-0 bg-[url('data:image/svg+xml,...')] opacity-10" />
                <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-2xl backdrop-blur-sm">
                            🥗
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">خيار ذكي</h3>
                            <p className="text-sm text-white/80">صمم كوبك الصحي</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-bold text-white">{Math.round(nutrition.calories)}</div>
                        <div className="text-xs text-white/80">سعرة حرارية</div>
                    </div>
                </div>
            </motion.div>

            {/* Prominent Nutrition Display (Always visible for Lifestyle) */}
            <NutritionBadge
                nutrition={nutrition}
                energyType={energyType}
                energyScore={energyScore}
            />

            {/* Containers Selector with emerald theme */}
            {hasContainers && containers.length > 1 && (
                <div className="space-y-2">
                    <h4 className="text-sm font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                        <span>🍵</span> اختر الوعاء
                    </h4>
                    <LayoutComponent columns={uiConfig.columns || 2} cardSize={uiConfig.card_size}>
                        {containers.map(container => (
                            <motion.button
                                key={container.id}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => actions.setContainer(container.id)}
                                className={`p-3 rounded-xl border-2 transition-all ${selectedContainer === container.id
                                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 ring-2 ring-emerald-500/30'
                                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
                                    }`}
                            >
                                {container.image && (
                                    <img src={container.image} alt={container.name} className="w-12 h-12 mx-auto mb-2 object-contain" />
                                )}
                                <div className="text-sm font-bold text-slate-800 dark:text-white">{container.nameAr || container.name}</div>
                                {container.priceModifier > 0 && (
                                    <div className="text-xs text-emerald-600">+{container.priceModifier} ج.م</div>
                                )}
                            </motion.button>
                        ))}
                    </LayoutComponent>
                </div>
            )}

            {/* Sizes Selector with emerald theme */}
            {hasSizes && sizes.length > 1 && (
                <div className="space-y-2">
                    <h4 className="text-sm font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                        <span>📏</span> اختر الحجم
                    </h4>
                    <LayoutComponent columns={uiConfig.columns || 2} cardSize={uiConfig.card_size}>
                        {sizes.map(size => (
                            <motion.button
                                key={size.id}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => actions.setSize(size.id)}
                                className={`p-3 rounded-xl border-2 transition-all ${selectedSize === size.id
                                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 ring-2 ring-emerald-500/30'
                                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
                                    }`}
                            >
                                <div className="text-sm font-bold text-slate-800 dark:text-white">{size.nameAr || size.name}</div>
                                {size.priceModifier > 0 && (
                                    <div className="text-xs text-emerald-600">+{size.priceModifier} ج.م</div>
                                )}
                            </motion.button>
                        ))}
                    </LayoutComponent>
                </div>
            )}

            {/* Customization Groups with emerald theme */}
            {hasCustomization && optionGroups.map(group => (
                <OptionGroupRenderer
                    key={group.groupId}
                    group={group}
                    selections={selections[group.groupId] || []}
                    onSelectionChange={(ids: string[]) => {
                        const currentIds = selections[group.groupId] || []
                        if (ids.length < currentIds.length) {
                            const removed = currentIds.find(id => !ids.includes(id))
                            if (removed) actions.remove(group.groupId, removed)
                        } else if (ids.length > currentIds.length) {
                            const added = ids.find(id => !currentIds.includes(id))
                            if (added) actions.select(group.groupId, added)
                        }
                    }}
                />
            ))}

            {/* Selection Summary with emerald theme */}
            {selectedOptions.length > 0 && (
                <CustomizationSummary
                    selections={selectedOptions}
                    customizationTotal={customizationTotal}
                    onRemove={handleRemoveOption}
                />
            )}
        </motion.div>
    )
}

// ================================================================
// NUTRITION BADGE (Conditional based on show_macros)
// ================================================================

interface NutritionBadgeProps {
    nutrition: ProductEngineReturn['nutrition']
    energyType: ProductEngineReturn['energyType']
    energyScore: ProductEngineReturn['energyScore']
}

function NutritionBadge({ nutrition, energyType, energyScore }: NutritionBadgeProps) {
    const getEnergyColor = () => {
        switch (energyType) {
            case 'mental': return 'from-purple-500 to-purple-600'
            case 'physical': return 'from-orange-500 to-orange-600'
            case 'balanced': return 'from-emerald-500 to-emerald-600'
            default: return 'from-slate-500 to-slate-600'
        }
    }

    const getEnergyEmoji = () => {
        switch (energyType) {
            case 'mental': return '🧠'
            case 'physical': return '💪'
            case 'balanced': return '⚡'
            default: return '🍦'
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 border border-slate-200 dark:border-slate-600"
        >
            <div className="flex items-center gap-4 text-sm">
                <div className="text-center">
                    <div className="font-bold text-slate-900 dark:text-white">{Math.round(nutrition.calories)}</div>
                    <div className="text-xs text-slate-500">سعرة</div>
                </div>
                <div className="text-center">
                    <div className="font-bold text-emerald-600">{Math.round(nutrition.protein)}g</div>
                    <div className="text-xs text-slate-500">بروتين</div>
                </div>
                <div className="text-center">
                    <div className="font-bold text-blue-600">{Math.round(nutrition.carbs)}g</div>
                    <div className="text-xs text-slate-500">كربوهيدرات</div>
                </div>
            </div>

            <div className={`flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r ${getEnergyColor()} text-white text-sm font-bold`}>
                <span>{getEnergyEmoji()}</span>
                <span>{energyScore}</span>
            </div>
        </motion.div>
    )
}

// ================================================================
// MAIN COMPONENT
// ================================================================

export default function UnifiedProductRenderer({ product: _product, engine }: UnifiedProductRendererProps) {
    const {
        isLoading,
        templateId,
        uiConfig,
        containers,
        selectedContainer,
        sizes,
        selectedSize,
        optionGroups,
        selections,
        selectedOptions,
        customizationTotal,
        nutrition,
        energyType,
        energyScore,
        hasContainers,
        hasSizes,
        hasCustomization,
        actions
    } = engine

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

    // Determine layout based on ui_config
    const LayoutComponent = (() => {
        switch (uiConfig.display_style) {
            case 'list': return ListLayout
            case 'grid': return GridLayout
            case 'cards':
            default: return CardsLayout
        }
    })()

    // ================================================================
    // TEMPLATE-SPECIFIC OVERRIDES
    // Override default rendering for specialized templates
    // ================================================================

    // Lifestyle Template: Use specialized emerald-themed layout
    if (templateId === TEMPLATE_IDS.LIFESTYLE) {
        return (
            <LifestyleWizardLayout
                engine={engine}
                LayoutComponent={LayoutComponent}
                uiConfig={uiConfig}
            />
        )
    }

    // Handle remove from customization summary
    const handleRemoveOption = (optionId: string) => {
        const option = selectedOptions.find(o => o.id === optionId)
        if (option) {
            actions.remove(option.groupId, optionId)
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
        >
            {/* Nutrition Badge (Conditional) */}
            {uiConfig.show_macros && (
                <NutritionBadge
                    nutrition={nutrition}
                    energyType={energyType}
                    energyScore={energyScore}
                />
            )}

            {/* Containers Selector */}
            {hasContainers && containers.length > 1 && (
                <div className="space-y-2">
                    <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">اختر الوعاء</h4>
                    <LayoutComponent columns={uiConfig.columns || 2} cardSize={uiConfig.card_size}>
                        {containers.map(container => (
                            <motion.button
                                key={container.id}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => actions.setContainer(container.id)}
                                className={`p-3 rounded-xl border-2 transition-all ${selectedContainer === container.id
                                    ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20'
                                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
                                    }`}
                            >
                                {uiConfig.show_images && container.image && (
                                    <img src={container.image} alt={container.name} className="w-12 h-12 mx-auto mb-2 object-contain" />
                                )}
                                <div className="text-sm font-bold text-slate-800 dark:text-white">{container.nameAr || container.name}</div>
                                {uiConfig.show_prices && container.priceModifier > 0 && (
                                    <div className="text-xs text-pink-600">+{container.priceModifier} ج.م</div>
                                )}
                            </motion.button>
                        ))}
                    </LayoutComponent>
                </div>
            )}

            {/* Sizes Selector */}
            {hasSizes && sizes.length > 1 && (
                <div className="space-y-2">
                    <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">اختر الحجم</h4>
                    <LayoutComponent columns={uiConfig.columns || 2} cardSize={uiConfig.card_size}>
                        {sizes.map(size => (
                            <motion.button
                                key={size.id}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => actions.setSize(size.id)}
                                className={`p-3 rounded-xl border-2 transition-all ${selectedSize === size.id
                                    ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20'
                                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
                                    }`}
                            >
                                <div className="text-sm font-bold text-slate-800 dark:text-white">{size.nameAr || size.name}</div>
                                {uiConfig.show_prices && size.priceModifier > 0 && (
                                    <div className="text-xs text-pink-600">+{size.priceModifier} ج.م</div>
                                )}
                            </motion.button>
                        ))}
                    </LayoutComponent>
                </div>
            )}

            {/* Customization Groups - Uses existing OptionGroupRenderer */}
            {hasCustomization && optionGroups.map(group => (
                <OptionGroupRenderer
                    key={group.groupId}
                    group={group}
                    selections={selections[group.groupId] || []}
                    onSelectionChange={(ids: string[]) => {
                        // OptionGroupRenderer returns full selection array
                        // We need to determine what changed and update via actions
                        const currentIds = selections[group.groupId] || []

                        // If new array is shorter, something was removed
                        if (ids.length < currentIds.length) {
                            const removed = currentIds.find(id => !ids.includes(id))
                            if (removed) actions.remove(group.groupId, removed)
                        } else if (ids.length > currentIds.length) {
                            // Something was added
                            const added = ids.find(id => !currentIds.includes(id))
                            if (added) actions.select(group.groupId, added)
                        }
                    }}
                />
            ))}

            {/* Selection Summary */}
            {selectedOptions.length > 0 && (
                <CustomizationSummary
                    selections={selectedOptions}
                    customizationTotal={customizationTotal}
                    onRemove={handleRemoveOption}
                />
            )}
        </motion.div>
    )
}

// ================================================================
// EXPORTS
// ================================================================

export { NutritionBadge, GridLayout, ListLayout, CardsLayout }
