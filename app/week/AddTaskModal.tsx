'use client';

import { DAYS } from '@/lib/constants';
import { Modal } from '@/app/components/Modal';
import { useState } from 'react';

interface AddTaskModalProps {
  isOpen: boolean;
  dayIndex: number | null;
  onClose: () => void;
  onAdd: (text: string) => void;
}

export function AddTaskModal({ isOpen, dayIndex, onClose, onAdd }: AddTaskModalProps) {
  const [input, setInput] = useState('');

  const handleClose = () => {
    setInput('');
    onClose();
  };

  const handleAdd = () => {
    if (!input.trim()) return;
    onAdd(input);
    setInput('');
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAdd();
    if (e.key === 'Escape') handleClose();
  };

  const dayName = dayIndex !== null ? DAYS[dayIndex] : 'Unknown';

  return (
    <Modal isOpen={isOpen} title={`Set intention — ${dayName}`} onClose={handleClose}>
      <div className="space-y-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="What do you want to bring to this day?"
          autoFocus
          className="w-full border-b-2 border-accent bg-transparent pb-2 text-sm placeholder-tertiary outline-none text-foreground"
        />

        <div className="flex gap-3 pt-4">
          <button
            onClick={handleClose}
            className="flex-1 rounded-xl border border-border bg-card py-3 font-medium text-foreground hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            disabled={!input.trim()}
            className="flex-1 rounded-xl bg-accent py-3 font-medium text-white hover:bg-accent-dark transition-colors disabled:bg-muted disabled:text-tertiary"
          >
            Set intention
          </button>
        </div>
      </div>
    </Modal>
  );
}
