// src/components/admin/customization/index.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Settings } from 'lucide-react';
import { apiRequest } from './api';
import type { Container, Size, OptionGroup, ActiveSection, ModalType } from './types';
import TreeView from './TreeView';
import StatsCards from './StatsCards';
import QuickInfo from './QuickInfo';
import Modal from './Modal';

const CustomizationSettingsPage: React.FC = () => {
  const [containers, setContainers] = useState<Container[]>([]);
  const [sizes, setSizes] = useState<Size[]>([]);
  const [optionGroups, setOptionGroups] = useState<OptionGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<ActiveSection>('overview');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  
  // Modal state
  const [modalType, setModalType] = useState<ModalType>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');

  useEffect(() => { 
    loadAllData(); 
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [containersRes, sizesRes, optionsRes] = await Promise.all([
        apiRequest('/admin/containers'),
        apiRequest('/admin/sizes'),
        apiRequest('/admin/options')
      ]);
      if (containersRes.success) setContainers(containersRes.data || []);
      if (sizesRes.success) setSizes(sizesRes.data || []);
      if (optionsRes.success) setOptionGroups(optionsRes.data || []);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  };

  // Stats
  const totalOptions = optionGroups.reduce((sum, g) => sum + (g.options?.length || 0), 0);
  const availableContainers = containers.filter(c => c.available === 1).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-10 h-10 border-4 border-pink-200 border-t-pink-500 rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Settings className="text-purple-500" size={22} />
            إعدادات التخصيص
          </h1>
          <p className="text-sm sm:text-base text-gray-500 mt-1">
            إدارة الحاويات، المقاسات، ومجموعات الخيارات
          </p>
        </div>
      </div>

      {/* Visual Tree Structure */}
      <TreeView
        containers={containers}
        sizes={sizes}
        optionGroups={optionGroups}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        expandedGroups={expandedGroups}
        toggleGroup={toggleGroup}
        setEditingItem={setEditingItem}
        setModalType={setModalType}
        setSelectedGroupId={setSelectedGroupId}
      />

      {/* Stats Cards */}
      <StatsCards
        containersCount={containers.length}
        availableContainers={availableContainers}
        sizesCount={sizes.length}
        groupsCount={optionGroups.length}
        totalOptions={totalOptions}
      />

      {/* Quick Info */}
      <QuickInfo />

      {/* Modal */}
      {modalType && (
        <Modal
          type={modalType}
          item={editingItem}
          groupId={selectedGroupId}
          groups={optionGroups}
          onClose={() => { 
            setModalType(null); 
            setEditingItem(null); 
            setSelectedGroupId(''); 
          }}
          onSave={loadAllData}
        />
      )}
    </div>
  );
};

export default CustomizationSettingsPage;
