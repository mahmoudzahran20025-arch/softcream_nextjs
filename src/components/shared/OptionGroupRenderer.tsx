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

// Display style type from ui_config (Requirement 4.3)
type DisplayStyle = 'cards' | 'pills' | 'list' | 'checkbox' | 'grid'

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

// Helper to normalize display_style value (Requirement 4.3)
const normalizeDisplayStyle = (value: string | undefined): DisplayStyle => {
    if (value === 'cards' || value === 'pills' || value === 'list' || value === 'checkbox' || value === 'grid') {
        return value
    }
    return 'cards' // default
}

/**
 * Pills Display Component - Compact pill-style options
 * Requirement 4.3: display_style = 'pills'
 */
function PillsDisplay({ 
    group, 
    selections, 
    onSelectionChange,
    accentColor 
}: { 
    group: any
    selections: string[]
    onSelectionChange: (ids: string[]) => void
    accentColor: AccentColor
}) {
    const handleToggle = (optionId: string) => {
        const isSelected = selections.includes(optionId)
        if (isSelected) {
            onSelectionChange(selections.filter(id => id !== optionId))
        } else if (selections.length < group.maxSelections) {
            onSelectionChange([...selections, optionId])
        } else if (group.maxSelections === 1) {
            onSelectionChange([optionId])
        }
    }

    const accentColors = {
        pink: 'bg-pink-500 border-pink-500',
        amber: 'bg-amber-500 border-amber-500',
        purple: 'bg-purple-500 border-purple-500',
        cyan: 'bg-cyan-500 border-cyan-500',
        emerald: 'bg-emerald-500 border-emerald-500',
    }

    return (
        <div className="flex flex-wrap gap-2">
            {(group.options || []).map((option: any) => {
                const isSelected = selections.includes(option.id)
                return (
                    <button
                        key={option.id}
                        onClick={() => handleToggle(option.id)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all border-2 ${
                            isSelected
                                ? `${accentColors[accentColor]} text-white`
                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                        }`}
                    >
                        {option.name_ar || option.name}
                        {option.base_price > 0 && (
                            <span className="mr-1 text-xs opacity-75">+{option.base_price}</span>
                        )}
                    </button>
                )
            })}
        </div>
    )
}

/**
 * List Display Component - Vertical list with checkboxes
 * Requirement 4.3: display_style = 'list'
 */
function ListDisplay({ 
    group, 
    selections, 
    onSelectionChange,
    accentColor 
}: { 
    group: any
    selections: string[]
    onSelectionChange: (ids: string[]) => void
    accentColor: AccentColor
}) {
    const handleToggle = (optionId: string) => {
        const isSelected = selections.includes(optionId)
        if (isSelected) {
            onSelectionChange(selections.filter(id => id !== optionId))
        } else if (selections.length < group.maxSelections) {
            onSelectionChange([...selections, optionId])
        } else if (group.maxSelections === 1) {
            onSelectionChange([optionId])
        }
    }

    const accentColors = {
        pink: 'bg-pink-500',
        amber: 'bg-amber-500',
        purple: 'bg-purple-500',
        cyan: 'bg-cyan-500',
        emerald: 'bg-emerald-500',
    }

    return (
        <div className="space-y-2">
            {(group.options || []).map((option: any) => {
                const isSelected = selections.includes(option.id)
                return (
                    <button
                        key={option.id}
                        onClick={() => handleToggle(option.id)}
                        className={`w-full flex items-center justify-between p-3 rounded-xl transition-all border ${
                            isSelected
                                ? 'bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600'
                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                isSelected 
                                    ? `${accentColors[accentColor]} border-transparent` 
                                    : 'border-slate-300 dark:border-slate-600'
                            }`}>
                                {isSelected && (
                                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                )}
                            </div>
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                {option.name_ar || option.name}
                            </span>
                        </div>
                        {option.base_price > 0 && (
                            <span className="text-xs text-slate-500">+{option.base_price} ج.م</span>
                        )}
                    </button>
                )
            })}
        </div>
    )
}

/**
 * Checkbox Display Component - Traditional checkbox style
 * Requirement 4.3: display_style = 'checkbox'
 */
function CheckboxDisplay({ 
    group, 
    selections, 
    onSelectionChange,
    accentColor 
}: { 
    group: any
    selections: string[]
    onSelectionChange: (ids: string[]) => void
    accentColor: AccentColor
}) {
    const handleToggle = (optionId: string) => {
        const isSelected = selections.includes(optionId)
        if (isSelected) {
            onSelectionChange(selections.filter(id => id !== optionId))
        } else if (selections.length < group.maxSelections) {
            onSelectionChange([...selections, optionId])
        } else if (group.maxSelections === 1) {
            onSelectionChange([optionId])
        }
    }

    const accentColors = {
        pink: 'bg-pink-500',
        amber: 'bg-amber-500',
        purple: 'bg-purple-500',
        cyan: 'bg-cyan-500',
        emerald: 'bg-emerald-500',
    }

    return (
        <div className="space-y-2">
            {(group.options || []).map((option: any) => {
                const isSelected = selections.includes(option.id)
                return (
                    <label
                        key={option.id}
                        className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                        <input
                            type={group.maxSelections === 1 ? 'radio' : 'checkbox'}
                            checked={isSelected}
                            onChange={() => handleToggle(option.id)}
                            className="sr-only"
                        />
                        <div className={`w-5 h-5 rounded ${group.maxSelections === 1 ? 'rounded-full' : 'rounded'} border-2 flex items-center justify-center ${
                            isSelected 
                                ? `${accentColors[accentColor]} border-transparent` 
                                : 'border-slate-300 dark:border-slate-600'
                        }`}>
                            {isSelected && (
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            )}
                        </div>
                        <span className="text-sm text-slate-700 dark:text-slate-300 flex-1">
                            {option.name_ar || option.name}
                        </span>
                        {option.base_price > 0 && (
                            <span className="text-xs text-slate-500">+{option.base_price} ج.م</span>
                        )}
                    </label>
                )
            })}
        </div>
    )
}

/**
 * OptionGroupRenderer - Metadata-Driven Component
 * ================================================
 * Renders option groups dynamically based on ui_config from backend
 * No hard-coded styling or layout - everything driven by data
 * 
 * Requirement 4.3: Supports display_style from ui_config
 * - 'cards' (default): Grid of option cards
 * - 'pills': Compact pill-style buttons
 * - 'list': Vertical list with selection indicators
 * - 'checkbox': Traditional checkbox/radio style
 */
export default function OptionGroupRenderer({
    group,
    selections,
    onSelectionChange
}: OptionGroupRendererProps) {
    // ✅ Parse UI Config from backend
    const uiConfig = parseUIConfig(group.ui_config)
    
    // ✅ Get display_style from ui_config (Requirement 4.3)
    const displayStyle = normalizeDisplayStyle(uiConfig.display_style || uiConfig.displayMode)
    const accentColor = normalizeAccentColor(uiConfig.accentColor)

    // ✅ Render options based on display_style
    const renderOptions = () => {
        switch (displayStyle) {
            case 'pills':
                return (
                    <PillsDisplay
                        group={group}
                        selections={selections}
                        onSelectionChange={onSelectionChange}
                        accentColor={accentColor}
                    />
                )
            case 'list':
                return (
                    <ListDisplay
                        group={group}
                        selections={selections}
                        onSelectionChange={onSelectionChange}
                        accentColor={accentColor}
                    />
                )
            case 'checkbox':
                return (
                    <CheckboxDisplay
                        group={group}
                        selections={selections}
                        onSelectionChange={onSelectionChange}
                        accentColor={accentColor}
                    />
                )
            case 'cards':
            case 'grid':
            default:
                // Default to OptionsGrid (cards style)
                return (
                    <OptionsGrid
                        group={group}
                        selections={selections}
                        onSelectionChange={onSelectionChange}
                        columns={normalizeColumns(uiConfig.columns)}
                        cardSize={normalizeCardSize(uiConfig.cardSize)}
                        accentColor={accentColor}
                        showImages={uiConfig.showImages ?? true}
                        showDescriptions={false}
                        showNutrition={false}
                    />
                )
        }
    }

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

            {/* ✅ Dynamic Layout based on display_style (Requirement 4.3) */}
            {renderOptions()}
        </div>
    )
}
