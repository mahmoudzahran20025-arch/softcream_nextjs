'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, ChevronLeft, Dumbbell, Sparkles, ChefHat, Leaf } from 'lucide-react'
import { Product, ContainerType, ProductSize } from '@/lib/api'
import { useProductConfiguration } from '@/hooks/useProductConfiguration'
import { OptionsGrid } from '../shared'
import SizeSelector from '../../SizeSelector'
import ContainerSelector from '../../ContainerSelector'

// --- Interfaces ---
interface LifestyleWizardProps {
    product: Product
    productConfig: ReturnType<typeof useProductConfiguration>
    onComplete: () => void
}

type WizardTab = 'presets' | 'custom'

// --- Mock Data for Presets (Placeholder for future feature) ---
const MOCK_PRESETS = [
    {
        id: 'preset_gym',
        name: 'كوب الرياضي',
        description: 'عالي البروتين (35g) | قليل السكر',
        icon: Dumbbell,
        color: 'bg-emerald-500',
        tags: ['High Protein', 'Post Workout'],
        calories: 220,
        protein: 35,
        price: 65,
    },
    {
        id: 'preset_glow',
        name: 'كوب النضارة',
        description: 'كولاجين + فيتامين سي | 0 سكر',
        icon: Sparkles,
        color: 'bg-rose-500',
        tags: ['Skin Glow', 'Vitamins'],
        calories: 180,
        protein: 12,
        price: 60,
    },
    {
        id: 'preset_vegan',
        name: 'النباتي المنعش',
        description: 'حليب لوز + فواكه | خفيف جداً',
        icon: Leaf,
        color: 'bg-green-500',
        tags: ['Vegan', 'Light'],
        calories: 140,
        protein: 8,
        price: 55,
    }
]

export default function LifestyleWizard({ product, productConfig, onComplete }: LifestyleWizardProps) {
    const [activeTab, setActiveTab] = useState<WizardTab>('custom') // Default to custom for real usage
    const [selectedPreset, setSelectedPreset] = useState<string | null>(null)
    const [currentStep, setCurrentStep] = useState(0) // 0: Size/Base, 1: Flavors, 2: Toppings

    // Destructure config
    const {
        containers,
        selectedContainer,
        setSelectedContainer,
        sizes,
        selectedSize, // This is the ID string
        setSelectedSize,
        customizationRules,
        selections,
        updateGroupSelections,
        customizationTotal
    } = productConfig

    // --- Smart Groups Logic ---
    // Categorize groups for the wizard steps
    const { flavorsGroup, toppingsGroup, otherGroups } = useMemo(() => {
        return {
            flavorsGroup: customizationRules.find(g => ['flavors', 'ice_cream_flavors'].includes(g.groupId)),
            toppingsGroup: customizationRules.find(g => ['toppings', 'dry_toppings'].includes(g.groupId)),
            otherGroups: customizationRules.filter(g =>
                !['flavors', 'ice_cream_flavors', 'toppings', 'dry_toppings'].includes(g.groupId)
            )
        }
    }, [customizationRules])

    // --- Smart Constraints Logic ---
    // User Request: Small -> 2 Flavors, Large -> 3 Flavors
    const effectiveFlavorsGroup = useMemo(() => {
        if (!flavorsGroup || !selectedSize) return flavorsGroup;

        // Find the actual size object since selectedSize is just an ID
        // We look for the size in the sizes array that matches the selectedSize ID
        const currentSizeObj = sizes.find((s: any) => s.id === selectedSize);

        if (!currentSizeObj) return flavorsGroup;

        // Clone the group to avoid mutating the original
        const modifiedGroup = { ...flavorsGroup };

        // Logic: Check size ID or Name (assuming 'small' is in the ID or name)
        // ✅ Fixed: Accessing camelCase 'nameEn' as per ProductSize interface
        const sizeName = (currentSizeObj.nameEn || currentSizeObj.name || currentSizeObj.id || '').toLowerCase();
        const isSmall = sizeName.includes('small');

        if (isSmall) {
            modifiedGroup.maxSelections = 2;
            modifiedGroup.groupDescription = 'الحجم الصغير يسمح بنكهتين فقط';
        } else {
            // Default/Large
            modifiedGroup.maxSelections = 3;
        }

        return modifiedGroup;
    }, [flavorsGroup, selectedSize, sizes]);


    // --- Helpers ---
    const handlePresetSelect = (presetId: string) => {
        setSelectedPreset(presetId)
        // Placeholder for future logic to auto-fill selections
    }

    // Determine current section to show based on step
    const renderStepContent = () => {
        switch (currentStep) {
            case 0: // Base & Size
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="bg-emerald-50 dark:bg-emerald-900/10 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800">
                            <h3 className="font-bold text-emerald-800 dark:text-emerald-200 mb-3 flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs">1</span>
                                اختر الأساس
                            </h3>

                            {containers.length > 0 && (
                                <div className="mb-4">
                                    <label className="text-xs font-semibold text-slate-500 mb-2 block">نوع الحاوية</label>
                                    <ContainerSelector
                                        containers={containers as any[]}
                                        selectedContainer={selectedContainer}
                                        onSelect={setSelectedContainer}
                                    />
                                </div>
                            )}

                            {sizes.length > 0 && (
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 mb-2 block">الحجم</label>
                                    <SizeSelector
                                        sizes={sizes as any[]}
                                        selectedSize={selectedSize}
                                        onSelect={setSelectedSize}
                                        basePrice={product.price}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                );
            case 1: // Flavors
                return effectiveFlavorsGroup ? (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-pink-500 text-white flex items-center justify-center text-xs">2</span>
                                اختر النكهات
                            </h3>
                            <span className="text-xs bg-pink-100 text-pink-700 px-2 py-1 rounded-full">
                                {selections[effectiveFlavorsGroup.groupId]?.length || 0} / {effectiveFlavorsGroup.maxSelections}
                            </span>
                        </div>

                        {effectiveFlavorsGroup.groupDescription && (
                            <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded-lg border border-amber-200">
                                💡 {effectiveFlavorsGroup.groupDescription}
                            </div>
                        )}

                        <OptionsGrid
                            group={effectiveFlavorsGroup}
                            selections={selections[effectiveFlavorsGroup.groupId] || []}
                            onSelectionChange={(ids) => updateGroupSelections(effectiveFlavorsGroup.groupId, ids)}
                            columns={3}
                            cardSize="md"
                            accentColor="pink"
                            showImages={true}
                            showDescriptions={true}
                        />
                    </div>
                ) : (
                    <div className="text-center py-10 text-slate-500">لا توجد نكهات متاحة لهذا المنتج</div>
                );
            case 2: // Toppings & Extras
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center text-xs">3</span>
                            الإضافات والدلع
                        </h3>

                        {toppingsGroup && (
                            <div className="space-y-2">
                                <h4 className="text-sm font-semibold text-slate-600">{toppingsGroup.groupName}</h4>
                                <OptionsGrid
                                    group={toppingsGroup}
                                    selections={selections[toppingsGroup.groupId] || []}
                                    onSelectionChange={(ids) => updateGroupSelections(toppingsGroup.groupId, ids)}
                                    columns={3}
                                    cardSize="sm"
                                    accentColor="purple"
                                    showImages={true}
                                />
                            </div>
                        )}

                        {otherGroups.map(group => (
                            <div key={group.groupId} className="space-y-2">
                                <h4 className="text-sm font-semibold text-slate-600">{group.groupName}</h4>
                                <OptionsGrid
                                    group={group}
                                    selections={selections[group.groupId] || []}
                                    onSelectionChange={(ids) => updateGroupSelections(group.groupId, ids)}
                                    columns={3}
                                    cardSize="sm"
                                    accentColor="cyan"
                                    showImages={false}
                                />
                            </div>
                        ))}
                    </div>
                );
            default:
                return null;
        }
    }

    return (
        <div className="w-full min-h-[400px] flex flex-col">
            {/* 1. Top Tabs */}
            <div className="mb-4">
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                    <button
                        onClick={() => setActiveTab('custom')}
                        className={`flex-1 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'custom'
                            ? 'bg-white dark:bg-slate-700 shadow-sm text-emerald-600 dark:text-emerald-400'
                            : 'text-slate-500'
                            }`}
                    >
                        <Dumbbell size={18} />
                        صمم كوبك
                    </button>
                    <button
                        onClick={() => setActiveTab('presets')}
                        className={`flex-1 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'presets'
                            ? 'bg-white dark:bg-slate-700 shadow-sm text-emerald-600 dark:text-emerald-400'
                            : 'text-slate-500'
                            }`}
                    >
                        <ChefHat size={18} />
                        اختيارات الشيف
                    </button>
                </div>
            </div>

            {/* 2. Content Area */}
            <AnimatePresence mode="wait">
                {activeTab === 'custom' ? (
                    <motion.div
                        key="custom"
                        className="flex-1 flex flex-col"
                    >
                        {/* Custom Flow Steps */}
                        <div className="flex-1 min-h-[300px]">
                            {renderStepContent()}
                        </div>

                        {/* Navigation Buttons */}
                        <div className="mt-6 flex gap-3 pt-4 border-t border-slate-100">
                            {currentStep > 0 && (
                                <button
                                    onClick={() => setCurrentStep(prev => prev - 1)}
                                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50"
                                >
                                    سابق
                                </button>
                            )}

                            {currentStep < 2 ? (
                                <button
                                    onClick={() => setCurrentStep(prev => prev + 1)}
                                    disabled={currentStep === 0 && !selectedSize} // Prevent next if size not selected
                                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    التالي
                                    <ChevronLeft size={16} className="rtl:rotate-180" />
                                </button>
                            ) : (
                                <button
                                    onClick={onComplete}
                                    className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-3 rounded-xl font-bold shadow-lg shadow-emerald-200 transform active:scale-95 transition-all"
                                >
                                    ✨ إضافة للسلة ({customizationTotal} ج.م)
                                </button>
                            )}
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="presets"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="grid grid-cols-1 gap-4"
                    >
                        {MOCK_PRESETS.map((preset) => (
                            <div
                                key={preset.id}
                                onClick={() => handlePresetSelect(preset.id)}
                                className={`group relative overflow-hidden rounded-2xl border-2 transition-all cursor-pointer hover:shadow-lg p-4 flex items-center gap-4 ${selectedPreset === preset.id
                                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10'
                                    : 'border-transparent bg-slate-50 dark:bg-slate-800 hover:border-emerald-200'
                                    }`}
                            >
                                <div className={`w-14 h-14 rounded-xl ${preset.color} bg-opacity-10 flex items-center justify-center flex-shrink-0`}>
                                    <preset.icon size={28} className={preset.color.replace('bg-', 'text-')} />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-bold text-slate-800 dark:text-white">{preset.name}</h3>
                                        {preset.tags.map(tag => (
                                            <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{preset.description}</p>
                                    <div className="flex items-center gap-3 mt-2 text-xs font-semibold">
                                        <span className="text-emerald-600">{preset.calories} سعرة</span>
                                        <span className="w-1 h-1 rounded-full bg-slate-300" />
                                        <span className="text-slate-900 dark:text-white">{preset.price} ج.م</span>
                                    </div>
                                </div>
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${selectedPreset === preset.id
                                    ? 'border-emerald-500 bg-emerald-500 text-white'
                                    : 'border-slate-300'
                                    }`}>
                                    {selectedPreset === preset.id && <Check size={14} strokeWidth={3} />}
                                </div>
                            </div>
                        ))}
                        <p className="text-xs text-center text-slate-400 mt-4">
                            * وصفات الشيف قريباً
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Bottom Info Bar (Macro Visualizer) - Only show in Custom Mode */}
            {activeTab === 'custom' && (
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                        <span>Balance</span>
                        <span className="text-emerald-500">Good</span>
                    </div>
                    {/* Simplified Macro Bar using Product Base Macros */}
                    <div className="flex h-2 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                        {/* Using arbitrary widths for now as we don't have per-option macro data yet */}
                        <div className="w-[40%] bg-emerald-500" title="Protein" />
                        <div className="w-[30%] bg-blue-400" title="Carbs" />
                        <div className="w-[20%] bg-orange-400" title="Fats" />
                        <div className="w-[10%] bg-pink-400" title="Sugar" />
                    </div>
                    <div className="flex justify-between mt-1 text-[10px] text-slate-500">
                        <span>{product.protein || 0}g Prot</span>
                        <span>{product.carbs || 0}g Carb</span>
                        <span>{product.calories || 0} Cal</span>
                    </div>
                </div>
            )}
        </div>
    )
}
