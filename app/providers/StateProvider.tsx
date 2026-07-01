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

  // Settings — try with color_theme first, fallback to base columns
  const settingsRow: Record<string, unknown> = {
    user_id: userId,
    show_aspirations: state.settings.showAspirations,
    show_practices: state.settings.showPractices,
    show_reflections: state.settings.showReflections,
    theme: state.settings.theme,
  };
  const { error: settingsErr } = await supabase.from('settings').upsert({ ...settingsRow, color_theme: state.settings.colorTheme });
  if (settingsErr) {
    await supabase.from('settings').upsert(settingsRow);
  }

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

function mergeStates(local: AppState | null, remote: AppState): AppState {
  if (!local) return remote;
  const emptyLocal = Object.values(local.tasks).every((t) => t.length === 0)
    && local.overdue.length === 0
    && local.goals.length === 0
    && local.habits.length === 0
    && local.reflections.length === 0;
  if (emptyLocal) return remote;

  // Merge tasks per day — union by id
  const tasks: Record<number, Task[]> = {};
  const allDayKeys = new Set([...Object.keys(local.tasks), ...Object.keys(remote.tasks)]);
  for (const key of allDayKeys) {
    const day = Number(key);
    const localTasks = local.tasks[day] || [];
    const remoteTasks = remote.tasks[day] || [];
    const seen = new Set<number>();
    const merged: Task[] = [];
    for (const t of [...localTasks, ...remoteTasks]) {
      if (!seen.has(t.id)) {
        seen.add(t.id);
        merged.push(t);
      }
    }
    tasks[day] = merged;
  }

  // Merge overdue — union by id
  const overdueIds = new Set<number>();
  const overdue: OverdueTask[] = [];
  for (const o of [...local.overdue, ...remote.overdue]) {
    if (!overdueIds.has(o.id)) {
      overdueIds.add(o.id);
      overdue.push(o);
    }
  }

  // Merge goals — union by id
  const goalIds = new Set<number>();
  const goals: Goal[] = [];
  for (const g of [...local.goals, ...remote.goals]) {
    if (!goalIds.has(g.id)) {
      goalIds.add(g.id);
      goals.push(g);
    }
  }

  // Merge habits — union by id
  const habitIds = new Set<number>();
  const habits: Habit[] = [];
  for (const h of [...local.habits, ...remote.habits]) {
    if (!habitIds.has(h.id)) {
      habitIds.add(h.id);
      habits.push(h);
    }
  }

  // Merge reflections — union by week
  const reflectionWeeks = new Set<string>();
  const reflections: Reflection[] = [];
  for (const r of [...local.reflections, ...remote.reflections]) {
    if (!reflectionWeeks.has(r.week)) {
      reflectionWeeks.add(r.week);
      reflections.push(r);
    }
  }

  return {
    ...local,
    tasks,
    overdue,
    goals,
    habits,
    reflections,
    nextTaskId: Math.max(local.nextTaskId, remote.nextTaskId),
    nextGoalId: Math.max(local.nextGoalId, remote.nextGoalId),
    nextHabitId: Math.max(local.nextHabitId, remote.nextHabitId),
  };
}

async function syncDelta(oldState: AppState, newState: AppState, userId: string) {
  const supabase = createClient();

  // Settings — always upsert
  const settingsRow: Record<string, unknown> = {
    user_id: userId,
    show_aspirations: newState.settings.showAspirations,
    show_practices: newState.settings.showPractices,
    show_reflections: newState.settings.showReflections,
    theme: newState.settings.theme,
  };
  const { error: settingsErr } = await supabase.from('settings').upsert({ ...settingsRow, color_theme: newState.settings.colorTheme });
  if (settingsErr) {
    await supabase.from('settings').upsert(settingsRow);
  }

  // Motivation
  await supabase.from('motivations').upsert({
    user_id: userId,
    text: newState.motivation,
    updated_at: new Date().toISOString(),
  });

  // Tasks per day — compute additions, removals, updates
  for (let dayIdx = 0; dayIdx < 7; dayIdx++) {
    const oldTasks = oldState.tasks[dayIdx] || [];
    const newTasks = newState.tasks[dayIdx] || [];
    const oldIds = new Set(oldTasks.map((t) => t.id));
    const newIds = new Set(newTasks.map((t) => t.id));

    const toDelete = oldTasks.filter((t) => !newIds.has(t.id)).map((t) => t.id);
    if (toDelete.length > 0) {
      await supabase.from('tasks').delete().in('id', toDelete).eq('user_id', userId);
    }

    const toInsert = newTasks.filter((t) => !oldIds.has(t.id));
    if (toInsert.length > 0) {
      await supabase.from('tasks').insert(
        toInsert.map((t) => ({ id: t.id, user_id: userId, day_index: dayIdx, text: t.text, status: t.status })),
      );
    }

    for (const t of newTasks.filter((t) => oldIds.has(t.id))) {
      const oldT = oldTasks.find((ot) => ot.id === t.id);
      if (oldT && (oldT.text !== t.text || oldT.status !== t.status)) {
        await supabase.from('tasks').update({ text: t.text, status: t.status, day_index: dayIdx }).eq('id', t.id).eq('user_id', userId);
      }
    }
  }

  // Overdue tasks — diff by id
  {
    const oldIds = new Set(oldState.overdue.map((o) => o.id));
    const newIds = new Set(newState.overdue.map((o) => o.id));
    const toDelete = oldState.overdue.filter((o) => !newIds.has(o.id)).map((o) => o.id);
    if (toDelete.length > 0) {
      await supabase.from('overdue_tasks').delete().in('id', toDelete).eq('user_id', userId);
    }
    const toInsert = newState.overdue.filter((o) => !oldIds.has(o.id));
    if (toInsert.length > 0) {
      await supabase.from('overdue_tasks').insert(
        toInsert.map((o) => ({ id: o.id, user_id: userId, text: o.text, from_day: o.from })),
      );
    }
  }

  // Goals — diff by id
  {
    const newIds = new Set(newState.goals.map((g) => g.id));
    const toDelete = oldState.goals.filter((g) => !newIds.has(g.id)).map((g) => g.id);
    if (toDelete.length > 0) {
      await supabase.from('goal_milestones').delete().in('goal_id', toDelete);
      await supabase.from('goals').delete().in('id', toDelete).eq('user_id', userId);
    }
    for (const g of newState.goals) {
      const oldG = oldState.goals.find((og) => og.id === g.id);
      if (oldG) {
        const changed = oldG.emoji !== g.emoji || oldG.title !== g.title || oldG.progress !== g.progress || oldG.deadline !== g.deadline || oldG.notes !== g.notes;
        const milestoneChanged = JSON.stringify(oldG.milestones) !== JSON.stringify(g.milestones);
        if (changed) {
          await supabase.from('goals').update({ emoji: g.emoji, title: g.title, progress: g.progress, deadline: g.deadline, notes: g.notes }).eq('id', g.id).eq('user_id', userId);
        }
        if (milestoneChanged) {
          await supabase.from('goal_milestones').delete().eq('goal_id', g.id);
          if (g.milestones.length > 0) {
            await supabase.from('goal_milestones').insert(g.milestones.map((m, mi) => ({ goal_id: g.id, text: m.text, done: m.done, sort_order: mi })));
          }
        }
      } else {
        await supabase.from('goals').insert({ id: g.id, user_id: userId, emoji: g.emoji, title: g.title, progress: g.progress, deadline: g.deadline, notes: g.notes });
        if (g.milestones.length > 0) {
          await supabase.from('goal_milestones').insert(g.milestones.map((m, mi) => ({ goal_id: g.id, text: m.text, done: m.done, sort_order: mi })));
        }
      }
    }
  }

  // Habits — diff by id
  {
    const newIds = new Set(newState.habits.map((h) => h.id));
    const toDelete = oldState.habits.filter((h) => !newIds.has(h.id)).map((h) => h.id);
    if (toDelete.length > 0) {
      await supabase.from('habit_logs').delete().in('habit_id', toDelete);
      await supabase.from('habits').delete().in('id', toDelete).eq('user_id', userId);
    }
    for (const h of newState.habits) {
      const oldH = oldState.habits.find((oh) => oh.id === h.id);
      if (oldH) {
        const changed = oldH.icon !== h.icon || oldH.name !== h.name;
        const logChanged = JSON.stringify(oldH.log) !== JSON.stringify(h.log);
        if (changed) {
          await supabase.from('habits').update({ icon: h.icon, name: h.name }).eq('id', h.id).eq('user_id', userId);
        }
        if (logChanged) {
          const weekStart = getWeekStart();
          await supabase.from('habit_logs').delete().eq('habit_id', h.id).eq('week_start', weekStart);
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
      } else {
        await supabase.from('habits').insert({ id: h.id, user_id: userId, icon: h.icon, name: h.name });
        const weekStart = getWeekStart();
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
    }
  }

  // Reflections — diff by week (upsert by unique constraint on (user_id, week))
  for (const r of newState.reflections) {
    const oldR = oldState.reflections.find((or) => or.week === r.week);
    if (!oldR || oldR.well !== r.well || oldR.improve !== r.improve || oldR.win !== r.win || oldR.focus !== r.focus) {
      await supabase.from('reflections').upsert({ user_id: userId, week: r.week, well: r.well, improve: r.improve, win: r.win, focus: r.focus }, { onConflict: 'user_id, week' });
    }
  }
  for (const r of oldState.reflections) {
    if (!newState.reflections.find((nr) => nr.week === r.week)) {
      await supabase.from('reflections').delete().eq('user_id', userId).eq('week', r.week);
    }
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
  const syncingRef = useRef(false);
  const stateRef = useRef<AppState | null>(null);

  // Load from localStorage after hydration (client only)
  useEffect(() => {
    const local = loadLocalState() || createDefaultState();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocalState(local);
  }, []);

  // Keep ref in sync
  useEffect(() => { stateRef.current = state; }, [state]);

  // Check session on mount and load remote data if signed in
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(async ({ data: { session: s } }) => {
      setSession(s);
      if (s) {
        const remote = await loadFullState(s.user.id);
        if (remote) {
          setLocalState((prev) => mergeStates(prev, remote));
        }
      }
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

  // setState: saves locally, syncs delta to Supabase if signed in
  const setState = useCallback((newState: AppState) => {
    const oldState = stateRef.current;
    setLocalState(newState);
    if (session && oldState && !syncingRef.current) {
      syncingRef.current = true;
      syncDelta(oldState, newState, session.user.id).finally(() => { syncingRef.current = false; });
    }
  }, [session]);

  const signIn = useCallback(async (email: string, password: string): Promise<string | null> => {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return error.message;

    const currentState = stateRef.current || createDefaultState();
    const { data: { session: s } } = await supabase.auth.getSession();
    if (!s) return 'Sign in succeeded but no session returned';

    const userId = s.user.id;
    const remoteState = await loadFullState(userId);

    if (remoteState) {
      const merged = mergeStates(currentState, remoteState);
      if (merged !== currentState) {
        setLocalState(merged);
      }
      try {
        await persistFullState(userId, merged);
      } catch (e) {
        console.error('persist failed on sign-in:', e);
      }
    } else {
      try {
        await persistFullState(userId, currentState);
      } catch (e) {
        console.error('persist failed on sign-in (no remote):', e);
      }
    }
    return null;
  }, []);

  const signUp = useCallback(async (email: string, password: string): Promise<string | null> => {
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) return error.message;

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
