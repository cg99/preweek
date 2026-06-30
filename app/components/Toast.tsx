'use client';

import { useEffect, useRef, useState } from 'react';

interface ToastProps {
  message: string;
  duration?: number;
  action?: { label: string; onClick: () => void };
}

export function ToastDisplay({ toast, onClose }: { toast: ToastProps | null; onClose: () => void }) {
  const [isVisible, setIsVisible] = useState(!!toast);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300);
      }, toast.duration);

      return () => clearTimeout(timer);
    }
  }, [toast, onClose]);

  if (!toast) return null;

  return (
    <div
      className={`fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      <div className="flex items-center gap-3 bg-[#2C2A28] text-white px-4 py-3 rounded-xl shadow-lg text-sm whitespace-nowrap">
        <span>{toast.message}</span>
        {toast.action && (
          <button
            onClick={() => {
              toast.action!.onClick();
              setIsVisible(false);
              setTimeout(onClose, 300);
            }}
            className="font-medium text-accent hover:text-accent-dark shrink-0"
          >
            {toast.action.label}
          </button>
        )}
      </div>
    </div>
  );
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

  const close = () => setToast(null);

  return { show, toast, close };
}
