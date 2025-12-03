'use client'

import { parseUIConfig } from '@/lib/uiConfig'
import DynamicIcon from '@/components/ui/DynamicIcon'
import { OptionsGrid } from '../modals/ProductModal/templates/shared'
import type { GridColumns, CardSize, AccentColor } from '../modals/ProductModal/templates/shared/types'

interface OptionGroupRendererProps {
    group: any  // Option group from backend with ui_config
    selections: string[]
    onSelectionChange: (ids: string[]) => void
}

// Helper to validate and normalize columns value
const normalizeColumns = (value: number | undefined): GridColumns => {
    if (value === 2 || value === 3 || value === 4) return value
    return 3 // default
}

// Helper to validate and normalize cardSize value
const normalizeCardSize = (value: string | undefined): CardSize => {
    if (value === 'sm' || value === 'md' || value === 'lg') return value
    return 'md' // default
}

// Helper to validate and normalize accentColor value
const normalizeAccentColor = (value: string | undefined): AccentColor => {
    if (value === 'pink' || value === 'amber' || value === 'purple' || value === 'cyan' || value === 'emerald') return value
    return 'pink' // default
}

/**
 * OptionGroupRenderer - Metadata-Driven Component
 * ================================================
 * Renders option groups dynamically based on ui_config from backend
 * No hard-coded styling or layout - everything driven by data
 */
export default function OptionGroupRenderer({
    group,
    selections,
    onSelectionChange
}: OptionGroupRendererProps) {
    // ✅ Parse UI Config from backend
    const uiConfig = parseUIConfig(group.ui_config)

    return (
        <div className="space-y-3">
            {/* Header with Dynamic Icon */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                    {/* ✅ Dynamic Icon */}
                    {uiConfig.icon && (
                        <DynamicIcon config={uiConfig.icon} size={20} />
                    )}
                    <span>{group.groupName || group.name_ar}</span>
                </div>

                {/* Selection Badge */}
                {group.maxSelections > 1 && (
                    <span className="text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">
                        اختر {group.minSelections === group.maxSelections
                            ? group.minSelections
                            : `${group.minSelections} - ${group.maxSelections}`}
                    </span>
                )}
            </div>

            {/* ✅ Dynamic Layout - Using existing OptionsGrid with ui_config */}
            <OptionsGrid
                group={group}
                selections={selections}
                onSelectionChange={onSelectionChange}
                columns={normalizeColumns(uiConfig.columns)}
                cardSize={normalizeCardSize(uiConfig.cardSize)}
                accentColor={normalizeAccentColor(uiConfig.accentColor)}
                showImages={uiConfig.showImages ?? true}
                showDescriptions={false}
                showNutrition={false}
            />
        </div>
    )
}
