'use client';

import { useState } from 'react';
import { DollarSign, Save, X, AlertCircle } from 'lucide-react';

interface Option {
    id: string;
    name_ar: string;
    name_en: string;
    base_price: number;
    group_id: string;
}

interface OptionPriceEditorProps {
    options: Option[];
    onSave: (optionId: string, newPrice: number) => Promise<void>;
    loading?: boolean;
}

/**
 * Option Price Editor Component
 * Allows admin to edit base_price for each option
 */
export default function OptionPriceEditor({ options, onSave, loading = false }: OptionPriceEditorProps) {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState<string>('');
    const [saving, setSaving] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleEdit = (option: Option) => {
        setEditingId(option.id);
        setEditValue(option.base_price.toString());
        setError(null);
    };

    const handleCancel = () => {
        setEditingId(null);
        setEditValue('');
        setError(null);
    };

    const handleSave = async (optionId: string) => {
        const price = parseFloat(editValue);

        if (isNaN(price) || price < 0) {
            setError('السعر يجب أن يكون رقماً موجباً');
            return;
        }

        setSaving(optionId);
        setError(null);

        try {
            await onSave(optionId, price);
            setEditingId(null);
            setEditValue('');
        } catch (err: any) {
            setError(err.message || 'فشل في حفظ السعر');
        } finally {
            setSaving(null);
        }
    };

    if (options.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                <AlertCircle className="mx-auto mb-2" size={32} />
                <p>لا توجد خيارات متاحة</p>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2 text-red-700 text-sm">
                    <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            <div className="grid gap-2">
                {options.map((option) => (
                    <div
                        key={option.id}
                        className="bg-white border border-gray-200 rounded-lg p-3 hover:border-purple-300 transition-colors"
                    >
                        <div className="flex items-center justify-between gap-3">
                            {/* Option Info */}
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-800 truncate">{option.name_ar}</p>
                                <p className="text-xs text-gray-500 truncate">{option.name_en}</p>
                            </div>

                            {/* Price Editor */}
                            {editingId === option.id ? (
                                <div className="flex items-center gap-2">
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={editValue}
                                            onChange={(e) => setEditValue(e.target.value)}
                                            className="w-24 pl-2 pr-6 py-1.5 border border-purple-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            placeholder="0.00"
                                            step="0.5"
                                            min="0"
                                            autoFocus
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleSave(option.id);
                                                if (e.key === 'Escape') handleCancel();
                                            }}
                                        />
                                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-gray-500">ج</span>
                                    </div>

                                    <button
                                        onClick={() => handleSave(option.id)}
                                        disabled={saving === option.id}
                                        className="p-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        title="حفظ"
                                    >
                                        <Save size={14} />
                                    </button>

                                    <button
                                        onClick={handleCancel}
                                        disabled={saving === option.id}
                                        className="p-1.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        title="إلغاء"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <div className="text-right">
                                        <div className="flex items-center gap-1 text-lg font-bold text-gray-800">
                                            <DollarSign size={16} className="text-green-600" />
                                            {option.base_price > 0 ? (
                                                <span className="text-green-600">+{option.base_price}</span>
                                            ) : (
                                                <span className="text-gray-400">0.00</span>
                                            )}
                                            <span className="text-xs text-gray-500">ج</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleEdit(option)}
                                        disabled={loading}
                                        className="px-3 py-1.5 bg-gradient-to-r from-purple-500 to-violet-600 text-white text-xs font-medium rounded-lg hover:from-purple-600 hover:to-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                                    >
                                        تعديل السعر
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
                <p className="text-xs text-blue-700">
                    <strong>💡 ملاحظة:</strong> السعر الإضافي سيُضاف إلى سعر المنتج الأساسي عند اختيار هذا الخيار.
                    اتركه صفراً إذا كان الخيار مجانياً.
                </p>
            </div>
        </div>
    );
}
