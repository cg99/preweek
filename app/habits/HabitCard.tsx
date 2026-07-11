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

  const doneCount = habit.log.filter((v) => v === 1).length;
  const weekCompletion = Math.round((doneCount / (todayIdx + 1)) * 100);

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      {/* Header */}
      <div className="mb-4 flex items-center gap-3">
        <span className="text-2xl">{habit.icon}</span>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate">{habit.name}</h3>
        </div>

        {/* Streak badge */}
        <div className="flex items-center gap-3 mr-1">
          {/* Weekly completion ring */}
          <div className="relative h-8 w-8">
            <svg className="h-8 w-8 -rotate-90" viewBox="0 0 32 32">
              <circle cx="16" cy="16" r="13" fill="none" stroke="currentColor" className="text-border" strokeWidth="3" />
              <circle
                cx="16" cy="16" r="13" fill="none"
                stroke="currentColor"
                className="text-success"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={`${(weekCompletion / 100) * 81.68} 81.68`}
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-foreground">
              {weekCompletion > 0 ? weekCompletion : ''}
            </span>
          </div>

          <span className="text-sm font-medium text-warning whitespace-nowrap">
            ✦ {habit.streak}d
          </span>
        </div>

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
              <div className="absolute right-0 top-full z-20 mt-1 w-32 rounded-xl border border-border bg-card shadow-lg overflow-hidden">
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
      <div className="grid grid-cols-7 gap-2">
        {DAYS_SHORT.map((dayLabel, dayIdx) => {
          const done = habit.log[dayIdx] === 1;
          const isToday = dayIdx === todayIdx;
          const isFuture = dayIdx > todayIdx;

          return (
            <div key={dayIdx} className="flex flex-col items-center gap-1.5">
              <span className={`text-[11px] font-semibold tracking-widest uppercase ${
                isToday ? 'text-accent' : 'text-secondary'
              }`}>
                {dayLabel}
              </span>
              {isFuture ? (
                <div className="h-10 w-10 rounded-full flex items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-border" />
                </div>
              ) : (
                <button
                  onClick={() => onToggleDay(habit.id, dayIdx)}
                  className={`h-10 w-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-200 active:scale-90 ${
                    done
                      ? 'bg-success text-white shadow-sm'
                      : isToday
                        ? 'border-2 border-accent bg-card hover:bg-accent/10'
                        : 'border border-border bg-card hover:bg-muted hover:border-accent-dim'
                  }`}
                >
                  {done ? '✓' : ''}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
