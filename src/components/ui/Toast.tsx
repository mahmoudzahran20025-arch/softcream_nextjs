/**
 * Toast Component - Simple notification system
 * 
 * Provides toast notifications for success, error, warning, and info messages.
 * Uses Zustand for global state management.
 */

'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { create } from 'zustand';

// ===========================
// Types
// ===========================

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastStore {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

// ===========================
// Store
// ===========================

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }],
    }));
  },
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },
}));

// ===========================
// Helper Functions
// ===========================

export const toast = {
  success: (message: string, duration = 3000) => {
    useToastStore.getState().addToast({ type: 'success', message, duration });
  },
  error: (message: string, duration = 5000) => {
    useToastStore.getState().addToast({ type: 'error', message, duration });
  },
  warning: (message: string, duration = 4000) => {
    useToastStore.getState().addToast({ type: 'warning', message, duration });
  },
  info: (message: string, duration = 3000) => {
    useToastStore.getState().addToast({ type: 'info', message, duration });
  },
};

// ===========================
// Toast Item Component
// ===========================

const ToastItem: React.FC<{ toast: Toast }> = ({ toast: t }) => {
  const { removeToast } = useToastStore();

  useEffect(() => {
    if (t.duration) {
      const timer = setTimeout(() => {
        removeToast(t.id);
      }, t.duration);
      return () => clearTimeout(timer);
    }
  }, [t.id, t.duration, removeToast]);

  const config = {
    success: {
      icon: CheckCircle,
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      iconColor: 'text-green-500',
    },
    error: {
      icon: AlertCircle,
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      iconColor: 'text-red-500',
    },
    warning: {
      icon: AlertTriangle,
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-800',
      iconColor: 'text-amber-500',
    },
    info: {
      icon: Info,
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      iconColor: 'text-blue-500',
    },
  };

  const { icon: Icon, bg, border, text, iconColor } = config[t.type];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg ${bg} ${border} min-w-[280px] max-w-[400px]`}
    >
      <Icon size={20} className={iconColor} />
      <p className={`flex-1 text-sm font-medium ${text}`}>{t.message}</p>
      <button
        onClick={() => removeToast(t.id)}
        className={`p-1 rounded-lg hover:bg-black/5 transition-colors ${text}`}
      >
        <X size={16} />
      </button>
    </motion.div>
  );
};

// ===========================
// Toast Container Component
// ===========================

export const ToastContainer: React.FC = () => {
  const { toasts } = useToastStore();

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2">
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ToastContainer;
