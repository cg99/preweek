'use client';

import { Task } from '@/lib/appState';

interface DayCardProps {
  dayNumber: number;
  dayName: string;
  tasks: Task[];
  isToday: boolean;
  onAddTask: () => void;
  onCompleteTask: (id: number) => void;
  onRescheduleTask: (id: number) => void;
  onDeleteTask: (id: number) => void;
  style?: React.CSSProperties;
}

export function DayCard({
  dayNumber,
  dayName,
  tasks,
  isToday,
  onAddTask,
  onCompleteTask,
  onRescheduleTask,
  onDeleteTask,
  style,
}: DayCardProps) {
  const pendingTasks = tasks.filter((t) => t.status === 'pending');

  return (
    <div
      className={`rounded-2xl border p-4 transition-shadow ${
        isToday
          ? 'border-accent bg-white shadow-sm ring-2 ring-accent-light'
          : 'border-border bg-white hover:shadow-sm'
      }`}
      style={style}
    >
      <div className="mb-4 flex items-baseline gap-3">
        <span
          className={`text-3xl font-bold ${
            isToday ? 'text-accent' : 'text-foreground'
          }`}
        >
          {dayNumber}
        </span>
        <span
          className={`text-xs font-semibold tracking-widest uppercase ${
            isToday ? 'text-accent' : 'text-secondary'
          }`}
        >
          {dayName}
        </span>
      </div>

      {/* Task Items */}
      <div className="space-y-0 border-t border-border-dim">
        {pendingTasks.map((task) => (
          <div
            key={task.id}
            className="group flex items-center gap-3 border-b border-border-dim py-3 first:pt-3 last:border-b-0"
          >
            <button
              onClick={() => onCompleteTask(task.id)}
              className="h-5 w-5 flex-shrink-0 rounded-md border-2 border-border bg-white transition-all duration-200 hover:border-success hover:scale-110 active:scale-95"
              title="Honor intention"
            />
            <span className="flex-1 text-sm text-foreground">{task.text}</span>

            {/* Actions - Hidden by default, shown on hover */}
            <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                onClick={() => onRescheduleTask(task.id)}
                className="rounded-md bg-muted px-2 py-1 text-xs text-secondary hover:bg-accent-light hover:text-accent-dark"
                title="Move to another day"
              >
                ↻
              </button>
              <button
                onClick={() => onDeleteTask(task.id)}
                className="rounded-md bg-muted px-2 py-1 text-xs text-secondary hover:bg-danger-light hover:text-danger"
                title="Delete"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Set Intention Button */}
      <button
        onClick={onAddTask}
        className="mt-3 flex items-center gap-2 text-xs font-medium text-secondary hover:text-accent"
      >
        <span className="text-lg font-light">+</span> Set intention
      </button>
    </div>
  );
}
