'use client';

import { useState, useEffect } from 'react';
import { DollarSign, Filter, RefreshCw } from 'lucide-react';
import OptionPriceEditor from '@/components/admin/products/OptionPriceEditor';
import { getAllOptions, updateOptionPrice } from '@/lib/admin/options.api';

interface Option {
    id: string;
    name_ar: string;
    name_en: string;
    base_price: number;
    group_id: string;
    available: number;
}

const OPTION_GROUPS = [
    { id: 'all', label: 'جميع المجموعات', icon: '📋' },
    { id: 'flavors', label: 'النكهات', icon: '🍦' },
    { id: 'sauces', label: 'الصوصات', icon: '🍫' },
    { id: 'dry_toppings', label: 'الإضافات الجافة', icon: '🥜' },
    { id: 'wet_toppings', label: 'الإضافات الرطبة', icon: '🍓' },
    { id: 'sizes', label: 'الأحجام', icon: '📏' },
    { id: 'containers', label: 'الحاويات', icon: '🥤' },
];

export default function OptionsManagementPage() {
    const [options, setOptions] = useState<Option[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedGroup, setSelectedGroup] = useState<string>('all');
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load options
    const fetchOptions = async () => {
        try {
            setError(null);
            const groupId = selectedGroup === 'all' ? undefined : selectedGroup;
            const data = await getAllOptions(groupId);
            setOptions(data);
        } catch (err: any) {
            console.error('Error loading options:', err);
            setError(err.message || 'فشل في تحميل الخيارات');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        setLoading(true);
        fetchOptions();
    }, [selectedGroup]);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchOptions();
    };

    const handleSave = async (optionId: string, newPrice: number) => {
        await updateOptionPrice(optionId, newPrice);
        // Refresh to get updated data
        await fetchOptions();
    };

    const filteredOptions = options.filter(opt => opt.available === 1);
    const groupStats = OPTION_GROUPS.map(group => ({
        ...group,
        count: group.id === 'all'
            ? filteredOptions.length
            : filteredOptions.filter(opt => opt.group_id === group.id).length
    }));

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg">
                                <DollarSign size={24} className="text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-800">إدارة أسعار الخيارات</h1>
                                <p className="text-sm text-gray-600">تحديد السعر الإضافي لكل خيار</p>
                            </div>
                        </div>

                        <button
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
                            <span className="text-sm font-medium">تحديث</span>
                        </button>
                    </div>
                </div>

                {/* Group Filter */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Filter size={20} className="text-purple-600" />
                        <h2 className="text-lg font-bold text-gray-800">تصفية حسب المجموعة</h2>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                        {groupStats.map((group) => (
                            <button
                                key={group.id}
                                onClick={() => setSelectedGroup(group.id)}
                                className={`p-3 rounded-lg border-2 transition-all ${selectedGroup === group.id
                                        ? 'border-purple-500 bg-purple-50 shadow-md'
                                        : 'border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50/50'
                                    }`}
                            >
                                <div className="text-2xl mb-1">{group.icon}</div>
                                <div className="text-xs font-medium text-gray-700 mb-1">{group.label}</div>
                                <div className="text-lg font-bold text-purple-600">{group.count}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Options List */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="mb-4">
                        <h2 className="text-lg font-bold text-gray-800">
                            {selectedGroup === 'all' ? 'جميع الخيارات' : OPTION_GROUPS.find(g => g.id === selectedGroup)?.label}
                        </h2>
                        <p className="text-sm text-gray-600">
                            {filteredOptions.length} {filteredOptions.length === 1 ? 'خيار' : 'خيارات'}
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 text-red-700">
                            {error}
                        </div>
                    )}

                    {loading ? (
                        <div className="text-center py-12">
                            <div className="inline-block w-12 h-12 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin mb-3"></div>
                            <p className="text-gray-600">جاري التحميل...</p>
                        </div>
                    ) : (
                        <OptionPriceEditor
                            options={filteredOptions}
                            onSave={handleSave}
                            loading={refreshing}
                        />
                    )}
                </div>

                {/* Stats Footer */}
                <div className="mt-6 bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl border border-purple-200 p-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div>
                            <div className="text-2xl font-bold text-purple-600">{filteredOptions.length}</div>
                            <div className="text-xs text-gray-600">إجمالي الخيارات</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-green-600">
                                {filteredOptions.filter(opt => opt.base_price > 0).length}
                            </div>
                            <div className="text-xs text-gray-600">خيارات مدفوعة</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-600">
                                {filteredOptions.filter(opt => opt.base_price === 0).length}
                            </div>
                            <div className="text-xs text-gray-600">خيارات مجانية</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-orange-600">
                                {Math.round(filteredOptions.reduce((sum, opt) => sum + opt.base_price, 0) / filteredOptions.length || 0)}
                            </div>
                            <div className="text-xs text-gray-600">متوسط السعر (ج)</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
