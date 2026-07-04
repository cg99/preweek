'use client';

import { Modal } from '@/app/components/Modal';
import { DAYS } from '@/lib/constants';

interface DayPickerModalProps {
  isOpen: boolean;
  title: string;
  onSelect: (dayIndex: number) => void;
  onClose: () => void;
}

export function DayPickerModal({ isOpen, title, onSelect, onClose }: DayPickerModalProps) {
  const today = new Date();
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + (i - 2));
    return d;
  });

  return (
    <Modal isOpen={isOpen} title={title} onClose={onClose}>
      <div className="grid grid-cols-1 gap-2">
        {days.map((date, i) => (
          <button
            key={i}
            onClick={() => onSelect(i)}
            className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground hover:bg-accent/10 hover:border-accent-dim transition-colors"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-semibold text-secondary">
              {date.getDate()}
            </span>
            <span>{DAYS[date.getDay()]}{i === 2 ? ' (Today)' : ''}</span>
          </button>
        ))}
        <button
          onClick={onClose}
          className="mt-2 rounded-xl border border-border bg-card py-3 text-sm font-medium text-secondary hover:bg-muted transition-colors"
        >
          Cancel
        </button>
      </div>
    </Modal>
  );
}
