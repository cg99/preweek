'use client';

import { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { AppState, Task, OverdueTask, Goal, Habit, Reflection } from '@/lib/appState';
import { DEFAULT_APP_STATE, STORAGE_KEY } from '@/lib/appState';

interface AppStateContextValue {
  state: AppState | null;
  setState: (state: AppState) => void;
  isLoading: boolean;
  session: { user: { id: string; email?: string } } | null;
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<string | null>;
}

const AppStateContext = createContext<AppStateContextValue | null>(null);

// --- Persistence helpers ---

function getWeekStart(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day;
  const start = new Date(d.setDate(diff));
  return start.toISOString().split('T')[0];
}

async function persistFullState(userId: string, state: AppState) {
  const supabase = createClient();

  await supabase.from('settings').upsert({
    user_id: userId,
    show_aspirations: state.settings.showAspirations,
    show_practices: state.settings.showPractices,
    show_reflections: state.settings.showReflections,
    theme: state.settings.theme,
    color_theme: state.settings.colorTheme,
  });

  await supabase.from('motivations').upsert({
    user_id: userId,
    text: state.motivation,
    updated_at: new Date().toISOString(),
  });

  const taskRows: Record<string, unknown>[] = [];
  for (const [dayIdx, tasks] of Object.entries(state.tasks)) {
    for (const t of tasks) {
      taskRows.push({ id: t.id, user_id: userId, day_index: Number(dayIdx), text: t.text, status: t.status });
    }
  }
  await supabase.from('tasks').delete().eq('user_id', userId);
  if (taskRows.length > 0) {
    await supabase.from('tasks').insert(taskRows);
  }

  await supabase.from('overdue_tasks').delete().eq('user_id', userId);
  if (state.overdue.length > 0) {
    await supabase.from('overdue_tasks').insert(
      state.overdue.map((o) => ({ id: o.id, user_id: userId, text: o.text, from_day: o.from })),
    );
  }

  const goalIds = state.goals.map((g) => g.id);
  if (goalIds.length > 0) {
    await supabase.from('goal_milestones').delete().in('goal_id', goalIds);
  }
  await supabase.from('goals').delete().eq('user_id', userId);
  for (let i = 0; i < state.goals.length; i++) {
    const g = state.goals[i];
    await supabase
      .from('goals')
      .insert({ id: g.id, user_id: userId, emoji: g.emoji, title: g.title, progress: g.progress, deadline: g.deadline, notes: g.notes, sort_order: i });
    if (g.milestones.length > 0) {
      await supabase.from('goal_milestones').insert(
        g.milestones.map((m, mi) => ({ goal_id: g.id, text: m.text, done: m.done, sort_order: mi })),
      );
    }
  }

  const habitIds = state.habits.map((h) => h.id);
  if (habitIds.length > 0) {
    await supabase.from('habit_logs').delete().in('habit_id', habitIds);
  }
  await supabase.from('habits').delete().eq('user_id', userId);
  const weekStart = getWeekStart();
  for (let i = 0; i < state.habits.length; i++) {
    const h = state.habits[i];
    await supabase
      .from('habits')
      .insert({ id: h.id, user_id: userId, icon: h.icon, name: h.name, sort_order: i });
    const logRows = h.log.map((val, dayIdx) => ({
      habit_id: h.id,
      day_index: dayIdx,
      value: val,
      week_start: weekStart,
    })).filter((r) => r.value === 1);
    if (logRows.length > 0) {
      await supabase.from('habit_logs').insert(logRows);
    }
  }

  await supabase.from('reflections').delete().eq('user_id', userId);
  if (state.reflections.length > 0) {
    await supabase.from('reflections').insert(
      state.reflections.map((r) => ({ user_id: userId, week: r.week, well: r.well, improve: r.improve, win: r.win, focus: r.focus })),
    );
  }
}

async function loadFullState(userId: string): Promise<AppState | null> {
  const supabase = createClient();

  const [settingsData, motivationData, tasksData, overduesData, goalsData, habitsData, reflectionsData] = await Promise.all([
    supabase.from('settings').select('*').eq('user_id', userId).maybeSingle().then((r) => r.data),
    supabase.from('motivations').select('text').eq('user_id', userId).maybeSingle().then((r) => r.data?.text || ''),
    supabase.from('tasks').select('*').eq('user_id', userId).order('sort_order').then((r) => r.data || []),
    supabase.from('overdue_tasks').select('*').eq('user_id', userId).then((r) => r.data || []),
    supabase.from('goals').select('*, goal_milestones(*)').eq('user_id', userId).order('sort_order').then((r) => r.data || []),
    supabase.from('habits').select('*, habit_logs(*)').eq('user_id', userId).order('sort_order').then((r) => r.data || []),
    supabase.from('reflections').select('*').eq('user_id', userId).order('created_at', { ascending: false }).then((r) => r.data || []),
  ]);

  if (!settingsData && tasksData.length === 0 && goalsData.length === 0 && habitsData.length === 0) {
    return null;
  }

  const tasks: Record<number, Task[]> = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
  for (const t of tasksData) {
    tasks[t.day_index] = tasks[t.day_index] || [];
    tasks[t.day_index].push({ id: t.id, text: t.text, status: t.status });
  }

  const overdue: OverdueTask[] = overduesData.map((o: { id: number; text: string; from_day: string }) => ({
    id: o.id,
    text: o.text,
    from: o.from_day,
  }));

  const goals: Goal[] = goalsData.map((g: Record<string, unknown>) => ({
    id: g.id as number,
    emoji: g.emoji as string,
    title: g.title as string,
    progress: g.progress as number,
    deadline: g.deadline as string,
    notes: g.notes as string,
    milestones: ((g.goal_milestones as Record<string, unknown>[]) || []).map((m: Record<string, unknown>) => ({
      text: m.text as string,
      done: m.done as boolean,
    })),
  }));

  const weekStart = getWeekStart();
  const habits: Habit[] = habitsData.map((h: Record<string, unknown>) => {
    const logs = (h.habit_logs as Record<string, unknown>[]) || [];
    const log: number[] = [0, 0, 0, 0, 0, 0, 0];
    for (const l of logs) {
      if (l.week_start === weekStart) {
        log[l.day_index as number] = l.value as number;
      }
    }
    return {
      id: h.id as number,
      icon: h.icon as string,
      name: h.name as string,
      streak: 0,
      log,
    };
  });

  const reflections: Reflection[] = reflectionsData.map((r: Record<string, unknown>) => ({
    week: r.week as string,
    well: r.well as string,
    improve: r.improve as string,
    win: r.win as string,
    focus: r.focus as string,
  }));

  const maxTaskId = tasksData.reduce((max: number, t: { id: number }) => Math.max(max, t.id), 0);
  const maxGoalId = goalsData.reduce((max: number, g: { id: number }) => Math.max(max, g.id), 0);
  const maxHabitId = habitsData.reduce((max: number, h: { id: number }) => Math.max(max, h.id), 0);

  return {
    tasks,
    overdue,
    completed: [],
    goals,
    habits,
    reflections,
    nextTaskId: maxTaskId + 1,
    nextGoalId: maxGoalId + 1,
    nextHabitId: maxHabitId + 1,
    completedExpanded: false,
    motivation: motivationData,
    settings: {
      showAspirations: settingsData?.show_aspirations ?? DEFAULT_APP_STATE.settings.showAspirations,
      showPractices: settingsData?.show_practices ?? DEFAULT_APP_STATE.settings.showPractices,
      showReflections: settingsData?.show_reflections ?? DEFAULT_APP_STATE.settings.showReflections,
      theme: settingsData?.theme ?? DEFAULT_APP_STATE.settings.theme,
      colorTheme: settingsData?.color_theme ?? DEFAULT_APP_STATE.settings.colorTheme,
    },
  };
}

// --- Load/save localStorage ---

function loadLocalState(): AppState | null {
  try {
    if (typeof localStorage === 'undefined') return null;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
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
      return { ...structuredClone(DEFAULT_APP_STATE), ...parsed, settings: { ...structuredClone(DEFAULT_APP_STATE).settings, ...parsed.settings } };
    }
  } catch (error) {
    console.error('Failed to load state:', error);
  }
  return null;
}

function saveLocalState(state: AppState) {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save state:', error);
  }
}

function createDefaultState(): AppState {
  const freshState = structuredClone(DEFAULT_APP_STATE);
  const todayIdx = new Date().getDay();
  for (const habit of freshState.habits) {
    for (let i = todayIdx + 1; i < 7; i++) {
      habit.log[i] = 0;
    }
  }
  return freshState;
}

// --- PROVIDER ---

export function StateProvider({ children }: { children: ReactNode }) {
  const [state, setLocalState] = useState<AppState | null>(null);
  const [session, setSession] = useState<{ user: { id: string; email?: string } } | null>(null);
  const persistingRef = useRef(false);
  const stateRef = useRef<AppState | null>(null);

  // Load from localStorage after hydration (client only)
  useEffect(() => {
    const local = loadLocalState() || createDefaultState();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocalState(local);
  }, []);

  // Keep ref in sync
  useEffect(() => { stateRef.current = state; }, [state]);

  // Check session on mount
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Persist to localStorage on every state change
  useEffect(() => {
    if (state) {
      saveLocalState(state);
    }
  }, [state]);

  // setState: saves locally, and to Supabase if signed in
  const setState = useCallback((newState: AppState) => {
    setLocalState(newState);
    if (session && !persistingRef.current) {
      persistingRef.current = true;
      persistFullState(session.user.id, newState).finally(() => { persistingRef.current = false; });
    }
  }, [session]);

  const signIn = useCallback(async (email: string, password: string): Promise<string | null> => {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return error.message;

    // Upload local data to Supabase
    const currentState = stateRef.current || createDefaultState();
    const remoteState = await loadFullState((await supabase.auth.getSession()).data.session!.user.id);

    if (remoteState) {
      // Merge: prefer local data over remote (local is more recent)
      await persistFullState(session?.user?.id || (await supabase.auth.getSession()).data.session!.user.id, currentState);
    } else {
      await persistFullState((await supabase.auth.getSession()).data.session!.user.id, currentState);
    }
    return null;
  }, [session]);

  const signUp = useCallback(async (email: string, password: string): Promise<string | null> => {
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) return error.message;

    // Wait briefly for the auto-profile trigger, then upload local data
    setTimeout(async () => {
      const currentState = stateRef.current || createDefaultState();
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await persistFullState(session.user.id, currentState);
      }
    }, 2000);
    return null;
  }, []);

  const signOut = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
  }, []);

  const resetPassword = useCallback(async (email: string): Promise<string | null> => {
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback`,
    });
    return error ? error.message : null;
  }, []);

  return (
    <AppStateContext.Provider value={{ state, setState, isLoading: false, session, signIn, signUp, signOut, resetPassword }}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) {
    throw new Error('useAppState must be used within a <StateProvider>');
  }
  return ctx;
}
