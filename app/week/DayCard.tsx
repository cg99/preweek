'use client';

import { useState } from 'react';
import { Task } from '@/lib/appState';

interface DayCardProps {
  dayNumber: number;
  dayName: string;
  tasks: Task[];
  isToday: boolean;
  isPast: boolean;
  onAddTask: () => void;
  onCompleteTask: (id: number) => void;
  onEditTask: (id: number, text: string) => void;
  onRescheduleTask: (id: number) => void;
  onDeleteTask: (id: number) => void;
  style?: React.CSSProperties;
}

export function DayCard({
  dayNumber,
  dayName,
  tasks,
  isToday,
  isPast,
  onAddTask,
  onCompleteTask,
  onEditTask,
  onRescheduleTask,
  onDeleteTask,
  style,
}: DayCardProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState('');

  return (
    <div
      className={`rounded-2xl border p-4 transition-shadow ${
        isToday
          ? 'border-accent bg-card shadow-sm ring-2 ring-accent/30'
          : isPast
          ? 'border-border-dim bg-card/50 opacity-60'
          : 'border-border bg-card hover:shadow-sm'
      }`}
      style={style}
    >
      <div className="mb-4 flex items-baseline gap-3">
        <span
          className={`text-3xl font-bold ${
            isToday ? 'text-accent' : 'text-foreground'
          }`}
        >
          {dayNumber}
        </span>
        <span
          className={`text-xs font-semibold tracking-widest uppercase ${
            isToday ? 'text-accent' : 'text-secondary'
          }`}
        >
          {dayName}
        </span>
      </div>

      {/* Task Items */}
      <div className="space-y-0 border-t border-border-dim">
        {tasks.map((task) => {
          const isCompleted = task.status === 'completed';
          return (
            <div
              key={task.id}
              className="group flex items-center gap-2 border-b border-border-dim py-3 first:pt-3 last:border-b-0"
            >
              {isCompleted ? (
                <button
                  onClick={() => onCompleteTask(task.id)}
                  className="h-5 w-5 flex-shrink-0 rounded-md border-2 border-success bg-success flex items-center justify-center transition-all duration-200 hover:opacity-80 active:scale-95"
                  title="Mark incomplete"
                >
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="2.5">
                    <path d="M2 6l3 3 5-5" />
                  </svg>
                </button>
              ) : (
                <button
                  onClick={() => onCompleteTask(task.id)}
                  className="h-5 w-5 flex-shrink-0 rounded-md border-2 border-border bg-card transition-all duration-200 hover:border-success hover:scale-110 active:scale-95"
                  title="Honor intention"
                />
              )}
              {editingId === task.id ? (
                <input
                  autoFocus
                  value={editDraft}
                  onChange={(e) => setEditDraft(e.target.value)}
                  onBlur={() => {
                    if (editDraft.trim() && editDraft !== task.text) {
                      onEditTask(task.id, editDraft.trim());
                    }
                    setEditingId(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      (e.target as HTMLInputElement).blur();
                    }
                    if (e.key === 'Escape') {
                      setEditingId(null);
                    }
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="flex-1 rounded-md border border-accent bg-accent-light px-2 py-1 text-sm text-foreground outline-none"
                />
              ) : (
                <button
                  onClick={() => {
                    if (!isCompleted) {
                      setEditingId(task.id);
                      setEditDraft(task.text);
                    }
                  }}
                  className="flex-1 text-left text-sm truncate cursor-text hover:bg-muted rounded-sm px-1 -mx-1 transition-colors"
                >
                  <span className={isCompleted ? 'text-tertiary line-through' : 'text-foreground'}>
                    {task.text}
                  </span>
                </button>
              )}

              {/* Actions */}
              <div className={`flex gap-1 opacity-100 md:opacity-0 transition-opacity md:group-hover:opacity-100 ${isCompleted ? 'md:opacity-100' : ''}`}>
                {!isCompleted && (
                  <button
                    onClick={() => onRescheduleTask(task.id)}
                    className="rounded-md bg-muted px-2 py-1 text-xs text-secondary hover:bg-accent/10 hover:text-accent-dark"
                    title="Move to another day"
                  >
                    ↻
                  </button>
                )}
                <button
                  onClick={() => onDeleteTask(task.id)}
                  className="rounded-md bg-muted px-2 py-1 text-xs text-secondary hover:bg-danger-light hover:text-danger"
                  title="Delete"
                >
                  ✕
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Set Intention Button */}
      {!isPast && (
        <button
          onClick={onAddTask}
          className="mt-3 flex items-center gap-2 text-xs font-medium text-secondary hover:text-accent"
        >
          <span className="text-lg font-light">+</span> Set intention
        </button>
      )}
    </div>
  );
}
