'use client';

import { createContext, useContext, useState, useCallback, useRef, ReactNode } from 'react';
import { ToastDisplay } from '@/app/components/Toast';

interface ToastContextValue {
  show: (message: string, duration?: number, onUndo?: () => void) => void;
}

interface ToastState {
  message: string;
  duration?: number;
  action?: { label: string; onClick: () => void };
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const actionRef = useRef<(() => void) | null>(null);

  const show = useCallback((message: string, duration?: number, onUndo?: () => void) => {
    actionRef.current = onUndo || null;
    setToast({
      message,
      duration: onUndo ? 5000 : (duration || 2000),
      action: onUndo ? { label: 'Undo', onClick: () => { actionRef.current?.(); actionRef.current = null; } } : undefined,
    });
  }, []);

  const close = useCallback(() => setToast(null), []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <ToastDisplay toast={toast} onClose={close} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
