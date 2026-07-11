import { describe, it, expect } from 'vitest';
import { applyAutoCarry } from '@/lib/applyAutoCarry';
import type { AppState } from '@/lib/appState';

function makeState(overrides?: Partial<AppState>): AppState {
  return {
    tasks: {},
    overdue: [],
    completed: [],
    deletedTasks: [],
    goals: [],
    habits: [],
    reflections: [],
    nextTaskId: 1,
    nextGoalId: 1,
    nextHabitId: 1,
    completedExpanded: false,
    motivation: '',
    settings: {
      showAspirations: false,
      showPractices: false,
      showReflections: false,
      theme: 'light',
      colorTheme: 'warm',
    },
    ...overrides,
  };
}

describe('applyAutoCarry', () => {
  it('returns state unchanged when there are no tasks', () => {
    const state = makeState();
    const result = applyAutoCarry(state);
    expect(result).toBe(state);
  });

  it('returns state unchanged when there are no past pending tasks', () => {
    const today = formatDateKey(new Date());
    const state = makeState({
      tasks: {
        [today]: [{ id: 1, text: 'Today task', status: 'pending' }],
      },
    });
    const result = applyAutoCarry(state);
    expect(result).toBe(state);
  });

  it('carries a pending past task into overdue and removes from tasks', () => {
    const yesterday = formatDateKey(new Date(Date.now() - 86400000));
    const state = makeState({
      tasks: {
        [yesterday]: [{ id: 1, text: 'Unfinished', status: 'pending' }],
      },
      nextTaskId: 10,
    });
    const result = applyAutoCarry(state);

    expect(result.tasks[yesterday]).toEqual([]);
    expect(result.overdue).toHaveLength(1);
    expect(result.overdue[0].text).toBe('Unfinished');
    expect(result.overdue[0].id).toBeGreaterThan(0);
    expect(result.nextTaskId).toBeGreaterThan(10);
  });

  it('does not carry completed past tasks', () => {
    const yesterday = formatDateKey(new Date(Date.now() - 86400000));
    const state = makeState({
      tasks: {
        [yesterday]: [
          { id: 1, text: 'Done', status: 'completed' },
        ],
      },
    });
    const result = applyAutoCarry(state);
    expect(result.overdue).toHaveLength(0);
  });

  it('does not carry future tasks', () => {
    const tomorrow = formatDateKey(new Date(Date.now() + 86400000));
    const state = makeState({
      tasks: {
        [tomorrow]: [{ id: 1, text: 'Future task', status: 'pending' }],
      },
    });
    const result = applyAutoCarry(state);
    expect(result.overdue).toHaveLength(0);
    expect(result).toBe(state);
  });

  it('does not create duplicate overdue entry when already carried (existing overdue)', () => {
    const yesterday = formatDateKey(new Date(Date.now() - 86400000));
    const dayName = new Date(yesterday).toLocaleDateString('en-US', { weekday: 'long' });
    const state = makeState({
      tasks: {
        [yesterday]: [{ id: 1, text: 'Unfinished', status: 'pending' }],
      },
      overdue: [{ id: 99, text: 'Unfinished', from: dayName }],
    });
    const result = applyAutoCarry(state);

    expect(result.overdue).toHaveLength(1);
    expect(result.overdue[0].id).toBe(99);
    expect(result.tasks[yesterday]).toEqual([]);
  });

  it('does not re-create overdue when task text is in deletedTasks', () => {
    const yesterday = formatDateKey(new Date(Date.now() - 86400000));
    const state = makeState({
      tasks: {
        [yesterday]: [{ id: 1, text: 'Deleted carry', status: 'pending' }],
      },
      deletedTasks: [
        { id: 99, text: 'Deleted carry', dateKey: yesterday, status: 'pending', deletedAt: Date.now() },
      ],
    });
    const result = applyAutoCarry(state);

    expect(result.overdue).toHaveLength(0);
    expect(result.tasks[yesterday]).toEqual([]);
  });

  it('carries multiple pending past tasks', () => {
    const yesterday = formatDateKey(new Date(Date.now() - 86400000));
    const twoDaysAgo = formatDateKey(new Date(Date.now() - 2 * 86400000));
    const state = makeState({
      tasks: {
        [yesterday]: [{ id: 1, text: 'Task A', status: 'pending' }],
        [twoDaysAgo]: [{ id: 2, text: 'Task B', status: 'pending' }],
      },
    });
    const result = applyAutoCarry(state);

    expect(result.overdue).toHaveLength(2);
    const texts = result.overdue.map((o) => o.text).sort();
    expect(texts).toEqual(['Task A', 'Task B']);
    expect(result.tasks[yesterday]).toEqual([]);
    expect(result.tasks[twoDaysAgo]).toEqual([]);
  });

  it('carries only pending tasks, skipping completed and future', () => {
    const today = formatDateKey(new Date());
    const yesterday = formatDateKey(new Date(Date.now() - 86400000));
    const tomorrow = formatDateKey(new Date(Date.now() + 86400000));
    const state = makeState({
      tasks: {
        [yesterday]: [
          { id: 1, text: 'Carry me', status: 'pending' },
          { id: 2, text: 'Already done', status: 'completed' },
        ],
        [today]: [{ id: 3, text: 'Today task', status: 'pending' }],
        [tomorrow]: [{ id: 4, text: 'Future task', status: 'pending' }],
      },
    });
    const result = applyAutoCarry(state);

    expect(result.overdue).toHaveLength(1);
    expect(result.overdue[0].text).toBe('Carry me');
    expect(result.tasks[yesterday]).toEqual([{ id: 2, text: 'Already done', status: 'completed' }]);
    expect(result.tasks[today]).toEqual([{ id: 3, text: 'Today task', status: 'pending' }]);
    expect(result.tasks[tomorrow]).toEqual([{ id: 4, text: 'Future task', status: 'pending' }]);
  });

  it('preserves existing overdue entries when adding new ones', () => {
    const yesterday = formatDateKey(new Date(Date.now() - 86400000));
    const state = makeState({
      tasks: {
        [yesterday]: [{ id: 1, text: 'New carry', status: 'pending' }],
      },
      overdue: [{ id: 99, text: 'Old overdue', from: 'Monday' }],
    });
    const result = applyAutoCarry(state);

    expect(result.overdue).toHaveLength(2);
    expect(result.overdue.some((o) => o.text === 'Old overdue')).toBe(true);
    expect(result.overdue.some((o) => o.text === 'New carry')).toBe(true);
  });
});
