'use client';

import { useAppState } from '@/app/hooks/useAppState';
import { useWeekDates } from '@/app/hooks/useWeekDates';
import { MONTHS, QUOTES, DAYS } from '@/lib/constants';
import { AppState, generateOfflineId } from '@/lib/appState';
import { useToast } from '@/app/providers/ToastProvider';
import { OverdueSection } from './OverdueSection';
import { DayCard } from './DayCard';
import { AddTaskModal } from './AddTaskModal';
import { useRef, useState } from 'react';
import { DayPickerModal } from './DayPickerModal';
import { MiniCalendar } from '@/app/components/MiniCalendar';

function now() { return Date.now(); }

export function WeekScreen() {
  const { state, setState } = useAppState();
  const { show: showToast } = useToast();
  const [showAddTask, setShowAddTask] = useState(false);
  const [addTaskDayKey, setAddTaskDayKey] = useState<string | null>(null);
  const [reassignOverdueId, setReassignOverdueId] = useState<number | null>(null);
  const [rescheduleTarget, setRescheduleTarget] = useState<{ taskId: number; dayKey: string } | null>(null);
  const [editingMotivation, setEditingMotivation] = useState(false);
  const [motivationDraft, setMotivationDraft] = useState('');
  const [weekOffset, setWeekOffset] = useState(0);
  const { today, todayDate, todayKey, weekDates, weekDateKeys } = useWeekDates(weekOffset);
  const undoSnapshot = useRef<AppState | null>(null);

  if (!state) {
    return <div className="px-4 py-6">Loading...</div>;
  }

  const defaultQuote = QUOTES[today.getDay() % QUOTES.length];
  const motivation = state.motivation || defaultQuote;
  const dayName = DAYS[today.getDay()];
  const weekStart = weekDates[0];
  const weekEnd = weekDates[6];
  const rangeLabel =
    weekStart.getMonth() === weekEnd.getMonth()
      ? `${MONTHS[weekStart.getMonth()]} ${weekStart.getDate()}–${weekEnd.getDate()}, ${weekEnd.getFullYear()}`
      : `${MONTHS[weekStart.getMonth()]} ${weekStart.getDate()} – ${MONTHS[weekEnd.getMonth()]} ${weekEnd.getDate()}, ${weekEnd.getFullYear()}`;

  const handleAddTask = (dayKey: string) => {
    setAddTaskDayKey(dayKey);
    setShowAddTask(true);
  };

  const handleConfirmAddTask = (text: string) => {
    if (!state || !addTaskDayKey) return;
    const newState = structuredClone(state);
    newState.tasks[addTaskDayKey] = newState.tasks[addTaskDayKey] || [];
    newState.tasks[addTaskDayKey].push({
      id: generateOfflineId(),
      text,
      status: 'pending',
    });
    setState(newState);
    showToast('Intention set');
  };

  const handleCompleteTask = (taskId: number, dayKey: string) => {
    if (!state) return;
    undoSnapshot.current = structuredClone(state);
    const newState = structuredClone(state);
    const task = (newState.tasks[dayKey] || []).find((t) => t.id === taskId);

    if (task) {
      task.status = task.status === 'completed' ? 'pending' : 'completed';
      setState(newState);
      const msg = task.status === 'completed' ? 'Intention honored ✓' : 'Marked incomplete';
      showToast(msg, undefined, () => undoSnapshot.current && setState(undoSnapshot.current));
    }
  };

  const handleDeleteTask = (taskId: number, dayKey: string) => {
    if (!state) return;
    undoSnapshot.current = structuredClone(state);
    const newState = structuredClone(state);
    const task = (newState.tasks[dayKey] || []).find((t) => t.id === taskId);
    newState.tasks[dayKey] = (newState.tasks[dayKey] || []).filter(
      (t) => t.id !== taskId
    );
    if (task) {
      newState.deletedTasks = [
        { id: task.id, text: task.text, dateKey: dayKey, status: task.status, deletedAt: now() },
        ...newState.deletedTasks,
      ].slice(0, 50);
    }
    setState(newState);
    showToast('Intention released', undefined, () => undoSnapshot.current && setState(undoSnapshot.current));
  };

  const handleMoveOverdueToToday = (taskId: number) => {
    if (!state) return;
    undoSnapshot.current = structuredClone(state);
    const newState = structuredClone(state);
    const task = newState.overdue.find((t) => t.id === taskId);

    if (task) {
      newState.tasks[todayKey] = newState.tasks[todayKey] || [];
      newState.tasks[todayKey].push({
        id: generateOfflineId(),
        text: task.text,
        status: 'pending',
      });

      newState.overdue = newState.overdue.filter((t) => t.id !== taskId);
      setState(newState);
      showToast('Moved to today ✓', undefined, () => undoSnapshot.current && setState(undoSnapshot.current));
    }
  };

  const handleHonorOverdue = (taskId: number) => {
    if (!state) return;
    undoSnapshot.current = structuredClone(state);
    const newState = structuredClone(state);
    newState.overdue = newState.overdue.filter((t) => t.id !== taskId);
    setState(newState);
    showToast('Intention honored ✓', undefined, () => undoSnapshot.current && setState(undoSnapshot.current));
  };

  const handleReassignOverdue = (taskId: number) => {
    setReassignOverdueId(taskId);
  };

  const handleRescheduleTask = (taskId: number, dayKey: string) => {
    setRescheduleTarget({ taskId, dayKey });
  };

  const handleDayPicked = (dateKey: string) => {
    if (reassignOverdueId !== null) {
      if (!state) return;
      undoSnapshot.current = structuredClone(state);
      const task = state.overdue.find((t) => t.id === reassignOverdueId);
      if (!task) { setReassignOverdueId(null); return; }
      const newState = structuredClone(state);
      newState.tasks[dateKey] = newState.tasks[dateKey] || [];
      newState.tasks[dateKey].push({ id: generateOfflineId(), text: task.text, status: 'pending' });
      newState.overdue = newState.overdue.filter((t) => t.id !== reassignOverdueId);
      setState(newState);
      showToast('Moved to ' + DAYS[new Date(dateKey).getDay()], undefined, () => undoSnapshot.current && setState(undoSnapshot.current));
      setReassignOverdueId(null);
    } else if (rescheduleTarget !== null) {
      if (!state) return;
      undoSnapshot.current = structuredClone(state);
      const newState = structuredClone(state);
      const task = (newState.tasks[rescheduleTarget.dayKey] || []).find((t) => t.id === rescheduleTarget.taskId);
      if (!task) { setRescheduleTarget(null); return; }
      newState.tasks[rescheduleTarget.dayKey] = newState.tasks[rescheduleTarget.dayKey].filter((t) => t.id !== rescheduleTarget.taskId);
      newState.tasks[dateKey] = newState.tasks[dateKey] || [];
      newState.tasks[dateKey].push(task);
      setState(newState);
      showToast('Moved to ' + DAYS[new Date(dateKey).getDay()], undefined, () => undoSnapshot.current && setState(undoSnapshot.current));
      setRescheduleTarget(null);
    }
  };

  const handleIntentionDayPicked = (dateKey: string) => {
    setAddTaskDayKey(dateKey);
    setShowAddTask(true);
  };

  const handleEditTask = (dayKey: string) => (taskId: number, text: string) => {
    if (!state) return;
    const newState = structuredClone(state);
    const tasks = newState.tasks[dayKey] || [];
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      task.text = text;
      setState(newState);
    }
  };

  const handleDeleteOverdue = (taskId: number) => {
    if (!state) return;
    undoSnapshot.current = structuredClone(state);
    const newState = structuredClone(state);
    const task = newState.overdue.find((t) => t.id === taskId);
    newState.overdue = newState.overdue.filter((t) => t.id !== taskId);
    if (task) {
      newState.deletedTasks = [
        { id: task.id, text: task.text, dateKey: todayKey, status: 'pending' as const, deletedAt: now() },
        ...newState.deletedTasks,
      ].slice(0, 50);
    }
    setState(newState);
    showToast('Intention released', undefined, () => undoSnapshot.current && setState(undoSnapshot.current));
  };

  return (
    <section>
      {/* Header */}
      <div className="px-4 sm:px-6 pt-6 sm:pt-8 pb-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="text-xs font-semibold tracking-widest text-secondary uppercase">
            {rangeLabel}
          </div>
          {weekOffset !== 0 && (
            <button
              onClick={() => setWeekOffset(0)}
              className="text-xs font-medium text-accent hover:text-accent-dark transition-colors"
            >
              Today
            </button>
          )}
        </div>
        {editingMotivation ? (
          <input
            autoFocus
            value={motivationDraft}
            onChange={(e) => setMotivationDraft(e.target.value)}
            onBlur={() => {
              if (motivationDraft.trim()) {
                setState({ ...state, motivation: motivationDraft.trim() });
              }
              setEditingMotivation(false);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                (e.target as HTMLInputElement).blur();
              }
              if (e.key === 'Escape') {
                setEditingMotivation(false);
              }
            }}
            className="w-full rounded-xl border border-accent bg-accent-light px-3 py-2 text-sm italic text-foreground outline-none mb-2"
          />
        ) : (
          <button
            onClick={() => {
              setMotivationDraft(motivation);
              setEditingMotivation(true);
            }}
            className="group w-full text-left text-sm text-secondary italic leading-relaxed mb-2 hover:text-foreground transition-colors cursor-text border-b border-transparent hover:border-accent-dim"
          >
            <span>{motivation}</span>
            <span className="inline-block ml-2 text-xs text-tertiary opacity-0 group-hover:opacity-100 transition-opacity">✎</span>
          </button>
        )}
        <div className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
          {todayDate} <span className="text-2xl sm:text-3xl">{dayName}</span>
        </div>
      </div>

      {/* Mini Calendar */}
      <div className="px-4 sm:px-6 pb-4">
        <MiniCalendar
          onSelect={handleIntentionDayPicked}
          taskDateKeys={new Set(Object.keys(state.tasks).filter(k => (state.tasks[k] || []).length > 0))}
        />
      </div>

      {/* Content Area */}
      <div className="px-4 sm:px-6 pb-6 space-y-4">
        {/* Section Label */}
        <div className="flex items-center justify-between">
          <div className="text-xs font-semibold tracking-widest text-secondary uppercase">
            This cycle
          </div>
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => setWeekOffset(o => o - 1)}
              className="h-6 w-6 rounded-lg text-secondary hover:text-foreground hover:bg-muted transition-colors flex items-center justify-center"
              title="Previous week"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="2">
                <path d="M4 10l4-4 4 4" />
              </svg>
            </button>
            <button
              onClick={() => setWeekOffset(o => o + 1)}
              className="h-6 w-6 rounded-lg text-secondary hover:text-foreground hover:bg-muted transition-colors flex items-center justify-center"
              title="Next week"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="2">
                <path d="M4 6l4 4 4-4" />
              </svg>
            </button>
          </div>
        </div>

        {/* Week Days */}
        <div className="space-y-3">
          {weekDates.map((date, i) => {
            const dateKey = weekDateKeys[i];
            const tasks = state.tasks[dateKey] || [];
            if (i < 2 && tasks.length === 0) return null;
            return (
              <DayCard
                key={dateKey}
                dayNumber={date.getDate()}
                dayName={DAYS[date.getDay()]}
                tasks={tasks}
                isToday={dateKey === todayKey}
                isPast={i < 2}
                onAddTask={() => handleAddTask(dateKey)}
                onCompleteTask={(id) => handleCompleteTask(id, dateKey)}
                onEditTask={handleEditTask(dateKey)}
                onRescheduleTask={(id) => handleRescheduleTask(id, dateKey)}
                onDeleteTask={(id) => handleDeleteTask(id, dateKey)}
                style={{ animation: `fade-in 0.3s ease-out ${i * 0.05}s both` }}
              />
            );
          })}
        </div>

        {/* Upcoming intentions (dates outside the current window) */}
        {(() => {
          const otherKeys = Object.keys(state.tasks).filter((k) => !weekDateKeys.includes(k)).sort();
          if (otherKeys.length === 0) return null;
          return (
            <div className="space-y-3">
              <div className="text-xs font-semibold tracking-widest text-tertiary uppercase pt-2">
                Upcoming intentions
              </div>
              {otherKeys.map((dateKey) => {
                const tasks = state.tasks[dateKey] || [];
                if (tasks.length === 0) return null;
                const d = new Date(dateKey);
                return (
                  <div
                    key={dateKey}
                    className="rounded-2xl border border-border-dim bg-card/50 p-4"
                  >
                    <div className="mb-3 flex items-baseline gap-3">
                      <span className="text-3xl font-bold text-secondary">{d.getDate()}</span>
                      <span className="text-xs font-semibold tracking-widest uppercase text-secondary">
                        {DAYS[d.getDay()]} · {MONTHS[d.getMonth()]}
                      </span>
                    </div>
                    <div className="space-y-0 border-t border-border-dim">
                      {tasks.map((task) => (
                        <div key={task.id} className="flex items-center gap-2 border-b border-border-dim py-3 last:border-b-0">
                          <button
                            onClick={() => handleCompleteTask(task.id, dateKey)}
                            className={`h-5 w-5 flex-shrink-0 rounded-md border-2 transition-all ${
                              task.status === 'completed'
                                ? 'border-success bg-success'
                                : 'border-border bg-card hover:border-success'
                            }`}
                          >
                            {task.status === 'completed' && (
                              <svg className="w-3 h-3 text-white mx-auto" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="2.5">
                                <path d="M2 6l3 3 5-5" />
                              </svg>
                            )}
                          </button>
                          <span className={`flex-1 text-sm ${task.status === 'completed' ? 'text-tertiary line-through' : 'text-foreground'}`}>
                            {task.text}
                          </span>
                          <button
                            onClick={() => handleRescheduleTask(task.id, dateKey)}
                            className="rounded-md bg-muted px-2 py-1 text-xs text-secondary hover:bg-accent/10 hover:text-accent-dark"
                            title="Move to another day"
                          >↻</button>
                          <button
                            onClick={() => handleDeleteTask(task.id, dateKey)}
                            className="rounded-md bg-muted px-2 py-1 text-xs text-secondary hover:bg-danger-light hover:text-danger"
                            title="Delete"
                          >✕</button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}

        {/* Carried Over (muted, lower priority) */}
        <OverdueSection
          overdue={state.overdue}
          onComplete={handleHonorOverdue}
          onMoveToToday={handleMoveOverdueToToday}
          onReassign={handleReassignOverdue}
          onDelete={handleDeleteOverdue}
        />

      </div>

      {/* Modals */}
      <AddTaskModal
        isOpen={showAddTask}
        dayKey={addTaskDayKey}
        onClose={() => setShowAddTask(false)}
        onAdd={handleConfirmAddTask}
      />

      <DayPickerModal
        isOpen={reassignOverdueId !== null || rescheduleTarget !== null}
        title="Move to which day?"
        onSelect={handleDayPicked}
        onClose={() => { setReassignOverdueId(null); setRescheduleTarget(null); }}
      />

    </section>
  );
}
