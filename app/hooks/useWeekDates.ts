'use client';

import { useMemo } from 'react';

export function useWeekDates() {
  const today = useMemo(() => new Date(), []);
  const todayIdx = today.getDay(); // 0 = Sunday, 6 = Saturday
  const todayDate = today.getDate();

  // Calculate week start (Sunday)
  const weekStart = useMemo(() => {
    const d = new Date(today);
    d.setDate(today.getDate() - todayIdx);
    return d;
  }, [today, todayIdx]);

  // Get array of all 7 days in the week
  const weekDates = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      return d;
    });
  }, [weekStart]);

  return {
    today,
    todayIdx,
    todayDate,
    weekStart,
    weekDates,
  };
}
