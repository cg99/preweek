'use client';

import { useAppState } from '@/app/hooks/useAppState';
import { useWeekDates } from '@/app/hooks/useWeekDates';
import { MONTHS, QUOTES, DAYS } from '@/lib/constants';
import { AppState } from '@/lib/appState';
import { useToast, ToastDisplay } from '@/app/components/Toast';
import { OverdueSection } from './OverdueSection';
import { DayCard } from './DayCard';
import { AddTaskModal } from './AddTaskModal';
import { useRef, useState, useEffect } from 'react';
import { DayPickerModal } from './DayPickerModal';

export function WeekScreen() {
  const { state, setState } = useAppState();
  const { today, todayDate, todayIdx, weekDates } = useWeekDates();
  const { show: showToast, toast, close } = useToast();
  const [showAddTask, setShowAddTask] = useState(false);
  const [addTaskDay, setAddTaskDay] = useState<number | null>(null);
  const [reassignOverdueId, setReassignOverdueId] = useState<number | null>(null);
  const [rescheduleTarget, setRescheduleTarget] = useState<{ taskId: number; dayIdx: number } | null>(null);
  const [editingMotivation, setEditingMotivation] = useState(false);
  const [motivationDraft, setMotivationDraft] = useState('');
  const undoSnapshot = useRef<AppState | null>(null);
  const archivedRef = useRef(false);

  // Auto-carry pending tasks from past days to overdue
  useEffect(() => {
    if (!state || archivedRef.current) return;
    const pendingPast: { dayIdx: number; task: { id: number; text: string } }[] = [];
    for (let i = 0; i < todayIdx; i++) {
      for (const t of state.tasks[i] || []) {
        if (t.status === 'pending') {
          pendingPast.push({ dayIdx: i, task: { id: t.id, text: t.text } });
        }
      }
    }
    if (pendingPast.length > 0) {
      const newState = structuredClone(state);
      for (const item of pendingPast) {
        newState.overdue.push({ id: item.task.id, text: item.task.text, from: DAYS[item.dayIdx] });
        for (let i = 0; i < 7; i++) {
          newState.tasks[i] = (newState.tasks[i] || []).filter((t: { id: number }) => t.id !== item.task.id);
        }
      }
      setState(newState);
      archivedRef.current = true;
    }
  }, [state, todayIdx, setState]);

  if (!state) {
    return <div className="px-4 py-6">Loading...</div>;
  }

  const monthLabel = MONTHS[today.getMonth()];
  const yearLabel = today.getFullYear();
  const defaultQuote = QUOTES[todayIdx % QUOTES.length];
  const motivation = state.motivation || defaultQuote;
  const dayName = DAYS[todayIdx];

  // Handle actions
  const handleAddTask = (dayIdx: number) => {
    setAddTaskDay(dayIdx);
    setShowAddTask(true);
  };

  const handleConfirmAddTask = (text: string) => {
    if (!state || addTaskDay === null) return;
    const newState = structuredClone(state);
    newState.tasks[addTaskDay] = newState.tasks[addTaskDay] || [];
    newState.tasks[addTaskDay].push({
      id: state.nextTaskId,
      text,
      status: 'pending',
    });
    newState.nextTaskId += 1;
    setState(newState);
    showToast('Intention set');
  };

  const handleCompleteTask = (taskId: number, dayIdx: number) => {
    if (!state) return;
    undoSnapshot.current = structuredClone(state);
    const newState = structuredClone(state);
    const task = (newState.tasks[dayIdx] || []).find((t) => t.id === taskId);

    if (task) {
      task.status = task.status === 'completed' ? 'pending' : 'completed';
      setState(newState);
      const msg = task.status === 'completed' ? 'Intention honored ✓' : 'Marked incomplete';
      showToast(msg, undefined, () => undoSnapshot.current && setState(undoSnapshot.current));
    }
  };

  const handleDeleteTask = (taskId: number, dayIdx: number) => {
    if (!state) return;
    undoSnapshot.current = structuredClone(state);
    const newState = structuredClone(state);
    newState.tasks[dayIdx] = (newState.tasks[dayIdx] || []).filter(
      (t) => t.id !== taskId
    );
    setState(newState);
    showToast('Intention released', undefined, () => undoSnapshot.current && setState(undoSnapshot.current));
  };

  const handleMoveOverdueToToday = (taskId: number) => {
    if (!state) return;
    undoSnapshot.current = structuredClone(state);
    const newState = structuredClone(state);
    const task = newState.overdue.find((t) => t.id === taskId);

    if (task) {
      newState.tasks[todayIdx] = newState.tasks[todayIdx] || [];
      newState.tasks[todayIdx].push({
        id: state.nextTaskId,
        text: task.text,
        status: 'pending',
      });

      newState.overdue = newState.overdue.filter((t) => t.id !== taskId);
      newState.nextTaskId += 1;
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

  const handleRescheduleTask = (taskId: number, dayIdx: number) => {
    setRescheduleTarget({ taskId, dayIdx });
  };

  const handleDayPicked = (dayIndex: number) => {
    if (reassignOverdueId !== null) {
      if (!state) return;
      undoSnapshot.current = structuredClone(state);
      const task = state.overdue.find((t) => t.id === reassignOverdueId);
      if (!task) { setReassignOverdueId(null); return; }
      const newState = structuredClone(state);
      newState.tasks[dayIndex] = newState.tasks[dayIndex] || [];
      newState.tasks[dayIndex].push({ id: state.nextTaskId, text: task.text, status: 'pending' });
      newState.overdue = newState.overdue.filter((t) => t.id !== reassignOverdueId);
      newState.nextTaskId += 1;
      setState(newState);
      showToast('Moved to ' + DAYS[dayIndex], undefined, () => undoSnapshot.current && setState(undoSnapshot.current));
      setReassignOverdueId(null);
    } else if (rescheduleTarget !== null) {
      if (!state) return;
      undoSnapshot.current = structuredClone(state);
      const newState = structuredClone(state);
      const task = (newState.tasks[rescheduleTarget.dayIdx] || []).find((t) => t.id === rescheduleTarget.taskId);
      if (!task) { setRescheduleTarget(null); return; }
      newState.tasks[rescheduleTarget.dayIdx] = newState.tasks[rescheduleTarget.dayIdx].filter((t) => t.id !== rescheduleTarget.taskId);
      newState.tasks[dayIndex] = newState.tasks[dayIndex] || [];
      newState.tasks[dayIndex].push(task);
      setState(newState);
      showToast('Moved to ' + DAYS[dayIndex], undefined, () => undoSnapshot.current && setState(undoSnapshot.current));
      setRescheduleTarget(null);
    }
  };

  const handleDeleteOverdue = (taskId: number) => {
    if (!state) return;
    undoSnapshot.current = structuredClone(state);
    const newState = structuredClone(state);
    newState.overdue = newState.overdue.filter((t) => t.id !== taskId);
    setState(newState);
    showToast('Intention released', undefined, () => undoSnapshot.current && setState(undoSnapshot.current));
  };

  return (
    <section>
      {/* Header */}
      <div className="px-4 sm:px-6 pt-6 sm:pt-8 pb-4">
        <div className="text-xs font-semibold tracking-widest text-secondary uppercase mb-2">
          {monthLabel} {yearLabel}
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

      {/* Content Area */}
      <div className="px-4 sm:px-6 pb-6 space-y-4">
        {/* This Week Label */}
        <div className="text-xs font-semibold tracking-widest text-secondary uppercase">
          This cycle
        </div>

        {/* Week Days */}
        <div className="space-y-3">
          {weekDates.map((date, dayIdx) => (
            <DayCard
              key={dayIdx}
              dayNumber={date.getDate()}
              dayName={DAYS[dayIdx]}
              tasks={state.tasks[dayIdx] || []}
              isToday={dayIdx === todayIdx}
              isPast={dayIdx < todayIdx}
              onAddTask={() => handleAddTask(dayIdx)}
              onCompleteTask={(id) => handleCompleteTask(id, dayIdx)}
              onRescheduleTask={(id) => handleRescheduleTask(id, dayIdx)}
              onDeleteTask={(id) => handleDeleteTask(id, dayIdx)}
              style={{ animation: `fade-in 0.3s ease-out ${dayIdx * 0.05}s both` }}
            />
          ))}
        </div>

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
        dayIndex={addTaskDay}
        onClose={() => setShowAddTask(false)}
        onAdd={handleConfirmAddTask}
      />

      <DayPickerModal
        isOpen={reassignOverdueId !== null || rescheduleTarget !== null}
        title="Move to which day?"
        onSelect={handleDayPicked}
        onClose={() => { setReassignOverdueId(null); setRescheduleTarget(null); }}
      />

      {/* Toast */}
      <ToastDisplay toast={toast} onClose={close} />
    </section>
  );
}
