// src/components/admin/customization/QuickInfo.tsx
'use client';

import React, { useState } from 'react';
import { Box, Ruler, Sparkles, ChevronDown, ChevronUp, Package, Link2 } from 'lucide-react';

const QuickInfo: React.FC = () => {
  const [showSteps, setShowSteps] = useState(false);

  return (
    <div className="space-y-4">
      {/* خطوات إضافة منتج */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl overflow-hidden">
        <button
          onClick={() => setShowSteps(!showSteps)}
          className="w-full p-3 sm:p-4 flex items-center justify-between hover:bg-purple-100/50 transition-colors"
        >
          <h3 className="font-semibold text-purple-800 text-sm sm:text-base flex items-center gap-2">
            🚀 خطوات إضافة منتج قابل للتخصيص
          </h3>
          {showSteps ? <ChevronUp size={20} className="text-purple-600" /> : <ChevronDown size={20} className="text-purple-600" />}
        </button>
        
        {showSteps && (
          <div className="px-3 sm:px-4 pb-4 space-y-3">
            {/* الخطوات */}
            <div className="grid sm:grid-cols-3 gap-3">
              <div className="bg-white rounded-lg p-3 border-2 border-purple-200 relative">
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                <div className="flex items-center gap-2 mb-2">
                  <Package size={18} className="text-purple-600" />
                  <strong className="text-purple-700 text-sm">أضف المنتج</strong>
                </div>
                <p className="text-xs text-gray-600">من صفحة المنتجات، أضف منتج جديد بالبيانات الأساسية (اسم، سعر، صورة)</p>
              </div>
              
              <div className="bg-white rounded-lg p-3 border-2 border-pink-200 relative">
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-pink-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={18} className="text-pink-600" />
                  <strong className="text-pink-700 text-sm">اختر النوع</strong>
                </div>
                <p className="text-xs text-gray-600">اضغط ⚙️ واختر نوع المنتج: BYO، Preset، Milkshake، Dessert، أو Standard</p>
              </div>
              
              <div className="bg-white rounded-lg p-3 border-2 border-indigo-200 relative">
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-indigo-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
                <div className="flex items-center gap-2 mb-2">
                  <Link2 size={18} className="text-indigo-600" />
                  <strong className="text-indigo-700 text-sm">اربط الخيارات</strong>
                </div>
                <p className="text-xs text-gray-600">اختر الحاويات، المقاسات، ومجموعات التخصيص المناسبة للمنتج</p>
              </div>
            </div>
            
            {/* أنواع المنتجات */}
            <div className="bg-white/50 rounded-lg p-3 border border-purple-100">
              <p className="text-xs font-semibold text-purple-700 mb-2">📋 أنواع المنتجات:</p>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                <div className="bg-purple-100 rounded px-2 py-1 text-center">
                  <span className="font-bold">✨ BYO</span>
                  <p className="text-purple-600">حاويات + مقاسات + نكهات</p>
                </div>
                <div className="bg-pink-100 rounded px-2 py-1 text-center">
                  <span className="font-bold">🍨 Preset</span>
                  <p className="text-pink-600">صوصات + إضافات</p>
                </div>
                <div className="bg-blue-100 rounded px-2 py-1 text-center">
                  <span className="font-bold">🥤 Milkshake</span>
                  <p className="text-blue-600">مقاسات + إضافات</p>
                </div>
                <div className="bg-amber-100 rounded px-2 py-1 text-center">
                  <span className="font-bold">🍰 Dessert</span>
                  <p className="text-amber-600">آيس كريم + صوصات</p>
                </div>
                <div className="bg-gray-100 rounded px-2 py-1 text-center">
                  <span className="font-bold">🍽️ Standard</span>
                  <p className="text-gray-600">بدون تخصيص</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* كيف يعمل النظام */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-3 sm:p-4">
        <h3 className="font-semibold text-blue-800 mb-3 text-sm sm:text-base flex items-center gap-2">
          💡 كيف يعمل النظام؟
        </h3>
        <div className="grid sm:grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm">
          {/* الحاويات */}
          <div className="bg-white rounded-lg p-3 border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <Box size={16} className="text-green-600" />
              <strong className="text-green-700">الحاويات (Containers)</strong>
            </div>
            <ul className="text-gray-600 space-y-1 text-xs">
              <li>• كوب، كون، وافل، بسكويت</li>
              <li>• لها سعر إضافي على المنتج</li>
              <li>• لها قيم غذائية خاصة بها</li>
              <li>• يمكن تفعيل/تعطيل كل حاوية</li>
            </ul>
          </div>
          
          {/* المقاسات */}
          <div className="bg-white rounded-lg p-3 border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Ruler size={16} className="text-blue-600" />
              <strong className="text-blue-700">المقاسات (Sizes)</strong>
            </div>
            <ul className="text-gray-600 space-y-1 text-xs">
              <li>• صغير، وسط، كبير</li>
              <li>• تؤثر على السعر النهائي</li>
              <li>• تضرب القيم الغذائية بالمعامل</li>
              <li>• معامل التغذية يحدد الكمية</li>
            </ul>
          </div>
          
          {/* الخيارات */}
          <div className="bg-white rounded-lg p-3 border border-amber-200">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={16} className="text-amber-600" />
              <strong className="text-amber-700">الخيارات (Options)</strong>
            </div>
            <ul className="text-gray-600 space-y-1 text-xs">
              <li>• نكهات، صوصات، توبينج، إضافات</li>
              <li>• مجمعة في مجموعات (Groups)</li>
              <li>• لكل خيار سعر وقيم غذائية</li>
              <li>• العميل يختار حسب قواعد المنتج</li>
            </ul>
          </div>
        </div>
        
        {/* نصائح سريعة */}
        <div className="mt-3 pt-3 border-t border-blue-200">
          <p className="text-xs text-blue-600 font-medium mb-1">📌 نصائح سريعة:</p>
          <div className="text-xs text-gray-600 grid sm:grid-cols-2 gap-1">
            <span>• اضغط على أي فرع في الشجرة لعرض/إخفاء العناصر</span>
            <span>• اضغط على أيقونة القلم ✏️ لتعديل أي عنصر</span>
            <span>• المعرف (ID) لا يمكن تغييره بعد الإنشاء</span>
            <span>• العناصر المعطلة تظهر باللون الرمادي</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickInfo;
