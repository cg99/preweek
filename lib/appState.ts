// lib/appState.ts

// --- Task Interface ---
export interface Task {
  id: number;
  text: string;
  status: 'pending' | 'completed' | 'overdue' | 'rescheduled';
  dayIndex?: number; // 0 for Sunday, 1 for Monday, ..., 6 for Saturday
}

// --- Overdue Task Interface ---
export interface OverdueTask {
  id: number;
  text: string;
  from: string; // Day name (e.g., "Monday")
}

// --- Completed Task Interface ---
export interface CompletedTask {
  id: number;
  text: string;
  day: string; // Day name (e.g., "Tuesday")
}

// --- Goal Interface ---
export interface Milestone {
  text: string;
  done: boolean;
}

export interface Goal {
  id: number;
  emoji: string;
  title: string;
  progress: number; // Percentage 0-100
  deadline: string; // e.g., "Dec 2026"
  notes: string;
  milestones: Milestone[];
}

// --- Habit Interface ---
export interface Habit {
  id: number;
  icon: string; // emoji
  name: string;
  streak: number;
  log: number[]; // 7 elements: 0 or 1 for each day of week (0=not done, 1=done)
}

// --- Reflection Interface ---
export interface Reflection {
  week: string; // e.g., "June 9–15, 2026"
  well: string;
  improve: string;
  win: string;
  focus: string;
}

// --- Central App State ---
export interface AppState {
  tasks: Record<number, Task[]>; // Keyed by dayIndex (0-6)
  overdue: OverdueTask[];
  completed: CompletedTask[];
  goals: Goal[];
  habits: Habit[];
  reflections: Reflection[];
  nextTaskId: number;
  nextGoalId: number;
  nextHabitId: number;
  completedExpanded: boolean;
  motivation: string;
  settings: {
    showAspirations: boolean;
    showPractices: boolean;
    showReflections: boolean;
    theme: 'light' | 'dark';
    colorTheme: 'warm' | 'sage' | 'sky' | 'rose' | 'slate';
  };
}

// --- Local Storage Keys ---
export const STORAGE_KEY = 'preweekAppState';

// --- Default State ---
export const DEFAULT_APP_STATE: AppState = {
  tasks: {
    0: [],
    1: [],
    2: [],
    3: [],
    4: [],
    5: [],
    6: [],
  },
  overdue: [],
  completed: [],
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
};
