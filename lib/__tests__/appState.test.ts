import { describe, it, expect } from 'vitest';
import { DEFAULT_APP_STATE, STORAGE_KEY, generateOfflineId } from '@/lib/appState';

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

  it('tasks default to an empty date-keyed map', () => {
    expect(Object.keys(DEFAULT_APP_STATE.tasks)).toHaveLength(0);
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

  it('generateOfflineId produces unique positive IDs', () => {
    const ids = new Set<number>();
    for (let i = 0; i < 10; i++) {
      const id = generateOfflineId();
      expect(id).toBeGreaterThan(0);
      expect(ids.has(id)).toBe(false);
      ids.add(id);
    }
  });

  it('deep cloning preserves structure', () => {
    const clone = structuredClone(DEFAULT_APP_STATE);
    expect(clone).toEqual(DEFAULT_APP_STATE);
    clone.tasks['2025-01-01'] = [{ id: 999, text: 'test', status: 'pending' }];
    expect(DEFAULT_APP_STATE.tasks['2025-01-01']).toBeUndefined();
  });
});
