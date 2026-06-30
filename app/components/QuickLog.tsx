'use client';

import { useState } from 'react';
import { useAppState } from '@/app/hooks/useAppState';
import { useWeekDates } from '@/app/hooks/useWeekDates';

export function QuickLog() {
  const { state, setState } = useAppState();
  const { todayIdx } = useWeekDates();
  const [taskText, setTaskText] = useState('');

  if (!state) return null;

  const todayTasks = state.tasks[todayIdx] || [];
  const todayHabits = state.habits.filter((h) => h.log[todayIdx] === 0);

  const handleAddTask = () => {
    const text = taskText.trim();
    if (!text) return;
    const newState = structuredClone(state);
    newState.tasks[todayIdx] = newState.tasks[todayIdx] || [];
    newState.tasks[todayIdx].push({ id: state.nextTaskId, text, status: 'pending' });
    newState.nextTaskId += 1;
    setState(newState);
    setTaskText('');
  };

  const handleToggleHabit = (habitId: number) => {
    const newState = structuredClone(state);
    const habit = newState.habits.find((h) => h.id === habitId);
    if (!habit) return;
    habit.log[todayIdx] = habit.log[todayIdx] === 1 ? 0 : 1;
    if (habit.log[todayIdx] === 1) {
      let streak = 0;
      for (let i = todayIdx; i >= 0; i--) {
        if (habit.log[i] === 1) streak++;
        else break;
      }
      habit.streak = streak;
    } else {
      habit.streak = 0;
    }
    setState(newState);
  };

  return (
    <div className="mx-4 sm:mx-6 pt-6 sm:pt-8 pb-2">
      <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
        {/* Quick task entry */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Set intention for today…"
            value={taskText}
            onChange={(e) => setTaskText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleAddTask(); }}
            className="flex-1 rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-foreground placeholder:text-tertiary outline-none focus:border-accent transition-colors"
          />
          <button
            onClick={handleAddTask}
            disabled={!taskText.trim()}
            className="rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-dark transition-colors disabled:opacity-40 shrink-0"
          >
            Add
          </button>
        </div>

        {/* Today's habits */}
        {todayHabits.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {todayHabits.map((h) => (
              <button
                key={h.id}
                onClick={() => handleToggleHabit(h.id)}
                className="flex items-center gap-1.5 rounded-lg bg-muted hover:bg-muted-hover px-2.5 py-1.5 text-xs text-secondary hover:text-foreground transition-all active:scale-95"
                title={`Log ${h.name}`}
              >
                <span>{h.icon}</span>
                <span>{h.name}</span>
              </button>
            ))}
          </div>
        )}

        {/* Today's uncompleted tasks count */}
        {todayTasks.filter((t) => t.status === 'pending').length > 0 && (
          <div className="text-xs text-tertiary">
            {todayTasks.filter((t) => t.status === 'pending').length} intention{todayTasks.filter((t) => t.status === 'pending').length !== 1 ? 's' : ''} for today
          </div>
        )}
      </div>
    </div>
  );
}
