import { motion } from 'framer-motion';
import { Palette, Layout, Star, Activity, Check } from 'lucide-react';
import type { OptionGroupInfo } from '@/types/admin';
import type { UIConfig } from '@/lib/uiConfig';
import OptionGroupRenderer from '@/components/shared/OptionGroupRenderer';

interface AdvancedStyleEditorProps {
    group: OptionGroupInfo;
    config: UIConfig;
    onChange: (newConfig: UIConfig) => void;
    onClose: () => void;
}

/**
 * Advanced Visual Style Editor for Option Groups
 * Allows admins to configure Section Type, Colors, and Animations.
 */
export default function AdvancedStyleEditor({
    group,
    config,
    onChange,
    onClose,
}: AdvancedStyleEditorProps) {

    // Helper to update config
    const updateConfig = (field: keyof UIConfig, value: any) => {
        onChange({
            ...config,
            [field]: value,
        });
    };

    const SECTION_TYPES = [
        { id: 'default', label: 'Default', icon: Layout, desc: 'Standard Grid/Cards' },
        { id: 'hero_selection', label: 'Hero Flavor', icon: Star, desc: 'Large Circular Images' },
        { id: 'interactive_meter', label: 'Smart Meter', icon: Activity, desc: 'Gauge/Slider' },
    ] as const;

    const DISPLAY_STYLES = [
        { id: 'cards', label: 'Cards' },
        { id: 'grid', label: 'Grid' },
        { id: 'list', label: 'List' },
        { id: 'pills', label: 'Pills' },
        { id: 'checkbox', label: 'Checkbox' },
    ] as const;

    const ACCENT_COLORS = [
        { id: 'pink', color: 'bg-pink-500' },
        { id: 'amber', color: 'bg-amber-500' },
        { id: 'purple', color: 'bg-purple-500' },
        { id: 'cyan', color: 'bg-cyan-500' },
        { id: 'emerald', color: 'bg-emerald-500' },
    ] as const;

    // Use name (localized) or fallbacks. Note: OptionGroupInfo usually has 'name', 'nameAr', 'nameEn' depending on mapper.
    // We will use 'name' if available, or try to be safe.
    const groupName = group.name || (group as any).name_ar || (group as any).nameAr || 'Option Group';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
            >
                {/* Header */}
                <div className="p-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                            <Palette className="text-indigo-600 dark:text-indigo-400" size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                Customize Helper: {groupName}
                            </h3>
                            <p className="text-xs text-gray-500">Fine-tune the extensive display options</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
                </div>

                {/* Content - Responsive Grid */}
                <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12">

                    {/* Controls Column - Takes more space now */}
                    <div className="lg:col-span-8 p-6 space-y-8 bg-gray-50/50 dark:bg-slate-900 overflow-y-auto h-full scrollbar-thin scrollbar-thumb-gray-200">

                        {/* 1. Section Type (Next-Gen) */}
                        <section>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block">
                                Mode & Layout
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {SECTION_TYPES.map(type => (
                                    <button
                                        key={type.id}
                                        onClick={() => updateConfig('section_type', type.id)}
                                        className={`flex items-start gap-3 p-3 rounded-xl border-2 text-left transition-all ${config.section_type === type.id
                                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                                            : 'border-gray-200 dark:border-slate-700 hover:border-indigo-200 bg-white dark:bg-slate-800'
                                            }`}
                                    >
                                        <div className={`p-2 rounded-lg flex-shrink-0 ${config.section_type === type.id ? 'bg-indigo-200 text-indigo-700' : 'bg-gray-100 text-gray-500'}`}>
                                            <type.icon size={18} />
                                        </div>
                                        <div>
                                            <h4 className={`font-bold text-sm ${config.section_type === type.id ? 'text-indigo-900 dark:text-indigo-300' : 'text-gray-700 dark:text-gray-300'}`}>
                                                {type.label}
                                            </h4>
                                            <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">{type.desc}</p>
                                        </div>
                                        {config.section_type === type.id && <Check className="ml-auto text-indigo-500" size={16} />}
                                    </button>
                                ))}
                            </div>
                        </section>

                        {/* 2. Visual Style (Accent) */}
                        <section>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block">
                                Brand Accent
                            </label>
                            <div className="flex flex-wrap gap-3">
                                {ACCENT_COLORS.map(color => (
                                    <button
                                        key={color.id}
                                        onClick={() => updateConfig('accent_color', color.id)}
                                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${color.color} ${config.accent_color === color.id
                                            ? 'ring-2 ring-offset-2 ring-indigo-300 scale-110'
                                            : 'hover:scale-105 opacity-70 hover:opacity-100'
                                            }`}
                                    >
                                        {config.accent_color === color.id && <Check className="text-white" size={14} />}
                                    </button>
                                ))}
                            </div>
                        </section>

                        {/* 3. Fallback Display Style (Only if Default) */}
                        {(!config.section_type || config.section_type === 'default') && (
                            <section>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block">
                                    Fallback Display Style
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {DISPLAY_STYLES.map(style => (
                                        <button
                                            key={style.id}
                                            onClick={() => updateConfig('display_style', style.id)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${config.display_style === style.id
                                                ? 'bg-gray-900 text-white border-gray-900'
                                                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            {style.label}
                                        </button>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* 4. Toggles */}
                        <section className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block">
                                Visibility
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {[
                                    { key: 'show_images', label: 'Show Images' },
                                    { key: 'show_prices', label: 'Show Prices' },
                                    { key: 'show_macros', label: 'Macros' }
                                ].map(toggle => (
                                    <label key={toggle.key} className="flex items-center gap-3 p-2.5 bg-white dark:bg-slate-800 rounded-lg border border-gray-100 dark:border-slate-700 cursor-pointer hover:bg-gray-50">
                                        <input
                                            type="checkbox"
                                            checked={!!config[toggle.key as keyof UIConfig]}
                                            onChange={(e) => updateConfig(toggle.key as keyof UIConfig, e.target.checked)}
                                            className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <span className="text-sm font-medium text-gray-700 dark:text-white">{toggle.label}</span>
                                    </label>
                                ))}
                            </div>
                        </section>

                    </div>

                    {/* Preview Column - Smaller now (1/3 width on desktop) */}
                    <div className="lg:col-span-4 bg-slate-100 dark:bg-black/50 p-4 lg:p-6 border-t lg:border-t-0 lg:border-l border-gray-200 dark:border-slate-700 flex flex-col overflow-hidden">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center justify-between">
                            <span>Live Preview</span>
                            <span className="bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded text-[9px]">Mobile View</span>
                        </div>

                        <div className="flex-1 overflow-y-auto flex items-center justify-center min-h-[300px] bg-slate-200/50 rounded-2xl p-4">
                            <div className="w-full max-w-[320px] mx-auto bg-white dark:bg-slate-900 rounded-3xl shadow-xl overflow-hidden border-4 border-slate-300 dark:border-slate-600 ring-1 ring-slate-900/5">
                                {/* Fake Mobile Header */}
                                <div className="h-6 bg-slate-100 dark:bg-slate-800 flex items-center justify-center gap-1 border-b border-gray-100">
                                    <div className="w-12 h-1 bg-slate-300 rounded-full"></div>
                                </div>

                                <div className="p-4 max-h-[400px] overflow-y-auto">
                                    <div className="w-16 h-2 bg-slate-100 dark:bg-slate-800 rounded-full mb-4"></div>
                                    {/* 🚀 Render Live Component here */}
                                    <OptionGroupRenderer
                                        group={{
                                            ...group,
                                            ui_config: config
                                        }}
                                        selections={[]} // Static preview
                                        onSelectionChange={() => { }}
                                    />
                                    <div className="mt-4 space-y-2 opacity-50">
                                        <div className="w-full h-8 bg-slate-50 rounded-lg"></div>
                                        <div className="w-2/3 h-8 bg-slate-50 rounded-lg"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 dark:border-slate-800 flex justify-end gap-3 bg-white dark:bg-slate-900">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            onClose(); // Save logic handled by parent via real-time onChange or explicit save if we change props
                        }}
                        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Done
                    </button>
                </div>

            </motion.div>
        </div>
    );
}
