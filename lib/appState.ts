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
}

// --- Local Storage Keys ---
export const STORAGE_KEY = 'preweekAppState';

// --- Sample/Default State ---
export const DEFAULT_APP_STATE: AppState = {
  tasks: {
    0: [], // Sunday
    1: [
      { id: 3, text: 'Team standup', status: 'pending' },
      { id: 4, text: 'Review pull requests', status: 'pending' },
    ],
    2: [
      { id: 5, text: 'Dentist appointment', status: 'pending' },
      { id: 6, text: 'Grocery shopping', status: 'pending' },
    ],
    3: [{ id: 7, text: 'Work on game prototype', status: 'pending' }],
    4: [
      { id: 8, text: 'Write blog post', status: 'pending' },
      { id: 9, text: 'Evening run', status: 'pending' },
    ],
    5: [{ id: 10, text: 'Read 30 pages', status: 'pending' }],
    6: [
      { id: 11, text: 'Plan next week', status: 'pending' },
      { id: 12, text: 'Family dinner', status: 'pending' },
    ],
  },
  overdue: [
    { id: 1, text: 'Finish proposal', from: 'Monday' },
    { id: 2, text: 'Call insurance', from: 'Tuesday' },
  ],
  completed: [
    { id: 5, text: 'Grocery shopping', day: 'Tuesday' },
    { id: 6, text: 'Morning workout', day: 'Monday' },
    { id: 7, text: 'Send invoice', day: 'Wednesday' },
  ],
  goals: [
    {
      id: 1,
      emoji: '🎮',
      title: 'Build farming game',
      progress: 60,
      deadline: 'Dec 2026',
      notes: 'Focus on core loop first',
      milestones: [
        { text: 'Game design doc', done: true },
        { text: 'Core mechanics', done: true },
        { text: 'Art style', done: false },
        { text: 'Multiplayer', done: false },
        { text: 'Launch', done: false },
      ],
    },
    {
      id: 2,
      emoji: '💻',
      title: 'Learn Node.js',
      progress: 35,
      deadline: 'Sep 2026',
      notes: 'Following roadmap.sh backend path',
      milestones: [
        { text: 'JS fundamentals', done: true },
        { text: 'Express basics', done: true },
        { text: 'Databases', done: false },
        { text: 'Auth', done: false },
        { text: 'Deploy', done: false },
      ],
    },
    {
      id: 3,
      emoji: '💰',
      title: 'Save $10,000',
      progress: 72,
      deadline: 'Dec 2026',
      notes: 'Automating $800/mo',
      milestones: [
        { text: '$2k milestone', done: true },
        { text: '$5k milestone', done: true },
        { text: '$7.2k now', done: false },
        { text: '$10k target', done: false },
      ],
    },
  ],
  habits: [
    { id: 1, icon: '🏃', name: 'Exercise', streak: 4, log: [1, 1, 0, 1, 1, 0, 0] },
    { id: 2, icon: '📖', name: 'Read', streak: 6, log: [1, 1, 1, 1, 1, 1, 0] },
    { id: 3, icon: '🧘', name: 'Meditate', streak: 2, log: [0, 0, 1, 0, 1, 1, 0] },
    { id: 4, icon: '✍️', name: 'Journal', streak: 3, log: [1, 0, 1, 1, 0, 0, 0] },
  ],
  reflections: [
    {
      week: 'June 9–15, 2026',
      well: 'Shipped the first game demo. Team loved it.',
      improve: 'Need to start tasks earlier in the day.',
      win: 'Presented to 3 investors.',
      focus: 'Node.js backend course.',
    },
    {
      week: 'June 2–8, 2026',
      well: 'Consistent gym attendance. Hit 5 days.',
      improve: 'Phone usage is still too high in evenings.',
      win: 'Paid off credit card.',
      focus: 'Portfolio site redesign.',
    },
  ],
  nextTaskId: 20,
  nextGoalId: 10,
  nextHabitId: 10,
  completedExpanded: false,
};

// --- Initial State Factory ---
const initialAppState: AppState = DEFAULT_APP_STATE;