// src/components/admin/CustomizationSettingsPage.tsx
/**
 * Customization Settings Page
 * 
 * This page renders the OptionsPage component for managing option groups
 * (flavors, toppings, sauces, etc.) and their individual options.
 * 
 * Requirements: 1.1 - Display option groups when admin navigates to customization tab
 */

'use client';

import React from 'react';
import OptionsPage from './options';

const CustomizationSettingsPage: React.FC = () => {
  return <OptionsPage />;
};

export default CustomizationSettingsPage;
