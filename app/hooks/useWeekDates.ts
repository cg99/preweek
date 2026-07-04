'use client';

export function useWeekDates() {
  const today = new Date();

  // Window: [today-2, today-1, today, today+1, ..., today+4]
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + (i - 2));
    return d;
  });

  return {
    today,
    todayIdx: 2,
    todayDate: today.getDate(),
    weekDates,
  };
}
