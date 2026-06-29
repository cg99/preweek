'use client';

import { Habit } from '@/lib/appState';
import { DAYS_SHORT } from '@/lib/constants';
import { useState } from 'react';

interface HabitCardProps {
  habit: Habit;
  todayIdx: number;
  onToggleDay: (habitId: number, dayIdx: number) => void;
  onEdit: (habitId: number) => void;
  onDelete: (habitId: number) => void;
}

export function HabitCard({ habit, todayIdx, onToggleDay, onEdit, onDelete }: HabitCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="rounded-2xl border border-border bg-white p-5">
      {/* Header */}
      <div className="mb-4 flex items-center gap-3">
        <span className="text-2xl">{habit.icon}</span>
        <div className="flex-1">
          <h3 className="font-semibold text-foreground">{habit.name}</h3>
        </div>
        <span className="text-sm font-medium text-warning">
          ✦ {habit.streak} day streak
        </span>
        <div className="relative">
          <button
            onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
            className="rounded-lg p-1 text-tertiary hover:text-foreground hover:bg-muted transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
              <circle cx="8" cy="3" r="1.5" />
              <circle cx="8" cy="8" r="1.5" />
              <circle cx="8" cy="13" r="1.5" />
            </svg>
          </button>
          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-full z-20 mt-1 w-32 rounded-xl border border-border bg-white shadow-lg overflow-hidden">
                <button
                  onClick={() => { setShowMenu(false); onEdit(habit.id); }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-xs text-foreground hover:bg-muted transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5">
                    <path d="M11.5 1.5l3 3L6 13H3v-3l8.5-8.5z" />
                  </svg>
                  Edit
                </button>
                <button
                  onClick={() => { setShowMenu(false); onDelete(habit.id); }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-xs text-danger hover:bg-danger-light transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5">
                    <path d="M2 4h12M5 4V2.5A1.5 1.5 0 016.5 1h3A1.5 1.5 0 0111 2.5V4M4 4v9.5A1.5 1.5 0 005.5 15h5a1.5 1.5 0 001.5-1.5V4" />
                  </svg>
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 7-Day Grid */}
      <div className="grid grid-cols-7 gap-3">
        {DAYS_SHORT.map((dayLabel, dayIdx) => {
          const done = habit.log[dayIdx] === 1;
          const isToday = dayIdx === todayIdx;
          const isFuture = dayIdx > todayIdx;

          return (
            <div key={dayIdx} className="flex flex-col items-center gap-2">
              <span className="text-xs font-semibold tracking-widest text-secondary uppercase">
                {dayLabel}
              </span>
              <button
                onClick={() => !isFuture && onToggleDay(habit.id, dayIdx)}
                disabled={isFuture}
                className={`h-9 w-9 rounded-full flex items-center justify-center font-semibold transition-all duration-200 ${
                  done
                    ? 'bg-success text-white scale-100'
                    : isToday && !done
                      ? 'border-2 border-accent bg-white'
                      : isFuture
                        ? 'border border-border bg-muted text-tertiary cursor-default'
                        : 'border border-border bg-white hover:bg-muted hover:scale-110'
                }`}
              >
                {done && <span className="animate-pop">✓</span>}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
