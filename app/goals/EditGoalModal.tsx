'use client';

import { Goal } from '@/lib/appState';
import { Modal } from '@/app/components/Modal';
import { useState, useEffect } from 'react';

interface EditGoalModalProps {
  isOpen: boolean;
  goal: Goal | null;
  onClose: () => void;
  onSave: (goalId: number, title: string, emoji: string, deadline: string, notes: string) => void;
}

export function EditGoalModal({ isOpen, goal, onClose, onSave }: EditGoalModalProps) {
  const [title, setTitle] = useState('');
  const [emoji, setEmoji] = useState('');
  const [deadline, setDeadline] = useState('');
  const [notes, setNotes] = useState('');

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { if (goal) { setTitle(goal.title); setEmoji(goal.emoji); setDeadline(goal.deadline); setNotes(goal.notes); } }, [goal]);

  if (!goal) return null;

  const handleSave = () => {
    if (!title.trim() || !goal) return;
    onSave(goal.id, title, emoji || '🎯', deadline, notes);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') onClose();
  };

  return (
    <Modal isOpen={isOpen} title="Edit aspiration" onClose={onClose}>
      <div className="space-y-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="What are you nurturing?"
          autoFocus
          className="w-full border-b-2 border-accent bg-transparent pb-2 text-sm placeholder-tertiary outline-none text-foreground"
        />

        <input
          type="text"
          value={emoji}
          onChange={(e) => setEmoji(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Emoji (e.g. 🎮)"
          className="w-full border-b-2 border-accent bg-transparent pb-2 text-sm placeholder-tertiary outline-none text-foreground"
        />

        <input
          type="text"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Deadline (e.g. Dec 2026)"
          className="w-full border-b-2 border-accent bg-transparent pb-2 text-sm placeholder-tertiary outline-none text-foreground"
        />

        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes (optional)"
          className="w-full border-b-2 border-accent bg-transparent pb-2 text-sm placeholder-tertiary outline-none text-foreground resize-none"
          rows={2}
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
            disabled={!title.trim()}
            className="flex-1 rounded-xl bg-accent py-3 font-medium text-white hover:bg-accent-dark transition-colors disabled:bg-muted disabled:text-tertiary"
          >
            Save
          </button>
        </div>
      </div>
    </Modal>
  );
}
