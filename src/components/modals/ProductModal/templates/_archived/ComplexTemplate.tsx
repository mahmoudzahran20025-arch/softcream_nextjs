'use client'

import { motion } from 'framer-motion'
import {
    Sparkles,
    Package,
    Ruler,
    IceCream,
    Droplet,
    Cookie
} from 'lucide-react'
import ContainerSelector from '../../ContainerSelector'
import SizeSelector from '../../SizeSelector'
import { OptionsGrid, StepSection } from '../shared'

interface Option {
    id: string
    name_ar: string
    name_en: string
    price: number
    image?: string
}

interface CustomizationGroup {
    groupId: string
    groupName: string
    groupDescription?: string
    groupIcon?: string
    isRequired: boolean
    minSelections: number
    maxSelections: number
    options: Option[]
}

interface ComplexTemplateProps {
    product: any
    containers: any[]
    selectedContainer: any
    onContainerSelect: (container: any) => void
    sizes: any[]
    selectedSize: any
    onSizeSelect: (size: any) => void
    customizationRules: CustomizationGroup[]
    selections: Record<string, string[]>
    onSelectionChange: (groupId: string, ids: string[]) => void
}

export default function ComplexTemplate({
    product,
    containers,
    selectedContainer,
    onContainerSelect,
    sizes,
    selectedSize,
    onSizeSelect,
    customizationRules,
    selections,
    onSelectionChange
}: ComplexTemplateProps) {
    // Separate flavors from other groups
    // TODO: Make this more generic based on display_order or metadata
    const flavorsGroup = customizationRules.find(g =>
        g.groupId === 'flavors' || g.groupId === 'ice_cream_flavors'
    )
    const saucesGroup = customizationRules.find(g => g.groupId === 'sauces')
    const toppingsGroup = customizationRules.find(g => g.groupId === 'toppings' || g.groupId === 'dry_toppings')
    const otherGroups = customizationRules.filter(g =>
        !['flavors', 'ice_cream_flavors', 'sauces', 'toppings', 'dry_toppings'].includes(g.groupId)
    )

    const selectedFlavors = flavorsGroup ? (selections[flavorsGroup.groupId] || []) : []
    const hasSelectedFlavors = selectedFlavors.length > 0

    // Calculate progress
    const totalSteps = [
        containers.length > 0,
        sizes.length > 0,
        !!flavorsGroup
    ].filter(Boolean).length

    const completedSteps = [
        containers.length > 0 && selectedContainer,
        sizes.length > 0 && selectedSize,
        flavorsGroup && hasSelectedFlavors
    ].filter(Boolean).length

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
        >
            {/* Progress Indicator */}
            <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(completedSteps / totalSteps) * 100}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                        className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full"
                    />
                </div>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    {completedSteps}/{totalSteps}
                </span>
            </div>

            {/* Container & Size - Compact Row */}
            {(containers.length > 0 || sizes.length > 0) && (
                <div className="flex flex-wrap items-center gap-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                    {/* Container Selection */}
                    {containers.length > 0 && (
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                                <Package className="w-4 h-4" />
                                <span className="text-xs font-medium">الحاوية:</span>
                            </div>
                            <ContainerSelector
                                containers={containers}
                                selectedContainer={selectedContainer}
                                onSelect={onContainerSelect}
                            />
                        </div>
                    )}

                    {/* Divider */}
                    {containers.length > 0 && sizes.length > 0 && (
                        <div className="w-px h-6 bg-slate-200 dark:bg-slate-700" />
                    )}

                    {/* Size Selection */}
                    {sizes.length > 0 && (
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                                <Ruler className="w-4 h-4" />
                                <span className="text-xs font-medium">المقاس:</span>
                            </div>
                            <SizeSelector
                                sizes={sizes}
                                selectedSize={selectedSize}
                                onSelect={onSizeSelect}
                                basePrice={product.price}
                            />
                        </div>
                    )}
                </div>
            )}

            {/* Step 3: Flavors - Cards Grid */}
            {flavorsGroup && (
                <StepSection
                    step={(containers.length > 0 ? 1 : 0) + (sizes.length > 0 ? 1 : 0) + 1}
                    title={flavorsGroup.groupName || "اختر النكهات"}
                    IconComponent={IceCream}
                    badge={`${selectedFlavors.length}/${flavorsGroup.maxSelections}`}
                    isComplete={hasSelectedFlavors}
                    isActive={!!selectedSize && !hasSelectedFlavors}
                    highlight
                    hint={!hasSelectedFlavors ? `اختر ${flavorsGroup.minSelections} نكهة على الأقل لإضافة المنتج للسلة` : undefined}
                >
                    <OptionsGrid
                        group={flavorsGroup}
                        selections={selectedFlavors}
                        onSelectionChange={(ids) => onSelectionChange(flavorsGroup.groupId, ids)}
                        columns={3}
                        cardSize="md"
                        accentColor="pink"
                        showSelectionOrder={true}
                        showImages={true}
                        showDescriptions={true}
                        showNutrition={true}
                    />
                </StepSection>
            )}

            {/* Optional Add-ons Section - Always visible for exploration */}
            {(saucesGroup || toppingsGroup || otherGroups.length > 0) && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-5 pt-2"
                >
                    {/* Section Header with Quick Nav */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-pink-500" />
                            <h3 className="font-bold text-slate-900 dark:text-white text-sm">إضافات اختيارية</h3>
                            <div className="flex-1 h-px bg-gradient-to-r from-pink-200 to-transparent dark:from-pink-800" />
                            {!hasSelectedFlavors && (
                                <span className="text-[10px] text-slate-400 dark:text-slate-500">
                                    (اختر النكهات أولاً)
                                </span>
                            )}
                        </div>

                        {/* Quick Navigation Pills */}
                        <div className="flex flex-wrap gap-2">
                            {saucesGroup && (
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => document.getElementById('section-sauces')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                                    className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full transition-all ${(selections[saucesGroup.groupId] || []).length > 0
                                            ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 ring-1 ring-amber-300 dark:ring-amber-700'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-amber-50 dark:hover:bg-amber-950/20'
                                        }`}
                                >
                                    <Droplet className="w-3.5 h-3.5" />
                                    <span>{saucesGroup.groupName}</span>
                                    {(selections[saucesGroup.groupId] || []).length > 0 && (
                                        <span className="font-bold">({(selections[saucesGroup.groupId] || []).length})</span>
                                    )}
                                </motion.button>
                            )}
                            {toppingsGroup && (
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => document.getElementById('section-toppings')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                                    className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full transition-all ${(selections[toppingsGroup.groupId] || []).length > 0
                                            ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 ring-1 ring-purple-300 dark:ring-purple-700'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-purple-50 dark:hover:bg-purple-950/20'
                                        }`}
                                >
                                    <Cookie className="w-3.5 h-3.5" />
                                    <span>{toppingsGroup.groupName}</span>
                                    {(selections[toppingsGroup.groupId] || []).length > 0 && (
                                        <span className="font-bold">({(selections[toppingsGroup.groupId] || []).length})</span>
                                    )}
                                </motion.button>
                            )}
                        </div>
                    </div>

                    {/* Sauces - Cards */}
                    {saucesGroup && (
                        <div id="section-sauces">
                            <OptionsGrid
                                group={saucesGroup}
                                selections={selections[saucesGroup.groupId] || []}
                                onSelectionChange={(ids) => onSelectionChange(saucesGroup.groupId, ids)}
                                columns={3}
                                cardSize="sm"
                                accentColor="amber"
                                showImages={true}
                                showDescriptions={false}
                                showNutrition={true}
                            />
                        </div>
                    )}

                    {/* Toppings - Cards */}
                    {toppingsGroup && (
                        <div id="section-toppings">
                            <OptionsGrid
                                group={toppingsGroup}
                                selections={selections[toppingsGroup.groupId] || []}
                                onSelectionChange={(ids) => onSelectionChange(toppingsGroup.groupId, ids)}
                                columns={3}
                                cardSize="sm"
                                accentColor="purple"
                                showImages={true}
                                showDescriptions={false}
                                showNutrition={true}
                            />
                        </div>
                    )}

                    {/* Other Groups - Cards */}
                    {otherGroups.map(group => (
                        <OptionsGrid
                            key={group.groupId}
                            group={group}
                            selections={selections[group.groupId] || []}
                            onSelectionChange={(ids) => onSelectionChange(group.groupId, ids)}
                            columns={3}
                            cardSize="sm"
                            accentColor="pink"
                            showImages={true}
                            showDescriptions={false}
                            showNutrition={true}
                        />
                    ))}
                </motion.div>
            )}
        </motion.div>
    )
}
