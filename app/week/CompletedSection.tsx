'use client';

import { AppState } from '@/lib/appState';

interface CompletedSectionProps {
  completed: AppState['completed'];
  expanded: boolean;
  onToggleExpanded: () => void;
}

export function CompletedSection({
  completed,
  expanded,
  onToggleExpanded,
}: CompletedSectionProps) {
  if (completed.length === 0) return null;

  return (
    <div className="mt-6">
      <button
        onClick={onToggleExpanded}
        className="flex w-full items-center justify-between rounded-2xl border border-border bg-card p-4 hover:bg-muted transition-colors"
      >
        <div className="flex items-start gap-4">
          <span className="text-2xl text-success">✓</span>
          <div className="text-left">
            <div className="text-xs font-semibold tracking-widest text-secondary uppercase">
                Honored this week
            </div>
            <div className="text-3xl font-bold text-success">{completed.length}</div>
          </div>
        </div>
        <span
          className={`text-lg text-secondary transition-transform ${
            expanded ? 'rotate-180' : ''
          }`}
        >
          ▾
        </span>
      </button>

      {/* Expanded List */}
      {expanded && (
        <div className="mt-2 space-y-0 border-t border-border pt-3">
          {completed.length === 0 && (
            <div className="py-3 text-xs text-tertiary text-center">No intentions honored yet this week</div>
          )}
          {completed.map((task) => (
            <div key={task.id} className="flex gap-3 border-b border-border-dim py-3 first:pt-0 last:border-b-0">
              <span className="mt-0.5 flex-shrink-0 text-success">✓</span>
              <div className="flex-1">
                <div className="line-through text-sm text-secondary">{task.text}</div>
                <div className="mt-1 text-xs text-tertiary">Completed {task.day}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
