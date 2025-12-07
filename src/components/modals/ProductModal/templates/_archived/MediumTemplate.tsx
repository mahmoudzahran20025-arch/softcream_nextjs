'use client'

import { motion } from 'framer-motion'
import {
    Package,
    Ruler,
    IceCream,
    Droplet
} from 'lucide-react'
import ContainerSelector from '../../ContainerSelector'
import SizeSelector from '../../SizeSelector'
import { OptionsGrid } from '../shared'

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

interface MediumTemplateProps {
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

export default function MediumTemplate({
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
}: MediumTemplateProps) {

    // Group categorization
    const flavorsGroup = customizationRules.find(g =>
        g.groupId === 'flavors' || g.groupId === 'ice_cream_flavors'
    )
    const otherGroups = customizationRules.filter(g =>
        g.groupId !== 'flavors' && g.groupId !== 'ice_cream_flavors'
    )

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
        >
            {/* Header Info (Optional) */}

            {/* Container & Size */}
            {(containers.length > 0 || sizes.length > 0) && (
                <div className="space-y-4">
                    {containers.length > 0 && (
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                                <Package className="w-5 h-5 text-pink-500" />
                                <span>اختر الحاوية</span>
                            </div>
                            <ContainerSelector
                                containers={containers}
                                selectedContainer={selectedContainer}
                                onSelect={onContainerSelect}
                            />
                        </div>
                    )}

                    {sizes.length > 0 && (
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                                <Ruler className="w-5 h-5 text-pink-500" />
                                <span>اختر الحجم</span>
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

            {/* Main Options (Flavors) */}
            {flavorsGroup && (
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                            <IceCream className="w-5 h-5 text-pink-500" />
                            <span>{flavorsGroup.groupName}</span>
                        </div>
                        <span className="text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">
                            اختر {flavorsGroup.minSelections} - {flavorsGroup.maxSelections}
                        </span>
                    </div>

                    <OptionsGrid
                        group={flavorsGroup}
                        selections={selections[flavorsGroup.groupId] || []}
                        onSelectionChange={(ids) => onSelectionChange(flavorsGroup.groupId, ids)}
                        columns={3}
                        cardSize="md"
                        accentColor="pink"
                        showSelectionOrder={true}
                        showImages={true}
                        showDescriptions={true}
                        showNutrition={false}
                    />
                </div>
            )}

            {/* Other Groups (Vertical List) */}
            {otherGroups.map((group) => (
                <div key={group.groupId} className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                            {/* Dynamic Icon based on group name or fallback */}
                            <Droplet className="w-5 h-5 text-amber-500" />
                            <span>{group.groupName}</span>
                        </div>
                        {group.maxSelections > 1 && (
                            <span className="text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">
                                اختر حتى {group.maxSelections}
                            </span>
                        )}
                    </div>

                    <OptionsGrid
                        group={group}
                        selections={selections[group.groupId] || []}
                        onSelectionChange={(ids) => onSelectionChange(group.groupId, ids)}
                        columns={3} // 3 columns for medium complexity
                        cardSize="sm"
                        accentColor="amber"
                        showImages={true}
                        showDescriptions={false}
                        showNutrition={false}
                    />
                </div>
            ))}
        </motion.div>
    )
}
