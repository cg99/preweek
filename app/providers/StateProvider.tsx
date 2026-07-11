'use client';

import { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { AppState, Task, OverdueTask, Goal, Habit, Reflection } from '@/lib/appState';
import { DEFAULT_APP_STATE, STORAGE_KEY } from '@/lib/appState';
import { formatDateKey, parseDateKey } from '@/lib/constants';
import { mergeStates as mergeAppStates } from '@/lib/sync';
import { applyAutoCarry } from '@/lib/applyAutoCarry';

type SyncStatus = 'idle' | 'syncing' | 'error';

interface AppStateContextValue {
  state: AppState | null;
  setState: (state: AppState) => void;
  isLoading: boolean;
  session: { user: { id: string; email?: string } } | null;
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<string | null>;
  syncStatus: SyncStatus;
  syncError: string | null;
  clearSyncError: () => void;
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
  for (const [dateKey, tasks] of Object.entries(state.tasks)) {
    const dayOfWeek = parseDateKey(dateKey).getDay();
    for (const t of tasks) {
      taskRows.push({ id: t.id, user_id: userId, day_index: dayOfWeek, text: t.text, status: t.status });
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
  if (state.goals.length > 0) {
    await supabase.from('goals').insert(
      state.goals.map((g, i) => ({ id: g.id, user_id: userId, emoji: g.emoji, title: g.title, progress: g.progress, deadline: g.deadline, notes: g.notes, sort_order: i })),
    );
    const allMilestones = state.goals.flatMap((g) =>
      g.milestones.map((m, mi) => ({ goal_id: g.id, text: m.text, done: m.done, sort_order: mi })),
    );
    if (allMilestones.length > 0) {
      await supabase.from('goal_milestones').insert(allMilestones);
    }
  }

  const habitIds = state.habits.map((h) => h.id);
  if (habitIds.length > 0) {
    await supabase.from('habit_logs').delete().in('habit_id', habitIds);
  }
  await supabase.from('habits').delete().eq('user_id', userId);
  if (state.habits.length > 0) {
    const weekStart = getWeekStart();
    await supabase.from('habits').insert(
      state.habits.map((h, i) => ({ id: h.id, user_id: userId, icon: h.icon, name: h.name, sort_order: i })),
    );
    const allLogRows = state.habits.flatMap((h) =>
      h.log.map((val, dayIdx) => ({
        habit_id: h.id,
        day_index: dayIdx,
        value: val,
        week_start: weekStart,
      })).filter((r) => r.value === 1),
    );
    if (allLogRows.length > 0) {
      await supabase.from('habit_logs').insert(allLogRows);
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

  if (!settingsData && tasksData.length === 0 && goalsData.length === 0 && habitsData.length === 0 && reflectionsData.length === 0) {
    return null;
  }

  const tasks: Record<string, Task[]> = {};
  for (const t of tasksData) {
    let dateKey: string;
    if (t.date_key) {
      dateKey = t.date_key as string;
    } else {
      const today = new Date();
      const d = new Date(today);
      d.setDate(today.getDate() - today.getDay() + t.day_index);
      dateKey = formatDateKey(d);
    }
    tasks[dateKey] = tasks[dateKey] || [];
    tasks[dateKey].push({ id: t.id, text: t.text, status: t.status });
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
    deletedTasks: [],
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
      const today = new Date();
      const todayIdx = today.getDay();
      if (parsed.habits) {
        for (const habit of parsed.habits) {
          if (habit.log) {
            for (let i = todayIdx + 1; i < 7; i++) {
              habit.log[i] = 0;
            }
          }
        }
      }
      // Migrate old numeric-keyed tasks to date keys
      if (parsed.tasks && Object.keys(parsed.tasks).some((key) => /^\d+$/.test(key))) {
        const oldTasks: Record<string, Task[]> = {};
        for (const [key, value] of Object.entries(parsed.tasks)) {
          if (/^\d+$/.test(key)) {
            const numericKey = Number(key);
            if (Number.isFinite(numericKey)) {
              const d = new Date(today);
              d.setDate(today.getDate() + (numericKey - 2));
              oldTasks[formatDateKey(d)] = value as Task[];
            }
          } else {
            oldTasks[key] = value as Task[];
          }
        }
        parsed.tasks = oldTasks;
      }
      // Migrate old deleted tasks with dayIndex to dateKey
      if (parsed.deletedTasks) {
        for (const dt of parsed.deletedTasks) {
          if (dt.dateKey === undefined && dt.dayIndex !== undefined) {
            const d = new Date(today);
            d.setDate(today.getDate() + (dt.dayIndex - 2));
            dt.dateKey = formatDateKey(d);
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


async function syncDelta(oldState: AppState, newState: AppState, userId: string) {
  const supabase = createClient();

  async function q(p: PromiseLike<{ data: unknown; error: unknown }>, label: string): Promise<void> {
    const { error } = await p;
    if (error) throw new Error(`[sync] ${label}: ${(error as { message: string }).message}`);
  }

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
    await q(supabase.from('settings').upsert(settingsRow), 'settings upsert fallback');
  }

  // Motivation
  await q(supabase.from('motivations').upsert({
    user_id: userId,
    text: newState.motivation,
    updated_at: new Date().toISOString(),
  }), 'motivation upsert');

  // Tasks + Overdue — compute diffs once, try atomic RPC, fall back to sequential
  const oldTaskIds = new Set(Object.values(oldState.tasks).flat().map((t) => t.id));
  const newTaskIds = new Set(Object.values(newState.tasks).flat().map((t) => t.id));
  const toDeleteAll = Array.from(oldTaskIds).filter((id) => !newTaskIds.has(id));
  const tasksUpsert = Object.entries(newState.tasks).flatMap(([dateKey, tasks]) =>
    tasks.map((t) => ({ id: t.id, user_id: userId, day_index: parseDateKey(dateKey).getDay(), text: t.text, status: t.status }))
  );
  const newOverdueIds = new Set(newState.overdue.map((o) => o.id));
  const overdueDelete = oldState.overdue.filter((o) => !newOverdueIds.has(o.id)).map((o) => o.id);
  const overdueUpsert = newState.overdue.map((o) => ({ id: o.id, user_id: userId, text: o.text, from_day: o.from }));

  let rpcOk = false;
  try {
    const { error: rpcErr } = await supabase.rpc('sync_tasks_overdue', {
      p_user_id: userId,
      p_tasks_upsert: JSON.stringify(tasksUpsert),
      p_tasks_delete: toDeleteAll,
      p_overdue_upsert: JSON.stringify(overdueUpsert),
      p_overdue_delete: overdueDelete,
    });
    if (!rpcErr) {
      rpcOk = true;
    } else if (
      typeof rpcErr.message === 'string'
      && rpcErr.message.includes('function')
      && (rpcErr.message.includes('not found') || rpcErr.message.includes('does not exist'))
    ) {
      // RPC not deployed — fall through to sequential
    } else {
      throw new Error(`[sync] tasks RPC: ${rpcErr.message}`);
    }
  } catch (e) {
    if (e instanceof Error && (e.message.includes('function') || e.message.includes('does not exist'))) {
      // RPC not deployed — fall through to sequential
    } else {
      throw e;
    }
  }

  if (!rpcOk) {
    // Sequential fallback — delete any removed tasks by id and upsert all current tasks.
    if (toDeleteAll.length > 0) {
      await q(supabase.from('tasks').delete().in('id', toDeleteAll).eq('user_id', userId), 'tasks delete');
    }
    if (tasksUpsert.length > 0) {
      await q(supabase.from('tasks').upsert(tasksUpsert), 'tasks upsert');
    }
    // Overdue
    if (overdueDelete.length > 0) {
      await q(supabase.from('overdue_tasks').delete().in('id', overdueDelete).eq('user_id', userId), 'overdue delete');
    }
    if (overdueUpsert.length > 0) {
      await q(supabase.from('overdue_tasks').upsert(overdueUpsert), 'overdue upsert');
    }
  }

  // Goals — diff by id
  {
    const newIds = new Set(newState.goals.map((g) => g.id));
    const toDelete = oldState.goals.filter((g) => !newIds.has(g.id)).map((g) => g.id);
    if (toDelete.length > 0) {
      await q(supabase.from('goal_milestones').delete().in('goal_id', toDelete), 'goal_milestones delete');
      await q(supabase.from('goals').delete().in('id', toDelete).eq('user_id', userId), 'goals delete');
    }
    for (const g of newState.goals) {
      const oldG = oldState.goals.find((og) => og.id === g.id);
      if (oldG) {
        const changed = oldG.emoji !== g.emoji || oldG.title !== g.title || oldG.progress !== g.progress || oldG.deadline !== g.deadline || oldG.notes !== g.notes;
        const milestoneChanged = JSON.stringify(oldG.milestones) !== JSON.stringify(g.milestones);
        if (changed) {
          await q(supabase.from('goals').update({ emoji: g.emoji, title: g.title, progress: g.progress, deadline: g.deadline, notes: g.notes }).eq('id', g.id).eq('user_id', userId), `goals update ${g.id}`);
        }
        if (milestoneChanged) {
          await q(supabase.from('goal_milestones').delete().eq('goal_id', g.id), `goal_milestones delete ${g.id}`);
          if (g.milestones.length > 0) {
            await q(supabase.from('goal_milestones').insert(g.milestones.map((m, mi) => ({ goal_id: g.id, text: m.text, done: m.done, sort_order: mi }))), `goal_milestones insert ${g.id}`);
          }
        }
      } else {
        await q(supabase.from('goals').insert({ id: g.id, user_id: userId, emoji: g.emoji, title: g.title, progress: g.progress, deadline: g.deadline, notes: g.notes }), `goals insert ${g.id}`);
        if (g.milestones.length > 0) {
          await q(supabase.from('goal_milestones').insert(g.milestones.map((m, mi) => ({ goal_id: g.id, text: m.text, done: m.done, sort_order: mi }))), `goal_milestones insert ${g.id}`);
        }
      }
    }
  }

  // Habits — diff by id
  {
    const newIds = new Set(newState.habits.map((h) => h.id));
    const toDelete = oldState.habits.filter((h) => !newIds.has(h.id)).map((h) => h.id);
    if (toDelete.length > 0) {
      await q(supabase.from('habit_logs').delete().in('habit_id', toDelete), 'habit_logs delete');
      await q(supabase.from('habits').delete().in('id', toDelete).eq('user_id', userId), 'habits delete');
    }
    for (const h of newState.habits) {
      const oldH = oldState.habits.find((oh) => oh.id === h.id);
      if (oldH) {
        const changed = oldH.icon !== h.icon || oldH.name !== h.name;
        const logChanged = JSON.stringify(oldH.log) !== JSON.stringify(h.log);
        if (changed) {
          await q(supabase.from('habits').update({ icon: h.icon, name: h.name }).eq('id', h.id).eq('user_id', userId), `habits update ${h.id}`);
        }
        if (logChanged) {
          const weekStart = getWeekStart();
          await q(supabase.from('habit_logs').delete().eq('habit_id', h.id).eq('week_start', weekStart), `habit_logs delete ${h.id}`);
          const logRows = h.log.map((val, dayIdx) => ({
            habit_id: h.id,
            day_index: dayIdx,
            value: val,
            week_start: weekStart,
          })).filter((r) => r.value === 1);
          if (logRows.length > 0) {
            await q(supabase.from('habit_logs').insert(logRows), `habit_logs insert ${h.id}`);
          }
        }
      } else {
        await q(supabase.from('habits').insert({ id: h.id, user_id: userId, icon: h.icon, name: h.name }), `habits insert ${h.id}`);
        const weekStart = getWeekStart();
        const logRows = h.log.map((val, dayIdx) => ({
          habit_id: h.id,
          day_index: dayIdx,
          value: val,
          week_start: weekStart,
        })).filter((r) => r.value === 1);
        if (logRows.length > 0) {
          await q(supabase.from('habit_logs').insert(logRows), `habit_logs insert ${h.id}`);
        }
      }
    }
  }

  // Reflections — diff by week (upsert by unique constraint on (user_id, week))
  for (const r of newState.reflections) {
    const oldR = oldState.reflections.find((or) => or.week === r.week);
    if (!oldR || oldR.well !== r.well || oldR.improve !== r.improve || oldR.win !== r.win || oldR.focus !== r.focus) {
      await q(supabase.from('reflections').upsert({ user_id: userId, week: r.week, well: r.well, improve: r.improve, win: r.win, focus: r.focus }, { onConflict: 'user_id, week' }), `reflections upsert ${r.week}`);
    }
  }
  for (const r of oldState.reflections) {
    if (!newState.reflections.find((nr) => nr.week === r.week)) {
      await q(supabase.from('reflections').delete().eq('user_id', userId).eq('week', r.week), `reflections delete ${r.week}`);
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

  // Hydrate from localStorage on mount. Server + client both render null initially,
  // so there's no hydration mismatch. The effect runs once on the client.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocalState(applyAutoCarry(loadLocalState() || createDefaultState()));
  }, []);
  const [session, setSession] = useState<{ user: { id: string; email?: string } } | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [syncError, setSyncErrorMsg] = useState<string | null>(null);
  const syncingRef = useRef(false);
  const stateRef = useRef<AppState | null>(null);

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
          setLocalState((prev) => applyAutoCarry(mergeAppStates(prev, remote)));
        } else {
          setLocalState((prev) => (prev ? applyAutoCarry(prev) : prev));
        }
      } else {
        setLocalState((prev) => (prev ? applyAutoCarry(prev) : prev));
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

  const clearSyncError = useCallback(() => {
    setSyncErrorMsg(null);
    setSyncStatus('idle');
  }, []);

  // setState: optimistic local update, syncs delta to Supabase if signed in
  const setState = useCallback((newState: AppState) => {
    const oldState = stateRef.current;
    setLocalState(newState);
    if (session && oldState && !syncingRef.current) {
      syncingRef.current = true;
      setSyncStatus('syncing');
      setSyncErrorMsg(null);
      syncDelta(oldState, newState, session.user.id).then(() => {
        setSyncStatus('idle');
        setSyncErrorMsg(null);
      }).catch((e: Error) => {
        console.error('syncDelta failed:', e);
        setSyncStatus('error');
        setSyncErrorMsg('Connection lost — changes saved locally');
      }).finally(() => { syncingRef.current = false; });
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
      const merged = applyAutoCarry(mergeAppStates(currentState, remoteState));
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

    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const currentState = stateRef.current || createDefaultState();
      await persistFullState(session.user.id, currentState);
    }
    return null;
  }, []);

  const signOut = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    const fresh = createDefaultState();
    setLocalState(fresh);
    stateRef.current = fresh;
  }, []);

  const resetPassword = useCallback(async (email: string): Promise<string | null> => {
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback`,
    });
    return error ? error.message : null;
  }, []);

  return (
    <AppStateContext.Provider value={{ state, setState, isLoading: false, session, signIn, signUp, signOut, resetPassword, syncStatus, syncError, clearSyncError }}>
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
