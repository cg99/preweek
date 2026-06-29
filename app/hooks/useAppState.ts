'use client';

import { useState, useEffect } from 'react';
import { AppState, DEFAULT_APP_STATE, STORAGE_KEY } from '@/lib/appState';

export function useAppState() {
  const [state, setState] = useState<AppState | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize state from localStorage on mount
  useEffect(() => {
    const loadState = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          // Migrate milestone strings to objects if needed
          if (parsed.goals) {
            for (const goal of parsed.goals) {
              if (goal.milestones && goal.milestones.length > 0 && typeof goal.milestones[0] === 'string') {
                goal.milestones = goal.milestones.map((m: string) => ({
                  text: m.replace(' ✓', ''),
                  done: m.includes('✓'),
                }));
              }
            }
          }
          // Zero out habit logs for future days
          const todayIdx = new Date().getDay();
          if (parsed.habits) {
            for (const habit of parsed.habits) {
              if (habit.log) {
                for (let i = todayIdx + 1; i < 7; i++) {
                  habit.log[i] = 0;
                }
              }
            }
          }
          setState(parsed);
        } else {
          const freshState = JSON.parse(JSON.stringify(DEFAULT_APP_STATE));
          const todayIdx = new Date().getDay();
          for (const habit of freshState.habits) {
            for (let i = todayIdx + 1; i < 7; i++) {
              habit.log[i] = 0;
            }
          }
          setState(freshState);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(freshState));
        }
      } catch (error) {
        console.error('Failed to load state:', error);
        const freshState = JSON.parse(JSON.stringify(DEFAULT_APP_STATE));
        const todayIdx = new Date().getDay();
        for (const habit of freshState.habits) {
          for (let i = todayIdx + 1; i < 7; i++) {
            habit.log[i] = 0;
          }
        }
        setState(freshState);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(freshState));
      }
      setIsLoading(false);
    };

    loadState();
  }, []);

  // Persist state to localStorage whenever it changes
  useEffect(() => {
    if (state && !isLoading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state, isLoading]);

  const updateState = (newState: AppState) => {
    setState(newState);
  };

  return { state, setState: updateState, isLoading };
}
