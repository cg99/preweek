'use client';

import { ReactNode, useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
}

export function Modal({ isOpen, title, children, onClose }: ModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Sheet — bottom sheet on mobile, centered dialog on desktop */}
      <div className="fixed inset-0 z-[60] flex items-end md:items-center md:justify-center pointer-events-none">
        <div
          className="w-full md:max-w-lg bg-card md:rounded-3xl md:shadow-xl pointer-events-auto pb-12 md:pb-4 rounded-3xl rounded-b-none md:rounded-b-3xl md:mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Handle (mobile only) */}
          <div className="flex justify-center pt-4 pb-2 md:hidden">
            <div className="h-1 w-12 rounded-full bg-border" />
          </div>

          {/* Header */}
          <div className="px-6 py-2 flex items-center gap-3">
            <button
              onClick={onClose}
              className="flex items-center justify-center h-7 w-7 rounded-full text-secondary hover:text-foreground hover:bg-muted transition-colors -ml-1"
              aria-label="Back"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="2">
                <path d="M10 2L4 8l6 6" />
              </svg>
            </button>
            <h2 className="text-xl font-bold text-foreground">{title}</h2>
          </div>

          {/* Content */}
          <div className="px-8 pb-8 pt-2 max-h-[70vh] md:max-h-[65vh] overflow-y-auto overscroll-contain">
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
