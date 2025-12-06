/**
 * OptionCard Component - Admin Option Card for Grid Display
 * Task 3.2: بطاقة خيار متجاوبة مع وضع التوسيع للتعديل
 * 
 * Features:
 * - Compact card view with name, price, availability
 * - Expandable edit mode with all fields
 * - Optimistic UI updates
 * - Responsive design
 */

'use client';

import React, { useState, useEffect } from 'react';
import { 
  Edit2, Trash2, Loader2, AlertCircle, Check, X, 
  ChevronDown, ChevronUp, Flame, Beef, Wheat 
} from 'lucide-react';
import { updateOption } from '@/lib/admin/options.api';
import type { Option } from './types';

interface OptionCardProps {
  option: Option;
  groupName?: string;
  onEdit: () => void;
  onDelete: () => void;
  onToggleAvailability: (available: boolean) => Promise<void>;
  onRefresh?: () => void;
}

type SavingStatus = 'idle' | 'saving' | 'success' | 'error';

const OptionCard: React.FC<OptionCardProps> = ({
  option,
  groupName,
  onEdit,
  onDelete,
  onToggleAvailability,
  onRefresh,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [toggleError, setToggleError] = useState<string | null>(null);
  const [savingStatus, setSavingStatus] = useState<SavingStatus>('idle');
  
  // Local edit state
  const [editValues, setEditValues] = useState({
    base_price: option.base_price,
    calories: option.calories,
    protein: option.protein,
    carbs: option.carbs,
    fat: option.fat,
    sugar: option.sugar,
    fiber: option.fiber,
  });

  const isAvailable = option.available === 1;

  // Reset edit values when option changes
  useEffect(() => {
    setEditValues({
      base_price: option.base_price,
      calories: option.calories,
      protein: option.protein,
      carbs: option.carbs,
      fat: option.fat,
      sugar: option.sugar,
      fiber: option.fiber,
    });
  }, [option]);

  // Auto-dismiss error
  useEffect(() => {
    if (toggleError) {
      const timer = setTimeout(() => setToggleError(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toggleError]);

  const handleToggle = async () => {
    setIsToggling(true);
    setToggleError(null);
    try {
      await onToggleAvailability(!isAvailable);
    } catch {
      setToggleError('فشل تحديث حالة التوفر');
    } finally {
      setIsToggling(false);
    }
  };

  const handleFieldChange = (field: keyof typeof editValues, value: number) => {
    setEditValues(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveField = async (field: keyof typeof editValues) => {
    if (editValues[field] === option[field]) return;
    
    setSavingStatus('saving');
    try {
      await updateOption(option.id, { [field]: editValues[field] });
      setSavingStatus('success');
      setTimeout(() => setSavingStatus('idle'), 1500);
      onRefresh?.();
    } catch {
      setSavingStatus('error');
      setTimeout(() => setSavingStatus('idle'), 2000);
      // Revert to original value
      setEditValues(prev => ({ ...prev, [field]: option[field] }));
    }
  };

  return (
    <div
      className={`bg-white rounded-xl border transition-all duration-200 overflow-hidden ${
        !isAvailable 
          ? 'border-gray-200 opacity-60' 
          : 'border-gray-200 hover:border-pink-300 hover:shadow-md'
      }`}
    >
      {/* Error Toast */}
      {toggleError && (
        <div className="bg-red-500 text-white text-xs px-3 py-1.5 flex items-center gap-1.5">
          <AlertCircle size={14} />
          <span>{toggleError}</span>
        </div>
      )}

      {/* Card Header - Always Visible */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          {/* Option Info */}
          <div className="flex-1 min-w-0">
            {/* Image + Name */}
            <div className="flex items-center gap-3 mb-2">
              {option.image ? (
                <img
                  src={option.image}
                  alt={option.name_ar}
                  className="w-12 h-12 rounded-lg object-cover flex-shrink-0 border border-gray-200"
                />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">🍦</span>
                </div>
              )}
              <div className="min-w-0">
                <h3 className="font-semibold text-gray-800 truncate">{option.name_ar}</h3>
                <p className="text-sm text-gray-500 truncate">{option.name_en}</p>
              </div>
            </div>

            {/* Price + Group */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium">
                {option.base_price > 0 ? `${option.base_price} ج.م` : 'مجاني'}
              </span>
              {groupName && (
                <span className="px-2 py-1 bg-purple-50 text-purple-600 rounded-lg text-xs">
                  {groupName}
                </span>
              )}
              {option.calories > 0 && (
                <span className="px-2 py-1 bg-orange-50 text-orange-600 rounded-lg text-xs flex items-center gap-1">
                  <Flame size={12} />
                  {option.calories}
                </span>
              )}
            </div>
          </div>

          {/* Availability Toggle */}
          <button
            onClick={handleToggle}
            disabled={isToggling}
            className={`relative w-12 h-7 rounded-full transition-colors flex-shrink-0 ${
              isAvailable ? 'bg-green-500' : 'bg-gray-300'
            } ${isToggling ? 'opacity-50' : ''}`}
            title={isAvailable ? 'متوفر' : 'غير متوفر'}
          >
            {isToggling ? (
              <Loader2 className="w-4 h-4 text-white absolute top-1.5 left-1/2 -translate-x-1/2 animate-spin" />
            ) : (
              <span
                className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  isAvailable ? 'right-1' : 'right-6'
                }`}
              />
            )}
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-pink-600 transition-colors"
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            <span>{isExpanded ? 'إخفاء التفاصيل' : 'تعديل سريع'}</span>
          </button>
          
          <div className="flex items-center gap-1">
            <button
              onClick={onEdit}
              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="تعديل كامل"
            >
              <Edit2 size={16} />
            </button>
            <button
              onClick={onDelete}
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="حذف"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Edit Section */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-3 bg-gray-50/50">
          {/* Saving Status */}
          {savingStatus !== 'idle' && (
            <div className={`flex items-center gap-2 text-xs px-2 py-1 rounded ${
              savingStatus === 'saving' ? 'bg-blue-50 text-blue-600' :
              savingStatus === 'success' ? 'bg-green-50 text-green-600' :
              'bg-red-50 text-red-600'
            }`}>
              {savingStatus === 'saving' && <Loader2 size={12} className="animate-spin" />}
              {savingStatus === 'success' && <Check size={12} />}
              {savingStatus === 'error' && <X size={12} />}
              <span>
                {savingStatus === 'saving' ? 'جاري الحفظ...' :
                 savingStatus === 'success' ? 'تم الحفظ' : 'فشل الحفظ'}
              </span>
            </div>
          )}

          {/* Price Field */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">السعر (ج.م)</label>
            <input
              type="number"
              value={editValues.base_price}
              onChange={(e) => handleFieldChange('base_price', parseFloat(e.target.value) || 0)}
              onBlur={() => handleSaveField('base_price')}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              step="0.5"
              min="0"
            />
          </div>

          {/* Nutrition Grid */}
          <div>
            <label className="block text-xs text-gray-500 mb-2 flex items-center gap-1">
              <Flame size={12} />
              القيم الغذائية
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { key: 'calories', label: 'سعرات', icon: Flame },
                { key: 'protein', label: 'بروتين', icon: Beef },
                { key: 'carbs', label: 'كربو', icon: Wheat },
                { key: 'fat', label: 'دهون' },
                { key: 'sugar', label: 'سكر' },
                { key: 'fiber', label: 'ألياف' },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className="block text-[10px] text-gray-400 mb-0.5">{label}</label>
                  <input
                    type="number"
                    value={editValues[key as keyof typeof editValues]}
                    onChange={(e) => handleFieldChange(key as keyof typeof editValues, parseFloat(e.target.value) || 0)}
                    onBlur={() => handleSaveField(key as keyof typeof editValues)}
                    className="w-full px-2 py-1.5 border border-gray-200 rounded text-xs focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
                    step="0.1"
                    min="0"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OptionCard;
