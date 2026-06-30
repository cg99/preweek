import { describe, it, expect } from 'vitest';
import { DAYS, MONTHS, QUOTES, TAB_LABELS } from '@/lib/constants';

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
