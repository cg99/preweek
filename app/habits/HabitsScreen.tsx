'use client';

import { useAppState } from '@/app/hooks/useAppState';
import { useWeekDates } from '@/app/hooks/useWeekDates';
import { useToast, ToastDisplay } from '@/app/components/Toast';
import { HabitCard } from './HabitCard';
import { AddHabitModal } from './AddHabitModal';
import { EditHabitModal } from './EditHabitModal';
import { useState } from 'react';

export function HabitsScreen() {
  const { state, setState } = useAppState();
  const { todayIdx } = useWeekDates();
  const { show: showToast, toast, close } = useToast();
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [editingHabitId, setEditingHabitId] = useState<number | null>(null);

  if (!state) {
    return <div className="px-6 py-6">Loading...</div>;
  }

  const handleToggleDay = (habitId: number, dayIdx: number) => {
    if (!state) return;
    const newState = structuredClone(state);
    const habit = newState.habits.find((h) => h.id === habitId);

    if (habit) {
      // Toggle the day
      habit.log[dayIdx] = habit.log[dayIdx] === 1 ? 0 : 1;

      // Recalculate streak
      let streak = 0;
      for (let i = todayIdx; i >= 0; i--) {
        if (habit.log[i] === 1) {
          streak++;
        } else {
          break;
        }
      }
      habit.streak = streak;

      setState(newState);
    }
  };

  const handleAddHabit = (name: string, icon: string) => {
    if (!state) return;
    const newState = structuredClone(state);
    newState.habits.push({
      id: state.nextHabitId,
      icon,
      name,
      streak: 0,
      log: [0, 0, 0, 0, 0, 0, 0],
    });
    newState.nextHabitId += 1;
    setState(newState);
    showToast('Practice added');
  };

  const handleEditHabit = (habitId: number, name: string, icon: string) => {
    if (!state) return;
    const newState = structuredClone(state);
    const habit = newState.habits.find((h) => h.id === habitId);
    if (habit) {
      habit.name = name;
      habit.icon = icon;
      setState(newState);
      showToast('Practice updated');
    }
  };

  const handleDeleteHabit = (habitId: number) => {
    if (!state) return;
    const newState = structuredClone(state);
    newState.habits = newState.habits.filter((h) => h.id !== habitId);
    setState(newState);
    showToast('Practice released');
  };

  return (
    <section>
      {/* Header */}
      <div className="px-4 sm:px-6 pt-6 sm:pt-8 pb-4">
        <div className="text-xs font-semibold tracking-widest text-secondary uppercase mb-2">
          Practices
        </div>
        <div className="text-2xl sm:text-3xl font-bold text-foreground">
          Your daily rituals
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 pb-6">
        {state.habits.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <div className="text-5xl mb-4">🌿</div>
            <p className="text-sm font-medium text-secondary">No practices yet</p>
            <p className="text-xs text-tertiary mt-1 mb-6">Start a daily ritual</p>
            <button
              onClick={() => setShowAddHabit(true)}
              className="rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-white hover:bg-accent-dark transition"
            >
              Add your first practice
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-3 mb-4">
              {state.habits.map((habit) => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  todayIdx={todayIdx}
                  onToggleDay={handleToggleDay}
                  onEdit={setEditingHabitId}
                  onDelete={handleDeleteHabit}
                />
              ))}
            </div>

            <button
              onClick={() => setShowAddHabit(true)}
              className="w-full rounded-2xl border-2 border-dashed border-border bg-card p-4 font-medium text-secondary hover:border-accent hover:text-accent transition"
            >
              ＋ New practice
            </button>
          </>
        )}
      </div>

      {/* Modal */}
      <AddHabitModal
        isOpen={showAddHabit}
        onClose={() => setShowAddHabit(false)}
        onAdd={handleAddHabit}
      />

      <EditHabitModal
        isOpen={editingHabitId !== null}
        habit={state.habits.find((h) => h.id === editingHabitId) || null}
        onClose={() => setEditingHabitId(null)}
        onSave={handleEditHabit}
      />

      {/* Toast */}
      <ToastDisplay toast={toast} onClose={close} />
    </section>
  );
}
