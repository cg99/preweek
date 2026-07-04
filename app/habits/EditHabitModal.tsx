'use client';

import { Habit } from '@/lib/appState';
import { Modal } from '@/app/components/Modal';
import { useState, useEffect } from 'react';

interface EditHabitModalProps {
  isOpen: boolean;
  habit: Habit | null;
  onClose: () => void;
  onSave: (habitId: number, name: string, icon: string) => void;
}

export function EditHabitModal({ isOpen, habit, onClose, onSave }: EditHabitModalProps) {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('');

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { if (habit) { setName(habit.name); setIcon(habit.icon); } }, [habit]);

  if (!habit) return null;

  const handleSave = () => {
    if (!name.trim() || !habit) return;
    onSave(habit.id, name, icon || '⭐');
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') onClose();
  };

  return (
    <Modal isOpen={isOpen} title="Edit practice" onClose={onClose}>
      <div className="space-y-4">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Practice name"
          autoFocus
          className="w-full border-b-2 border-accent bg-transparent pb-2 text-sm placeholder-tertiary outline-none text-foreground"
        />

        <input
          type="text"
          value={icon}
          onChange={(e) => setIcon(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Emoji (e.g. 🏃)"
          className="w-full border-b-2 border-accent bg-transparent pb-2 text-sm placeholder-tertiary outline-none text-foreground"
        />

        <div className="flex gap-3 pt-4">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-border bg-card py-3 font-medium text-foreground hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="flex-1 rounded-xl bg-accent py-3 font-medium text-white hover:bg-accent-dark transition-colors disabled:bg-muted disabled:text-tertiary"
          >
            Save
          </button>
        </div>
      </div>
    </Modal>
  );
}
