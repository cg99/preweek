'use client';

import { useState } from 'react';
import { MONTHS, DAYS_SHORT, formatDateKey, getTodayKey } from '@/lib/constants';

interface CalendarPickerProps {
  onSelect: (dateKey: string) => void;
  selectedDateKey?: string;
}

function getMonthDays(year: number, month: number) {
  const first = new Date(year, month, 1).getDay();
  const total = new Date(year, month + 1, 0).getDate();
  const days: (number | null)[] = [];
  for (let i = 0; i < first; i++) days.push(null);
  for (let d = 1; d <= total; d++) days.push(d);
  return days;
}

export function CalendarPicker({ onSelect, selectedDateKey }: CalendarPickerProps) {
  const todayKey = getTodayKey();
  const initial = selectedDateKey ? new Date(selectedDateKey) : new Date();
  const [year, setYear] = useState(initial.getFullYear());
  const [month, setMonth] = useState(initial.getMonth());

  const days = getMonthDays(year, month);
  const rows: (number | null)[][] = [];
  for (let i = 0; i < days.length; i += 7) rows.push(days.slice(i, i + 7));

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  };

  return (
    <div className="select-none">
      {/* Month nav */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="h-8 w-8 rounded-full text-secondary hover:text-foreground hover:bg-muted transition-colors flex items-center justify-center"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="2">
            <path d="M10 2L4 8l6 6" />
          </svg>
        </button>
        <span className="text-sm font-semibold text-foreground">
          {MONTHS[month]} {year}
        </span>
        <button
          onClick={nextMonth}
          className="h-8 w-8 rounded-full text-secondary hover:text-foreground hover:bg-muted transition-colors flex items-center justify-center"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="2">
            <path d="M6 2l6 6-6 6" />
          </svg>
        </button>
      </div>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 mb-2">
        {DAYS_SHORT.map((d, i) => (
          <div key={i} className="text-center text-xs font-semibold text-tertiary py-1">{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {rows.flat().map((day, i) => {
          if (day === null) return <div key={`e-${i}`} />;
          const d = new Date(year, month, day);
          const dateKey = formatDateKey(d);
          const isToday = dateKey === todayKey;
          const isSelected = dateKey === selectedDateKey;
          const isFuture = d > new Date();

          return (
            <button
              key={dateKey}
              onClick={() => onSelect(dateKey)}
              className={`h-10 w-full rounded-xl text-sm font-medium transition-colors ${
                isSelected
                  ? 'bg-accent text-white'
                  : isToday
                  ? 'bg-accent-light text-accent-dark font-bold ring-2 ring-accent/30'
                  : isFuture
                  ? 'text-foreground hover:bg-accent/10 hover:text-accent-dark'
                  : 'text-secondary hover:bg-muted'
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
