'use client';

import { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
}

export function Modal({ isOpen, title, children, onClose }: ModalProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Sheet */}
      <div className="fixed inset-0 z-[60] flex items-end pointer-events-none">
        <div
          className="w-full bg-white rounded-3xl rounded-b-none pointer-events-auto pb-12"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Handle */}
          <div className="flex justify-center pt-4 pb-2">
            <div className="h-1 w-12 rounded-full bg-border" />
          </div>

          {/* Header */}
          <div className="px-6 py-2">
            <h2 className="text-xl font-bold text-foreground">{title}</h2>
          </div>

          {/* Content */}
          <div className="px-6 pb-6">{children}</div>
        </div>
      </div>
    </>
  );
}
