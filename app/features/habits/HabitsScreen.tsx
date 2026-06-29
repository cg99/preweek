'use client';

import { useAppState } from '@/app/hooks/useAppState';
import { useWeekDates } from '@/app/hooks/useWeekDates';
import { useToast } from '@/app/components/shared/Toast';
import { HabitCard } from './components/HabitCard';
import { AddHabitModal } from './components/AddHabitModal';
import { EditHabitModal } from './components/EditHabitModal';
import { useState } from 'react';

export function HabitsScreen() {
  const { state, setState } = useAppState();
  const { todayIdx } = useWeekDates();
  const { show: showToast, ToastComponent } = useToast();
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [editingHabitId, setEditingHabitId] = useState<number | null>(null);

  if (!state) {
    return <div className="px-6 py-6">Loading...</div>;
  }

  const handleToggleDay = (habitId: number, dayIdx: number) => {
    if (!state) return;
    const newState = JSON.parse(JSON.stringify(state));
    const habit = newState.habits.find((h: any) => h.id === habitId);

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
    const newState = JSON.parse(JSON.stringify(state));
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
    const newState = JSON.parse(JSON.stringify(state));
    const habit = newState.habits.find((h: any) => h.id === habitId);
    if (habit) {
      habit.name = name;
      habit.icon = icon;
      setState(newState);
      showToast('Practice updated');
    }
  };

  const handleDeleteHabit = (habitId: number) => {
    if (!state) return;
    const newState = JSON.parse(JSON.stringify(state));
    newState.habits = newState.habits.filter((h: any) => h.id !== habitId);
    setState(newState);
    showToast('Practice released');
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="px-6 pt-8 pb-4">
        <div className="text-xs font-semibold tracking-widest text-secondary uppercase mb-2">
          Practices
        </div>
        <div className="text-3xl font-bold text-foreground">
          Your daily rituals
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
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

        {/* Add Habit Button */}
        <button
          onClick={() => setShowAddHabit(true)}
          className="w-full rounded-2xl border-2 border-dashed border-border bg-white p-4 font-medium text-secondary hover:border-accent hover:text-accent transition"
        >
          ＋ New practice
        </button>
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
      <ToastComponent />
    </div>
  );
}
