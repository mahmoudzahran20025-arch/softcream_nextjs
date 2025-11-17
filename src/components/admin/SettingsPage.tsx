// ================================================================
// src/components/admin/SettingsPage.tsx
// ================================================================
'use client';

import React, { useState, useEffect } from 'react';
import { Bell, Shield, Database } from 'lucide-react';
import { adminRealtime } from '@/lib/adminRealtime';

const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState({
    orderNotifications: true,
    soundNotifications: true,
    autoRefresh: true,
    refreshInterval: 10,
  });

  // Load settings from realtime manager on mount
  useEffect(() => {
    // Load settings from AdminRealtimeManager
    const currentSettings = adminRealtime().getSettings();
    setSettings({
      orderNotifications: currentSettings.orderNotifications,
      soundNotifications: currentSettings.soundNotifications,
      autoRefresh: currentSettings.autoRefresh,
      refreshInterval: currentSettings.refreshInterval,
    });

    // Request notification permission on mount
    adminRealtime().requestNotificationPermission();
  }, []);

  const toggleSetting = (key: keyof typeof settings) => {
    const newSettings = {
      ...settings,
      [key]: !settings[key]
    };
    
    setSettings(newSettings);
    
    // Update AdminRealtimeManager settings
    adminRealtime().updateSettings({
      orderNotifications: newSettings.orderNotifications,
      soundNotifications: newSettings.soundNotifications,
      autoRefresh: newSettings.autoRefresh,
      refreshInterval: newSettings.refreshInterval,
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">الإعدادات</h2>
      
      {/* Notifications Settings */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Bell size={20} />
          إعدادات الإشعارات
        </h3>
        <div className="space-y-4">
          <SettingToggle
            label="إشعارات الطلبات"
            description="تلقي إشعار عند كل طلب جديد"
            checked={settings.orderNotifications}
            onChange={() => toggleSetting('orderNotifications')}
          />

          <SettingToggle
            label="إشعارات صوتية"
            description="تشغيل صوت عند الطلبات الجديدة"
            checked={settings.soundNotifications}
            onChange={() => toggleSetting('soundNotifications')}
          />

          <SettingToggle
            label="التحديث التلقائي"
            description="تحديث الطلبات كل 10 ثواني"
            checked={settings.autoRefresh}
            onChange={() => toggleSetting('autoRefresh')}
          />
        </div>
      </div>

      {/* System Info */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Database size={20} />
          معلومات النظام
        </h3>
        <div className="space-y-3">
          <SystemInfo label="الإصدار" value="v2.1.0" />
          <SystemInfo label="آخر تحديث" value="16 نوفمبر 2025" />
          <SystemInfo label="حجم قاعدة البيانات" value="2.4 MB" />
          <SystemInfo label="عدد الطلبات" value="156 طلب" />
        </div>
      </div>

      {/* Security */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Shield size={20} />
          الأمان
        </h3>
        <div className="space-y-3">
          <button className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-right transition-colors">
            <span className="font-semibold text-gray-800">تغيير كلمة المرور</span>
          </button>
          <button className="w-full px-4 py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-right transition-colors">
            <span className="font-semibold">تسجيل الخروج من جميع الأجهزة</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper Components
const SettingToggle: React.FC<{
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}> = ({ label, description, checked, onChange }) => (
  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
    <div>
      <p className="font-semibold text-gray-800">{label}</p>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
    <label className="relative inline-flex items-center cursor-pointer">
      <input 
        type="checkbox" 
        className="sr-only peer" 
        checked={checked}
        onChange={onChange}
      />
      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
    </label>
  </div>
);

const SystemInfo: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex justify-between text-sm">
    <span className="text-gray-600">{label}:</span>
    <span className="font-semibold text-gray-800">{value}</span>
  </div>
);

export default SettingsPage;
