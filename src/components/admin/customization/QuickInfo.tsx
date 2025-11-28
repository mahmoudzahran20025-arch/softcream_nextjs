// src/components/admin/customization/QuickInfo.tsx
'use client';

import React from 'react';
import { Box, Ruler, Sparkles } from 'lucide-react';

const QuickInfo: React.FC = () => {
  return (
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
            <li>• صغير (×0.7)، وسط (×1.0)، كبير (×1.3)</li>
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
  );
};

export default QuickInfo;
