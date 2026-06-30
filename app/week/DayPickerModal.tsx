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
  return (
    <Modal isOpen={isOpen} title={title} onClose={onClose}>
      <div className="grid grid-cols-1 gap-2">
        {DAYS.map((day, i) => (
          <button
            key={day}
            onClick={() => onSelect(i)}
            className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground hover:bg-accent/10 hover:border-accent-dim transition-colors"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-semibold text-secondary">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'][i]}
            </span>
            {day}
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
