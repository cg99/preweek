'use client';

import { Modal } from '@/app/components/Modal';
import { useState } from 'react';

interface AddGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (title: string, emoji: string, deadline: string) => void;
}

export function AddGoalModal({ isOpen, onClose, onAdd }: AddGoalModalProps) {
  const [title, setTitle] = useState('');
  const [emoji, setEmoji] = useState('');
  const [deadline, setDeadline] = useState('');

  const handleClose = () => {
    setTitle(''); setEmoji(''); setDeadline('');
    onClose();
  };

  const handleAdd = () => {
    if (!title.trim()) return;
    onAdd(title, emoji || '🎯', deadline);
    setTitle('');
    setEmoji('');
    setDeadline('');
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAdd();
    if (e.key === 'Escape') handleClose();
  };

  return (
    <Modal isOpen={isOpen} title="New aspiration" onClose={handleClose}>
      <div className="space-y-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="What are you nurturing? (e.g. Learn Node.js)"
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

        <div className="flex gap-3 pt-4">
          <button
            onClick={handleClose}
            className="flex-1 rounded-xl border border-border bg-card py-3 font-medium text-foreground hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            disabled={!title.trim()}
            className="flex-1 rounded-xl bg-accent py-3 font-medium text-white hover:bg-accent-dark transition-colors disabled:bg-muted disabled:text-tertiary"
          >
            Add aspiration
          </button>
        </div>
      </div>
    </Modal>
  );
}
