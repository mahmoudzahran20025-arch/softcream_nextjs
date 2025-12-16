/**
 * UIConfigModal - Dedicated Modal for UI Configuration
 * 
 * Wraps UIConfigEditor in a modal dialog for editing option group UI settings.
 * Used in both Product > OptionGroups and Global > OptionGroups.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, RotateCcw } from 'lucide-react';
import type { OptionGroup } from './types';
import UIConfigEditor from './UIConfigEditor';
import { parseUIConfig, cleanLegacyFields, DEFAULT_UI_CONFIG } from '@/lib/uiConfig';
import type { UIConfig } from '@/lib/uiConfig';

interface UIConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: OptionGroup | null;
  onSave: (groupId: string, uiConfig: UIConfig) => Promise<void>;
}

/**
 * UIConfigModal - Modal wrapper for UIConfigEditor
 */
const UIConfigModal: React.FC<UIConfigModalProps> = ({
  isOpen,
  onClose,
  group,
  onSave,
}) => {
  const [config, setConfig] = useState<UIConfig>(parseUIConfig());
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize config when group changes
  useEffect(() => {
    if (group) {
      const uiConfig = typeof group.ui_config === 'string'
        ? parseUIConfig(group.ui_config)
        : group.ui_config || parseUIConfig();
      setConfig(uiConfig);
      setHasChanges(false);
    }
  }, [group]);

  if (!isOpen || !group) return null;

  const handleConfigChange = (newConfig: UIConfig) => {
    setConfig(newConfig);
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Clean legacy fields before saving
      const cleanedConfig = cleanLegacyFields(config);
      await onSave(group.id, cleanedConfig);
      setHasChanges(false);
      onClose();
    } catch (error) {
      console.error('Failed to save UI config:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setConfig({ ...DEFAULT_UI_CONFIG });
    setHasChanges(true);
  };

  const handleClose = () => {
    if (hasChanges) {
      const confirmClose = window.confirm('لديك تغييرات غير محفوظة. هل تريد الإغلاق؟');
      if (!confirmClose) return;
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-pink-50 to-purple-50">
          <div>
            <h2 className="text-lg font-bold text-gray-800">
              إعدادات العرض
            </h2>
            <p className="text-sm text-gray-500">
              {group.name_ar || group.name_en}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(90vh-140px)]">
          <UIConfigEditor
            value={config}
            onChange={handleConfigChange}
            showPreview={true}
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-colors"
          >
            <RotateCcw size={16} />
            <span>إعادة للافتراضي</span>
          </button>
          
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving || !hasChanges}
              className="flex items-center gap-2 px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save size={16} />
              <span>{isSaving ? 'جاري الحفظ...' : 'حفظ'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UIConfigModal;
