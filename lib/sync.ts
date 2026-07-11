import type { AppState, Task, Reflection } from '@/lib/appState';

function groupTaskEntries(entries: Array<{ dateKey: string; task: Task }>): Record<string, Task[]> {
  const grouped: Record<string, Task[]> = {};
  for (const { dateKey, task } of entries) {
    grouped[dateKey] = grouped[dateKey] || [];
    grouped[dateKey].push(task);
  }
  for (const tasks of Object.values(grouped)) {
    tasks.sort((a, b) => a.id - b.id);
  }
  return grouped;
}

function mergeById<T extends { id: number }>(local: T[], remote: T[]): T[] {
  const merged = new Map<number, T>();
  for (const item of local) {
    merged.set(item.id, item);
  }
  for (const item of remote) {
    if (!merged.has(item.id)) {
      merged.set(item.id, item);
    }
  }
  return Array.from(merged.values());
}

export function mergeStates(local: AppState | null, remote: AppState): AppState {
  if (!local) return remote;

  const emptyLocal = Object.values(local.tasks).every((t) => t.length === 0)
    && local.overdue.length === 0
    && local.goals.length === 0
    && local.habits.length === 0
    && local.reflections.length === 0;
  if (emptyLocal) return remote;

  const taskEntries: Array<{ dateKey: string; task: Task }> = [];
  const seenTaskIds = new Set<number>();

  for (const [dateKey, tasks] of Object.entries(local.tasks)) {
    for (const task of tasks) {
      seenTaskIds.add(task.id);
      taskEntries.push({ dateKey, task });
    }
  }
  for (const [dateKey, tasks] of Object.entries(remote.tasks)) {
    for (const task of tasks) {
      if (seenTaskIds.has(task.id)) continue;
      seenTaskIds.add(task.id);
      taskEntries.push({ dateKey, task });
    }
  }

  return {
    ...local,
    tasks: groupTaskEntries(taskEntries),
    overdue: mergeById(local.overdue, remote.overdue),
    goals: mergeById(local.goals, remote.goals),
    habits: mergeById(local.habits, remote.habits),
    reflections: (() => {
      const weeks = new Set<string>();
      const merged: Reflection[] = [];
      for (const reflection of [...remote.reflections, ...local.reflections]) {
        if (!weeks.has(reflection.week)) {
          weeks.add(reflection.week);
          merged.push(reflection);
        }
      }
      return merged;
    })(),
    nextTaskId: Math.max(local.nextTaskId, remote.nextTaskId),
    nextGoalId: Math.max(local.nextGoalId, remote.nextGoalId),
    nextHabitId: Math.max(local.nextHabitId, remote.nextHabitId),
  };
}
