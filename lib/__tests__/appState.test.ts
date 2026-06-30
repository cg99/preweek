import { describe, it, expect } from 'vitest';
import { DEFAULT_APP_STATE, STORAGE_KEY } from '@/lib/appState';

describe('appState', () => {
  it('STORAGE_KEY is set', () => {
    expect(STORAGE_KEY).toBe('preweekAppState');
  });

  it('DEFAULT_APP_STATE has all required sections', () => {
    const state = structuredClone(DEFAULT_APP_STATE);
    expect(state.tasks).toBeDefined();
    expect(state.overdue).toBeDefined();
    expect(state.completed).toBeDefined();
    expect(state.goals).toBeDefined();
    expect(state.habits).toBeDefined();
    expect(state.reflections).toBeDefined();
  });

  it('tasks are keyed by 0-6', () => {
    const keys = Object.keys(DEFAULT_APP_STATE.tasks).map(Number);
    expect(keys.every((k) => k >= 0 && k <= 6)).toBe(true);
  });

  it('goals have correct structure', () => {
    for (const goal of DEFAULT_APP_STATE.goals) {
      expect(goal).toHaveProperty('id');
      expect(goal).toHaveProperty('emoji');
      expect(goal).toHaveProperty('title');
      expect(goal).toHaveProperty('progress');
      expect(goal).toHaveProperty('deadline');
      expect(goal).toHaveProperty('milestones');
      for (const m of goal.milestones) {
        expect(m).toHaveProperty('text');
        expect(m).toHaveProperty('done');
      }
    }
  });

  it('habits have 7-day logs', () => {
    for (const habit of DEFAULT_APP_STATE.habits) {
      expect(habit.log).toHaveLength(7);
      expect(habit.log.every((v) => v === 0 || v === 1)).toBe(true);
    }
  });

  it('next IDs are positive', () => {
    expect(DEFAULT_APP_STATE.nextTaskId).toBeGreaterThan(0);
    expect(DEFAULT_APP_STATE.nextGoalId).toBeGreaterThan(0);
    expect(DEFAULT_APP_STATE.nextHabitId).toBeGreaterThan(0);
  });

  it('deep cloning preserves structure', () => {
    const clone = structuredClone(DEFAULT_APP_STATE);
    expect(clone).toEqual(DEFAULT_APP_STATE);
    clone.tasks[1].push({ id: 999, text: 'test', status: 'pending' });
    expect(DEFAULT_APP_STATE.tasks[1]).toHaveLength(0); // original unchanged
  });
});
