'use client'

/**
 * OptionGroupRenderer - Metadata-Driven Option Group Component
 * ============================================================
 * Renders option groups dynamically based on ui_config from backend
 * 
 * Requirements:
 * - 8.5: Use extended parseUIConfig function, pass config to OptionRenderer
 * - 5.2: Check canRenderMode before rendering, apply fallback when needed
 * - 6.1, 6.2, 6.3: Use calculateLayout for column determination
 * - 1.3: Display group description as subtitle under group title
 */

import { motion } from 'framer-motion'
import { parseUIConfig, type UIConfig } from '@/lib/uiConfig'
// Note: calculateLayout is used inside DisplayModeRenderer for adaptive layout (Requirements: 6.1, 6.2, 6.3)
import DynamicIcon from '@/components/ui/DynamicIcon'
import HeroSelectionRenderer from './HeroSelectionRenderer'
import InteractiveMeter from './InteractiveMeter'
import DisplayModeRenderer, { canRenderMode, getEffectiveMode } from './DisplayModeRenderer'
import type { AccentColor } from '../modals/ProductModal/templates/shared/types'

interface OptionGroupRendererProps {
    group: any  // Option group from backend with ui_config
    selections: string[]
    onSelectionChange: (ids: string[]) => void
    /** Language for display - defaults to 'ar' */
    language?: 'ar' | 'en'
}

// Display style type from ui_config (Requirement 4.3)
type DisplayStyle = 'cards' | 'pills' | 'list' | 'checkbox' | 'grid'

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
 * Get group description based on language
 * Requirements: 1.3 - Display group description as subtitle
 */
function getGroupDescription(group: any, language: 'ar' | 'en'): string | undefined {
    if (language === 'ar') {
        return group.description_ar || group.descriptionAr
    }
    return group.description_en || group.descriptionEn || group.description_ar || group.descriptionAr
}

/**
 * Get group name based on language
 */
function getGroupName(group: any, language: 'ar' | 'en'): string {
    if (language === 'ar') {
        return group.groupName || group.name_ar || group.nameAr || group.name || ''
    }
    return group.name_en || group.nameEn || group.groupName || group.name_ar || group.name || ''
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
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all border-2 ${isSelected
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
                        className={`w-full flex items-center justify-between p-3 rounded-xl transition-all border ${isSelected
                            ? 'bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected
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
                        <div className={`w-5 h-5 rounded ${group.maxSelections === 1 ? 'rounded-full' : 'rounded'} border-2 flex items-center justify-center ${isSelected
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
 * Requirements:
 * - 8.5: Use extended parseUIConfig function
 * - 5.2: Check canRenderMode before rendering, apply fallback
 * - 6.1, 6.2, 6.3: Use calculateLayout for adaptive columns
 * - 1.3: Display group description as subtitle
 * - 4.3: Supports display_style from ui_config
 */
export default function OptionGroupRenderer({
    group,
    selections,
    onSelectionChange,
    language = 'ar'
}: OptionGroupRendererProps) {
    // ✅ Task 17.1: Parse UI Config using extended parseUIConfig function
    // Requirements: 8.5 - Use extended parseUIConfig with defaults merging
    const uiConfig: UIConfig = parseUIConfig(group.ui_config)

    // ✅ Get display_style from ui_config (Requirement 4.3)
    const displayStyle = normalizeDisplayStyle(uiConfig.display_style || uiConfig.fallback_style)
    const accentColor = normalizeAccentColor(uiConfig.accent_color)
    
    // ✅ Task 17.4: Get group description for subtitle display
    // Requirements: 1.3 - Display description_ar under group title
    const groupDescription = getGroupDescription(group, language)
    const groupName = getGroupName(group, language)

    // ✅ Render options based on display_mode (new system) or section_type (legacy)
    const renderOptions = () => {
        const options = group.options || []
        const maxSelections = group.maxSelections || group.max_selections || 1
        
        // ✅ Task 17.2: Check canRenderMode before rendering, apply fallback when needed
        // Requirements: 5.2 - Fallback to fallback_style when mode cannot render
        const displayMode = uiConfig.display_mode || 'default'
        const fallbackStyle = uiConfig.fallback_style || 'cards'
        
        // Get effective mode with fallback check
        const { mode: effectiveMode, useFallback } = getEffectiveMode(displayMode, fallbackStyle, options)
        
        // ✅ Task 17.3: Adaptive layout integration
        // Requirements: 6.1, 6.2, 6.3 - calculateLayout is used inside DisplayModeRenderer
        // The columns config is passed through to DisplayModeRenderer which handles layout calculation
        
        // Create enhanced uiConfig with layout info
        const enhancedConfig: UIConfig = {
            ...uiConfig,
            display_mode: effectiveMode,
            // If fallback was used, ensure fallback_style is applied
            ...(useFallback && { display_mode: 'default' }),
            // Pass through columns config for DisplayModeRenderer to use
            columns: uiConfig.columns
        }
        
        // 1. Check if we should use the new display_mode system
        // Requirements: 4.2, 4.3, 4.4, 4.5, 5.2
        if (effectiveMode && effectiveMode !== 'default') {
            // Use new DisplayModeRenderer for non-default modes
            return (
                <DisplayModeRenderer
                    options={options}
                    uiConfig={enhancedConfig}
                    selectedIds={selections}
                    maxSelections={maxSelections}
                    onSelectionChange={onSelectionChange}
                    language={language}
                    accentColor={accentColor}
                />
            )
        }

        // 2. Handle Legacy Section Types (backward compatibility)
        if (uiConfig.section_type) {
            switch (uiConfig.section_type) {
                case 'hero_selection':
                    // Check if hero mode can render - Requirements: 5.2
                    if (canRenderMode('hero_flavor', options)) {
                        return (
                            <DisplayModeRenderer
                                options={options}
                                uiConfig={{ ...enhancedConfig, display_mode: 'hero_flavor' }}
                                selectedIds={selections}
                                maxSelections={maxSelections}
                                onSelectionChange={onSelectionChange}
                                language={language}
                                accentColor={accentColor}
                            />
                        )
                    }
                    // Fallback to legacy renderer
                    return (
                        <HeroSelectionRenderer
                            options={options}
                            selectedIds={selections}
                            onSelect={(id) => onSelectionChange([id])}
                            accentColor={accentColor}
                        />
                    )
                case 'interactive_meter':
                    // Check if smart meter can render - Requirements: 5.2
                    if (canRenderMode('smart_meter', options)) {
                        return (
                            <DisplayModeRenderer
                                options={options}
                                uiConfig={{ ...enhancedConfig, display_mode: 'smart_meter' }}
                                selectedIds={selections}
                                maxSelections={maxSelections}
                                onSelectionChange={onSelectionChange}
                                language={language}
                                accentColor={accentColor}
                            />
                        )
                    }
                    // Fallback to legacy renderer
                    return (
                        <InteractiveMeter
                            options={options}
                            selectedIds={selections}
                            onSelect={(id) => onSelectionChange([id])}
                            accentColor={accentColor}
                        />
                    )
                case 'compact_addons':
                    // Force pills for compact addons
                    return (
                        <PillsDisplay
                            group={group}
                            selections={selections}
                            onSelectionChange={onSelectionChange}
                            accentColor={accentColor}
                        />
                    )
            }
        }

        // 3. Fallback to Standard Display Styles (legacy fallback_style or display_style)
        // Apply adaptive layout classes from calculateLayout - Requirements: 6.1, 6.2, 6.3
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
                // Use new DisplayModeRenderer for default mode with fallback_style
                // Layout is calculated inside DisplayModeRenderer using calculateLayout
                return (
                    <DisplayModeRenderer
                        options={options}
                        uiConfig={enhancedConfig}
                        selectedIds={selections}
                        maxSelections={maxSelections}
                        onSelectionChange={onSelectionChange}
                        language={language}
                        accentColor={accentColor}
                    />
                )
        }
    }

    const containerVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.3,
                staggerChildren: 0.05
            }
        }
    }

    // ✅ FIX: Show header only for non-grid/cards display styles
    // OptionsGrid already renders its own header, so we skip it for cards/grid
    const showHeader = displayStyle !== 'cards' && displayStyle !== 'grid'
    
    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            layout
            className="space-y-3"
        >
            {/* Header - Only for pills/list/checkbox (OptionsGrid has its own header) */}
            {showHeader && (
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                            {/* ✅ Dynamic Icon */}
                            {uiConfig.icon && (
                                <DynamicIcon config={uiConfig.icon} size={20} color={accentColor} />
                            )}
                            {/* Fallback to group icon */}
                            {!uiConfig.icon && group.groupIcon && (
                                <span className="text-xl">{group.groupIcon}</span>
                            )}
                            <span className="text-lg font-bold">{groupName}</span>
                        </div>
                        
                        {/* ✅ Task 17.4: Display group description as subtitle */}
                        {/* Requirements: 1.3 - Show description_ar under group title */}
                        {/* Supports format like "اضف المزيد :: اختر نكهاتك براحتك" */}
                        {groupDescription && (
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 mr-7">
                                {groupDescription}
                            </p>
                        )}
                    </div>

                    {/* Selection Badge */}
                    {group.maxSelections > 1 && (
                        <span className="text-xs text-slate-500 bg-white/50 dark:bg-white/10 px-2 py-1 rounded-full backdrop-blur-md self-start">
                            {language === 'ar' ? 'اختر' : 'Choose'} {group.minSelections === group.maxSelections
                                ? group.minSelections
                                : `${group.minSelections} - ${group.maxSelections}`}
                        </span>
                    )}
                </div>
            )}

            {/* ✅ Dynamic Layout based on display_style (Requirement 4.3) */}
            <div className="relative">
                {renderOptions()}
            </div>
        </motion.div>
    )
}
