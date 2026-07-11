/* eslint-disable react-hooks/rules-of-hooks */
import { describe, it, expect } from 'vitest';
import { useWeekDates } from '@/app/hooks/useWeekDates';
import { formatDateKey } from '@/lib/constants';

describe('useWeekDates', () => {
  it('returns 7 date keys for any offset', () => {
    for (const offset of [-2, -1, 0, 1, 2]) {
      const result = useWeekDates(offset);
      expect(result.weekDateKeys).toHaveLength(7);
    }
  });

  it('todayKey equals today regardless of offset', () => {
    const actualToday = formatDateKey(new Date());
    expect(useWeekDates(0).todayKey).toBe(actualToday);
    expect(useWeekDates(1).todayKey).toBe(actualToday);
    expect(useWeekDates(-1).todayKey).toBe(actualToday);
  });

  it('offset 0: first key is today-2, index 2 is todayKey, last is today+4', () => {
    const r = useWeekDates(0);
    const d0 = new Date(r.today); d0.setDate(r.today.getDate() - 2);
    const d6 = new Date(r.today); d6.setDate(r.today.getDate() + 4);
    expect(r.weekDateKeys[0]).toBe(formatDateKey(d0));
    expect(r.weekDateKeys[2]).toBe(r.todayKey);
    expect(r.weekDateKeys[6]).toBe(formatDateKey(d6));
  });

  it('offset 1: window shifts forward 7 days from base', () => {
    const base = useWeekDates(0);
    const shifted = useWeekDates(1);
    const d = new Date(base.weekDateKeys[0]);
    d.setDate(d.getDate() + 7);
    expect(shifted.weekDateKeys[0]).toBe(formatDateKey(d));
  });

  it('offset -1: window shifts backward 7 days from base', () => {
    const base = useWeekDates(0);
    const shifted = useWeekDates(-1);
    const d = new Date(base.weekDateKeys[0]);
    d.setDate(d.getDate() - 7);
    expect(shifted.weekDateKeys[0]).toBe(formatDateKey(d));
  });

  it('offset N: each window boundary shifts by N*7 from base index 0', () => {
    const base = useWeekDates(0);
    for (const offset of [-2, -1, 1, 2]) {
      const shifted = useWeekDates(offset);
      const d = new Date(base.weekDateKeys[0]);
      d.setDate(d.getDate() + offset * 7);
      expect(shifted.weekDateKeys[0]).toBe(formatDateKey(d));
    }
  });

  it('keys are consecutive (1 day apart)', () => {
    for (const offset of [-1, 0, 1]) {
      const result = useWeekDates(offset);
      for (let i = 1; i < result.weekDateKeys.length; i++) {
        const prev = new Date(result.weekDateKeys[i - 1]);
        const curr = new Date(result.weekDateKeys[i]);
        expect((curr.getTime() - prev.getTime()) / 86400000).toBe(1);
      }
    }
  });

  it('all date keys are valid YYYY-MM-DD', () => {
    const result = useWeekDates(2);
    const pattern = /^\d{4}-\d{2}-\d{2}$/;
    for (const key of result.weekDateKeys) {
      expect(key).toMatch(pattern);
      expect(Number.isNaN(new Date(key).getTime())).toBe(false);
    }
  });

  it('today returns a valid Date', () => {
    const result = useWeekDates(0);
    expect(result.today).toBeInstanceOf(Date);
    expect(Number.isNaN(result.today.getTime())).toBe(false);
  });

  it('todayDate matches today.getDate()', () => {
    const result = useWeekDates(0);
    expect(result.todayDate).toBe(result.today.getDate());
  });
});
