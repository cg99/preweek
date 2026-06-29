'use client';

import { useAppState } from '@/app/hooks/useAppState';
import { useToast } from '@/app/components/shared/Toast';
import { GoalCard } from './components/GoalCard';
import { AddGoalModal } from './components/AddGoalModal';
import { EditGoalModal } from './components/EditGoalModal';
import { useState } from 'react';

export function GoalsScreen() {
  const { state, setState } = useAppState();
  const { show: showToast, ToastComponent } = useToast();
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState<number | null>(null);

  if (!state) {
    return <div className="px-6 py-6">Loading...</div>;
  }

  const handleUpdateProgress = (goalId: number, newProgress: number) => {
    if (!state) return;
    const newState = JSON.parse(JSON.stringify(state));
    const goal = newState.goals.find((g: any) => g.id === goalId);
    if (goal) {
      goal.progress = newProgress;
      setState(newState);
    }
  };

  const handleToggleMilestone = (goalId: number, milestoneIdx: number) => {
    if (!state) return;
    const newState = JSON.parse(JSON.stringify(state));
    const goal = newState.goals.find((g: any) => g.id === goalId);
    if (goal) {
      const m = goal.milestones[milestoneIdx];
      if (m) m.done = !m.done;
      setState(newState);
    }
  };

  const handleAddMilestone = (goalId: number, text: string) => {
    if (!state) return;
    const newState = JSON.parse(JSON.stringify(state));
    const goal = newState.goals.find((g: any) => g.id === goalId);
    if (goal) {
      goal.milestones.push({ text, done: false });
      setState(newState);
    }
  };

  const handleDeleteMilestone = (goalId: number, milestoneIdx: number) => {
    if (!state) return;
    const newState = JSON.parse(JSON.stringify(state));
    const goal = newState.goals.find((g: any) => g.id === goalId);
    if (goal) {
      goal.milestones.splice(milestoneIdx, 1);
      setState(newState);
    }
  };

  const handleAddGoal = (title: string, emoji: string, deadline: string) => {
    if (!state) return;
    const newState = JSON.parse(JSON.stringify(state));
    newState.goals.push({
      id: state.nextGoalId,
      emoji,
      title,
      progress: 0,
      deadline,
      notes: '',
      milestones: [],
    });
    newState.nextGoalId += 1;
    setState(newState);
    showToast('Aspiration added');
  };

  const handleEditGoal = (goalId: number, title: string, emoji: string, deadline: string, notes: string) => {
    if (!state) return;
    const newState = JSON.parse(JSON.stringify(state));
    const goal = newState.goals.find((g: any) => g.id === goalId);
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
    const newState = JSON.parse(JSON.stringify(state));
    newState.goals = newState.goals.filter((g: any) => g.id !== goalId);
    setState(newState);
    showToast('Aspiration released');
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="px-6 pt-8 pb-4">
        <div className="text-xs font-semibold tracking-widest text-secondary uppercase mb-2">
          Aspirations
        </div>
        <div className="text-3xl font-bold text-foreground">
          What are you nurturing?
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <div className="space-y-3 mb-4">
          {state.goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onUpdateProgress={handleUpdateProgress}
              onToggleMilestone={handleToggleMilestone}
              onAddMilestone={handleAddMilestone}
              onDeleteMilestone={handleDeleteMilestone}
              onEdit={setEditingGoalId}
              onDelete={handleDeleteGoal}
            />
          ))}
        </div>

        {/* Add Goal Button */}
        <button
          onClick={() => setShowAddGoal(true)}
          className="w-full rounded-2xl border-2 border-dashed border-border bg-white p-4 font-medium text-secondary hover:border-accent hover:text-accent transition"
        >
          ＋ New aspiration
        </button>
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

      {/* Toast */}
      <ToastComponent />
    </div>
  );
}
