/**
 * OptionsTable - Comprehensive Options Management Table
 * 
 * Displays all options with inline editing for:
 * - Names (Arabic & English)
 * - Group
 * - Price
 * - Nutrition values (Calories, Protein, Carbs, Fat, Sugar, Fiber)
 * 
 * Requirements:
 * - View all options at once in table format
 * - Inline editing for quick updates
 * - Auto-save on change
 * - Visual feedback for saving state
 */

'use client';

import React, { useState } from 'react';
import { Loader2, Check, X, Search } from 'lucide-react';
import { updateOption } from '@/lib/admin/options.api';
import type { OptionGroup, Option } from './types';

interface OptionsTableProps {
    /** All option groups with their options */
    optionGroups: OptionGroup[];
    /** Callback when data is refreshed */
    onRefresh: () => void;
}

interface EditingCell {
    optionId: string;
    field: string;
}

type SavingStatus = 'saving' | 'success' | 'error';

interface SavingState {
    [optionId: string]: {
        [field: string]: SavingStatus;
    };
}

interface FlattenedOption extends Option {
    groupName: string;
    groupId: string;
}

const OptionsTable: React.FC<OptionsTableProps> = ({ optionGroups, onRefresh }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedGroup, setSelectedGroup] = useState<string>('all');
    const [editingCell, setEditingCell] = useState<EditingCell | null>(null);
    const [savingState, setSavingState] = useState<SavingState>({});

    // Flatten all options from all groups (with null check for options)
    const allOptions: FlattenedOption[] = optionGroups.flatMap(group =>
        (group.options || []).map(option => ({
            ...option,
            groupName: group.name_ar,
            groupId: group.id,
        }))
    );

    // Filter options based on search and group
    const filteredOptions = allOptions.filter(option => {
        const matchesSearch =
            !searchQuery ||
            option.name_ar.toLowerCase().includes(searchQuery.toLowerCase()) ||
            option.name_en.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesGroup = selectedGroup === 'all' || option.groupId === selectedGroup;

        return matchesSearch && matchesGroup;
    });

    /**
     * Handle inline cell edit with auto-save
     */
    const handleCellEdit = async (
        optionId: string,
        field: string,
        value: string | number
    ) => {
        // Set saving state
        setSavingState(prev => ({
            ...prev,
            [optionId]: {
                ...(prev[optionId] || {}),
                [field]: 'saving' as SavingStatus,
            },
        }));

        try {
            // Prepare update data
            const updateData: Record<string, string | number> = {};
            updateData[field] = value;

            // Call API
            await updateOption(optionId, updateData);

            // Set success state
            setSavingState(prev => ({
                ...prev,
                [optionId]: {
                    ...(prev[optionId] || {}),
                    [field]: 'success' as SavingStatus,
                },
            }));

            // Clear success indicator after 2 seconds
            setTimeout(() => {
                setSavingState(prev => {
                    const newState = { ...prev };
                    if (newState[optionId]) {
                        const { [field]: _, ...rest } = newState[optionId];
                        newState[optionId] = rest;
                    }
                    return newState;
                });
            }, 2000);

            // Refresh data
            onRefresh();
        } catch (error) {
            console.error('Failed to update option:', error);

            // Set error state
            setSavingState(prev => ({
                ...prev,
                [optionId]: {
                    ...(prev[optionId] || {}),
                    [field]: 'error' as SavingStatus,
                },
            }));

            // Clear error indicator after 3 seconds
            setTimeout(() => {
                setSavingState(prev => {
                    const newState = { ...prev };
                    if (newState[optionId]) {
                        const { [field]: _, ...rest } = newState[optionId];
                        newState[optionId] = rest;
                    }
                    return newState;
                });
            }, 3000);
        }
    };

    /**
     * Render editable cell with save indicator
     */
    const renderEditableCell = (
        option: FlattenedOption,
        field: string,
        value: string | number,
        type: 'text' | 'number' = 'text'
    ) => {
        const isEditing = editingCell?.optionId === option.id && editingCell?.field === field;
        const state = savingState[option.id]?.[field];

        return (
            <div className="relative group">
                <input
                    type={type}
                    value={value}
                    onChange={(e) => {
                        const newValue = type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value;
                        handleCellEdit(option.id, field, newValue);
                    }}
                    onFocus={() => setEditingCell({ optionId: option.id, field })}
                    onBlur={() => setEditingCell(null)}
                    className={`w-full px-2 py-1 border rounded transition-all ${isEditing
                            ? 'border-blue-400 bg-blue-50 ring-2 ring-blue-200'
                            : 'border-transparent hover:border-gray-300 hover:bg-gray-50'
                        } ${type === 'number' ? 'text-right' : ''}`}
                    step={type === 'number' ? '0.1' : undefined}
                />

                {/* Save indicator */}
                {state && (
                    <div className="absolute left-full ml-1 top-1/2 -translate-y-1/2">
                        {state === 'saving' && (
                            <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                        )}
                        {state === 'success' && (
                            <Check className="w-4 h-4 text-green-500" />
                        )}
                        {state === 'error' && (
                            <X className="w-4 h-4 text-red-500" />
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-4">
            {/* Header with filters */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">📊 جدول الخيارات الشامل</h2>
                    <p className="text-sm text-gray-600 mt-1">
                        تعديل سريع للأسعار والقيم الغذائية - التغييرات تُحفظ تلقائياً
                    </p>
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                    {/* Search */}
                    <div className="relative flex-1 sm:flex-initial">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="بحث..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 w-full sm:w-64"
                        />
                    </div>

                    {/* Group filter */}
                    <select
                        value={selectedGroup}
                        onChange={(e) => setSelectedGroup(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    >
                        <option value="all">كل المجموعات</option>
                        {optionGroups
                            .filter(group => group.id != null)
                            .map(group => (
                                <option key={group.id} value={group.id}>
                                    {group.name_ar}
                                </option>
                            ))}
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gradient-to-r from-pink-50 to-purple-50 border-b border-gray-200">
                            <tr>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider sticky left-0 bg-gradient-to-r from-pink-50 to-purple-50">
                                    الاسم (عربي)
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    الاسم (En)
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    المجموعة
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider bg-blue-50">
                                    السعر (ج.م)
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider bg-green-50">
                                    السعرات
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider bg-green-50">
                                    بروتين (g)
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider bg-green-50">
                                    كربوهيدرات (g)
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider bg-green-50">
                                    دهون (g)
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider bg-green-50">
                                    سكر (g)
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider bg-green-50">
                                    ألياف (g)
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredOptions.length === 0 ? (
                                <tr>
                                    <td colSpan={10} className="px-4 py-8 text-center text-gray-500">
                                        لا توجد خيارات متاحة
                                    </td>
                                </tr>
                            ) : (
                                filteredOptions
                                    .filter(option => option.id != null)
                                    .map((option, index) => (
                                    <tr
                                        key={option.id || `option-${index}`}
                                        className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                                            }`}
                                    >
                                        <td className="px-4 py-2 text-sm font-medium text-gray-800 sticky left-0 bg-inherit">
                                            {renderEditableCell(option, 'name_ar', option.name_ar, 'text')}
                                        </td>
                                        <td className="px-4 py-2 text-sm text-gray-600">
                                            {renderEditableCell(option, 'name_en', option.name_en, 'text')}
                                        </td>
                                        <td className="px-4 py-2 text-sm text-gray-500">
                                            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                                                {option.groupName}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2 text-sm text-gray-800 bg-blue-50/30">
                                            {renderEditableCell(option, 'base_price', option.base_price, 'number')}
                                        </td>
                                        <td className="px-4 py-2 text-sm text-gray-600 bg-green-50/30">
                                            {renderEditableCell(option, 'calories', option.calories, 'number')}
                                        </td>
                                        <td className="px-4 py-2 text-sm text-gray-600 bg-green-50/30">
                                            {renderEditableCell(option, 'protein', option.protein, 'number')}
                                        </td>
                                        <td className="px-4 py-2 text-sm text-gray-600 bg-green-50/30">
                                            {renderEditableCell(option, 'carbs', option.carbs, 'number')}
                                        </td>
                                        <td className="px-4 py-2 text-sm text-gray-600 bg-green-50/30">
                                            {renderEditableCell(option, 'fat', option.fat, 'number')}
                                        </td>
                                        <td className="px-4 py-2 text-sm text-gray-600 bg-green-50/30">
                                            {renderEditableCell(option, 'sugar', option.sugar, 'number')}
                                        </td>
                                        <td className="px-4 py-2 text-sm text-gray-600 bg-green-50/30">
                                            {renderEditableCell(option, 'fiber', option.fiber, 'number')}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Footer stats */}
            <div className="flex items-center justify-between text-sm text-gray-600 px-4">
                <span>
                    عرض <strong>{filteredOptions.length}</strong> من أصل <strong>{allOptions.length}</strong> خيار
                </span>
                <span className="flex items-center gap-2 text-xs">
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full bg-blue-100 border border-blue-300"></div>
                        <span>السعر</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full bg-green-100 border border-green-300"></div>
                        <span>القيم الغذائية</span>
                    </div>
                </span>
            </div>
        </div>
    );
};

export default OptionsTable;
