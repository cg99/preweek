'use client';

import { useAppState } from '@/app/hooks/useAppState';
import { useWeekDates } from '@/app/hooks/useWeekDates';
import { MONTHS, QUOTES, DAYS } from '@/lib/constants';
import { DEFAULT_APP_STATE } from '@/lib/appState';
import { useToast } from '@/app/components/shared/Toast';
import { OverdueSection } from './components/OverdueSection';
import { DayCard } from './components/DayCard';
import { CompletedSection } from './components/CompletedSection';
import { AddTaskModal } from './components/AddTaskModal';
import { Modal } from '@/app/components/shared/Modal';
import { useRef, useState } from 'react';
import { DayPickerModal } from './components/DayPickerModal';

export function WeekScreen() {
  const { state, setState } = useAppState();
  const { today, todayDate, todayIdx, weekDates } = useWeekDates();
  const { show: showToast, ToastComponent } = useToast();
  const [showAddTask, setShowAddTask] = useState(false);
  const [addTaskDay, setAddTaskDay] = useState<number | null>(null);
  const [reassignOverdueId, setReassignOverdueId] = useState<number | null>(null);
  const [rescheduleTarget, setRescheduleTarget] = useState<{ taskId: number; dayIdx: number } | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const undoSnapshot = useRef<any>(null);

  if (!state) {
    return <div className="px-4 py-6">Loading...</div>;
  }

  const monthLabel = MONTHS[today.getMonth()];
  const yearLabel = today.getFullYear();
  const quote = QUOTES[todayIdx % QUOTES.length];
  const dayName = DAYS[todayIdx];

  // Handle actions
  const handleAddTask = (dayIdx: number) => {
    setAddTaskDay(dayIdx);
    setShowAddTask(true);
  };

  const handleConfirmAddTask = (text: string) => {
    if (!state || addTaskDay === null) return;
    const newState = JSON.parse(JSON.stringify(state));
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
    undoSnapshot.current = JSON.parse(JSON.stringify(state));
    const newState = JSON.parse(JSON.stringify(state));
    const taskIndex = newState.tasks[dayIdx]?.findIndex(
      (t: any) => t.id === taskId
    );

    if (taskIndex !== undefined && taskIndex >= 0) {
      const task = newState.tasks[dayIdx][taskIndex];
      task.status = 'completed';

      // Add to completed list
      newState.completed.unshift({
        id: taskId,
        text: task.text,
        day: DAYS[dayIdx],
      });

      // Remove from tasks
      newState.tasks[dayIdx].splice(taskIndex, 1);
      setState(newState);
      showToast('Intention honored ✓', undefined, () => setState(undoSnapshot.current));
    }
  };

  const handleDeleteTask = (taskId: number, dayIdx: number) => {
    if (!state) return;
    undoSnapshot.current = JSON.parse(JSON.stringify(state));
    const newState = JSON.parse(JSON.stringify(state));
    newState.tasks[dayIdx] = (newState.tasks[dayIdx] || []).filter(
      (t: any) => t.id !== taskId
    );
    setState(newState);
    showToast('Intention released', undefined, () => setState(undoSnapshot.current));
  };

  const handleMoveOverdueToToday = (taskId: number) => {
    if (!state) return;
    undoSnapshot.current = JSON.parse(JSON.stringify(state));
    const newState = JSON.parse(JSON.stringify(state));
    const task = newState.overdue.find((t: any) => t.id === taskId);

    if (task) {
      newState.tasks[todayIdx] = newState.tasks[todayIdx] || [];
      newState.tasks[todayIdx].push({
        id: state.nextTaskId,
        text: task.text,
        status: 'pending',
      });

      newState.overdue = newState.overdue.filter((t: any) => t.id !== taskId);
      newState.nextTaskId += 1;
      setState(newState);
      showToast('Moved to today ✓', undefined, () => setState(undoSnapshot.current));
    }
  };

  const handleHonorOverdue = (taskId: number) => {
    if (!state) return;
    undoSnapshot.current = JSON.parse(JSON.stringify(state));
    const task = state.overdue.find((t: any) => t.id === taskId);
    if (!task) return;
    const newState = JSON.parse(JSON.stringify(state));
    newState.completed.unshift({ id: taskId, text: task.text, day: 'carried over' });
    newState.overdue = newState.overdue.filter((t: any) => t.id !== taskId);
    setState(newState);
    showToast('Intention honored ✓', undefined, () => setState(undoSnapshot.current));
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
      undoSnapshot.current = JSON.parse(JSON.stringify(state));
      const task = state.overdue.find((t: any) => t.id === reassignOverdueId);
      if (!task) { setReassignOverdueId(null); return; }
      const newState = JSON.parse(JSON.stringify(state));
      newState.tasks[dayIndex] = newState.tasks[dayIndex] || [];
      newState.tasks[dayIndex].push({ id: state.nextTaskId, text: task.text, status: 'pending' });
      newState.overdue = newState.overdue.filter((t: any) => t.id !== reassignOverdueId);
      newState.nextTaskId += 1;
      setState(newState);
      showToast('Moved to ' + DAYS[dayIndex], undefined, () => setState(undoSnapshot.current));
      setReassignOverdueId(null);
    } else if (rescheduleTarget !== null) {
      if (!state) return;
      undoSnapshot.current = JSON.parse(JSON.stringify(state));
      const newState = JSON.parse(JSON.stringify(state));
      const task = (newState.tasks[rescheduleTarget.dayIdx] || []).find((t: any) => t.id === rescheduleTarget.taskId);
      if (!task) { setRescheduleTarget(null); return; }
      newState.tasks[rescheduleTarget.dayIdx] = newState.tasks[rescheduleTarget.dayIdx].filter((t: any) => t.id !== rescheduleTarget.taskId);
      newState.tasks[dayIndex] = newState.tasks[dayIndex] || [];
      newState.tasks[dayIndex].push(task);
      setState(newState);
      showToast('Moved to ' + DAYS[dayIndex], undefined, () => setState(undoSnapshot.current));
      setRescheduleTarget(null);
    }
  };

  const handleDeleteOverdue = (taskId: number) => {
    if (!state) return;
    undoSnapshot.current = JSON.parse(JSON.stringify(state));
    const newState = JSON.parse(JSON.stringify(state));
    newState.overdue = newState.overdue.filter((t: any) => t.id !== taskId);
    setState(newState);
    showToast('Intention released', undefined, () => setState(undoSnapshot.current));
  };

  const handleToggleCompleted = () => {
    if (!state) return;
    const newState = JSON.parse(JSON.stringify(state));
    newState.completedExpanded = !newState.completedExpanded;
    setState(newState);
  };

  const handleResetData = () => {
    setShowResetConfirm(true);
  };

  const handleConfirmReset = () => {
    setState(JSON.parse(JSON.stringify(DEFAULT_APP_STATE)));
    setShowResetConfirm(false);
    showToast('Data reset');
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="px-6 pt-8 pb-4">
        <div className="text-xs font-semibold tracking-widest text-secondary uppercase mb-2">
          {monthLabel} {yearLabel}
        </div>
        <div className="text-sm text-secondary italic leading-relaxed mb-2">
          {quote}
        </div>
        <div className="text-5xl font-bold text-foreground mb-6">
          {todayDate} <span className="text-3xl">{dayName}</span>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-4">
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

        {/* Completed Section */}
        <CompletedSection
          completed={state.completed}
          expanded={state.completedExpanded}
          onToggleExpanded={handleToggleCompleted}
        />

        {/* Reset */}
        <div className="pt-4 pb-2 text-center">
          <button
            onClick={handleResetData}
            className="text-xs text-tertiary hover:text-danger transition-colors"
          >
            Reset all data
          </button>
        </div>
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

      {/* Reset Confirmation */}
      <Modal isOpen={showResetConfirm} title="Reset all data?" onClose={() => setShowResetConfirm(false)}>
        <div className="space-y-4">
          <p className="text-sm text-secondary leading-relaxed">
            This will erase all your intentions, aspirations, practices, and reflections. This cannot be undone.
          </p>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setShowResetConfirm(false)}
              className="flex-1 rounded-xl border border-border bg-white py-3 font-medium text-foreground hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmReset}
              className="flex-1 rounded-xl bg-danger py-3 font-medium text-white hover:bg-red-700 transition-colors"
            >
              Reset everything
            </button>
          </div>
        </div>
      </Modal>

      {/* Toast */}
      <ToastComponent />
    </div>
  );
}
