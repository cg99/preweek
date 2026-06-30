import { createClient } from '@/lib/supabase/client';

// --- HELPERS ---

function getWeekStart(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day;
  const start = new Date(d.setDate(diff));
  return start.toISOString().split('T')[0];
}

// --- SETTINGS ---

export async function getSettings(userId: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from('settings')
    .select('*')
    .eq('user_id', userId)
    .single();
  return data;
}

export async function upsertSettings(
  userId: string,
  settings: { show_aspirations?: boolean; show_practices?: boolean; show_reflections?: boolean; theme?: string },
) {
  const supabase = createClient();
  return supabase.from('settings').upsert({ user_id: userId, ...settings });
}

// --- MOTIVATION ---

export async function getMotivation(userId: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from('motivations')
    .select('text')
    .eq('user_id', userId)
    .single();
  return data?.text || '';
}

export async function upsertMotivation(userId: string, text: string) {
  const supabase = createClient();
  return supabase
    .from('motivations')
    .upsert({ user_id: userId, text, updated_at: new Date().toISOString() });
}

// --- TASKS ---

export async function getTasks(userId: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .order('sort_order');
  return data || [];
}

export async function addTask(
  userId: string,
  dayIndex: number,
  text: string,
  sortOrder: number,
) {
  const supabase = createClient();
  const { data } = await supabase
    .from('tasks')
    .insert({ user_id: userId, day_index: dayIndex, text, sort_order: sortOrder })
    .select()
    .single();
  return data;
}

export async function updateTaskStatus(taskId: number, status: 'pending' | 'completed') {
  const supabase = createClient();
  return supabase
    .from('tasks')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', taskId);
}

export async function updateTaskDay(taskId: number, dayIndex: number) {
  const supabase = createClient();
  return supabase
    .from('tasks')
    .update({ day_index: dayIndex, updated_at: new Date().toISOString() })
    .eq('id', taskId);
}

export async function deleteTask(taskId: number) {
  const supabase = createClient();
  return supabase.from('tasks').delete().eq('id', taskId);
}

// --- OVERDUE TASKS ---

export async function getOverdueTasks(userId: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from('overdue_tasks')
    .select('*')
    .eq('user_id', userId);
  return data || [];
}

export async function addOverdueTask(userId: string, text: string, fromDay: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from('overdue_tasks')
    .insert({ user_id: userId, text, from_day: fromDay })
    .select()
    .single();
  return data;
}

export async function deleteOverdueTask(taskId: number) {
  const supabase = createClient();
  return supabase.from('overdue_tasks').delete().eq('id', taskId);
}

// --- GOALS ---

export async function getGoals(userId: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from('goals')
    .select('*, goal_milestones(*)')
    .eq('user_id', userId)
    .order('sort_order');
  return data || [];
}

export async function addGoal(
  userId: string,
  emoji: string,
  title: string,
  deadline: string,
  sortOrder: number,
) {
  const supabase = createClient();
  const { data } = await supabase
    .from('goals')
    .insert({ user_id: userId, emoji, title, deadline, sort_order: sortOrder })
    .select()
    .single();
  return data;
}

export async function updateGoal(
  goalId: number,
  updates: { emoji?: string; title?: string; deadline?: string; notes?: string; progress?: number },
) {
  const supabase = createClient();
  return supabase
    .from('goals')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', goalId);
}

export async function deleteGoal(goalId: number) {
  const supabase = createClient();
  return supabase.from('goals').delete().eq('id', goalId);
}

// --- MILESTONES ---

export async function addMilestone(goalId: number, text: string, sortOrder: number) {
  const supabase = createClient();
  const { data } = await supabase
    .from('goal_milestones')
    .insert({ goal_id: goalId, text, sort_order: sortOrder })
    .select()
    .single();
  return data;
}

export async function toggleMilestone(milestoneId: number, done: boolean) {
  const supabase = createClient();
  return supabase.from('goal_milestones').update({ done }).eq('id', milestoneId);
}

export async function deleteMilestone(milestoneId: number) {
  const supabase = createClient();
  return supabase.from('goal_milestones').delete().eq('id', milestoneId);
}

// --- HABITS ---

export async function getHabits(userId: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from('habits')
    .select('*, habit_logs(*)')
    .eq('user_id', userId)
    .order('sort_order');
  return data || [];
}

export async function addHabit(userId: string, icon: string, name: string, sortOrder: number) {
  const supabase = createClient();
  const { data } = await supabase
    .from('habits')
    .insert({ user_id: userId, icon, name, sort_order: sortOrder })
    .select()
    .single();
  return data;
}

export async function updateHabit(habitId: number, updates: { icon?: string; name?: string }) {
  const supabase = createClient();
  return supabase.from('habits').update(updates).eq('id', habitId);
}

export async function deleteHabit(habitId: number) {
  const supabase = createClient();
  return supabase.from('habits').delete().eq('id', habitId);
}

// --- HABIT LOGS ---

export async function upsertHabitLog(
  habitId: number,
  dayIndex: number,
  value: number,
) {
  const supabase = createClient();
  const weekStart = getWeekStart();
  const { data: existing } = await supabase
    .from('habit_logs')
    .select('id')
    .eq('habit_id', habitId)
    .eq('day_index', dayIndex)
    .eq('week_start', weekStart)
    .maybeSingle();

  if (existing) {
    return supabase
      .from('habit_logs')
      .update({ value })
      .eq('id', existing.id);
  }
  return supabase
    .from('habit_logs')
    .insert({ habit_id: habitId, day_index: dayIndex, value, week_start: weekStart });
}

// --- REFLECTIONS ---

export async function getReflections(userId: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from('reflections')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return data || [];
}

export async function addReflection(
  userId: string,
  week: string,
  well: string,
  improve: string,
  win: string,
  focus: string,
) {
  const supabase = createClient();
  const { data } = await supabase
    .from('reflections')
    .insert({ user_id: userId, week, well, improve, win, focus })
    .select()
    .single();
  return data;
}
