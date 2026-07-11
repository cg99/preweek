import type { AppState } from '@/lib/appState';
import { generateOfflineId } from '@/lib/appState';
import { DAYS, getTodayKey } from '@/lib/constants';

export function applyAutoCarry(state: AppState): AppState {
  const todayKey = getTodayKey();
  const pendingPast: { dateKey: string; taskId: number; text: string }[] = [];
  for (const [dateKey, tasks] of Object.entries(state.tasks)) {
    if (dateKey >= todayKey) continue;
    for (const t of tasks) {
      if (t.status === 'pending') {
        pendingPast.push({ dateKey, taskId: t.id, text: t.text });
      }
    }
  }
  if (pendingPast.length === 0) return state;

  const newState = structuredClone(state);
  for (const item of pendingPast) {
    const dayName = DAYS[new Date(item.dateKey).getDay()];
    const alreadyCarried = newState.overdue.some(o => o.text === item.text && o.from === dayName)
      || newState.deletedTasks.some(dt => dt.text === item.text);
    if (alreadyCarried) {
      for (const dk of Object.keys(newState.tasks)) {
        newState.tasks[dk] = newState.tasks[dk].filter(t => t.id !== item.taskId);
      }
      continue;
    }
    const generatedId = generateOfflineId();
    newState.overdue.push({ id: generatedId, text: item.text, from: dayName });
    newState.nextTaskId = Math.max(newState.nextTaskId, generatedId + 1);
    for (const dk of Object.keys(newState.tasks)) {
      newState.tasks[dk] = newState.tasks[dk].filter(t => t.id !== item.taskId);
    }
  }
  return newState;
}
