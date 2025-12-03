'use client'

import { motion } from 'framer-motion'
import {
    Package,
    Ruler,
    CheckCircle
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

interface SimpleTemplateProps {
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

export default function SimpleTemplate({
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
}: SimpleTemplateProps) {

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
        >
            {/* Simple Layout: Just Container/Size and maybe 1 option group */}

            {/* Container & Size */}
            {(containers.length > 0 || sizes.length > 0) && (
                <div className="grid grid-cols-1 gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl">
                    {containers.length > 0 && (
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                                <Package className="w-4 h-4" />
                                <span>الحاوية</span>
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
                            <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                                <Ruler className="w-4 h-4" />
                                <span>الحجم</span>
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

            {/* Option Groups (Simple List) */}
            {customizationRules.map((group) => (
                <div key={group.groupId} className="space-y-2">
                    <div className="flex items-center gap-2 font-medium text-slate-900 dark:text-white">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>{group.groupName}</span>
                    </div>

                    <OptionsGrid
                        group={group}
                        selections={selections[group.groupId] || []}
                        onSelectionChange={(ids) => onSelectionChange(group.groupId, ids)}
                        columns={2} // 2 columns for simple selection
                        cardSize="sm"
                        accentColor="pink"
                        showImages={false} // Text-heavy for simple options
                        showDescriptions={false}
                        showNutrition={false}
                    />
                </div>
            ))}
        </motion.div>
    )
}
