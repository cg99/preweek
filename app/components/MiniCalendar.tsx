'use client';

import { useState } from 'react';
import { MONTHS, DAYS_SHORT, formatDateKey, getTodayKey } from '@/lib/constants';

interface MiniCalendarProps {
  onSelect: (dateKey: string) => void;
  taskDateKeys: Set<string>;
}

function getMonthDays(year: number, month: number) {
  const first = new Date(year, month, 1).getDay();
  const total = new Date(year, month + 1, 0).getDate();
  const days: (number | null)[] = [];
  for (let i = 0; i < first; i++) days.push(null);
  for (let d = 1; d <= total; d++) days.push(d);
  return days;
}

export function MiniCalendar({ onSelect, taskDateKeys }: MiniCalendarProps) {
  const today = new Date();
  const todayKey = getTodayKey();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [collapsed, setCollapsed] = useState(true);

  const days = getMonthDays(year, month);

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  };

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      {/* Toggle header */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-between w-full px-4 py-2.5 text-xs font-semibold tracking-widest text-secondary uppercase hover:bg-muted transition-colors"
      >
        <span>Calendar</span>
        <svg
          className={`w-3 h-3 transition-transform ${collapsed ? '' : 'rotate-90'}`}
          fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="2"
        >
          <path d="M6 2l6 6-6 6" />
        </svg>
      </button>

      {!collapsed && (
        <div className="px-3 pb-3 select-none">
          {/* Month nav */}
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={prevMonth}
              className="h-6 w-6 rounded text-secondary hover:text-foreground hover:bg-muted transition-colors flex items-center justify-center"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="2">
                <path d="M10 2L4 8l6 6" />
              </svg>
            </button>
            <span className="text-xs font-semibold text-foreground">
              {MONTHS[month].charAt(0) + MONTHS[month].slice(1).toLowerCase()} {year}
            </span>
            <button
              onClick={nextMonth}
              className="h-6 w-6 rounded text-secondary hover:text-foreground hover:bg-muted transition-colors flex items-center justify-center"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="2">
                <path d="M6 2l6 6-6 6" />
              </svg>
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-1">
            {DAYS_SHORT.map((d, i) => (
              <div key={i} className="text-center text-[10px] font-semibold text-tertiary py-0.5">{d}</div>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-7">
            {days.map((day, i) => {
              if (day === null) return <div key={`e-${i}`} />;
              const d = new Date(year, month, day);
              const dateKey = formatDateKey(d);
              const isToday = dateKey === todayKey;
              const hasTask = taskDateKeys.has(dateKey);

              return (
                <button
                  key={dateKey}
                  onClick={() => { onSelect(dateKey); setCollapsed(true); }}
                  className={`relative h-8 w-full flex items-center justify-center text-xs rounded-lg transition-colors ${
                    isToday
                      ? 'bg-accent text-white font-bold'
                      : dateKey > todayKey
                      ? 'text-foreground hover:bg-accent/10'
                      : 'text-secondary hover:bg-muted'
                  }`}
                >
                  {day}
                  {hasTask && (
                    <span className={`absolute bottom-1 h-1 w-1 rounded-full ${isToday ? 'bg-white' : 'bg-accent'}`} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
