'use client';

import { useAppState } from '@/app/hooks/useAppState';
import { useToast } from '@/app/providers/ToastProvider';
import { generateOfflineId } from '@/lib/appState';
import { GoalCard } from './GoalCard';
import { AddGoalModal } from './AddGoalModal';
import { EditGoalModal } from './EditGoalModal';
import { useState } from 'react';

export function GoalsScreen() {
  const { state, setState } = useAppState();
  const { show: showToast } = useToast();
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState<number | null>(null);

  if (!state) {
    return <div className="px-6 py-6">Loading...</div>;
  }

  const handleToggleMilestone = (goalId: number, milestoneIdx: number) => {
    if (!state) return;
    const newState = structuredClone(state);
    const goal = newState.goals.find((g) => g.id === goalId);
    if (goal) {
      const m = goal.milestones[milestoneIdx];
      if (m) m.done = !m.done;
      setState(newState);
    }
  };

  const handleAddMilestone = (goalId: number, text: string) => {
    if (!state) return;
    const newState = structuredClone(state);
    const goal = newState.goals.find((g) => g.id === goalId);
    if (goal) {
      goal.milestones.push({ text, done: false });
      setState(newState);
    }
  };

  const handleDeleteMilestone = (goalId: number, milestoneIdx: number) => {
    if (!state) return;
    const newState = structuredClone(state);
    const goal = newState.goals.find((g) => g.id === goalId);
    if (goal) {
      goal.milestones.splice(milestoneIdx, 1);
      setState(newState);
    }
  };

  const handleAddGoal = (title: string, emoji: string, deadline: string) => {
    if (!state) return;
    const newState = structuredClone(state);
    newState.goals.push({
      id: generateOfflineId(),
      emoji,
      title,
      progress: 0,
      deadline,
      notes: '',
      milestones: [],
    });
    setState(newState);
    showToast('Aspiration added');
  };

  const handleEditGoal = (goalId: number, title: string, emoji: string, deadline: string, notes: string) => {
    if (!state) return;
    const newState = structuredClone(state);
    const goal = newState.goals.find((g) => g.id === goalId);
    if (goal) {
      goal.title = title;
      goal.emoji = emoji;
      goal.deadline = deadline;
      goal.notes = notes;
      setState(newState);
      showToast('Aspiration updated');
    }
  };

  const handleDeleteGoal = (goalId: number) => {
    if (!state) return;
    const newState = structuredClone(state);
    newState.goals = newState.goals.filter((g) => g.id !== goalId);
    setState(newState);
    showToast('Aspiration released');
  };

  return (
    <section>
      {/* Header */}
      <div className="px-4 sm:px-6 pt-6 sm:pt-8 pb-4">
        <div className="text-xs font-semibold tracking-widest text-secondary uppercase mb-2">
          Aspirations
        </div>
        <div className="text-2xl sm:text-3xl font-bold text-foreground">
          What are you nurturing?
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 pb-6">
        {state.goals.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <div className="text-5xl mb-4">🌟</div>
            <p className="text-sm font-medium text-secondary">No aspirations yet</p>
            <p className="text-xs text-tertiary mt-1 mb-6">What do you want to nurture?</p>
            <button
              onClick={() => setShowAddGoal(true)}
              className="rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-white hover:bg-accent-dark transition"
            >
              Add your first aspiration
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-3 mb-4">
              {state.goals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onToggleMilestone={handleToggleMilestone}
                  onAddMilestone={handleAddMilestone}
                  onDeleteMilestone={handleDeleteMilestone}
                  onEdit={setEditingGoalId}
                  onDelete={handleDeleteGoal}
                />
              ))}
            </div>

            <button
              onClick={() => setShowAddGoal(true)}
              className="w-full rounded-2xl border-2 border-dashed border-border bg-card p-4 font-medium text-secondary hover:border-accent hover:text-accent transition"
            >
              ＋ New aspiration
            </button>
          </>
        )}
      </div>

      {/* Modal */}
      <AddGoalModal
        isOpen={showAddGoal}
        onClose={() => setShowAddGoal(false)}
        onAdd={handleAddGoal}
      />

      <EditGoalModal
        isOpen={editingGoalId !== null}
        goal={state.goals.find((g) => g.id === editingGoalId) || null}
        onClose={() => setEditingGoalId(null)}
        onSave={handleEditGoal}
      />

    </section>
  );
}
