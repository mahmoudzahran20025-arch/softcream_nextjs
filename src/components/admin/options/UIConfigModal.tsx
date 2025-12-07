/**
 * UIConfigModal - Dedicated Modal for UI Configuration
 * 
 * Replaced legacy editor with the new AdvancedStyleEditor to ensure consistency
 * across Product > OptionGroups and Global > OptionGroups.
 */

'use client';

import React, { useState, useEffect } from 'react';
import type { OptionGroup } from './types';
import AdvancedStyleEditor from '@/components/admin/products/UnifiedProductForm/AdvancedStyleEditor';
import { parseUIConfig } from '@/lib/uiConfig';
import type { UIConfig } from '@/lib/uiConfig';

interface UIConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: OptionGroup | null;
  onSave: (groupId: string, uiConfig: UIConfig) => Promise<void>;
}

/**
 * UIConfigModal Wrapper
 * Delegates to AdvancedStyleEditor
 */
const UIConfigModal: React.FC<UIConfigModalProps> = ({
  isOpen,
  onClose,
  group,
  onSave,
}) => {
  const [config, setConfig] = useState<UIConfig>(parseUIConfig());

  // Initialize config when group changes
  useEffect(() => {
    if (group) {
      const uiConfig = typeof group.ui_config === 'string'
        ? parseUIConfig(group.ui_config)
        : group.ui_config || parseUIConfig();
      setConfig(uiConfig);
    }
  }, [group]);

  if (!isOpen || !group) return null;

  return (
    <AdvancedStyleEditor
      group={group as any} // Cast compatible type
      config={config}
      onChange={(newConfig) => {
        // Immediate update to local state for internal consistency
        setConfig(newConfig);
        // Auto-save to backend via parent handler
        onSave(group.id, newConfig).catch(console.error);
      }}
      onClose={onClose}
    />
  );
};

export default UIConfigModal;
