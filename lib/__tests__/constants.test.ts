import { describe, it, expect } from 'vitest';
import { DAYS, MONTHS, QUOTES, TAB_LABELS, formatDateKey, parseDateKey, getTodayKey } from '@/lib/constants';

describe('constants', () => {
  it('DAYS has 7 entries', () => {
    expect(DAYS).toHaveLength(7);
    expect(DAYS[0]).toBe('Sunday');
    expect(DAYS[6]).toBe('Saturday');
  });

  it('MONTHS has 12 entries', () => {
    expect(MONTHS).toHaveLength(12);
    expect(MONTHS[0]).toBe('JANUARY');
    expect(MONTHS[11]).toBe('DECEMBER');
  });

  it('QUOTES has 7 entries', () => {
    expect(QUOTES).toHaveLength(7);
    expect(QUOTES[0]).toContain('intention');
  });

  it('TAB_LABELS has 4 tabs', () => {
    expect(TAB_LABELS).toHaveLength(4);
    expect(TAB_LABELS).toContain('Today');
    expect(TAB_LABELS).toContain('Aspirations');
    expect(TAB_LABELS).toContain('Practices');
    expect(TAB_LABELS).toContain('Reflect');
  });
});

describe('formatDateKey', () => {
  it('formats a date as YYYY-MM-DD', () => {
    expect(formatDateKey(new Date(2026, 0, 5))).toBe('2026-01-05');
  });

  it('pads single-digit month and day', () => {
    expect(formatDateKey(new Date(2026, 2, 3))).toBe('2026-03-03');
  });

  it('handles year boundary', () => {
    expect(formatDateKey(new Date(2025, 11, 31))).toBe('2025-12-31');
    expect(formatDateKey(new Date(2026, 0, 1))).toBe('2026-01-01');
  });
});

describe('parseDateKey', () => {
  it('parses a key into a Date with correct year, month, day', () => {
    const d = parseDateKey('2026-06-15');
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(5);
    expect(d.getDate()).toBe(15);
  });

  it('roundtrips with formatDateKey', () => {
    const original = new Date(2026, 11, 25);
    const key = formatDateKey(original);
    const parsed = parseDateKey(key);
    expect(parsed.getFullYear()).toBe(original.getFullYear());
    expect(parsed.getMonth()).toBe(original.getMonth());
    expect(parsed.getDate()).toBe(original.getDate());
  });

  it('parses single-digit month and day', () => {
    const d = parseDateKey('2026-03-03');
    expect(d.getMonth()).toBe(2);
    expect(d.getDate()).toBe(3);
  });
});

describe('getTodayKey', () => {
  it('returns today formatted as YYYY-MM-DD', () => {
    const expected = formatDateKey(new Date());
    expect(getTodayKey()).toBe(expected);
  });
});
