'use client';

import { Goal } from '@/lib/appState';
import { useState } from 'react';

interface GoalCardProps {
  goal: Goal;
  onUpdateProgress: (goalId: number, newProgress: number) => void;
  onToggleMilestone: (goalId: number, milestoneIdx: number) => void;
  onAddMilestone: (goalId: number, text: string) => void;
  onDeleteMilestone: (goalId: number, milestoneIdx: number) => void;
  onEdit: (goalId: number) => void;
  onDelete: (goalId: number) => void;
}

export function GoalCard({ goal, onUpdateProgress, onToggleMilestone, onAddMilestone, onDeleteMilestone, onEdit, onDelete }: GoalCardProps) {
  const [showMilestones, setShowMilestones] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [newMilestone, setNewMilestone] = useState('');

  const hasMilestones = goal.milestones.length > 0;
  const doneCount = goal.milestones.filter((m) => m.done).length;
  const displayProgress = hasMilestones
    ? Math.round((doneCount / goal.milestones.length) * 100)
    : goal.progress;

  const progressColor =
    displayProgress >= 70
      ? 'bg-success'
      : displayProgress >= 40
        ? 'bg-warning'
        : 'bg-accent';

  return (
    <div
      className="rounded-2xl border border-border bg-white p-5 cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => setShowMilestones(!showMilestones)}
    >
      {/* Header */}
      <div className="mb-3 flex items-center gap-3">
        <span className="text-2xl">{goal.emoji}</span>
        <div className="flex-1">
          <h3 className="font-semibold text-foreground">{goal.title}</h3>
          <p className="text-xs text-secondary">{goal.deadline}</p>
        </div>
        <div className="relative">
          <button
            onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
            className="rounded-lg p-1 text-tertiary hover:text-foreground hover:bg-muted transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
              <circle cx="8" cy="3" r="1.5" />
              <circle cx="8" cy="8" r="1.5" />
              <circle cx="8" cy="13" r="1.5" />
            </svg>
          </button>
          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setShowMenu(false); }} />
              <div className="absolute right-0 top-full z-20 mt-1 w-32 rounded-xl border border-border bg-white shadow-lg overflow-hidden">
                <button
                  onClick={(e) => { e.stopPropagation(); setShowMenu(false); onEdit(goal.id); }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-xs text-foreground hover:bg-muted transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5">
                    <path d="M11.5 1.5l3 3L6 13H3v-3l8.5-8.5z" />
                  </svg>
                  Edit
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setShowMenu(false); onDelete(goal.id); }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-xs text-danger hover:bg-danger-light transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5">
                    <path d="M2 4h12M5 4V2.5A1.5 1.5 0 016.5 1h3A1.5 1.5 0 0111 2.5V4M4 4v9.5A1.5 1.5 0 005.5 15h5a1.5 1.5 0 001.5-1.5V4" />
                  </svg>
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-3 h-2 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full ${progressColor} transition-all duration-700 ease-out`}
          style={{ width: `${displayProgress}%` }}
        />
      </div>

      {/* Progress Footer */}
      <div className="mb-3 flex items-center justify-between">
        <span className="font-semibold text-foreground">{displayProgress}%</span>
        {!hasMilestones && (
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onUpdateProgress(goal.id, Math.max(0, goal.progress - 10));
              }}
              className="rounded-lg border border-border bg-white px-2 py-1 text-xs text-secondary hover:bg-muted transition-colors"
            >
              −
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onUpdateProgress(goal.id, Math.min(100, goal.progress + 10));
              }}
              className="rounded-lg border border-accent bg-white px-2 py-1 text-xs text-accent-dark hover:bg-accent-light transition-colors"
            >
              +10%
            </button>
          </div>
        )}
      </div>

      {/* Notes */}
      {goal.notes && (
        <p className="mb-3 text-xs italic text-tertiary">{goal.notes}</p>
      )}

      {/* Milestones */}
      {showMilestones && (
        <div className="border-t border-border-dim pt-3 space-y-2">
          {goal.milestones.map((milestone, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 text-xs group"
            >
              <div
                className={`w-5 h-5 rounded-lg border-2 flex-shrink-0 flex items-center justify-center transition-all duration-200 cursor-pointer ${
                  milestone.done
                    ? 'bg-success border-success text-white animate-pop'
                    : 'border-border hover:border-accent bg-white'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleMilestone(goal.id, idx);
                }}
              >
                {milestone.done && (
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="2">
                    <path d="M2 6l3 3 5-5" />
                  </svg>
                )}
              </div>
              <span
                className={`flex-1 cursor-pointer ${milestone.done ? 'text-secondary line-through' : 'text-foreground'}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleMilestone(goal.id, idx);
                }}
              >
                {milestone.text}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteMilestone(goal.id, idx);
                }}
                className="opacity-0 group-hover:opacity-100 text-tertiary hover:text-danger transition-all p-0.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5">
                  <path d="M4 4l8 8M12 4l-8 8" />
                </svg>
              </button>
            </div>
          ))}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="text"
              value={newMilestone}
              onChange={(e) => setNewMilestone(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newMilestone.trim()) {
                  e.stopPropagation();
                  onAddMilestone(goal.id, newMilestone.trim());
                  setNewMilestone('');
                }
              }}
              onClick={(e) => e.stopPropagation()}
              placeholder="Add milestone..."
              className="flex-1 bg-transparent text-xs text-foreground placeholder-tertiary outline-none border-b border-border focus:border-accent pb-0.5"
            />
            {newMilestone.trim() && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddMilestone(goal.id, newMilestone.trim());
                  setNewMilestone('');
                }}
                className="text-accent hover:text-accent-dark transition-colors text-xs font-medium"
              >
                Add
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
