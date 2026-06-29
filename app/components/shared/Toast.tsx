'use client';

import { useEffect, useRef, useState } from 'react';

interface ToastProps {
  message: string;
  duration?: number;
  action?: { label: string; onClick: () => void };
}

export function useToast() {
  const [toast, setToast] = useState<ToastProps | null>(null);
  const actionRef = useRef<(() => void) | null>(null);

  const show = (message: string, duration?: number, onUndo?: () => void) => {
    actionRef.current = onUndo || null;
    setToast({
      message,
      duration: onUndo ? 5000 : (duration || 2000),
      action: onUndo ? { label: 'Undo', onClick: () => { actionRef.current?.(); actionRef.current = null; } } : undefined,
    });
  };

  const ToastComponent = () => {
    const [isVisible, setIsVisible] = useState(!!toast);

    useEffect(() => {
      if (toast) {
        setIsVisible(true);
        const timer = setTimeout(() => {
          setIsVisible(false);
          setTimeout(() => setToast(null), 300);
        }, toast.duration);

        return () => clearTimeout(timer);
      }
    }, [toast]);

    if (!toast) return null;

    return (
      <div
        className={`fixed bottom-32 left-1/2 -translate-x-1/2 z-50 bg-foreground text-white px-6 py-3 rounded-full text-sm font-medium flex items-center gap-3 transition-all duration-300 ${
          isVisible
            ? 'translate-y-0 opacity-100 animate-slide-up'
            : 'translate-y-2 opacity-0 pointer-events-none'
        }`}
      >
        <span>{toast.message}</span>
        {toast.action && (
          <button
            onClick={() => { toast.action!.onClick(); setToast(null); }}
            className="font-semibold text-accent-light hover:text-white transition-colors whitespace-nowrap"
          >
            {toast.action.label}
          </button>
        )}
      </div>
    );
  };

  return { show, ToastComponent };
}
