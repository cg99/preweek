'use client';

import { AppState } from '@/lib/appState';

interface OverdueSectionProps {
  overdue: AppState['overdue'];
  onComplete: (id: number) => void;
  onMoveToToday: (id: number) => void;
  onReassign: (id: number) => void;
  onDelete: (id: number) => void;
}

export function OverdueSection({
  overdue,
  onComplete,
  onMoveToToday,
  onReassign,
  onDelete,
}: OverdueSectionProps) {
  if (overdue.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-xs font-semibold tracking-widest text-tertiary uppercase">
          carried over
        </span>
        <span className="inline-block rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-secondary">
          {overdue.length}
        </span>
      </div>

      <div className="rounded-2xl border border-border-dim bg-muted/50 p-4">
        {overdue.map((task) => (
          <div key={task.id} className="border-b border-border-dim pb-4 last:border-b-0 last:pb-0">
            <div className="mb-2 flex items-start gap-3">
              <button
                onClick={() => onComplete(task.id)}
                className="mt-1 h-5 w-5 flex-shrink-0 rounded-lg border-2 border-border bg-white hover:border-success transition-colors"
                title="Honor intention"
              />
              <div className="flex-1">
                <div className="text-sm font-medium text-foreground">{task.text}</div>
                <div className="mt-1 text-xs text-tertiary">from {task.from}</div>
              </div>
            </div>

            <div className="ml-8 flex flex-wrap gap-2">
              <button
                onClick={() => onMoveToToday(task.id)}
                className="rounded-lg border border-border bg-white px-3 py-1 text-xs font-medium text-secondary hover:bg-accent-light hover:border-accent-dim hover:text-accent-dark transition-colors"
              >
                carry into today
              </button>
              <button
                onClick={() => onReassign(task.id)}
                className="rounded-lg border border-border bg-white px-3 py-1 text-xs font-medium text-secondary hover:bg-accent-light hover:border-accent-dim hover:text-accent-dark transition-colors"
              >
                assign elsewhere
              </button>
              <button
                onClick={() => onDelete(task.id)}
                className="rounded-lg border border-border bg-white px-3 py-1 text-xs font-medium text-tertiary hover:bg-danger-light hover:border-danger hover:text-danger transition-colors"
              >
                let go
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
