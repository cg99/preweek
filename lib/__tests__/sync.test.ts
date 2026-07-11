import { describe, it, expect } from 'vitest';
import { mergeStates } from '@/lib/sync';
import { DEFAULT_APP_STATE } from '@/lib/appState';
import type { AppState } from '@/lib/appState';

function cloneState(): AppState {
  return structuredClone(DEFAULT_APP_STATE);
}

describe('sync.mergeStates', () => {
  it('returns remote when local is null', () => {
    const remote = cloneState();
    remote.tasks['2026-01-01'] = [{ id: 1, text: 'Remote only', status: 'pending' }];
    const merged = mergeStates(null, remote);
    expect(merged.tasks['2026-01-01']).toEqual([{ id: 1, text: 'Remote only', status: 'pending' }]);
  });

  it('returns remote when local has all empty arrays', () => {
    const local = cloneState();
    const remote = cloneState();
    remote.tasks['2026-01-01'] = [{ id: 1, text: 'Remote only', status: 'pending' }];
    const merged = mergeStates(local, remote);
    expect(merged.tasks['2026-01-01']).toEqual([{ id: 1, text: 'Remote only', status: 'pending' }]);
  });

  it('deduplicates tasks by id, preserving local version for duplicates', () => {
    const local = cloneState();
    const remote = cloneState();

    local.tasks['2026-01-01'] = [{ id: 1, text: 'Local task', status: 'pending' }];
    remote.tasks['2026-01-02'] = [{ id: 1, text: 'Remote task', status: 'completed' }];

    const merged = mergeStates(local, remote);

    expect(Object.values(merged.tasks).flat()).toHaveLength(1);
    expect(merged.tasks['2026-01-01']).toEqual([{ id: 1, text: 'Local task', status: 'pending' }]);
  });

  it('merges unique tasks from both sides, local wins for duplicate ids', () => {
    const local = cloneState();
    const remote = cloneState();

    local.tasks['2026-01-01'] = [
      { id: 1, text: 'Local only', status: 'pending' },
      { id: 2, text: 'Shared', status: 'pending' },
    ];
    remote.tasks['2026-01-02'] = [
      { id: 2, text: 'Shared', status: 'completed' },
      { id: 3, text: 'Remote only', status: 'pending' },
    ];

    const merged = mergeStates(local, remote);

    const mergedTasks = Object.values(merged.tasks).flat().sort((a, b) => a.id - b.id);
    expect(mergedTasks).toEqual([
      { id: 1, text: 'Local only', status: 'pending' },
      { id: 2, text: 'Shared', status: 'pending' },
      { id: 3, text: 'Remote only', status: 'pending' },
    ]);
  });

  it('merges overdue by id, local wins', () => {
    const local = cloneState();
    const remote = cloneState();

    local.overdue = [{ id: 1, text: 'Local overdue', from: 'Monday' }];
    remote.overdue = [
      { id: 1, text: 'Local overdue', from: 'Monday' },
      { id: 2, text: 'Remote overdue', from: 'Tuesday' },
    ];

    const merged = mergeStates(local, remote);
    expect(merged.overdue).toHaveLength(2);
    expect(merged.overdue.map((o) => o.id)).toEqual([1, 2]);
  });

  it('merges goals by id, local wins', () => {
    const local = cloneState();
    const remote = cloneState();

    local.goals = [{ id: 1, emoji: '🏃', title: 'Run', progress: 50, deadline: 'Dec 2026', notes: '', milestones: [] }];
    remote.goals = [
      { id: 1, emoji: '🏃', title: 'Run changed', progress: 100, deadline: 'Dec 2026', notes: '', milestones: [] },
      { id: 2, emoji: '📚', title: 'Read', progress: 30, deadline: 'Dec 2026', notes: '', milestones: [] },
    ];

    const merged = mergeStates(local, remote);
    expect(merged.goals).toHaveLength(2);
    const goal1 = merged.goals.find((g) => g.id === 1);
    expect(goal1?.title).toBe('Run');
  });

  it('merges habits by id, local wins', () => {
    const local = cloneState();
    const remote = cloneState();

    local.habits = [{ id: 1, icon: '💪', name: 'Exercise', streak: 5, log: [1, 0, 1, 0, 1, 0, 1] }];
    remote.habits = [
      { id: 1, icon: '💪', name: 'Exercise', streak: 10, log: [1, 1, 1, 1, 1, 1, 1] },
      { id: 2, icon: '🧘', name: 'Meditate', streak: 3, log: [0, 0, 1, 0, 0, 1, 0] },
    ];

    const merged = mergeStates(local, remote);
    expect(merged.habits).toHaveLength(2);
    const habit1 = merged.habits.find((h) => h.id === 1);
    expect(habit1?.streak).toBe(5);
  });

  it('merges reflections by week, remote wins', () => {
    const local = cloneState();
    const remote = cloneState();

    local.reflections = [{ week: 'June 9–15, 2026', well: 'Local well', improve: '', win: '', focus: '' }];
    remote.reflections = [{ week: 'June 9–15, 2026', well: 'Remote well', improve: '', win: '', focus: '' }];

    const merged = mergeStates(local, remote);
    expect(merged.reflections).toHaveLength(1);
    expect(merged.reflections[0].well).toBe('Remote well');
  });

  it('combines unique reflections from both sides', () => {
    const local = cloneState();
    const remote = cloneState();

    local.reflections = [{ week: 'Week A', well: 'A-local', improve: '', win: '', focus: '' }];
    remote.reflections = [{ week: 'Week B', well: 'B-remote', improve: '', win: '', focus: '' }];

    const merged = mergeStates(local, remote);
    expect(merged.reflections).toHaveLength(2);
  });

  it('takes max of nextTaskId, nextGoalId, nextHabitId', () => {
    const local = cloneState();
    const remote = cloneState();

    local.tasks['2026-06-01'] = [{ id: 99, text: 'dummy', status: 'pending' }];
    local.nextTaskId = 100;
    remote.nextTaskId = 200;
    local.nextGoalId = 300;
    remote.nextGoalId = 150;
    local.nextHabitId = 50;
    remote.nextHabitId = 75;

    const merged = mergeStates(local, remote);
    expect(merged.nextTaskId).toBe(200);
    expect(merged.nextGoalId).toBe(300);
    expect(merged.nextHabitId).toBe(75);
  });

  it('preserves fields not explicitly merged (completed, deletedTasks, etc.)', () => {
    const local = cloneState();
    const remote = cloneState();

    local.tasks['2026-06-01'] = [{ id: 99, text: 'dummy', status: 'pending' }];
    local.completed = [{ id: 1, text: 'Done', day: 'Monday' }];
    local.deletedTasks = [{ id: 1, text: 'Deleted task', dateKey: '2026-01-01', status: 'pending', deletedAt: 100 }];
    local.motivation = 'Keep going';
    local.settings.colorTheme = 'rose';

    const merged = mergeStates(local, remote);
    expect(merged.completed).toEqual([{ id: 1, text: 'Done', day: 'Monday' }]);
    expect(merged.deletedTasks).toEqual([{ id: 1, text: 'Deleted task', dateKey: '2026-01-01', status: 'pending', deletedAt: 100 }]);
    expect(merged.motivation).toBe('Keep going');
    expect(merged.settings.colorTheme).toBe('rose');
  });
});
