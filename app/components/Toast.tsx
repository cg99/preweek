'use client';

import { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  duration?: number;
  action?: { label: string; onClick: () => void };
}

export function ToastDisplay({ toast, onClose }: { toast: ToastProps | null; onClose: () => void }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (toast) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsVisible(true);
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
      className={`fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-[70] transition-all duration-300 ${
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
